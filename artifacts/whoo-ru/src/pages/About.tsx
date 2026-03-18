import { PublicLayout } from "@/components/layout/PublicLayout";
import { motion } from "framer-motion";
import { BookOpen, Code, Brain, Lightbulb, Target, Telescope } from "lucide-react";

const milestones = [
  { year: "2022", title: "The Spark", description: "The Wizard of Oz moment — a startling encounter with the question that refuses to be ignored: Who are you, really?" },
  { year: "2023", title: "Framework Design", description: "Development of the 124 psychological dimensions that form the Belief Genome architecture." },
  { year: "2024", title: "Desktop App Alpha", description: "First working prototype of the WhooRU desktop application for macOS." },
  { year: "2024", title: "Forecaster Engine", description: "The predictive belief engine reaches functional accuracy across core dimension clusters." },
  { year: "2025", title: "Public Beta", description: "WhooRU desktop app released as a free public beta for macOS users." },
  { year: "2025", title: "Research Publication", description: "First research papers on the Belief Genome framework submitted for peer review." },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function About() {
  return (
    <PublicLayout>
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <motion.div {...fadeUp}>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            About <span className="text-primary">WhooRU</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            WhooRU began with a single, startling moment — the kind most people spend their entire lives avoiding.
          </p>
        </motion.div>

        <motion.div {...fadeUp} transition={{ delay: 0.15 }} className="mb-16">
          <div className="bg-card border border-border rounded-2xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-32 h-32 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Brain className="w-16 h-16 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">The Founder</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The Belief Genome Project is spearheaded by David Edwin Meyers, a creative polymath, researcher, developer, and writer who has spent over two decades exploring the intersection of psychology, technology, and human self-understanding.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  After years of working across creative disciplines, a single realization crystallized: every problem we face as individuals and as a species ultimately traces back to beliefs we have never examined at a quantum level. The Belief Genome Project was born from the conviction that self-knowledge, made precise and measurable, is a missing variable in every equation we've tried to solve.
                </p>
              </div>
            </div>
          </div>
        </motion.div>


        <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-6">The Origin Story</h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-muted-foreground leading-relaxed mb-4">
              There is a moment in <em>The Wizard of Oz</em> — dramatic, thundering, impossible to ignore — when the great Wizard turns to Dorothy and her companions and demands to know: <strong className="text-foreground">"Who are you?"</strong>
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The room shakes. Smoke fills the air. And for just a moment, everyone freezes. Because being truly asked that question — and being expected to actually answer it — is one of the most startling experiences a human being can face.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Most of us never face that moment. We define ourselves through roles, relationships, achievements, and affiliations. We perform identity rather than examine it. We curate versions of ourselves for different audiences without ever asking which version is real — or whether any of them are.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              WhooRU exists because that question deserves more than a performance. It deserves a framework, a methodology, and a technology precise enough to map the real answer — the layered, dimensional, evolving architecture of what you actually believe about yourself, the world, and your place in it.
            </p>
          </div>
        </motion.div>

        <motion.div {...fadeUp} transition={{ delay: 0.4 }} className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-6">The Research Mission</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Target, title: "Map", text: "Develop precise, dimensional measurements of human belief architecture at the individual level." },
              { icon: Lightbulb, title: "Understand", text: "Illuminate the hidden patterns that drive human decisions, conflicts, and connections." },
              { icon: Telescope, title: "Transform", text: "Build the infrastructure for genuine AI alignment and collective intelligence at scale." },
            ].map((item) => (
              <div key={item.title} className="bg-card border border-border rounded-2xl p-6">
                <item.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div {...fadeUp} transition={{ delay: 0.5 }}>
          <h2 className="text-3xl font-bold text-foreground mb-8">Development Timeline</h2>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative flex gap-6 pl-4"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center shrink-0 z-10">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <div className="pb-2">
                    <span className="text-xs font-mono text-primary tracking-wider">{m.year}</span>
                    <h3 className="text-lg font-bold text-foreground mt-1">{m.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{m.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>
    </PublicLayout>
  );
}
