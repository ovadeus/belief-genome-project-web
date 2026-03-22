import { useRoute } from "wouter";
import { useRef, useEffect, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { marked } from "marked";
import { Twitter, Linkedin, Link as LinkIcon, ArrowLeft } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { usePublicBlogPost, usePublicRelatedPosts } from "@/hooks/use-blog";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const BASE_STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #0a0a0f;
    color: #f0f0f5;
    padding: 0;
    line-height: 1.8;
    font-size: 16px;
  }
  h1, h2, h3, h4 {
    font-family: 'Space Grotesk', 'Inter', sans-serif;
    color: #f0f0f5;
    font-weight: 700;
  }
  h1 { font-size: 2.25rem; margin-top: 2.5rem; margin-bottom: 1.5rem; }
  h2 { font-size: 1.5rem; margin-top: 2rem; margin-bottom: 1rem; }
  h3 { font-size: 1.25rem; margin-top: 1.5rem; margin-bottom: 0.75rem; }
  p { color: #f0f0f5; margin-bottom: 1.25rem; line-height: 1.8; }
  a { color: #6c8fff; text-decoration: none; }
  a:hover { color: #a78bfa; }
  ul, ol { color: #f0f0f5; margin-bottom: 1.25rem; padding-left: 1.5rem; }
  li { margin-bottom: 0.5rem; }
  blockquote {
    border-left: 4px solid #6c8fff;
    padding: 1rem 1.5rem;
    font-style: italic;
    color: #f0f0f5;
    margin: 2rem 0;
    background: rgba(108, 143, 255, 0.05);
    border-radius: 0 0.5rem 0.5rem 0;
  }
  img { max-width: 100%; height: auto; border-radius: 12px; margin: 1.5rem 0; }
  code {
    background: rgba(255, 255, 255, 0.06);
    padding: 0.2em 0.4em;
    border-radius: 4px;
    font-size: 0.9em;
  }
  hr {
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    margin: 2rem 0;
  }
  strong { color: #f0f0f5; }
  em { color: #f0f0f5; }
`;

function isMarkdown(text: string): boolean {
  const mdPatterns = /^#{1,6}\s|^\*\*|^\- |\!\[.*\]\(|^\d+\.\s/m;
  const htmlPatterns = /<(h[1-6]|p|div|section|article|ul|ol|blockquote|table)\b/i;
  return mdPatterns.test(text) && !htmlPatterns.test(text);
}

function HtmlFrame({ html, customCss, customJs }: { html: string; customCss?: string | null; customJs?: string | null }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const srcDoc = useMemo(() => {
    const bodyHtml = isMarkdown(html) ? marked.parse(html, { async: false }) as string : html;
    return `<!DOCTYPE html>
<html><head>
<base href="${window.location.origin}/" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
<style>${BASE_STYLES}</style>
${customCss ? `<style>${customCss}</style>` : ""}
</head><body>${bodyHtml}${customJs ? `<script>${customJs}<\/script>` : ""}</body></html>`;
  }, [html, customCss, customJs]);

  const resize = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument?.body) return;
    const h = iframe.contentDocument.documentElement.scrollHeight;
    iframe.style.height = h + "px";
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const onLoad = () => {
      resize();
      const observer = new MutationObserver(resize);
      if (iframe.contentDocument?.body) {
        observer.observe(iframe.contentDocument.body, { childList: true, subtree: true, attributes: true });
      }
      const resizeObserver = new ResizeObserver(resize);
      if (iframe.contentDocument?.body) {
        resizeObserver.observe(iframe.contentDocument.body);
      }
    };
    iframe.addEventListener("load", onLoad);
    return () => iframe.removeEventListener("load", onLoad);
  }, [resize]);

  return (
    <iframe
      ref={iframeRef}
      srcDoc={srcDoc}
      sandbox="allow-scripts allow-same-origin"
      className="w-full border-0 overflow-hidden"
      style={{ minHeight: 200 }}
      title="Blog content"
    />
  );
}

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug || "";
  const { toast } = useToast();
  
  const { data: post, isLoading, isError } = usePublicBlogPost(slug);
  const { data: related } = usePublicRelatedPosts(slug);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied", description: "Copied to clipboard." });
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="w-full max-w-7xl mx-auto px-4 py-24 animate-pulse">
          <div className="h-8 w-32 bg-card rounded mb-8" />
          <div className="h-16 bg-card rounded mb-6 w-3/4" />
          <div className="h-96 w-full bg-card rounded-2xl mb-12" />
          <div className="space-y-4">
            <div className="h-4 bg-card rounded w-full" />
            <div className="h-4 bg-card rounded w-full" />
            <div className="h-4 bg-card rounded w-5/6" />
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (isError || !post) {
    return (
      <PublicLayout>
        <div className="w-full max-w-7xl mx-auto px-4 py-32 text-center">
          <h1 className="text-4xl font-bold mb-4">Post not found</h1>
          <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist.</p>
          <Link href="/blog" className="text-primary hover:underline">← Back to blog</Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <article className="py-12 lg:py-20">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <Link href="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium mb-12">
            <ArrowLeft size={18} /> Back to all posts
          </Link>

          <div className="flex flex-wrap gap-2 mb-6">
            {post.hashtags?.map(tag => (
              <Link key={tag} href={`/blog?hashtag=${tag}`} className="text-sm font-semibold text-secondary bg-secondary/10 hover:bg-secondary/20 px-3 py-1.5 rounded-lg transition-colors">
                #{tag}
              </Link>
            ))}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight mb-8">
            {post.title}
          </h1>

          <div className="flex items-center justify-between border-y border-border py-6 mb-12">
            <div className="flex items-center gap-4">
              {/* Fake avatar for author since schema doesn't have it */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary p-0.5">
                <div className="w-full h-full bg-background rounded-full flex items-center justify-center font-bold text-lg">
                  W
                </div>
              </div>
              <div>
                <p className="font-medium text-foreground">BGP Research</p>
                <p className="text-sm text-muted-foreground">
                  {post.publishedAt ? format(new Date(post.publishedAt), 'MMMM d, yyyy') : 'Draft'} 
                  {post.readTimeMins && ` • ${post.readTimeMins} min read`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`)} className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:text-primary hover:border-primary transition-colors text-muted-foreground">
                <Twitter size={18} />
              </button>
              <button onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`)} className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:text-primary hover:border-primary transition-colors text-muted-foreground">
                <Linkedin size={18} />
              </button>
              <button onClick={handleCopyLink} className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:text-primary hover:border-primary transition-colors text-muted-foreground">
                <LinkIcon size={18} />
              </button>
            </div>
          </div>

          {post.featuredImage && (
            <div className="w-full aspect-[21/9] rounded-2xl overflow-hidden mb-12 border border-border bg-background shadow-xl">
              <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="max-w-none">
            <HtmlFrame
              html={post.body || ""}
              customCss={post.customCss}
              customJs={post.customJs}
            />
          </div>
          
        </div>
      </article>

      {/* Related Posts */}
      {related && related.length > 0 && (
        <section className="py-24 bg-card border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-display font-bold mb-12">Continue Reading</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {related.slice(0,3).map(relPost => (
                <Link key={relPost.id} href={`/blog/${relPost.slug}`} className="group">
                  <article className="bg-background border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all h-full flex flex-col">
                    {relPost.featuredImage && (
                      <div className="aspect-[16/9] w-full overflow-hidden">
                        <img src={relPost.featuredImage} alt={relPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                        {relPost.title}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-2">{relPost.excerpt}</p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </PublicLayout>
  );
}
