import { Router, type IRouter } from "express";
import { db, siteSettingsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/settings/public", async (_req, res): Promise<void> => {
  const settings = await db.select().from(siteSettingsTable);
  const settingsObj: Record<string, string> = {};
  settings.forEach(s => { settingsObj[s.key] = s.value || ""; });
  res.json({
    tagline: settingsObj.tagline || "Who Are You? — The only question that has ever really mattered.",
    appDownloadUrl: settingsObj.appDownloadUrl || "",
    twitterUrl: settingsObj.twitterUrl || "",
    linkedinUrl: settingsObj.linkedinUrl || "",
    githubUrl: settingsObj.githubUrl || "",
    founderPhotoUrl: settingsObj.founderPhotoUrl || "",
    bookCoverUrl: settingsObj.bookCoverUrl || "",
  });
});

export default router;
