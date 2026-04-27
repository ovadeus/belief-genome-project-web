import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import authRouter from "./auth";
import billingRouter from "./billing";

// JSON-bodied EH routes (auth, me, billing). The Stripe webhook is mounted
// separately at the app level because it needs the raw request body before
// express.json() consumes it.
const router: IRouter = Router();

router.use(authRouter);
router.use(billingRouter);

// JSON-only error handler scoped to /api/eh/*. Without this, unhandled
// exceptions (e.g. Stripe API errors, DB failures) fall through to Express's
// default handler which returns an HTML stack-trace page — breaking JSON
// clients and leaking implementation details. We log the full error
// server-side and return a stable JSON envelope.
router.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[eh] Unhandled error on ${req.method} ${req.originalUrl}:`, err);
  if (res.headersSent) return;
  res.status(500).json({ error: "Internal server error", detail: message });
});

export default router;
export { ehStripeWebhookHandler } from "./webhooks";
