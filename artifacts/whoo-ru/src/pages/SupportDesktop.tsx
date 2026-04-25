import { PublicLayout } from "@/components/layout/PublicLayout";
import { Link, useLocation, useParams } from "wouter";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import {
  ArrowLeft, ArrowRight, Monitor, ChevronRight, Sparkles, BookOpen, Search,
  Zap, LayoutGrid, Bot, Dna, Plug, CalendarClock, Library, Settings, Keyboard,
  AlertTriangle, Shield,
} from "lucide-react";
import {
  DESKTOP_CATEGORIES, findCategory, findArticle, getQuickLinks, rewriteMarkdownHref,
  type DesktopCategory, type DesktopArticle,
} from "@/lib/desktop-support";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  "01-getting-started": Zap,
  "02-mission-control": LayoutGrid,
  "03-ai-agents": Bot,
  "04-belief-genome": Dna,
  "05-integrations": Plug,
  "06-important-dates": CalendarClock,
  "07-media-library": Library,
  "08-settings": Settings,
  "09-keyboard-shortcuts": Keyboard,
  "10-troubleshooting": AlertTriangle,
  "11-privacy-and-data": Shield,
};

export default function SupportDesktop() {
  const params = useParams<{ category?: string; slug?: string }>();
  const { category: categorySlug, slug: articleSlug } = params;

  if (categorySlug && articleSlug) {
    return <ArticleView categorySlug={categorySlug} articleSlug={articleSlug} />;
  }
  if (categorySlug) {
    return <CategoryView categorySlug={categorySlug} />;
  }
  return <IndexView />;
}

/* ──────────────────────────────────────────────────────────────────── */
/* Index — landing with all categories                                 */
/* ──────────────────────────────────────────────────────────────────── */

function IndexView() {
  const [query, setQuery] = useState("");
  const quickLinks = useMemo(() => getQuickLinks(), []);

  const searchHits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const hits: Array<{ category: DesktopCategory; article: DesktopArticle }> = [];
    for (const cat of DESKTOP_CATEGORIES) {
      for (const art of cat.articles) {
        const haystack = `${art.title} ${cat.title} ${art.body}`.toLowerCase();
        if (haystack.includes(q)) hits.push({ category: cat, article: art });
        if (hits.length >= 12) break;
      }
      if (hits.length >= 12) break;
    }
    return hits;
  }, [query]);

  const totalArticles = useMemo(
    () => DESKTOP_CATEGORIES.reduce((n, c) => n + c.articles.length, 0),
    [],
  );

  return (
    <PublicLayout>
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <Link
          href="/support"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          Help Center
        </Link>

        <header className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Monitor size={22} />
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground font-display">
              Desktop App Support
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Mission Control — the always-on desktop companion that holds your local belief
            data, runs your AI agent workflows, and surfaces your daily reflections,
            schedule, media, and integrations from one window.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {DESKTOP_CATEGORIES.length} categories · {totalArticles} articles
          </p>

          <div className="mt-6 relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search desktop support..."
              aria-label="Search desktop support articles"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            />
            {searchHits && searchHits.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-50 py-1 max-h-80 overflow-y-auto">
                {searchHits.map(h => (
                  <Link
                    key={h.article.href}
                    href={h.article.href}
                    className="block px-4 py-2.5 text-sm hover:bg-foreground/5"
                  >
                    <div className="text-foreground">{h.article.title}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{h.category.title}</div>
                  </Link>
                ))}
              </div>
            )}
            {searchHits && searchHits.length === 0 && query.trim() && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-50 p-4 text-sm text-muted-foreground">
                No results found.
              </div>
            )}
          </div>
        </header>

        {quickLinks.length > 0 && (
          <div className="mb-12 p-6 rounded-2xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-primary" />
              <h2 className="text-base font-display font-semibold text-foreground uppercase tracking-wider">
                Quick Answers
              </h2>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {quickLinks.map(q => (
                <li key={q.href}>
                  <Link
                    href={q.href}
                    className="group flex items-center gap-2 py-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ChevronRight size={14} className="text-primary/60 shrink-0" />
                    {q.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DESKTOP_CATEGORIES.map(cat => {
            const Icon = CATEGORY_ICONS[cat.slug] ?? BookOpen;
            return (
              <Link
                key={cat.slug}
                href={`/support/desktop/${cat.slug}`}
                className="group p-5 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <Icon size={18} />
                  </span>
                  <h3 className="text-foreground font-display font-semibold group-hover:text-primary transition-colors">
                    {cat.title}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  {cat.blurb}
                </p>
                <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground/70">
                  {cat.articles.length} {cat.articles.length === 1 ? "article" : "articles"}
                </p>
              </Link>
            );
          })}
        </div>

        <div className="mt-14 p-6 rounded-2xl bg-card border border-border">
          <h3 className="text-foreground font-display font-semibold mb-2">Looking for the web app?</h3>
          <p className="text-sm text-muted-foreground">
            The{" "}
            <Link href="/support/web" className="text-primary hover:underline">Web App guide</Link>{" "}
            covers the browser experience: dashboard tour, recalculate, evolution, compare,
            sharing, and more.
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}

/* ──────────────────────────────────────────────────────────────────── */
/* Category — list of articles in a single section                     */
/* ──────────────────────────────────────────────────────────────────── */

function CategoryView({ categorySlug }: { categorySlug: string }) {
  const category = findCategory(categorySlug);
  if (!category) return <NotFoundView />;

  const Icon = CATEGORY_ICONS[category.slug] ?? BookOpen;

  return (
    <PublicLayout>
      <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto">
        <Breadcrumbs items={[{ label: "Help Center", href: "/support" }, { label: "Desktop", href: "/support/desktop" }]} />

        <header className="mb-10 flex items-start gap-4">
          <span className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Icon size={24} />
          </span>
          <div className="min-w-0">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground font-display mb-2">
              {category.title}
            </h1>
            <p className="text-muted-foreground">{category.blurb}</p>
          </div>
        </header>

        <ul className="divide-y divide-border rounded-2xl bg-card border border-border overflow-hidden">
          {category.articles.map(art => (
            <li key={art.slug}>
              <Link
                href={art.href}
                className="group flex items-center justify-between gap-4 p-5 hover:bg-foreground/5 transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-foreground font-display font-medium group-hover:text-primary transition-colors">
                    {art.title}
                  </div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground/70 mt-1">
                    {art.slug}
                  </div>
                </div>
                <ChevronRight size={18} className="text-muted-foreground shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </Link>
            </li>
          ))}
        </ul>

        <CategoryNav currentSlug={category.slug} />
      </section>
    </PublicLayout>
  );
}

/* ──────────────────────────────────────────────────────────────────── */
/* Article — full markdown render with prev/next                       */
/* ──────────────────────────────────────────────────────────────────── */

function ArticleView({ categorySlug, articleSlug }: { categorySlug: string; articleSlug: string }) {
  const found = findArticle(categorySlug, articleSlug);
  const [, setLocation] = useLocation();

  // On article change: jump to top, unless the URL has a #fragment, in which
  // case scroll the matching heading into view (rendered headings get an id
  // from rehype-slug-style behavior in remark-gfm? — fall back to top if not
  // found). We poll briefly because the markdown renders synchronously after
  // the effect fires but the DOM may not have the id yet on slow paints.
  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
    let attempts = 0;
    const tick = () => {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "auto", block: "start" });
        return;
      }
      if (++attempts < 8) requestAnimationFrame(tick);
      else window.scrollTo({ top: 0, behavior: "auto" });
    };
    requestAnimationFrame(tick);
  }, [categorySlug, articleSlug]);

  if (!found) return <NotFoundView />;
  const { category, article, prev, next } = found;

  return (
    <PublicLayout>
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <Breadcrumbs
          items={[
            { label: "Help Center", href: "/support" },
            { label: "Desktop", href: "/support/desktop" },
            { label: category.title, href: `/support/desktop/${category.slug}` },
          ]}
        />

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar: articles in this category */}
          <nav className="lg:w-64 shrink-0 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-3">
              {category.title}
            </div>
            <ul className="space-y-1 border-l border-border pl-4">
              {category.articles.map(a => {
                const active = a.slug === article.slug;
                return (
                  <li key={a.slug}>
                    <Link
                      href={a.href}
                      className={`block py-1.5 text-sm transition-colors ${
                        active
                          ? "text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {a.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Article body */}
          <article className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground font-display mb-8">
              {article.title}
            </h1>

            <div className="desktop-support-prose">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug]}
                components={{
                  a: ({ href = "", children, ...props }) => {
                    const target = rewriteMarkdownHref(href, category.slug);
                    const isExternal = /^https?:\/\//i.test(target);
                    if (isExternal) {
                      return (
                        <a href={target} target="_blank" rel="noopener noreferrer" {...props}>
                          {children}
                        </a>
                      );
                    }
                    if (target.startsWith("/")) {
                      return (
                        <a
                          href={target}
                          onClick={e => {
                            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                            e.preventDefault();
                            setLocation(target);
                          }}
                          {...props}
                        >
                          {children}
                        </a>
                      );
                    }
                    return <a href={target} {...props}>{children}</a>;
                  },
                }}
              >
                {article.body}
              </ReactMarkdown>
            </div>

            {/* Prev / Next */}
            <div className="mt-14 pt-8 border-t border-border grid gap-3 sm:grid-cols-2">
              {prev ? (
                <Link
                  href={prev.href}
                  className="group p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                    <ArrowLeft size={12} /> Previous
                  </div>
                  <div className="text-sm text-foreground font-display font-medium group-hover:text-primary transition-colors">
                    {prev.title}
                  </div>
                </Link>
              ) : <div />}
              {next ? (
                <Link
                  href={next.href}
                  className="group p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors text-right sm:text-right"
                >
                  <div className="flex items-center justify-end gap-1.5 text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                    Next <ArrowRight size={12} />
                  </div>
                  <div className="text-sm text-foreground font-display font-medium group-hover:text-primary transition-colors">
                    {next.title}
                  </div>
                </Link>
              ) : <div />}
            </div>
          </article>
        </div>
      </section>
    </PublicLayout>
  );
}

/* ──────────────────────────────────────────────────────────────────── */
/* Helpers                                                              */
/* ──────────────────────────────────────────────────────────────────── */

function Breadcrumbs({ items }: { items: Array<{ label: string; href: string }> }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
      {items.map((it, i) => (
        <span key={it.href} className="inline-flex items-center gap-1.5">
          {i > 0 && <ChevronRight size={12} className="text-muted-foreground/60" />}
          <Link href={it.href} className="hover:text-primary transition-colors">
            {it.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}

function CategoryNav({ currentSlug }: { currentSlug: string }) {
  const idx = DESKTOP_CATEGORIES.findIndex(c => c.slug === currentSlug);
  const prev = idx > 0 ? DESKTOP_CATEGORIES[idx - 1] : undefined;
  const next = idx < DESKTOP_CATEGORIES.length - 1 ? DESKTOP_CATEGORIES[idx + 1] : undefined;
  return (
    <div className="mt-10 grid gap-3 sm:grid-cols-2">
      {prev ? (
        <Link
          href={`/support/desktop/${prev.slug}`}
          className="group p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
            <ArrowLeft size={12} /> Previous Category
          </div>
          <div className="text-sm text-foreground font-display font-medium group-hover:text-primary transition-colors">
            {prev.title}
          </div>
        </Link>
      ) : <div />}
      {next ? (
        <Link
          href={`/support/desktop/${next.slug}`}
          className="group p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors text-right"
        >
          <div className="flex items-center justify-end gap-1.5 text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
            Next Category <ArrowRight size={12} />
          </div>
          <div className="text-sm text-foreground font-display font-medium group-hover:text-primary transition-colors">
            {next.title}
          </div>
        </Link>
      ) : <div />}
    </div>
  );
}

function NotFoundView() {
  return (
    <PublicLayout>
      <section className="py-20 px-4 sm:px-6 max-w-3xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-foreground font-display mb-4">Article not found</h1>
        <p className="text-muted-foreground mb-6">
          That desktop support page doesn't exist (or moved). Try the index.
        </p>
        <Link href="/support/desktop" className="inline-flex items-center gap-1.5 text-primary hover:underline">
          <ArrowLeft size={14} /> Back to Desktop App support
        </Link>
      </section>
    </PublicLayout>
  );
}
