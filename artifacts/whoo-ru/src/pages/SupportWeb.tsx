import { PublicLayout } from "@/components/layout/PublicLayout";
import { Link } from "wouter";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search, ChevronDown, ChevronRight, ArrowLeft,
  Sliders, BarChart3, RefreshCw, Settings, AlertTriangle, Shield,
  Globe, Maximize2, ZoomIn, Sparkles,
  Dna, BrainCircuit, Radar, BarChart2, Clock, List, TrendingUp,
  Activity, GitCompare, Share2, UserCircle, KeyRound, LogIn,
} from "lucide-react";
import { BeliefScale } from "@/components/support/BeliefScale";
import {
  BELIEF_COLORS, BELIEF_LABELS, BELIEF_THRESHOLDS,
  DOMAIN_AXES,
} from "@/lib/beliefScale";
import spotDnaColorBand from "@assets/spot-dna-color-band_1777370069638.png";
import spotTripleHelix from "@assets/spot-triple-helix_1777370069638.png";
import spotBrainMap from "@assets/spot-brain-map_1777370069639.png";
import spotRadar from "@assets/spot-radar_1777370069639.png";

const SECTIONS = [
  { id: "getting-started", label: "Getting Started", icon: LogIn },
  { id: "scoring", label: "The Belief Scale", icon: Sliders },
  { id: "dashboard", label: "Dashboard Tour", icon: BarChart3 },
  { id: "analyze", label: "Recalculate Your DNA", icon: Activity },
  { id: "evolution", label: "Evolution & Drift", icon: TrendingUp },
  { id: "compare", label: "Compare", icon: GitCompare },
  { id: "sharing", label: "Public DNA & Sharing", icon: Share2 },
  { id: "profile", label: "Profile & Account", icon: UserCircle },
  { id: "sync", label: "Sync with Desktop & Extension", icon: RefreshCw },
  { id: "customization", label: "Customizing the View", icon: Settings },
  { id: "easter-eggs", label: "Hidden Features", icon: Sparkles },
  { id: "troubleshooting", label: "Troubleshooting", icon: AlertTriangle },
  { id: "privacy", label: "Privacy & Data", icon: Shield },
];

const SEARCH_ITEMS = [
  { section: "getting-started", text: "sign in sign up register login first probe begin start account create" },
  { section: "scoring", text: "9-Point Belief Spectrum slider Absolute False Deeply False Leaning False Uncertain Leaning True True Deeply True Absolute True red green blue color scale 0-100 percent" },
  { section: "dashboard", text: "Belief DNA Triple Helix Neuromap World View Radar Category Breakdown Timeline History Forecaster 8 tabs visualizations" },
  { section: "analyze", text: "analyze recalculate full analysis 460 124 confidence percent dimensions mapped responses processed dna string force rebuild" },
  { section: "evolution", text: "evolution drift change over time bucket timeline history shift hardening" },
  { section: "compare", text: "compare yours mine known dnas overlay percentile shared agreement tension" },
  { section: "sharing", text: "public dna share link signature url social readonly" },
  { section: "profile", text: "profile account email password settings preferences" },
  { section: "sync", text: "sync desktop chrome extension mission control connect sign in push pull responses" },
  { section: "customization", text: "text size zoom fullscreen dark mode expand UI scale maximize keyboard escape" },
  { section: "easter-eggs", text: "harmonize easter egg secret hidden bgp B G P sequence audio music dna song play" },
  { section: "troubleshooting", text: "broken stuck loading not loading missing data refresh hard reload sign out cookies cache browser support" },
  { section: "privacy", text: "data privacy stored locally export JSON CSV never sell share belief DNA cookie session" },
];

const SLIDER_BANDS = BELIEF_LABELS.map((label, i) => ({
  range: i < BELIEF_THRESHOLDS.length
    ? `${i === 0 ? 0 : BELIEF_THRESHOLDS[i-1]+1}–${BELIEF_THRESHOLDS[i]}`
    : `${BELIEF_THRESHOLDS[i-1]+1}–100`,
  label,
  color: BELIEF_COLORS[i],
}));

export default function SupportWeb() {
  const [activeSection, setActiveSection] = useState("getting-started");
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
      .map(item => SECTIONS.find(s => s.id === item.section)!)
      .filter(Boolean);
  }, [searchQuery]);

  const scrollTo = useCallback((id: string) => {
    setSearchQuery("");
    setMobileAccordion(null);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    window.history.replaceState(null, "", `#${id}`);
  }, []);

  return (
    <PublicLayout>
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <Link
          href="/support"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          Help Center
        </Link>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Globe size={22} />
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground font-display">
              Web App Support
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Everything you need to read, recalculate, share, and explore your Belief DNA in
            the browser. The web app is the portable surface — it shows you what you've
            built, lets you rerun analyses, and links you out to anyone you want to share
            with.
          </p>

          <div className="mt-6 relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search web app support..."
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
            {SECTIONS.slice(0, 8).map(s => (
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
          <nav className="hidden lg:block w-60 shrink-0 sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto">
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

            {/* ─── Getting Started ─────────────────────────────────── */}
            <div id="getting-started">
              <SectionHead icon={<LogIn size={22} />} title="Getting Started" />
              <p className="text-muted-foreground leading-relaxed mt-4 mb-6">
                The web app is the portable side of the Belief Genome. You can sign in from
                any browser to see your current DNA, run a fresh analysis, share a public
                link, or compare your worldview against others — all without installing
                anything.
              </p>

              <Step n={1} title="Create or sign in to your account">
                Head to the web app's <strong>Sign In</strong> screen. New users can register
                in seconds — just an email and a password. Your account is what ties your
                desktop, extension, and web data together.
              </Step>
              <Step n={2} title="Answer your first probes">
                A probe is a single belief-testing prompt. Use the <strong>Probe</strong>{" "}
                screen to answer a few — your scores update <em>incrementally</em>, so each
                response immediately refines the affected dimension. There's no "submit
                everything at once" wall.
              </Step>
              <Step n={3} title="Open the Dashboard">
                As soon as you have probe responses, the Dashboard lights up with eight
                visualization tabs. The first one — <strong>Belief DNA</strong> — gives you a
                single-glance fingerprint. Scroll the tabs across the top to see the others.
              </Step>
              <Step n={4} title="Connect your other surfaces (optional)">
                If you also use the desktop app or Chrome extension, the{" "}
                <strong>Sync</strong> screen lets you confirm everything is talking to each
                other. See the{" "}
                <button onClick={() => scrollTo("sync")} className="text-primary hover:underline">
                  Sync section
                </button>{" "}
                below.
              </Step>

              <div className="mt-8 p-5 rounded-xl bg-card/50 border border-border">
                <p className="text-sm text-foreground font-medium mb-1">Tip</p>
                <p className="text-sm text-muted-foreground">
                  You don't need to answer hundreds of probes to see something useful. Even
                  20–30 responses produce a meaningful Belief DNA strip — accuracy and
                  confidence climb naturally from there.
                </p>
              </div>
            </div>

            {/* ─── Belief Scale ────────────────────────────────────── */}
            <div id="scoring">
              <SectionHead icon={<Sliders size={22} />} title="The Belief Scale" />

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
                Red and blue are the most distinguishable opposing hues for the human eye;
                green in the middle signals genuine neutrality rather than "disagreement."
                This replaces the older green↔blue scheme that felt too close on the spectrum.
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

            {/* ─── Dashboard Tour ──────────────────────────────────── */}
            <div id="dashboard">
              <SectionHead icon={<BarChart3 size={22} />} title="Dashboard Tour" />
              <p className="text-muted-foreground leading-relaxed mt-4 mb-8">
                The Dashboard is the heart of the web app. Eight tabs run across the top,
                each showing a different angle on your belief data. Tab order:{" "}
                <strong>Belief DNA · Triple Helix · Neuromap · Radar · Breakdown · Timeline ·
                History · Forecaster</strong>. The first four tabs are visual and support a
                fullscreen mode (look for the expand icon in the top-right corner of the
                panel).
              </p>

              <VizBlock
                icon={<Dna size={18} />}
                title="1. Belief DNA"
                image={{ src: spotDnaColorBand, alt: "Belief DNA color-band strip showing dimensions grouped by category, with each cell colored by score on the 9-point belief scale" }}
                items={[
                  "A horizontal strip showing every dimension you've been probed on, grouped by category (Philosophy, Religion, Psychology, Relationships, Society, Economics, Sci & Tech, Politics, Life, Morality, Education, Health, Spirituality).",
                  "Each cell = one dimension you've explored",
                  "Cell color = your current score on the 9-point scale",
                  "Dim/hollow cells = unexplored",
                  "Hover any cell for the dimension name and exact score",
                  "Cells are large and tap-friendly — designed to be readable at a glance",
                ]}
                footer="A single-glance fingerprint of who you are across thousands of belief dimensions."
                fullscreen
              />

              <VizBlock
                icon={<RefreshCw size={18} />}
                title="2. Triple Helix"
                image={{ src: spotTripleHelix, alt: "Triple Helix visualization showing Logos, Pathos, and Ethos strands woven together with belief points along each strand" }}
                items={[
                  "A 3D DNA-style helix animating your belief vectors as interwoven strands.",
                  "Three strands: stated belief, inferred conviction, domain tension",
                  "Gradient uses the 9-point scale",
                  "Mouse to rotate, scroll to zoom",
                ]}
                footer="Seeing coherence or contradiction across related dimensions."
                fullscreen
              />

              <VizBlock
                icon={<BrainCircuit size={18} />}
                title="3. Neuromap"
                image={{ src: spotBrainMap, alt: "Neuromap 3D brain visualization clustering belief dimensions by anatomical region, with category labels and a detail panel for the selected region" }}
                items={[
                  "A 3D brain showing how your beliefs cluster anatomically.",
                  "Click regions to see which dimensions fire there",
                  "Inter-region tension is rendered in red filaments",
                  "Fullscreen scales the brain to fill your viewport vertically",
                ]}
                footer="Understanding which cognitive systems drive which beliefs."
                fullscreen
              />

              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <span className="text-primary"><Radar size={18} /></span>
                  <h4 className="text-foreground font-display font-semibold">4. World View Radar</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-primary/10 text-primary border border-primary/20">REDESIGNED</span>
                  <span className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                    <Maximize2 size={10} /> Fullscreen
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Nine spokes plotting your ideological position along each domain's
                  left↔right axis. Recently rebuilt to match the desktop "World View Radar"
                  with theme-aware labels, LED-style strength meters, and an auto-generated
                  insight panel.
                </p>
                <ul className="list-disc pl-6 text-muted-foreground leading-relaxed space-y-1 mb-4 text-sm">
                  <li>Dashed green ring = neutral reference (50%)</li>
                  <li>Points near center → lean toward the left pole; near the edge → right pole</li>
                  <li>Color intensity matches the strength of your position</li>
                  <li>"Strongest leans" panel auto-surfaces your three most distinctive positions</li>
                  <li>In fullscreen the radar grows vertically to use your full viewport height</li>
                </ul>
                <div className="my-4 rounded-xl overflow-hidden border border-border bg-black">
                  <img
                    src={spotRadar}
                    alt="World View Radar showing nine domain spokes with LED-style strength meters and pole labels for each axis"
                    loading="lazy"
                    className="w-full h-auto block"
                  />
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
                title="5. Breakdown"
                items={["Horizontal bars showing your average position per category with explicit pole labels at each end. The fastest way to spot which categories are dominant in your current map."]}
              />
              <VizBlock
                icon={<Clock size={18} />}
                title="6. Timeline"
                items={["A time-series chart of how your beliefs have shifted (or hardened) over time. Each line is a category."]}
              />
              <VizBlock
                icon={<List size={18} />}
                title="7. History"
                items={[
                  "Chronological list of every probe you've answered — searchable and filterable.",
                  "Each row shows the prompt, your answer, the resulting score, and timestamp.",
                ]}
              />
              <VizBlock
                icon={<TrendingUp size={18} />}
                title="8. Forecaster"
                items={["Predicted trajectories based on your current trendlines, with confidence bands. Useful for spotting beliefs that are 'on the move.'"]}
              />
            </div>

            {/* ─── Analyze ─────────────────────────────────────────── */}
            <div id="analyze">
              <SectionHead icon={<Activity size={22} />} title="Recalculate Your DNA (Analyze)" />
              <p className="text-muted-foreground leading-relaxed mt-4 mb-6">
                The <strong>Analyze</strong> screen lets you rebuild your full Belief DNA
                from scratch. Your scores update <em>incrementally</em> as you answer probes,
                so you rarely <em>need</em> to recalculate — but it's the right move if you
                suspect drift, just imported a lot of new responses, or synced data from
                another device.
              </p>

              <h4 className="text-foreground font-display font-semibold mb-3">When to use it</h4>
              <ul className="list-disc pl-6 text-muted-foreground leading-relaxed space-y-1 text-sm mb-6">
                <li>You just connected your desktop app for the first time and want a full pass</li>
                <li>You answered a large batch of probes offline and want to ensure everything is rolled in</li>
                <li>You re-scored or deleted past responses and want a clean, definitive recompute</li>
                <li>You want to confirm what you see is the canonical, server-side view</li>
              </ul>

              <h4 className="text-foreground font-display font-semibold mb-3">Reading the result panel</h4>
              <div className="grid gap-4 sm:grid-cols-3 mb-6">
                <ResultStat label="Responses Processed" example="460" desc="Every probe response factored into the recompute." />
                <ResultStat label="Dimensions Mapped" example="124" desc="Out of the model's full 124 dimensions, how many you've touched at least once." />
                <ResultStat label="Confidence" example="75%" desc="A 0–100% measure of how stable and well-supported your overall map is. More probes per dimension → higher confidence." />
              </div>

              <div className="p-5 rounded-xl bg-card border border-border mb-6">
                <p className="text-sm text-foreground font-display font-semibold mb-1">The DNA String</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Below the stats is your full <strong>140-character DNA string</strong> —
                  each digit encodes one dimension's score on the 9-point scale. It's
                  versioned, copy-paste-able, and the same value used across the desktop app
                  and any shared links.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-card/50 border border-border">
                <p className="text-sm text-foreground font-medium mb-1">Tip</p>
                <p className="text-sm text-muted-foreground">
                  Recalculation is safe to run any time — it doesn't delete responses or
                  reset history. It just re-derives your scores from the full response log.
                </p>
              </div>
            </div>

            {/* ─── Evolution ───────────────────────────────────────── */}
            <div id="evolution">
              <SectionHead icon={<TrendingUp size={22} />} title="Evolution & Drift" />
              <p className="text-muted-foreground leading-relaxed mt-4 mb-6">
                The <strong>Evolution</strong> screen shows how your Belief DNA has changed
                over time. It bins your history into time buckets and surfaces what's
                actually moved versus what's stayed put.
              </p>

              <h4 className="text-foreground font-display font-semibold mb-3">What you'll see</h4>
              <ul className="list-disc pl-6 text-muted-foreground leading-relaxed space-y-1 text-sm mb-6">
                <li>Per-bucket summary: <em>responses, dimensions covered, confidence</em></li>
                <li>A line chart of overall confidence trending up as you answer more probes</li>
                <li>The DNA strip for any past bucket so you can read your earlier self</li>
                <li>Click between buckets to compare quickly</li>
              </ul>

              <div className="p-5 rounded-xl bg-card border border-border">
                <p className="text-sm text-foreground font-display font-semibold mb-1">Why this matters</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Belief change is the most interesting thing a tool like this can show you.
                  Most psychometrics give you a single snapshot; Evolution gives you the
                  derivative.
                </p>
              </div>
            </div>

            {/* ─── Compare ────────────────────────────────────────── */}
            <div id="compare">
              <SectionHead icon={<GitCompare size={22} />} title="Compare" />
              <p className="text-muted-foreground leading-relaxed mt-4 mb-6">
                The <strong>Compare</strong> screen overlays your Belief DNA against another
                — either a "known DNA" (a notable historical or contemporary figure with a
                published profile) or any DNA signature you've been given a link to.
              </p>

              <ul className="list-disc pl-6 text-muted-foreground leading-relaxed space-y-2 text-sm mb-6">
                <li>
                  <strong className="text-foreground">Header summary</strong> shows both
                  sides' total responses, dimensions covered, and overall confidence so you
                  know how solid each map is before reading too much into the overlap.
                </li>
                <li>
                  <strong className="text-foreground">Side-by-side strips</strong> let you
                  scan agreement and tension at a glance.
                </li>
                <li>
                  <strong className="text-foreground">Two ways in:</strong> open a known DNA
                  from the gallery, or paste in a public DNA link someone shared with you.
                </li>
              </ul>

              <div className="p-5 rounded-xl bg-card border border-border">
                <p className="text-sm text-foreground font-display font-semibold mb-1">A small caveat</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Compare is most meaningful when both maps have similar dimension coverage.
                  Comparing a 124-dim map against a 30-dim map will show large empty regions
                  on the smaller side — that's signal about coverage, not disagreement.
                </p>
              </div>
            </div>

            {/* ─── Sharing ─────────────────────────────────────────── */}
            <div id="sharing">
              <SectionHead icon={<Share2 size={22} />} title="Public DNA & Sharing" />
              <p className="text-muted-foreground leading-relaxed mt-4 mb-6">
                Every Belief DNA gets a stable, shareable URL of the form{" "}
                <code className="px-1.5 py-0.5 rounded bg-card border border-border text-xs font-mono text-foreground">/dna/&lt;signature&gt;</code>.
                Anyone with the link sees a read-only public view of that DNA — strip,
                radar, neuromap, and the headline stats.
              </p>

              <ul className="list-disc pl-6 text-muted-foreground leading-relaxed space-y-2 text-sm mb-6">
                <li>
                  <strong className="text-foreground">Public DNA pages are read-only.</strong>{" "}
                  Visitors can browse the visualizations but can't see your individual probe
                  responses or your account.
                </li>
                <li>
                  <strong className="text-foreground">The signature is a stable hash</strong>{" "}
                  derived from your DNA — it changes when your DNA changes, so old links
                  always reflect the snapshot they were created from.
                </li>
                <li>
                  <strong className="text-foreground">You're in control.</strong> Sharing is
                  opt-in. If you don't share the link, no one finds your map.
                </li>
              </ul>
            </div>

            {/* ─── Profile ─────────────────────────────────────────── */}
            <div id="profile">
              <SectionHead icon={<UserCircle size={22} />} title="Profile & Account" />
              <p className="text-muted-foreground leading-relaxed mt-4 mb-6">
                The <strong>Profile</strong> screen is your account home — your headline
                stats, your current DNA strip, and the quick links to Sync and Settings.
              </p>
              <ul className="list-disc pl-6 text-muted-foreground leading-relaxed space-y-1 text-sm">
                <li>Update your display name and email</li>
                <li>Change your password</li>
                <li>See your total responses and current overall confidence</li>
                <li>Sign out</li>
              </ul>
            </div>

            {/* ─── Sync ───────────────────────────────────────────── */}
            <div id="sync">
              <SectionHead icon={<RefreshCw size={22} />} title="Sync with Desktop & Extension" />
              <p className="text-muted-foreground leading-relaxed mt-4 mb-6">
                The Belief Genome lives in three places: the <strong>web app</strong> (here),
                the <strong>desktop app</strong> (Mission Control), and the{" "}
                <strong>Chrome extension</strong>. They all read from the same account, so
                what you see on one surface eventually shows up on the others.
              </p>

              <div className="grid gap-4 sm:grid-cols-3 mb-8">
                <div className="p-4 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <Globe size={18} />
                    <span className="font-display font-semibold text-foreground">Web App</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Read, recalculate, share, compare. The portable surface — anywhere a browser runs.</p>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <KeyRound size={18} />
                    <span className="font-display font-semibold text-foreground">Desktop (Mission Control)</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Full instrument: probe authoring, AI agents, media library, complete archive.</p>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <Sparkles size={18} />
                    <span className="font-display font-semibold text-foreground">Chrome Extension</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Lightweight in-the-moment probe answers; pushes responses to both the desktop and the web automatically.</p>
                </div>
              </div>

              <h4 className="text-foreground font-display font-semibold mb-3">From the web app</h4>
              <ol className="list-decimal pl-6 text-muted-foreground leading-relaxed space-y-2 text-sm mb-6">
                <li>Open the <strong>Sync</strong> screen.</li>
                <li>Confirm your account is signed in (top right).</li>
                <li>Press <strong>Sync Now</strong> to force a pull from the server.</li>
                <li>If you've been answering probes elsewhere, press <strong>Run Full Analysis</strong> on the Analyze screen to make sure your DNA reflects the freshest data.</li>
              </ol>

              <div className="p-4 rounded-xl bg-card/50 border border-border">
                <p className="text-sm text-foreground font-medium mb-1">Tip</p>
                <p className="text-sm text-muted-foreground">
                  The web app is intentionally <strong>read-and-recalculate-first</strong>.
                  Heavy authoring (creating new probes, training agents) lives in the
                  desktop app. The web is where you and your audience <em>see</em> the result.
                </p>
              </div>
            </div>

            {/* ─── Customization ──────────────────────────────────── */}
            <div id="customization">
              <SectionHead icon={<Settings size={22} />} title="Customizing the View" />

              <div className="space-y-6 mt-6">
                <div className="p-5 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <ZoomIn size={16} className="text-primary" />
                    <h4 className="text-foreground font-display font-semibold">Text Size (UI Zoom)</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Use the <strong>+</strong> / <strong>–</strong> buttons in the sidebar to
                    scale all UI text up to <strong>1.28×</strong>. The minimum is the default
                    size — this control only enlarges, never shrinks below readable. Eight
                    zoom levels in 4% steps from 1.00× to 1.28×.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Maximize2 size={16} className="text-primary" />
                    <h4 className="text-foreground font-display font-semibold">Fullscreen Visualizations</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Click the expand icon in the top-right of the <strong>Belief DNA</strong>,{" "}
                    <strong>Triple Helix</strong>, <strong>Neuromap</strong>, or{" "}
                    <strong>Radar</strong> tabs to enter an immersive fullscreen overlay. The
                    Radar and Neuromap both grow vertically to fill your viewport — the more
                    screen you give them, the more they show. Click the <strong>X</strong> or
                    press <strong>Escape</strong> to exit.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-card border border-border">
                  <h4 className="text-foreground font-display font-semibold mb-1">Dark Mode</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Dark mode is the default theme across all surfaces. Light mode is on the roadmap.
                  </p>
                </div>
              </div>
            </div>

            {/* ─── Easter Eggs ────────────────────────────────────── */}
            <div id="easter-eggs">
              <SectionHead icon={<Sparkles size={22} />} title="Hidden Features" />
              <p className="text-muted-foreground leading-relaxed mt-4 mb-6">
                A few small delights tucked into the web app for the curious.
              </p>

              <div className="p-5 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-primary" />
                  <h4 className="text-foreground font-display font-semibold">Harmonize — your DNA, played as music</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Open the <strong>Dashboard</strong> and tap the keys{" "}
                  <kbd className="px-1.5 py-0.5 rounded bg-foreground/10 text-foreground text-xs font-mono mx-0.5">B</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-foreground/10 text-foreground text-xs font-mono mx-0.5">G</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-foreground/10 text-foreground text-xs font-mono mx-0.5">P</kbd>
                  in sequence (within about a second). Your Belief DNA strip animates and
                  plays back as a generative music-box piece — every digit becomes a note,
                  with a gentle ambient bed and a soft vocal layer.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Tap the sequence again to stop. The shortcut is suppressed inside text
                  fields, so it won't fire while you're typing.
                </p>
              </div>
            </div>

            {/* ─── Troubleshooting ────────────────────────────────── */}
            <div id="troubleshooting">
              <SectionHead icon={<AlertTriangle size={22} />} title="Troubleshooting" />

              <div className="space-y-4 mt-6">
                <TroubleshootItem
                  q="I just signed in but my DNA is empty."
                  a="If you haven't answered any probes yet, your DNA will be empty by design — open the Probe screen to start. If you have answered probes on the desktop app or extension, open the Sync screen and press Sync Now, then run a full analysis from the Analyze screen."
                />
                <TroubleshootItem
                  q="My web view doesn't match my desktop view."
                  a="Press Sync Now on the Sync screen, then Run Full Analysis on the Analyze screen. This forces both surfaces to a single canonical view derived from the latest server-side data."
                />
                <TroubleshootItem
                  q='The Radar shows "No data yet."'
                  a="The Radar needs at least three categories with answered probes before it can plot a meaningful shape. Keep answering probes across different topics — it will fill in."
                />
                <TroubleshootItem
                  q="A visualization looks stretched, cut off, or misaligned."
                  a="Try a hard refresh (Cmd/Ctrl + Shift + R). If it persists, reset UI zoom to default (click the – button until it's disabled) and refresh again. Some browsers cache stale layouts after big updates."
                />
                <TroubleshootItem
                  q="The Confidence number on Analyze looks wrong."
                  a="Confidence is a 0–100% value. If you ever see something obviously off (like 7500%), it's a display bug — please report it. The underlying calculation is sound; the renderer is the only thing that can mangle it."
                />
                <TroubleshootItem
                  q="I answered a probe by mistake. Can I undo?"
                  a="Yes — open the History tab on the Dashboard, find the entry, and use the per-row actions to delete or re-score. Your DNA recomputes automatically (or run Analyze for a full pass)."
                />
                <TroubleshootItem
                  q="The Easter egg won't trigger."
                  a="Make sure you're on the Dashboard (not the Probe screen or a form), and that no text input is focused. Type B → G → P in quick succession. If your keyboard layout doesn't produce those characters directly, the trigger may not register."
                />
                <TroubleshootItem
                  q="I'm signed out unexpectedly."
                  a="Sessions expire after a long period of inactivity. If you're getting signed out repeatedly within minutes, check that your browser allows cookies for the web app's domain — third-party cookie blockers can interfere with auth."
                />
              </div>
            </div>

            {/* ─── Privacy ─────────────────────────────────────────── */}
            <div id="privacy">
              <SectionHead icon={<Shield size={22} />} title="Privacy & Data" />

              <div className="space-y-4 mt-6">
                <div className="p-5 rounded-xl bg-card border border-border">
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex gap-3">
                      <span className="text-primary mt-0.5 shrink-0">•</span>
                      Your responses are stored on your account — accessible only to you when signed in
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary mt-0.5 shrink-0">•</span>
                      Public DNA pages are <strong className="text-foreground">opt-in</strong>: nothing is shared until you share the link
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary mt-0.5 shrink-0">•</span>
                      Public pages are read-only and never expose your individual probe responses
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary mt-0.5 shrink-0">•</span>
                      Your Belief DNA is yours — full export (JSON or CSV) is available from the desktop app
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary mt-0.5 shrink-0">•</span>
                      We never sell or share individual belief data
                    </li>
                  </ul>
                </div>
                <p className="text-sm text-muted-foreground">
                  For the full data policy, see the{" "}
                  <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                </p>
              </div>
            </div>

            {/* ─── Footer ─────────────────────────────────────────── */}
            <div className="pt-8 border-t border-border">
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h3 className="text-foreground font-display font-semibold mb-2">Still need help?</h3>
                <address className="not-italic text-muted-foreground leading-relaxed space-y-2 text-sm">
                  <p><strong className="text-foreground">Email:</strong> <a href="mailto:support@beliefgenomeproject.org" className="text-primary hover:underline">support@beliefgenomeproject.org</a></p>
                  <p><strong className="text-foreground">Looking for desktop docs?</strong> <Link href="/support/desktop" className="text-primary hover:underline">Open Desktop App support</Link></p>
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

function VizBlock({ icon, title, items, footer, fullscreen, image }: {
  icon: React.ReactNode; title: string; items: string[];
  footer?: string; fullscreen?: boolean;
  image?: { src: string; alt: string };
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-primary">{icon}</span>
        <h4 className="text-foreground font-display font-semibold">{title}</h4>
        {fullscreen && (
          <span className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
            <Maximize2 size={10} /> Fullscreen
          </span>
        )}
      </div>
      <ul className="list-disc pl-6 text-muted-foreground leading-relaxed space-y-1 text-sm">
        {items.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
      {image && (
        <div className="mt-4 rounded-xl overflow-hidden border border-border bg-black">
          <img
            src={image.src}
            alt={image.alt}
            loading="lazy"
            className="w-full h-auto block"
          />
        </div>
      )}
      {footer && (
        <p className="mt-3 text-sm text-muted-foreground italic">What it's for: {footer}</p>
      )}
    </div>
  );
}

function TroubleshootItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const id = q.slice(0, 24).replace(/\W/g, '-').toLowerCase();
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

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 mb-5">
      <span className="shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-display font-semibold text-sm">
        {n}
      </span>
      <div className="flex-1 pt-0.5">
        <h4 className="text-foreground font-display font-semibold mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

function ResultStat({ label, example, desc }: { label: string; example: string; desc: string }) {
  return (
    <div className="p-4 rounded-xl bg-card border border-border">
      <div className="text-2xl font-display font-bold text-primary mb-1">{example}</div>
      <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">{label}</div>
      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
