import { PublicLayout } from "@/components/layout/PublicLayout";
import { motion } from "framer-motion";
import { ArrowRight, Dna, Activity, Eye, ChevronDown, Globe, Chrome, Monitor } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const engagementOptions = [
  {
    icon: Globe,
    title: "1: Web App (Beta)",
    description: "Sign up directly on this site to begin mapping your Belief Genome. Access your dashboard, respond to probes, and watch your cognitive DNA string emerge in real time.",
    buttonText: "Create Account",
    buttonHref: "/genome/register",
    internal: true,
    imagePlaceholder: "Web App",
  },
  {
    icon: Chrome,
    title: "2: Chrome Extension",
    description: "Install our optional Chrome extension to capture belief-relevant moments as you browse. Flag articles, debates, and ideas that shape your worldview — all synced to your Belief Genome.",
    buttonText: "Get Extension",
    buttonHref: "#",
    internal: false,
    imagePlaceholder: "Chrome Extension",
    comingSoon: true,
  },
  {
    icon: Monitor,
    title: "3: Desktop App for Mac",
    description: "Download BGP AI Mission Control — a native desktop application for macOS. Deeper analysis, offline access, and an immersive environment for exploring your belief architecture.",
    buttonText: "Download App",
    buttonHref: "#",
    internal: false,
    imagePlaceholder: "Desktop App",
    comingSoon: true,
  },
];

const features = [
  { icon: Dna, title: "Belief Genome", description: "124-dimension psychological mapping that captures the full architecture of your inner world with precision no personality test has attempted before." },
  { icon: Eye, title: "DNA Visualizer", description: "See your belief architecture rendered as a living, dimensional visualization — the triple helix of your cognitive, emotional, and philosophical dimensions." },
  { icon: Activity, title: "Forecaster", description: "Predict your future responses to moral dilemmas, life decisions, and philosophical probes based on your accumulated belief architecture." },
];

const faqs = [
  { q: "What platforms does BGP support?", a: "BGP is a web application accessible from any modern browser — desktop, tablet, or mobile. A Chrome extension and native Mac app are coming soon." },
  { q: "Is BGP free?", a: "Yes. The BGP web application is free during the beta period. We believe self-knowledge should be accessible to everyone." },
  { q: "How long does the initial belief mapping take?", a: "The initial Belief Genome mapping takes approximately 45-60 minutes, spread across several sessions. The system learns more about you with every interaction." },
  { q: "Is my data private?", a: "Absolutely. Your belief data is encrypted and stored securely. BGP does not share or sell your psychological data. Your inner world belongs to you." },
  { q: "What makes BGP different from personality tests?", a: "Personality tests measure traits — stable, broad categories. BGP maps beliefs — specific, weighted, contextual convictions that drive your actual decisions. The difference is dimensional precision." },
  { q: "Can I export my Belief Genome data?", a: "Yes. BGP supports full data export in multiple formats, including JSON and CSV. Your data is yours to keep, analyze, and use however you choose." },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function AppShowcase() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <PublicLayout>
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              <span className="text-primary">Participate</span> in the Belief Genome Project
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              There are three ways to engage with the Belief Genome Project. Choose the path that fits your curiosity — or use all three together for the deepest self-knowledge experience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-24">
            {engagementOptions.map((opt, i) => (
              <motion.div
                key={opt.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col"
              >
                <div className="aspect-[4/3] bg-background/50 border-b border-border flex items-center justify-center relative">
                  <opt.icon className="w-16 h-16 text-primary/30" />
                  <p className="absolute bottom-3 text-xs text-muted-foreground/50">Hero image placeholder</p>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <opt.icon className="w-6 h-6 text-primary flex-shrink-0" />
                    <h3 className="text-xl font-bold text-foreground">{opt.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">
                    {opt.description}
                  </p>
                  {opt.comingSoon ? (
                    <button
                      disabled
                      className="w-full px-6 py-3.5 rounded-xl font-semibold text-sm bg-card border border-border text-muted-foreground cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {opt.buttonText}
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Coming Soon</span>
                    </button>
                  ) : opt.internal ? (
                    <Link
                      href={opt.buttonHref}
                      className="w-full px-6 py-3.5 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:brightness-110 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                    >
                      {opt.buttonText}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <a
                      href={opt.buttonHref}
                      className="w-full px-6 py-3.5 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:brightness-110 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                    >
                      {opt.buttonText}
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mb-20">
            <h2 className="text-3xl font-bold text-foreground mb-10 text-center">Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card border border-border rounded-2xl p-6"
                >
                  <f.icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mb-20">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left"
                  >
                    <span className="font-semibold text-foreground">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <motion.div {...fadeUp} className="text-center bg-card border border-border rounded-2xl p-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Ready to discover who you really are?</h2>
            <Link
              href="/genome/register"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:brightness-110 transition-all"
            >
              <ArrowRight className="w-5 h-5" />
              Get Started — Free
            </Link>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
