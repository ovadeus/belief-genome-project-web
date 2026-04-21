import { useEffect, useRef, useState } from "react";
import { useRoute, Link } from "wouter";
import {
  Mic, Heart, Download, Share2, Calendar, Headphones, ChevronLeft,
  Play, Pause, Volume2, MessageCircle, Twitter, Facebook, Copy, Check,
} from "lucide-react";
import { format } from "date-fns";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import {
  usePodcastEpisode, usePodcastComments, useToggleLike,
  useLogListen, useLogDownload, usePostComment, formatDuration,
} from "@/hooks/use-podcasts";

export default function PodcastEpisode() {
  const [, params] = useRoute("/podcast/:slug");
  const slug = params?.slug;
  const { data: ep, isLoading } = usePodcastEpisode(slug);
  const { data: comments } = usePodcastComments(ep?.id);
  const toggleLike = useToggleLike(slug);
  const logListen = useLogListen();
  const logDownload = useLogDownload();
  const postComment = usePostComment(ep?.id);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loggedListen, setLoggedListen] = useState(false);

  // Comment form state
  const [authorName, setAuthorName] = useState("");
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState("");  // honeypot
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentOk, setCommentOk] = useState(false);

  // Share state
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => {
      setCurrentTime(a.currentTime);
      if (a.duration > 0) setProgress((a.currentTime / a.duration) * 100);
      // Log a listen after 5 seconds of play
      if (!loggedListen && a.currentTime > 5 && ep) {
        setLoggedListen(true);
        logListen.mutate(ep.id);
      }
    };
    const onEnd = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnd);
    };
  }, [ep?.id, loggedListen]);

  const [playError, setPlayError] = useState<string | null>(null);

  const togglePlay = async () => {
    const a = audioRef.current;
    if (!a) return;
    setPlayError(null);
    if (playing) { a.pause(); setPlaying(false); return; }
    try {
      await a.play();
      setPlaying(true);
    } catch (err: any) {
      setPlaying(false);
      const msg = err?.message || "Audio could not be played.";
      console.error("Audio play() failed:", err);
      setPlayError(`${msg} (Check that the audio file is accessible.)`);
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a || !a.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    a.currentTime = pct * a.duration;
  };

  const handleDownload = async () => {
    if (!ep || !ep.audioUrl) return;
    logDownload.mutate(ep.id);
    const a = document.createElement("a");
    a.href = ep.audioUrl;
    a.download = ep.audioFileName || `${ep.slug}.mp3`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleShareCopy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const submitComment = (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError(null);
    setCommentOk(false);
    if (authorName.trim().length < 2) { setCommentError("Name is required."); return; }
    if (body.trim().length < 5) { setCommentError("Comment must be at least 5 characters."); return; }
    postComment.mutate(
      { authorName: authorName.trim(), body: body.trim(), website },
      {
        onSuccess: () => {
          setBody(""); setWebsite("");
          setCommentOk(true);
          setTimeout(() => setCommentOk(false), 4000);
        },
        onError: (err: Error) => setCommentError(err.message),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background"><PublicNavbar /><div className="flex justify-center pt-40"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div></div>
    );
  }
  if (!ep) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <PublicNavbar />
        <div className="pt-40 text-center">
          <p className="text-muted-foreground mb-4">Episode not found.</p>
          <Link href="/podcast" className="text-primary hover:underline">← Back to all episodes</Link>
        </div>
      </div>
    );
  }

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(ep.title)}&url=${encodeURIComponent(shareUrl)}`;
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNavbar />

      <article className="pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Link href="/podcast" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ChevronLeft size={16} /> All episodes
          </Link>

          {/* Hero card */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
            <div className="flex flex-col sm:flex-row">
              <div className="w-full sm:w-48 aspect-square sm:aspect-auto bg-primary/10 flex items-center justify-center shrink-0">
                {ep.coverImageUrl ? (
                  <img src={ep.coverImageUrl} alt={ep.title} className="w-full h-full object-cover" />
                ) : (
                  <Mic className="w-16 h-16 text-primary/60" />
                )}
              </div>
              <div className="p-6 flex-1 min-w-0">
                <div className="flex items-center gap-2 text-primary text-xs uppercase tracking-wider font-medium mb-2">
                  <Mic size={12} /> Podcast Episode
                </div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">{ep.title}</h1>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {ep.publishedAt && (
                    <span className="flex items-center gap-1.5"><Calendar size={12} /> {format(new Date(ep.publishedAt), "MMMM d, yyyy")}</span>
                  )}
                  {ep.durationSec && (
                    <span className="flex items-center gap-1.5"><Headphones size={12} /> {formatDuration(ep.durationSec)}</span>
                  )}
                  <span className="flex items-center gap-1.5"><Headphones size={12} /> {ep.listenCount.toLocaleString()} plays</span>
                </div>
                {ep.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {ep.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium uppercase tracking-wider">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Audio player */}
            {ep.audioUrl && (
              <div className="border-t border-border p-4 bg-background/40">
                <audio
                  ref={audioRef}
                  src={ep.audioUrl}
                  preload="metadata"
                  onError={(e) => {
                    const a = e.currentTarget;
                    const code = a.error?.code;
                    const codeMsg = code === 1 ? "aborted" : code === 2 ? "network error" : code === 3 ? "decode error" : code === 4 ? "format not supported" : "unknown";
                    setPlayError(`Audio failed to load (${codeMsg}). The file may be missing or the URL may be wrong.`);
                    setPlaying(false);
                  }}
                />
                {playError && (
                  <div className="mb-3 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                    {playError}
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <button
                    onClick={togglePlay}
                    className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/20 shrink-0"
                    aria-label={playing ? "Pause" : "Play"}
                  >
                    {playing ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="h-2 bg-foreground/10 rounded-full cursor-pointer overflow-hidden" onClick={seek}>
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1.5 font-mono">
                      <span>{formatDuration(Math.floor(currentTime))}</span>
                      <span>{ep.durationSec ? formatDuration(ep.durationSec) : "—"}</span>
                    </div>
                  </div>
                  <Volume2 size={18} className="text-muted-foreground hidden sm:block" />
                </div>
              </div>
            )}

            {/* Action bar */}
            <div className="border-t border-border px-4 py-3 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleLike.mutate(ep.id)}
                  disabled={toggleLike.isPending}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    ep.liked ? "bg-destructive/10 text-destructive" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                  }`}
                >
                  <Heart size={16} fill={ep.liked ? "currentColor" : "none"} />
                  <span>{ep.likeCount}</span>
                </button>
                {ep.audioUrl && (
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-foreground/5 hover:text-foreground transition-colors"
                  >
                    <Download size={16} />
                    <span>{ep.downloadCount}</span>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground mr-1.5 hidden sm:inline">Share</span>
                <a href={tweetUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" aria-label="Share on Twitter">
                  <Twitter size={16} />
                </a>
                <a href={fbUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" aria-label="Share on Facebook">
                  <Facebook size={16} />
                </a>
                <button onClick={handleShareCopy} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" aria-label="Copy link">
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
                <button
                  onClick={() => navigator.share && navigator.share({ title: ep.title, url: shareUrl }).catch(() => {})}
                  className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  aria-label="Share"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          {ep.description && (
            <div className="bg-card border border-border rounded-2xl p-6 mb-6">
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">Episode notes</h2>
              <div
                className="prose prose-sm max-w-none text-foreground/90 leading-relaxed [&_a]:text-primary [&_a]:underline whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: ep.description }}
              />
            </div>
          )}

          {/* Comments */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <MessageCircle size={18} className="text-primary" />
              Comments {comments?.comments.length ? `(${comments.comments.length})` : ""}
            </h2>

            {/* Form */}
            <form onSubmit={submitComment} className="space-y-3 mb-6 pb-6 border-b border-border">
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Your name"
                required
                maxLength={80}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Share your thoughts…"
                required
                maxLength={2000}
                rows={3}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
              />
              {/* Honeypot — hidden from real users, attractive to bots */}
              <input
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ position: "absolute", left: "-10000px", width: 1, height: 1, opacity: 0 }}
              />
              {commentError && <p className="text-sm text-destructive">{commentError}</p>}
              {commentOk && <p className="text-sm text-green-600">Thanks — your comment is posted.</p>}
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">{body.length} / 2000</span>
                <button
                  type="submit"
                  disabled={postComment.isPending}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {postComment.isPending ? "Posting…" : "Post comment"}
                </button>
              </div>
            </form>

            {/* List */}
            {!comments?.comments.length ? (
              <p className="text-sm text-muted-foreground text-center py-4">Be the first to comment.</p>
            ) : (
              <div className="space-y-4">
                {comments.comments.map((c) => (
                  <div key={c.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="font-semibold text-foreground text-sm">{c.authorName}</span>
                      <span className="text-xs text-muted-foreground">{format(new Date(c.createdAt), "MMM d, yyyy · h:mm a")}</span>
                    </div>
                    <p className="text-foreground/90 text-sm whitespace-pre-wrap leading-relaxed">{c.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
