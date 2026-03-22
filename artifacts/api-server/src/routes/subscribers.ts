import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, subscribersTable } from "@workspace/db";
import { CreateSubscriberBody } from "@workspace/api-zod";
import rateLimit from "express-rate-limit";

const router: IRouter = Router();

const subscribeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many requests, please try again later" },
});

router.post("/subscribe", subscribeLimiter, async (req, res): Promise<void> => {
  const parsed = CreateSubscriberBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Valid email is required" });
    return;
  }

  const { name, email, source } = parsed.data;

  const [existing] = await db.select().from(subscribersTable).where(eq(subscribersTable.email, email));
  if (existing) {
    res.status(409).json({ error: "This email is already subscribed" });
    return;
  }

  await db.insert(subscribersTable).values({ name: name || null, email, source, isActive: true });
  res.status(201).json({ message: "Successfully subscribed! Check your email for confirmation." });
});

export default router;
