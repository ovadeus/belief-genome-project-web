import { useMemo, useState, useCallback } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { rawToDisplay, formatDisplay } from "@/lib/belief-scale";
import { ZoomIn, ZoomOut } from "lucide-react";

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

const MIN_ZOOM = 0.6;
const MAX_ZOOM = 5;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function beliefColor(avg: number): string {
  const clamped = Math.max(1, Math.min(9, avg));
  const t = (clamped - 1) / 8;
  if (t <= 0.5) {
    const u = t / 0.5;
    const r = Math.round(lerp(53, 255, u));
    const g = Math.round(lerp(228, 255, u));
    const b = Math.round(lerp(207, 255, u));
    return `rgb(${r},${g},${b})`;
  }
  const u = (t - 0.5) / 0.5;
  const r = Math.round(lerp(255, 82, u));
  const g = Math.round(lerp(255, 168, u));
  const b = Math.round(lerp(255, 255, u));
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
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([10, 10]);

  const numericToData = useMemo(() => {
    const map: Record<string, CountryBelief> = {};
    for (const [numCode, data] of Object.entries(countryBeliefs)) {
      map[numCode] = data;
      const padded = numCode.padStart(3, '0');
      if (padded !== numCode) map[padded] = data;
    }
    return map;
  }, [countryBeliefs]);

  const handleMoveEnd = useCallback((position: { coordinates: [number, number]; zoom: number }) => {
    setCenter(position.coordinates);
    setZoom(position.zoom);
  }, []);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setZoom(parseFloat(e.target.value));
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(MAX_ZOOM, prev + 0.5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(MIN_ZOOM, prev - 0.5));
  }, []);

  return (
    <div className="relative">
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{ scale: 220, center: [10, 10] }}
        style={{ width: '100%', height: 'auto' }}
        height={480}
      >
        <ZoomableGroup
          zoom={zoom}
          center={center}
          onMoveEnd={handleMoveEnd}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          filterZoomEvent={(evt) => {
            if (evt instanceof WheelEvent) return false;
            return true;
          }}
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

      <div className="flex items-center justify-center gap-3 mt-2 mb-1">
        <button
          onClick={handleZoomOut}
          className="p-1.5 rounded-lg border border-white/10 bg-[#0c1025]/80 hover:bg-[#1a1f3a] text-[#64748b] hover:text-white transition-colors"
          aria-label="Zoom out"
        >
          <ZoomOut size={14} />
        </button>
        <input
          type="range"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={0.1}
          value={zoom}
          onChange={handleSliderChange}
          className="w-48 h-1.5 appearance-none rounded-full bg-[#1a1f3a] cursor-pointer accent-[#6c8fff] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#6c8fff] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#0c1025] [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#6c8fff] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#0c1025] [&::-moz-range-thumb]:cursor-pointer"
          aria-label="Map zoom level"
        />
        <button
          onClick={handleZoomIn}
          className="p-1.5 rounded-lg border border-white/10 bg-[#0c1025]/80 hover:bg-[#1a1f3a] text-[#64748b] hover:text-white transition-colors"
          aria-label="Zoom in"
        >
          <ZoomIn size={14} />
        </button>
        <span className="text-[10px] text-[#64748b] ml-1">{zoom.toFixed(1)}x</span>
      </div>

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

      <div className="flex items-center justify-center gap-1 mt-2">
        <span className="text-[10px] text-[#35E4CF]">−4 Progressive</span>
        <div className="flex gap-0">
          {Array.from({ length: 9 }, (_, i) => {
            const score = 1 + i;
            return <div key={i} className="w-5 h-2.5" style={{ backgroundColor: beliefColor(score), borderRadius: i === 0 ? '3px 0 0 3px' : i === 8 ? '0 3px 3px 0' : '0' }} />;
          })}
        </div>
        <span className="text-[10px] text-[#52A8FF]">+4 Traditional</span>
        <span className="text-[10px] text-[#64748b] ml-3">■</span>
        <span className="text-[10px] text-[#64748b]">No data</span>
      </div>
    </div>
  );
}
