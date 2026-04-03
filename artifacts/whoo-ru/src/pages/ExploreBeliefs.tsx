import { useState, useEffect, useMemo, useCallback } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { motion } from "framer-motion";
import { Globe, Users, BarChart3, Dna, Filter, ChevronDown, ChevronUp, Info } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Radar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, ArcElement);

const API_BASE = import.meta.env.VITE_API_URL || "/api";

const CATEGORIES: Record<string, { label: string; color: string; dims: number[] }> = {
  epistemology:  { label: 'Epistemology',    color: '#6c63ff', dims: [4,5,6,7,8,9,10,11,12,13] },
  spirituality:  { label: 'Spirituality',    color: '#ff9f43', dims: [14,15,16,17,18,19,20,21,22,23,24,25,26,27,28] },
  morality:      { label: 'Morality',        color: '#ee5a24', dims: [29,30,31,32,33,34,35,36,37,38,39,40,41,42,43] },
  politics:      { label: 'Politics',        color: '#0097e6', dims: [44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63] },
  social:        { label: 'Social',          color: '#44bd32', dims: [64,65,66,67,68,69,70,71,72,73,74,75,76,77,78] },
  economics:     { label: 'Economics',       color: '#e1b12c', dims: [79,80,81,82,83,84,85,86,87,88] },
  science_tech:  { label: 'Science & Tech',  color: '#00d2d3', dims: [89,90,91,92,93,94,95,96,97,98] },
  education:     { label: 'Education',       color: '#c56cf0', dims: [99,100,101,102,103] },
  health:        { label: 'Health',          color: '#ff4757', dims: [104,105,106,107,108] },
  psychology:    { label: 'Psychology',      color: '#2ed573', dims: [109,110,111,112,113,114,115,116,117,118] },
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
  if (avg09 == null) return '#787891';
  const v = avg09 / 9;
  if (v <= 0.22) return '#dc3232';
  if (v <= 0.40) return '#ff7728';
  if (v <= 0.60) return '#787891';
  if (v <= 0.78) return '#3cb4b4';
  return '#50b4ff';
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

const COUNTRY_NAMES: Record<string, string> = {
  "840":"United States","826":"United Kingdom","124":"Canada","036":"Australia","276":"Germany",
  "250":"France","356":"India","076":"Brazil","392":"Japan","410":"South Korea",
  "484":"Mexico","380":"Italy","724":"Spain","528":"Netherlands","752":"Sweden",
  "616":"Poland","710":"South Africa",
};

const GENERATION_OPTIONS = [
  { label: "All Generations", start: "", end: "" },
  { label: "Silent Generation (1928-1945)", start: "1928", end: "1945" },
  { label: "Baby Boomers (1946-1964)", start: "1946", end: "1964" },
  { label: "Generation X (1965-1980)", start: "1965", end: "1980" },
  { label: "Millennials (1981-1996)", start: "1981", end: "1996" },
  { label: "Generation Z (1997-2012)", start: "1997", end: "2012" },
];

const GENDER_OPTIONS = [
  { label: "All Genders", value: "" },
  { label: "Male", value: "M" },
  { label: "Female", value: "F" },
  { label: "Non-Binary", value: "NB" },
];

interface DimData { avg: number; count: number; }
interface StatsData { totalSubmissions: number; totalWithTest: number; uniqueCountries: number; avgDimensionsExplored: number; }
interface GenerationData { label: string; start: number; end: number; count: number; avgBeliefs: Record<string, number>; }
interface GenderData { gender: string; count: number; }
interface CountryData { countryCode: string; count: number; }

export default function ExploreBeliefs() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [dimensions, setDimensions] = useState<Record<string, DimData>>({});
  const [dimCount, setDimCount] = useState(0);
  const [insufficientData, setInsufficientData] = useState(false);
  const [generations, setGenerations] = useState<GenerationData[]>([]);
  const [genders, setGenders] = useState<GenderData[]>([]);
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("epistemology");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterGenIdx, setFilterGenIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [breakdownOpen, setBreakdownOpen] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const qp = new URLSearchParams();
      if (filterCountry) qp.set("country", filterCountry);
      if (filterGender) qp.set("gender", filterGender);
      const gen = GENERATION_OPTIONS[filterGenIdx];
      if (gen.start) { qp.set("generationStart", gen.start); qp.set("generationEnd", gen.end); }

      const [statsRes, dimsRes, gensRes, gendersRes, countriesRes] = await Promise.all([
        fetch(`${API_BASE}/genome/stats`),
        fetch(`${API_BASE}/genome/explore/dimensions?${qp}`),
        fetch(`${API_BASE}/genome/explore/generations`),
        fetch(`${API_BASE}/genome/explore/genders`),
        fetch(`${API_BASE}/genome/explore/countries`),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (dimsRes.ok) {
        const d = await dimsRes.json();
        setDimensions(d.dimensions || {});
        setDimCount(d.count || 0);
        setInsufficientData(d.insufficientData || false);
      }
      if (gensRes.ok) { const d = await gensRes.json(); setGenerations(d.generations || []); }
      if (gendersRes.ok) { const d = await gendersRes.json(); setGenders(d.genders || []); }
      if (countriesRes.ok) { const d = await countriesRes.json(); setCountries(d.countries || []); }
    } catch (err) { console.error("Failed to load explore data:", err); }
    setLoading(false);
  }, [filterCountry, filterGender, filterGenIdx]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const categoryDims = useMemo(() => {
    const cat = CATEGORIES[selectedCategory];
    if (!cat) return [];
    return cat.dims.map(id => ({
      id,
      name: DIM_NAMES[String(id)] || `Dim ${id}`,
      avg: dimensions[String(id)]?.avg ?? null,
      count: dimensions[String(id)]?.count ?? 0,
    }));
  }, [selectedCategory, dimensions]);

  const categoryAvgs = useMemo(() => {
    const result: Record<string, { avg: number; count: number }> = {};
    for (const [catKey, cat] of Object.entries(CATEGORIES)) {
      let sum = 0, count = 0;
      for (const id of cat.dims) {
        const d = dimensions[String(id)];
        if (d) { sum += d.avg; count++; }
      }
      if (count > 0) result[catKey] = { avg: sum / count, count };
    }
    return result;
  }, [dimensions]);

  const barChartData = useMemo(() => {
    const cat = CATEGORIES[selectedCategory];
    return {
      labels: categoryDims.map(d => d.name),
      datasets: [{
        label: `Average Score (${cat?.label})`,
        data: categoryDims.map(d => d.avg ?? 0),
        backgroundColor: `${cat?.color}88`,
        borderColor: cat?.color,
        borderWidth: 2,
        borderRadius: 6,
      }],
    };
  }, [categoryDims, selectedCategory]);

  const radarChartData = useMemo(() => {
    const catKeys = Object.keys(CATEGORIES);
    const labels = catKeys.map(k => CATEGORIES[k].label);
    const colors = catKeys.map(k => CATEGORIES[k].color);

    const avgPerCat = catKeys.map(k => {
      const dims = CATEGORIES[k].dims;
      let sum = 0, count = 0;
      for (const id of dims) {
        const d = dimensions[String(id)];
        if (d) { sum += d.avg; count++; }
      }
      return count > 0 ? sum / count : 0;
    });

    return {
      labels,
      datasets: [{
        label: 'Category Averages',
        data: avgPerCat,
        backgroundColor: 'rgba(108, 143, 255, 0.15)',
        borderColor: '#6c8fff',
        borderWidth: 2,
        pointBackgroundColor: colors,
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
        pointRadius: 5,
      }],
    };
  }, [dimensions]);

  const generationChartData = useMemo(() => {
    if (generations.length === 0) return null;
    const catKey = selectedCategory;
    const cat = CATEGORIES[catKey];
    const dimIds = cat.dims;

    return {
      labels: generations.map(g => g.label.replace('Generation ', 'Gen ')),
      datasets: [{
        label: `${cat.label} Avg`,
        data: generations.map(g => {
          let sum = 0, count = 0;
          for (const id of dimIds) {
            const val = g.avgBeliefs[String(id)];
            if (val !== undefined) { sum += val; count++; }
          }
          return count > 0 ? Math.round((sum / count) * 100) / 100 : 0;
        }),
        backgroundColor: `${cat.color}66`,
        borderColor: cat.color,
        borderWidth: 2,
        borderRadius: 6,
      }],
    };
  }, [generations, selectedCategory]);

  const genderChartData = useMemo(() => {
    if (genders.length === 0) return null;
    const genderLabels: Record<string, string> = { M: 'Male', F: 'Female', NB: 'Non-Binary', PNS: 'Prefer Not to Say', Intersex: 'Intersex' };
    const colors = ['#6c8fff', '#a78bfa', '#22d3ee', '#ff6b81', '#44bd32'];
    return {
      labels: genders.map(g => genderLabels[g.gender] || g.gender),
      datasets: [{
        data: genders.map(g => g.count),
        backgroundColor: genders.map((_, i) => colors[i % colors.length]),
        borderWidth: 0,
      }],
    };
  }, [genders]);

  const countryChartData = useMemo(() => {
    if (countries.length === 0) return null;
    const sorted = [...countries].sort((a, b) => b.count - a.count).slice(0, 10);
    return {
      labels: sorted.map(c => COUNTRY_NAMES[c.countryCode] || c.countryCode),
      datasets: [{
        label: 'Submissions',
        data: sorted.map(c => c.count),
        backgroundColor: '#6c8fff88',
        borderColor: '#6c8fff',
        borderWidth: 2,
        borderRadius: 6,
      }],
    };
  }, [countries]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0c1025',
        borderColor: '#ffffff20',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: '#94a3b8',
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        ticks: { color: '#64748b', font: { size: 10 } },
        grid: { color: '#ffffff08' },
      },
      y: {
        min: 0, max: 9,
        ticks: { color: '#64748b', stepSize: 1 },
        grid: { color: '#ffffff08' },
      },
    },
  };

  const countBarOptions = {
    ...chartOptions,
    indexAxis: 'y' as const,
    scales: {
      ...chartOptions.scales,
      y: { ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { display: false } },
      x: { ticks: { color: '#64748b' }, grid: { color: '#ffffff08' } },
    },
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      r: {
        min: 0, max: 9,
        ticks: { display: false, stepSize: 1 },
        grid: { color: '#ffffff15' },
        angleLines: { color: '#ffffff10' },
        pointLabels: { color: '#94a3b8', font: { size: 10 } },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' as const, labels: { color: '#94a3b8', padding: 16, font: { size: 12 } } },
    },
  };

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6c8fff] to-[#a78bfa]">Beliefs</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Aggregated, anonymized belief data from Belief Genome participants around the world.
            See how beliefs vary across generations, genders, and geographies.
          </p>
        </motion.div>

        {stats && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Dna} label="Participants" value={stats.totalSubmissions} />
            <StatCard icon={Globe} label="Countries" value={stats.uniqueCountries} />
            <StatCard icon={BarChart3} label="Avg Dimensions" value={stats.avgDimensionsExplored} />
            <StatCard icon={Users} label="Privacy Minimum" value={5} suffix="per group" />
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-[#0c1025]/80 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={16} className="text-primary" />
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Filters</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Country</label>
              <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#121730] border border-white/10 text-sm text-foreground focus:ring-2 focus:ring-primary/30 outline-none appearance-none">
                <option value="">All Countries</option>
                {countries.map(c => (
                  <option key={c.countryCode} value={c.countryCode}>
                    {COUNTRY_NAMES[c.countryCode] || c.countryCode} ({c.count})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Generation</label>
              <select value={filterGenIdx} onChange={e => setFilterGenIdx(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-[#121730] border border-white/10 text-sm text-foreground focus:ring-2 focus:ring-primary/30 outline-none appearance-none">
                {GENERATION_OPTIONS.map((g, i) => <option key={i} value={i}>{g.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Gender</label>
              <select value={filterGender} onChange={e => setFilterGender(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#121730] border border-white/10 text-sm text-foreground focus:ring-2 focus:ring-primary/30 outline-none appearance-none">
                {GENDER_OPTIONS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
          </div>
          {insufficientData && (
            <div className="mt-4 flex items-center gap-2 text-yellow-400 text-sm bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-xl">
              <Info size={14} />
              Not enough data for this filter combination. At least 5 submissions are needed for privacy.
            </div>
          )}
        </motion.div>

        {!loading && !insufficientData && dimCount >= 5 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            className="bg-[#0c1025]/80 border border-white/10 rounded-2xl p-6">
            <button
              onClick={() => setBreakdownOpen(o => !o)}
              className="w-full flex items-center justify-between cursor-pointer"
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              <div style={{
                fontSize: 11, fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
                letterSpacing: 1.5, color: 'rgba(255,255,255,0.5)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <BarChart3 size={14} style={{ opacity: 0.6 }} />
                Category Breakdown
              </div>
              {breakdownOpen ? (
                <ChevronUp size={16} className="text-muted-foreground" />
              ) : (
                <ChevronDown size={16} className="text-muted-foreground" />
              )}
            </button>

            {breakdownOpen && (
              <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 20 }}>
                {EXPLORE_CAT_ORDER.map(cat => {
                  const data = categoryAvgs[cat];
                  const hasData = !!data;
                  const avg = data?.avg ?? 4.5;
                  const pct = (avg / 9) * 100;
                  const col = exploreCatColour(hasData ? avg : null);
                  const lbl = hasData ? exploreDomainLabel(cat, avg) : '';
                  const axis = EXPLORE_DOMAIN_AXES[cat] || { left: '', right: '', mid: '' };
                  const name = EXPLORE_CAT_SHORT[cat] || cat;
                  const cnt = data?.count ?? 0;

                  return (
                    <div key={cat} style={{ opacity: hasData ? 1 : 0.32 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 40px 130px', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'right' }}>{name}</span>
                        <div style={{ position: 'relative', height: 14 }}>
                          <div style={{
                            position: 'absolute', inset: '3px 0', borderRadius: 4,
                            background: 'linear-gradient(90deg, #dc3232, #ff7728 25%, #787891 50%, #3cb4b4 75%, #50b4ff)',
                            opacity: 0.35,
                          }} />
                          <div style={{
                            position: 'absolute', left: '50%', top: 0, width: 1, height: '100%',
                            background: 'rgba(255,255,255,0.28)', zIndex: 3,
                          }} />
                          {hasData && (
                            <div style={{
                              position: 'absolute', left: `${pct}%`, top: '50%',
                              transform: 'translate(-50%, -50%)',
                              width: 15, height: 15, borderRadius: '50%',
                              background: col, border: '2.5px solid rgba(255,255,255,0.92)',
                              boxShadow: `0 0 8px ${col}, 0 0 2px rgba(0,0,0,0.8)`,
                              zIndex: 4,
                            }} />
                          )}
                        </div>
                        <span style={{
                          fontSize: 11, fontFamily: "'Space Mono', monospace",
                          color: 'rgba(255,255,255,0.35)', textAlign: 'right',
                        }}>
                          {hasData ? `${cnt}\u00d7` : ''}
                        </span>
                        <span style={{ fontSize: 11, color: col, textAlign: 'right' }}>{lbl}</span>
                      </div>
                      <div style={{
                        display: 'grid', gridTemplateColumns: '100px 1fr 40px 130px', gap: 8, marginTop: 2,
                      }}>
                        <span />
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{axis.left}</span>
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{axis.right}</span>
                        </div>
                        <span />
                        <span />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-4">Based on {dimCount} submissions matching your filters</p>
              </>
            )}
          </motion.div>
        )}

        <div className="flex flex-wrap gap-2 justify-center">
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                selectedCategory === key
                  ? 'text-white border-transparent shadow-lg'
                  : 'text-muted-foreground border-white/10 hover:border-white/20 hover:text-foreground'
              }`}
              style={selectedCategory === key ? { backgroundColor: cat.color, boxShadow: `0 4px 20px ${cat.color}40` } : {}}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : insufficientData && dimCount < 5 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-[#0c1025]/80 border border-white/10 rounded-2xl p-12 text-center space-y-4">
            <Dna size={48} className="mx-auto text-primary/40" />
            <h3 className="text-xl font-semibold text-foreground">Not Enough Data Yet</h3>
            <p className="text-muted-foreground max-w-lg mx-auto">
              We need at least 5 anonymous Belief DNA submissions before visualizations can be shown.
              Download the Belief Genome desktop app to contribute your anonymous belief profile.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-[#0c1025]/80 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {CATEGORIES[selectedCategory]?.label} — Dimension Averages
              </h3>
              <p className="text-xs text-muted-foreground mb-4">Based on {dimCount} submissions matching your filters</p>
              <div className="h-[350px]">
                <Bar data={barChartData} options={chartOptions as any} />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="bg-[#0c1025]/80 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-1">Belief Radar — All Categories</h3>
              <p className="text-xs text-muted-foreground mb-4">Average score across each category (0-9 scale)</p>
              <div className="h-[350px]">
                <Radar data={radarChartData} options={radarOptions as any} />
              </div>
            </motion.div>

            {generationChartData && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="bg-[#0c1025]/80 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {CATEGORIES[selectedCategory]?.label} by Generation
                </h3>
                <p className="text-xs text-muted-foreground mb-4">How beliefs shift across age groups</p>
                <div className="h-[300px]">
                  <Bar data={generationChartData} options={chartOptions as any} />
                </div>
              </motion.div>
            )}

            {genderChartData && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                className="bg-[#0c1025]/80 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-1">Participants by Gender</h3>
                <p className="text-xs text-muted-foreground mb-4">Distribution of submissions</p>
                <div className="h-[300px] flex items-center justify-center">
                  <Doughnut data={genderChartData} options={doughnutOptions as any} />
                </div>
              </motion.div>
            )}

            {countryChartData && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="lg:col-span-2 bg-[#0c1025]/80 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-1">Top Countries by Submissions</h3>
                <p className="text-xs text-muted-foreground mb-4">Geographic distribution of participants</p>
                <div className="h-[300px]">
                  <Bar data={countryChartData} options={countBarOptions as any} />
                </div>
              </motion.div>
            )}
          </div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="text-center space-y-4 py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm">
            <Info size={14} />
            All data is anonymized and aggregated. No individual submissions are ever displayed.
          </div>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Belief DNA is submitted voluntarily and anonymously through the Belief Genome desktop app.
            Groups with fewer than 5 participants are hidden for privacy.
          </p>
        </motion.div>
      </div>
    </PublicLayout>
  );
}

function StatCard({ icon: Icon, label, value, suffix }: { icon: any; label: string; value: number; suffix?: string }) {
  return (
    <div className="bg-[#0c1025]/80 border border-white/10 rounded-2xl p-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon size={18} className="text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}{suffix ? ` ${suffix}` : ''}</p>
        </div>
      </div>
    </div>
  );
}
