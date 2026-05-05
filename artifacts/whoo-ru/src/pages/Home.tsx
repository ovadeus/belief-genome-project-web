import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Compass, Users } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { TripleHelixCanvas } from "@/components/ui/TripleHelixCanvas";
import { ProbeWaveInterference } from "@/components/ProbeWaveInterference";
import { usePublicBlog } from "@/hooks/use-blog";
import { format } from "date-fns";
import bgpScreen01 from "@assets/bgp-screen01_1777227170316.png";
import bgpScreen02 from "@assets/bgp-screen02_1777227170315.png";
import bgpScreen03 from "@assets/bgp-screen03_1777227170315.png";
import bgpScreen04 from "@assets/bgp-screen04_1777227170315.png";
import bgpScreen05 from "@assets/bgp-screen05_1777227170314.png";
import bgpScreen06 from "@assets/bgp-screen06_1777227341782.png";
import bgpScreen07 from "@assets/bgp-screen07_1777227338455.png";
import bgpScreen08 from "@assets/bgp-screen08_1777227338455.png";
import bgpScreen09 from "@assets/bgp-screen09_1777227610719.png";
import bgpScreen10 from "@assets/bgp-screen10_1777227610719.png";
import bgpScreen11 from "@assets/bgp-screen11_1777227610718.png";

const BGP_SCREENS: { src: string; alt: string }[] = [
  { src: bgpScreen01, alt: "Belief DNA — dimensional grid across 11 categories" },
  { src: bgpScreen02, alt: "Triple Helix — Logos, Pathos, and Ethos visualization" },
  { src: bgpScreen03, alt: "Neuromap — 3D belief network in motion" },
  { src: bgpScreen04, alt: "World View Radar — ideological position plot" },
  { src: bgpScreen05, alt: "Mind Map — cross-category belief connections" },
  { src: bgpScreen06, alt: "Category Breakdown — pole-to-pole belief positioning" },
  { src: bgpScreen07, alt: "Timeline — belief drift over time" },
  { src: bgpScreen08, alt: "Evolution — confidence, coverage, and category trends" },
  { src: bgpScreen09, alt: "History — searchable archive of past responses" },
  { src: bgpScreen10, alt: "Compare — import another DNA to compare with yours" },
  { src: bgpScreen11, alt: "Forecaster — AI-powered belief prediction engine" },
];

const GENOME_APP_URL = (
  (import.meta.env.VITE_GENOME_APP_URL as string | undefined) || "/genome-app/"
).replace(/\/$/, "");

export default function Home() {
  const { data: blogData } = usePublicBlog({ limit: 3 });
  const [screenIdx, setScreenIdx] = useState(0);
  const [aspectRatios, setAspectRatios] = useState<Record<number, number>>({});

  useEffect(() => {
    BGP_SCREENS.forEach((s, i) => {
      const img = new Image();
      img.onload = () => {
        setAspectRatios((prev) =>
          prev[i] ? prev : { ...prev, [i]: img.naturalHeight / img.naturalWidth }
        );
      };
      img.src = s.src;
    });
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setScreenIdx((i) => (i + 1) % BGP_SCREENS.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, []);

  const currentAspect = aspectRatios[screenIdx] ?? 0.78;

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

        <div className="absolute inset-0 z-[1] opacity-75 pointer-events-none flex items-center justify-center">
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
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-display font-bold tracking-tight text-foreground mb-8 leading-[1.1]">
              A Systematic Exploration of
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Human Belief
              </span>.
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground font-light leading-relaxed mb-12 max-w-3xl mx-auto">
              The Belief Genome Project is a new paradigm in behavioral science — a Quantum-Cognitive Measurement Architecture built to map the interior tensions of belief. It honors the foundational lineage of decision science and quantum cognition, and it extends that lineage into territory the field has not yet occupied: an operational instrument for measuring human belief in superposition.
            </p>
            
            <div className="flex justify-center">
              <a
                href="https://beliefgenomeproject.org/genome-app/register"
                className="px-10 py-4 rounded-xl font-semibold text-lg tracking-[0.15em] uppercase bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:-translate-y-0.5 flex items-center justify-center gap-3"
              >
                Join the Project
                <ArrowRight size={20} />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* WHAT IS BGP */}
      <section className="py-24 bg-background relative border-t border-border">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="academic-eyebrow">I · Overview</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-8">
            What is the <span className="text-primary">Belief Genome Project</span>?
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            The Belief Genome Project is a psychometric framework and visualization engine designed to map the 124 dimensions of your cognitive, emotional, and philosophical worldview. We examine human beliefs by entropy harvesting quantum bits (qubits) holding superpositions that change over time. It is a quantified reflection of your mind, heart, and soul.
          </p>

          {/* SCREEN CAROUSEL */}
          <div className="mt-16 mx-auto w-full" style={{ maxWidth: 980 }}>
            <motion.div
              className="relative w-full rounded-xl border border-border/40 shadow-2xl shadow-black/40 overflow-hidden bg-card/40"
              animate={{ paddingBottom: `${currentAspect * 100}%` }}
              transition={{ duration: 1.0, ease: [0.4, 0, 0.2, 1] }}
            >
              {BGP_SCREENS.map((s, i) => (
                <motion.img
                  key={i}
                  src={s.src}
                  alt={s.alt}
                  draggable={false}
                  initial={false}
                  animate={{ opacity: i === screenIdx ? 1 : 0 }}
                  transition={{ duration: 1.0, ease: "easeInOut" }}
                  className="absolute inset-0 w-full h-full object-contain select-none"
                  style={{ pointerEvents: i === screenIdx ? "auto" : "none" }}
                />
              ))}
            </motion.div>

            <div className="flex justify-center items-center gap-1.5 sm:gap-2.5 mt-6">
              {BGP_SCREENS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setScreenIdx(i)}
                  aria-label={`Show screen ${i + 1}`}
                  aria-current={i === screenIdx}
                  className={`h-1.5 w-1.5 sm:h-2.5 sm:w-2.5 rounded-full transition-colors duration-300 ${
                    i === screenIdx
                      ? "bg-primary"
                      : "bg-neutral-700 hover:bg-neutral-500"
                  }`}
                />
              ))}
            </div>
          </div>
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

      {/* FORECASTER + INTERACTIVE BELIEF SUPERPOSITION — paired in one card */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card border border-border rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden">
            {/* Soft glows in opposite corners tie the two halves together visually */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

            {/* Top half — Forecaster intro + sample dimensions */}
            <div className="flex flex-col lg:flex-row items-center gap-16 relative z-10">
              <div className="flex-1">
                <span className="academic-eyebrow">II · Capability</span>
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">The Forecaster</h2>
                <p className="text-xl text-muted-foreground mb-8">
                  What if you could predict your own reactions? The Forecaster uses your Belief Genome DNA to model how you'll respond to new information, news, and complex situations before they even happen.
                </p>
                <Link href={`${GENOME_APP_URL}/register`} className="text-primary font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                  Start Mapping Your Beliefs <ArrowRight size={18} />
                </Link>
              </div>

              <div className="flex-1 w-full max-w-md bg-background border border-border rounded-2xl p-6 shadow-2xl">
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

            {/* Soft divider between the two halves */}
            <div className="relative z-10 my-12 md:my-16 border-t border-border" />

            {/* Bottom half — interactive belief-superposition demo */}
            <div className="relative z-10 mb-10 max-w-3xl">
              <h3 className="text-3xl md:text-4xl font-display font-bold mb-6">
                A Belief in Superposition
              </h3>
              <p className="text-xl text-muted-foreground">
                Each probe is a small wave on a belief dimension. Drag the sliders to move where a probe points (position) and how its question is framed (phase). The bold curve is your combined belief; the faint shaded fill behind it is the probability of where it would land if you had to commit right now. Hit <em>Force collapse</em> to make it choose.
              </p>
            </div>

            <div className="relative z-10 bg-background border border-border rounded-2xl p-6 md:p-10 shadow-2xl">
              <ProbeWaveInterference />
            </div>
          </div>
        </div>
      </section>

      {/* LATEST BLOG POSTS */}
      <section className="py-24 bg-card/20 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="academic-eyebrow">III · Field Notes</span>
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

          <div className="flex justify-center mt-12">
            <Link
              href="/subscribe"
              className="px-8 py-3 rounded-full font-semibold text-sm bg-foreground/10 hover:bg-foreground/20 text-foreground transition-colors border border-border"
            >
              Subscribe to Updates
            </Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 relative overflow-hidden border-t border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <span className="academic-eyebrow">IV · Invitation</span>
          <h2 className="text-5xl md:text-6xl font-display font-bold text-foreground mb-6">
            The Curtain Is Already Pulled Back.
          </h2>
          <p className="text-2xl text-muted-foreground mb-12 font-light">
            The only question is whether you are ready to look.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href={`${GENOME_APP_URL}/register`}
              className="px-8 py-4 rounded-xl font-semibold text-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
            >
              Get Started — Free
            </Link>
            <Link 
              href="/book"
              className="px-8 py-4 rounded-xl font-semibold text-lg bg-transparent border-2 border-secondary text-foreground hover:bg-secondary/10 transition-all"
            >
              Preorder the Book
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
