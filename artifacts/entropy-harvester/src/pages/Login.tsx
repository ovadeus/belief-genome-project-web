import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EhLoginBody } from "@workspace/api-zod";
import { useEhLogin } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const login = useEhLogin();

  const form = useForm<z.infer<typeof EhLoginBody>>({
    resolver: zodResolver(EhLoginBody),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof EhLoginBody>) {
    login.mutate(
      { data: values },
      {
        onSuccess: () => {
          setLocation("/app/dashboard");
        },
        onError: (error) => {
          toast.error(error.message || "Invalid credentials");
        },
      }
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background p-4">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2">
        <span className="font-display font-bold text-xl">Entropy Harvester</span>
      </Link>

      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-2xl border shadow-sm">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground mt-2">Log in to your account to continue.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="researcher@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full h-12 text-base" disabled={login.isPending}>
              {login.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Log In
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
