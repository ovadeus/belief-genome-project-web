import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import blogRouter from "./blog";
import subscribersRouter from "./subscribers";
import earlybirdRouter from "./earlybird";
import adminRouter from "./admin";
import settingsRouter from "./settings";
import storageRouter from "./storage";
import blogAssetsRouter from "./blog-assets";
import genomeAuthRouter, { genomeAuth } from "./genome-auth";
import genomeProbesRouter from "./genome-probes";
import genomeDataRouter from "./genome-data";
import genomePublicRouter from "./genome-public";
import genomeSubmitRouter from "./genome-submit";
import genomeAdminRouter from "./genome-admin";
import analyticsRouter from "./analytics";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(blogRouter);
router.use(subscribersRouter);
router.use(earlybirdRouter);
router.use(adminRouter);
router.use(settingsRouter);
router.use(storageRouter);
router.use(blogAssetsRouter);
router.use(analyticsRouter);

// Public, unauthenticated DNA share routes — MUST be mounted before the
// auth-gated /genome subrouter so the auth middleware doesn't intercept them.
router.use("/genome/dna/public", genomePublicRouter);

router.use("/genome", genomeSubmitRouter);
router.use("/genome/admin", requireAuth, genomeAdminRouter);
router.use("/genome", genomeAuthRouter);
router.use("/genome", genomeAuth, genomeDataRouter);
router.use("/genome/probes", genomeAuth, genomeProbesRouter);

export default router;
