import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EhSignupBody } from "@workspace/api-zod";
import { useEhSignup } from "@workspace/api-client-react";
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

export default function Signup() {
  const [, setLocation] = useLocation();
  const signup = useEhSignup();

  const form = useForm<z.infer<typeof EhSignupBody>>({
    resolver: zodResolver(EhSignupBody),
    defaultValues: {
      orgName: "",
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof EhSignupBody>) {
    signup.mutate(
      { data: values },
      {
        onSuccess: () => {
          toast.success("Account created successfully");
          setLocation("/app/dashboard");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to create account");
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
          <h1 className="font-display text-3xl font-bold tracking-tight">Create an account</h1>
          <p className="text-muted-foreground mt-2">Sign up your organization to start harvesting.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="orgName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Research" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <Button type="submit" className="w-full h-12 text-base" disabled={signup.isPending}>
              {signup.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Sign Up
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
