import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, Users, BarChart3, Dna, Info, Clock, LayoutGrid, UserCircle2,
} from "lucide-react";
import {
  rawToDisplay, displayBarColor, displayBarBorder,
  DISPLAY_MIN, DISPLAY_MAX, DISPLAY_NEUTRAL,
} from "@/lib/belief-scale";
import { getBeliefInterpretation, getCategoryInterpretation } from "@/lib/belief-interpretations";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, RadialLinearScale,
  PointElement, LineElement, Filler, Tooltip, Legend, ArcElement, TimeScale,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  useExploreStats, useExploreDimensions, useExploreGenerations,
  useExploreGenders, useExploreCountries, useExploreTimeline, useExploreCountryBeliefs,
  type ExploreFilters, DEFAULT_FILTERS,
} from "@/hooks/use-explore";
import { FilterBar, COUNTRY_NAMES, CATEGORY_OPTIONS } from "@/components/explore/FilterBar";

const WorldBeliefMap = lazy(() => import("@/components/explore/WorldBeliefMap"));

ChartJS.register(CategoryScale, LinearScale, BarElement, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, ArcElement, TimeScale);

const CATEGORIES: Record<string, { label: string; color: string; dims: number[] }> = {
  epistemology:  { label: 'Epistemology',    color: '#6c63ff', dims: [4,5,6,7,8,9,10,11,12,13] },
  spirituality:  { label: 'Spirituality',    color: '#ff9f43', dims: [14,15,16,17,18,19,20,21,22,23,24,25,26,27,28] },
  morality:      { label: 'Morality',        color: '#ee5a24', dims: [29,30,31,32,33,34,35,36,37,38,39,40,41,42,43] },
  politics:      { label: 'Politics',        color: '#0097e6', dims: [44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63] },
  social:        { label: 'Social',          color: '#44bd32', dims: [64,65,66,67,68,69,70,71,72,73,74,75,76,77,78] },
  economics:     { label: 'Economics',       color: '#e1b12c', dims: [79,80,81,82,83,84,85,86,87,88] },
  science_tech:  { label: 'Science & Tech',  color: '#00d2d3', dims: [89,90,91,92,93,94,95,96,97,98] },
  education:     { label: 'Education',       color: '#c56cf0', dims: [99,100,101,102,103] },
  health:        { label: 'Health',          color: '#22c55e', dims: [104,105,106,107,108] },
  psychology:    { label: 'Psychology',      color: '#3b82f6', dims: [109,110,111,112,113,114,115,116,117,118] },
  relationships: { label: 'Relationships',   color: '#ff6b81', dims: [119,120,121,122,123,124,125,126,127] },
};

const DIM_NAMES: Record<string, string> = {
  "4":"Objective Reality","5":"Truth is Absolute","6":"Science Authority","7":"Intuition Valid","8":"Multiple Truths","9":"Experience>Data","10":"Uncertainty OK","11":"Pattern>Randomness","12":"Tradition Wisdom","13":"Trust Experts",
  "14":"God Exists","15":"Religion Valuable","16":"Afterlife","17":"Soul Exists","18":"Prayer Works","19":"Fate/Destiny","20":"Karma","21":"Supernatural","22":"Sacred Texts","23":"Miracles","24":"Consciousness","25":"Life Force","26":"Astrology","27":"Reincarnation","28":"Spiritual Practice",
  "29":"Moral Absolutes","30":"Individual>Collective","31":"Intent>Outcome","32":"Tradition Morality","33":"Punishment Deters","34":"Inequality Unjust","35":"Abortion OK","36":"Death Penalty","37":"Animal Rights","38":"Env. Duty","39":"Sexual Morality","40":"Situational Honesty","41":"Self-Interest","42":"Suffering Builds","43":"Forgiveness",
  "44":"Small Govt","45":"Democracy","46":"Free Markets","47":"Equality>Freedom","48":"Border Security","49":"Nationalism","50":"Military","51":"Welfare State","52":"Gun Rights","53":"Tax is Theft","54":"Govt Climate","55":"Pro-Immigration","56":"Strong Police","57":"Regulation","58":"Meritocracy","59":"Patriotism","60":"Revolution","61":"Originalism","62":"Free Speech","63":"Vote Duty",
  "64":"Trad. Family","65":"Bio. Gender","66":"Assimilation","67":"Merit=Success","68":"Systemic Racism","69":"Feminism","70":"LGBTQ+ Rights","71":"Gender Roles","72":"PC Culture","73":"Diversity","74":"Colorblindness","75":"Cancel Culture","76":"Privilege","77":"Cultural Trad.","78":"Community",
  "79":"Capitalism OK","80":"Labor Rights","81":"Unions","82":"UBI","83":"Corp. Duty","84":"Min. Wage","85":"Redistribution","86":"Inheritance","87":"Profit=Progress","88":"Work=Worth",
  "89":"Tech Optimism","90":"AI Positive","91":"Gene Editing","92":"Space Priority","93":"Nuclear Power","94":"Vaccines","95":"Social Media OK","96":"Privacy>Security","97":"Auto. Threat","98":"Enhancement",
  "99":"College Needed","100":"Trust Teachers","101":"Std. Testing","102":"School Choice","103":"Critical Think",
  "104":"Western Med.","105":"Mental Health","106":"Body Autonomy","107":"Natural>Synth.","108":"Healthcare Right",
  "109":"Free Will","110":"Fixed Personality","111":"Emotion>Reason","112":"Therapy Works","113":"Positive Think","114":"Trauma Shapes","115":"Meditation","116":"IQ Fixed","117":"Conscious.>Death","118":"Human Goodness",
  "119":"Monogamy","120":"Marriage Sacred","121":"Two Parents","122":"Loyalty","123":"Cond. Forgiveness","124":"Competition","125":"Trust Strangers","126":"Civic Duty","127":"Suffering=Meaning",
};

const EXPLORE_CAT_ORDER = ['epistemology', 'spirituality', 'morality', 'politics', 'social', 'economics', 'science_tech', 'education', 'health', 'psychology', 'relationships'];
const EXPLORE_CAT_SHORT: Record<string, string> = {
  epistemology: 'Philosophy', spirituality: 'Religion', morality: 'Morality',
  politics: 'Politics', social: 'Society', economics: 'Economics',
  science_tech: 'Sci & Tech', education: 'Education', health: 'Health',
  psychology: 'Psychology', relationships: 'Relationships',
};
const EXPLORE_DOMAIN_AXES: Record<string, { left: string; right: string; mid: string }> = {
  epistemology:  { left: 'Relativist',   right: 'Absolutist',      mid: 'Mixed epistemic'  },
  spirituality:  { left: 'Secular',      right: 'Spiritual',       mid: 'Open spiritual'   },
  morality:      { left: 'Progressive',  right: 'Traditional',     mid: 'Mixed moral'      },
  politics:      { left: 'Progressive',  right: 'Conservative',    mid: 'Centrist'         },
  social:        { left: 'Progressive',  right: 'Traditionalist',  mid: 'Moderate'         },
  economics:     { left: 'Progressive',  right: 'Market-oriented', mid: 'Mixed economic'   },
  science_tech:  { left: 'Tech-skeptic', right: 'Techno-optimist', mid: 'Tech-pragmatist'  },
  education:     { left: 'Reform',       right: 'Traditional',     mid: 'Balanced'         },
  health:        { left: 'Alternative',  right: 'Conventional',    mid: 'Integrative'      },
  psychology:    { left: 'Determinist',  right: 'Autonomous',      mid: 'Compatibilist'    },
  relationships: { left: 'Fluid',        right: 'Traditional',     mid: 'Contextual'       },
};

function exploreCatColour(avg09: number | null): string {
  if (avg09 == null) return '#86efac';
  const v = avg09 / 9;
  if (v <= 0.22) return '#dc2626';
  if (v <= 0.40) return '#f87171';
  if (v <= 0.60) return '#22c55e';
  if (v <= 0.78) return '#60a5fa';
  return '#2563eb';
}
function exploreDomainLabel(cat: string, avg09: number): string {
  const axis = EXPLORE_DOMAIN_AXES[cat];
  if (!axis) return '—';
  const v = avg09 / 9;
  if (v <= 0.22) return `Strongly ${axis.left}`;
  if (v <= 0.40) return axis.left;
  if (v <= 0.60) return axis.mid;
  if (v <= 0.78) return axis.right;
  return `Strongly ${axis.right}`;
}

const TIMELINE_INTERVALS = [
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Quarter', value: 'quarter' },
  { label: 'Year', value: 'year' },
];

type TabKey = "breakdown" | "timeline" | "geo" | "gender" | "generation";
const TABS: Array<{ key: TabKey; label: string; icon: any }> = [
  { key: "breakdown",  label: "Category Breakdown", icon: LayoutGrid },
  { key: "timeline",   label: "Timeline",           icon: Clock },
  { key: "geo",        label: "Geo Map",            icon: Globe },
  { key: "gender",     label: "Gender Split",       icon: UserCircle2 },
  { key: "generation", label: "Generation Split",   icon: Users },
];

// Debounce hook for filter commits
function useDebounced<T>(value: T, delay = 300): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function ExploreBeliefs() {
  const [activeTab, setActiveTab] = useState<TabKey>("breakdown");
  const [selectedCategory, setSelectedCategory] = useState("epistemology");
  const [timelineInterval, setTimelineInterval] = useState("month");
  const [filters, setFilters] = useState<ExploreFilters>(DEFAULT_FILTERS);
  const committedFilters = useDebounced(filters, 300);

  // Stats + countries always loaded (cheap, needed for filter bar)
  const statsQ = useExploreStats(committedFilters);
  // Country facet: apply all filters EXCEPT countries, so the user can keep adding/removing countries.
  const countriesFacetFilters = useMemo(
    () => ({ ...committedFilters, countries: [] }),
    [committedFilters],
  );
  const countriesQ = useExploreCountries(countriesFacetFilters, true);

  // Per-tab gated queries
  const dimensionsQ = useExploreDimensions(committedFilters, activeTab === "breakdown");
  const timelineQ = useExploreTimeline(committedFilters, timelineInterval, activeTab === "timeline");
  const countryBeliefsQ = useExploreCountryBeliefs(committedFilters, activeTab === "geo");
  const gendersQ = useExploreGenders(committedFilters, activeTab === "gender");
  const generationsQ = useExploreGenerations(committedFilters, activeTab === "generation");

  const dimensions = dimensionsQ.data?.dimensions || {};
  const dimCount = dimensionsQ.data?.count || 0;
  const insufficientData = !!dimensionsQ.data?.insufficientData;
  const stats = statsQ.data;

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Beliefs</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Aggregated, anonymized belief data from Belief Genome participants around the world.
            See how beliefs vary across generations, genders, and geographies.
          </p>
        </motion.div>

        {/* Compact stats row */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={Dna}       label="Participants"    value={stats?.totalSubmissions ?? 0} loading={statsQ.isLoading} />
          <StatCard icon={Globe}     label="Countries"       value={stats?.uniqueCountries ?? 0}  loading={statsQ.isLoading} />
          <StatCard icon={BarChart3} label="Avg Dimensions"  value={stats?.avgDimensionsExplored ?? 0} loading={statsQ.isLoading} />
          <StatCard icon={Users}     label="Privacy Minimum" value={5} suffix="per group" />
        </motion.div>

        {/* Filter bar at TOP */}
        <FilterBar
          filters={filters}
          onChange={setFilters}
          availableCountries={countriesQ.data?.countries || []}
          totalResults={stats?.totalSubmissions}
        />

        {/* Tab switcher */}
        <div className="bg-card/80 border border-border rounded-2xl p-2 flex flex-wrap gap-1 sticky top-0 z-20 backdrop-blur">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-gradient-to-r from-primary to-secondary text-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden">{t.label.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>

        {insufficientData && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            <Info size={14} />
            Not enough data for this filter combination. Broaden your filters or wait for more submissions (minimum 5 per group).
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "breakdown" && (
              <BreakdownPanel
                dimensions={dimensions}
                dimCount={dimCount}
                loading={dimensionsQ.isLoading}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                categoryFilter={filters.categories}
              />
            )}
            {activeTab === "timeline" && (
              <TimelinePanel
                timeline={timelineQ.data?.timeline || []}
                loading={timelineQ.isLoading}
                interval={timelineInterval}
                onIntervalChange={setTimelineInterval}
                categoryFilter={filters.categories}
              />
            )}
            {activeTab === "geo" && (
              <GeoPanel
                countryBeliefs={countryBeliefsQ.data?.countryBeliefs || {}}
                loading={countryBeliefsQ.isLoading}
              />
            )}
            {activeTab === "gender" && (
              <GenderPanel
                genders={gendersQ.data?.genders || []}
                loading={gendersQ.isLoading}
              />
            )}
            {activeTab === "generation" && (
              <GenerationPanel
                generations={generationsQ.data?.generations || []}
                loading={generationsQ.isLoading}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4 py-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm">
            <Info size={14} />
            All data is anonymized and aggregated. No individual submissions are ever displayed.
          </div>
          <p className="text-muted-foreground text-xs max-w-lg mx-auto">
            Belief DNA is submitted voluntarily and anonymously. Groups with fewer than 5 participants are hidden for privacy.
          </p>
        </motion.div>
      </div>
    </PublicLayout>
  );
}

// ---------- Shared chart styling ----------

const baseTooltipStyle = {
  backgroundColor: '#0c1025',
  borderColor: '#ffffff20',
  borderWidth: 1,
  titleColor: 'var(--text-primary)',
  bodyColor: '#94a3b8',
  padding: 12,
  cornerRadius: 8,
};

const scaleOptions = {
  x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: '#ffffff08' } },
  y: {
    min: DISPLAY_MIN, max: DISPLAY_MAX,
    ticks: {
      color: '#64748b', stepSize: 1,
      callback: (v: any) => (v > 0 ? `+${v}` : v),
    },
    grid: {
      color: (ctx: any) => ctx.tick?.value === 0 ? '#ffffff30' : '#ffffff08',
      lineWidth: (ctx: any) => ctx.tick?.value === 0 ? 1.5 : 1,
    },
  },
};

function wrapText(text: string, maxLen = 50): string[] {
  const lines: string[] = [''];
  const words = text.split(' ');
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > maxLen && line) {
      lines.push(line.trim());
      line = w;
    } else {
      line = line ? line + ' ' + w : w;
    }
  }
  if (line) lines.push(line.trim());
  return lines;
}

// ---------- Panels ----------

function PanelShell({ title, subtitle, tooltip, badge, actions, children }: {
  title: string; subtitle?: string; tooltip?: string; badge?: string;
  actions?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="bg-card/80 border border-border rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            {title}
            {badge && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">{badge}</span>
            )}
            {tooltip && <InfoTip text={tooltip} />}
          </h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}

function PanelSkeleton({ height = 350 }: { height?: number }) {
  return (
    <div className="bg-card/80 border border-border rounded-2xl p-6">
      <div className="h-5 w-48 bg-foreground/5 rounded mb-2 animate-pulse" />
      <div className="h-3 w-72 bg-foreground/5 rounded mb-6 animate-pulse" />
      <div className="bg-foreground/5 rounded-xl animate-pulse" style={{ height }} />
    </div>
  );
}

// ---------- Breakdown Panel ----------

function BreakdownPanel({
  dimensions, dimCount, loading, selectedCategory, onSelectCategory, categoryFilter,
}: {
  dimensions: Record<string, { avg: number; count: number }>;
  dimCount: number;
  loading: boolean;
  selectedCategory: string;
  onSelectCategory: (c: string) => void;
  categoryFilter: string[];
}) {
  if (loading && dimCount === 0) return <PanelSkeleton height={400} />;

  const visibleCategories = categoryFilter.length > 0
    ? EXPLORE_CAT_ORDER.filter(c => categoryFilter.includes(c))
    : EXPLORE_CAT_ORDER;

  const categoryAvgs: Record<string, { avg: number; count: number }> = {};
  for (const [catKey, cat] of Object.entries(CATEGORIES)) {
    let sum = 0, count = 0;
    for (const id of cat.dims) {
      const d = dimensions[String(id)];
      if (d) { sum += d.avg; count++; }
    }
    if (count > 0) categoryAvgs[catKey] = { avg: sum / count, count };
  }

  const cat = CATEGORIES[selectedCategory];
  const categoryDims = cat ? cat.dims.map(id => ({
    id,
    name: DIM_NAMES[String(id)] || `Dim ${id}`,
    avg: dimensions[String(id)]?.avg ?? null,
    count: dimensions[String(id)]?.count ?? 0,
  })) : [];

  const displayVals = categoryDims.map(d => d.avg !== null ? rawToDisplay(d.avg) : null);

  const barChartData = {
    labels: categoryDims.map(d => d.name),
    datasets: [{
      label: `Average Score (${cat?.label})`,
      data: displayVals,
      backgroundColor: displayVals.map(v => v !== null ? displayBarColor(v) + 'aa' : '#787891'),
      borderColor: displayVals.map(v => v !== null ? displayBarBorder(v) : '#787891'),
      borderWidth: 2,
      borderRadius: 6,
    }],
  };

  const dimChartOptions: any = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        ...baseTooltipStyle,
        bodyFont: { size: 12 }, padding: 14, displayColors: false,
        callbacks: {
          title: (items: any[]) => items[0]?.label || '',
          label: (ctx: any) => {
            const val = ctx.parsed?.y;
            if (val === null || val === undefined) return '';
            const sign = val > 0 ? '+' : '';
            const dir = val > 0.3 ? '↑ Leaning True' : val < -0.3 ? '↓ Leaning False' : '→ Neutral';
            return `Score: ${sign}${val.toFixed(2)} ${dir}`;
          },
          afterBody: (items: any[]) => {
            if (!items.length) return '';
            const idx = items[0].dataIndex;
            const c = CATEGORIES[selectedCategory];
            if (!c) return '';
            const dimId = String(c.dims[idx]);
            const val = items[0].parsed?.y;
            if (val === null || val === undefined) return '';
            const interp = getBeliefInterpretation(dimId, val);
            return interp ? wrapText(interp) : '';
          },
        },
      },
    },
    scales: scaleOptions,
  };

  const neutralLinePlugin = {
    id: 'neutralLine',
    afterDraw(chart: any) {
      const yScale = chart.scales.y;
      if (!yScale) return;
      const y = yScale.getPixelForValue(DISPLAY_NEUTRAL);
      const { left, right } = chart.chartArea;
      const ctx = chart.ctx;
      const color = CATEGORIES[selectedCategory]?.color || 'var(--accent-bright)';
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = color + '88';
      ctx.lineWidth = 1.5;
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    },
  };

  return (
    <div className="space-y-6">
      {/* Category bar view across all categories */}
      <PanelShell
        title="All Categories Overview"
        subtitle={`Based on ${dimCount.toLocaleString()} submissions matching your filters`}
        badge={categoryFilter.length > 0 ? `${visibleCategories.length}/11 shown` : undefined}
        tooltip="Each row shows where the group average sits on a belief spectrum. Use the category filter above to focus on specific categories."
      >
        {visibleCategories.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No categories match your filter. Clear the category filter to see all 11.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {visibleCategories.map(catKey => {
              const data = categoryAvgs[catKey];
              const hasData = !!data;
              const avg = data?.avg ?? 4.5;
              const pct = (avg / 9) * 100;
              const col = exploreCatColour(hasData ? avg : null);
              const lbl = hasData ? exploreDomainLabel(catKey, avg) : '';
              const axis = EXPLORE_DOMAIN_AXES[catKey] || { left: '', right: '' };
              const name = EXPLORE_CAT_SHORT[catKey] || catKey;
              const cnt = data?.count ?? 0;
              return (
                <div key={catKey} style={{ opacity: hasData ? 1 : 0.32 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 40px 130px', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'right' }}>{name}</span>
                    <div style={{ position: 'relative', height: 14 }}>
                      <div style={{
                        position: 'absolute', inset: '3px 0', borderRadius: 4,
                        background: 'linear-gradient(90deg, #dc2626, #fca5a5 25%, #22c55e 50%, #93c5fd 75%, #2563eb)',
                        opacity: 0.85,
                      }} />
                      <div style={{ position: 'absolute', left: '50%', top: 0, width: 1, height: '100%', background: 'rgba(255,255,255,0.28)', zIndex: 3 }} />
                      {hasData && (
                        <div style={{
                          position: 'absolute', left: `${pct}%`, top: '50%', transform: 'translate(-50%, -50%)',
                          width: 15, height: 15, borderRadius: '50%', background: col,
                          border: '2.5px solid rgba(255,255,255,0.92)',
                          boxShadow: `0 0 8px ${col}, 0 0 2px rgba(0,0,0,0.8)`, zIndex: 4,
                        }} />
                      )}
                    </div>
                    <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: 'var(--text-faint)', textAlign: 'right' }}>
                      {hasData ? `${cnt}×` : ''}
                    </span>
                    <span style={{ fontSize: 11, color: col, textAlign: 'right' }}>{lbl}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 40px 130px', gap: 8, marginTop: 2 }}>
                    <span />
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
                      <span style={{ fontSize: 10, color: 'var(--text-ghost)' }}>{axis.left}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-ghost)' }}>{axis.right}</span>
                    </div>
                    <span /><span />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PanelShell>

      {/* Per-category drill down */}
      <PanelShell
        title={`${cat?.label} — Dimension Details`}
        subtitle={`Zoom into ${cat?.label.toLowerCase()}. Each bar is one specific belief statement. Dashed line = neutral.`}
        tooltip="Each bar is the group's average score on a single belief. Higher = group leans toward agreement, lower = group leans toward disagreement."
      >
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(CATEGORIES).map(([key, c]) => (
            <button
              key={key}
              onClick={() => onSelectCategory(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                selectedCategory === key
                  ? 'text-foreground border-transparent shadow-md'
                  : 'text-muted-foreground border-border hover:border-border hover:text-foreground'
              }`}
              style={selectedCategory === key ? { backgroundColor: c.color, boxShadow: `0 2px 12px ${c.color}40` } : {}}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="h-[360px]">
          <Bar data={barChartData} options={dimChartOptions} plugins={[neutralLinePlugin]} />
        </div>
      </PanelShell>
    </div>
  );
}

// ---------- Timeline Panel ----------

function TimelinePanel({
  timeline, loading, interval, onIntervalChange, categoryFilter,
}: {
  timeline: Array<{ period: string; count: number; avgs: Record<string, number> }>;
  loading: boolean;
  interval: string;
  onIntervalChange: (i: string) => void;
  categoryFilter: string[];
}) {
  if (loading && timeline.length === 0) return <PanelSkeleton height={420} />;

  const visibleCats = categoryFilter.length > 0
    ? Object.entries(CATEGORIES).filter(([k]) => categoryFilter.includes(k))
    : Object.entries(CATEGORIES);

  const formatPeriod = (p: string) => {
    const d = new Date(p);
    if (isNaN(d.getTime())) return p;
    if (interval === 'year') return d.getFullYear().toString();
    if (interval === 'quarter') return `Q${Math.ceil((d.getMonth() + 1) / 3)} ${d.getFullYear()}`;
    if (interval === 'week') return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const labels = timeline.map(t => formatPeriod(t.period));
  const totalSamples = timeline.reduce((s, t) => s + t.count, 0);

  const datasets = visibleCats.map(([, c]) => {
    const data = timeline.map(t => {
      let sum = 0, count = 0;
      for (const dimId of c.dims) {
        const v = t.avgs[String(dimId)];
        if (v !== undefined) { sum += v; count++; }
      }
      return count > 0 ? Math.round(rawToDisplay(sum / count) * 100) / 100 : null;
    });
    return {
      label: c.label,
      data,
      borderColor: c.color + 'CC',
      backgroundColor: c.color + '20',
      borderWidth: 2,
      pointRadius: 4, pointHoverRadius: 7,
      pointBackgroundColor: c.color,
      pointBorderColor: '#0c1025', pointBorderWidth: 1,
      tension: 0.3, fill: false, spanGaps: true,
    };
  });

  // Auto-rescale y when <3 categories shown (architect suggestion)
  const autoScale = visibleCats.length > 0 && visibleCats.length < 3;
  let yMin = DISPLAY_MIN, yMax = DISPLAY_MAX;
  if (autoScale) {
    const flat = datasets.flatMap(d => d.data.filter((v: any) => v !== null) as number[]);
    if (flat.length > 0) {
      const lo = Math.min(...flat), hi = Math.max(...flat);
      const pad = Math.max(0.5, (hi - lo) * 0.25);
      yMin = Math.floor(lo - pad);
      yMax = Math.ceil(hi + pad);
    }
  }

  const timelineOptions: any = {
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#94a3b8', padding: 10, font: { size: 11 }, usePointStyle: true, pointStyle: 'circle' },
      },
      tooltip: {
        backgroundColor: '#0c1025', borderColor: '#ffffff20', borderWidth: 1,
        titleColor: 'var(--text-primary)', titleFont: { size: 13, weight: 'bold' }, titleMarginBottom: 8,
        bodyColor: '#94a3b8', bodyFont: { size: 12 }, bodySpacing: 6,
        padding: { top: 12, bottom: 12, left: 12, right: 12 }, cornerRadius: 8,
        callbacks: {
          title: (items: any[]) => {
            if (!items.length) return '';
            const idx = items[0].dataIndex;
            const point = timeline[idx];
            return `${items[0].label} · n=${point?.count ?? '?'}`;
          },
          label: (ctx: any) => {
            const val = ctx.parsed?.y;
            if (val === null || val === undefined) return '';
            const sign = val > 0 ? '+' : '';
            const dir = val > 0.3 ? '↑ Leaning True' : val < -0.3 ? '↓ Leaning False' : '→ Neutral';
            return ` ${ctx.dataset.label}: ${sign}${val.toFixed(1)} ${dir}`;
          },
        },
      },
    },
    scales: {
      x: { ticks: { color: '#64748b', font: { size: 10 }, maxRotation: 45 }, grid: { color: '#ffffff08' } },
      y: {
        min: yMin, max: yMax,
        ticks: { color: '#64748b', stepSize: 1, callback: (v: any) => (v > 0 ? `+${v}` : v) },
        grid: {
          color: (ctx: any) => ctx.tick?.value === 0 ? '#ffffff40' : '#ffffff08',
          lineWidth: (ctx: any) => ctx.tick?.value === 0 ? 2 : 1,
        },
      },
    },
  };

  return (
    <PanelShell
      title="Belief Evolution Timeline"
      subtitle={`How collective beliefs shift over time — midline = Neutral. ${totalSamples.toLocaleString()} samples total${autoScale ? ' · auto-scaled y-axis' : ''}`}
      badge={categoryFilter.length > 0 ? `${visibleCats.length}/11 shown` : undefined}
      tooltip="Each line is one belief category. Positive values = collective agreement, negative = disagreement. Use the category filter to focus on specific categories; with <3 selected, the y-axis auto-scales for more drama."
      actions={
        <div className="flex gap-1">
          {TIMELINE_INTERVALS.map(ti => (
            <button
              key={ti.value}
              onClick={() => onIntervalChange(ti.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                interval === ti.value
                  ? 'bg-primary/20 border-primary/40 text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              {ti.label}
            </button>
          ))}
        </div>
      }
    >
      {timeline.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No timeline data for the current filters.</p>
      ) : visibleCats.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No categories match your filter. Clear the category filter to see all 11.</p>
      ) : (
        <div className="h-[420px]">
          <Line data={{ labels, datasets }} options={timelineOptions} />
        </div>
      )}
    </PanelShell>
  );
}

// ---------- Geo Panel ----------

function GeoPanel({
  countryBeliefs, loading,
}: { countryBeliefs: Record<string, { avg: number; count: number }>; loading: boolean }) {
  if (loading && Object.keys(countryBeliefs).length === 0) return <PanelSkeleton height={500} />;

  return (
    <PanelShell
      title="World Belief Heatmap"
      subtitle="Red = disbelief-leaning · Blue = belief-leaning · Grey = neutral. Only countries with 5+ participants shown."
      tooltip="Hover over a country to see its average score and participant count."
    >
      {Object.keys(countryBeliefs).length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No country-level data for the current filters.</p>
      ) : (
        <Suspense fallback={<div className="flex items-center justify-center h-[400px]"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
          <WorldBeliefMap countryBeliefs={countryBeliefs} />
        </Suspense>
      )}
    </PanelShell>
  );
}

// ---------- Gender Panel ----------

function GenderPanel({
  genders, loading,
}: { genders: Array<{ gender: string; count: number }>; loading: boolean }) {
  if (loading && genders.length === 0) return <PanelSkeleton height={400} />;

  const genderLabels: Record<string, string> = { M: 'Male', F: 'Female', NB: 'Non-Binary', PNS: 'Prefer Not to Say', Intersex: 'Intersex' };
  const colors = ['var(--accent-bright)', 'var(--accent-text)', '#22d3ee', '#ff6b81', '#44bd32'];
  const data = {
    labels: genders.map(g => genderLabels[g.gender] || g.gender),
    datasets: [{
      data: genders.map(g => g.count),
      backgroundColor: genders.map((_, i) => colors[i % colors.length]),
      borderWidth: 0,
    }],
  };
  const total = genders.reduce((s, g) => s + g.count, 0);

  return (
    <PanelShell
      title="Participants by Gender"
      subtitle={`${total.toLocaleString()} submissions across ${genders.length} gender identities`}
      tooltip="Shows the distribution of participants by self-reported gender. Groups with fewer than 5 participants are hidden for privacy."
    >
      {genders.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No gender data for the current filters.</p>
      ) : (
        <div className="h-[380px] flex items-center justify-center">
          <Doughnut
            data={data}
            options={{
              responsive: true, maintainAspectRatio: false,
              plugins: {
                legend: { position: 'right', labels: { color: '#94a3b8', padding: 16, font: { size: 12 } } },
                tooltip: {
                  ...baseTooltipStyle,
                  callbacks: {
                    label: (ctx: any) => {
                      const v = ctx.parsed; const pct = total > 0 ? Math.round((v / total) * 100) : 0;
                      return ` ${ctx.label}: ${v.toLocaleString()} (${pct}%)`;
                    },
                  },
                },
              },
            } as any}
          />
        </div>
      )}
    </PanelShell>
  );
}

// ---------- Generation Panel ----------

function GenerationPanel({
  generations, loading, selectedCategory, onSelectCategory,
}: {
  generations: Array<{ label: string; start: number; end: number; count: number; avgBeliefs: Record<string, number> }>;
  loading: boolean;
  selectedCategory: string;
  onSelectCategory: (c: string) => void;
}) {
  if (loading && generations.length === 0) return <PanelSkeleton height={400} />;

  const cat = CATEGORIES[selectedCategory];
  const dimIds = cat?.dims || [];

  const genDisplayVals = generations.map(g => {
    let sum = 0, count = 0;
    for (const id of dimIds) {
      const v = g.avgBeliefs[String(id)];
      if (v !== undefined) { sum += v; count++; }
    }
    return count > 0 ? Math.round(rawToDisplay(sum / count) * 100) / 100 : null;
  });

  const data = {
    labels: generations.map(g => g.label.replace('Generation ', 'Gen ')),
    datasets: [{
      label: `${cat?.label} Avg`,
      data: genDisplayVals,
      backgroundColor: genDisplayVals.map(v => v !== null ? displayBarColor(v) + 'aa' : '#787891'),
      borderColor: genDisplayVals.map(v => v !== null ? displayBarBorder(v) : '#787891'),
      borderWidth: 2, borderRadius: 6,
    }],
  };

  const options: any = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        ...baseTooltipStyle,
        bodyFont: { size: 12 }, padding: 14, displayColors: false,
        callbacks: {
          title: (items: any[]) => {
            const idx = items[0].dataIndex;
            const g = generations[idx];
            return `${items[0].label} · n=${g?.count ?? '?'}`;
          },
          label: (ctx: any) => {
            const val = ctx.parsed?.y;
            if (val === null || val === undefined) return '';
            const sign = val > 0 ? '+' : '';
            const dir = val > 0.3 ? '↑ Leaning True' : val < -0.3 ? '↓ Leaning False' : '→ Neutral';
            return `${ctx.dataset.label}: ${sign}${val.toFixed(2)} ${dir}`;
          },
          afterBody: (items: any[]) => {
            const val = items[0].parsed?.y;
            if (val === null || val === undefined) return '';
            const interp = getCategoryInterpretation(selectedCategory, val, items[0].label || '');
            return interp ? wrapText(interp) : '';
          },
        },
      },
    },
    scales: scaleOptions,
  };

  return (
    <PanelShell
      title={`${cat?.label} by Generation`}
      subtitle={`How ${cat?.label.toLowerCase()} beliefs shift across age cohorts`}
      tooltip="Compares average belief scores by generation for the selected category. Switch categories with the pills below."
    >
      <div className="flex flex-wrap gap-2 mb-4">
        {CATEGORY_OPTIONS.map(c => (
          <button
            key={c.value}
            onClick={() => onSelectCategory(c.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
              selectedCategory === c.value
                ? 'text-foreground border-transparent shadow-md'
                : 'text-muted-foreground border-border hover:border-border hover:text-foreground'
            }`}
            style={selectedCategory === c.value ? { backgroundColor: c.color, boxShadow: `0 2px 12px ${c.color}40` } : {}}
          >
            {c.label}
          </button>
        ))}
      </div>
      {generations.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No generation data for the current filters.</p>
      ) : (
        <div className="h-[380px]">
          <Bar data={data} options={options} />
        </div>
      )}
    </PanelShell>
  );
}

// ---------- Small shared UI ----------

function InfoTip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex ml-1.5" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <Info size={16} className="text-muted-foreground/60 hover:text-primary transition-colors" />
      {show && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 px-3 py-2.5 rounded-xl bg-muted border border-white/15 text-xs text-[#c8cfe0] leading-relaxed shadow-xl pointer-events-none">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-[#1a1f3a]" />
        </span>
      )}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, suffix, loading }: { icon: any; label: string; value: number; suffix?: string; loading?: boolean }) {
  return (
    <div className="bg-card/80 border border-border rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon size={18} className="text-primary" />
        </div>
        <div className="min-w-0">
          {loading ? (
            <div className="h-7 w-16 bg-foreground/5 rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-foreground">{value.toLocaleString()}</p>
          )}
          <p className="text-xs text-muted-foreground">{label}{suffix ? ` ${suffix}` : ''}</p>
        </div>
      </div>
    </div>
  );
}
