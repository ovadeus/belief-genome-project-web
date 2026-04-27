import { Router, type IRouter } from "express";
import authRouter from "./auth";
import billingRouter from "./billing";

// JSON-bodied EH routes (auth, me, billing). The Stripe webhook is mounted
// separately at the app level because it needs the raw request body before
// express.json() consumes it.
const router: IRouter = Router();

router.use(authRouter);
router.use(billingRouter);

export default router;
export { ehStripeWebhookHandler } from "./webhooks";
