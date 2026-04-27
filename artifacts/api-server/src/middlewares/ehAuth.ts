import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const EH_TOKEN_COOKIE = "eh_token";
const EH_TOKEN_TTL_SEC = 60 * 60 * 24 * 7;

export interface EhJwtPayload {
  userId: number;
  orgId: number;
  email: string;
  role: "owner" | "member";
}

declare global {
  namespace Express {
    interface Request {
      ehUser?: EhJwtPayload;
    }
  }
}

function getSecret(): string | null {
  const secret = process.env.EH_JWT_SECRET;
  if (!secret || secret.length < 16) return null;
  return secret;
}

export function signEhToken(payload: EhJwtPayload): string {
  const secret = getSecret();
  if (!secret) {
    throw new Error("EH_JWT_SECRET is not configured");
  }
  return jwt.sign(payload, secret, { expiresIn: EH_TOKEN_TTL_SEC });
}

export function setEhCookie(res: Response, token: string): void {
  res.cookie(EH_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: EH_TOKEN_TTL_SEC * 1000,
    path: "/",
  });
}

export function clearEhCookie(res: Response): void {
  res.clearCookie(EH_TOKEN_COOKIE, { path: "/" });
}

export function ehRequireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.[EH_TOKEN_COOKIE];
  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const secret = getSecret();
  if (!secret) {
    res.status(503).json({ error: "Auth not configured" });
    return;
  }
  try {
    const decoded = jwt.verify(token, secret) as EhJwtPayload;
    req.ehUser = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
