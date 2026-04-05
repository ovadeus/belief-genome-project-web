import { useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { rawToDisplay, formatDisplay } from "@/lib/belief-scale";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const COUNTRY_NAMES: Record<string, string> = {
  "840":"United States","826":"United Kingdom","124":"Canada","036":"Australia","276":"Germany",
  "250":"France","356":"India","076":"Brazil","392":"Japan","410":"South Korea",
  "484":"Mexico","380":"Italy","724":"Spain","528":"Netherlands","752":"Sweden",
  "616":"Poland","710":"South Africa","156":"China","643":"Russia",
  "032":"Argentina","152":"Chile","170":"Colombia","604":"Peru","862":"Venezuela",
  "818":"Egypt","566":"Nigeria","404":"Kenya","288":"Ghana","834":"Tanzania",
  "764":"Thailand","360":"Indonesia","608":"Philippines","704":"Vietnam","458":"Malaysia",
  "702":"Singapore","158":"Taiwan","344":"Hong Kong","554":"New Zealand","578":"Norway",
  "208":"Denmark","246":"Finland","756":"Switzerland","040":"Austria","056":"Belgium",
  "620":"Portugal","300":"Greece","203":"Czech Republic","642":"Romania","348":"Hungary",
  "804":"Ukraine","792":"Turkey","682":"Saudi Arabia","784":"UAE","376":"Israel",
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function beliefColor(avg: number): string {
  const clamped = Math.max(1, Math.min(9, avg));
  const t = (clamped - 1) / 8;
  const r = Math.round(lerp(220, 48, t));
  const g = Math.round(lerp(50, 160, t));
  const b = Math.round(lerp(50, 255, t));
  return `rgb(${r},${g},${b})`;
}

function beliefLabel(avg: number): string {
  const d = rawToDisplay(avg);
  if (d <= -3) return 'Strong Disbelief';
  if (d <= -1) return 'Disbelief';
  if (d <= 1) return 'Neutral / Mixed';
  if (d <= 3) return 'Belief';
  return 'Strong Belief';
}

interface CountryBelief {
  avg: number;
  count: number;
}

interface WorldBeliefMapProps {
  countryBeliefs: Record<string, CountryBelief>;
}

export default function WorldBeliefMap({ countryBeliefs }: WorldBeliefMapProps) {
  const [tooltip, setTooltip] = useState<{ name: string; avg: number; count: number; x: number; y: number } | null>(null);

  const numericToData = useMemo(() => {
    const map: Record<string, CountryBelief> = {};
    for (const [numCode, data] of Object.entries(countryBeliefs)) {
      map[numCode] = data;
      const padded = numCode.padStart(3, '0');
      if (padded !== numCode) map[padded] = data;
    }
    return map;
  }, [countryBeliefs]);

  return (
    <div className="relative">
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{ scale: 220, center: [10, 10] }}
        style={{ width: '100%', height: 'auto' }}
        height={480}
      >
        <ZoomableGroup
          minZoom={0.6}
          maxZoom={5}
          center={[10, 10]}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo) => {
                const geoId = String(geo.id);
                const data = numericToData[geoId];
                const fill = data ? beliefColor(data.avg) : '#1a1f3a';
                const strokeColor = data ? '#ffffff20' : '#ffffff0a';

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke={strokeColor}
                    strokeWidth={0.4}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none', fill: data ? beliefColor(data.avg) : '#2a2f4a', opacity: 0.85 },
                      pressed: { outline: 'none' },
                    }}
                    onMouseEnter={(e) => {
                      if (!data) return;
                      const name = COUNTRY_NAMES[geoId] || geo.properties?.name || geoId;
                      setTooltip({
                        name,
                        avg: data.avg,
                        count: data.count,
                        x: e.clientX,
                        y: e.clientY,
                      });
                    }}
                    onMouseMove={(e) => {
                      if (tooltip) {
                        setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
                      }
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {tooltip && (
        <div
          className="fixed z-[9999] pointer-events-none px-3 py-2 rounded-xl border text-xs shadow-xl"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 40,
            backgroundColor: '#0c1025',
            borderColor: '#ffffff20',
          }}
        >
          <div className="font-semibold text-white text-sm mb-1">{tooltip.name}</div>
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: beliefColor(tooltip.avg) }}
            />
            <span style={{ color: beliefColor(tooltip.avg) }}>
              {beliefLabel(tooltip.avg)}
            </span>
            <span className="text-[#64748b]">({formatDisplay(tooltip.avg)})</span>
          </div>
          <div className="text-[#64748b] mt-0.5">{tooltip.count} participants</div>
        </div>
      )}

      <div className="flex items-center justify-center gap-1 mt-3">
        <span className="text-[10px] text-[#64748b]">−4 Disbelief</span>
        <div className="flex gap-0">
          {Array.from({ length: 9 }, (_, i) => {
            const score = 1 + i;
            return <div key={i} className="w-5 h-2.5" style={{ backgroundColor: beliefColor(score), borderRadius: i === 0 ? '3px 0 0 3px' : i === 8 ? '0 3px 3px 0' : '0' }} />;
          })}
        </div>
        <span className="text-[10px] text-[#64748b]">+4 Belief</span>
        <span className="text-[10px] text-[#64748b] ml-3">■</span>
        <span className="text-[10px] text-[#64748b]">No data</span>
      </div>
    </div>
  );
}
