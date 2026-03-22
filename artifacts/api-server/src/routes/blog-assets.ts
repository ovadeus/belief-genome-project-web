import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

// Try multiple paths — Replit's cwd varies depending on build context
const CANDIDATE_PATHS = [
  path.resolve(process.cwd(), "blog-assets"),         // repo root
  path.resolve(process.cwd(), "../../blog-assets"),    // from artifacts/api-server/
  path.resolve(process.cwd(), "../blog-assets"),       // one level up
  path.resolve("/home/runner/workspace/blog-assets"),  // Replit absolute path
];

const BLOG_ASSETS_DIR = CANDIDATE_PATHS.find(p => fs.existsSync(p))
  || path.resolve(process.cwd(), "../../blog-assets");

if (!fs.existsSync(BLOG_ASSETS_DIR)) {
  fs.mkdirSync(BLOG_ASSETS_DIR, { recursive: true });
}

console.log(`[blog-assets] Serving from: ${BLOG_ASSETS_DIR}`);

function isValidFilename(filename: string): boolean {
  const resolved = path.resolve(BLOG_ASSETS_DIR, filename);
  if (!resolved.startsWith(BLOG_ASSETS_DIR + path.sep) && resolved !== BLOG_ASSETS_DIR) return false;
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) return false;
  if (!filename.match(/\.(html|htm)$/i)) return false;
  return true;
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, BLOG_ASSETS_DIR),
  filename: (_req, file, cb) => {
    const safeName = file.originalname
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    if (!safeName.match(/\.(html|htm)$/i)) {
      return cb(new Error("Only .html files are allowed"), "");
    }
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.originalname.match(/\.(html|htm)$/i)) {
      cb(null, true);
    } else {
      cb(new Error("Only .html files are allowed"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

function handleMulterError(err: any, _req: Request, res: Response, next: NextFunction): void {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({ error: "File too large (max 5MB)" });
      return;
    }
    res.status(400).json({ error: err.message });
    return;
  }
  if (err) {
    res.status(400).json({ error: err.message || "Upload failed" });
    return;
  }
  next();
}

router.get("/blog-assets", async (_req, res): Promise<void> => {
  try {
    if (!fs.existsSync(BLOG_ASSETS_DIR)) {
      res.json({ files: [] });
      return;
    }
    const entries = fs.readdirSync(BLOG_ASSETS_DIR);
    const htmlFiles = entries
      .filter(f => f.endsWith(".html") || f.endsWith(".htm"))
      .map(f => ({
        filename: f,
        url: `/api/blog-assets/files/${f}`,
      }));
    res.json({ files: htmlFiles });
  } catch (err) {
    res.status(500).json({ error: "Failed to read blog-assets directory" });
  }
});

router.post("/blog-assets/upload", requireAuth as any, upload.single("file"), handleMulterError, async (req, res): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    res.json({
      filename: req.file.filename,
      url: `/api/blog-assets/files/${req.file.filename}`,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to upload file" });
  }
});

router.delete("/blog-assets/:filename", requireAuth as any, async (req, res): Promise<void> => {
  try {
    const filename = req.params.filename;
    if (!isValidFilename(filename)) {
      res.status(400).json({ error: "Invalid filename" });
      return;
    }
    const filePath = path.join(BLOG_ASSETS_DIR, filename);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: "File not found" });
      return;
    }
    fs.unlinkSync(filePath);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete file" });
  }
});

export default router;
