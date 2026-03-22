import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BookOpen, CheckCircle2 } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useCreateEarlyBird } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const earlyBirdSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
});

type EarlyBirdForm = z.infer<typeof earlyBirdSchema>;

export default function Book() {
  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);
  
  const form = useForm<EarlyBirdForm>({
    resolver: zodResolver(earlyBirdSchema),
    defaultValues: { name: "", email: "" }
  });

  const joinMutation = useCreateEarlyBird({
    mutation: {
      onSuccess: () => {
        setIsSuccess(true);
        form.reset();
      },
      onError: (err) => {
        toast({ 
          title: "Error", 
          description: err?.data?.error || "Failed to join list. You might already be subscribed.", 
          variant: "destructive" 
        });
      }
    }
  });

  const onSubmit = (data: EarlyBirdForm) => {
    joinMutation.mutate({ data });
  };

  return (
    <PublicLayout>
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="order-2 lg:order-1 flex justify-center">
            <div className="relative w-full max-w-md perspective-[1000px]">
              {/* Glow effect behind book */}
              <div className="absolute inset-0 bg-secondary/20 blur-[100px] rounded-full" />
              
              <div className="relative bg-card border border-border/50 rounded-lg shadow-2xl overflow-hidden aspect-[3/4] transform rotate-y-[-10deg] rotate-x-[5deg] hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700 ease-out">
                {/* Book Cover Image */}
                <img 
                  src={`${import.meta.env.BASE_URL}images/book-cover.png`} 
                  alt="Belief Genome Project Book Cover" 
                  className="w-full h-full object-cover"
                />
                
                {/* Spine highlight */}
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-white/20 to-transparent" />
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary font-medium text-sm mb-6 border border-secondary/20">
              <BookOpen size={16} /> Forthcoming Publication
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight mb-6">
              The Belief Genome
            </h1>
            <p className="text-lg text-secondary/80 font-medium mb-4 tracking-wide">
              The Hidden Code That Shapes Every Decision You Make
            </p>

            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              A deep-dive into the Belief Genome Project framework, the research behind the 124 cognitive dimensions, and a practical guide to mapping your own belief genome in an age of artificial intelligence.
            </p>

            <div className="bg-card border border-border p-8 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-primary" />
              
              {isSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">You're on the list!</h3>
                  <p className="text-muted-foreground">We'll notify you the moment early copies become available.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Reserve Your Early Copy</h3>
                  <p className="text-muted-foreground mb-6">Join the early bird list to get exclusive chapter previews and release updates.</p>
                  
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <input
                        {...form.register("name")}
                        type="text"
                        placeholder="Your Name"
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                      />
                      {form.formState.errors.name && (
                        <p className="text-destructive text-sm mt-1">{form.formState.errors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <input
                        {...form.register("email")}
                        type="email"
                        placeholder="Your Email Address"
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                      />
                      {form.formState.errors.email && (
                        <p className="text-destructive text-sm mt-1">{form.formState.errors.email.message}</p>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={joinMutation.isPending}
                      className="w-full px-4 py-4 rounded-xl font-bold text-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {joinMutation.isPending ? "Joining..." : "Reserve My Copy"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Chapter Preview Teaser */}
      <section className="py-24 bg-background border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-display font-bold text-center mb-16">Excerpt: Chapter 1</h2>
          
          <div className="prose prose-invert prose-lg max-w-none prose-p:text-muted-foreground prose-p:leading-loose">
            <p>
              When we built the first cognitive models for what would become the Belief Genome Project, we assumed that people held beliefs like objects in a box. You could take one out, examine it, and perhaps replace it with a better one if evidence warranted it. 
            </p>
            <p>
              We were entirely wrong.
            </p>
            <blockquote className="border-l-4 border-secondary pl-6 py-2 my-8 text-xl font-medium text-foreground bg-secondary/5 rounded-r-xl">
              Beliefs are not objects. They are load-bearing walls in the architecture of identity. Removing one without understanding its structural purpose doesn't create enlightenment; it creates collapse.
            </blockquote>
            <p>
              The 124-dimension framework was born from this realization. To solve the wicked problems facing modern society—from political polarization to the alignment of artificial superintelligence—we first need a cartography of conviction. We need to map the genome of belief.
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
