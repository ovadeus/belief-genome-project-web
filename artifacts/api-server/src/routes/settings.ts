import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, siteSettingsTable } from "@workspace/db";

const router: IRouter = Router();

// Allowlist of theme names — adding a new theme means adding it here
// AND defining a [data-theme="..."] block in both apps' index.css.
const VALID_THEMES = ["dark", "light"] as const;
type ThemeName = typeof VALID_THEMES[number];
const DEFAULT_THEME: ThemeName = "dark";

function normalizeTheme(raw: string | undefined): ThemeName {
  return (raw && (VALID_THEMES as readonly string[]).includes(raw))
    ? (raw as ThemeName)
    : DEFAULT_THEME;
}

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

// Public theme endpoint — no auth, cheap, called by both apps' first-paint
// bootstrap so the chosen theme propagates to every visitor.
router.get("/theme", async (_req, res): Promise<void> => {
  const [row] = await db
    .select()
    .from(siteSettingsTable)
    .where(eq(siteSettingsTable.key, "activeTheme"))
    .limit(1);
  res.setHeader("Cache-Control", "no-cache");
  res.json({ activeTheme: normalizeTheme(row?.value || undefined) });
});

export default router;
export { VALID_THEMES, DEFAULT_THEME, normalizeTheme };
