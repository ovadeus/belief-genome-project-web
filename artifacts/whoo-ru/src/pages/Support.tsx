import { PublicLayout } from "@/components/layout/PublicLayout";
import { Link } from "wouter";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search, ChevronDown, ChevronRight,
  BarChart3, Sliders, Bell, RefreshCw, Settings, AlertTriangle, Shield,
  Monitor, Globe, Chrome, Mail, Maximize2, ZoomIn,
  Dna, BrainCircuit, Radar, BarChart2, Clock, List, TrendingUp, ExternalLink,
} from "lucide-react";
import { BeliefScale } from "@/components/support/BeliefScale";
import { MiniRadar } from "@/components/support/MiniRadar";
import {
  BELIEF_COLORS, BELIEF_LABELS, BELIEF_THRESHOLDS,
  DOMAIN_AXES, NUDGE_INTERVALS,
} from "@/lib/beliefScale";

const SECTIONS = [
  { id: "scoring", label: "Understanding the Belief Scale", icon: Sliders, path: "/support#scoring" },
  { id: "visualizations", label: "Visualizations Explained", icon: BarChart3, path: "/support#visualizations" },
  { id: "probes-nudges", label: "Probes & Nudges", icon: Bell, path: "/support#probes-nudges" },
  { id: "sync", label: "Desktop, Extension & Web Sync", icon: RefreshCw, path: "/support#sync" },
  { id: "customization", label: "Customizing Your Experience", icon: Settings, path: "/support#customization" },
  { id: "troubleshooting", label: "Troubleshooting", icon: AlertTriangle, path: "/support#troubleshooting" },
  { id: "privacy", label: "Privacy & Data", icon: Shield, path: "/support#privacy" },
];

const SEARCH_ITEMS = [
  { section: "scoring", text: "9-Point Belief Spectrum slider Absolute False Deeply False False Leaning False Uncertain Leaning True True Deeply True Absolute True red green blue color scale" },
  { section: "visualizations", text: "Belief DNA Triple Helix Neuromap World View Radar Category Breakdown Timeline History Forecaster 3D brain strand visualization" },
  { section: "probes-nudges", text: "probe nudge interval manual every hour news probes current events belief testing prompt" },
  { section: "sync", text: "Mission Control desktop Chrome extension website sync connections sign in push responses" },
  { section: "customization", text: "text size zoom fullscreen dark mode expand UI scale" },
  { section: "troubleshooting", text: "extension not firing numbers don't match no data stretched misaligned answered mistake delete re-score" },
  { section: "privacy", text: "data privacy stored locally export JSON CSV never sell share belief DNA" },
];

const SLIDER_BANDS = BELIEF_LABELS.map((label, i) => ({
  range: i < BELIEF_THRESHOLDS.length
    ? `${i === 0 ? 0 : BELIEF_THRESHOLDS[i-1]+1}–${BELIEF_THRESHOLDS[i]}`
    : `${BELIEF_THRESHOLDS[i-1]+1}–100`,
  label,
  color: BELIEF_COLORS[i],
}));

export default function Support() {
  const [activeSection, setActiveSection] = useState("scoring");
  const [searchQuery, setSearchQuery] = useState("");
  const [demoSlider, setDemoSlider] = useState(50);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && SECTIONS.some(s => s.id === hash)) {
      setActiveSection(hash);
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0.1 }
    );
    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return SEARCH_ITEMS.filter(item => item.text.toLowerCase().includes(q))
      .map(item => SECTIONS.find(s => s.id === item.section)!);
  }, [searchQuery]);

  const scrollTo = useCallback((id: string) => {
    setSearchQuery("");
    setMobileAccordion(null);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    window.history.replaceState(null, "", `#${id}`);
  }, []);

  return (
    <PublicLayout>
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3 font-display">
            Help Center
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Everything you need to understand your beliefs, your scores, and the tools that map them across web, Chrome extension, and desktop (Mission Control).
          </p>

          <div className="mt-6 relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search support..."
              aria-label="Search support articles"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            />
            {searchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-50 py-1">
                {searchResults.map(s => (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className="w-full text-left px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5 flex items-center gap-2"
                  >
                    <s.icon size={14} className="text-primary shrink-0" />
                    {s.label}
                  </button>
                ))}
              </div>
            )}
            {searchResults && searchResults.length === 0 && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-50 p-4 text-sm text-muted-foreground">
                No results found.
              </div>
            )}
          </div>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors text-left group"
              >
                <s.icon size={18} className="text-primary mb-2" />
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          <nav className="hidden lg:block w-56 shrink-0 sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto">
            <ul className="space-y-1 border-l border-border pl-4">
              {SECTIONS.map(s => (
                <li key={s.id}>
                  <button
                    onClick={() => scrollTo(s.id)}
                    className={`block w-full text-left py-1.5 text-sm transition-colors ${
                      activeSection === s.id
                        ? "text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:hidden mb-8 w-full">
            <button
              onClick={() => setMobileAccordion(mobileAccordion ? null : "open")}
              aria-expanded={!!mobileAccordion}
              aria-controls="mobile-toc"
              className="w-full flex items-center justify-between p-3 rounded-lg bg-card border border-border text-sm text-foreground"
            >
              Jump to section
              <ChevronDown size={16} className={`transition-transform ${mobileAccordion ? "rotate-180" : ""}`} />
            </button>
            {mobileAccordion && (
              <div id="mobile-toc" className="mt-1 bg-card border border-border rounded-lg py-1">
                {SECTIONS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-20">

            <div id="scoring">
              <SectionHead icon={<Sliders size={22} />} title="Understanding the Belief Scale" />

              <h3 className="text-lg font-display font-semibold text-foreground mt-8 mb-4">The 9-Point Belief Spectrum</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Every probe you answer is scored on a 0–100 slider that maps to nine ordered belief states:
              </p>

              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-foreground font-display font-semibold">Slider Value</th>
                      <th className="text-left py-3 px-4 text-foreground font-display font-semibold">Label</th>
                      <th className="text-left py-3 px-4 text-foreground font-display font-semibold">Color</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    {SLIDER_BANDS.map(b => (
                      <tr key={b.label} className="border-b border-border/50">
                        <td className="py-2.5 px-4 font-mono text-xs">{b.range}</td>
                        <td className="py-2.5 px-4 font-medium text-foreground">{b.label}</td>
                        <td className="py-2.5 px-4">
                          <span className="inline-flex items-center gap-2">
                            <span className="w-4 h-4 rounded-sm inline-block" style={{ background: b.color }} />
                            <span className="font-mono text-xs">{b.color}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <BeliefScale variant="swatches" showLabels className="mb-8" />

              <h4 className="text-foreground font-display font-semibold mb-3">Why red → green → blue?</h4>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Red and blue are the most distinguishable opposing hues for the human eye; green in the middle signals genuine neutrality rather than "disagreement." This replaces the older green↔blue scheme that felt too close on the spectrum.
              </p>

              <div className="p-5 rounded-xl bg-card border border-border mb-6">
                <p className="text-sm text-foreground font-display font-semibold mb-1">
                  <span style={{ color: BELIEF_COLORS[4] }}>Uncertain</span> is a real, valid answer.
                </p>
                <p className="text-sm text-muted-foreground">
                  It means "I don't have enough information to lean either way" — not a failure to commit.
                </p>
              </div>

              <h4 className="text-foreground font-display font-semibold mb-3">Interactive Demo</h4>
              <p className="text-muted-foreground text-sm mb-4">Drag the slider to see how your position maps to a belief label:</p>
              <div className="p-5 rounded-xl bg-card border border-border">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={demoSlider}
                  onChange={e => setDemoSlider(parseInt(e.target.value))}
                  aria-label="Belief score demo slider"
                  className="w-full mb-4 accent-primary"
                />
                <BeliefScale variant="gradient" value={demoSlider} />
              </div>
            </div>

            <div id="visualizations">
              <SectionHead icon={<BarChart3 size={22} />} title="Visualizations Explained" />
              <p className="text-muted-foreground leading-relaxed mt-4 mb-8">
                The Belief Genome dashboard offers eight visualization tabs, each showing a different angle on your belief data. Tab order: Belief DNA, Triple Helix, Neuromap, Radar, Breakdown, Timeline, History, Forecaster.
              </p>

              <VizBlock
                icon={<Dna size={18} />}
                title="2.1 Belief DNA"
                badge="NEW"
                items={[
                  "A horizontal strip showing every dimension you've been probed on, grouped into 11 categories (Philosophy, Religion, Psychology, Relationships, Society, Economics, Sci & Tech, Politics, Life, Morality, Education, Health, Spirituality).",
                  "Each cell = one dimension you've explored",
                  "Cell color = your current score",
                  "Dim/hollow cells = unexplored",
                  "Hover for detail; expand icon for fullscreen",
                ]}
                footer="A single-glance fingerprint of who you are across thousands of belief dimensions."
                fullscreen
              />

              <VizBlock
                icon={<RefreshCw size={18} />}
                title="2.2 Triple Helix"
                items={[
                  "A 3D DNA-style helix animating your belief vectors as interwoven strands.",
                  "Three strands: stated belief, inferred conviction, domain tension",
                  "Gradient uses the 9-point scale",
                  "Fullscreen available",
                ]}
                footer="Seeing coherence or contradiction across related dimensions."
                fullscreen
              />

              <VizBlock
                icon={<BrainCircuit size={18} />}
                title="2.3 Neuromap"
                items={[
                  "A 3D brain showing how beliefs cluster anatomically.",
                  "Click regions to see dimensions firing there",
                  "Inter-region tension rendered in red filaments",
                  "Fullscreen available",
                ]}
                footer="Understanding which cognitive systems drive which beliefs."
                fullscreen
              />

              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-primary"><Radar size={18} /></span>
                  <h4 className="text-foreground font-display font-semibold">2.4 World View Radar</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-primary/10 text-primary border border-primary/20">REDESIGNED</span>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  9 spokes plotting your ideological position along each domain's left↔right axis.
                </p>
                <ul className="list-disc pl-6 text-muted-foreground leading-relaxed space-y-1 mb-4 text-sm">
                  <li>Dashed green ring = neutral reference (50%)</li>
                  <li>Points near center → lean toward left pole; near edge → right pole</li>
                  <li>Color intensity matches your strength of position</li>
                  <li>"Strongest leans" panel auto-surfaces your 3 most distinctive positions</li>
                </ul>
                <div className="flex justify-center my-6">
                  <MiniRadar size={380} />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 text-foreground font-display font-semibold">Domain</th>
                        <th className="text-left py-2 px-3 text-foreground font-display font-semibold">Pole A (center)</th>
                        <th className="text-left py-2 px-3 text-foreground font-display font-semibold">Pole B (edge)</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      {DOMAIN_AXES.map(a => (
                        <tr key={a.key} className="border-b border-border/50">
                          <td className="py-1.5 px-3 font-medium text-foreground">{a.short}</td>
                          <td className="py-1.5 px-3">{a.left}</td>
                          <td className="py-1.5 px-3">{a.right}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <VizBlock
                icon={<BarChart2 size={18} />}
                title="2.5 Category Breakdown"
                items={["Horizontal bars showing your average position per category with explicit pole labels at each end."]}
              />
              <VizBlock
                icon={<Clock size={18} />}
                title="2.6 Timeline"
                items={["A time-series chart of how your beliefs have shifted (or hardened) over time."]}
              />
              <VizBlock
                icon={<List size={18} />}
                title="2.7 History"
                items={["Chronological list of every probe you've answered — searchable, filterable, exportable."]}
              />
              <VizBlock
                icon={<TrendingUp size={18} />}
                title="2.8 Forecaster"
                items={["Predicted trajectories based on your trendlines, with confidence bands."]}
              />
            </div>

            <div id="probes-nudges">
              <SectionHead icon={<Bell size={22} />} title="Probes & Nudges" />

              <h4 className="text-foreground font-display font-semibold mt-6 mb-3">What is a probe?</h4>
              <p className="text-muted-foreground leading-relaxed mb-6">
                A single belief-testing prompt — a statement or question — that you respond to on the 9-point scale.
              </p>

              <h4 className="text-foreground font-display font-semibold mb-3">Nudge Intervals (Chrome Extension)</h4>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Open the extension → Options → "Probe Nudge Interval":
              </p>

              <div className="p-4 rounded-xl bg-card border border-border mb-6">
                <label htmlFor="nudge-interval-preview" className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 block">Probe Nudge Interval</label>
                <select id="nudge-interval-preview" className="w-full max-w-xs bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground" disabled>
                  {NUDGE_INTERVALS.map(ni => (
                    <option key={ni.value} value={ni.value}>{ni.label}</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-2">
                  Options: Manual, Every 5 min, Every 15 min, Every 30 min, Every hour, Every 6 hours, Once a day, Once a week
                </p>
              </div>

              <div className="p-4 rounded-xl bg-card/50 border border-border mb-6">
                <p className="text-sm text-foreground font-medium mb-1">💡 Tip</p>
                <p className="text-sm text-muted-foreground">
                  Start with <strong>Every hour</strong>. Switch to <strong>Every 5–15 min</strong> for the first few days to build a base map quickly, then ease off.
                </p>
              </div>

              <h4 className="text-foreground font-display font-semibold mb-3">News Probes</h4>
              <p className="text-muted-foreground leading-relaxed">
                Contextual probes generated from current events; scored the same way as standard probes.
              </p>
            </div>

            <div id="sync">
              <SectionHead icon={<RefreshCw size={22} />} title="Desktop, Extension & Web Sync" />

              <div className="grid gap-4 sm:grid-cols-3 mt-6 mb-8">
                <div className="p-4 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <Monitor size={18} />
                    <span className="font-display font-semibold text-foreground">Mission Control</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Your full command center: all visualizations, media library, AI agents, probe authoring, and the complete belief archive. Syncs locally and pushes to the web when connected.</p>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <Chrome size={18} />
                    <span className="font-display font-semibold text-foreground">Chrome Extension</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Lightweight probe interface for in-the-moment answers. Pushes responses to both desktop and website automatically. Shows a mini summary of your current day's belief activity.</p>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <Globe size={18} />
                    <span className="font-display font-semibold text-foreground">Website</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Read-only portal for reviewing your genome from any device. Shareable links (if you opt into sharing).</p>
                </div>
              </div>

              <h4 className="text-foreground font-display font-semibold mb-3">Connecting Them</h4>
              <ol className="list-decimal pl-6 text-muted-foreground leading-relaxed space-y-3 text-sm">
                <li><strong className="text-foreground">Desktop:</strong> Sidebar → Connections → sign in with your BGP account</li>
                <li><strong className="text-foreground">Extension:</strong> Options page → sign in → toggle Desktop sync and Website sync</li>
                <li><strong className="text-foreground">Website:</strong> Handled automatically once the above are connected</li>
              </ol>
            </div>

            <div id="customization">
              <SectionHead icon={<Settings size={22} />} title="Customizing Your Experience" />

              <div className="space-y-6 mt-6">
                <div className="p-5 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <ZoomIn size={16} className="text-primary" />
                    <h4 className="text-foreground font-display font-semibold">Text Size (Global UI Zoom)</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Use the <strong>+</strong> / <strong>–</strong> buttons in the bottom-left sidebar (above Connections) to scale all UI text up to 28% larger. The minimum is the default size — this control only enlarges, never shrinks below readable. 8 zoom levels from 1.0× (default/min) to 1.28×.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Maximize2 size={16} className="text-primary" />
                    <h4 className="text-foreground font-display font-semibold">Fullscreen Visualizations</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Click the expand icon in the top-right of the <strong>Belief DNA</strong>, <strong>Triple Helix</strong>, or <strong>Neuromap</strong> cards to enter an immersive fullscreen overlay. Click the <strong>X</strong> or press <strong>Escape</strong> to exit.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-card border border-border">
                  <h4 className="text-foreground font-display font-semibold mb-1">Dark Mode</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Dark mode is the default theme across all three surfaces. Light mode is planned.
                  </p>
                </div>
              </div>
            </div>

            <div id="troubleshooting">
              <SectionHead icon={<AlertTriangle size={22} />} title="Troubleshooting" />

              <div className="space-y-4 mt-6">
                <TroubleshootItem
                  q="The extension isn't opening at my chosen interval."
                  a="Make sure Chrome is running (extensions can only fire when Chrome is active). Check the Options page → verify Nudge Interval isn't set to Manual."
                />
                <TroubleshootItem
                  q="My desktop and extension numbers don't match."
                  a="Hit Sync Now in Desktop → Sidebar → Connections. Extension → Options → Force Sync."
                />
                <TroubleshootItem
                  q='I see "No data yet" on the Radar.'
                  a="You need at least 3 categories with answered probes. Keep answering probes across different topics."
                />
                <TroubleshootItem
                  q="A visualization looks stretched or misaligned."
                  a="Reset UI zoom to default (click the – button until it's disabled), then refresh the window."
                />
                <TroubleshootItem
                  q="I answered by mistake."
                  a="Desktop → History tab → find the entry → click the overflow menu → Delete or Re-score."
                />
              </div>
            </div>

            <div id="privacy">
              <SectionHead icon={<Shield size={22} />} title="Privacy & Data" />

              <div className="space-y-4 mt-6">
                <div className="p-5 rounded-xl bg-card border border-border">
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex gap-3">
                      <span className="text-primary mt-0.5 shrink-0">•</span>
                      Your responses are stored locally on your device first
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary mt-0.5 shrink-0">•</span>
                      Sync to cloud only happens when you explicitly connect
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary mt-0.5 shrink-0">•</span>
                      Your Belief DNA is yours — export any time as JSON or CSV (Desktop → Settings → Export)
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary mt-0.5 shrink-0">•</span>
                      We never sell or share individual belief data
                    </li>
                  </ul>
                </div>
                <p className="text-sm text-muted-foreground">
                  For our full data policy, see our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                </p>
              </div>
            </div>

            <div className="pt-8 border-t border-border">
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h3 className="text-foreground font-display font-semibold mb-2">Still need help?</h3>
                <address className="not-italic text-muted-foreground leading-relaxed space-y-2 text-sm">
                  <p><strong className="text-foreground">Email:</strong> <a href="mailto:support@beliefgenomeproject.org" className="text-primary hover:underline">support@beliefgenomeproject.org</a></p>
                  <p><strong className="text-foreground">Website:</strong> beliefgenomeproject.org</p>
                  <p><strong className="text-foreground">Operated by:</strong> Ovadeus LLC, Savannah, Georgia, USA</p>
                </address>
              </div>
            </div>

          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function SectionHead({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 pb-3 border-b border-border">
      <span className="text-primary">{icon}</span>
      <h2 className="text-2xl font-display font-bold text-foreground">{title}</h2>
    </div>
  );
}

function VizBlock({ icon, title, badge, items, footer, fullscreen }: {
  icon: React.ReactNode; title: string; badge?: string; items: string[];
  footer?: string; fullscreen?: boolean;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-primary">{icon}</span>
        <h4 className="text-foreground font-display font-semibold">{title}</h4>
        {badge && (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-primary/10 text-primary border border-primary/20">{badge}</span>
        )}
        {fullscreen && (
          <span className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
            <Maximize2 size={10} /> Fullscreen
          </span>
        )}
      </div>
      <ul className="list-disc pl-6 text-muted-foreground leading-relaxed space-y-1 text-sm">
        {items.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
      {footer && (
        <p className="mt-3 text-sm text-muted-foreground italic">What it's for: {footer}</p>
      )}
    </div>
  );
}

function TroubleshootItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const id = q.slice(0, 20).replace(/\W/g, '-').toLowerCase();
  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={`ts-${id}`}
        className="w-full text-left p-4 flex items-start gap-3"
      >
        <ChevronRight size={16} className={`text-primary mt-0.5 shrink-0 transition-transform ${open ? "rotate-90" : ""}`} />
        <span className="text-sm font-medium text-foreground">{q}</span>
      </button>
      {open && (
        <div id={`ts-${id}`} className="px-4 pb-4 pl-11">
          <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}
