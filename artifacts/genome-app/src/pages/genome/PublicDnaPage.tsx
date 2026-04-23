// Public, unauthenticated DNA share page rendered at /dna/:signature.
// Fetches decoded DNA from the public API endpoint and renders the strip.
import { useEffect, useState } from 'react';
import { useRoute, Link } from 'wouter';
import DnaStrip from '../../components/genome/DnaStrip';

// Same-origin fetch in dev (Vite proxies) and prod (same domain). No
// credentials — this endpoint is unauthenticated by design.
async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(path, { credentials: 'omit' });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json() as Promise<T>;
}

interface PublicDnaResponse {
  format: 'anonymous' | 'signed';
  dimensionScores: Record<number, number>;
  dimensionCount: number;
  demographics?: {
    century: string; birthYear: string; birthMonth: string; birthDay: string;
    sex: string; countryCode: string; zipCode: string;
  };
}

interface DimDef { id: number; name: string; cat: string; }

export default function PublicDnaPage() {
  const [, params] = useRoute('/dna/:signature');
  const signature = params?.signature ?? '';

  const [data, setData] = useState<PublicDnaResponse | null>(null);
  const [dims, setDims] = useState<DimDef[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    // Pass through UTM params so analytics can attribute the view
    const search = new URLSearchParams(window.location.search);
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign'];
    const utmQs = utmKeys
      .map(k => search.get(k) ? `${k}=${encodeURIComponent(search.get(k)!)}` : '')
      .filter(Boolean).join('&');
    const qs = utmQs ? `?${utmQs}` : '';

    Promise.all([
      fetchJson<PublicDnaResponse>(`/api/genome/dna/public/${encodeURIComponent(signature)}${qs}`),
      fetchJson<{ dimensions: DimDef[] }>(`/api/genome/dna/public/dimensions`).catch(() => ({ dimensions: [] as DimDef[] })),
    ])
      .then(([dnaRes, dimsRes]) => {
        if (cancelled) return;
        setData(dnaRes);
        setDims(dimsRes.dimensions ?? []);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('429')) setError('rate_limited');
        else setError('not_found');
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [signature]);

  if (loading) {
    return (
      <Shell>
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          Loading shared Belief DNA…
        </div>
      </Shell>
    );
  }

  if (error === 'rate_limited') {
    return (
      <Shell>
        <Centered>
          <h1 style={{ fontSize: 22, color: 'var(--text-primary)', margin: 0 }}>Slow down a sec</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
            Too many requests from your network. Please try again in about a minute.
          </p>
        </Centered>
      </Shell>
    );
  }

  if (error || !data) {
    return (
      <Shell>
        <Centered>
          <h1 style={{ fontSize: 22, color: 'var(--text-primary)', margin: 0 }}>This DNA link isn't valid</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
            The link may be incomplete or mistyped. Ask the sender for a fresh one.
          </p>
          <Link href="/login" style={{
            display: 'inline-block', marginTop: 20, padding: '10px 20px',
            borderRadius: 8, background: 'var(--accent-mid)',
            border: '1px solid var(--accent-strong)', color: 'var(--accent-text)',
            fontSize: 13, fontWeight: 600, textDecoration: 'none',
          }}>
            Map your own Belief DNA
          </Link>
        </Centered>
      </Shell>
    );
  }

  const dimensionsCovered = data.dimensionCount;
  // Public payload doesn't include per-dim confidence — synthesize full
  // confidence for explored dims (so cells render in color, not gray).
  const confidence: Record<number, number> = {};
  for (const id of Object.keys(data.dimensionScores)) confidence[parseInt(id, 10)] = 1;

  return (
    <Shell>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
        <header style={{ textAlign: 'center', marginBottom: 32 }}>
          <p style={{
            fontSize: 11, fontFamily: "'Space Mono', monospace",
            textTransform: 'uppercase', letterSpacing: 2,
            color: 'var(--accent-strong)', margin: 0,
          }}>
            Belief Genome Project
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', margin: '8px 0 4px' }}>
            A shared Belief DNA
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            {dimensionsCovered} of 124 dimensions explored
            {data.format === 'signed' && data.demographics && (
              <> · {formatDemographics(data.demographics)}</>
            )}
          </p>
        </header>

        <div style={{
          padding: 24, borderRadius: 16,
          background: 'var(--surface-1)',
          border: '1px solid var(--accent-soft)',
          marginBottom: 24,
        }}>
          <DnaStrip
            dimensions={dims}
            dimensionScores={data.dimensionScores}
            confidence={confidence}
            totalResponses={dimensionsCovered}
            dimensionsCovered={dimensionsCovered}
            overallConfidence={dimensionsCovered / 124}
          />
        </div>

        <div style={{ textAlign: 'center', padding: '20px 0 60px' }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
            Curious what your Belief DNA looks like?
          </p>
          <Link href="/register" style={{
            display: 'inline-block', padding: '12px 24px', borderRadius: 8,
            background: 'var(--accent-mid)',
            border: '1px solid var(--accent-strong)', color: 'var(--accent-text)',
            fontSize: 13, fontWeight: 600, textDecoration: 'none',
          }}>
            Map yours — free
          </Link>
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'hsl(var(--background))' }}>
      {children}
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '70vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 20,
    }}>
      {children}
    </div>
  );
}

function formatDemographics(d: NonNullable<PublicDnaResponse['demographics']>): string {
  const parts: string[] = [];
  if (d.sex && d.sex !== '0') parts.push({ '1': 'Male', '2': 'Female', '3': 'Non-binary' }[d.sex] ?? '');
  if (d.countryCode && d.countryCode !== '000') parts.push(`Country ${d.countryCode}`);
  return parts.filter(Boolean).join(' · ');
}
