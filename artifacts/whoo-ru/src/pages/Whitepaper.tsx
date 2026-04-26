import { Fragment, useEffect, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PersonHoverCard } from "@/components/PersonHoverCard";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import whoAreYouVideo from "@assets/who-are-you_1777238654031.mp4";

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
        Aggregated BGP-style architectures will provide population-level maps
        of belief configurations that underlie policy preferences and collective
        action, complementing existing survey and modeling tools.
      </>
    ),
  },
  {
    label: "Self-exploration tools",
    body: (
      <>
        Committed engagement could allow individuals to explore patterns of
        consistency, conflict, and change in their own beliefs over time, for
        personal growth and core understanding.
      </>
    ),
  },
  {
    label: "AI–human preference modeling",
    body: (
      <>
        Encoded representations of individual belief states may offer one input
        to future approaches to transparent, personalized AI alignment, with
        potential applications in personal assistants, robotics, and broader AI
        systems. Realizing this potential will require rigorous empirical
        validation and robust ethical safeguards.
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

export const WHITEPAPER_SECTIONS: Section[] = [
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

const ORIGINAL_CONTRIBUTIONS_HREF = "/whitepaper/original-contributions";

// ─────────────────────────────────────────────────────────────────────────────
// Heritage Timeline — interactive interlude rendered between Section I and II.
// Three-band horizontal rail (Classical → Quantum Cognition → Synthesis) with
// always-visible year/name/theory and a hover-card revealing the full
// contribution detail.
// ─────────────────────────────────────────────────────────────────────────────

type Band = 1 | 2 | 3;

type TimelineEntry = {
  year: string;
  name: string;
  theory: string;
  detail: ReactNode;
  band: Band;
};

const TIMELINE_ENTRIES: TimelineEntry[] = [
  {
    year: "1763",
    name: "Thomas Bayes",
    theory: "Bayesian probability",
    band: 1,
    detail:
      "The mathematical principle that lets us treat belief as a quantity that can be revised in light of new evidence — the foundational insight for everything that followed in the formal study of belief under uncertainty.",
  },
  {
    year: "1944",
    name: "von Neumann & Morgenstern",
    theory: "Expected Utility Theory",
    band: 1,
    detail:
      "Formalized the “rational actor” as a classical bit — humans modeled as utility-optimizing agents with stable preferences. The dominant decision-making model for half a century, and the assumption the next two generations of cognitive science set out to test.",
  },
  {
    year: "1949",
    name: "Donald Hebb",
    theory: "Hebbian Learning",
    band: 1,
    detail:
      "“Cells that fire together wire together.” Established the neural basis of belief formation, anchoring cognition in biology and providing the substrate later inherited by connectionist and modern AI models.",
  },
  {
    year: "1974",
    name: "Tversky & Kahneman",
    theory: "Heuristics & Biases",
    band: 1,
    detail:
      "The heuristics-and-biases program demonstrated that humans systematically violate the laws of classical probability — exposing the gap between the rational-actor ideal and how minds actually decide.",
  },
  {
    year: "1983",
    name: "Tversky & Kahneman",
    theory: "The Linda Problem",
    band: 1,
    detail:
      "The conjunction fallacy — concrete empirical evidence that classical probability cannot account for context-dependent, contradictory human judgments. The wedge that opened the door to alternative formalisms.",
  },
  {
    year: "2010",
    name: "Andrei Khrennikov",
    theory: "Quantum-Like Models",
    band: 2,
    detail:
      "Developed the formal apparatus for applying non-classical (quantum-like) probability to human judgment in cognition and the social sciences — a mathematics willing to treat ambiguity, order effects, and context as first-class citizens.",
  },
  {
    year: "2012",
    name: "Busemeyer & Bruza",
    theory: "Quantum Models of Cognition",
    band: 2,
    detail: (
      <>
        The canonical text (
        <em className="not-italic font-medium">Cambridge University Press</em>)
        formalizing superposition, interference, and non-commutativity in human
        judgment — the mathematical grammar the BGP inherits.
      </>
    ),
  },
  {
    year: "2013",
    name: "Wang, Busemeyer et al.",
    theory: "The QQ Equality",
    band: 2,
    detail:
      "First precise, parameter-free empirical signature of quantum-like question-order effects observed in real survey data — a falsifiable prediction satisfied across many datasets.",
  },
  {
    year: "2015",
    name: "Alexander Wendt",
    theory: "Quantum Mind & Social Science",
    band: 2,
    detail:
      "Ontological bridge proposing that human beings and social systems can be modeled as “walking wave functions” — extending quantum-like reasoning from cognition to society at large.",
  },
  {
    year: "≈2015–20",
    name: "Andrei Khrennikov",
    theory: "Social Laser Theory",
    band: 2,
    detail:
      "Mean-field quantum-like model showing how populations exhibit coherent amplification, polarization, and phase-transition–like behavior under social-information stimulation.",
  },
  {
    year: "2026",
    name: "Belief Genome Project",
    theory: "Operational Synthesis",
    band: 3,
    detail:
      "David Edwin Meyers integrates quantum cognition, social-laser dynamics, and quantum social ontology into a unified measurement architecture: 11 categories, 124 dimensions, the Cognitive Qubit, the Collapse Event, the Collapse Gap, Entropy Harvesting, the 136-character Belief Genome Serial, and Longitudinal Worldview Mapping.",
  },
];

const BAND_TEXT: Record<Band, string> = {
  1: "text-muted-foreground",
  2: "text-primary",
  3: "text-emerald-600",
};

function TimelineLabel({ entry }: { entry: TimelineEntry }) {
  return (
    <div className="space-y-0.5 px-0.5">
      <div className={cn("font-display font-bold text-[13px] leading-none tabular-nums", BAND_TEXT[entry.band])}>
        {entry.year}
      </div>
      <div className="text-[10px] font-semibold text-foreground leading-tight">
        {entry.name}
      </div>
      <div className="text-[9.5px] text-muted-foreground leading-tight italic">
        {entry.theory}
      </div>
    </div>
  );
}

function TimelineDot({ entry }: { entry: TimelineEntry }) {
  const dotClasses =
    entry.band === 1
      ? "border-foreground/50 bg-background group-hover:bg-foreground/10 group-hover:border-foreground"
      : entry.band === 2
        ? "border-primary bg-background group-hover:bg-primary/10"
        : "border-emerald-500 bg-emerald-50 ring-4 ring-emerald-500/20 group-hover:ring-emerald-500/40";

  return (
    <HoverCard openDelay={120} closeDelay={120}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          aria-label={`${entry.year} — ${entry.name}: ${entry.theory}`}
          className="group relative flex h-8 w-8 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span
            className={cn(
              "block h-3.5 w-3.5 rounded-full border-2 transition-all group-hover:scale-125",
              dotClasses
            )}
          />
        </button>
      </HoverCardTrigger>
      <HoverCardContent side="top" align="center" className="w-80 p-4">
        <div className="space-y-2.5">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span
              className={cn(
                "font-mono text-xs font-semibold tabular-nums",
                BAND_TEXT[entry.band]
              )}
            >
              {entry.year}
            </span>
            <span className="font-display font-semibold text-foreground text-[15px] leading-tight">
              {entry.name}
            </span>
          </div>
          <div
            className={cn(
              "text-[10px] font-semibold uppercase tracking-[0.16em]",
              BAND_TEXT[entry.band]
            )}
          >
            {entry.theory}
          </div>
          <p className="text-sm leading-relaxed text-foreground/85">
            {entry.detail}
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

function HeritageTimeline() {
  // Counts per band — used to size the underlying colored line + legend bar.
  // Adjust these if entries are added/removed and they will stay in proportion.
  const bandCounts = TIMELINE_ENTRIES.reduce(
    (acc, e) => {
      acc[e.band] += 1;
      return acc;
    },
    { 1: 0, 2: 0, 3: 0 } as Record<Band, number>
  );

  return (
    <motion.section
      aria-label="Heritage timeline"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="my-4"
    >
      <header className="mb-8 max-w-2xl">
        <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-primary/80 mb-2">
          Interlude
        </div>
        <h3 className="text-xl md:text-2xl font-display font-bold text-foreground leading-tight">
          A Heritage Timeline
        </h3>
        <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
          The intellectual lineage that prepares the ground for the Belief
          Genome Project. Hover any milestone to read the contribution it made.
        </p>
      </header>

      <div className="relative overflow-x-auto pb-3 -mx-2 sm:mx-0">
        {/* Desktop body column is ~796px on lg; min-w of 760px keeps the
            timeline scroll-free at lg+ while still allowing horizontal scroll
            on tablet/mobile. */}
        <div className="min-w-[760px] px-2">
          {/* Top labels — even-indexed entries (0, 2, 4, …) */}
          <div className="grid grid-cols-11 gap-1.5 items-end mb-3 min-h-[72px]">
            {TIMELINE_ENTRIES.map((e, i) => (
              <div key={`top-${i}`} className="text-center">
                {i % 2 === 0 && <TimelineLabel entry={e} />}
              </div>
            ))}
          </div>

          {/* Rail with colored band line + dot row */}
          <div className="relative h-8">
            {/* Colored line in three segments matching the band counts */}
            <div className="absolute inset-y-0 left-0 right-0 flex items-center">
              <div className="flex h-[2px] w-full">
                <div
                  className="bg-foreground/30"
                  style={{ flex: bandCounts[1] }}
                />
                <div
                  className="bg-primary/70"
                  style={{ flex: bandCounts[2] }}
                />
                <div
                  className="bg-emerald-500"
                  style={{ flex: bandCounts[3] }}
                />
              </div>
            </div>

            {/* Dots — perfectly aligned with the labels above/below */}
            <div className="relative grid grid-cols-11 gap-1.5 h-full items-center">
              {TIMELINE_ENTRIES.map((e, i) => (
                <div key={`dot-${i}`} className="flex justify-center">
                  <TimelineDot entry={e} />
                </div>
              ))}
            </div>
          </div>

          {/* Bottom labels — odd-indexed entries (1, 3, 5, …) */}
          <div className="grid grid-cols-11 gap-1.5 items-start mt-3 min-h-[72px]">
            {TIMELINE_ENTRIES.map((e, i) => (
              <div key={`bot-${i}`} className="text-center">
                {i % 2 !== 0 && <TimelineLabel entry={e} />}
              </div>
            ))}
          </div>

          {/* Band legend bar — same proportions as the rail above */}
          <div className="mt-8 grid grid-cols-11 gap-1.5">
            <div
              className="flex flex-col gap-1.5"
              style={{ gridColumn: `span ${bandCounts[1]} / span ${bandCounts[1]}` }}
            >
              <div className="h-1.5 rounded-full bg-foreground/30" />
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Classical &amp; Behavioral Foundations
              </div>
            </div>
            <div
              className="flex flex-col gap-1.5"
              style={{ gridColumn: `span ${bandCounts[2]} / span ${bandCounts[2]}` }}
            >
              <div className="h-1.5 rounded-full bg-primary/70" />
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                Quantum Cognition Programs
              </div>
            </div>
            <div
              className="flex flex-col gap-1.5"
              style={{ gridColumn: `span ${bandCounts[3]} / span ${bandCounts[3]}` }}
            >
              <div className="h-1.5 rounded-full bg-emerald-500" />
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-600">
                Synthesis
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground italic md:hidden">
        Scroll horizontally to explore the full timeline.
      </p>
    </motion.section>
  );
}

export default function Whitepaper() {
  const [activeId, setActiveId] = useState<string>(WHITEPAPER_SECTIONS[0].id);

  // Smooth-scroll to a hash on mount (handles deep-link navigation from the
  // navbar dropdown, e.g. /whitepaper#quantum-grammar).
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: "auto", block: "start" });
    });
  }, []);

  // Listen for in-page hash changes (clicking a sidebar anchor while already on /whitepaper).
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
    const ids = [...WHITEPAPER_SECTIONS.map((s) => s.id), "references"];
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
    ...WHITEPAPER_SECTIONS.map((s) => ({ id: s.id, numeral: s.numeral, label: s.title })),
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
              <div className="mb-8 overflow-hidden rounded-xl border border-border bg-foreground/5 shadow-sm">
                <video
                  src={whoAreYouVideo}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  aria-hidden="true"
                  className="block w-full h-auto"
                />
              </div>
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
              {WHITEPAPER_SECTIONS.map((s, i) => (
                <Fragment key={s.id}>
                  <motion.section
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

                  {/* Inject the Heritage Timeline between Section I and II. */}
                  {s.id === "heritage" && <HeritageTimeline />}
                </Fragment>
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
