import { motion } from "framer-motion";
import { PublicLayout } from "@/components/layout/PublicLayout";

const P_CLS = "mb-5 leading-relaxed text-foreground/85";
const H2_CLS =
  "mt-14 mb-5 text-2xl md:text-3xl font-display font-bold text-foreground";
const TERM_CLS = "font-semibold text-primary";
const NAME_CLS = "font-semibold text-primary";

type Concept = { term: string; body: string };

const CONCEPTS: Concept[] = [
  {
    term: "124-dimension belief architecture",
    body: "A proposed multidimensional space for representing belief across domains such as morality, politics, relationships, health, education, and science. This structure is intended to support analysis of cross-domain patterns rather than isolated single-topic scores.",
  },
  {
    term: "Cognitive Qubit",
    body: "A proposed unit of analysis for one belief dimension, modeled in a quantum-probabilistic state space. This is original BGP terminology rather than a standard term from the literature.",
  },
  {
    term: "Collapse Event",
    body: "A decision-forcing interaction, such as answering a question or making a choice, that turns an indeterminate or context-sensitive internal state into an explicit response.",
  },
  {
    term: "Collapse Gap",
    body: "A proposed metric for divergence between fast, intuitive responding and slower, deliberative responding on the same dimension.",
  },
  {
    term: "Entropy Harvesting",
    body: "A proposed method for treating hesitation, probability judgments, reframing effects, and other contextual traces as informative signal rather than disposable noise.",
  },
  {
    term: "Belief Genome Serial",
    body: "A compact encoding of a person's multidimensional response pattern at a given time.",
  },
  {
    term: "Longitudinal Worldview Mapping",
    body: "A way to track how belief states become more stable or remain context-sensitive across repeated measurements.",
  },
];

export default function Overview() {
  return (
    <PublicLayout>
      <article className="px-6 py-16 max-w-3xl mx-auto">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-6"
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.18em] text-primary/80 font-display">
            Overview
          </span>
        </motion.div>

        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mb-12 pb-8 border-b border-border"
        >
          <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground leading-tight">
            The Belief Genome Project
          </h1>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
            A measurement architecture for human belief — designed for context,
            contradiction, and change.
          </p>
        </motion.header>

        <div className="text-base md:text-[17px] text-foreground/85">
          <p className={P_CLS}>
            The Belief Genome Project (BGP) is a proposed measurement architecture
            for representing human belief in a more structured and context-sensitive
            way than conventional surveys typically allow. Rather than treating
            belief as a fixed point that can be cleanly read off from a single
            response, the project starts from a different premise: in many domains,
            what people say depends on context, question order, framing, and
            internal conflict. BGP is designed as a candidate system for measuring
            that instability directly, especially in cases where classical survey
            methods compress contradiction, hesitation, or ambivalence into a
            single number.
          </p>
          <p className={P_CLS}>
            The framework is inspired by three adjacent lines of work. The first
            is quantum cognition, especially the work of{" "}
            <span className={NAME_CLS}>Jerome R. Busemeyer</span> and{" "}
            <span className={NAME_CLS}>Peter D. Bruza</span>, which shows how
            quantum probability can be used to model judgment and decision
            phenomena that classical probability often struggles to capture. The
            second is the empirical literature on question-order effects,
            particularly the <span className={TERM_CLS}>QQ equality</span>, which
            provides one of the strongest demonstrations that context-sensitive
            judgments can display lawful statistical structure rather than mere
            noise. The third is quantum-like social theory, including work by{" "}
            <span className={NAME_CLS}>Alexander Wendt</span> and{" "}
            <span className={NAME_CLS}>Andrei Khrennikov</span>, which extends
            similar ideas to social ontology and population-level dynamics.
          </p>

          <h2 className={H2_CLS}>Why Existing Models Fall Short</h2>
          <p className={P_CLS}>
            Most standard surveys assume that a response is a reasonable
            approximation of a stable underlying preference. That assumption works
            well in many settings, but it becomes less convincing when people
            appear internally divided, react strongly to framing, or answer
            related questions differently depending on sequence and context. In
            those cases, the measurement tool may be capturing a momentary
            collapse of judgment rather than a stable, pre-existing belief state.
          </p>
          <p className={P_CLS}>
            This does not mean classical psychometrics is wrong. It means there
            may be a class of belief phenomena for which fixed-point models are
            incomplete. Quantum cognition is relevant here because it offers a
            formal language for representing incompatibility, interference, and
            contextual dependence in judgment without assuming that every observed
            response reflects a settled internal state.
          </p>

          <h2 className={H2_CLS}>Core Idea Behind BGP</h2>
          <p className={P_CLS}>
            BGP takes that formal intuition and asks what an instrument would
            look like if it were designed from the start to measure unstable,
            contradictory, or context-sensitive beliefs. In the current proposal,
            belief is represented across 11 domains and 124 dimensions, creating a
            structured state space rather than a short list of disconnected items.
            The goal is not simply to assign people scores, but to map where
            beliefs appear stable, where they appear conflicted, and where they
            appear highly sensitive to context.
          </p>
          <p className={P_CLS}>
            One of the central hypotheses concerns midpoint responses. In many
            ordinary surveys, a midpoint such as 5 on a 0–9 or 1–9 scale is
            treated as neutrality, weak preference, indecision, or low engagement.
            BGP proposes a different possibility: some midpoint responses may
            represent genuine superposition-like states in which a respondent is
            simultaneously holding competing but meaningful inclinations. That is
            not yet an established result. It is a testable hypothesis derived
            from the broader logic of quantum cognition.
          </p>

          <h2 className={H2_CLS}>Main Architectural Concepts</h2>
          <p className={P_CLS}>
            The concepts introduced here are original to the Belief Genome Project
            and represent, to the best of current knowledge, the first
            formulation of this particular measurement architecture in the
            behavioral-science literature. They are explicitly framed as
            proposals: they build on prior theory, but their novelty and
            usefulness must be established through future empirical work.
          </p>
          <p className={P_CLS}>
            For a general technical audience, the easiest way to read BGP is as a
            layered measurement design.
          </p>
          <dl className="mt-6 mb-6 space-y-5">
            {CONCEPTS.map((c) => (
              <div
                key={c.term}
                className="border-l-2 border-primary/40 pl-5"
              >
                <dt className={`${TERM_CLS} mb-1.5`}>{c.term}</dt>
                <dd className="leading-relaxed text-foreground/85">{c.body}</dd>
              </div>
            ))}
          </dl>
          <p className={P_CLS}>
            These concepts should be understood as architectural proposals, not
            validated scientific constructs. Their value depends on whether they
            improve measurement, prediction, or explanation relative to simpler
            alternatives.
          </p>

          <h2 className={H2_CLS}>How It Could Be Tested</h2>
          <p className={P_CLS}>
            The strongest case for BGP will come from falsifiable empirical tests,
            not from theoretical elegance alone. One promising test extends the
            logic of the <span className={TERM_CLS}>QQ equality</span>. The QQ
            literature shows that question order can produce highly regular
            response patterns that fit a quantum model of judgment. BGP proposes
            using similar logic at the subgroup level: compare people who
            frequently choose midpoints with people who choose adjacent values,
            then test whether midpoint-heavy respondents show distinct context
            effects that cannot be explained by a simple classical mixture model.
          </p>
          <p className={P_CLS}>
            If midpoint responders behave statistically like a weighted average of
            nearby response groups, then the superposition interpretation loses
            support. If they show systematically stronger order effects, framing
            sensitivity, or other non-classical patterns under preregistered
            conditions, then BGP gains evidence that midpoint responses may
            encode something more structured than indecision. This is the right
            scientific posture for the project: clear hypotheses, clear failure
            conditions, and direct comparison against conventional psychometric
            explanations.
          </p>

          <h2 className={H2_CLS}>Why It Matters</h2>
          <p className={P_CLS}>
            For a technical audience, the appeal of BGP is not that it promises a
            final theory of the mind. The appeal is that it reframes a familiar
            measurement problem: people are often contradictory, context-sensitive,
            and hard to summarize with static scores. Existing tools usually
            flatten that complexity. BGP asks whether some of that apparent
            inconsistency can be measured systematically rather than discarded.
          </p>
          <p className={P_CLS}>
            If the answer is no, the framework should fail under test. If the
            answer is yes, BGP could contribute a new layer to how belief,
            preference instability, and social decision processes are modeled.
            Either way, its scientific value depends on disciplined empirical
            validation, not on rhetorical novelty.
          </p>
        </div>
      </article>
    </PublicLayout>
  );
}
