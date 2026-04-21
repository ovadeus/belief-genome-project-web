import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Save, ArrowLeft, Upload, Mic, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  useAdminPodcastEpisode,
  useAdminCreatePodcast,
  useAdminUpdatePodcast,
  uploadAsset,
  formatDuration,
  type AdminPodcastEpisode,
} from "@/hooks/use-podcasts";

export default function PodcastEditor() {
  const [, params] = useRoute("/admin/podcast/edit/:id");
  const [, navigate] = useLocation();
  const id = params?.id ? parseInt(params.id, 10) : undefined;
  const isEdit = !!id;

  const { data: existing } = useAdminPodcastEpisode(id);
  const create = useAdminCreatePodcast();
  const update = useAdminUpdatePodcast();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");

  const [audio, setAudio] = useState<{ objectPath: string; fileName: string; mimeType: string; bytes: number; durationSec?: number } | null>(null);
  const [cover, setCover] = useState<{ objectPath: string; fileName: string } | null>(null);
  const [audioUploading, setAudioUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!existing) return;
    setTitle(existing.title);
    setSlug(existing.slug);
    setDescription(existing.description || "");
    setTagsInput((existing.tags || []).join(", "));
    setStatus(existing.status);
    if (existing.audioObjectPath) {
      setAudio({
        objectPath: existing.audioObjectPath,
        fileName: existing.audioFileName || "audio",
        mimeType: existing.audioMimeType || "audio/mpeg",
        bytes: existing.audioBytes || 0,
        durationSec: existing.durationSec || undefined,
      });
    }
    if (existing.coverImagePath) {
      setCover({ objectPath: existing.coverImagePath, fileName: "cover" });
    }
  }, [existing]);

  // Auto-slug from title when creating new
  useEffect(() => {
    if (!isEdit && title && !slug) {
      setSlug(title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-"));
    }
  }, [title, isEdit]);

  const handleAudioUpload = async (file: File) => {
    setError(null);
    setAudioUploading(true);
    try {
      const asset = await uploadAsset(file);
      // Probe duration via temporary <audio>
      const url = URL.createObjectURL(file);
      const a = document.createElement("audio");
      a.src = url;
      const durationSec = await new Promise<number | undefined>((resolve) => {
        a.addEventListener("loadedmetadata", () => resolve(Math.round(a.duration)));
        a.addEventListener("error", () => resolve(undefined));
        setTimeout(() => resolve(undefined), 8000);
      });
      URL.revokeObjectURL(url);
      setAudio({ ...asset, durationSec });
    } catch (e: any) {
      setError(e.message || "Audio upload failed");
    } finally {
      setAudioUploading(false);
    }
  };

  const handleCoverUpload = async (file: File) => {
    setError(null);
    setCoverUploading(true);
    try {
      const asset = await uploadAsset(file);
      setCover({ objectPath: asset.objectPath, fileName: asset.fileName });
    } catch (e: any) {
      setError(e.message || "Cover upload failed");
    } finally {
      setCoverUploading(false);
    }
  };

  const handleSave = async (publishNow?: boolean) => {
    setError(null);
    if (!title.trim()) { setError("Title is required."); return; }
    const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
    const finalStatus = publishNow ? "published" : status;
    const payload: Partial<AdminPodcastEpisode> = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      description: description.trim() || null,
      tags,
      status: finalStatus,
      audioObjectPath: audio?.objectPath || null,
      audioFileName: audio?.fileName || null,
      audioMimeType: audio?.mimeType || null,
      audioBytes: audio?.bytes || null,
      durationSec: audio?.durationSec || null,
      coverImagePath: cover?.objectPath || null,
    };
    try {
      if (isEdit && id) {
        await update.mutateAsync({ id, data: payload });
      } else {
        await create.mutateAsync(payload);
      }
      navigate("/admin/podcast");
    } catch (e: any) {
      setError(e.message || "Save failed");
    }
  };

  const saving = create.isPending || update.isPending;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin/podcast")} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">{isEdit ? "Edit Episode" : "New Episode"}</h1>
            <p className="text-muted-foreground text-sm">{isEdit ? "Update this podcast episode." : "Upload audio and write episode notes."}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl bg-card border border-border text-foreground font-medium hover:bg-foreground/5 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving || !audio}
            className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Publish
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Episode 12 — On the Architecture of Doubt"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="episode-12-architecture-of-doubt"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Episode notes</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What this episode is about, guest bios, links, timestamps…"
                rows={10}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
              />
              <p className="text-xs text-muted-foreground mt-1">HTML allowed. Plain text and line breaks render as written.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Tags (comma-separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="philosophy, identity, interview"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>
        </div>

        {/* Side column — uploads */}
        <div className="space-y-6">
          {/* Audio uploader */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
              <Mic size={18} className="text-primary" /> Audio
            </h3>
            {audio ? (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-background border border-border">
                  <p className="text-sm text-foreground font-medium truncate">{audio.fileName}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(audio.bytes / 1024 / 1024).toFixed(2)} MB · {formatDuration(audio.durationSec)}
                  </p>
                </div>
                <button
                  onClick={() => setAudio(null)}
                  className="text-xs text-destructive hover:underline flex items-center gap-1"
                >
                  <X size={12} /> Remove
                </button>
              </div>
            ) : (
              <label className="block">
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors">
                  {audioUploading ? (
                    <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-foreground font-medium">Upload mp3 / wav / m4a</p>
                      <p className="text-xs text-muted-foreground mt-1">Up to ~500MB</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleAudioUpload(e.target.files[0])}
                />
              </label>
            )}
          </div>

          {/* Cover uploader */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
              <ImageIcon size={18} className="text-primary" /> Cover image
            </h3>
            {cover ? (
              <div className="space-y-3">
                <img
                  src={`/api/storage${cover.objectPath}`}
                  alt="Cover"
                  className="w-full aspect-square object-cover rounded-xl border border-border"
                />
                <button
                  onClick={() => setCover(null)}
                  className="text-xs text-destructive hover:underline flex items-center gap-1"
                >
                  <X size={12} /> Remove
                </button>
              </div>
            ) : (
              <label className="block">
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors">
                  {coverUploading ? (
                    <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-foreground font-medium">Upload square image</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG / JPG, 1400×1400 ideal</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleCoverUpload(e.target.files[0])}
                />
              </label>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
