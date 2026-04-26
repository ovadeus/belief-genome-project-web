import { useEffect, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PersonHoverCard } from "@/components/PersonHoverCard";
import { cn } from "@/lib/utils";

type Section = {
  id: string;
  numeral: string;
  title: string;
  teaser?: string;
  body?: ReactNode;
};

// Shared prose styling for the section bodies.
const P_CLS = "mb-5 leading-relaxed text-foreground/85";
const TERM_CLS = "font-semibold text-primary";
// For names without a Wikipedia page (e.g. David Edwin Meyers, the BGP author).
// Visually identical to the hover-card trigger color/weight, just without the
// dotted underline that signals "hover for more".
const NAME_CLS = "font-semibold text-primary";

const HeritageBody: ReactNode = (
  <>
    <p className={P_CLS}>
      Our understanding of decision-making is built on the profound 1940s
      foundations laid by{" "}
      <PersonHoverCard name="John von Neumann" slug="John_von_Neumann" /> and{" "}
      <PersonHoverCard name="Oskar Morgenstern" slug="Oskar_Morgenstern" />.
      This classical ideal assumed humans were "rational actors" operating like
      classical computer bits — strictly binary, 1 or 0.
    </p>
    <p className={P_CLS}>
      However, as behavioral science advanced, researchers like{" "}
      <PersonHoverCard name="Amos Tversky" slug="Amos_Tversky" /> and{" "}
      <PersonHoverCard name="Daniel Kahneman" slug="Daniel_Kahneman" />{" "}
      demonstrated through their heuristics and biases program that humans
      systematically violate the basic laws of classical probability. As
      illustrated by their famous "Linda problem," we do not simply make random
      errors; people often give responses that appear contradictory under
      classical probability assumptions. The classical model provided a vital
      foundation, but it lacked the mathematical language to explain this
      dynamic contradiction.
    </p>
  </>
);

const QuantumGrammarBody: ReactNode = (
  <>
    <p className={P_CLS}>
      To explain the messy reality of human cognition, the Belief Genome
      Project is deeply indebted to the foundational quantum cognition research
      of <PersonHoverCard name="Jerome Busemeyer" slug="Jerome_Busemeyer" /> and{" "}
      <PersonHoverCard name="Peter Bruza" slug="Peter_Bruza" />. Their work and
      subsequent developments show that the mathematical formalism of quantum
      probability — including concepts such as superposition, interference, and
      non-commutativity — can capture important context effects and judgment
      patterns that classical probability struggles to model.
    </p>
    <p className={P_CLS}>
      Researcher{" "}
      <span className={NAME_CLS}>David Edwin Meyers</span> uses the analogy of
      a full color wheel. When a 12-color wheel spins at high velocity, the
      individual colors optically mix into a dynamic, vibrating gray. In much
      classical survey practice, a midpoint response (like a 5 out of 10) is
      often interpreted as apathy or indecision. Inspired by quantum-cognitive
      models, the BGP instead treats midpoints as candidate superposition
      states: the "vibrating gray" of the spinning wheel, potentially encoding
      tension between competing but meaningful inclinations. To explore this
      empirically, the BGP introduces the{" "}
      <span className={TERM_CLS}>Entropy State Slider</span> as a proposed
      measurement device aimed at quantifying the degree of perceived
      uncertainty and conflict rather than forcing a single binary choice.
    </p>
  </>
);

const MacroScaleBody: ReactNode = (
  <>
    <p className={P_CLS}>
      At the macro level, our architecture builds upon the ontological bridge
      proposed by{" "}
      <PersonHoverCard name="Alexander Wendt" slug="Alexander_Wendt" />, who
      argues that human beings and social systems can fruitfully be modeled as
      "walking wave functions." We also draw on{" "}
      <PersonHoverCard name="Andrei Khrennikov" slug="Andrei_Khrennikov" />'s{" "}
      <span className={TERM_CLS}>Social Laser Theory</span> and related
      mean-field models, which use quantum-like formalisms to analyze how
      populations can exhibit coherent amplification and phase-transition–like
      behavior under the influence of social information.
    </p>
    <p className={P_CLS}>
      These models illustrate that quantum-inspired tools can be extended from
      individual judgments to population-level dynamics, including phenomena
      reminiscent of polarization and viral cascades. However, in many such
      models the "social atom" is treated as a relatively undifferentiated
      agent. The Belief Genome Project seeks to provide a complementary layer:
      a candidate internal coordinate system for the social atom, specifying
      where and how individual belief dimensions may contribute to emerging
      societal coherence or fragmentation.
    </p>
  </>
);

const SynthesisBody: ReactNode = (
  <>
    <p className={P_CLS}>
      While we inherit this theoretical lineage, the Belief Genome Project
      proposes an operational measurement architecture that, to our knowledge,
      has not yet been implemented in a unified form. Operating within a
      broadly methodological individualist framework while incorporating
      quantum-probabilistic indeterminacy,{" "}
      <span className={NAME_CLS}>Meyers</span> defines an architecture that
      represents reported beliefs across 11 categories and 124 dimensions.
    </p>
    <p className={P_CLS}>
      Within this architecture, the{" "}
      <span className={TERM_CLS}>Cognitive Qubit</span> is introduced as the
      proposed fundamental unit of analysis: a single belief dimension modeled
      as a state in a low-dimensional Hilbert space. When a decision forces the
      spinning color wheel to "freeze" — analogous to a strobe light — the
      individual undergoes what we call a{" "}
      <span className={TERM_CLS}>Collapse Event</span>, a decision-forcing
      measurement that projects an indeterminate state onto a particular
      response. Because intuitive (System 1) and deliberative (System 2)
      processing can yield different outcomes, the BGP defines the{" "}
      <span className={TERM_CLS}>Collapse Gap</span> as an individual-level
      metric intended to quantify divergence between fast and slow responses on
      the same belief dimension.
    </p>
    <p className={P_CLS}>
      Over repeated measurements,{" "}
      <span className={TERM_CLS}>Longitudinal Worldview Mapping</span> is
      proposed as a way to track how patterns of responses move from more
      indeterminate to more stable over time. The architecture yields a
      136-character{" "}
      <span className={TERM_CLS}>Belief Genome Serial Key</span>: a compact
      code summarizing an individual's responses across the 124 dimensions at a
      given point in time. Conceptually, this representation can be used to
      generate visualizations — such as triple-helix or 3D state-space plots —
      intended to aid interpretation, though these visual formats are currently
      at the prototype and design stage.
    </p>
  </>
);

const FRONTIER_AVENUES: { label: string; body: ReactNode }[] = [
  {
    label: "Research on wicked problems",
    body: (
      <>
        Aggregated BGP-style architectures might provide population-level maps
        of belief configurations that underlie policy preferences and collective
        action, complementing existing survey and modeling tools.
      </>
    ),
  },
  {
    label: "AI–human preference modeling",
    body: (
      <>
        Encoded representations of individual belief states could be explored
        as one ingredient in more personalized and transparent preference
        models for AI systems, though this remains a speculative direction that
        will require careful empirical validation and ethical safeguards.
      </>
    ),
  },
  {
    label: "Self-exploration tools",
    body: (
      <>
        Interactive interfaces could allow individuals to explore patterns of
        consistency, conflict, and change in their own reported beliefs over
        time.
      </>
    ),
  },
  {
    label: "Forecasting experiments",
    body: (
      <>
        Pilot studies might test whether architectures like the Serial Key
        improve prediction of how people respond to new information or
        scenarios, relative to simpler baselines.
      </>
    ),
  },
];

const FrontierBody: ReactNode = (
  <>
    <p className={P_CLS}>
      The BGP framework aspires to capture richer data through what we term{" "}
      <span className={TERM_CLS}>Entropy Harvesting</span>: collecting response
      patterns, probability estimates, and potentially micro-behavioral signals
      (e.g., hesitation times, changes under reframing) that classical
      instruments often treat as noise. The goal is to transform this
      variability into structured indicators of contextual sensitivity and
      internal conflict rather than discard it.
    </p>
    <p className={P_CLS}>
      In principle, such data could support several applied avenues:
    </p>

    <div className="mt-6 grid gap-3 sm:gap-4">
      {FRONTIER_AVENUES.map((f) => (
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

const ARCHITECTURAL_CONSTRUCTS = [
  "The 124-dimension belief architecture",
  "The Cognitive Qubit",
  "The Collapse Event",
  "The Collapse Gap",
  "Entropy Harvesting",
  "The 136-character Belief Genome Serial",
  "Longitudinal Worldview Mapping",
];

const EmpiricalHorizonBody: ReactNode = (
  <>
    <p className={P_CLS}>
      The Belief Genome Project does not claim to introduce a new underlying
      physics or probability calculus; rather, it represents an operational
      synthesis of three strands of prior work: quantum cognition and decision
      models, quantum-like social modeling (including{" "}
      <span className={TERM_CLS}>Social Laser Theory</span>), and ontological
      proposals in quantum social science. Building on this foundation,{" "}
      <span className={NAME_CLS}>Meyers</span> introduces seven architectural
      constructs:
    </p>

    <ol className="mt-6 mb-6 grid gap-2.5 sm:grid-cols-2">
      {ARCHITECTURAL_CONSTRUCTS.map((c, i) => (
        <li
          key={c}
          className="flex items-start gap-3 rounded-xl border border-border bg-card/40 px-4 py-3"
        >
          <span className="font-mono text-[11px] text-primary/80 mt-0.5 shrink-0 tabular-nums">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className={`${TERM_CLS} text-[15px] leading-snug`}>{c}</span>
        </li>
      ))}
    </ol>

    <p className={P_CLS}>
      Crucially, the BGP is presently a candidate architecture. While it draws
      on peer-reviewed mathematical and empirical work, the architecture as a
      whole — and its specific commitments about midpoints, dimensional
      structure, and qubit-like units — requires systematic experimental
      testing. One proposed empirical program is to extend the established "QQ
      equality" framework to within-subject designs that stratify participants
      by their use of midpoints versus adjacent scale values, with the aim of
      testing whether midpoint-heavy responders exhibit distinctive context
      effects beyond what a classical mixture model would predict.
    </p>
    <p className={P_CLS}>
      In this sense, the theoretical ingredients are available and a
      preliminary empirical blueprint can be articulated, but the decisive
      tests remain to be conducted. We invite collaboration from the scientific
      and technical communities to refine these designs, critically evaluate
      the underlying assumptions, and test whether architectures of this kind
      provide incremental explanatory and predictive value over existing
      models.
    </p>
  </>
);

export const SCIENCE_SECTIONS: Section[] = [
  {
    id: "heritage",
    numeral: "I",
    title: "The Heritage",
    teaser: "The limits of the rational actor.",
    body: HeritageBody,
  },
  {
    id: "quantum-grammar",
    numeral: "II",
    title: "The Quantum Grammar",
    teaser: "A new mathematical vocabulary.",
    body: QuantumGrammarBody,
  },
  {
    id: "macro-scale",
    numeral: "III",
    title: "The Macro Scale",
    teaser: "Society as a quantum field.",
    body: MacroScaleBody,
  },
  {
    id: "synthesis",
    numeral: "IV",
    title: "The Synthesis",
    teaser: "Mapping the architecture of human belief.",
    body: SynthesisBody,
  },
  {
    id: "frontier",
    numeral: "V",
    title: "The Frontier",
    teaser: "Entropy Harvesting and applied solutions.",
    body: FrontierBody,
  },
  {
    id: "horizon",
    numeral: "VI",
    title: "The Empirical Horizon",
    teaser: "Architectural contributions and verification.",
    body: EmpiricalHorizonBody,
  },
];

type Reference = { authors: string; title: string; venue?: string };

const REFERENCES: Reference[] = [
  {
    authors: "Busemeyer, J. R., & Bruza, P. D.",
    title: "Quantum Models of Cognition and Decision",
    venue: "Cambridge University Press.",
  },
  {
    authors: "Busemeyer, J. R., & Yearsley, J. M.",
    title: "\u201CQuantum cognition and decision theories.\u201D",
    venue: "Trends in Cognitive Sciences.",
  },
  {
    authors: "Wang, Z., Solloway, T., Shiffrin, R. M., & Busemeyer, J. R.",
    title:
      "\u201CContext effects produced by question orders reveal quantum nature of human judgments.\u201D",
    venue: "PNAS.",
  },
  {
    authors: "Khrennikov, A.",
    title: "Social Laser and related articles on mean-field social laser models.",
  },
  {
    authors: "Wendt, A.",
    title: "Quantum Mind and Social Science",
    venue: "Cambridge University Press.",
  },
  {
    authors: "Tversky, A., & Kahneman, D.",
    title: "\u201CJudgment under Uncertainty: Heuristics and Biases.\u201D",
    venue: "Science.",
  },
  {
    authors: "von Neumann, J., & Morgenstern, O.",
    title: "Theory of Games and Economic Behavior",
    venue: "Princeton University Press.",
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
    const ids = [...SCIENCE_SECTIONS.map((s) => s.id), "references"];
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
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

  const sidebarItems: { id: string; numeral?: string; label: string }[] = [
    ...SCIENCE_SECTIONS.map((s) => ({ id: s.id, numeral: s.numeral, label: s.title })),
    { id: "references", label: "Selected References" },
  ];

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
            White Paper
          </span>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-[260px_1fr]">
          {/* Sidebar — section index + sub-page link */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="text-[11px] font-semibold tracking-[0.16em] uppercase text-muted-foreground mb-4">
              Contents
            </div>
            <ol className="space-y-1 mb-6">
              {sidebarItems.map((s) => {
                const active = s.id === activeId;
                return (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      onClick={(e) => {
                        const el = document.getElementById(s.id);
                        if (!el) return;
                        e.preventDefault();
                        el.scrollIntoView({ behavior: "smooth", block: "start" });
                        window.history.replaceState(null, "", `#${s.id}`);
                        setActiveId(s.id);
                      }}
                      className={cn(
                        "block rounded-lg px-3 py-2 text-sm leading-snug transition-colors",
                        active
                          ? "bg-primary/10 text-primary border-l-2 border-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-foreground/5 border-l-2 border-transparent"
                      )}
                    >
                      {s.numeral && (
                        <span className="font-mono text-[11px] mr-2 opacity-70">
                          {s.numeral}.
                        </span>
                      )}
                      {s.label}
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
                WHO ARE YOU?
              </h1>
              <div className="mt-6 space-y-5 text-base md:text-[17px] text-foreground/85 max-w-2xl">
                <p className="leading-relaxed">
                  Everyone thinks they know. Almost no one does. Society's
                  wicked problems have been studied from the outside in for
                  decades, yet they persist because the interior states that
                  actually drive every vote, purchase, and commitment remain
                  only coarsely mapped by existing methods. Classical models
                  show important limitations because polls and surveys{" "}
                  <em className="text-foreground/95">
                    "measure the collapse, not the state."
                  </em>
                </p>
                <p className="leading-relaxed">
                  The Belief Genome Project (BGP) is a measurement architecture
                  designed to map that interior landscape. By synthesizing
                  decades of cognitive science and quantum probability, the BGP
                  provides an empirical framework to measure human contradiction
                  not as an error, but as a feature of a highly complex mind.
                </p>
              </div>
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

            {/* Selected References */}
            <motion.section
              id="references"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
              className="scroll-mt-28 mt-20 pt-10 border-t border-border"
            >
              <header className="mb-6">
                <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-primary/80 mb-2">
                  References
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground leading-tight">
                  Selected References
                </h2>
              </header>
              <ol className="space-y-3 text-sm md:text-[15px] text-foreground/80 leading-relaxed list-decimal pl-5 marker:text-primary/60 marker:font-mono">
                {REFERENCES.map((r) => (
                  <li key={r.authors + r.title} className="pl-1">
                    <span className="text-foreground/90">{r.authors}</span>{" "}
                    <em className="not-italic text-foreground">{r.title}</em>
                    {r.venue && (
                      <>
                        {". "}
                        <span className="italic text-foreground/75">
                          {r.venue}
                        </span>
                      </>
                    )}
                  </li>
                ))}
              </ol>
            </motion.section>

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
                    The seven constructs, the candidate-architecture
                    qualification, and the falsification test that anchors the
                    project.
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
