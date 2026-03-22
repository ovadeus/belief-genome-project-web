// Triple Helix — 3-strand animated DNA visualization
// Logos (blue) = How you reason, Pathos (red) = How you feel, Ethos (green) = How you act
import { useRef, useEffect, useCallback } from 'react';

/* ── Strand definitions ────────────────────────────────────── */
const STRAND_DEFS = [
  { id: 'logos',  name: 'LOGOS',  sub: 'How you reason', color: '#5599ff', phase: 0,
    cats: ['epistemology', 'politics', 'science_tech', 'education'] },
  { id: 'pathos', name: 'PATHOS', sub: 'How you feel',   color: '#ff5566', phase: (2 * Math.PI) / 3,
    cats: ['spirituality', 'psychology', 'relationships', 'health'] },
  { id: 'ethos',  name: 'ETHOS',  sub: 'How you act',    color: '#34d399', phase: (4 * Math.PI) / 3,
    cats: ['morality', 'social', 'economics'] },
];

const CFG = {
  numTurns: 2.8, amplitude: 78, rotSpeed: 0.0035,
  nodeBaseR: 5.5, crossEvery: 3, marginX: 72, height: 360,
};

/* ── Domain axes for tooltip labels ─────────────────────────── */
const DOMAIN_AXES: Record<string, { left: string; right: string; mid: string }> = {
  epistemology:  { left: 'Relativist',   right: 'Absolutist',      mid: 'Mixed epistemic'  },
  spirituality:  { left: 'Secular',      right: 'Spiritual',       mid: 'Open spiritual'   },
  morality:      { left: 'Situational',  right: 'Principled',      mid: 'Contextual moral' },
  politics:      { left: 'Progressive',  right: 'Conservative',    mid: 'Centrist'         },
  social:        { left: 'Collectivist', right: 'Individualist',   mid: 'Balanced social'  },
  economics:     { left: 'Progressive',  right: 'Market-oriented', mid: 'Mixed economic'   },
  science_tech:  { left: 'Tech-skeptic', right: 'Techno-optimist', mid: 'Tech-pragmatist'  },
  education:     { left: 'Reformist',    right: 'Traditional',     mid: 'Pragmatic'        },
  health:        { left: 'Holistic',     right: 'Conventional',    mid: 'Integrative'      },
  psychology:    { left: 'Determinist',  right: 'Autonomous',      mid: 'Compatibilist'    },
  relationships: { left: 'Fluid',        right: 'Traditional',     mid: 'Contextual'       },
};

function domainLabel(cat: string, avg: number): string {
  const axis = DOMAIN_AXES[cat];
  if (!axis || avg == null) return '—';
  if (avg <= 0.22) return `Strongly ${axis.left}`;
  if (avg <= 0.40) return axis.left;
  if (avg <= 0.60) return axis.mid;
  if (avg <= 0.78) return axis.right;
  return `Strongly ${axis.right}`;
}

/* ── Color helpers ──────────────────────────────────────────── */
function scoreColor(score: number | null, alpha = 1): string {
  if (score === null || score === undefined) return `rgba(110,110,145,${alpha * 0.38})`;
  const stops: [number, number[]][] = [
    [0, [220, 50, 50]], [2, [255, 120, 40]], [4, [200, 160, 60]],
    [5, [120, 120, 145]], [6, [60, 180, 180]], [8, [60, 130, 255]], [9, [80, 180, 255]],
  ];
  const s = Math.max(0, Math.min(9, score));
  let lo = stops[0], hi = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (s >= stops[i][0] && s <= stops[i + 1][0]) { lo = stops[i]; hi = stops[i + 1]; break; }
  }
  const t = lo[0] === hi[0] ? 0 : (s - lo[0]) / (hi[0] - lo[0]);
  const r = Math.round(lo[1][0] + t * (hi[1][0] - lo[1][0]));
  const g = Math.round(lo[1][1] + t * (hi[1][1] - lo[1][1]));
  const b = Math.round(lo[1][2] + t * (hi[1][2] - lo[1][2]));
  return `rgba(${r},${g},${b},${alpha})`;
}

function scoreLabel(score: number | null): string {
  if (score === null || score === undefined) return 'Not yet explored';
  if (score <= 1) return 'False to me';
  if (score <= 3) return 'Unlikely true';
  if (score <= 4) return 'Leaning false';
  if (score === 5) return 'Uncertain';
  if (score <= 6) return 'Leaning true';
  if (score <= 7) return 'Likely true';
  if (score <= 8) return 'True to me';
  return 'Deeply true to me';
}

function tensionColor(s1: number | null, s2: number | null): string {
  if (s1 === null || s2 === null) return 'rgba(130,130,165,0.10)';
  const diff = Math.abs(s1 - s2);
  if (diff >= 5) return 'rgba(255,80,80,0.55)';
  if (diff >= 3) return 'rgba(255,165,50,0.38)';
  if (diff >= 1) return 'rgba(160,180,255,0.22)';
  return 'rgba(70,220,110,0.32)';
}

/* ── Position math ──────────────────────────────────────────── */
function helixPos(strandIdx: number, nodeIdx: number, total: number, time: number, W: number, H: number) {
  const def = STRAND_DEFS[strandIdx];
  const t = (nodeIdx / (total - 1)) * CFG.numTurns * 2 * Math.PI;
  const angle = t + def.phase + time;
  const x = CFG.marginX + (nodeIdx / (total - 1)) * (W - 2 * CFG.marginX);
  const y = H / 2 + CFG.amplitude * Math.sin(angle);
  const z = Math.cos(angle);
  return { x, y, z, angle };
}

/* ── Types ──────────────────────────────────────────────────── */
interface DimDef { id: number; name: string; cat: string; desc?: string; }
interface HelixNode { dim: DimDef; score: number | null; confidence: number; }
interface Strand { id: string; name: string; sub: string; color: string; phase: number; cats: string[]; nodes: HelixNode[]; }

interface Props {
  dimensions: DimDef[];
  dimensionScores: Record<number, number>;
  confidence: Record<number, number>;
}

export default function TripleHelix({ dimensions, dimensionScores, confidence }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    strands: Strand[]; maxLen: number; time: number;
    hovered: { s: number; i: number; p: any; node: HelixNode; strand: Strand } | null;
    animFrame: number | null;
  } | null>(null);

  const draw = useCallback(() => {
    const st = stateRef.current;
    if (!st) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.clientWidth || 760;
    const H = CFG.height;
    const dpr = window.devicePixelRatio || 1;

    if (canvas.width !== Math.round(W * dpr) || canvas.height !== H * dpr) {
      canvas.width = Math.round(W * dpr);
      canvas.height = H * dpr;
      canvas.style.height = H + 'px';
      ctx.scale(dpr, dpr);
    }

    ctx.clearRect(0, 0, W, H);

    // Draw strand backbones
    for (let s = 0; s < st.strands.length; s++) {
      const strand = st.strands[s];
      ctx.beginPath();
      ctx.strokeStyle = strand.color + '40';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([]);
      for (let i = 0; i < strand.nodes.length; i++) {
        const p = helixPos(s, i, st.maxLen, st.time, W, H);
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }

    // Collect items for painter sort
    const items: any[] = [];

    // Cross-connections
    for (let i = 0; i < st.maxLen; i += CFG.crossEvery) {
      for (let s1 = 0; s1 < 3; s1++) {
        for (let s2 = s1 + 1; s2 < 3; s2++) {
          const n1 = st.strands[s1]?.nodes[i];
          const n2 = st.strands[s2]?.nodes[i];
          if (!n1 || !n2) continue;
          const p1 = helixPos(s1, i, st.maxLen, st.time, W, H);
          const p2 = helixPos(s2, i, st.maxLen, st.time, W, H);
          items.push({ type: 'conn', z: (p1.z + p2.z) / 2, p1, p2, score1: n1.score, score2: n2.score });
        }
      }
    }

    // Nodes
    for (let s = 0; s < 3; s++) {
      for (let i = 0; i < st.strands[s].nodes.length; i++) {
        const p = helixPos(s, i, st.maxLen, st.time, W, H);
        items.push({
          type: 'node', z: p.z, s, i, p,
          node: st.strands[s].nodes[i], strand: st.strands[s],
          hov: st.hovered?.s === s && st.hovered?.i === i,
        });
      }
    }

    items.sort((a, b) => a.z - b.z);

    for (const item of items) {
      if (item.type === 'conn') {
        // Connection
        const col = tensionColor(item.score1, item.score2);
        const depthA = 0.25 + 0.65 * ((item.z + 1) / 2);
        ctx.save();
        ctx.globalAlpha = depthA;
        ctx.strokeStyle = col;
        ctx.lineWidth = 1.2;
        ctx.setLineDash(item.score1 === null || item.score2 === null ? [3, 3] : []);
        ctx.beginPath();
        ctx.moveTo(item.p1.x, item.p1.y);
        const mx = (item.p1.x + item.p2.x) / 2;
        const my = (item.p1.y + item.p2.y) / 2 + (item.p1.z > 0 ? -8 : 8);
        ctx.quadraticCurveTo(mx, my, item.p2.x, item.p2.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      } else {
        // Node
        const { p, node, strand, hov, z } = item;
        const depth = (z + 1) / 2;
        const conf = node.confidence / 100;
        const scored = node.score !== null;
        const r = CFG.nodeBaseR * (0.6 + 0.6 * depth) * (scored ? (0.8 + 0.5 * conf) : 0.7);
        const alpha = scored ? (0.45 + 0.55 * depth) : (0.18 + 0.15 * depth);
        const col = scoreColor(node.score, alpha);

        ctx.save();
        ctx.globalAlpha = 1;

        if (hov) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, r + 6, 0, 2 * Math.PI);
          ctx.strokeStyle = strand.color + 'aa';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, 2 * Math.PI);
        ctx.fillStyle = col;
        ctx.fill();

        ctx.strokeStyle = strand.color + Math.round(80 + 120 * depth).toString(16).padStart(2, '0');
        ctx.lineWidth = scored ? (0.8 + 1.0 * depth) : 0.5;
        ctx.stroke();

        if (scored && conf > 0.2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 0.45 * conf, 0, 2 * Math.PI);
          ctx.fillStyle = '#ffffff' + Math.round(60 * depth * conf).toString(16).padStart(2, '0');
          ctx.fill();
        }

        ctx.restore();
      }
    }

    // Strand name labels
    for (let s = 0; s < 3; s++) {
      const strand = st.strands[s];
      const pFirst = helixPos(s, 0, st.maxLen, st.time, W, H);
      const depth = (pFirst.z + 1) / 2;
      ctx.globalAlpha = 0.4 + 0.5 * depth;
      ctx.fillStyle = strand.color;
      ctx.font = "700 11px 'Space Mono', monospace";
      ctx.textAlign = 'right';
      ctx.fillText(strand.name, CFG.marginX - 8, pFirst.y + 4);
      ctx.globalAlpha = 1;
    }

    // Tooltip
    const tooltip = tooltipRef.current;
    if (tooltip && st.hovered) {
      const h = st.hovered;
      const score = h.node.score;
      const col = scoreColor(score, 1);
      const barW = score !== null ? Math.round((score / 9) * 100) : 50;
      const dOrient = score !== null ? domainLabel(h.node.dim.cat, score / 9) : null;

      tooltip.style.display = 'block';
      let tx = h.p.x + 14;
      let ty = h.p.y - 60;
      if (tx + 220 > W) tx = h.p.x - 234;
      if (ty < 0) ty = 4;
      tooltip.style.left = tx + 'px';
      tooltip.style.top = ty + 'px';
      tooltip.innerHTML = `
        <div style="font-size:10px;font-family:'Space Mono',monospace;color:${h.strand.color};margin-bottom:2px;">${h.strand.name} · ${h.node.dim.cat}</div>
        <div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:6px;">${h.node.dim.name}</div>
        <div style="position:relative;height:6px;border-radius:3px;background:linear-gradient(90deg,#dc3232,#ff7728 25%,#787891 50%,#3cb4b4 75%,#50b4ff);margin:6px 0 4px;">
          ${score !== null ? `<div style="position:absolute;left:${barW}%;top:50%;transform:translate(-50%,-50%);width:10px;height:10px;border-radius:50%;background:${col};border:2px solid white;"></div>` : ''}
        </div>
        <div style="font-size:12px;">
          ${score !== null ? `<strong style="color:${col};">${dOrient}</strong><br><span style="opacity:.6;">Position ${score}/9</span>` : '<em style="opacity:.5;">Not yet explored</em>'}
          ${h.node.confidence ? `<br><span style="opacity:.45;">Confidence: ${h.node.confidence}%</span>` : ''}
        </div>`;
    } else if (tooltip) {
      tooltip.style.display = 'none';
    }
  }, []);

  useEffect(() => {
    if (!dimensions.length) return;

    const strands: Strand[] = STRAND_DEFS.map(def => ({
      ...def,
      nodes: dimensions
        .filter(d => def.cats.includes(d.cat))
        .map(d => ({
          dim: d,
          score: dimensionScores[d.id] ?? null,
          confidence: confidence[d.id] ?? 0,
        })),
    }));

    const maxLen = Math.max(...strands.map(s => s.nodes.length));

    stateRef.current = { strands, maxLen, time: 0, hovered: null, animFrame: null };

    const loop = () => {
      const st = stateRef.current;
      if (!st) return;
      st.time += CFG.rotSpeed;
      draw();
      st.animFrame = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      if (stateRef.current?.animFrame) cancelAnimationFrame(stateRef.current.animFrame);
      stateRef.current = null;
    };
  }, [dimensions, dimensionScores, confidence, draw]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const st = stateRef.current;
    if (!st) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const W = canvas.clientWidth;
    const H = CFG.height;

    let closest: typeof st.hovered = null;
    let minDist = 28;

    for (let s = 0; s < st.strands.length; s++) {
      for (let i = 0; i < st.strands[s].nodes.length; i++) {
        const p = helixPos(s, i, st.maxLen, st.time, W, H);
        const dist = Math.hypot(p.x - mx, p.y - my);
        if (dist < minDist) {
          minDist = dist;
          closest = { s, i, p, node: st.strands[s].nodes[i], strand: st.strands[s] };
        }
      }
    }
    st.hovered = closest;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (stateRef.current) stateRef.current.hovered = null;
  }, []);

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 12, flexWrap: 'wrap', gap: 8,
      }}>
        <span style={{
          fontSize: 11, fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
          letterSpacing: 1.5, color: 'rgba(255,255,255,0.5)',
        }}>
          Belief Genome — Triple Helix
        </span>
        <div style={{ display: 'flex', gap: 16, fontSize: 11, fontFamily: "'Space Mono', monospace" }}>
          <span style={{ color: '#5599ff' }}>&#9679; LOGOS · How you reason</span>
          <span style={{ color: '#ff5566' }}>&#9679; PATHOS · How you feel</span>
          <span style={{ color: '#34d399' }}>&#9679; ETHOS · How you act</span>
        </div>
      </div>

      {/* Canvas */}
      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', display: 'block', cursor: 'crosshair' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
        <div
          ref={tooltipRef}
          style={{
            display: 'none', position: 'absolute', pointerEvents: 'none',
            background: 'rgba(15,15,30,0.95)', border: '1px solid rgba(108,143,255,0.3)',
            borderRadius: 8, padding: '10px 14px', maxWidth: 220, zIndex: 10,
            backdropFilter: 'blur(8px)',
          }}
        />
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 20, marginTop: 12,
        fontSize: 10, color: 'rgba(255,255,255,0.4)', flexWrap: 'wrap',
      }}>
        <span><span style={{ color: '#ff4444' }}>&#8226;</span> False to me (0-2)</span>
        <span><span style={{ color: '#ff7728' }}>&#8226;</span> Unlikely true (3-4)</span>
        <span><span style={{ color: '#787891' }}>&#8226;</span> Uncertain (5)</span>
        <span><span style={{ color: '#3cb4b4' }}>&#8226;</span> Likely true (6-7)</span>
        <span><span style={{ color: '#50b4ff' }}>&#8226;</span> True to me (8-9)</span>
        <span style={{ marginLeft: 16 }}>
          <span style={{ color: '#ff5050' }}>—</span> Tension
          <span style={{ marginLeft: 8, color: '#44cc88' }}>—</span> Aligned
        </span>
      </div>
    </div>
  );
}
