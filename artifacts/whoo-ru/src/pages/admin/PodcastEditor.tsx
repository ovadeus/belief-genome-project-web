import { useEffect, useRef, useState } from "react";
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
import { useMediaLibrary, useUploadMedia, getMediaUrl, type MediaItem } from "@/hooks/use-media";

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
  const [error, setError] = useState<string | null>(null);

  // Media library picker (mirrors BlogEditor)
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const mediaLibrary = useMediaLibrary(1);
  const uploadMedia = useUploadMedia();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const selectMedia = (media: MediaItem) => {
    setCover({ objectPath: media.objectPath, fileName: media.filename });
    setShowMediaPicker(false);
  };

  const handlePickerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const media = await uploadMedia.mutateAsync(file);
      selectMedia(media);
    } catch (err: any) {
      setError(err.message || "Cover upload failed");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
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

          {/* Cover image — choose from Media Library */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
              <ImageIcon size={18} className="text-primary" /> Cover image
            </h3>
            {cover ? (
              <div className="space-y-3">
                <img
                  src={getMediaUrl(cover.objectPath)}
                  alt="Cover"
                  className="w-full aspect-square object-cover rounded-xl border border-border"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowMediaPicker(true)}
                    className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-foreground transition-colors"
                  >
                    Change image
                  </button>
                  <button
                    type="button"
                    onClick={() => setCover(null)}
                    className="text-xs px-3 py-1.5 rounded-lg text-destructive hover:bg-destructive/10 flex items-center gap-1"
                  >
                    <X size={12} /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowMediaPicker(true)}
                className="w-full border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors"
              >
                <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-foreground font-medium">Choose from Media Library</p>
                <p className="text-xs text-muted-foreground mt-1">PNG / JPG, 1400×1400 ideal</p>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Media Library Picker Modal — mirrors BlogEditor */}
      {showMediaPicker && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowMediaPicker(false)}>
          <div className="bg-card border border-border rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
              <h3 className="font-semibold text-foreground text-lg">Choose Cover Image</h3>
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePickerUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadMedia.isPending}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:brightness-110 disabled:opacity-50"
                >
                  {uploadMedia.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Upload New
                </button>
                <button type="button" onClick={() => setShowMediaPicker(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-6">
              {mediaLibrary.isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : !mediaLibrary.data?.items.length ? (
                <div className="text-center py-12">
                  <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">No images uploaded yet</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-primary text-primary-foreground px-5 py-2 rounded-lg font-medium text-sm"
                  >
                    Upload Your First Image
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {mediaLibrary.data.items.map((media) => (
                    <button
                      key={media.id}
                      type="button"
                      onClick={() => selectMedia(media)}
                      className="aspect-square bg-background border border-border rounded-lg overflow-hidden hover:border-primary hover:ring-2 hover:ring-primary/30 transition-all"
                    >
                      <img
                        src={getMediaUrl(media.objectPath)}
                        alt={media.alt || media.filename}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
