import { useEffect, type ReactNode } from "react";
import { Link, useRoute } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import NotFound from "@/pages/not-found";
import { cn } from "@/lib/utils";

type AqpSection = {
  slug: string;
  numeral: string;
  title: string;
  teaser?: string;
  body?: ReactNode;
};

export const AQP_SECTIONS: AqpSection[] = [
  {
    slug: "fracture-rational-actor",
    numeral: "I",
    title: "The Fracture of the Rational Actor",
  },
  {
    slug: "quantum-cognition-midpoint",
    numeral: "II",
    title: "Quantum Cognition & The Midpoint Revelation",
  },
  {
    slug: "society-quantum-field",
    numeral: "III",
    title: "Society as a Quantum Field",
  },
  {
    slug: "mind-architecture",
    numeral: "IV",
    title: "Mapping the Architecture of the Human Mind",
  },
  {
    slug: "entropy-harvesting",
    numeral: "V",
    title: "Entropy Harvesting & Why It Matters",
  },
  {
    slug: "original-contributions",
    numeral: "VI",
    title: "Original Contributions & The Path to Verification",
  },
];

export const AQP_BASE = "/aqp";

export default function AppliedQuantumPsychometrics() {
  const [, params] = useRoute<{ slug: string }>(`${AQP_BASE}/:slug`);
  const slug = params?.slug;

  const index = AQP_SECTIONS.findIndex((s) => s.slug === slug);
  const section = index >= 0 ? AQP_SECTIONS[index] : null;

  useEffect(() => {
    if (section) window.scrollTo({ top: 0, behavior: "auto" });
  }, [section?.slug]);

  if (!section) return <NotFound />;

  const prev = index > 0 ? AQP_SECTIONS[index - 1] : null;
  const next = index < AQP_SECTIONS.length - 1 ? AQP_SECTIONS[index + 1] : null;

  return (
    <PublicLayout>
      <article className="px-6 py-16 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-10"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground hover:text-primary transition-colors"
          >
            <span className="font-display">Applied Quantum Psychometrics</span>
          </Link>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-[260px_1fr]">
          {/* Sidebar — section index */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="text-[11px] font-semibold tracking-[0.16em] uppercase text-muted-foreground mb-4">
              Sections
            </div>
            <ol className="space-y-1">
              {AQP_SECTIONS.map((s) => {
                const active = s.slug === section.slug;
                return (
                  <li key={s.slug}>
                    <Link
                      href={`${AQP_BASE}/${s.slug}`}
                      className={cn(
                        "block rounded-lg px-3 py-2 text-sm leading-snug transition-colors",
                        active
                          ? "bg-primary/10 text-primary border-l-2 border-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-foreground/5 border-l-2 border-transparent"
                      )}
                    >
                      <span className="font-mono text-[11px] mr-2 opacity-70">
                        {s.numeral}.
                      </span>
                      {s.title}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </aside>

          {/* Body */}
          <div className="min-w-0">
            <motion.header
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="mb-10 pb-8 border-b border-border"
            >
              <div className="font-mono text-sm text-primary/80 mb-3 tracking-wider">
                {section.numeral}.
              </div>
              <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground leading-tight">
                {section.title}
              </h1>
              {section.teaser && (
                <p className="mt-5 text-lg text-muted-foreground leading-relaxed max-w-2xl">
                  {section.teaser}
                </p>
              )}
            </motion.header>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="prose prose-invert max-w-none"
            >
              {section.body ?? <ComingSoon title={section.title} />}
            </motion.div>

            {/* Prev / Next */}
            <nav className="mt-16 pt-8 border-t border-border grid gap-4 sm:grid-cols-2">
              {prev ? (
                <Link
                  href={`${AQP_BASE}/${prev.slug}`}
                  className="group flex flex-col gap-1 rounded-xl border border-border bg-card/40 hover:bg-card/80 hover:border-primary/40 transition-colors p-5"
                >
                  <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] uppercase text-muted-foreground">
                    <ArrowLeft size={12} /> Previous
                  </span>
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    <span className="font-mono opacity-70 mr-1.5">{prev.numeral}.</span>
                    {prev.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}
              {next ? (
                <Link
                  href={`${AQP_BASE}/${next.slug}`}
                  className="group flex flex-col gap-1 rounded-xl border border-border bg-card/40 hover:bg-card/80 hover:border-primary/40 transition-colors p-5 text-right sm:items-end"
                >
                  <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] uppercase text-muted-foreground">
                    Next <ArrowRight size={12} />
                  </span>
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    <span className="font-mono opacity-70 mr-1.5">{next.numeral}.</span>
                    {next.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}
            </nav>
          </div>
        </div>
      </article>
    </PublicLayout>
  );
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="not-prose rounded-2xl border border-dashed border-primary/30 bg-primary/[0.04] p-10 md:p-12">
      <div className="flex items-center gap-2 text-primary text-xs font-semibold tracking-[0.18em] uppercase mb-4">
        <Sparkles size={14} />
        <span>In Preparation</span>
      </div>
      <h2 className="text-2xl font-display font-semibold text-foreground mb-3">
        {title} — coming soon
      </h2>
      <p className="text-muted-foreground leading-relaxed max-w-xl">
        This section is being written and will appear here shortly. In the meantime,
        you can explore the other sections of <em>Applied Quantum Psychometrics</em>{" "}
        from the sidebar, or browse the project's{" "}
        <Link href="/blog" className="text-primary hover:underline">blog</Link>,{" "}
        <Link href="/podcast" className="text-primary hover:underline">podcast</Link>, and{" "}
        <Link href="/book" className="text-primary hover:underline">book</Link>.
      </p>
    </div>
  );
}
