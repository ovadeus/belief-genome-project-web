import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminSettings, useAdminUpdateSettings, useAdminChangePassword } from "@/hooks/use-admin";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Save, Lock } from "lucide-react";

export default function AdminSettings() {
  const { data: settings, isLoading } = useAdminSettings();
  const updateSettings = useAdminUpdateSettings();
  const changePassword = useAdminChangePassword();

  const { register: regSettings, handleSubmit: handleSettings, reset: resetSettings } = useForm();
  const { register: regPw, handleSubmit: handlePw, reset: resetPw } = useForm<{ currentPassword: string; newPassword: string }>();

  useEffect(() => {
    if (settings) {
      resetSettings(settings);
    }
  }, [settings, resetSettings]);

  const onSaveSettings = (data: any) => {
    updateSettings.mutate({ data });
  };

  const onChangePassword = (data: { currentPassword: string; newPassword: string }) => {
    changePassword.mutate({ data }, {
      onSuccess: () => resetPw()
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>

        <form onSubmit={handleSettings(onSaveSettings)} className="bg-card border border-border rounded-2xl p-8 space-y-6">
          <h2 className="text-lg font-bold text-foreground">Site Settings</h2>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Tagline</label>
            <input {...regSettings("tagline")} className="w-full bg-background border border-input rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">App Download URL</label>
            <input {...regSettings("appDownloadUrl")} className="w-full bg-background border border-input rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary outline-none" placeholder="https://..." />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Twitter/X URL</label>
              <input {...regSettings("twitterUrl")} className="w-full bg-background border border-input rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">LinkedIn URL</label>
              <input {...regSettings("linkedinUrl")} className="w-full bg-background border border-input rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">GitHub URL</label>
              <input {...regSettings("githubUrl")} className="w-full bg-background border border-input rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary outline-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={updateSettings.isPending}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:brightness-110 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {updateSettings.isPending ? "Saving..." : "Save Settings"}
          </button>
        </form>

        <form onSubmit={handlePw(onChangePassword)} className="bg-card border border-border rounded-2xl p-8 space-y-6">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Change Password
          </h2>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Current Password</label>
            <input {...regPw("currentPassword", { required: true })} type="password" className="w-full bg-background border border-input rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">New Password</label>
            <input {...regPw("newPassword", { required: true, minLength: 8 })} type="password" className="w-full bg-background border border-input rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary outline-none" />
          </div>

          <button
            type="submit"
            disabled={changePassword.isPending}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:brightness-110 transition disabled:opacity-50"
          >
            {changePassword.isPending ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
