import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { Plus, Edit2, Trash2, Globe, FileEdit, Lock, Search } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminBlogPosts, useAdminDeletePost, useAdminTogglePostStatus } from "@/hooks/use-admin";

export default function BlogList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { data, isLoading } = useAdminBlogPosts({ page, limit: 20, search: search || undefined, status: statusFilter || undefined });
  const deletePost = useAdminDeletePost();
  const toggleStatus = useAdminTogglePostStatus();

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Blog Posts</h1>
          <p className="text-muted-foreground">Manage your publication content.</p>
        </div>
        <Link 
          href="/admin/blog/new" 
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          <Plus size={18} /> New Post
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search posts by title or content..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-card border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-background/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium text-muted-foreground text-sm">Title</th>
                <th className="px-6 py-4 font-medium text-muted-foreground text-sm">Status</th>
                <th className="px-6 py-4 font-medium text-muted-foreground text-sm">Date</th>
                <th className="px-6 py-4 font-medium text-muted-foreground text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Loading...</td></tr>
              ) : data?.posts?.length === 0 ? (
                <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No posts found. Create one!</td></tr>
              ) : (
                data?.posts?.map((post) => (
                  <tr key={post.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-foreground mb-1 flex items-center gap-2">
                        {post.title}
                        {post.isPrivate && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            <Lock size={10} /> Private
                          </span>
                        )}
                      </p>
                      <div className="flex gap-2 text-xs">
                        <span className="text-muted-foreground">/{post.slug}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleStatus.mutate({ id: post.id })}
                        disabled={toggleStatus.isPending}
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider active:scale-95 transition-all border ${
                          post.status === 'published' 
                            ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20' 
                            : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20'
                        }`}
                      >
                        {post.status === 'published' ? <Globe size={14} /> : <FileEdit size={14} />}
                        {post.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {format(new Date(post.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Link 
                          href={`/admin/blog/edit/${post.id}`}
                          className="p-3 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg active:scale-90 transition-all"
                        >
                          <Edit2 size={18} />
                        </Link>
                        <button 
                          onClick={() => {
                            if(window.confirm('Are you sure you want to delete this post?')) {
                              deletePost.mutate({ id: post.id });
                            }
                          }}
                          className="p-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg active:scale-90 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Simple Pagination */}
        {data && data.totalPages > 1 && (
          <div className="p-4 border-t border-border flex justify-between items-center bg-background/50">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded bg-card border border-border text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground">Page {page} of {data.totalPages}</span>
            <button 
              onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="px-3 py-1.5 rounded bg-card border border-border text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
