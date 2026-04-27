import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import rateLimit from "express-rate-limit";
import {
  db,
  ehOrgs,
  ehUsers,
  ehSubscriptions,
  ehAuditLog,
  type EhOrg,
  type EhUser,
  type EhSubscription,
} from "@workspace/db";
import { EhSignupBody, EhLoginBody } from "@workspace/api-zod";
import {
  ehRequireAuth,
  signEhToken,
  setEhCookie,
  clearEhCookie,
} from "../../middlewares/ehAuth";
import { EH_PLAN_LIMITS } from "../../lib/ehStripe";

const router: IRouter = Router();

const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many signup attempts, please try again later" },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many login attempts, please try again later" },
});

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "org";
}

async function uniqueSlug(base: string): Promise<string> {
  let candidate = base;
  for (let i = 0; i < 8; i += 1) {
    const [hit] = await db.select({ id: ehOrgs.id }).from(ehOrgs).where(eq(ehOrgs.slug, candidate)).limit(1);
    if (!hit) return candidate;
    candidate = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

function authPayload(user: EhUser, org: EhOrg) {
  return {
    user: { id: user.id, email: user.email, role: user.role as "owner" | "member" },
    org: { id: org.id, name: org.name, slug: org.slug, plan: org.plan as "free" | "researcher" | "pro" },
  };
}

function subscriptionInfo(sub: EhSubscription | null) {
  if (!sub) return null;
  return {
    plan: sub.plan,
    status: sub.status,
    currentPeriodEnd: sub.currentPeriodEnd ? sub.currentPeriodEnd.toISOString() : null,
    responseCap: sub.responseCap,
    harvesterCap: sub.harvesterCap,
  };
}

router.post("/auth/signup", signupLimiter, async (req, res): Promise<void> => {
  const parsed = EhSignupBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }
  const { orgName, email, password } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

  const [existing] = await db.select({ id: ehUsers.id }).from(ehUsers).where(eq(ehUsers.email, normalizedEmail)).limit(1);
  if (existing) {
    res.status(409).json({ error: "Email already in use" });
    return;
  }

  const slug = await uniqueSlug(slugify(orgName));
  const passwordHash = await bcrypt.hash(password, 12);

  const created = await db.transaction(async (tx) => {
    const [org] = await tx
      .insert(ehOrgs)
      .values({ name: orgName.trim(), slug, plan: "free" })
      .returning();
    const [user] = await tx
      .insert(ehUsers)
      .values({ orgId: org.id, email: normalizedEmail, passwordHash, role: "owner" })
      .returning();
    const limits = EH_PLAN_LIMITS.free;
    await tx.insert(ehSubscriptions).values({
      orgId: org.id,
      plan: "free",
      status: "active",
      responseCap: limits.responseCap,
      harvesterCap: limits.harvesterCap,
    });
    await tx.insert(ehAuditLog).values({
      orgId: org.id,
      userId: user.id,
      action: "signup",
      targetType: "user",
      targetId: String(user.id),
    });
    return { org, user };
  });

  const token = signEhToken({
    userId: created.user.id,
    orgId: created.org.id,
    email: created.user.email,
    role: "owner",
  });
  setEhCookie(res, token);

  res.status(201).json(authPayload(created.user, created.org));
});

router.post("/auth/login", loginLimiter, async (req, res): Promise<void> => {
  const parsed = EhLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const normalizedEmail = parsed.data.email.trim().toLowerCase();

  const [user] = await db.select().from(ehUsers).where(eq(ehUsers.email, normalizedEmail)).limit(1);
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const [org] = await db.select().from(ehOrgs).where(eq(ehOrgs.id, user.orgId)).limit(1);
  if (!org) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  await db.update(ehUsers).set({ lastLoginAt: new Date() }).where(eq(ehUsers.id, user.id));
  await db.insert(ehAuditLog).values({
    orgId: org.id,
    userId: user.id,
    action: "login",
    targetType: "user",
    targetId: String(user.id),
  });

  const token = signEhToken({
    userId: user.id,
    orgId: org.id,
    email: user.email,
    role: user.role as "owner" | "member",
  });
  setEhCookie(res, token);

  res.json(authPayload(user, org));
});

router.post("/auth/logout", (_req, res): void => {
  clearEhCookie(res);
  res.json({ message: "Logged out" });
});

router.get("/me", ehRequireAuth, async (req, res): Promise<void> => {
  const ehUser = req.ehUser!;
  const [user] = await db.select().from(ehUsers).where(eq(ehUsers.id, ehUser.userId)).limit(1);
  if (!user) {
    res.status(401).json({ error: "User no longer exists" });
    return;
  }
  const [org] = await db.select().from(ehOrgs).where(eq(ehOrgs.id, user.orgId)).limit(1);
  if (!org) {
    res.status(401).json({ error: "Org no longer exists" });
    return;
  }
  const [sub] = await db
    .select()
    .from(ehSubscriptions)
    .where(eq(ehSubscriptions.orgId, org.id))
    .limit(1);

  res.json({
    ...authPayload(user, org),
    subscription: subscriptionInfo(sub ?? null),
  });
});

export default router;
