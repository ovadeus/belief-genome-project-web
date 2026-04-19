// React Query hooks for the per-user Known DNAs library + the auth-gated
// compare endpoint. Public (two-side) compare lives in a separate hook in
// PublicComparePage so it can run unauthenticated — keep these auth-only.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { genomeApi } from '../components/genome/GenomeAuthContext';

export interface KnownDnaEntry {
  id: number;
  signature: string;
  format: 'anonymous' | 'signed';
  shareableName: string | null;
  note: string | null;
  exportedAt: string | null;
  exportedFrom: string | null;
  source: 'file' | 'paste' | 'url';
  importedAt: string;
}

export interface ParsedSignaturePreview {
  format: 'anonymous' | 'signed';
  signature: string;
  shareableName?: string | null;
  note?: string | null;
  exportedAt?: string | null;
  exportedFrom?: string | null;
  fileFormat: 'bgp-dna/v1' | null;
  dimensionsCovered: number;
}

export type AgreementBucket = 'strong' | 'mild' | 'moderate' | 'strong_diff' | 'none';

export interface PerDimComparison {
  yours: number | null;
  theirs: number | null;
  delta: number | null;
  agreement: AgreementBucket;
}

export interface PerCatComparison {
  label: string;
  range: { start: number; end: number };
  totalDims: number;
  shared: number;
  agree: number;
  mild: number;
  moderate: number;
  strongDiff: number;
  agreementRatio: number | null;
}

export interface CompareResponse {
  yours: {
    dimensionScores: Record<number, number>;
    totalResponses: number;
    dimensionsCovered: number;
    overallConfidence: number;
  };
  theirs: {
    signature: string;
    format: 'anonymous' | 'signed';
    shareableName: string | null;
    note: string | null;
    dimensionScores: Record<number, number>;
    dimensionsCovered: number;
    demographics: Record<string, unknown> | null;
  };
  comparison: {
    totalShared: number;
    totalAgree: number;
    overallAlignment: number | null;
    perDim: Record<number, PerDimComparison>;
    perCat: Record<string, PerCatComparison>;
    topAlignment: string | null;
    topDivergence: string | null;
  };
}

// ── Library list ────────────────────────────────────────────────────────────
export function useKnownDnas() {
  return useQuery<{ entries: KnownDnaEntry[] }>({
    queryKey: ['genome', 'known-dnas'],
    queryFn: async () => {
      const r = await genomeApi('/known-dnas');
      if (!r.ok) throw new Error('Failed to load library');
      return r.json();
    },
    staleTime: 30_000,
  });
}

// ── Parse — three-entry-points unified pipeline (file, paste sig, paste URL) ─
export function useParseSignature() {
  return useMutation<{ valid: boolean; parsed?: ParsedSignaturePreview }, Error, string>({
    mutationFn: async (text: string) => {
      const r = await genomeApi('/known-dnas/parse', {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      if (r.status === 429) throw new Error('Too many tries. Wait a moment.');
      if (!r.ok) throw new Error('Could not parse');
      return r.json();
    },
  });
}

// ── Add to library — server handles dedup via UNIQUE(user_id, signature) ────
export function useAddKnownDna() {
  const qc = useQueryClient();
  return useMutation<
    { entry: KnownDnaEntry; deduped: boolean },
    Error,
    {
      signature: string;
      shareableName?: string | null;
      note?: string | null;
      exportedAt?: string | null;
      exportedFrom?: string | null;
      source: 'file' | 'paste' | 'url';
    }
  >({
    mutationFn: async (payload) => {
      const r = await genomeApi('/known-dnas', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (r.status === 429) throw new Error('Too many imports. Wait a moment.');
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err?.error === 'invalid_signature' ? 'Signature is invalid' : 'Could not save');
      }
      return r.json();
    },
    onSuccess: ({ deduped, entry }) => {
      qc.invalidateQueries({ queryKey: ['genome', 'known-dnas'] });
      // Any open compare view against this entry / signature must refetch so
      // a freshly-updated note or shareableName is reflected immediately
      // (the dedup branch in particular silently overwrites those fields).
      qc.invalidateQueries({ queryKey: ['genome', 'compare'] });
      if (deduped) {
        toast.success(`Already in your library — updated "${entry.shareableName || 'entry'}"`);
      } else {
        toast.success(`Added "${entry.shareableName || 'DNA'}" to your library`);
      }
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useDeleteKnownDna() {
  const qc = useQueryClient();
  return useMutation<{ ok: true }, Error, number>({
    mutationFn: async (id: number) => {
      const r = await genomeApi(`/known-dnas/${id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error('Could not remove entry');
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['genome', 'known-dnas'] });
      // Compare query against this id will 404 next fetch — invalidate so the
      // ComparePage redirect-on-not-found effect fires promptly.
      qc.invalidateQueries({ queryKey: ['genome', 'compare'] });
      toast.success('Removed from library');
    },
    onError: (e) => toast.error(e.message),
  });
}

// ── Auth compare — accepts numeric library id OR raw signature string ───────
export function useCompare(against: string | number | null) {
  return useQuery<CompareResponse>({
    queryKey: ['genome', 'compare', against],
    queryFn: async () => {
      if (against == null) throw new Error('No target');
      const r = await genomeApi(`/compare?against=${encodeURIComponent(String(against))}`);
      if (r.status === 404) throw new Error('not_found');
      if (r.status === 429) throw new Error('rate_limited');
      if (!r.ok) throw new Error('compare_failed');
      return r.json();
    },
    enabled: against != null,
    staleTime: 30_000,
    retry: false,
  });
}
