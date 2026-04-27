import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const BANDS = [
  { label: "Absolute False", range: "0–11", color: "var(--color-belief-0)" },
  { label: "Deeply False", range: "12–22", color: "var(--color-belief-1)" },
  { label: "False", range: "23–33", color: "var(--color-belief-2)" },
  { label: "Leaning False", range: "34–44", color: "var(--color-belief-3)" },
  { label: "Uncertain", range: "45–55", color: "var(--color-belief-4)" },
  { label: "Leaning True", range: "56–66", color: "var(--color-belief-5)" },
  { label: "True", range: "67–77", color: "var(--color-belief-6)" },
  { label: "Deeply True", range: "78–88", color: "var(--color-belief-7)" },
  { label: "Absolute True", range: "89–100", color: "var(--color-belief-8)" },
];

export default function Home() {
  return (
    <PublicLayout>
      <div className="flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full pt-24 pb-32 px-4 flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-8">
            Now available for researchers
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-6">
            A survey instrument that preserves superposition.
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl">
            Standard Likert scales force humans to collapse their complex, nuanced beliefs into a binary or a meaningless midpoint. Entropy Harvester captures the full spectrum of cognitive uncertainty.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/signup">
              <Button size="lg" className="h-14 px-8 text-lg">Start harvesting</Button>
            </Link>
            <Link href="/methodology">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg">Read methodology</Button>
            </Link>
          </div>
        </section>

        {/* The Wedge Section */}
        <section className="w-full py-24 bg-card px-4">
          <div className="max-w-5xl mx-auto flex flex-col items-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-16 text-center">Beyond the Likert midpoint</h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold">The Problem with "Neutral"</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  When a respondent selects "Neutral" on a 5-point scale, are they truly apathetic? Do they lack information? Are they deeply conflicted between two equally strong opposing values? Or did they simply rush through the survey?
                </p>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Traditional instruments collapse this rich superposition into a single, meaningless data point.
                </p>
              </div>
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold">Preserving Uncertainty</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Entropy Harvester captures the journey, not just the destination. By measuring <span className="text-foreground font-medium">time to first interaction</span>, <span className="text-foreground font-medium">oscillation scores</span>, and <span className="text-foreground font-medium">path entropy</span>, we differentiate between apathy and deep cognitive conflict.
                </p>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  We don't force a collapse. We measure the superposition.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Spectrum Visualization */}
        <section className="w-full py-24 px-4 max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">The 100-Point Continuum</h2>
            <p className="text-lg text-muted-foreground">Nine distinct bands of epistemic certainty.</p>
          </div>
          
          <div className="flex flex-col gap-2">
            {BANDS.map((band, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="w-24 text-right text-sm text-muted-foreground font-mono">{band.range}</div>
                <div 
                  className="h-12 flex-1 rounded-sm flex items-center px-6 transition-all group-hover:scale-[1.02] group-hover:shadow-lg"
                  style={{ backgroundColor: band.color }}
                >
                  <span className="font-semibold text-white mix-blend-difference">{band.label}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="w-full py-32 bg-primary text-primary-foreground text-center px-4">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-8">Ready to measure what matters?</h2>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="h-14 px-8 text-lg">Create your first harvester</Button>
          </Link>
        </section>
      </div>
    </PublicLayout>
  );
}
