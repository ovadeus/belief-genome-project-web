import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, Globe, Image as ImageIcon, X, Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Link2, Minus, Upload, Loader2, Lock, AlignLeft, AlignCenter, AlignRight, ChevronDown, ChevronRight, Palette, Code, Frame } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminCreatePost, useAdminUpdatePost } from "@/hooks/use-admin";
import { useGetAdminBlogPost } from "@workspace/api-client-react";
import { useMediaLibrary, useUploadMedia, getMediaUrl } from "@/hooks/use-media";
import type { MediaItem } from "@/hooks/use-media";

const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().max(160, "Excerpt must be under 160 characters").optional().default(""),
  body: z.string().optional().default(""),
  featuredImage: z.string().optional().default(""),
  status: z.enum(["draft", "published"]).default("draft"),
  hashtags: z.array(z.string()).default([]),
  isPrivate: z.boolean().default(false),
  visibility: z.enum(["public", "subscribers", "admin"]).default("public"),
  customCss: z.string().optional().default(""),
  customJs: z.string().optional().default(""),
});

type PostForm = z.infer<typeof postSchema>;

function insertHtml(textarea: HTMLTextAreaElement, before: string, after: string = "") {
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
  const [showMediaPicker, setShowMediaPicker] = useState<"featured" | "inline" | null>(null);
  const [showIframePicker, setShowIframePicker] = useState(false);
  const [uploadingAsset, setUploadingAsset] = useState(false);
  const [blogAssetFiles, setBlogAssetFiles] = useState<{ filename: string; url: string }[]>([]);
  const [showStyleEditor, setShowStyleEditor] = useState(false);
  const [showJsEditor, setShowJsEditor] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaLibrary = useMediaLibrary(1);
  const uploadMedia = useUploadMedia();

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
      isPrivate: false,
      customCss: "",
      customJs: "",
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
        isPrivate: existingPost.isPrivate ?? false,
        customCss: existingPost.customCss || "",
        customJs: existingPost.customJs || "",
      });
      if (existingPost.customCss) setShowStyleEditor(true);
      if (existingPost.customJs) setShowJsEditor(true);
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

  const selectMedia = (media: MediaItem) => {
    const url = getMediaUrl(media.objectPath);
    if (showMediaPicker === "featured") {
      form.setValue("featuredImage", url);
    } else if (showMediaPicker === "inline") {
      const textarea = document.getElementById("body-editor") as HTMLTextAreaElement;
      if (textarea) {
        const imgTag = `\n<img src="${url}" alt="${media.alt || media.filename}" style="width:100%; border-radius:12px; margin:1.5rem 0;" />\n`;
        const pos = textarea.selectionStart;
        textarea.setRangeText(imgTag, pos, pos, "end");
        textarea.focus();
        form.setValue("body", textarea.value);
      }
    }
    setShowMediaPicker(null);
  };

  const handlePickerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const media = await uploadMedia.mutateAsync(file);
      selectMedia(media);
    } catch {}
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleToolbar = (action: string) => {
    const textarea = document.getElementById("body-editor") as HTMLTextAreaElement;
    if (!textarea) return;
    
    switch (action) {
      case "bold": insertHtml(textarea, "<strong>", "</strong>"); break;
      case "italic": insertHtml(textarea, "<em>", "</em>"); break;
      case "h1": insertHtml(textarea, "<h1>", "</h1>"); break;
      case "h2": insertHtml(textarea, "<h2>", "</h2>"); break;
      case "h3": insertHtml(textarea, "<h3>", "</h3>"); break;
      case "ul": insertHtml(textarea, "<ul>\n  <li>", "</li>\n</ul>"); break;
      case "ol": insertHtml(textarea, "<ol>\n  <li>", "</li>\n</ol>"); break;
      case "quote": insertHtml(textarea, "<blockquote>", "</blockquote>"); break;
      case "link": insertHtml(textarea, '<a href="url">', "</a>"); break;
      case "image": setShowMediaPicker("inline"); return;
      case "iframe": {
        fetch("/api/blog-assets", { credentials: "include" })
          .then(r => r.json())
          .then(data => {
            setBlogAssetFiles(data.files || []);
            setShowIframePicker(true);
          });
        return;
      }
      case "hr": {
        const pos = textarea.selectionStart;
        textarea.setRangeText("\n<hr />\n", pos, pos, "end");
        textarea.focus();
        const ev = new Event("input", { bubbles: true });
        textarea.dispatchEvent(ev);
        break;
      }
      case "align-left":
      case "align-center":
      case "align-right": {
        const align = action.replace("align-", "");
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = textarea.value.substring(start, end) || "text";
        const wrapped = `<div style="text-align: ${align};">${selected}</div>`;
        textarea.setRangeText(wrapped, start, end, "end");
        textarea.focus();
        const ev = new Event("input", { bubbles: true });
        textarea.dispatchEvent(ev);
        break;
      }
    }
    form.setValue("body", textarea.value);
  };

  const [assetError, setAssetError] = useState("");

  const handleAssetUpload = async (file: File) => {
    if (!file.name.match(/\.(html|htm)$/i)) {
      setAssetError("Only .html files are allowed");
      return;
    }
    setUploadingAsset(true);
    setAssetError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/blog-assets/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(err.error || "Upload failed");
      }
      const refreshRes = await fetch("/api/blog-assets", { credentials: "include" });
      const data = await refreshRes.json();
      setBlogAssetFiles(data.files || []);
    } catch (e: any) {
      setAssetError(e.message || "Upload failed");
    } finally {
      setUploadingAsset(false);
    }
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
              <ImageIcon size={18} /> Featured Image
            </label>
            <div className="flex gap-2">
              <input
                {...form.register("featuredImage")}
                className="flex-1 px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
                placeholder="https://... or choose from media library"
              />
              <button
                type="button"
                onClick={() => setShowMediaPicker("featured")}
                className="px-4 py-3 bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary/20 transition-colors font-medium text-sm whitespace-nowrap"
              >
                Browse Media
              </button>
            </div>
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
            <button
              type="button"
              onClick={() => setShowStyleEditor(!showStyleEditor)}
              className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-border"
            >
              {showStyleEditor ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <Palette size={16} className="text-violet-400" />
              <span className="text-sm font-semibold text-foreground">Custom CSS</span>
              {form.watch("customCss") && (
                <span className="ml-auto text-xs text-violet-400 bg-violet-400/10 px-2 py-0.5 rounded-full">active</span>
              )}
            </button>
            {showStyleEditor && (
              <div className="p-4 border-b border-border bg-background/30">
                <textarea
                  {...form.register("customCss")}
                  className="w-full min-h-[150px] px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-violet-400 text-foreground resize-y font-mono text-sm leading-relaxed"
                  placeholder={`/* Custom styles for this post */\nh1 { color: #6c8fff; }\n.highlight { background: rgba(108,143,255,0.1); padding: 1rem; border-radius: 8px; }`}
                />
                <p className="text-xs text-muted-foreground mt-2">Styles are scoped to this post and injected inside the content frame.</p>
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background/50">
              <div className="flex items-center gap-1 flex-wrap">
                {[
                  { action: "bold", icon: Bold, label: "Bold" },
                  { action: "italic", icon: Italic, label: "Italic" },
                  { action: "h1", icon: Heading1, label: "Heading 1" },
                  { action: "h2", icon: Heading2, label: "Heading 2" },
                  { action: "h3", icon: Heading3, label: "Heading 3" },
                  { action: "ul", icon: List, label: "Bullet List" },
                  { action: "ol", icon: ListOrdered, label: "Numbered List" },
                  { action: "quote", icon: Quote, label: "Blockquote" },
                  { action: "link", icon: Link2, label: "Link" },
                  { action: "image", icon: ImageIcon, label: "Insert Image" },
                  { action: "iframe", icon: Frame, label: "Insert iFrame" },
                  { action: "hr", icon: Minus, label: "Divider" },
                  { action: "align-left", icon: AlignLeft, label: "Align Left" },
                  { action: "align-center", icon: AlignCenter, label: "Align Center" },
                  { action: "align-right", icon: AlignRight, label: "Align Right" },
                ].map(({ action, icon: Icon, label }) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => handleToolbar(action)}
                    title={label}
                    className={`p-2 rounded-lg hover:text-foreground hover:bg-white/5 transition ${action === "iframe" ? "text-cyan-400" : "text-muted-foreground"}`}
                  >
                    <Icon size={18} />
                  </button>
                ))}
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium flex items-center gap-1.5 ml-3 shrink-0">
                <Code size={14} /> HTML
              </span>
            </div>
            <textarea
              id="body-editor"
              {...form.register("body")}
              className="w-full min-h-[400px] px-6 py-4 bg-transparent text-foreground focus:outline-none resize-y font-mono text-sm leading-relaxed"
              placeholder="Write your post HTML here..."
            />
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowJsEditor(!showJsEditor)}
              className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-border"
            >
              {showJsEditor ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <Code size={16} className="text-cyan-400" />
              <span className="text-sm font-semibold text-foreground">Custom JavaScript</span>
              {form.watch("customJs") && (
                <span className="ml-auto text-xs text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full">active</span>
              )}
            </button>
            {showJsEditor && (
              <div className="p-4 border-b border-border bg-background/30">
                <textarea
                  {...form.register("customJs")}
                  className="w-full min-h-[150px] px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-cyan-400 text-foreground resize-y font-mono text-sm leading-relaxed"
                  placeholder={`// Custom JavaScript for this post\ndocument.querySelectorAll('.toggle').forEach(el => {\n  el.addEventListener('click', () => el.classList.toggle('open'));\n});`}
                />
                <p className="text-xs text-muted-foreground mt-2">JavaScript runs inside the post frame after the content loads.</p>
              </div>
            )}
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

          <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4">
              <Lock size={18} className="text-muted-foreground" />
              <span className="text-foreground font-semibold">Visibility</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {([
                { value: "public", label: "Public", desc: "Everyone can see", color: "emerald" },
                { value: "subscribers", label: "Subscribers", desc: "Subscribers & Admin", color: "amber" },
                { value: "admin", label: "Admin Only", desc: "Only Admin can see", color: "red" },
              ] as const).map((opt) => {
                const selected = form.watch("visibility") === opt.value;
                const borderColor = selected
                  ? opt.color === "emerald" ? "border-emerald-500/40" : opt.color === "amber" ? "border-amber-500/40" : "border-red-500/40"
                  : "border-border";
                const bgColor = selected
                  ? opt.color === "emerald" ? "bg-emerald-500/10" : opt.color === "amber" ? "bg-amber-500/10" : "bg-red-500/10"
                  : "bg-background";
                const textColor = selected
                  ? opt.color === "emerald" ? "text-emerald-400" : opt.color === "amber" ? "text-amber-400" : "text-red-400"
                  : "text-muted-foreground";
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      form.setValue("visibility", opt.value);
                      form.setValue("isPrivate", opt.value !== "public");
                    }}
                    className={`flex flex-col items-center gap-1 p-4 rounded-xl border-2 transition-all ${borderColor} ${bgColor} hover:opacity-90`}
                  >
                    <span className={`text-sm font-bold ${textColor}`}>{opt.label}</span>
                    <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </form>

      {showMediaPicker && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowMediaPicker(null)}>
          <div className="bg-card border border-border rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
              <h3 className="font-semibold text-foreground text-lg">
                {showMediaPicker === "featured" ? "Choose Featured Image" : "Insert Image"}
              </h3>
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
                <button type="button" onClick={() => setShowMediaPicker(null)} className="text-muted-foreground hover:text-foreground">
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

      {showIframePicker && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowIframePicker(false)}>
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full max-h-[60vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
              <h3 className="font-semibold text-foreground text-lg flex items-center gap-2">
                <Frame size={20} className="text-primary" /> Insert iFrame
              </h3>
              <button type="button" onClick={() => setShowIframePicker(false)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <input
                  type="file"
                  accept=".html,.htm"
                  className="hidden"
                  id="asset-upload-input"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAssetUpload(file);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => document.getElementById("asset-upload-input")?.click()}
                  disabled={uploadingAsset}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 hover:bg-cyan-500/5 transition-all text-cyan-400 text-sm font-medium disabled:opacity-50"
                >
                  {uploadingAsset ? (
                    <><Loader2 size={16} className="animate-spin" /> Uploading...</>
                  ) : (
                    <><Upload size={16} /> Upload HTML File</>
                  )}
                </button>
                {assetError && (
                  <p className="text-red-400 text-xs mt-2 text-center">{assetError}</p>
                )}
              </div>
              {blogAssetFiles.length === 0 ? (
                <div className="text-center py-6">
                  <Frame className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No HTML files yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Upload an <code>.html</code> file above to get started.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {blogAssetFiles.map((file) => (
                    <button
                      key={file.filename}
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById("body-editor") as HTMLTextAreaElement;
                        if (textarea) {
                          const iframeTag = `\n<iframe src="${file.url}" style="width:100%; min-height:600px; border:none; border-radius:12px;" loading="lazy"></iframe>\n`;
                          const pos = textarea.selectionStart;
                          textarea.setRangeText(iframeTag, pos, pos, "end");
                          textarea.focus();
                          const ev = new Event("input", { bubbles: true });
                          textarea.dispatchEvent(ev);
                          form.setValue("body", textarea.value);
                        }
                        setShowIframePicker(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Code size={18} className="text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-foreground font-medium text-sm truncate">{file.filename}</p>
                        <p className="text-xs text-muted-foreground truncate">{file.url}</p>
                      </div>
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
