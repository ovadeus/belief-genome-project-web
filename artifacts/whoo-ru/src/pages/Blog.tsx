import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { Search, Hash } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { usePublicBlog } from "@/hooks/use-blog";

export default function Blog() {
  const [search, setSearch] = useState("");
  const [hashtag, setHashtag] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = usePublicBlog({ 
    page, 
    limit: 10, 
    search: search || undefined, 
    hashtag: hashtag || undefined 
  });

  const featuredPost = page === 1 && !search && !hashtag ? data?.posts?.[0] : null;
  const gridPosts = featuredPost ? data?.posts?.slice(1) : data?.posts;

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div>
            <h1 className="text-5xl font-display font-bold text-foreground mb-4">Research Notes</h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Deep dives into the framework, human psychology, and the future of aligned intelligence.
            </p>
          </div>
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full sm:w-64 pl-11 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
              />
            </div>
            {hashtag && (
              <button 
                onClick={() => { setHashtag(""); setPage(1); }}
                className="flex items-center gap-2 px-4 py-3 bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary/20 transition-colors"
              >
                <Hash size={18} /> {hashtag} ✕
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse bg-card rounded-2xl h-96 border border-border" />
            ))}
          </div>
        )}

        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-16">
            <Link href={`/blog/${featuredPost.slug}`} className="group block">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-card rounded-[2rem] border border-border p-4 md:p-8 hover:border-primary/30 transition-colors">
                <div className="aspect-[4/3] lg:aspect-square w-full rounded-2xl overflow-hidden bg-background">
                  {featuredPost.featuredImage && (
                    <img 
                      src={featuredPost.featuredImage} 
                      alt={featuredPost.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                  )}
                </div>
                <div className="p-4 md:p-8">
                  <div className="flex gap-2 mb-6">
                    {featuredPost.hashtags?.map(tag => (
                      <span key={tag} className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-lg">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6 group-hover:text-primary transition-colors leading-tight">
                    {featuredPost.title}
                  </h2>
                  <p className="text-xl text-muted-foreground mb-8 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                    {featuredPost.publishedAt && <span>{format(new Date(featuredPost.publishedAt), 'MMMM d, yyyy')}</span>}
                    {featuredPost.readTimeMins && (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-border" />
                        <span>{featuredPost.readTimeMins} min read</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Grid Posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {gridPosts?.map((post) => (
            <article key={post.id} className="bg-card border border-border rounded-2xl flex flex-col overflow-hidden hover:border-border/80 hover:shadow-xl hover:shadow-black/20 transition-all">
              <Link href={`/blog/${post.slug}`} className="block aspect-[16/10] overflow-hidden bg-background relative group">
                {post.featuredImage && (
                  <img 
                    src={post.featuredImage} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.hashtags?.map(tag => (
                    <button 
                      key={tag} 
                      onClick={(e) => { e.preventDefault(); setHashtag(tag); setPage(1); }}
                      className="text-xs font-medium text-secondary bg-secondary/10 hover:bg-secondary/20 px-2.5 py-1 rounded-md transition-colors z-10"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
                
                <Link href={`/blog/${post.slug}`} className="group">
                  <h3 className="text-2xl font-bold text-foreground mb-3 leading-snug group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground line-clamp-3 mb-6">
                    {post.excerpt}
                  </p>
                </Link>
                
                <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground font-medium">
                  <span>{post.publishedAt ? format(new Date(post.publishedAt), 'MMM d, yyyy') : ''}</span>
                  <span>{post.readTimeMins ? `${post.readTimeMins} min read` : ''}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="mt-16 flex justify-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border border-border bg-card text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-muted-foreground flex items-center">
              Page {page} of {data.totalPages}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="px-4 py-2 rounded-lg border border-border bg-card text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
            >
              Next
            </button>
          </div>
        )}
        
        {!isLoading && data?.posts?.length === 0 && (
          <div className="text-center py-24 bg-card rounded-2xl border border-border">
            <p className="text-2xl font-display font-medium text-muted-foreground">No posts found.</p>
            {(search || hashtag) && (
              <button 
                onClick={() => { setSearch(""); setHashtag(""); setPage(1); }}
                className="mt-4 text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

      </div>
    </PublicLayout>
  );
}
