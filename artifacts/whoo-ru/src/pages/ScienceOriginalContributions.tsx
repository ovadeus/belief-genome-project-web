import { type ReactNode } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";

// Drop a value into `body` once content is ready; the placeholder card will
// be replaced automatically.
const BODY: ReactNode | undefined = undefined;

export default function ScienceOriginalContributions() {
  return (
    <PublicLayout>
      <article className="px-6 py-16 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-10"
        >
          <Link
            href="/science"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft size={12} />
            <span className="font-display">The Science · Overview</span>
          </Link>
        </motion.div>

        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mb-12 pb-8 border-b border-border"
        >
          <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground leading-tight">
            Original Contributions
          </h1>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
            The seven constructs that the Belief Genome Project introduces, the
            "candidate architecture" qualification that frames their status, and the
            falsification test that anchors the framework to empirical reality.
          </p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="prose prose-invert max-w-none"
        >
          {BODY ?? <ComingSoonCard />}
        </motion.div>

        <nav className="mt-16 pt-8 border-t border-border">
          <Link
            href="/science"
            className="group inline-flex items-center gap-3 rounded-xl border border-border bg-card/40 hover:bg-card/80 hover:border-primary/40 transition-colors px-5 py-4"
          >
            <ArrowLeft
              size={16}
              className="text-muted-foreground group-hover:text-primary group-hover:-translate-x-0.5 transition-all"
            />
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              Back to Overview
            </span>
          </Link>
        </nav>
      </article>
    </PublicLayout>
  );
}

function ComingSoonCard() {
  return (
    <div className="not-prose rounded-2xl border border-dashed border-primary/30 bg-primary/[0.04] p-10 md:p-12">
      <div className="flex items-center gap-2 text-primary text-xs font-semibold tracking-[0.18em] uppercase mb-4">
        <Sparkles size={14} />
        <span>In Preparation</span>
      </div>
      <h2 className="text-2xl font-display font-semibold text-foreground mb-3">
        Original Contributions — coming soon
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        This page will outline the seven constructs unique to the Belief Genome Project,
        explain why the architecture is currently described as a <em>candidate</em>{" "}
        rather than a settled model, and lay out the falsification test that decides
        whether the framework holds up under empirical pressure.
      </p>
    </div>
  );
}
