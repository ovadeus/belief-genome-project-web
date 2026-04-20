import { useState, useMemo } from "react";
import { Filter, ChevronDown, ChevronUp, Search, X, Check } from "lucide-react";
import type { ExploreFilters } from "@/hooks/use-explore";

export const GENERATION_LABELS = [
  "Silent Generation",
  "Baby Boomers",
  "Generation X",
  "Millennials",
  "Generation Z",
];

export const GENDER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "F", label: "Female" },
  { value: "M", label: "Male" },
  { value: "NB", label: "Non-Binary" },
  { value: "Intersex", label: "Intersex" },
  { value: "PNS", label: "Prefer Not to Say" },
];

export const CATEGORY_OPTIONS: Array<{ value: string; label: string; color: string }> = [
  { value: "epistemology",  label: "Philosophy",     color: "#6c63ff" },
  { value: "spirituality",  label: "Religion",       color: "#ff9f43" },
  { value: "morality",      label: "Morality",       color: "#ee5a24" },
  { value: "politics",      label: "Politics",       color: "#0097e6" },
  { value: "social",        label: "Society",        color: "#44bd32" },
  { value: "economics",     label: "Economics",      color: "#e1b12c" },
  { value: "science_tech",  label: "Sci & Tech",     color: "#00d2d3" },
  { value: "education",     label: "Education",      color: "#c56cf0" },
  { value: "health",        label: "Health",         color: "#22c55e" },
  { value: "psychology",    label: "Psychology",     color: "#3b82f6" },
  { value: "relationships", label: "Relationships",  color: "#ff6b81" },
];

export const COUNTRY_NAMES: Record<string, string> = {
  "840":"United States","826":"United Kingdom","124":"Canada","036":"Australia","276":"Germany",
  "250":"France","356":"India","076":"Brazil","392":"Japan","410":"South Korea",
  "484":"Mexico","380":"Italy","724":"Spain","528":"Netherlands","752":"Sweden",
  "616":"Poland","710":"South Africa",
};

interface FilterBarProps {
  filters: ExploreFilters;
  onChange: (next: ExploreFilters) => void;
  availableCountries: Array<{ countryCode: string; count: number }>;
  totalResults?: number;
}

interface SectionProps {
  title: string;
  count: number;
  children: React.ReactNode;
}

function Section({ title, count, children }: SectionProps) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-border rounded-xl bg-card/60">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
          {count > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
              {count} selected
            </span>
          )}
        </div>
        {open ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

interface CheckboxPillProps {
  checked: boolean;
  onToggle: () => void;
  label: string;
  color?: string;
  badge?: string | number;
}

function CheckboxPill({ checked, onToggle, label, color, badge }: CheckboxPillProps) {
  return (
    <button
      onClick={onToggle}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
        checked
          ? "border-transparent text-foreground shadow-sm"
          : "border-border text-muted-foreground hover:border-border hover:text-foreground bg-card/60"
      }`}
      style={checked ? { backgroundColor: (color || "var(--accent-bright)") + "dd", boxShadow: `0 2px 12px ${color || "var(--accent-bright)"}40` } : {}}
    >
      <span className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center flex-shrink-0 ${
        checked ? "bg-foreground/90 border-white/90" : "border-border"
      }`}>
        {checked && <Check size={10} strokeWidth={3} className="text-background" />}
      </span>
      <span>{label}</span>
      {badge !== undefined && (
        <span className={`text-[10px] opacity-75`}>({badge})</span>
      )}
    </button>
  );
}

export function FilterBar({ filters, onChange, availableCountries, totalResults }: FilterBarProps) {
  const [open, setOpen] = useState(true);
  const [countrySearch, setCountrySearch] = useState("");

  const countryList = useMemo(() => {
    const sorted = [...availableCountries].sort((a, b) => b.count - a.count);
    if (!countrySearch) return sorted;
    const q = countrySearch.toLowerCase();
    return sorted.filter(c => {
      const name = (COUNTRY_NAMES[c.countryCode] || c.countryCode).toLowerCase();
      return name.includes(q) || c.countryCode.includes(q);
    });
  }, [availableCountries, countrySearch]);

  function toggle(field: keyof ExploreFilters, value: string) {
    const current = filters[field] as string[];
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onChange({ ...filters, [field]: next });
  }

  const activeCount =
    filters.countries.length +
    filters.genders.length +
    filters.generations.length +
    filters.categories.length;

  function clearAll() {
    onChange({ ...filters, countries: [], genders: [], generations: [], categories: [] });
    setCountrySearch("");
  }

  return (
    <div className="bg-card/80 border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4"
      >
        <div className="flex items-center gap-3">
          <Filter size={16} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Advanced Filters</h3>
          {activeCount > 0 && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
              {activeCount} active
            </span>
          )}
          {totalResults !== undefined && (
            <span className="text-xs text-muted-foreground hidden sm:inline">· {totalResults.toLocaleString()} matching submissions</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {activeCount > 0 && (
            <span
              onClick={(e) => { e.stopPropagation(); clearAll(); }}
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 cursor-pointer"
            >
              <X size={12} /> Clear
            </span>
          )}
          {open ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
        </div>
      </button>

      {open && (
        <div className="px-6 pb-6 space-y-3 border-t border-border/50 pt-4">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Nothing selected = include everyone. Check items to narrow your view.
            Category filters affect the <span className="text-foreground">Category Breakdown</span> and <span className="text-foreground">Timeline</span> views.
          </p>

          <Section title="Countries" count={filters.countries.length}>
            <div className="relative mb-3">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={countrySearch}
                onChange={e => setCountrySearch(e.target.value)}
                placeholder="Search countries..."
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
              />
            </div>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
              {countryList.length === 0 ? (
                <span className="text-xs text-muted-foreground">No countries available</span>
              ) : countryList.map(c => (
                <CheckboxPill
                  key={c.countryCode}
                  checked={filters.countries.includes(c.countryCode)}
                  onToggle={() => toggle("countries", c.countryCode)}
                  label={COUNTRY_NAMES[c.countryCode] || c.countryCode}
                  badge={c.count}
                />
              ))}
            </div>
          </Section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Section title="Generations" count={filters.generations.length}>
              <div className="flex flex-wrap gap-2">
                {GENERATION_LABELS.map(g => (
                  <CheckboxPill
                    key={g}
                    checked={filters.generations.includes(g)}
                    onToggle={() => toggle("generations", g)}
                    label={g.replace("Generation ", "Gen ")}
                  />
                ))}
              </div>
            </Section>

            <Section title="Genders" count={filters.genders.length}>
              <div className="flex flex-wrap gap-2">
                {GENDER_OPTIONS.map(g => (
                  <CheckboxPill
                    key={g.value}
                    checked={filters.genders.includes(g.value)}
                    onToggle={() => toggle("genders", g.value)}
                    label={g.label}
                  />
                ))}
              </div>
            </Section>
          </div>

          <Section title="Categories (for Breakdown & Timeline)" count={filters.categories.length}>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map(c => (
                <CheckboxPill
                  key={c.value}
                  checked={filters.categories.includes(c.value)}
                  onToggle={() => toggle("categories", c.value)}
                  label={c.label}
                  color={c.color}
                />
              ))}
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}
