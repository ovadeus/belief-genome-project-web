import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import faviconImg from "/favicon.png";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const { login } = useAuth();
  
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" }
  });

  const onSubmit = (data: LoginForm) => {
    login.mutate({ data });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <Link href="/" className="flex items-center gap-3 mb-12 relative z-10 hover:opacity-80 transition-opacity">
        <img src={faviconImg} alt="BGP" className="w-10 h-10" />
        <span className="font-display text-4xl font-bold text-foreground">BGP Admin</span>
      </Link>

      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-2xl relative z-10">
        <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Secure Access</h2>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Username</label>
            <input
              {...form.register("username")}
              type="text"
              inputMode="text"
              autoComplete="username"
              autoCapitalize="off"
              autoCorrect="off"
              enterKeyHint="next"
              placeholder="Enter username"
              className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground text-base"
            />
            {form.formState.errors.username && (
              <p className="text-destructive text-sm mt-1">{form.formState.errors.username.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Password</label>
            <input
              {...form.register("password")}
              type="password"
              inputMode="text"
              autoComplete="current-password"
              enterKeyHint="go"
              placeholder="Enter password"
              className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground text-base"
            />
            {form.formState.errors.password && (
              <p className="text-destructive text-sm mt-1">{form.formState.errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={login.isPending}
            className="w-full px-4 py-4 rounded-xl font-bold text-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 mt-4"
          >
            {login.isPending ? "Authenticating..." : "Login to Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
