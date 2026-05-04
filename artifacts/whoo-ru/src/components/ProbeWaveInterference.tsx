// Interactive probe-wave-interference visualization for the BGP home page.
// Six probes on a single belief dimension; each probe has a position
// (where on the dimension it points) and a phase (its contextual framing).
// The combined wavefunction and probability density update in real time.
import { useMemo, useState } from "react";

type Probe = { pos: number; phase: number };

const PROBE_COLORS = ["#EF9F27", "#5DCAA5", "#ED93B1", "#85B7EB", "#97C459", "#F0997B"];
const SIGMA = 0.85;
const X_MIN = 60;
const X_MAX = 640;
const N = 240;
const WAVE_MID = 115;
const PROB_BASE = 320;
const PROB_HEIGHT = 100;
const COMBINED_SCALE = 10;
const PROBE_SCALE = 28;

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

export function ProbeWaveInterference() {
  const [probes, setProbes] = useState<Probe[]>(DEFAULT_PROBES);
  const [collapse, setCollapse] = useState<{ x: number; value: number } | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  // Memoize the heavier path math so dragging a single slider doesn't re-run
  // the work for unrelated probes more than necessary.
  const paths = useMemo(() => {
    const probeCurves = probes.map((p) =>
      buildPath((b) => WAVE_MID - PROBE_SCALE * probeReal(p, b)),
    );
    const combined = buildPath((b) => WAVE_MID - COMBINED_SCALE * psiAt(probes, b).re);

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

    return { probeCurves, combined, prob, mag2Cache: cache, totalMag2: cache.reduce((s, v) => s + v, 0) };
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

  return (
    <div
      className="w-full"
      style={{
        // Local tokens scoped to this widget so it can use the original
        // probe palette without polluting global theme tokens.
        // The "wave indigo" matches the BGP electric-blue primary.
        ["--probe-wave" as any]: "hsl(var(--primary))",
        ["--probe-wave-fill" as any]: "hsl(var(--primary) / 0.22)",
        ["--probe-wave-tint" as any]: "hsl(var(--primary) / 0.08)",
      }}
    >
      <svg
        width="100%"
        viewBox="0 0 680 360"
        role="img"
        aria-label="Six probe waves on a single belief dimension, with their combined wavefunction and probability density"
        style={{ display: "block" }}
      >
        <text x="60" y="22" style={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}>
          Probe waves (faint) and combined wavefunction (bold)
        </text>
        <text x="60" y="210" style={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}>
          Probability density of collapse outcome
        </text>

        <line
          x1="60" y1={WAVE_MID} x2="640" y2={WAVE_MID}
          stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="2 4"
        />
        <line
          x1="60" y1={PROB_BASE} x2="640" y2={PROB_BASE}
          stroke="hsl(var(--border))" strokeWidth="0.5"
        />

        {/* Per-probe centerlines + dots */}
        {probes.map((p, i) => {
          const cx = bToX(p.pos);
          return (
            <g key={`mark-${i}`}>
              <line
                x1={cx} y1="32" x2={cx} y2="180"
                stroke={PROBE_COLORS[i]} strokeWidth="0.75" strokeDasharray="3 3" opacity="0.7"
              />
              <circle cx={cx} cy="32" r="3" fill={PROBE_COLORS[i]} />
            </g>
          );
        })}

        {/* Per-probe wavelets */}
        {paths.probeCurves.map((d, i) => (
          <path key={`probe-${i}`} d={d} fill="none" stroke={PROBE_COLORS[i]} strokeWidth="1.2" opacity="0.5" />
        ))}

        {/* Combined wavefunction (real part) */}
        <path d={paths.combined} fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" />

        {/* Probability density */}
        <path d={paths.prob} fill="var(--probe-wave-fill)" stroke="none" />

        {/* Collapse marker */}
        {collapse && (
          <>
            <line
              x1={collapse.x} y1="220" x2={collapse.x} y2={PROB_BASE}
              stroke="hsl(var(--accent))" strokeWidth="2" opacity="0.85"
            />
            <circle cx={collapse.x} cy={PROB_BASE} r="5" fill="hsl(var(--accent))" />
          </>
        )}

        {/* Tick marks */}
        {[1, 2, 3, 4, 6, 7, 8].map((i) => {
          const x = bToX(i);
          return (
            <line
              key={`tick-${i}`}
              x1={x} y1={PROB_BASE} x2={x} y2={PROB_BASE + 4}
              stroke="hsl(var(--border))" strokeWidth="0.5"
            />
          );
        })}

        {/* Axis labels */}
        <text x="60"  y="340" textAnchor="middle" style={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}>0</text>
        <text x="60"  y="354" textAnchor="middle" style={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}>false</text>
        <text x="350" y="340" textAnchor="middle" style={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}>5</text>
        <text x="350" y="354" textAnchor="middle" style={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}>superposition</text>
        <text x="640" y="340" textAnchor="middle" style={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}>9</text>
        <text x="640" y="354" textAnchor="middle" style={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}>true</text>
      </svg>

      {/* Controls */}
      <div className="mt-3 pt-3 border-t border-border">
        <div className="grid items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground"
             style={{ gridTemplateColumns: "96px 1fr 56px 1fr 56px" }}>
          <span />
          <span className="text-center">Position on dimension</span>
          <span />
          <span className="text-center">Phase (framing)</span>
          <span />
        </div>

        {probes.map((p, i) => (
          <div
            key={`row-${i}`}
            className="grid items-center gap-x-3 gap-y-1 my-2 text-[13px]"
            style={{ gridTemplateColumns: "96px 1fr 56px 1fr 56px" }}
          >
            <span className="font-medium text-foreground flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-block rounded-sm"
                style={{ width: 10, height: 10, background: PROBE_COLORS[i] }}
              />
              Probe {i + 1}
            </span>
            <input
              type="range" min={0} max={9} step={0.1} value={p.pos}
              onChange={(e) => updateProbe(i, "pos", e.target.value)}
              className="w-full accent-primary"
              aria-label={`Probe ${i + 1} position`}
            />
            <span className="text-right tabular-nums text-[12px] text-muted-foreground">
              {p.pos.toFixed(1)}
            </span>
            <input
              type="range" min={0} max={6.28} step={0.01} value={p.phase}
              onChange={(e) => updateProbe(i, "phase", e.target.value)}
              className="w-full accent-primary"
              aria-label={`Probe ${i + 1} phase`}
            />
            <span className="text-right tabular-nums text-[12px] text-muted-foreground">
              {p.phase.toFixed(2)}
            </span>
          </div>
        ))}

        <div className="grid items-center gap-x-3 mt-1 pb-2"
             style={{ gridTemplateColumns: "96px 1fr 56px 1fr 56px" }}>
          <span />
          <div className="flex justify-between text-[11px] text-muted-foreground px-1">
            <span>false</span><span>superposition</span><span>true</span>
          </div>
          <span />
          <div className="flex justify-between text-[11px] text-muted-foreground px-1">
            <span>same framing</span><span>opposite</span><span>same framing</span>
          </div>
          <span />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 items-center mt-4 pt-4 border-t border-border">
        <button
          type="button"
          onClick={() => applyPreset("aligned")}
          className="bg-transparent border border-border text-foreground px-3 py-1.5 rounded-md text-[13px] hover:bg-primary/10 hover:border-primary transition-colors"
        >
          Aligned probes
        </button>
        <button
          type="button"
          onClick={() => applyPreset("conflicted")}
          className="bg-transparent border border-border text-foreground px-3 py-1.5 rounded-md text-[13px] hover:bg-primary/10 hover:border-primary transition-colors"
        >
          Conflicted probes
        </button>
        <button
          type="button"
          onClick={() => applyPreset("reset")}
          className="bg-transparent border border-border text-foreground px-3 py-1.5 rounded-md text-[13px] hover:bg-primary/10 hover:border-primary transition-colors"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={doCollapse}
          className="bg-transparent border border-border text-foreground px-3 py-1.5 rounded-md text-[13px] hover:bg-primary/10 hover:border-primary transition-colors"
        >
          Force collapse
        </button>
        <span className="ml-auto tabular-nums text-[13px] text-muted-foreground">
          {collapse ? (
            <>Collapsed to <strong className="text-foreground font-medium text-[16px]">{collapse.value.toFixed(1)}</strong></>
          ) : resultMessage ? (
            resultMessage
          ) : (
            "Belief held in superposition"
          )}
        </span>
      </div>

      {/* Phase note */}
      <p
        className="text-[12.5px] text-muted-foreground leading-relaxed mt-4 py-3 px-4 rounded-r"
        style={{
          borderLeft: "2px solid var(--probe-wave)",
          background: "var(--probe-wave-tint)",
        }}
      >
        <strong className="text-foreground/80 font-medium">On phase: </strong>
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
