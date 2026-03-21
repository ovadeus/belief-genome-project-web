import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import blogRouter from "./blog";
import subscribersRouter from "./subscribers";
import earlybirdRouter from "./earlybird";
import adminRouter from "./admin";
import settingsRouter from "./settings";
import storageRouter from "./storage";
import genomeAuthRouter, { genomeAuth } from "./genome-auth";
import genomeProbesRouter from "./genome-probes";
import genomeDataRouter from "./genome-data";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(blogRouter);
router.use(subscribersRouter);
router.use(earlybirdRouter);
router.use(adminRouter);
router.use(settingsRouter);
router.use(storageRouter);

router.use("/genome", genomeAuthRouter);
router.use("/genome", genomeAuth, genomeDataRouter);
router.use("/genome/probes", genomeAuth, genomeProbesRouter);

export default router;
