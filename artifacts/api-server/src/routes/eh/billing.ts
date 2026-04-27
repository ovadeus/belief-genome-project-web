import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, ehOrgs, ehAuditLog } from "@workspace/db";
import { EhCreateCheckoutSessionBody } from "@workspace/api-zod";
import { ehRequireAuth } from "../../middlewares/ehAuth";
import {
  getEhStripe,
  getEhPriceId,
  getEhAppBaseUrl,
} from "../../lib/ehStripe";

const router: IRouter = Router();

router.post("/billing/checkout-session", ehRequireAuth, async (req, res): Promise<void> => {
  const parsed = EhCreateCheckoutSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid plan" });
    return;
  }
  const stripe = getEhStripe();
  if (!stripe) {
    res.status(503).json({ error: "Stripe not configured" });
    return;
  }
  const priceId = getEhPriceId(parsed.data.plan);
  if (!priceId) {
    res.status(503).json({ error: "Price ID not configured for this plan" });
    return;
  }

  const ehUser = req.ehUser!;
  const [org] = await db.select().from(ehOrgs).where(eq(ehOrgs.id, ehUser.orgId)).limit(1);
  if (!org) {
    res.status(401).json({ error: "Org not found" });
    return;
  }

  let customerId = org.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: ehUser.email,
      name: org.name,
      metadata: { eh_org_id: String(org.id) },
    });
    customerId = customer.id;
    await db
      .update(ehOrgs)
      .set({ stripeCustomerId: customerId, updatedAt: new Date() })
      .where(eq(ehOrgs.id, org.id));
  }

  const baseUrl = getEhAppBaseUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/entropy-harvester/app/billing?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/entropy-harvester/app/billing?status=cancelled`,
    client_reference_id: String(org.id),
    metadata: { eh_org_id: String(org.id), plan: parsed.data.plan },
  });

  await db.insert(ehAuditLog).values({
    orgId: org.id,
    userId: ehUser.userId,
    action: "checkout_session_created",
    targetType: "stripe_session",
    targetId: session.id,
    metadata: { plan: parsed.data.plan },
  });

  if (!session.url) {
    res.status(502).json({ error: "Stripe did not return a URL" });
    return;
  }
  res.json({ url: session.url });
});

router.post("/billing/portal-session", ehRequireAuth, async (req, res): Promise<void> => {
  const stripe = getEhStripe();
  if (!stripe) {
    res.status(503).json({ error: "Stripe not configured" });
    return;
  }
  const ehUser = req.ehUser!;
  const [org] = await db.select().from(ehOrgs).where(eq(ehOrgs.id, ehUser.orgId)).limit(1);
  if (!org || !org.stripeCustomerId) {
    res.status(400).json({ error: "No billing customer for this org yet" });
    return;
  }
  const baseUrl = getEhAppBaseUrl();
  const session = await stripe.billingPortal.sessions.create({
    customer: org.stripeCustomerId,
    return_url: `${baseUrl}/entropy-harvester/app/billing`,
  });

  await db.insert(ehAuditLog).values({
    orgId: org.id,
    userId: ehUser.userId,
    action: "portal_session_created",
    targetType: "stripe_session",
    targetId: session.id,
  });

  res.json({ url: session.url });
});

export default router;
