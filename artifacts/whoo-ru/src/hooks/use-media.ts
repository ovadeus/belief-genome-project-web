import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = "/api";

interface MediaItem {
  id: number;
  filename: string;
  objectPath: string;
  contentType: string;
  size: number;
  alt: string | null;
  createdAt: string;
}

interface MediaListResponse {
  items: MediaItem[];
  total: number;
  page: number;
  totalPages: number;
}

export function useMediaLibrary(page = 1) {
  return useQuery<MediaListResponse>({
    queryKey: ["admin-media", page],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/media?page=${page}&limit=20`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch media");
      return res.json();
    },
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const urlRes = await fetch(`${API_BASE}/storage/uploads/request-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          contentType: file.type,
        }),
      });
      if (!urlRes.ok) throw new Error("Failed to get upload URL");
      const { uploadURL, objectPath } = await urlRes.json();

      const uploadRes = await fetch(uploadURL, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("Failed to upload file");

      const mediaRes = await fetch(`${API_BASE}/admin/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          filename: file.name,
          objectPath,
          contentType: file.type,
          size: file.size,
        }),
      });
      if (!mediaRes.ok) throw new Error("Failed to save media record");
      return mediaRes.json() as Promise<MediaItem>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_BASE}/admin/media/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete media");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
    },
  });
}

export function getMediaUrl(objectPath: string): string {
  return `${API_BASE}/storage${objectPath}`;
}

export type { MediaItem };
