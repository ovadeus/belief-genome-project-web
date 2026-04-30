import { PublicLayout } from "@/components/layout/PublicLayout";
import { Link } from "wouter";
import { FlaskConical } from "lucide-react";

const GENOME_APP_URL = (
  (import.meta.env.VITE_GENOME_APP_URL as string | undefined) || "/genome-app/"
).replace(/\/$/, "");

export default function UserTesting() {
  return (
    <PublicLayout>
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2 font-display">
          Call for User Testers
        </h1>
        <p className="text-muted-foreground mb-12">
          Help us shape the Belief Genome Project — beta testing is open.
        </p>

        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 md:p-8 mb-12 flex gap-4 items-start">
          <FlaskConical className="text-primary shrink-0 mt-1" size={24} />
          <div>
            <p className="text-primary font-display font-semibold text-lg mb-1">
              We need you
            </p>
            <p className="text-foreground/90 leading-relaxed">
              The Belief Genome Project is in active beta and we're inviting
              curious people to try it, push on it, and tell us what works and
              what doesn't. Your reflections, hesitations, and "wait, what does
              this mean?" moments are exactly what we need to refine the
              experience. No technical background required — just bring your
              honest curiosity. Sign up by completing the consent form below
              and following the steps.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            How to participate
          </h2>

          <ol className="space-y-6">
            <Step n={1} title="Complete the Consent Form">
              Start by reviewing and signing our short{" "}
              <Link
                href="/consent"
                className="text-primary hover:underline underline-offset-4"
              >
                Participant Consent Form
              </Link>
              . It explains what data we collect (anonymous belief responses,
              never your real-world identity) and confirms your agreement to
              participate.
            </Step>

            <Step n={2} title="Register and sign in">
              Create your account on the{" "}
              <a
                href={`${GENOME_APP_URL}/register`}
                className="text-primary hover:underline underline-offset-4"
              >
                Belief Genome web app
              </a>
              . Your email is used only to log you back in — it is never tied
              to your belief responses.
            </Step>

            <Step n={3} title="Open Reflections">
              Once you're signed in, click <strong>Reflections</strong> in the
              top navigation bar to start answering belief probes.
            </Step>

            <Step n={4} title="Answer 20–30 probes">
              Each probe is a short statement you respond to on a 0–9 scale.
              Answer 20–30 of them to begin populating your Belief DNA band.
              Skip anything that doesn't apply — there are no wrong answers.
            </Step>

            <Step n={5} title="View your DNA Color Band">
              Head to the <strong>Dashboard</strong> to see your Belief DNA
              Color Band fill in. Each colored cell represents one of the 124
              belief dimensions in the framework.
            </Step>

            <Step n={6} title="Fill in specific dimensions (optional)">
              Click any of the gray, unpopulated bars in the band to answer
              probes targeted to that specific dimension and category. This is
              the fastest way to round out areas of the band that interest you.
            </Step>

            <Step n={7} title="Explore the visualizations">
              After roughly 30–50 probe answers, your Dashboard unlocks
              meaningful visualizations. Try each one:
              <ul className="list-disc list-inside mt-3 space-y-1 text-muted-foreground">
                <li>Belief DNA</li>
                <li>Triple Helix</li>
                <li>Neuromap</li>
                <li>Radar</li>
                <li>Breakdown</li>
                <li>Timeline</li>
                <li>History</li>
              </ul>
            </Step>

            <Step n={8} title="Explore the Quantum Cognition Belief Engine">
              Navigate through the Quantum Cognition Belief Engine to see how
              your responses are interpreted as a coherent belief structure —
              this is the core analytical layer of the platform.
            </Step>

            <Step n={9} title="Send us feedback">
              When something delights you, confuses you, or breaks for you,
              open your <strong>Profile</strong> area and click the{" "}
              <strong>Feedback</strong> button. Every note helps us improve
              the next iteration.
            </Step>
          </ol>
        </div>

        <div className="mt-16 pt-10 border-t border-border text-center">
          <p className="text-muted-foreground mb-6">
            Ready to begin? Start with the consent form.
          </p>
          <Link
            href="/consent"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-display font-semibold hover:bg-primary/90 transition-colors"
          >
            Go to Consent Form
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-5 items-start">
      <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center font-display font-semibold text-primary">
        {n}
      </div>
      <div className="flex-1 pt-1">
        <h3 className="font-display text-lg font-semibold text-foreground mb-2">
          {title}
        </h3>
        <div className="text-foreground/85 leading-relaxed">{children}</div>
      </div>
    </li>
  );
}
