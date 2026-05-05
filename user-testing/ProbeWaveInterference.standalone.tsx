/**
 * ProbeWaveInterference — STANDALONE / PORTABLE VERSION
 * ─────────────────────────────────────────────────────────────────────────
 * Interactive six-probe wave-interference visualization on a single belief
 * dimension. Each probe is a Gaussian wavelet with a position (where on the
 * dimension it points) and a phase (its contextual framing). The dotted teal
 * curve is the combined wavefunction (real part); the shaded fill behind it is the
 * probability density |psi|^2 of where it would land if forced to commit.
 *
 * No external dependencies beyond React + ReactDOM.
 *   - No Tailwind required
 *   - No CSS variables required
 *   - No design-system tokens required
 *   - Single file; drop into any React project
 *
 * Usage:
 *   import { ProbeWaveInterference } from "./ProbeWaveInterference.standalone";
 *   <ProbeWaveInterference />
 *
 * Optional theming:
 *   <ProbeWaveInterference
 *     accentColor="#3a637a"     // teal — dotted combined wave + probability fill
 *     foregroundColor="#1a1d24" // ink — body text only
 *     mutedColor="#6c7280"      // captions, axis labels
 *     borderColor="#d6d4cc"     // hairline rules + button borders
 *     backgroundColor="#faf9f5" // chart canvas background
 *   />
 *
 * Plain-JS variant: delete the `type Probe` line, the prop-type interface,
 * and the `: Type` annotations; everything else is plain ES2020.
 *
 * License: do whatever you want with this file. No attribution required.
 * ─────────────────────────────────────────────────────────────────────────
 */
import { useMemo, useState } from "react";

type Probe = { pos: number; phase: number };

interface ProbeWaveInterferenceProps {
  /** Teal accent — dotted combined wave stroke + probability density fill */
  accentColor?: string;
  /** Ink — body text only (combined wavefunction stroke now uses accentColor) */
  foregroundColor?: string;
  /** Muted gray — captions, axis tick labels, slider readouts */
  mutedColor?: string;
  /** Hairline rule + button border color */
  borderColor?: string;
  /** Chart canvas background (also used for slider thumb fill) */
  backgroundColor?: string;
  /** Optional override for the six per-probe colors (must be length 6) */
  probeColors?: string[];
  /** Initial probe positions / phases — defaults produce a double-humped wave */
  initialProbes?: Probe[];
}

const DEFAULT_PROBE_COLORS = [
  "#EF9F27", // orange
  "#5DCAA5", // green
  "#ED93B1", // pink
  "#85B7EB", // blue
  "#97C459", // lime
  "#F0997B", // coral
];

const SIGMA = 0.85;
const X_MIN = 60;
const X_MAX = 640;
const N = 240;
// Single-panel layout: probability density, probe wavelets, and the combined
// wavefunction all share the same baseline at PROB_BASE; positive amplitudes
// rise upward, inverted-phase amplitudes dip below into NEGATIVE_ROOM.
const PROB_BASE = 200;
const PROB_HEIGHT = 130;
const NEGATIVE_ROOM = 32;
const COMBINED_SCALE = 14;
const PROBE_SCALE = 26;

const DEFAULT_PROBES: Probe[] = [
  { pos: 2.2, phase: 0 },
  { pos: 2.2, phase: 0 },
  { pos: 4.1, phase: 0 },
  { pos: 7.0, phase: 0 },
  { pos: 7.0, phase: 0 },
  { pos: 7.0, phase: 0 },
];

const PRESETS: Record<"aligned" | "conflicted" | "reset", Probe[]> = {
  aligned: [
    { pos: 4.0, phase: 0 },
    { pos: 4.5, phase: 0 },
    { pos: 5.0, phase: 0 },
    { pos: 5.0, phase: 0 },
    { pos: 5.5, phase: 0 },
    { pos: 6.0, phase: 0 },
  ],
  conflicted: [
    { pos: 4.0, phase: 0 },
    { pos: 4.5, phase: Math.PI },
    { pos: 5.0, phase: 0 },
    { pos: 5.0, phase: Math.PI },
    { pos: 5.5, phase: 0 },
    { pos: 6.0, phase: Math.PI },
  ],
  reset: DEFAULT_PROBES,
};

const bToX = (b: number) => X_MIN + (b / 9) * (X_MAX - X_MIN);
const envelope = (p: Probe, b: number) =>
  Math.exp(-Math.pow(b - p.pos, 2) / (2 * SIGMA * SIGMA));
const probeReal = (p: Probe, b: number) => envelope(p, b) * Math.cos(p.phase);

function psiAt(probes: Probe[], b: number) {
  let re = 0;
  let im = 0;
  for (const p of probes) {
    const env = envelope(p, b);
    re += env * Math.cos(p.phase);
    im += env * Math.sin(p.phase);
  }
  return { re, im, mag2: re * re + im * im };
}

function buildPath(fn: (b: number) => number) {
  let d = "";
  for (let i = 0; i <= N; i++) {
    const b = (i / N) * 9;
    d += (i === 0 ? "M" : "L") + bToX(b).toFixed(1) + " " + fn(b).toFixed(1) + " ";
  }
  return d;
}

/* Convert any hex / rgb color to an rgba string with the given alpha. */
function withAlpha(color: string, alpha: number): string {
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const full = hex.length === 3
      ? hex.split("").map((c) => c + c).join("")
      : hex;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color; // assume caller-provided rgba/hsla
}

export function ProbeWaveInterference({
  accentColor = "#3a637a",
  foregroundColor = "#1a1d24",
  mutedColor = "#6c7280",
  borderColor = "#d6d4cc",
  backgroundColor = "#faf9f5",
  probeColors = DEFAULT_PROBE_COLORS,
  initialProbes = DEFAULT_PROBES,
}: ProbeWaveInterferenceProps = {}) {
  const [probes, setProbes] = useState<Probe[]>(initialProbes);
  const [collapse, setCollapse] = useState<{ x: number; value: number } | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const accentFill = withAlpha(accentColor, 0.22);
  const accentTint = withAlpha(accentColor, 0.08);

  const paths = useMemo(() => {
    const probeCurves = probes.map((p) =>
      buildPath((b) => PROB_BASE - PROBE_SCALE * probeReal(p, b)),
    );
    const combined = buildPath((b) => PROB_BASE - COMBINED_SCALE * psiAt(probes, b).re);

    const cache: number[] = [];
    let maxMag2 = 0;
    for (let i = 0; i <= N; i++) {
      const m = psiAt(probes, (i / N) * 9).mag2;
      cache.push(m);
      if (m > maxMag2) maxMag2 = m;
    }
    if (maxMag2 < 0.001) maxMag2 = 0.001;

    let prob = "";
    for (let i = 0; i <= N; i++) {
      const x = bToX((i / N) * 9);
      const y = PROB_BASE - (cache[i] / maxMag2) * PROB_HEIGHT;
      prob += (i === 0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1) + " ";
    }
    prob += "L " + X_MAX + " " + PROB_BASE + " L " + X_MIN + " " + PROB_BASE + " Z";

    return {
      probeCurves,
      combined,
      prob,
      mag2Cache: cache,
      totalMag2: cache.reduce((s, v) => s + v, 0),
    };
  }, [probes]);

  function updateProbe(i: number, key: "pos" | "phase", val: string) {
    const num = parseFloat(val);
    setProbes((prev) => prev.map((p, idx) => (idx === i ? { ...p, [key]: num } : p)));
    setCollapse(null);
    setResultMessage(null);
  }

  function applyPreset(name: keyof typeof PRESETS) {
    setProbes(PRESETS[name].map((p) => ({ ...p })));
    setCollapse(null);
    setResultMessage(null);
  }

  function doCollapse() {
    const total = paths.totalMag2;
    if (total < 0.05) {
      setResultMessage("Wavefunction near zero — indeterminate");
      setCollapse(null);
      return;
    }
    const r = Math.random() * total;
    let acc = 0;
    let idx = 0;
    for (let i = 0; i < paths.mag2Cache.length; i++) {
      acc += paths.mag2Cache[i];
      if (acc >= r) {
        idx = i;
        break;
      }
    }
    const collapsedB = (idx / N) * 9;
    setCollapse({ x: bToX(collapsedB), value: collapsedB });
    setResultMessage(null);
  }

  /* ─── Inline style objects (no Tailwind required) ───────────────────── */
  const containerStyle: React.CSSProperties = {
    width: "100%",
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    color: foregroundColor,
    background: backgroundColor,
    padding: 16,
    borderRadius: 8,
    boxSizing: "border-box",
  };
  const captionStyle: React.CSSProperties = { fontSize: 12, fill: mutedColor };
  const ruleStyle: React.CSSProperties = {
    marginTop: 16,
    paddingTop: 16,
    borderTop: `1px solid ${borderColor}`,
  };
  const gridStyle: React.CSSProperties = {
    display: "grid",
    alignItems: "center",
    columnGap: 12,
    rowGap: 4,
    gridTemplateColumns: "96px 1fr 56px 1fr 56px",
  };
  const colHeaderStyle: React.CSSProperties = {
    fontSize: 11,
    color: mutedColor,
    textAlign: "center",
  };
  const probeRowStyle: React.CSSProperties = {
    ...gridStyle,
    margin: "8px 0",
    fontSize: 13,
  };
  const probeLabelStyle: React.CSSProperties = {
    fontWeight: 500,
    color: foregroundColor,
    display: "flex",
    alignItems: "center",
    gap: 8,
  };
  const sliderReadoutStyle: React.CSSProperties = {
    textAlign: "right",
    fontVariantNumeric: "tabular-nums",
    fontSize: 12,
    color: mutedColor,
  };
  const sliderStyle: React.CSSProperties = {
    width: "100%",
    accentColor: accentColor,
  };
  const buttonStyle: React.CSSProperties = {
    background: "transparent",
    border: `1px solid ${borderColor}`,
    color: foregroundColor,
    padding: "6px 12px",
    borderRadius: 6,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
  };
  const noteStyle: React.CSSProperties = {
    fontSize: 12.5,
    color: mutedColor,
    lineHeight: 1.55,
    marginTop: 16,
    padding: "12px 16px",
    borderLeft: `2px solid ${accentColor}`,
    background: accentTint,
    borderRadius: "0 4px 4px 0",
  };

  return (
    <div style={containerStyle}>
      <svg
        width="100%"
        viewBox="0 0 680 280"
        role="img"
        aria-label="Six probe waves on a single belief dimension overlaid on the probability density of the combined wavefunction"
        style={{ display: "block" }}
      >
        <text x="60" y="22" style={captionStyle}>
          Probe waves (foreground) over probability density (faint fill)
        </text>

        {/* Probability density (background — drawn first so other elements paint over it) */}
        <path d={paths.prob} fill={accentFill} stroke="none" />

        {/* x-axis baseline */}
        <line
          x1="60" y1={PROB_BASE} x2="640" y2={PROB_BASE}
          stroke={borderColor} strokeWidth="0.5"
        />

        {/* Per-probe centerlines + dots */}
        {probes.map((p, i) => {
          const cx = bToX(p.pos);
          return (
            <g key={`mark-${i}`}>
              <line
                x1={cx} y1="44" x2={cx} y2={PROB_BASE}
                stroke={probeColors[i]} strokeWidth="0.75" strokeDasharray="3 3" opacity="0.7"
              />
              <circle cx={cx} cy="44" r="3" fill={probeColors[i]} />
            </g>
          );
        })}

        {/* Per-probe wavelets — anchored at baseline; positive amplitudes rise, inverted dip */}
        {paths.probeCurves.map((d, i) => (
          <path key={`probe-${i}`} d={d} fill="none" stroke={probeColors[i]} strokeWidth="1.2" opacity="0.65" />
        ))}

        {/* Combined wavefunction (real part) — anchored at baseline; dotted teal so it reads as the underlying signal, not a hard answer */}
        <path d={paths.combined} fill="none" stroke={accentColor} strokeWidth="1.5" strokeDasharray="2 3" />

        {/* Collapse marker */}
        {collapse && (
          <>
            <line
              x1={collapse.x} y1={PROB_BASE - PROB_HEIGHT} x2={collapse.x} y2={PROB_BASE}
              stroke={accentColor} strokeWidth="2" opacity="0.85"
            />
            <circle cx={collapse.x} cy={PROB_BASE} r="5" fill={accentColor} />
          </>
        )}

        {/* Tick marks — placed below the negative-wave excursion zone */}
        {[1, 2, 3, 4, 6, 7, 8].map((i) => {
          const x = bToX(i);
          return (
            <line
              key={`tick-${i}`}
              x1={x} y1={PROB_BASE + NEGATIVE_ROOM} x2={x} y2={PROB_BASE + NEGATIVE_ROOM + 4}
              stroke={borderColor} strokeWidth="0.5"
            />
          );
        })}

        {/* Axis labels — placed below the negative-wave excursion zone */}
        <text x="60"  y="252" textAnchor="middle" style={captionStyle}>0</text>
        <text x="60"  y="268" textAnchor="middle" style={captionStyle}>false</text>
        <text x="350" y="252" textAnchor="middle" style={captionStyle}>5</text>
        <text x="350" y="268" textAnchor="middle" style={captionStyle}>superposition</text>
        <text x="640" y="252" textAnchor="middle" style={captionStyle}>9</text>
        <text x="640" y="268" textAnchor="middle" style={captionStyle}>true</text>
      </svg>

      {/* Controls */}
      <div style={ruleStyle}>
        <div style={gridStyle}>
          <span />
          <span style={colHeaderStyle}>Position on dimension</span>
          <span />
          <span style={colHeaderStyle}>Phase (framing)</span>
          <span />
        </div>

        {probes.map((p, i) => (
          <div key={`row-${i}`} style={probeRowStyle}>
            <span style={probeLabelStyle}>
              <span
                aria-hidden="true"
                style={{ width: 10, height: 10, background: probeColors[i], borderRadius: 2, display: "inline-block" }}
              />
              Probe {i + 1}
            </span>
            <input
              type="range" min={0} max={9} step={0.1} value={p.pos}
              onChange={(e) => updateProbe(i, "pos", e.target.value)}
              style={sliderStyle}
              aria-label={`Probe ${i + 1} position`}
            />
            <span style={sliderReadoutStyle}>{p.pos.toFixed(1)}</span>
            <input
              type="range" min={0} max={6.28} step={0.01} value={p.phase}
              onChange={(e) => updateProbe(i, "phase", e.target.value)}
              style={sliderStyle}
              aria-label={`Probe ${i + 1} phase`}
            />
            <span style={sliderReadoutStyle}>{p.phase.toFixed(2)}</span>
          </div>
        ))}

        <div style={{ ...gridStyle, marginTop: 4, paddingBottom: 8 }}>
          <span />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: mutedColor, padding: "0 4px" }}>
            <span>false</span><span>superposition</span><span>true</span>
          </div>
          <span />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: mutedColor, padding: "0 4px" }}>
            <span>same framing</span><span>opposite</span><span>same framing</span>
          </div>
          <span />
        </div>
      </div>

      {/* Actions */}
      <div style={{ ...ruleStyle, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <button type="button" onClick={() => applyPreset("aligned")}    style={buttonStyle}>Aligned probes</button>
        <button type="button" onClick={() => applyPreset("conflicted")} style={buttonStyle}>Conflicted probes</button>
        <button type="button" onClick={() => applyPreset("reset")}      style={buttonStyle}>Reset</button>
        <button type="button" onClick={doCollapse}                       style={buttonStyle}>Force collapse</button>
        <span style={{ marginLeft: "auto", fontVariantNumeric: "tabular-nums", fontSize: 13, color: mutedColor }}>
          {collapse ? (
            <>Collapsed to <strong style={{ color: foregroundColor, fontWeight: 500, fontSize: 16 }}>{collapse.value.toFixed(1)}</strong></>
          ) : resultMessage ? (
            resultMessage
          ) : (
            "Belief held in superposition"
          )}
        </span>
      </div>

      {/* Phase note */}
      <p style={noteStyle}>
        <strong style={{ color: foregroundColor, fontWeight: 500 }}>On phase: </strong>
        Phase is the contextual framing or orientation of a probe — how the question is set up, not where it points.
        Two probes asking the same content under inverted framings (e.g. "I support X" vs. "I oppose X") sit a half-cycle
        apart in phase (~3.14, the middle of the slider). Where their amplitudes overlap on the dimension, the waves
        cancel rather than reinforce. This is the mechanism by which the model captures order effects and framing effects
        that classical scoring methods cannot.
      </p>
    </div>
  );
}

export default ProbeWaveInterference;
