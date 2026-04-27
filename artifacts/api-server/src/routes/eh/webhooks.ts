import { type Request, type Response } from "express";
import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db, ehOrgs, ehSubscriptions, ehAuditLog } from "@workspace/db";
import {
  getEhStripe,
  EH_PLAN_LIMITS,
  planFromPriceId,
} from "../../lib/ehStripe";

// Per-org subscription upsert. We treat each org as having a single active
// subscription record — the row is created at signup with plan="free" and
// then mutated as Stripe events arrive.
async function upsertOrgSubscription(orgId: number, sub: Stripe.Subscription): Promise<void> {
  const item = sub.items.data[0];
  const priceId = item?.price?.id ?? null;
  const plan = planFromPriceId(priceId);
  const limits = EH_PLAN_LIMITS[plan] ?? EH_PLAN_LIMITS.free;
  const periodEndUnix = (item as unknown as { current_period_end?: number } | undefined)?.current_period_end
    ?? (sub as unknown as { current_period_end?: number }).current_period_end;
  const currentPeriodEnd = typeof periodEndUnix === "number"
    ? new Date(periodEndUnix * 1000)
    : null;

  // Atomic upsert keyed on the unique eh_subscriptions_org_idx so concurrent
  // Stripe webhook events for the same org cannot race and both attempt INSERT.
  await db
    .insert(ehSubscriptions)
    .values({
      orgId,
      stripeSubscriptionId: sub.id,
      plan,
      status: sub.status,
      currentPeriodEnd,
      responseCap: limits.responseCap,
      harvesterCap: limits.harvesterCap,
    })
    .onConflictDoUpdate({
      target: ehSubscriptions.orgId,
      set: {
        stripeSubscriptionId: sub.id,
        plan,
        status: sub.status,
        currentPeriodEnd,
        responseCap: limits.responseCap,
        harvesterCap: limits.harvesterCap,
        updatedAt: new Date(),
      },
    });

  await db
    .update(ehOrgs)
    .set({ plan, updatedAt: new Date() })
    .where(eq(ehOrgs.id, orgId));
}

async function resolveOrgIdFromCustomer(customerId: string | null): Promise<number | null> {
  if (!customerId) return null;
  const [org] = await db
    .select({ id: ehOrgs.id })
    .from(ehOrgs)
    .where(eq(ehOrgs.stripeCustomerId, customerId))
    .limit(1);
  return org?.id ?? null;
}

// Express handler. MUST be mounted with express.raw() before express.json().
export async function ehStripeWebhookHandler(req: Request, res: Response): Promise<void> {
  const stripe = getEhStripe();
  if (!stripe) {
    res.status(503).json({ error: "Stripe not configured" });
    return;
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    res.status(503).json({ error: "STRIPE_WEBHOOK_SECRET not configured" });
    return;
  }
  const sigHeader = req.headers["stripe-signature"];
  if (!sigHeader || Array.isArray(sigHeader)) {
    res.status(400).json({ error: "Missing stripe-signature header" });
    return;
  }

  let event: Stripe.Event;
  try {
    // req.body must be a Buffer (raw body).
    event = stripe.webhooks.constructEvent(req.body as Buffer, sigHeader, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    res.status(400).json({ error: `Webhook signature verification failed: ${message}` });
    return;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orgIdRaw = session.client_reference_id ?? session.metadata?.eh_org_id;
        const orgId = orgIdRaw ? Number(orgIdRaw) : null;
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
        const subscriptionId = typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id ?? null;

        if (orgId && customerId) {
          await db
            .update(ehOrgs)
            .set({ stripeCustomerId: customerId, updatedAt: new Date() })
            .where(eq(ehOrgs.id, orgId));
        }
        if (orgId && subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          await upsertOrgSubscription(orgId, sub);
        }
        if (orgId) {
          await db.insert(ehAuditLog).values({
            orgId,
            action: "checkout_completed",
            targetType: "stripe_session",
            targetId: session.id,
          });
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const orgId = await resolveOrgIdFromCustomer(customerId);
        if (orgId) {
          await upsertOrgSubscription(orgId, sub);
          await db.insert(ehAuditLog).values({
            orgId,
            action: event.type,
            targetType: "stripe_subscription",
            targetId: sub.id,
            metadata: { status: sub.status },
          });
        }
        break;
      }
      default:
        // Ignore other event types for now.
        break;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown webhook handler error";
    console.error(`[eh.webhook] ${event.type} failed:`, message);
    res.status(500).json({ error: "Webhook handler error" });
    return;
  }

  res.json({ message: "ok" });
}
