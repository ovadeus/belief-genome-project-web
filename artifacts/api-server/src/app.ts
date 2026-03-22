import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import router from "./routes";

const app: Express = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [
      `https://${process.env.REPLIT_DEV_DOMAIN}`,
      `https://${process.env.REPLIT_DOMAINS?.split(",")[0]}`,
      "http://localhost:5173",
    ].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
// Resolve blog-assets directory — try multiple paths for Replit compatibility
const blogAssetsCandidates = [
  path.resolve(process.cwd(), "blog-assets"),
  path.resolve(process.cwd(), "../../blog-assets"),
  path.resolve(process.cwd(), "../blog-assets"),
  path.resolve("/home/runner/workspace/blog-assets"),
];
const blogAssetsDir = blogAssetsCandidates.find(p => fs.existsSync(p))
  || path.resolve(process.cwd(), "../../blog-assets");
console.log(`[static] blog-assets serving from: ${blogAssetsDir}`);
app.use("/api/blog-assets/files", express.static(blogAssetsDir));

app.use("/api", router);

export default app;
