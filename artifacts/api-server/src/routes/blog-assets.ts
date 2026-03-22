import { Router, type IRouter } from "express";
import fs from "fs";
import path from "path";

const router: IRouter = Router();

const BLOG_ASSETS_DIR = path.resolve(process.cwd(), "../../blog-assets");

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

export default router;
