import { PublicLayout } from "@/components/layout/PublicLayout";
import { DIMENSIONS, CATEGORIES } from "@belief-genome/engine";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Dimensions() {
  const [search, setSearch] = useState("");

  const filteredDimensions = useMemo(() => {
    if (!search.trim()) return DIMENSIONS;
    const query = search.toLowerCase();
    return DIMENSIONS.filter(
      (d) =>
        d.name.toLowerCase().includes(query) ||
        d.short.toLowerCase().includes(query) ||
        d.desc.toLowerCase().includes(query)
    );
  }, [search]);

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, typeof DIMENSIONS> = {};
    for (const d of filteredDimensions) {
      if (!groups[d.cat]) groups[d.cat] = [];
      groups[d.cat].push(d);
    }
    return groups;
  }, [filteredDimensions]);

  return (
    <PublicLayout>
      <div className="py-24 px-4 max-w-5xl mx-auto">
        <div className="mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4">Belief Dimensions</h1>
          <p className="text-xl text-muted-foreground">
            Explore the 124 foundational dimensions of the Belief Genome Project.
          </p>
        </div>

        <div className="relative mb-12">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search dimensions by name, category, or description..."
            className="pl-10 h-12 text-lg bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="space-y-12">
          {Object.entries(grouped).map(([catKey, dims]) => {
            const category = CATEGORIES[catKey] || { label: catKey, color: "#888" };
            return (
              <div key={catKey} className="space-y-4">
                <div className="flex items-center gap-3 border-b pb-2">
                  <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: category.color }} />
                  <h2 className="font-display text-2xl font-semibold">{category.label}</h2>
                  <span className="text-muted-foreground ml-auto text-sm">{dims.length} dimensions</span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {dims.map((d) => (
                    <div key={d.id} className="bg-card border border-border/50 rounded-lg p-5 flex flex-col">
                      <div className="flex justify-between items-start mb-2 gap-4">
                        <h3 className="font-semibold text-lg leading-tight">{d.name}</h3>
                        <Badge variant="secondary" className="shrink-0 font-mono text-xs">ID: {d.id}</Badge>
                      </div>
                      <p className="text-muted-foreground text-sm flex-1">{d.desc}</p>
                      <div className="mt-4 pt-3 border-t border-border/40 text-xs text-muted-foreground/80 font-medium">
                        Short: {d.short}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {Object.keys(grouped).length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              No dimensions found matching "{search}".
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
