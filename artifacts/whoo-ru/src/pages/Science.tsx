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

// Shared prose styling for the four section bodies.
const P_CLS = "mb-5 leading-relaxed text-foreground/85";
const H3_CLS =
  "mt-12 mb-4 text-xl md:text-2xl font-display font-semibold text-foreground";
const TERM_CLS = "font-semibold text-primary";

const FractureBody: ReactNode = (
  <>
    <p className={P_CLS}>
      The dominant framework for measuring human decision-making was built in the 1940s on the
      foundations laid by John von Neumann and Oskar Morgenstern. Their{" "}
      <span className={TERM_CLS}>rational actor model</span> treated the human mind like a
      classical computer bit — strictly binary, with stable preferences that could be represented
      as definite, coherent positions along a probability distribution.
    </p>
    <p className={P_CLS}>That ideal fractured under empirical scrutiny.</p>
    <p className={P_CLS}>
      Amos Tversky and Daniel Kahneman, beginning in the 1970s, demonstrated that human judgment
      systematically violates the basic axioms of classical probability. Their
      heuristics-and-biases program — culminating in the famous Linda problem and the conjunction
      fallacy — showed that people routinely rate the conjunction of two events as more probable
      than one of its constituents. This is not a calculation error. It is evidence that human
      cognition operates under different rules than classical probability prescribes. Across the
      same period, Allais and Ellsberg showed that preferences violate independence and ambiguity
      axioms in ways no mixture of classical probabilities can repair. Festinger's work on
      cognitive dissonance established that people hold contradictory beliefs simultaneously — a
      finding fundamentally incompatible with the classical assumption that belief states are
      always coherent.
    </p>
    <p className={P_CLS}>
      The cumulative weight of this evidence points to something the classical framework cannot
      accommodate. Human beings do not make occasional mistakes against a classical baseline. We
      routinely hold superposed, contradictory realities at once — and classical science had no
      mathematical language to describe that.
    </p>
    <p className={P_CLS}>
      This is why polls and surveys keep failing to predict behavior. They are designed to record
      the moment of resolution. They cannot see the state that existed seconds before.
    </p>
  </>
);

const QuantumGrammarBody: ReactNode = (
  <>
    <p className={P_CLS}>
      The mathematical language the field needed was already on the shelf — developed for
      microphysical systems, but abstractable from physics into a formalism for any system where
      states can exist in superposition until measurement forces resolution.
    </p>
    <p className={P_CLS}>
      The Brussels school (Diederik Aerts and colleagues) was among the first to apply
      quantum-theoretic models to cognition, demonstrating that concepts behave less like
      classical sets and more like superposition states whose exemplar structure depends on
      context. Jerome Busemeyer and Peter Bruza consolidated this scattered work into a unified
      research program, formalizing superposition, interference, non-commutative measurement, and
      entanglement as cognitive modeling tools. Emmanuel Pothos, Andrei Khrennikov, and Zheng
      Wang extended the program through the QQ equality — a parameter-free mathematical
      constraint on question-order effects that has now been validated across dozens of
      nationally representative survey datasets at a precision more commonly seen in physics than
      psychology.
    </p>
    <p className={P_CLS}>
      The Belief Genome Project inherits this grammar in full. It does not claim cognition is a
      quantum physical process. It claims — with the field — that the mathematical structure of
      quantum probability provides a more accurate descriptive framework for human judgment than
      classical probability does.
    </p>

    <h3 className={H3_CLS}>The Midpoint Revelation</h3>
    <p className={P_CLS}>
      This is where the Belief Genome Project departs from prior practice and stakes original
      ground.
    </p>
    <p className={P_CLS}>
      In classical psychometrics, the midpoint of a survey scale — the &ldquo;neutral,&rdquo; the
      &ldquo;neither agree nor disagree,&rdquo; the 5 on a 0–9 scale — is treated as the absence
      of signal. Apathy. Indifference. A weak preference, or no preference at all.
    </p>
    <p className={P_CLS}>
      The Belief Genome Project rejects this entirely. Under the quantum-cognitive
      interpretation, the midpoint is genuine superposition — a cognitively active state in which
      a person holds multiple, contradictory belief positions simultaneously, each with its own
      quantum amplitude, resolvable only when context forces a decision.
    </p>
    <p className={P_CLS}>
      Picture a color wheel with all twelve basic hues. Spinning slowly, you see each color in
      turn. Spinning fast enough, the colors optically mix into a vibrating, dynamic gray. That
      gray is not the absence of color. It is the simultaneous presence of all twelve. The
      midpoint of a belief scale is that gray. It is where the most cognitive activity is
      happening — not where it is missing.
    </p>
    <p className={P_CLS}>
      To capture this, the platform introduces the{" "}
      <span className={TERM_CLS}>Entropy State Slider</span> — a measurement tool that abandons
      the binary on/off switch in favor of an instrument designed to register active tension.
      Where classical scales force resolution, the slider preserves the superposition long enough
      to measure it.
    </p>
  </>
);

const SynthesisBody: ReactNode = (
  <>
    <p className={P_CLS}>
      Quantum cognition explained the individual. The next intellectual move was to ask what
      happens when superposed minds aggregate into societies.
    </p>
    <p className={P_CLS}>
      Alexander Wendt provided the philosophical bridge. He argued that human beings and
      societies should be understood as macroscopic quantum phenomena — that we are, in his
      framing, walking wave functions. Wendt established the ontology. He did not specify how to
      measure it.
    </p>
    <p className={P_CLS}>
      Andrei Khrennikov built the macro-scale dynamics. His Social Laser Theory demonstrates how
      populations undergo coherent amplification — like a physical laser — when stimulated by
      social information, producing the phase transitions we recognize as mass polarization and
      viral outrage. Khrennikov scaled quantum formalism to entire populations. But to make the
      math work at that scale, he treated individuals as largely undifferentiated social atoms,
      abstracting away their interior structure to focus on field dynamics.
    </p>
    <p className={P_CLS}>
      This is the unoccupied territory the Belief Genome Project enters. Wendt told us what
      humans are under a quantum framework. Busemeyer and Bruza gave us the grammar to model
      isolated cognitive effects. Khrennikov showed how that grammar scales. None of them built
      an instrument to map the internal coordinate system of the social atom itself.
    </p>
    <p className={P_CLS}>
      The Belief Genome Project is the first framework to bridge the micro and the macro — not by
      observing the social laser from outside, but by resolving the interior architecture of the
      individuals that power it.
    </p>

    <h3 className={H3_CLS}>
      Methodological Individualism, Corrected for Quantum Indeterminacy
    </h3>
    <p className={P_CLS}>
      This bridging requires a particular philosophical stance, which the project states plainly:
      it preserves the individual as the fundamental unit of measurement, but rejects the
      classical assumption of a stable, fixed rational actor. It adjusts methodological
      individualism for structural indeterminacy and contextual superposition. The individual
      remains the unit. What the unit is has changed.
    </p>

    <h3 className={H3_CLS}>The Architecture</h3>
    <p className={P_CLS}>
      On that foundation, the project maps the human mind across 11 categories — epistemology,
      spirituality, morality, psychology, relationships, social, political, economics, science
      and technology, education, and health — distributed across 124 precise dimensions.
    </p>
    <p className={P_CLS}>
      The fundamental unit is not a binary bit but the{" "}
      <span className={TERM_CLS}>Cognitive que-bit</span>: a single dimension of belief
      represented as a vector in a two-dimensional Hilbert space, where the midpoint explicitly
      encodes superposition rather than indifference.
    </p>
    <p className={P_CLS}>
      When a decision-forcing event freezes the spinning wheel — a vote cast, a survey answered,
      a purchase made — the project calls this a <span className={TERM_CLS}>Collapse Event</span>.
      Because intuition (System 1) and deliberation (System 2) often disagree about which outcome
      the collapse should produce, the project measures the{" "}
      <span className={TERM_CLS}>Collapse Gap</span>: the quantitative signature of internal
      doubt and tension between fast and slow cognition.
    </p>
    <p className={P_CLS}>
      Over a lifetime, repeated collapses leave traces.{" "}
      <span className={TERM_CLS}>Longitudinal Worldview Mapping</span> tracks how superposition
      narrows into stable belief — how, over time, certain dimensions develop scars where the
      wheel no longer spins freely.
    </p>
    <p className={P_CLS}>
      The architecture's output is the 136-character{" "}
      <span className={TERM_CLS}>Belief Genome Serial</span> — a transmissible, quantifiable
      encoding of a single worldview at a single moment in time. The serial is designed to be
      analyzable at the dimension level, the cluster level, and the whole-state level. Serials
      from the same person at different times reveal evolution. Serials from different people
      reveal structural similarity. Serials from the same person under different framing contexts
      reveal context-dependence.
    </p>
    <p className={P_CLS}>
      The Belief Genome Project is, in its own framing, not a solution — an instrument to guide
      solutions. The architecture is what makes the solutions possible. Visualizations like the{" "}
      <span className={TERM_CLS}>Triple Helix DNA</span> (mapping ethos, logos, and pathos) and
      the <span className={TERM_CLS}>3D Neuro Map</span> translate the serial into shapes the
      human eye can see.
    </p>
  </>
);

const HORIZON_FRONTIERS: { label: string; body: ReactNode }[] = [
  {
    label: "AI Alignment",
    body: (
      <>
        Current AI systems are trained on data that treats midpoints as noise, leaving them to
        mischaracterize cognitively active superposition states as weak preferences to be
        resolved arbitrarily. An AI cannot align with belief states it cannot accurately
        represent. The Belief Genome Project offers a candidate representation — one that anchors
        models to the contradictory, contextual, dynamic worldviews that humans actually hold.
      </>
    ),
  },
  {
    label: "Self-Exploration",
    body: (
      <>
        The serial gives individuals a structured, honest mirror. Not a personality type. Not a
        label. A map of the specific dimensions where a person's belief is resolved, where it is
        in superposition, and where it is collapsing in real time.
      </>
    ),
  },
  {
    label: "The Forecaster",
    body: (
      <>
        Using a person's specific serial, the project simulates how their unique superposition
        will collapse in response to new information, breaking news, or complex social
        situations — predicting the resolution before the event itself forces one.
      </>
    ),
  },
];

const HorizonBody: ReactNode = (
  <>
    <p className={P_CLS}>
      The architecture is only as useful as the data feeding it. The project gathers that data
      through <span className={TERM_CLS}>Entropy Harvesting</span> — the systematic collection of
      micro-behavioral signals and probability responses during ambient, low-stakes interactions.
      What classical psychometrics treats as noise — hesitation, drift, contextual variance — the
      Belief Genome Project treats as the highest-value signal in the dataset. Entropy is where
      the superposition lives.
    </p>
    <p className={P_CLS}>Three applied frontiers follow from this map.</p>

    <div className="mt-6 grid gap-3 sm:gap-4">
      {HORIZON_FRONTIERS.map((f) => (
        <div
          key={f.label}
          className="rounded-2xl border border-border bg-card/40 p-5 sm:p-6"
        >
          <div className="text-[11px] font-semibold tracking-[0.16em] uppercase text-primary mb-2">
            {f.label}
          </div>
          <p className="leading-relaxed text-foreground/85">{f.body}</p>
        </div>
      ))}
    </div>
  </>
);

export const SCIENCE_SECTIONS: Section[] = [
  {
    id: "fracture",
    numeral: "I",
    title: "The Fracture",
    teaser: "Why classical models failed.",
    body: FractureBody,
  },
  {
    id: "quantum-grammar",
    numeral: "II",
    title: "The Quantum Grammar",
    teaser: "A new mathematics for cognition.",
    body: QuantumGrammarBody,
  },
  {
    id: "synthesis",
    numeral: "III",
    title: "The Synthesis",
    teaser: "From walking wave functions to a mapped architecture.",
    body: SynthesisBody,
  },
  {
    id: "horizon",
    numeral: "IV",
    title: "The Horizon",
    teaser: "Entropy Harvesting and what this map makes possible.",
    body: HorizonBody,
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
                  <div className="text-base md:text-[17px] text-foreground/85">
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
