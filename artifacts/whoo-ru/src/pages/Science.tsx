import { useEffect, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { cn } from "@/lib/utils";

type Section = {
  id: string;
  numeral: string;
  title: string;
  teaser?: string;
  body?: ReactNode;
};

export const SCIENCE_SECTIONS: Section[] = [
  {
    id: "fracture",
    numeral: "I",
    title: "The Fracture",
    teaser:
      "Why the Rational Actor model can no longer hold — and the cracks that opened the door to a quantum reading of the mind.",
  },
  {
    id: "quantum-grammar",
    numeral: "II",
    title: "The Quantum Grammar",
    teaser:
      "Busemeyer & Bruza's quantum cognition framework, and the Midpoint Revelation that makes superposed belief tractable.",
  },
  {
    id: "synthesis",
    numeral: "III",
    title: "The Synthesis",
    teaser:
      "Wendt, Khrennikov, and the BGP bridge — assembling a working architecture from threads that had not yet been woven together.",
  },
  {
    id: "horizon",
    numeral: "IV",
    title: "The Horizon",
    teaser:
      "Entropy Harvesting, the Forecaster engine, and the applications that follow once belief becomes measurable.",
  },
];

const ORIGINAL_CONTRIBUTIONS_HREF = "/science/original-contributions";

export default function Science() {
  const [activeId, setActiveId] = useState<string>(SCIENCE_SECTIONS[0].id);

  // Smooth-scroll to a hash on mount (handles deep-link navigation from the
  // navbar dropdown, e.g. /science#quantum-grammar).
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: "auto", block: "start" });
    });
  }, []);

  // Listen for in-page hash changes (clicking a sidebar anchor while already on /science).
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (hash) document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Sidebar scroll-spy — highlights the section currently in view.
  useEffect(() => {
    const els = SCIENCE_SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.boundingClientRect.top - b.boundingClientRect.top));
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0, 1] }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <PublicLayout>
      <article className="px-6 py-16 max-w-6xl mx-auto">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-10"
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.18em] text-primary/80 font-display">
            The Science
          </span>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-[260px_1fr]">
          {/* Sidebar — section index + sub-page link */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="text-[11px] font-semibold tracking-[0.16em] uppercase text-muted-foreground mb-4">
              Overview
            </div>
            <ol className="space-y-1 mb-6">
              {SCIENCE_SECTIONS.map((s) => {
                const active = s.id === activeId;
                return (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className={cn(
                        "block rounded-lg px-3 py-2 text-sm leading-snug transition-colors",
                        active
                          ? "bg-primary/10 text-primary border-l-2 border-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-foreground/5 border-l-2 border-transparent"
                      )}
                    >
                      <span className="font-mono text-[11px] mr-2 opacity-70">{s.numeral}.</span>
                      {s.title}
                    </a>
                  </li>
                );
              })}
            </ol>
            <div className="pt-4 border-t border-border">
              <Link
                href={ORIGINAL_CONTRIBUTIONS_HREF}
                className="group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-foreground/5 transition-colors"
              >
                <span>Original Contributions</span>
                <ArrowRight size={14} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </aside>

          {/* Body */}
          <div className="min-w-0">
            <motion.header
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="mb-12 pb-8 border-b border-border"
            >
              <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground leading-tight">
                Overview
              </h1>
              <p className="mt-5 text-lg text-muted-foreground leading-relaxed max-w-2xl">
                A four-part walk through the science behind the Belief Genome Project — from the
                breakdown of the Rational Actor, through the quantum grammar of cognition, to the
                synthesis that makes the framework work and the horizon it opens.
              </p>
            </motion.header>

            <div className="space-y-20">
              {SCIENCE_SECTIONS.map((s, i) => (
                <motion.section
                  key={s.id}
                  id={s.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: i * 0.04 }}
                  className="scroll-mt-28"
                >
                  <header className="mb-6">
                    <div className="font-mono text-sm text-primary/80 mb-2 tracking-wider">
                      {s.numeral}.
                    </div>
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground leading-tight">
                      {s.title}
                    </h2>
                    {s.teaser && (
                      <p className="mt-3 text-base text-muted-foreground leading-relaxed max-w-2xl">
                        {s.teaser}
                      </p>
                    )}
                  </header>
                  <div className="prose prose-invert max-w-none">
                    {s.body ?? <ComingSoonCard title={s.title} />}
                  </div>
                </motion.section>
              ))}
            </div>

            {/* Read next: Original Contributions */}
            <nav className="mt-20 pt-8 border-t border-border">
              <Link
                href={ORIGINAL_CONTRIBUTIONS_HREF}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-card/40 hover:bg-card/80 hover:border-primary/40 transition-colors p-6"
              >
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.14em] uppercase text-muted-foreground mb-1">
                    Read next
                  </div>
                  <div className="text-lg font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                    Original Contributions
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground max-w-md">
                    The seven constructs, the candidate-architecture qualification, and the
                    falsification test that anchors the project.
                  </p>
                </div>
                <ArrowRight
                  size={20}
                  className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0"
                />
              </Link>
            </nav>
          </div>
        </div>
      </article>
    </PublicLayout>
  );
}

function ComingSoonCard({ title }: { title: string }) {
  return (
    <div className="not-prose rounded-2xl border border-dashed border-primary/30 bg-primary/[0.04] p-8">
      <div className="flex items-center gap-2 text-primary text-xs font-semibold tracking-[0.18em] uppercase mb-3">
        <Sparkles size={14} />
        <span>In Preparation</span>
      </div>
      <p className="text-muted-foreground leading-relaxed">
        Body for <em className="text-foreground/90 not-italic font-medium">{title}</em> is being
        written and will appear here shortly.
      </p>
    </div>
  );
}
