import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { genomeApi } from '../components/genome/GenomeAuthContext';

export interface DnaData {
  dnaString: string;
  totalResponses: number;
  dimensionsCovered: number;
  overallConfidence: number;
  dimensionScores: Record<number, number>;
  dimensionConfidence: Record<number, number>;
}

export interface DimensionDef {
  id: number;
  cat: string;
  name: string;
  short: string;
  desc: string;
}

export function useDNA() {
  return useQuery<DnaData>({
    queryKey: ['genome', 'dna'],
    queryFn: async () => {
      const r = await genomeApi('/dna');
      if (!r.ok) throw new Error('Failed to fetch DNA');
      return r.json();
    },
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
}

export function useDimensions() {
  return useQuery<{ dimensions: DimensionDef[]; categories: any[] }>({
    queryKey: ['genome', 'dimensions'],
    queryFn: async () => {
      const r = await genomeApi('/dimensions');
      if (!r.ok) throw new Error('Failed to fetch dimensions');
      return r.json();
    },
    staleTime: Infinity,
  });
}

export interface RespondPayload {
  probeText: string;
  probeCategory: string;
  probeSource: string;
  value: number;
  confidence?: number;
  note?: string;
  dimensionWeights?: any;
  quality?: any;
  exploreTargetDim?: number;
}

export function useRespondProbe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: RespondPayload) => {
      const r = await genomeApi('/probes/respond', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err?.error || 'Could not save your response.');
      }
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['genome', 'dna'] });
      qc.invalidateQueries({ queryKey: ['genome', 'history'] });
    },
    onError: (e: Error) => {
      toast.error(e.message || 'Network error — your response was not saved.');
    },
  });
}
