import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Compass, Users } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { TripleHelixCanvas } from "@/components/ui/TripleHelixCanvas";
import { usePublicBlog } from "@/hooks/use-blog";
import { format } from "date-fns";

export default function Home() {
  const { data: blogData } = usePublicBlog({ limit: 3 });

  return (
    <PublicLayout>
      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center pt-10 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
            alt="" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
        </div>

        <div className="absolute inset-0 z-[1] opacity-40 pointer-events-none flex items-center justify-center">
          <div className="w-[600px] h-[700px]">
            <TripleHelixCanvas />
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="text-center"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-display font-bold tracking-tight text-white mb-8 leading-[1.1]">
              A Systematic Exploration of
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Human Belief
              </span>.
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground font-light leading-relaxed mb-12 max-w-3xl mx-auto">
              The solutions to humanity's wicked problems will not come from data alone. They begin with a new capacity to understand the polarized beliefs humans hold at both micro and macro scales, and the shifting patterns that forecast into the future.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href="/about"
                className="px-8 py-4 rounded-xl font-semibold text-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                Learn More
                <ArrowRight size={20} />
              </Link>
              <Link 
                href="/subscribe"
                className="px-8 py-4 rounded-xl font-semibold text-lg bg-card/50 backdrop-blur-sm border border-white/10 hover:border-white/20 text-white transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                Follow the Research
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* WHAT IS BGP */}
      <section className="py-24 bg-background relative border-t border-border">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-8">
            What is the <span className="text-primary">Belief Genome Project</span>?
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            The Belief Genome Project is a psychometric framework and visualization engine designed to map the 124 dimensions of your cognitive, emotional, and philosophical worldview. We examine human beliefs as quantum bits (qubits) holding superpositions that change over time. It is a quantified reflection of your mind, heart, and soul.
          </p>
        </div>
      </section>

      {/* THREE PILLARS */}
      <section className="py-24 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "Belief Genome",
                desc: "Discover your ideological DNA across 124 precise psychometric dimensions, plotting exactly where you stand.",
                color: "text-primary",
                bg: "bg-primary/10"
              },
              {
                icon: Compass,
                title: "Self Mapping",
                desc: "Navigate your own internal contradictions. Understand why you react the way you do to external stimuli.",
                color: "text-secondary",
                bg: "bg-secondary/10"
              },
              {
                icon: Users,
                title: "AI Alignment",
                desc: "Train your future AI companions to intimately understand you by giving them the precise coordinates of your worldview.",
                color: "text-accent",
                bg: "bg-accent/10"
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="bg-card border border-border p-8 rounded-3xl hover:border-border/80 hover:shadow-2xl hover:shadow-black/20 transition-all group"
              >
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-2xl font-display font-bold text-foreground mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FORECASTER PREVIEW */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card border border-border rounded-[2.5rem] p-8 md:p-16 flex flex-col lg:flex-row items-center gap-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="flex-1 z-10">
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">The Forecaster</h2>
              <p className="text-xl text-muted-foreground mb-8">
                What if you could predict your own reactions? The Forecaster within the desktop app uses your Belief Genome to model how you'll respond to new information, news, and complex situations before they even happen.
              </p>
              <Link href="/app" className="text-primary font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                Explore the Desktop App <ArrowRight size={18} />
              </Link>
            </div>
            
            <div className="flex-1 w-full max-w-md bg-background border border-border rounded-2xl p-6 shadow-2xl relative z-10">
              <div className="space-y-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="font-medium text-foreground">Cognitive Flexibility</span>
                  <span className="text-primary font-bold">84%</span>
                </div>
                <div className="h-3 bg-card rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: '84%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                  />
                </div>
                
                <div className="flex justify-between items-end mb-2 mt-6">
                  <span className="font-medium text-foreground">Authority Skepticism</span>
                  <span className="text-secondary font-bold">62%</span>
                </div>
                <div className="h-3 bg-card rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: '62%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-secondary to-accent rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LATEST BLOG POSTS */}
      <section className="py-24 bg-card/20 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold">Research & Insights</h2>
              <p className="text-muted-foreground mt-2">The latest dispatches from the framework.</p>
            </div>
            <Link href="/blog" className="hidden sm:flex text-primary hover:text-primary/80 font-medium items-center gap-2">
              View All Posts <ArrowRight size={18} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogData?.posts?.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                <article className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all h-full flex flex-col">
                  {post.featuredImage ? (
                    <div className="aspect-[16/9] w-full overflow-hidden">
                      <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] w-full bg-background border-b border-border flex items-center justify-center">
                       <Brain className="w-12 h-12 text-muted/30" />
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {post.hashtags?.slice(0, 2).map(tag => (
                        <span key={tag} className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-md">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
                      {post.excerpt}
                    </p>
                    <div className="text-xs text-muted-foreground font-medium pt-4 border-t border-border">
                      {post.publishedAt ? format(new Date(post.publishedAt), 'MMM d, yyyy') : ''} 
                      {post.readTimeMins && ` · ${post.readTimeMins} min read`}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
          <Link href="/blog" className="sm:hidden mt-8 w-full py-4 bg-card border border-border rounded-xl text-center font-medium block">
            View All Posts
          </Link>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 relative overflow-hidden border-t border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-display font-bold text-white mb-6">
            The Curtain Is Already Pulled Back.
          </h2>
          <p className="text-2xl text-muted-foreground mb-12 font-light">
            The only question is whether you are ready to look.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/app"
              className="px-8 py-4 rounded-xl font-semibold text-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
            >
              Download BGP App
            </Link>
            <Link 
              href="/book"
              className="px-8 py-4 rounded-xl font-semibold text-lg bg-transparent border-2 border-secondary text-white hover:bg-secondary/10 transition-all"
            >
              Preorder the Book
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
