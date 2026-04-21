import { Link } from "wouter";
import { Mic, Headphones, Heart, Calendar } from "lucide-react";
import { format } from "date-fns";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { usePodcastEpisodes, formatDuration } from "@/hooks/use-podcasts";

export default function Podcast() {
  const { data, isLoading } = usePodcastEpisodes();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNavbar />

      {/* Hero */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 text-primary mb-3">
            <Mic size={20} />
            <span className="text-sm font-medium uppercase tracking-wider">Podcast</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-foreground">
            The Belief Genome Podcast
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Conversations on the structure of belief, the architecture of identity, and what it means to know yourself.
          </p>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !data?.episodes.length ? (
            <div className="text-center py-20 bg-card border border-border rounded-2xl">
              <Mic className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No episodes yet. Check back soon.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.episodes.map((ep) => (
                <Link
                  key={ep.id}
                  href={`/podcast/${ep.slug}`}
                  className="block bg-card border border-border rounded-2xl p-5 md:p-6 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all group"
                >
                  <div className="flex flex-col sm:flex-row gap-5">
                    {/* Cover */}
                    <div className="w-full sm:w-32 sm:h-32 aspect-square rounded-xl overflow-hidden bg-primary/10 border border-border shrink-0 flex items-center justify-center">
                      {ep.coverImageUrl ? (
                        <img src={ep.coverImageUrl} alt={ep.title} className="w-full h-full object-cover" />
                      ) : (
                        <Mic className="w-10 h-10 text-primary/60" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {ep.title}
                      </h2>
                      {ep.description && (
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                          {ep.description.replace(/<[^>]+>/g, "")}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                        {ep.publishedAt && (
                          <span className="flex items-center gap-1.5">
                            <Calendar size={12} />
                            {format(new Date(ep.publishedAt), "MMM d, yyyy")}
                          </span>
                        )}
                        {ep.durationSec && (
                          <span className="flex items-center gap-1.5">
                            <Headphones size={12} />
                            {formatDuration(ep.durationSec)}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Headphones size={12} />
                          {ep.listenCount.toLocaleString()} plays
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Heart size={12} />
                          {ep.likeCount.toLocaleString()}
                        </span>
                        {ep.tags.slice(0, 3).map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium uppercase tracking-wider">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
