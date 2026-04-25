import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API = "/api";

export type PodcastEpisode = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  audioUrl: string | null;
  audioFileName: string | null;
  durationSec: number | null;
  coverImageUrl: string | null;
  tags: string[];
  publishedAt: string | null;
  listenCount: number;
  downloadCount: number;
  likeCount: number;
  liked: boolean;
};

export type AdminPodcastEpisode = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  audioObjectPath: string | null;
  audioFileName: string | null;
  audioMimeType: string | null;
  audioBytes: number | null;
  durationSec: number | null;
  coverImagePath: string | null;
  tags: string[];
  status: "draft" | "published";
  publishedAt: string | null;
  listenCount: number;
  downloadCount: number;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
};

export type PodcastComment = {
  id: number;
  episodeId: number;
  authorName: string;
  body: string;
  createdAt: string;
};

export type AdminComment = PodcastComment & {
  status: "approved" | "pending" | "spam";
  episodeTitle: string | null;
  episodeSlug: string | null;
};

// ─── Public ─────────────────────────────────────────────────────────────────
export function usePodcastEpisodes() {
  return useQuery<{ episodes: PodcastEpisode[] }>({
    queryKey: ["podcasts"],
    queryFn: async () => {
      const r = await fetch(`${API}/podcasts`);
      if (!r.ok) throw new Error("Failed to load podcasts");
      return r.json();
    },
  });
}

export function usePodcastEpisode(slug: string | undefined) {
  return useQuery<PodcastEpisode>({
    queryKey: ["podcast", slug],
    enabled: !!slug,
    queryFn: async () => {
      const r = await fetch(`${API}/podcasts/${slug}`);
      if (!r.ok) throw new Error("Episode not found");
      return r.json();
    },
  });
}

export function usePodcastComments(episodeId: number | undefined) {
  return useQuery<{ comments: PodcastComment[] }>({
    queryKey: ["podcast-comments", episodeId],
    enabled: !!episodeId,
    queryFn: async () => {
      const r = await fetch(`${API}/podcasts/${episodeId}/comments`);
      if (!r.ok) throw new Error("Failed to load comments");
      return r.json();
    },
  });
}

export function useToggleLike(slug: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (episodeId: number) => {
      const r = await fetch(`${API}/podcasts/${episodeId}/like`, { method: "POST" });
      if (!r.ok) throw new Error("Failed");
      return r.json() as Promise<{ liked: boolean }>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["podcast", slug] });
      qc.invalidateQueries({ queryKey: ["podcasts"] });
    },
  });
}

export function useLogListen() {
  return useMutation({
    mutationFn: async (episodeId: number) => {
      await fetch(`${API}/podcasts/${episodeId}/listen`, { method: "POST" });
    },
  });
}

export function useLogDownload() {
  return useMutation({
    mutationFn: async (episodeId: number) => {
      await fetch(`${API}/podcasts/${episodeId}/download`, { method: "POST" });
    },
  });
}

export function usePostComment(episodeId: number | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { authorName: string; body: string; website?: string }) => {
      const r = await fetch(`${API}/podcasts/${episodeId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.error || "Failed to post comment");
      }
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["podcast-comments", episodeId] });
    },
  });
}

// ─── Admin ──────────────────────────────────────────────────────────────────
export function useAdminPodcastEpisodes() {
  return useQuery<{ episodes: AdminPodcastEpisode[] }>({
    queryKey: ["admin-podcasts"],
    queryFn: async () => {
      const r = await fetch(`${API}/admin/podcasts`, { credentials: "include" });
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
  });
}

export function useAdminPodcastEpisode(id: number | undefined) {
  return useQuery<AdminPodcastEpisode>({
    queryKey: ["admin-podcast", id],
    enabled: !!id,
    queryFn: async () => {
      const r = await fetch(`${API}/admin/podcasts/${id}`, { credentials: "include" });
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
  });
}

export function useAdminCreatePodcast() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<AdminPodcastEpisode>) => {
      const r = await fetch(`${API}/admin/podcasts`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!r.ok) throw new Error("Create failed");
      return r.json() as Promise<AdminPodcastEpisode>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-podcasts"] }),
  });
}

export function useAdminUpdatePodcast() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<AdminPodcastEpisode> }) => {
      const r = await fetch(`${API}/admin/podcasts/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!r.ok) throw new Error("Update failed");
      return r.json() as Promise<AdminPodcastEpisode>;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["admin-podcasts"] });
      qc.invalidateQueries({ queryKey: ["admin-podcast", vars.id] });
    },
  });
}

export function useAdminDeletePodcast() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(`${API}/admin/podcasts/${id}`, { method: "DELETE", credentials: "include" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-podcasts"] }),
  });
}

export function useAdminTogglePodcastStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(`${API}/admin/podcasts/${id}/toggle-status`, {
        method: "PATCH", credentials: "include",
      });
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-podcasts"] }),
  });
}

export function useAdminPodcastAnalytics() {
  return useQuery<{
    totals: { total: number; published: number; drafts: number; listens: number; downloads: number; likes: number };
    topEpisodes: Array<{ id: number; slug: string; title: string; listenCount: number; downloadCount: number; likeCount: number; publishedAt: string | null }>;
    series: Array<{ date: string; listens: number; downloads: number }>;
  }>({
    queryKey: ["admin-podcast-analytics"],
    queryFn: async () => {
      const r = await fetch(`${API}/admin/podcasts/analytics`, { credentials: "include" });
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
  });
}

export function useAdminPodcastComments(status: string = "all") {
  return useQuery<{ comments: AdminComment[] }>({
    queryKey: ["admin-podcast-comments", status],
    queryFn: async () => {
      const r = await fetch(`${API}/admin/podcasts/comments?status=${status}`, { credentials: "include" });
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
  });
}

export function useAdminUpdateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const r = await fetch(`${API}/admin/podcasts/comments/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-podcast-comments"] }),
  });
}

export function useAdminDeleteComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(`${API}/admin/podcasts/comments/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!r.ok) throw new Error("Failed");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-podcast-comments"] }),
  });
}

// ─── Audio upload (audio + cover) — reuses storage presigned-URL flow ──────
export type UploadedAsset = { objectPath: string; fileName: string; mimeType: string; bytes: number };

/**
 * Pre-flight check on an audio file picked for upload.
 *
 * The HTML5 `<audio>` element on the public episode page can't play a few
 * container variants that *look* like normal audio files but actually carry
 * fragmented/streaming layouts. The biggest offender is "DASH-fragmented MP4"
 * (a `.m4a` whose ftyp brand is literally `dash`) — Safari refuses it and
 * Chrome is unreliable. We sniff the file header here so the user gets an
 * instant, clear message instead of waiting through a multi-megabyte upload
 * only to find the player won't render it.
 *
 * We're conservative — only reject the specific known-bad case. Anything we
 * don't recognize is allowed through; the player's onError handler is the
 * final safety net.
 */
export async function validateAudioFile(
  file: File,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (file.size < 16) {
    return { ok: false, reason: "File is too small to be a valid audio file." };
  }
  let buf: Uint8Array;
  try {
    buf = new Uint8Array(await file.slice(0, 32).arrayBuffer());
  } catch {
    return { ok: true }; // Couldn't read header — let the upload proceed.
  }
  const td = new TextDecoder("ascii");
  // ISO Base Media (MP4 / M4A): bytes 4-7 = "ftyp", bytes 8-11 = major brand.
  if (td.decode(buf.subarray(4, 8)) === "ftyp") {
    const brand = td.decode(buf.subarray(8, 12));
    if (brand === "dash") {
      return {
        ok: false,
        reason:
          "This M4A is in DASH streaming format, which browsers can't play directly. " +
          "Please re-export the file as MP3 (or as a standard progressive M4A) " +
          "and upload again. A quick way: drag the file into Audacity (or any audio " +
          "editor) and export it as MP3 at 128 kbps.",
      };
    }
  }
  return { ok: true };
}

export async function uploadAsset(file: File): Promise<UploadedAsset> {
  // Catch DASH-fragmented MP4s and other known-unplayable formats *before*
  // requesting an upload URL — saves the user a multi-megabyte upload.
  const v = await validateAudioFile(file);
  if (!v.ok) throw new Error(v.reason);

  const u = await fetch(`${API}/storage/uploads/request-url`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
  });
  if (!u.ok) throw new Error("Failed to get upload URL");
  const { uploadURL, objectPath } = await u.json();

  const up = await fetch(uploadURL, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!up.ok) throw new Error("Upload failed");

  return { objectPath, fileName: file.name, mimeType: file.type, bytes: file.size };
}

export function formatDuration(sec: number | null | undefined): string {
  if (!sec || sec <= 0) return "—";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
