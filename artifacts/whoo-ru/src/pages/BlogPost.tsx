import { useRoute } from "wouter";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { Twitter, Linkedin, Link as LinkIcon, ArrowLeft } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { usePublicBlogPost, usePublicRelatedPosts } from "@/hooks/use-blog";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

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
        <div className="max-w-3xl mx-auto px-4 py-24 animate-pulse">
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
        <div className="max-w-3xl mx-auto px-4 py-32 text-center">
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
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
                <p className="font-medium text-foreground">WhooRU Research</p>
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

          <div className="prose prose-invert prose-lg max-w-none">
            <ReactMarkdown>{post.body || ""}</ReactMarkdown>
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
