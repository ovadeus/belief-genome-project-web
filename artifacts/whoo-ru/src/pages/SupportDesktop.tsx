import { PublicLayout } from "@/components/layout/PublicLayout";
import { Link } from "wouter";
import { Monitor, ArrowLeft, Construction } from "lucide-react";

export default function SupportDesktop() {
  return (
    <PublicLayout>
      <section className="py-20 px-4 sm:px-6 max-w-4xl mx-auto">
        <Link
          href="/support"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Help Center
        </Link>

        <header className="mb-10 flex items-start gap-4">
          <span className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Monitor size={28} />
          </span>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground font-display mb-2">
              Desktop App Support
            </h1>
            <p className="text-muted-foreground">
              Mission Control — the full Belief Genome instrument.
            </p>
          </div>
        </header>

        <div className="p-8 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-primary"><Construction size={20} /></span>
            <h2 className="text-xl font-display font-semibold text-foreground">
              Documentation in progress
            </h2>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-6">
            The desktop support guide is being authored separately and will land here shortly.
            It will cover Mission Control's panels, probe authoring, AI agents, the media
            library, sync controls, and everything that lives in the local archive.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            In the meantime, the{" "}
            <Link href="/support/web" className="text-primary hover:underline">Web App guide</Link>{" "}
            covers concepts shared across both surfaces — the 9-point belief scale, the
            visualizations, and the sync model.
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
