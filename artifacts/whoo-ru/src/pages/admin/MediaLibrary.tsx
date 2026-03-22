import { useState, useRef, useCallback } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useMediaLibrary, useUploadMedia, useDeleteMedia, getMediaUrl } from "@/hooks/use-media";
import type { MediaItem } from "@/hooks/use-media";
import { useToast } from "@/hooks/use-toast";
import { Upload, Trash2, Copy, Check, ImageIcon, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

export default function MediaLibrary() {
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data, isLoading } = useMediaLibrary(page);
  const upload = useUploadMedia();
  const deleteMedia = useDeleteMedia();

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        toast({ title: "Invalid file", description: `${file.name} is not an image`, variant: "destructive" });
        continue;
      }
      try {
        await upload.mutateAsync(file);
        toast({ title: "Uploaded", description: `${file.name} uploaded successfully` });
      } catch {
        toast({ title: "Upload failed", description: `Failed to upload ${file.name}`, variant: "destructive" });
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [upload, toast]);

  const handleCopyUrl = (media: MediaItem) => {
    const url = `${window.location.origin}${getMediaUrl(media.objectPath)}`;
    navigator.clipboard.writeText(url);
    setCopiedId(media.id);
    toast({ title: "Copied", description: "Image URL copied to clipboard" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyMarkdown = (media: MediaItem) => {
    const url = getMediaUrl(media.objectPath);
    const md = `![${media.alt || media.filename}](${url})`;
    navigator.clipboard.writeText(md);
    toast({ title: "Copied", description: "Markdown image tag copied to clipboard" });
  };

  const handleDelete = async (media: MediaItem) => {
    if (!confirm(`Delete ${media.filename}?`)) return;
    try {
      await deleteMedia.mutateAsync(media.id);
      setSelectedMedia(null);
      toast({ title: "Deleted", description: `${media.filename} removed` });
    } catch {
      toast({ title: "Error", description: "Failed to delete image", variant: "destructive" });
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Media Library</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data ? `${data.total} image${data.total !== 1 ? "s" : ""}` : "Loading..."}
          </p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={upload.isPending}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold hover:brightness-110 transition-all disabled:opacity-50"
          >
            {upload.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Upload Images
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : !data?.items.length ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl">
          <ImageIcon className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-lg text-muted-foreground mb-2">No images yet</p>
          <p className="text-sm text-muted-foreground/70 mb-6">Upload images to use in your blog posts</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold hover:brightness-110 transition-all"
          >
            Upload Your First Image
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {data.items.map((media) => (
              <div
                key={media.id}
                onClick={() => setSelectedMedia(media)}
                className={`group relative aspect-square bg-card border rounded-xl overflow-hidden cursor-pointer transition-all hover:border-primary ${
                  selectedMedia?.id === media.id ? "border-primary ring-2 ring-primary/30" : "border-border"
                }`}
              >
                <img
                  src={getMediaUrl(media.objectPath)}
                  alt={media.alt || media.filename}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-end">
                  <div className="w-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs truncate">{media.filename}</p>
                    <p className="text-white/70 text-xs">{formatSize(media.size)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-border hover:bg-white/5 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {data.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="p-2 rounded-lg border border-border hover:bg-white/5 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {selectedMedia && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedMedia(null)}>
          <div className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-video bg-black/50 flex items-center justify-center overflow-hidden rounded-t-2xl">
              <img
                src={getMediaUrl(selectedMedia.objectPath)}
                alt={selectedMedia.alt || selectedMedia.filename}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-foreground text-lg">{selectedMedia.filename}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatSize(selectedMedia.size)} &middot; {selectedMedia.contentType}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCopyUrl(selectedMedia)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm hover:bg-white/5 transition-colors"
                >
                  {copiedId === selectedMedia.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  Copy URL
                </button>
                <button
                  onClick={() => handleCopyMarkdown(selectedMedia)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm hover:bg-white/5 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copy Markdown
                </button>
                <button
                  onClick={() => handleDelete(selectedMedia)}
                  disabled={deleteMedia.isPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-destructive/50 text-destructive text-sm hover:bg-destructive/10 transition-colors ml-auto"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
