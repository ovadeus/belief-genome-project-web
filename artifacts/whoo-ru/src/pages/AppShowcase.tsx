import { PublicLayout } from "@/components/layout/PublicLayout";
import { motion } from "framer-motion";
import { ArrowRight, Dna, Activity, Eye, ChevronDown, Globe, Chrome, Monitor } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const GENOME_APP_URL = (
  (import.meta.env.VITE_GENOME_APP_URL as string | undefined) || "/genome-app/"
).replace(/\/$/, "");

const engagementOptions = [
  {
    icon: Globe,
    figNum: "1.1",
    title: "I. Web App (Beta)",
    caption: "Web application — interactive, browser-based participation.",
    description: "Sign up directly on this site to begin mapping your Belief Genome. Access your dashboard, respond to probes, and watch your cognitive DNA string emerge in real time.",
    buttonText: "Create Account",
    buttonHref: `${GENOME_APP_URL}/register`,
    internal: true,
    imagePlaceholder: "Web App",
  },
  {
    icon: Chrome,
    figNum: "1.2",
    title: "II. Chrome Extension",
    caption: "Browser extension — passive belief-moment capture.",
    description: "Install our optional Chrome extension to capture belief-relevant moments as you browse. Flag articles, debates, and ideas that shape your worldview — all synced to your Belief Genome.",
    buttonText: "Get Extension",
    buttonHref: "#",
    internal: false,
    imagePlaceholder: "Chrome Extension",
    comingSoon: true,
  },
  {
    icon: Monitor,
    figNum: "1.3",
    title: "III. Desktop App for Mac",
    caption: "Native macOS application — deep, offline analysis.",
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
          {/* ── § I  Participate ─────────────────────────────────────────── */}
          <motion.div {...fadeUp} className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              <span className="text-primary">Participate</span> in the Belief Genome Project
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              There are three ways to engage with the Belief Genome Project. Choose the path that fits your curiosity — or use all three together for the deepest self-knowledge experience.
            </p>
          </motion.div>

          <div className="academic-section-label">§ I &middot; Three Pathways</div>
          <div className="grid md:grid-cols-3 gap-8 mb-24">
            {engagementOptions.map((opt, i) => (
              <motion.figure
                key={opt.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="border border-foreground/25 overflow-hidden flex flex-col m-0"
              >
                <div className="aspect-[4/3] border-b border-foreground/15 flex items-center justify-center relative">
                  <opt.icon className="w-16 h-16 text-primary/40" />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <opt.icon className="w-5 h-5 text-primary flex-shrink-0" />
                    <h3 className="text-xl font-bold text-foreground">{opt.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">
                    {opt.description}
                  </p>
                  {opt.comingSoon ? (
                    <button
                      disabled
                      className="w-full px-6 py-3 font-semibold text-sm border border-foreground/25 text-muted-foreground cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {opt.buttonText} <span className="font-normal italic text-xs">[forthcoming]</span>
                    </button>
                  ) : opt.internal ? (
                    <Link
                      href={opt.buttonHref}
                      className="w-full px-6 py-3 font-semibold text-sm bg-primary text-primary-foreground hover:brightness-110 transition-all flex items-center justify-center gap-2"
                    >
                      {opt.buttonText}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <a
                      href={opt.buttonHref}
                      className="w-full px-6 py-3 font-semibold text-sm bg-primary text-primary-foreground hover:brightness-110 transition-all flex items-center justify-center gap-2"
                    >
                      {opt.buttonText}
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <figcaption className="academic-figure-caption px-1">
                  Fig. {opt.figNum} — {opt.caption}
                </figcaption>
              </motion.figure>
            ))}
          </div>

          {/* ── § II  Features ───────────────────────────────────────────── */}
          <div className="mb-24">
            <div className="academic-section-label">§ II &middot; Features</div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <motion.figure
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="border border-foreground/25 p-6 m-0"
                >
                  <f.icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                  <figcaption className="academic-figure-caption">
                    Fig. 2.{i + 1} — {f.title}.
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </div>

          {/* ── § III  Frequently Asked Questions ────────────────────────── */}
          <div className="mb-20">
            <div className="academic-section-label">§ III &middot; Frequently Asked Questions</div>
            <div className="max-w-2xl mx-auto divide-y divide-foreground/15 border-t border-b border-foreground/15">
              {faqs.map((faq, i) => (
                <div key={i}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-2 py-4 flex items-center justify-between text-left"
                  >
                    <span className="font-semibold text-foreground">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-2 pb-4">
                      <p className="text-sm text-muted-foreground leading-relaxed max-w-prose">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Closing call to action ───────────────────────────────────── */}
          <motion.div {...fadeUp} className="text-center border-t border-foreground/30 pt-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Ready to discover who you really are?</h2>
            <Link
              href={`${GENOME_APP_URL}/register`}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 font-semibold hover:brightness-110 transition-all"
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
