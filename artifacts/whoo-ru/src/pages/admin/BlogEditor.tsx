import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, Globe, Image as ImageIcon, X, Bold, Italic, Heading2, List, ListOrdered, Quote, Link2, Minus } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminCreatePost, useAdminUpdatePost } from "@/hooks/use-admin";
import { useGetAdminBlogPost } from "@workspace/api-client-react";

const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().max(160, "Excerpt must be under 160 characters").optional().default(""),
  body: z.string().optional().default(""),
  featuredImage: z.string().optional().default(""),
  status: z.enum(["draft", "published"]).default("draft"),
  hashtags: z.array(z.string()).default([]),
});

type PostForm = z.infer<typeof postSchema>;

function insertMarkdown(textarea: HTMLTextAreaElement, before: string, after: string = "") {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.substring(start, end);
  const replacement = before + (selected || "text") + after;
  textarea.setRangeText(replacement, start, end, "select");
  textarea.focus();
  const event = new Event("input", { bubbles: true });
  textarea.dispatchEvent(event);
}

export default function BlogEditor() {
  const [, params] = useRoute("/admin/blog/edit/:id");
  const [, setLocation] = useLocation();
  const isEditing = !!params?.id;
  const id = Number(params?.id);
  
  const [hashtagInput, setHashtagInput] = useState("");

  const { data: existingPost, isLoading: isLoadingPost } = useGetAdminBlogPost(id, {
    query: { enabled: isEditing }
  });

  const createPost = useAdminCreatePost();
  const updatePost = useAdminUpdatePost();

  const form = useForm<PostForm>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      body: "",
      featuredImage: "",
      status: "draft",
      hashtags: [],
    }
  });

  const watchTitle = form.watch("title");
  useEffect(() => {
    if (!isEditing && watchTitle) {
      form.setValue("slug", watchTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  }, [watchTitle, isEditing, form]);

  useEffect(() => {
    if (existingPost) {
      form.reset({
        title: existingPost.title,
        slug: existingPost.slug,
        excerpt: existingPost.excerpt || "",
        body: existingPost.body || "",
        featuredImage: existingPost.featuredImage || "",
        status: existingPost.status as "draft" | "published",
        hashtags: existingPost.hashtags || [],
      });
    }
  }, [existingPost, form]);

  const addHashtag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && hashtagInput.trim()) {
      e.preventDefault();
      const currentTags = form.getValues("hashtags");
      const newTag = hashtagInput.trim().replace(/^#/, '').toLowerCase();
      if (!currentTags.includes(newTag)) {
        form.setValue("hashtags", [...currentTags, newTag]);
      }
      setHashtagInput("");
    }
  };

  const removeHashtag = (tagToRemove: string) => {
    const currentTags = form.getValues("hashtags");
    form.setValue("hashtags", currentTags.filter(t => t !== tagToRemove));
  };

  const onSubmit = (data: PostForm) => {
    if (isEditing) {
      updatePost.mutate({ id, data }, {
        onSuccess: () => setLocation("/admin/blog")
      });
    } else {
      createPost.mutate({ data }, {
        onSuccess: () => setLocation("/admin/blog")
      });
    }
  };

  const handleToolbar = (action: string) => {
    const textarea = document.getElementById("body-editor") as HTMLTextAreaElement;
    if (!textarea) return;
    
    switch (action) {
      case "bold": insertMarkdown(textarea, "**", "**"); break;
      case "italic": insertMarkdown(textarea, "*", "*"); break;
      case "h2": insertMarkdown(textarea, "## "); break;
      case "ul": insertMarkdown(textarea, "- "); break;
      case "ol": insertMarkdown(textarea, "1. "); break;
      case "quote": insertMarkdown(textarea, "> "); break;
      case "link": insertMarkdown(textarea, "[", "](url)"); break;
      case "hr": insertMarkdown(textarea, "\n---\n"); break;
    }
    form.setValue("body", textarea.value);
  };

  if (isEditing && isLoadingPost) return <AdminLayout><div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div></AdminLayout>;

  return (
    <AdminLayout>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl mx-auto pb-24">
        <div className="flex items-center justify-between mb-8 sticky top-0 bg-background/95 backdrop-blur-md z-30 py-4 border-b border-border">
          <button 
            type="button" 
            onClick={() => setLocation("/admin/blog")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} /> Back to Posts
          </button>
          
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                form.setValue("status", "draft");
                form.handleSubmit(onSubmit)();
              }}
              disabled={createPost.isPending || updatePost.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-foreground hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              <Save size={18} /> Save Draft
            </button>
            <button
              type="button"
              onClick={() => {
                form.setValue("status", "published");
                form.handleSubmit(onSubmit)();
              }}
              disabled={createPost.isPending || updatePost.isPending}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 font-bold"
            >
              <Globe size={18} /> Publish
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6">
            <div>
              <input
                {...form.register("title")}
                placeholder="Post Title..."
                className="w-full bg-transparent text-4xl md:text-5xl font-bold text-foreground focus:outline-none placeholder:text-muted-foreground/50"
              />
              {form.formState.errors.title && <p className="text-destructive text-sm mt-2">{form.formState.errors.title.message}</p>}
            </div>
            
            <div className="flex items-center text-muted-foreground text-sm">
              <span className="px-3 py-1 bg-background border border-border rounded-l-md">/blog/</span>
              <input
                {...form.register("slug")}
                className="flex-1 bg-background border-y border-r border-border rounded-r-md px-3 py-1 focus:outline-none focus:border-primary text-foreground"
                placeholder="post-slug"
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
            <label className="flex items-center gap-2 text-foreground font-semibold mb-4">
              <ImageIcon size={18} /> Featured Image URL
            </label>
            <input
              {...form.register("featuredImage")}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
              placeholder="https://..."
            />
            {form.watch("featuredImage") && (
              <div className="mt-4 aspect-video w-full max-w-lg rounded-xl overflow-hidden border border-border bg-background">
                <img src={form.watch("featuredImage")} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
             <div className="flex justify-between mb-2">
               <label className="text-foreground font-semibold">Excerpt</label>
               <span className="text-xs text-muted-foreground">{form.watch("excerpt")?.length || 0}/160</span>
             </div>
             <textarea
              {...form.register("excerpt")}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground resize-none h-24"
              placeholder="Short summary for cards and SEO..."
            />
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-background/50 flex-wrap">
              {[
                { action: "bold", icon: Bold, label: "Bold" },
                { action: "italic", icon: Italic, label: "Italic" },
                { action: "h2", icon: Heading2, label: "Heading" },
                { action: "ul", icon: List, label: "Bullet List" },
                { action: "ol", icon: ListOrdered, label: "Numbered List" },
                { action: "quote", icon: Quote, label: "Quote" },
                { action: "link", icon: Link2, label: "Link" },
                { action: "hr", icon: Minus, label: "Divider" },
              ].map(({ action, icon: Icon, label }) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => handleToolbar(action)}
                  title={label}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition"
                >
                  <Icon size={18} />
                </button>
              ))}
            </div>
            <textarea
              id="body-editor"
              {...form.register("body")}
              className="w-full min-h-[400px] px-6 py-4 bg-transparent text-foreground focus:outline-none resize-y font-mono text-sm leading-relaxed"
              placeholder="Write your post in Markdown..."
            />
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
             <label className="text-foreground font-semibold mb-4 block">Hashtags</label>
             
             <div className="flex flex-wrap gap-2 mb-4">
                {form.watch("hashtags").map(tag => (
                  <span key={tag} className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-md text-sm font-medium border border-primary/20">
                    #{tag}
                    <button type="button" onClick={() => removeHashtag(tag)} className="hover:text-foreground ml-1">
                      <X size={14} />
                    </button>
                  </span>
                ))}
             </div>

             <input
              type="text"
              value={hashtagInput}
              onChange={(e) => setHashtagInput(e.target.value)}
              onKeyDown={addHashtag}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
              placeholder="Type tag and press Enter..."
            />
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
