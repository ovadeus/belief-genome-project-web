import { PublicLayout } from "@/components/layout/PublicLayout";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useCreateSubscriber } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Mail, BookOpen, Bell, Sparkles } from "lucide-react";
import { useState } from "react";

const benefits = [
  { icon: BookOpen, title: "Research Updates", description: "Be the first to learn about new findings from the Belief Genome framework." },
  { icon: Bell, title: "App Releases", description: "Get notified when new WhooRU features and updates are available." },
  { icon: Sparkles, title: "Book Progress", description: "Follow the development of the WhooRU book and secure your early bird copy." },
  { icon: Mail, title: "Blog Digests", description: "Curated highlights from the WhooRU blog delivered to your inbox." },
];

export default function Subscribe() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<{ name: string; email: string }>();

  const subscribe = useCreateSubscriber({
    mutation: {
      onSuccess: () => {
        setSubmitted(true);
        reset();
      },
      onError: (err: any) => {
        const message = err?.data?.error || "Something went wrong. Please try again.";
        toast({ title: "Error", description: message, variant: "destructive" });
      }
    }
  });

  const onSubmit = (data: { name: string; email: string }) => {
    subscribe.mutate({ data: { ...data, source: "newsletter" } });
  };

  return (
    <PublicLayout>
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Follow the <span className="text-primary">Research</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Updates on the framework, the app, and the findings. No noise. Only signal.
          </p>
        </motion.div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-primary/30 rounded-2xl p-12 text-center max-w-xl mx-auto"
          >
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">You're In</h2>
            <p className="text-muted-foreground">
              Welcome to the WhooRU research community. You'll receive updates on the framework, app releases, and research findings.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-xl mx-auto mb-16"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="bg-card border border-border rounded-2xl p-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                  <input
                    {...register("name")}
                    className="w-full bg-background border border-input rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
                  <input
                    {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" } })}
                    type="email"
                    className="w-full bg-background border border-input rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="you@example.com"
                  />
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                </div>
                <button
                  type="submit"
                  disabled={subscribe.isPending}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {subscribe.isPending ? "Subscribing..." : "Subscribe"}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 flex gap-4"
            >
              <b.icon className="w-8 h-8 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-foreground mb-1">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
