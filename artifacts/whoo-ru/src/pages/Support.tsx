import { PublicLayout } from "@/components/layout/PublicLayout";
import { Link } from "wouter";
import { Globe, Monitor, ArrowRight, Mail } from "lucide-react";

export default function Support() {
  return (
    <PublicLayout>
      <section className="py-20 px-4 sm:px-6 max-w-5xl mx-auto">
        <header className="mb-14 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-display">
            Help Center
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Pick the surface you're using. The Belief Genome lives in two places, and each one
            has its own quirks worth knowing.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <SurfaceCard
            href="/support/web"
            icon={<Globe size={28} />}
            title="Web App"
            tagline="Browser-based companion"
            description="The portable side: sign in from anywhere, view your Belief DNA, run a full recalculation, explore the radar, evolution, and comparison views. Read-friendly, light to write."
            chips={["Belief DNA", "Radar", "Evolution", "Compare", "Sharing"]}
          />
          <SurfaceCard
            href="/support/desktop"
            icon={<Monitor size={28} />}
            title="Desktop App"
            tagline="Mission Control"
            description="The full instrument: probe authoring, AI agents, media library, complete archive, and everything that needs the local environment. Syncs to the web when connected."
            chips={["Mission Control", "Agents", "Authoring", "Archive", "Sync"]}
          />
        </div>

        <div className="mt-14 p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-start gap-4">
            <span className="text-primary mt-1"><Mail size={20} /></span>
            <div>
              <h3 className="text-foreground font-display font-semibold mb-1">
                Need a human?
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Email <a href="mailto:support@beliefgenomeproject.org" className="text-primary hover:underline">support@beliefgenomeproject.org</a>{" "}
                — operated by Ovadeus LLC, Savannah, Georgia, USA.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function SurfaceCard({ href, icon, title, tagline, description, chips }: {
  href: string;
  icon: React.ReactNode;
  title: string;
  tagline: string;
  description: string;
  chips: string[];
}) {
  return (
    <Link
      href={href}
      className="group block p-7 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="flex items-center gap-4 mb-4">
        <span className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary/15 transition-colors">
          {icon}
        </span>
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">{title}</h2>
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mt-0.5">
            {tagline}
          </p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed mb-5">
        {description}
      </p>
      <div className="flex flex-wrap gap-1.5 mb-5">
        {chips.map(c => (
          <span key={c} className="text-[11px] px-2 py-0.5 rounded-full bg-foreground/5 text-muted-foreground border border-border">
            {c}
          </span>
        ))}
      </div>
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2.5 transition-all">
        Open {title} support
        <ArrowRight size={14} />
      </span>
    </Link>
  );
}
