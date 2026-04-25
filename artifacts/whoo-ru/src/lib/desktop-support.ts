// Desktop App support content loader.
//
// Markdown files live under `src/content/desktop-support/<NN-category>/<slug>.md`.
// Vite's import.meta.glob bundles them at build time as raw strings; we parse
// out the H1 as the article title, sort by filename, and expose a manifest the
// SupportDesktop page consumes for index, category, and article views.

const RAW_FILES = import.meta.glob<string>(
  "/src/content/desktop-support/**/*.md",
  { query: "?raw", import: "default", eager: true },
);

export type DesktopArticle = {
  /** Filename slug without extension, e.g. "install" */
  slug: string;
  /** Human title parsed from the article's H1 */
  title: string;
  /** Raw markdown content (with the H1 line stripped) */
  body: string;
  /** Path to this article in the app, e.g. "/support/desktop/01-getting-started/install" */
  href: string;
};

export type DesktopCategory = {
  /** Folder name on disk, e.g. "01-getting-started" */
  slug: string;
  /** Sort key derived from the leading number */
  order: number;
  /** Display title */
  title: string;
  /** One-line summary shown on the index */
  blurb: string;
  /** Articles inside, sorted alphabetically by slug */
  articles: DesktopArticle[];
};

const CATEGORY_META: Record<string, { title: string; blurb: string }> = {
  "01-getting-started": {
    title: "Getting Started",
    blurb: "Install, first launch, signing in, connecting your BGP web account.",
  },
  "02-mission-control": {
    title: "Mission Control",
    blurb: "The widget grid, organize mode, the probe bar, backgrounds.",
  },
  "03-ai-agents": {
    title: "AI Agents",
    blurb: "Templates, the workflow builder, AI Author, scheduling, run history.",
  },
  "04-belief-genome": {
    title: "Belief Genome",
    blurb: "All eight visualizations, the lineage drawer, the Harmonize Easter egg.",
  },
  "05-integrations": {
    title: "Integrations",
    blurb: "Google (Gmail + Calendar), Microsoft, AI keys, zBinder, MusicPax.",
  },
  "06-important-dates": {
    title: "Important Dates & Reminders",
    blurb: 'Email reminders, "Send test now," common send failures.',
  },
  "07-media-library": {
    title: "Media Library",
    blurb: "Generated audio, transcripts, saved research, downloads.",
  },
  "08-settings": {
    title: "Settings",
    blurb: "Every settings page section explained.",
  },
  "09-keyboard-shortcuts": {
    title: "Keyboard Shortcuts",
    blurb: "Power-user reference card.",
  },
  "10-troubleshooting": {
    title: "Troubleshooting",
    blurb: "Common errors and how to fix them.",
  },
  "11-privacy-and-data": {
    title: "Privacy & Data",
    blurb: "Where data lives, sync rules, full reset, security.",
  },
};

const QUICK_LINK_PATHS: Array<{ label: string; path: string }> = [
  { label: "Installing for the first time", path: "01-getting-started/install" },
  { label: '"Reconnect required" badge on Gmail', path: "10-troubleshooting/reconnect-gmail" },
  { label: "Important Dates not sending email", path: "06-important-dates/troubleshooting" },
  { label: "Play your DNA as music", path: "04-belief-genome/harmonize" },
  { label: "App icon missing or broken", path: "10-troubleshooting/icon-cache" },
  { label: "How my data syncs to the web", path: "11-privacy-and-data/sync-model" },
];

function parseArticle(raw: string): { title: string; body: string } {
  const lines = raw.split(/\r?\n/);
  let title = "Untitled";
  let bodyStart = 0;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^#\s+(.+?)\s*$/);
    if (m) {
      title = m[1].trim();
      bodyStart = i + 1;
      break;
    }
  }
  // Trim leading blank lines after the H1.
  while (bodyStart < lines.length && lines[bodyStart].trim() === "") bodyStart++;
  return { title, body: lines.slice(bodyStart).join("\n") };
}

function buildManifest(): DesktopCategory[] {
  const cats = new Map<string, DesktopCategory>();

  for (const [filePath, raw] of Object.entries(RAW_FILES)) {
    // filePath looks like "/src/content/desktop-support/01-getting-started/install.md"
    const rel = filePath.replace(/^.*\/desktop-support\//, "");
    const segments = rel.split("/");
    if (segments.length < 2) continue; // skip top-level README.md
    const categorySlug = segments[0];
    const fileName = segments[segments.length - 1];
    if (!fileName.endsWith(".md")) continue;
    const articleSlug = fileName.replace(/\.md$/, "");

    const meta = CATEGORY_META[categorySlug];
    if (!meta) continue; // unknown folder — ignore

    let cat = cats.get(categorySlug);
    if (!cat) {
      const numMatch = categorySlug.match(/^(\d+)/);
      cat = {
        slug: categorySlug,
        order: numMatch ? parseInt(numMatch[1], 10) : 999,
        title: meta.title,
        blurb: meta.blurb,
        articles: [],
      };
      cats.set(categorySlug, cat);
    }

    const { title, body } = parseArticle(raw);
    cat.articles.push({
      slug: articleSlug,
      title,
      body,
      href: `/support/desktop/${categorySlug}/${articleSlug}`,
    });
  }

  for (const cat of cats.values()) {
    cat.articles.sort((a, b) => a.slug.localeCompare(b.slug));
  }

  return Array.from(cats.values()).sort((a, b) => a.order - b.order);
}

export const DESKTOP_CATEGORIES: DesktopCategory[] = buildManifest();

export function findCategory(slug: string): DesktopCategory | undefined {
  return DESKTOP_CATEGORIES.find(c => c.slug === slug);
}

export function findArticle(categorySlug: string, articleSlug: string):
  { category: DesktopCategory; article: DesktopArticle; prev?: DesktopArticle; next?: DesktopArticle } | undefined {
  const category = findCategory(categorySlug);
  if (!category) return undefined;
  const idx = category.articles.findIndex(a => a.slug === articleSlug);
  if (idx === -1) return undefined;
  return {
    category,
    article: category.articles[idx],
    prev: idx > 0 ? category.articles[idx - 1] : undefined,
    next: idx < category.articles.length - 1 ? category.articles[idx + 1] : undefined,
  };
}

export function getQuickLinks(): Array<{ label: string; href: string }> {
  return QUICK_LINK_PATHS
    .map(q => {
      const [cat, art] = q.path.split("/");
      const found = findArticle(cat, art);
      if (!found) return null;
      return { label: q.label, href: found.article.href };
    })
    .filter((x): x is { label: string; href: string } => x !== null);
}

/**
 * Convert an inter-article relative markdown link to the in-app route.
 * Examples handled:
 *   "../11-privacy-and-data/data-locations.md"  → "/support/desktop/11-privacy-and-data/data-locations"
 *   "backgrounds.md"                            → same-category /support/desktop/<cat>/backgrounds
 *   "01-getting-started/install.md"             → "/support/desktop/01-getting-started/install"
 *   "../09-keyboard-shortcuts/"                 → "/support/desktop/09-keyboard-shortcuts/index"
 *                                                  (or the category page if no `index` article exists)
 *   "../06-important-dates/"                    → "/support/desktop/06-important-dates"
 * Anchor fragments (#section) are preserved.
 */
export function rewriteMarkdownHref(href: string, currentCategorySlug: string): string {
  if (!href) return href;
  // Leave external/protocol links, app-absolute paths, and pure anchors alone.
  if (/^[a-z]+:/i.test(href) || href.startsWith("#") || href.startsWith("/")) {
    return href;
  }
  const [pathPart, hash] = href.split("#");

  // Determine if this looks like an internal docs link we should rewrite.
  const isMd = pathPart.endsWith(".md");
  const isDir = pathPart.endsWith("/");
  // Anything else (e.g. "../foo" with no trailing slash and no .md) we leave alone.
  if (!isMd && !isDir) return href;

  const stripped = isMd ? pathPart.replace(/\.md$/, "") : pathPart.replace(/\/$/, "");
  const segments = stripped.split("/").filter(s => s !== "" && s !== ".");

  // Resolve "../" walks against the current article's category.
  const stack: string[] = [currentCategorySlug];
  for (const seg of segments) {
    if (seg === "..") stack.pop();
    else stack.push(seg);
  }

  let resolved: string;
  if (isMd) {
    // Final stack should be [<category>, <article>] (length 2).
    if (stack.length >= 2) {
      const article = stack[stack.length - 1];
      const category = stack[stack.length - 2];
      resolved = `/support/desktop/${category}/${article}`;
    } else if (stack.length === 1) {
      resolved = `/support/desktop/${stack[0]}`;
    } else {
      resolved = `/support/desktop`;
    }
  } else {
    // Directory-style link → resolves to a category. If that category has an
    // article literally named "index", land on it; otherwise the category page.
    const categorySlug = stack[stack.length - 1];
    const cat = findCategory(categorySlug);
    const hasIndex = cat?.articles.some(a => a.slug === "index");
    resolved = hasIndex
      ? `/support/desktop/${categorySlug}/index`
      : cat
        ? `/support/desktop/${categorySlug}`
        : `/support/desktop`;
  }

  return hash ? `${resolved}#${hash}` : resolved;
}
