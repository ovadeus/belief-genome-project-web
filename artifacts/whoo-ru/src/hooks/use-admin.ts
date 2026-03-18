import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetAdminStats,
  useListAdminBlogPosts,
  useCreateBlogPost,
  useUpdateBlogPost,
  useDeleteBlogPost,
  useToggleBlogPostStatus,
  useListSubscribers,
  useDeleteSubscriber,
  useListEarlyBird,
  useDeleteEarlyBird,
  useGetSettings,
  useUpdateSettings,
  useChangeAdminPassword,
  getListAdminBlogPostsQueryKey,
  getGetAdminStatsQueryKey,
  getListSubscribersQueryKey,
  getListEarlyBirdQueryKey,
  getGetSettingsQueryKey
} from "@workspace/api-client-react";
import { useToast } from "./use-toast";

// Analytics
export function useDashboardStats() {
  return useGetAdminStats();
}

// Blog Admin
export function useAdminBlogPosts(params: { page?: number, limit?: number } = {}) {
  return useListAdminBlogPosts(params);
}

export function useAdminCreatePost() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useCreateBlogPost({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAdminBlogPostsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
        toast({ title: "Post created", description: "Your blog post was successfully created." });
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message || "Failed to create post", variant: "destructive" });
      }
    }
  });
}

export function useAdminUpdatePost() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useUpdateBlogPost({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAdminBlogPostsQueryKey() });
        toast({ title: "Post updated", description: "Changes saved successfully." });
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message || "Failed to update post", variant: "destructive" });
      }
    }
  });
}

export function useAdminDeletePost() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useDeleteBlogPost({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAdminBlogPostsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
        toast({ title: "Post deleted", description: "The blog post has been removed." });
      }
    }
  });
}

export function useAdminTogglePostStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useToggleBlogPostStatus({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListAdminBlogPostsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
        toast({ title: "Status updated", description: `Post is now ${data.status}.` });
      }
    }
  });
}

// Subscribers Admin
export function useAdminSubscribers(params: { page?: number, limit?: number, search?: string, source?: string } = {}) {
  return useListSubscribers(params);
}

export function useAdminDeleteSubscriber() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useDeleteSubscriber({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSubscribersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
        toast({ title: "Subscriber removed", description: "The subscriber has been deleted." });
      }
    }
  });
}

// Early Bird Admin
export function useAdminEarlyBird(params: { page?: number, limit?: number } = {}) {
  return useListEarlyBird(params);
}

export function useAdminDeleteEarlyBird() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useDeleteEarlyBird({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListEarlyBirdQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
        toast({ title: "Entry removed", description: "The early bird signup has been deleted." });
      }
    }
  });
}

// Settings
export function useAdminSettings() {
  return useGetSettings();
}

export function useAdminUpdateSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useUpdateSettings({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
        toast({ title: "Settings saved", description: "Site settings updated successfully." });
      }
    }
  });
}

export function useAdminChangePassword() {
  const { toast } = useToast();
  
  return useChangeAdminPassword({
    mutation: {
      onSuccess: () => {
        toast({ title: "Password changed", description: "Your admin password has been updated." });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to change password. Check your current password.", variant: "destructive" });
      }
    }
  });
}
