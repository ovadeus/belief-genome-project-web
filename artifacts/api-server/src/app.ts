import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import router from "./routes";

const app: Express = express();

// We're behind Replit's reverse proxy. Trust the first hop so req.ip
// reflects the real client IP — otherwise express-rate-limit would key
// every visitor under the proxy IP and a single user could trip the
// limit for everyone (DoS vector).
app.set("trust proxy", 1);

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [
      `https://${process.env.REPLIT_DEV_DOMAIN}`,
      `https://${process.env.REPLIT_DOMAINS?.split(",")[0]}`,
      "http://localhost:5173",
    ].filter(Boolean);

app.use("/api/genome/submit", cors());
app.use("/api/genome/stats", cors());
app.use("/api/genome/explore", cors());
app.use("/api/genome/dna/public", cors());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    try {
      const parsed = new URL(origin);
      const originHost = parsed.origin;
      if (allowedOrigins.some(o => {
        try { return new URL(o).origin === originHost; } catch { return false; }
      })) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    } catch {
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
