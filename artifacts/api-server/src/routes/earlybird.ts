import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, earlyBirdTable } from "@workspace/db";
import { CreateEarlyBirdBody } from "@workspace/api-zod";
import rateLimit from "express-rate-limit";

const router: IRouter = Router();

const earlybirdLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many requests, please try again later" },
});

router.post("/earlybird", earlybirdLimiter, async (req, res): Promise<void> => {
  const parsed = CreateEarlyBirdBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Valid email is required" });
    return;
  }

  const { name, email } = parsed.data;

  const [existing] = await db.select().from(earlyBirdTable).where(eq(earlyBirdTable.email, email));
  if (existing) {
    res.status(409).json({ error: "This email is already on the early bird list" });
    return;
  }

  await db.insert(earlyBirdTable).values({ name: name || null, email });
  res.status(201).json({ message: "You're on the early bird list! We'll notify you when the book is ready." });
});

export default router;
