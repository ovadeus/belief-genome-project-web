import { 
  useListBlogPosts, 
  useGetBlogPost,
  useGetRelatedPosts
} from "@workspace/api-client-react";

export function usePublicBlog(params: { page?: number, limit?: number, hashtag?: string, search?: string } = {}) {
  return useListBlogPosts(params, {
    query: {
      keepPreviousData: true,
    }
  });
}

export function usePublicBlogPost(slug: string) {
  return useGetBlogPost(slug, {
    query: {
      enabled: !!slug,
    }
  });
}

export function usePublicRelatedPosts(slug: string) {
  return useGetRelatedPosts(slug, {
    query: {
      enabled: !!slug,
    }
  });
}
