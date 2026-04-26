import { type ReactNode } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";

// Shared prose styling for the long-form body — mirrors the Overview page
// conventions (blue for BGP-coined terms, bold-foreground for researcher
// names, muted body text on the cream background).
const P_CLS = "mb-5 leading-relaxed text-foreground/85";
const H2_CLS =
  "mt-20 mb-6 text-2xl md:text-3xl font-display font-bold text-foreground leading-tight";
const H3_CLS =
  "mb-3 text-xl md:text-2xl font-display font-semibold text-foreground leading-tight";
const TERM_CLS = "font-semibold text-primary";
const NAME_CLS = "font-semibold text-foreground";

type Construct = {
  number: string;
  title: string;
  description: ReactNode;
  differs: ReactNode;
};

const CONSTRUCTS: Construct[] = [
  {
    number: "01",
    title: "The 124-Dimension Belief Architecture",
    description: (
      <>
        A proposed structured measurement space distributing human belief across 11 categories —
        epistemology, spirituality, morality, psychology, relationships, social, political,
        economics, science and technology, education, and health — and 124 specific dimensions
        within them. Each dimension is scored on a 0–9 scale{" "}
        <strong className="font-semibold text-foreground">
          where the value 5 is explicitly defined as genuine superposition
        </strong>
        , not neutrality, indifference, or weak preference.
      </>
    ),
    differs: (
      <>
        Standard psychometric instruments measure a small number of related dimensions, typically
        a single latent construct decomposed into a handful of sub-scales. Quantum cognition
        research, to the project's knowledge, has used the formalism primarily to model specific
        cognitive effects in laboratory tasks — categorization, question-order effects, decision
        making — rather than to specify a fixed, high-dimensional whole-worldview architecture
        (Aerts et al., 2013; Wang et al., 2014; reviewed in Pothos &amp; Busemeyer, 2022). The
        124-dimension architecture is designed with the intent of enabling observation of
        cross-dimensional interference and entanglement at a resolution smaller-scale instruments
        cannot capture. Whether such patterns will in fact emerge in this architecture is an
        empirical question awaiting test.
      </>
    ),
  },
  {
    number: "02",
    title: "The Cognitive Que-Bit",
    description: (
      <>
        The proposed architectural unit of belief measurement — a single dimension of belief
        represented as a quantum-cognitive vector in a two-dimensional Hilbert space whose poles
        correspond to the extreme response categories. Midpoint responses correspond to
        superposition states with specific amplitude and phase properties.
      </>
    ),
    differs: (
      <>
        The use of two-dimensional Hilbert spaces to represent binary cognitive judgments is
        standard within quantum cognition (Busemeyer &amp; Bruza, 2024). What the{" "}
        <span className={TERM_CLS}>Cognitive Que-Bit</span> proposes is the elevation of this
        representation into a standardized cross-domain unit deployed identically across a fixed
        124-dimension architecture, rather than as a per-task modeling choice.{" "}
        <span className={NAME_CLS}>Busemeyer</span> and{" "}
        <span className={NAME_CLS}>Bruza</span>'s framework does not propose a single omnibus
        unit of belief measurement of this kind. <span className={NAME_CLS}>Khrennikov</span>'s
        Social Laser theory models social atoms in terms of social energy and population states
        rather than detailed internal belief coordinates (Khrennikov, 2020). The{" "}
        <span className={TERM_CLS}>Que-Bit</span> is novel in its naming and in its proposed role
        as an architectural primitive — its empirical adequacy in that role remains to be
        demonstrated.
      </>
    ),
  },
  {
    number: "03",
    title: "The Collapse Event",
    description: (
      <>
        A proposed formalization of any decision-forcing measurement that projects a
        superposition state onto a definite outcome. Surveys, votes, purchases, and commitments
        are treated under this construct as distinct measurement operators acting on a common,
        high-dimensional belief space. The framework treats these moments not as passive
        detections of a pre-existing preference but as active projections that partly constitute
        the measured state.
      </>
    ),
    differs: (
      <>
        Quantum cognition has long modeled choices, survey responses, and decisions as
        measurements that collapse cognitive states; this conceptual move is well established
        within the program (Pothos &amp; Busemeyer, 2013; Busemeyer &amp; Bruza, 2024). The{" "}
        <span className={TERM_CLS}>Collapse Event</span> proposes a unification of these
        treatments — formalizing the diverse decision-forcing moments of everyday life as
        distinct operators within a single structured belief architecture rather than as
        task-specific modeling choices. The conceptual move is incremental rather than radical,
        but the unified, architecture-level treatment is original to this proposal.
      </>
    ),
  },
  {
    number: "04",
    title: "The Collapse Gap",
    description: (
      <>
        A proposed metric: the measurable divergence between a fast, intuitive (System 1)
        collapse and a slow, deliberative (System 2) collapse on the same belief dimension. The
        gap is offered as a quantitative signature of internal doubt and tension between
        dual-process cognition.
      </>
    ),
    differs: (
      <>
        <span className={NAME_CLS}>Daniel Kahneman</span>'s dual-process theory (Kahneman, 2011)
        establishes the qualitative distinction between System 1 and System 2. Quantum cognition
        models interference between cognitive states (Busemeyer &amp; Bruza, 2024). The{" "}
        <span className={TERM_CLS}>Collapse Gap</span> proposes to fuse these two threads —
        operationalizing the divergence between fast and slow collapse on the same dimension as a
        directly measurable, dimension-level metric routinely produced by the instrument. The
        project is not aware of a prior named construct or standard quantum-cognitive instrument
        that operationalizes &ldquo;fast vs. slow collapse on the same dimension&rdquo; as a
        routine measured quantity. Whether this metric has predictive utility is an open
        empirical question.
      </>
    ),
  },
  {
    number: "05",
    title: "Entropy Harvesting",
    description: (
      <>
        A proposed methodology for extracting structured cognitive information from the context
        of the collapse — micro-behavioral signals, probability responses, hesitation patterns,
        and contextual drift gathered during ambient, low-stakes interactions. The methodology
        treats this contextual variance not as nuisance to be minimized but as primary signal.
      </>
    ),
    differs: (
      <>
        Classical psychometrics is generally designed to maximize signal-to-noise ratios,
        treating contextual variance and micro-behavioral fluctuation as nuisance. Quantum-like
        and contextual models within cognitive science take context effects seriously (Pothos
        &amp; Busemeyer, 2022; Wang et al., 2014), but the project is not aware of a documented
        methodology under this or a similar name that systematically captures micro-behavioral
        signals and contextual drift during low-stakes interactions as primary data.{" "}
        <span className={TERM_CLS}>Entropy Harvesting</span> is offered as a candidate
        methodology; its instrumentation, validation, and analytical pipelines remain to be
        developed and tested.
      </>
    ),
  },
  {
    number: "06",
    title: "The 136-Character Belief Genome Serial",
    description: (
      <>
        A proposed transmissible output representation — a 136-character encoding intended to
        summarize a respondent's measured belief state across all 124 dimensions at a given
        moment. The serial is designed to be analyzable at the dimension level, the cluster
        level, and the whole-state level, and to be comparable across time, across individuals,
        and across framing contexts.
      </>
    ),
    differs: (
      <>
        Existing quantum-cognition research focuses on modeling response probabilities and
        effects at the level of specific tasks rather than on producing compact, portable
        fingerprints of individual worldviews (Pothos &amp; Busemeyer, 2022). Classical
        psychometrics produces aggregate scores within particular instruments. The{" "}
        <span className={TERM_CLS}>Belief Genome Serial</span> proposes a novel output format
        intended to make individual belief states portable, comparable, and machine-readable
        across contexts. Its specific length, encoding scheme, and analytical utility are
        project-specific design choices that have not been independently validated.
      </>
    ),
  },
  {
    number: "07",
    title: "Longitudinal Worldview Mapping",
    description: (
      <>
        A proposed approach for systematically tracking how an individual's superposition states
        evolve across repeated measurement over time. Under this construct, repeated collapse
        events leave structured traces — scars — where superposition has narrowed into
        near-classical determinism. The map records which dimensions remain in active
        superposition, which are collapsing, and which have hardened into stable belief.
      </>
    ),
    differs: (
      <>
        Standard longitudinal psychometric and attitude research tracks changes in mean levels,
        trajectories, and stability of aggregate scores over time.{" "}
        <span className={TERM_CLS}>Longitudinal Worldview Mapping</span> proposes instead to
        track the structural state of superposition itself — distinguishing belief that has
        narrowed from belief that has resolved, and treating the trajectory of collapse as a
        measurable property of the individual within a quantum-cognitive frame. The project is
        not aware of prior work using this specific concept or terminology. Its analytical
        methods and the empirical detectability of &ldquo;scar&rdquo; patterns remain to be
        specified and tested.
      </>
    ),
  },
];

// References & Further Reading. Each reference renders APA-style with a
// clickable DOI link (where available) that opens in a new tab.
type Reference = {
  authors: string;
  year: string;
  title: ReactNode; // ReactNode so we can include &amp;-style entities cleanly
  source: ReactNode; // includes journal/publisher and trailing punctuation
  doi?: string;
};

type ReferenceGroup = {
  heading: string;
  refs: Reference[];
};

const REFERENCES: ReferenceGroup[] = [
  {
    heading: "Quantum Cognition: Foundational Texts",
    refs: [
      {
        authors: "Busemeyer, J. R., & Bruza, P. D.",
        year: "2012",
        title: "Quantum models of cognition and decision.",
        source: "Cambridge University Press.",
      },
      {
        authors: "Busemeyer, J. R., & Bruza, P. D.",
        year: "2024",
        title: "Quantum models of cognition and decision: Principles and applications",
        source: " (2nd ed.). Cambridge University Press.",
        doi: "https://doi.org/10.1017/9781009205351",
      },
      {
        authors: "Pothos, E. M., & Busemeyer, J. R.",
        year: "2013",
        title: "Can quantum probability provide a new direction for cognitive modeling?",
        source: " Behavioral and Brain Sciences, 36(3), 255–274.",
        doi: "https://doi.org/10.1017/S0140525X12001525",
      },
      {
        authors: "Pothos, E. M., & Busemeyer, J. R.",
        year: "2022",
        title: "Quantum cognition.",
        source: " Annual Review of Psychology, 73, 749–778.",
        doi: "https://doi.org/10.1146/annurev-psych-033020-123501",
      },
    ],
  },
  {
    heading: "The QQ Equality",
    refs: [
      {
        authors: "Wang, Z., Solloway, T., Shiffrin, R. M., & Busemeyer, J. R.",
        year: "2014",
        title:
          "Context effects produced by question orders reveal quantum nature of human judgments.",
        source: " Proceedings of the National Academy of Sciences, 111(26), 9431–9436.",
        doi: "https://doi.org/10.1073/pnas.1407756111",
      },
    ],
  },
  {
    heading: "Concepts as Quantum-Like States",
    refs: [
      {
        authors: "Aerts, D., Gabora, L., & Sozzo, S.",
        year: "2013",
        title:
          "Concepts and their dynamics: A quantum-theoretic modeling of human thought.",
        source: " Topics in Cognitive Science, 5(4), 737–772.",
        doi: "https://doi.org/10.1111/tops.12042",
      },
    ],
  },
  {
    heading: "Quantum Social Theory",
    refs: [
      {
        authors: "Khrennikov, A.",
        year: "2010",
        title: "Ubiquitous quantum structure: From psychology to finance.",
        source: "Springer.",
      },
      {
        authors: "Khrennikov, A.",
        year: "2020",
        title:
          "Social laser: Application of quantum information and field theories to modeling of social processes.",
        source: "Jenny Stanford Publishing.",
      },
    ],
  },
];

const BODY: ReactNode = (
  <>
    {/* Section 1 — The Inheritance vs. The Original Synthesis */}
    <h2 className={H2_CLS} style={{ marginTop: 0 }}>
      The Inheritance vs. The Original Synthesis
    </h2>
    <p className={P_CLS}>
      The Belief Genome Project draws on a body of peer-reviewed scholarship in quantum cognition
      and quantum-like social theory. The mathematical formalism developed by{" "}
      <span className={NAME_CLS}>Jerome Busemeyer</span> and{" "}
      <span className={NAME_CLS}>Peter Bruza</span> (2012, 2024), the empirical work on the QQ
      equality by{" "}
      <span className={NAME_CLS}>
        Zheng Wang, Tyler Solloway, Richard Shiffrin, and Jerome Busemeyer
      </span>{" "}
      (2014), the
      Social Laser theory advanced by <span className={NAME_CLS}>Andrei Khrennikov</span> (2010,
      2020), and the quantum-social ontology articulated by{" "}
      <span className={NAME_CLS}>Alexander Wendt</span> (2015) are all serious scholarly
      contributions, each published in peer-reviewed venues and engaged with by other researchers
      in their respective subfields.
    </p>
    <p className={P_CLS}>
      These works are not, however, consensus foundations of mainstream cognitive science. They
      constitute an active, specialized research program — coherent and developing, but still
      niche relative to the broader literature. Their levels of empirical support also differ:
      the QQ equality has the strongest evidence base, demonstrated by{" "}
      <span className={NAME_CLS}>Wang</span> and colleagues across roughly 70 national survey
      datasets and subsequently applied and extended in additional studies (Wang et al., 2014);{" "}
      <span className={NAME_CLS}>Busemeyer</span> and{" "}
      <span className={NAME_CLS}>Bruza</span>'s broader formalism has been used to model a range
      of decision and judgment phenomena (see Pothos &amp; Busemeyer, 2013, 2022, for
      state-of-the-field reviews); <span className={NAME_CLS}>Khrennikov</span>'s Social Laser
      theory remains primarily a theoretical and modeling framework with limited direct empirical
      replication (Khrennikov, 2020); <span className={NAME_CLS}>Wendt</span>'s quantum-social
      ontology is largely theoretical and philosophical, and remains contested within social
      science (Wendt, 2015).
    </p>
    <p className={P_CLS}>
      What the Belief Genome Project adds is not new physics or new mathematics. It is a proposed
      measurement architecture — an applied synthesis that takes the quantum-cognitive grammar
      developed by these researchers and operationalizes it into an instrument intended to map
      individual belief states across a structured 124-dimension space.
    </p>
    <p className={P_CLS}>
      The seven constructs catalogued below are original proposals inspired by, but distinct
      from, the prior work above. None has been independently peer-reviewed or empirically
      validated as of this writing. They are presented for the field's review, refinement, and
      testing.
    </p>

    {/* Section 2 — The Seven Original Constructs */}
    <h2 className={H2_CLS}>The Seven Original Constructs</h2>
    <div className="space-y-12">
      {CONSTRUCTS.map((c) => (
        <article key={c.number}>
          <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-primary mb-2 font-display">
            Construct {c.number}
          </div>
          <h3 className={H3_CLS}>{c.title}</h3>
          <p className={P_CLS}>{c.description}</p>
          <div className="mt-4 border-l-2 border-primary/30 pl-5 py-1">
            <p className="text-sm leading-relaxed text-foreground/70">
              <span className="font-semibold text-foreground/90">
                How this proposal differs from prior work.
              </span>{" "}
              {c.differs}
            </p>
          </div>
        </article>
      ))}
    </div>

    {/* Section 3 — The Qualification: A Candidate Architecture */}
    <h2 className={H2_CLS}>The Qualification: A Candidate Architecture</h2>
    <blockquote className="my-6 border-l-4 border-primary/60 pl-5 text-lg md:text-xl font-display italic text-foreground leading-snug">
      The Belief Genome Project is currently a candidate architecture to be tested, not a settled
      result.
    </blockquote>
    <p className={P_CLS}>
      This qualification is exact and important. The architecture is grounded in real,
      peer-reviewed prior work in quantum cognition — but the architecture itself, and each of
      the seven constructs above, has not yet been empirically verified. Its specific commitments
      — that midpoints encode genuine superposition, that the 124-dimension space is structured
      to reveal interference, that the <span className={TERM_CLS}>Cognitive Que-Bit</span> is the
      appropriate architectural primitive, that the{" "}
      <span className={TERM_CLS}>Collapse Gap</span> carries predictive information — are claims
      awaiting experimental test.
    </p>
    <p className={P_CLS}>
      The project takes this distinction seriously. It does not claim to have proven what it has
      proposed. It claims that the underlying quantum-cognitive formalism is proven worth testing
      in new contexts, and that the architecture proposed here is one such context worth
      submitting to test.
    </p>

    {/* Section 4 — The Falsification Test */}
    <h2 className={H2_CLS}>The Falsification Test</h2>
    <p className="mb-6 text-lg md:text-xl text-foreground font-display leading-snug">
      The central testable prediction of the Belief Genome Project is a stratified extension of
      the QQ equality to within-subject designs.
    </p>
    <p className={P_CLS}>
      In plain terms: if midpoints encode genuine superposition rather than weak preference, then
      individuals who select midpoints on a belief scale should behave, under subsequent related
      measurement, in structurally distinct ways from individuals who select adjacent values.
      They should exhibit larger QQ equality magnitudes, stronger context-sensitivity, and
      collapse-outcome distributions inconsistent with classical mixture expectations.
    </p>
    <p className={P_CLS}>
      The classical interpretation predicts that midpoint-stratified subgroups should look, in
      aggregate, like a population-weighted mixture of adjacent-value subgroups. The
      superposition interpretation predicts they should look qualitatively different.
    </p>
    <p className={P_CLS}>
      The two interpretations are empirically distinguishable in principle. The test requires no
      novel mathematical formalism beyond what <span className={NAME_CLS}>Busemeyer</span> and{" "}
      <span className={NAME_CLS}>Bruza</span> (2024) have developed, and conceptually extends the
      design <span className={NAME_CLS}>Wang</span> and colleagues used to test QQ equality on
      roughly 70 national survey datasets (Wang et al., 2014). Within-subject designs with
      subgroup stratification will increase sample-size requirements relative to the original{" "}
      <span className={NAME_CLS}>Wang et al.</span> studies, but the design appears tractable
      within standard survey research budgets given careful power analysis.
    </p>
    <p className={P_CLS}>
      A rigorous test will need to specify precise quantitative predictions in advance, control
      for known confounds (measurement error, scale-use heterogeneity, individual differences in
      response style, attrition between measurement waves), and pre-register statistical criteria
      for what counts as &ldquo;systematically larger&rdquo; QQ magnitudes. None of these
      requirements are unusual for serious psychometric work, but each must be addressed for the
      test to discriminate the superposition interpretation from sophisticated classical
      alternatives.
    </p>
    <p className={P_CLS}>
      The test is falsifiable. If midpoint-stratified subgroups do not exhibit systematically
      larger QQ equality magnitudes than weighted averages of adjacent strata across multiple
      independent samples, the superposition interpretation fails — and the architecture's
      measurement commitments require revision.
    </p>

    {/* Section 5 — The Call to Action */}
    <h2 className={H2_CLS}>The Call to Action</h2>
    <p className={P_CLS}>
      The theoretical grounds are established. The empirical program is specified. The
      experimental work remains to be done.
    </p>
    <p className={P_CLS}>
      The Belief Genome Project is built to be tested — by independent researchers, evaluated by
      independent labs, and extended or refuted by anyone working on the descriptive adequacy of
      belief measurement. The framework is open to verification, to falsification, and to
      refinement.
    </p>
    <p className="mt-8 mb-2 text-lg md:text-xl font-display italic text-primary leading-snug">
      We invite the scientific, technological, and research communities to help us test the
      blueprint of the human mind.
    </p>

    {/* Section 6 — References & Further Reading */}
    <h2 className={H2_CLS}>References &amp; Further Reading</h2>
    <p className={P_CLS}>
      The works below are the primary peer-reviewed sources the Belief Genome Project draws on.
      Readers interested in evaluating the inheritance, the construct claims, or the proposed
      falsification test will find each citation a useful entry point into the broader
      literature.
    </p>
    <div className="mt-6">
      {REFERENCES.map((group) => (
        <section key={group.heading} className="mb-8">
          <h3 className="text-[11px] font-semibold tracking-[0.18em] uppercase text-primary mt-8 mb-4 font-display">
            {group.heading}
          </h3>
          <ul className="space-y-4 list-none pl-0">
            {group.refs.map((ref, i) => (
              <li
                key={`${group.heading}-${i}`}
                className="pl-6 -indent-6 text-sm leading-relaxed text-foreground/75"
              >
                {ref.authors} ({ref.year}). <em>{ref.title}</em>
                {ref.source}
                {ref.doi && (
                  <>
                    {" "}
                    <a
                      href={ref.doi}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all"
                    >
                      {ref.doi}
                    </a>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  </>
);

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
            &ldquo;candidate architecture&rdquo; qualification that frames their status, and the
            falsification test that anchors the framework to empirical reality.
          </p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-base md:text-[17px] text-foreground/85"
        >
          {BODY}
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
