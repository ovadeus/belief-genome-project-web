import { useEffect, useRef, useState, type ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

type WikiData = {
  title: string;
  extract: string;
  thumbnail?: string;
  pageUrl: string;
};

// Per-session in-memory cache and request de-duplication. Avoids re-fetching
// the same Wikipedia summary every time the user hovers a name.
const cache = new Map<string, WikiData | "error">();
const inflight = new Map<string, Promise<WikiData | "error">>();

function trimExtract(text: string, maxLen = 280): string {
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen);
  const lastDot = cut.lastIndexOf(". ");
  if (lastDot > maxLen * 0.6) return cut.slice(0, lastDot + 1);
  return cut.trimEnd() + "…";
}

async function fetchSummary(slug: string): Promise<WikiData | "error"> {
  if (cache.has(slug)) return cache.get(slug)!;
  if (inflight.has(slug)) return inflight.get(slug)!;
  const promise = (async (): Promise<WikiData | "error"> => {
    try {
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(slug)}`,
        { redirect: "follow" }
      );
      if (!res.ok) {
        cache.set(slug, "error");
        return "error";
      }
      const json = await res.json();
      const data: WikiData = {
        title: json.title ?? slug.replace(/_/g, " "),
        extract: trimExtract(json.extract ?? ""),
        thumbnail: json.thumbnail?.source,
        pageUrl:
          json.content_urls?.desktop?.page ??
          `https://en.wikipedia.org/wiki/${encodeURIComponent(slug)}`,
      };
      cache.set(slug, data);
      return data;
    } catch {
      cache.set(slug, "error");
      return "error";
    } finally {
      inflight.delete(slug);
    }
  })();
  inflight.set(slug, promise);
  return promise;
}

export function PersonHoverCard({
  name,
  slug,
  children,
  className,
}: {
  name: string;
  /** Wikipedia URL slug, e.g. "Jerome_Busemeyer". */
  slug: string;
  /** Override displayed text. Defaults to `name`. */
  children?: ReactNode;
  className?: string;
}) {
  const [data, setData] = useState<WikiData | "error" | null>(
    () => cache.get(slug) ?? null
  );
  const [open, setOpen] = useState(false);
  const triggered = useRef(Boolean(cache.get(slug)));

  // Lazy-fetch only on first open; subsequent hovers hit the cache instantly.
  useEffect(() => {
    if (!open || triggered.current) return;
    triggered.current = true;
    fetchSummary(slug).then(setData);
  }, [open, slug]);

  const fallbackUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(slug)}`;
  const initial =
    (name.split(/\s+/).pop()?.[0] ?? name[0] ?? "?").toUpperCase();

  return (
    <HoverCard openDelay={150} closeDelay={120} onOpenChange={setOpen}>
      <HoverCardTrigger asChild>
        <a
          href={data && data !== "error" ? data.pageUrl : fallbackUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "font-semibold text-primary underline decoration-dotted decoration-primary/40 underline-offset-[3px] hover:decoration-primary hover:text-primary/90 transition-colors",
            className
          )}
        >
          {children ?? name}
        </a>
      </HoverCardTrigger>
      <HoverCardContent>
        {data && data !== "error" ? (
          <div className="flex gap-3.5">
            {data.thumbnail ? (
              <img
                src={data.thumbnail}
                alt=""
                className="h-16 w-16 rounded-lg object-cover bg-muted shrink-0"
                loading="lazy"
              />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-primary/15 text-primary flex items-center justify-center font-display text-xl font-semibold shrink-0">
                {initial}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="font-display font-semibold text-foreground text-sm leading-tight mb-1.5">
                {data.title}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-2.5">
                {data.extract}
              </p>
              <a
                href={data.pageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary hover:text-primary/80 uppercase tracking-[0.14em]"
              >
                Read on Wikipedia
                <ExternalLink size={10} />
              </a>
            </div>
          </div>
        ) : data === "error" ? (
          <div className="flex flex-col gap-2">
            <div className="font-display font-semibold text-foreground text-sm">
              {name}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Couldn't load a summary right now.
            </p>
            <a
              href={fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary hover:text-primary/80 uppercase tracking-[0.14em]"
            >
              Open Wikipedia
              <ExternalLink size={10} />
            </a>
          </div>
        ) : (
          <div className="flex gap-3.5 animate-pulse">
            <div className="h-16 w-16 rounded-lg bg-muted shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3 w-1/2 bg-muted rounded" />
              <div className="h-2.5 w-full bg-muted rounded" />
              <div className="h-2.5 w-5/6 bg-muted rounded" />
              <div className="h-2.5 w-4/6 bg-muted rounded" />
            </div>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
