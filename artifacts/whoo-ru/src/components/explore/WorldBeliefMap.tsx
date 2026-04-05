import { useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const NUMERIC_TO_ISO3: Record<string, string> = {
  "840":"USA","826":"GBR","124":"CAN","036":"AUS","276":"DEU",
  "250":"FRA","356":"IND","076":"BRA","392":"JPN","410":"KOR",
  "484":"MEX","380":"ITA","724":"ESP","528":"NLD","752":"SWE",
  "616":"POL","710":"ZAF","156":"CHN","643":"RUS",
  "032":"ARG","152":"CHL","170":"COL","604":"PER","862":"VEN",
  "818":"EGY","566":"NGA","404":"KEN","288":"GHA","834":"TZA",
  "764":"THA","360":"IDN","608":"PHL","704":"VNM","458":"MYS",
  "702":"SGP","158":"TWN","344":"HKG","554":"NZL","578":"NOR",
  "208":"DNK","246":"FIN","756":"CHE","040":"AUT","056":"BEL",
  "620":"PRT","300":"GRC","203":"CZE","642":"ROU","348":"HUN",
  "804":"UKR","792":"TUR","682":"SAU","784":"ARE","376":"ISR",
};

const COUNTRY_NAMES: Record<string, string> = {
  "840":"United States","826":"United Kingdom","124":"Canada","036":"Australia","276":"Germany",
  "250":"France","356":"India","076":"Brazil","392":"Japan","410":"South Korea",
  "484":"Mexico","380":"Italy","724":"Spain","528":"Netherlands","752":"Sweden",
  "616":"Poland","710":"South Africa",
};

function beliefColor(avg: number): string {
  const v = avg / 9;
  if (v <= 0.22) return '#dc3232';
  if (v <= 0.35) return '#ff5544';
  if (v <= 0.45) return '#ff7728';
  if (v <= 0.55) return '#787891';
  if (v <= 0.65) return '#5a9e9e';
  if (v <= 0.78) return '#3cb4b4';
  return '#50b4ff';
}

function beliefLabel(avg: number): string {
  const v = avg / 9;
  if (v <= 0.22) return 'Strongly Progressive';
  if (v <= 0.40) return 'Progressive';
  if (v <= 0.60) return 'Independent / Mixed';
  if (v <= 0.78) return 'Traditional';
  return 'Strongly Traditional';
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

  const iso3ToData = useMemo(() => {
    const map: Record<string, CountryBelief & { numericCode: string }> = {};
    for (const [numCode, data] of Object.entries(countryBeliefs)) {
      const iso3 = NUMERIC_TO_ISO3[numCode];
      if (iso3) {
        map[iso3] = { ...data, numericCode: numCode };
      }
    }
    return map;
  }, [countryBeliefs]);

  return (
    <div className="relative">
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{ scale: 160, center: [0, 0] }}
        style={{ width: '100%', height: 'auto', maxHeight: 420 }}
      >
        <ZoomableGroup>
          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo) => {
                const iso3 = geo.properties?.ISO_A3 || geo.id;
                const data = iso3ToData[iso3];
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
                      const name = COUNTRY_NAMES[data.numericCode] || geo.properties?.NAME || iso3;
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
            <span className="text-[#64748b]">({tooltip.avg.toFixed(2)})</span>
          </div>
          <div className="text-[#64748b] mt-0.5">{tooltip.count} participants</div>
        </div>
      )}

      <div className="flex items-center justify-center gap-1 mt-3">
        <span className="text-[10px] text-[#64748b]">Progressive</span>
        <div className="flex gap-0.5">
          {['#dc3232','#ff5544','#ff7728','#787891','#5a9e9e','#3cb4b4','#50b4ff'].map((c, i) => (
            <div key={i} className="w-6 h-2.5 rounded-sm" style={{ backgroundColor: c }} />
          ))}
        </div>
        <span className="text-[10px] text-[#64748b]">Traditional</span>
        <span className="text-[10px] text-[#64748b] ml-3">■</span>
        <span className="text-[10px] text-[#64748b]">No data</span>
      </div>
    </div>
  );
}
