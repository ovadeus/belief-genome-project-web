import { PublicLayout } from "@/components/layout/PublicLayout";
import { motion } from "framer-motion";
import { ArrowRight, Dna, Activity, Eye, ChevronDown, Globe, Chrome, Monitor } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import bgpApp01 from "@assets/bgp-app01_1777242346220.png";
import bgpApp02 from "@assets/bgp-app02_1777242346219.png";
import bgpApp03 from "@assets/bgp-app03_1777242346219.png";
import bgpApp04 from "@assets/bgp-app04_1777242346219.png";
import bgpApp05 from "@assets/bgp-app05_1777242346218.png";

const BGP_APP_SCREENS: { src: string; alt: string }[] = [
  { src: bgpApp01, alt: "BGP Mission Control — splash screen featuring the Note G companion" },
  { src: bgpApp02, alt: "BGP Mission Control — dashboard fading in over the splash" },
  { src: bgpApp03, alt: "BGP Mission Control — Note G and Ada Lovelace identity panel" },
  { src: bgpApp04, alt: "BGP Mission Control — Bookmarks, Inbox Summary, Countdowns, and Agenda dashboard" },
  { src: bgpApp05, alt: "BGP Mission Control — full layout editor with column and row sizing controls" },
];

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
    // Route through the consent page first so the user reads and agrees
    // before reaching the registration form. The consent form hands their
    // email off to /register automatically on success.
    buttonHref: "/consent",
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
  const [appScreenIdx, setAppScreenIdx] = useState(0);
  const [appAspectRatios, setAppAspectRatios] = useState<Record<number, number>>({});

  // Pre-measure each screenshot so the frame can animate to its true aspect
  // ratio on slide change (mirrors the Home carousel behavior).
  useEffect(() => {
    BGP_APP_SCREENS.forEach((s, i) => {
      const img = new Image();
      img.onload = () => {
        setAppAspectRatios((prev) =>
          prev[i] ? prev : { ...prev, [i]: img.naturalHeight / img.naturalWidth }
        );
      };
      img.src = s.src;
    });
  }, []);

  // Auto-advance every 5s.
  useEffect(() => {
    const id = window.setInterval(() => {
      setAppScreenIdx((i) => (i + 1) % BGP_APP_SCREENS.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, []);

  const appCurrentAspect = appAspectRatios[appScreenIdx] ?? 0.7;

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

          {/* ── App Preview Carousel — auto-cycling tour of Mission Control ─ */}
          <div className="mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mx-auto w-full"
              style={{ maxWidth: 980 }}
            >
              <motion.div
                className="relative w-full overflow-hidden border border-black bg-card/40"
                animate={{ paddingBottom: `${appCurrentAspect * 100}%` }}
                transition={{ duration: 1.0, ease: [0.4, 0, 0.2, 1] }}
              >
                {BGP_APP_SCREENS.map((s, i) => (
                  <motion.img
                    key={i}
                    src={s.src}
                    alt={s.alt}
                    draggable={false}
                    initial={false}
                    animate={{ opacity: i === appScreenIdx ? 1 : 0 }}
                    transition={{ duration: 1.0, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full object-contain select-none"
                    style={{ pointerEvents: i === appScreenIdx ? "auto" : "none" }}
                  />
                ))}
              </motion.div>

              <div className="flex justify-center items-center gap-1.5 sm:gap-2.5 mt-6">
                {BGP_APP_SCREENS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAppScreenIdx(i)}
                    aria-label={`Show app screen ${i + 1}`}
                    aria-current={i === appScreenIdx}
                    className={`h-1.5 w-1.5 sm:h-2.5 sm:w-2.5 rounded-full transition-colors duration-300 ${
                      i === appScreenIdx
                        ? "bg-primary"
                        : "bg-neutral-700 hover:bg-neutral-500"
                    }`}
                  />
                ))}
              </div>

              <figcaption className="academic-figure-caption text-center mt-3">
                Fig. 1.4 &mdash; BGP Mission Control: a tour of the desktop interface.
              </figcaption>
            </motion.div>
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
