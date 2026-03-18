import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, adminUsersTable } from "@workspace/db";
import { AdminLoginBody } from "@workspace/api-zod";
import { requireAuth, signToken } from "../middlewares/auth";
import rateLimit from "express-rate-limit";

const router: IRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many login attempts, please try again later" },
});

router.post("/auth/login", loginLimiter, async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid credentials" });
    return;
  }

  const { username, password } = parsed.data;
  const [user] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.username, username));

  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  await db.update(adminUsersTable).set({ lastLogin: new Date() }).where(eq(adminUsersTable.id, user.id));

  const token = signToken({ userId: user.id, username: user.username });
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({ message: "Login successful", user: { id: user.id, username: user.username } });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  res.json({ id: req.user!.userId, username: req.user!.username });
});

router.post("/auth/logout", (_req, res): void => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

export default router;
