import { PublicLayout } from "@/components/layout/PublicLayout";
import { motion } from "framer-motion";
import { ArrowRight, Dna, Activity, Radio, Eye, FolderOpen, ChevronDown } from "lucide-react";
import { useState } from "react";

const features = [
  { icon: Dna, title: "Belief Genome", description: "124-dimension psychological mapping that captures the full architecture of your inner world with precision no personality test has attempted before." },
  { icon: Activity, title: "Forecaster", description: "Predict your future responses to moral dilemmas, life decisions, and philosophical probes based on your accumulated belief architecture." },
  { icon: Radio, title: "Research Pulse", description: "Track the topics, ideas, and influences shaping your world view in real time. See what's moving the needle on your belief dimensions." },
  { icon: Eye, title: "DNA Visualization", description: "See your belief architecture rendered as a living, dimensional visualization — the triple helix of your cognitive, emotional, and philosophical dimensions." },
  { icon: FolderOpen, title: "Media Library", description: "Your transcripts, audio recordings, research notes, and belief exploration sessions — all organized in one searchable library." },
];

const faqs = [
  { q: "What platforms does BGP support?", a: "BGP is a web application accessible from any modern browser — desktop, tablet, or mobile. No download required." },
  { q: "Is BGP free?", a: "Yes. The BGP web application is free during the beta period. We believe self-knowledge should be accessible to everyone." },
  { q: "How long does the initial belief mapping take?", a: "The initial Belief Genome mapping takes approximately 45-60 minutes, spread across several sessions. The system learns more about you with every interaction." },
  { q: "Is my data private?", a: "Absolutely. Your belief data is encrypted and stored securely. BGP does not share or sell your psychological data. Your inner world belongs to you." },
  { q: "What makes BGP different from personality tests?", a: "Personality tests measure traits — stable, broad categories. BGP maps beliefs — specific, weighted, contextual convictions that drive your actual decisions. The difference is dimensional precision." },
  { q: "Can I export my Belief Genome data?", a: "Yes. BGP supports full data export in multiple formats, including JSON and CSV. Your data is yours to keep, analyze, and use however you choose." },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function AppShowcase() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <PublicLayout>
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              The <span className="text-primary">BGP (Belief Genome Project)</span> App
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              A secure web application for mapping, understanding, and forecasting your belief architecture with dimensional precision.
            </p>
            <a
              href="/genome/register"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg hover:brightness-110 transition-all shadow-lg shadow-primary/25"
            >
              <ArrowRight className="w-5 h-5" />
              Create Your Account — Free
            </a>
            <p className="text-sm text-muted-foreground mt-3">No download required · Works in any modern browser</p>
          </motion.div>

          <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="mb-20">
            <div className="aspect-video bg-card border border-border rounded-2xl overflow-hidden flex items-center justify-center">
              <img
                src={`${import.meta.env.BASE_URL}images/app-mockup.png`}
                alt="BGP Web Application"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          <div className="mb-20">
            <h2 className="text-3xl font-bold text-foreground mb-10 text-center">Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card border border-border rounded-2xl p-6"
                >
                  <f.icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mb-20">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left"
                  >
                    <span className="font-semibold text-foreground">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <motion.div {...fadeUp} className="text-center bg-card border border-border rounded-2xl p-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Ready to discover who you really are?</h2>
            <a
              href="/genome/register"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:brightness-110 transition-all"
            >
              <ArrowRight className="w-5 h-5" />
              Get Started — Free
            </a>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
