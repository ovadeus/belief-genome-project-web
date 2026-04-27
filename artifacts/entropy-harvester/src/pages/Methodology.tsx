import { PublicLayout } from "@/components/layout/PublicLayout";

export default function Methodology() {
  return (
    <PublicLayout>
      <div className="py-24 px-4 max-w-4xl mx-auto">
        <div className="mb-16">
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-6">Methodology</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Standard Likert scales force humans to collapse their complex, nuanced beliefs into a binary or a meaningless midpoint. Entropy Harvester captures the full spectrum of cognitive uncertainty.
          </p>
        </div>

        <div className="space-y-16">
          <section>
            <h2 className="font-display text-3xl font-semibold mb-6">The Illusion of the Midpoint</h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none text-lg text-muted-foreground leading-relaxed space-y-6">
              <p>
                When a respondent selects "Neutral" or "Neither Agree nor Disagree" on a standard 5-point Likert scale, they are forced to collapse a complex cognitive state into a single, ambiguous data point. Are they truly apathetic? Do they lack sufficient information to form an opinion? Are they deeply conflicted between two equally strong but opposing values? Or did they simply rush through the survey to claim an incentive?
              </p>
              <p>
                Traditional survey instruments cannot distinguish between these radically different states of mind. They treat apathy, ignorance, and profound cognitive conflict as mathematically identical. This is a fundamental failure of measurement.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-display text-3xl font-semibold mb-6">Preserving Epistemic Superposition</h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none text-lg text-muted-foreground leading-relaxed space-y-6">
              <p>
                Entropy Harvester operates on a different principle: we preserve the superposition. Instead of forcing a premature collapse into a discrete category, we provide a continuous 100-point spectrum. More importantly, we capture the <em>behavioral trace</em> of the respondent's decision-making process.
              </p>
              <p>
                The journey to an answer reveals as much as the destination itself. By tracking how a user interacts with the Entropy Slider, we extract four critical behavioral signals:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="bg-card p-6 rounded-xl border border-border/50">
                  <h3 className="font-semibold text-foreground mb-2">Time to First Interaction</h3>
                  <p className="text-base">Measures cognitive load and intuitive response delay. A long pause suggests deep contemplation or unfamiliarity, while a fast interaction implies strong, pre-existing conviction.</p>
                </div>
                <div className="bg-card p-6 rounded-xl border border-border/50">
                  <h3 className="font-semibold text-foreground mb-2">Oscillation Score</h3>
                  <p className="text-base">Quantifies the back-and-forth movement across the midpoint. High oscillation indicates profound internal conflict and competing values weighing on the decision.</p>
                </div>
                <div className="bg-card p-6 rounded-xl border border-border/50">
                  <h3 className="font-semibold text-foreground mb-2">Path Entropy Score</h3>
                  <p className="text-base">Calculated using Shannon entropy across 10 fixed value-bins. It measures the unpredictability and noise in the respondent's journey to their final resting point.</p>
                </div>
                <div className="bg-card p-6 rounded-xl border border-border/50">
                  <h3 className="font-semibold text-foreground mb-2">Interaction Trace</h3>
                  <p className="text-base">A high-fidelity temporal map of the cursor's movement, sampled at 10Hz. This trace provides a complete picture of the respondent's micro-hesitations and adjustments.</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-3xl font-semibold mb-6">The Superposition Zone</h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none text-lg text-muted-foreground leading-relaxed space-y-6">
              <p>
                The center of our spectrum (bands 45–55) represents the <strong>Superposition Zone</strong>. When a respondent's final answer lands here, we do not assume neutrality. Instead, we cross-reference this position with their behavioral signals.
              </p>
              <p>
                A final position in the Superposition Zone with low oscillation and low path entropy suggests genuine apathy or lack of information. The same position reached after high oscillation and significant path entropy reveals a deeply conflicted mind—a state of high cognitive tension that traditional surveys completely miss.
              </p>
              <p>
                By preserving these behavioral traces, Entropy Harvester allows researchers to map the true contours of human belief, moving beyond flat data points into the rich topology of cognition.
              </p>
            </div>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
