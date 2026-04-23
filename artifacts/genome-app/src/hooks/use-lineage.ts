import { useQuery } from '@tanstack/react-query';
import { genomeApi } from '../components/genome/GenomeAuthContext';

export interface LineageRow {
  id: number;
  responseId: number;
  scoreBefore: number | null;
  scoreAfter: number;
  delta: number;
  confidenceBefore: number;
  confidenceAfter: number;
  createdAt: string;
  probeText: string;
  probeCategory: string;
  probeSource: string;
  value: number;
  note: string | null;
}

export interface LineageResponse {
  dimensionId: number;
  dimension: {
    id: number;
    name: string;
    short: string;
    desc: string;
    cat: string;
    catLabel: string | null;
  } | null;
  currentScore: number | null;
  currentConfidence: number;
  totalContributors: number;
  top: LineageRow[];
  timeline: LineageRow[];
}

// Provenance for one belief dimension. Disabled when dimensionId is null so
// the drawer can mount without a selection.
export function useLineage(dimensionId: number | null) {
  return useQuery<LineageResponse>({
    queryKey: ['genome', 'lineage', dimensionId],
    enabled: dimensionId !== null,
    queryFn: async () => {
      const r = await genomeApi(`/lineage/${dimensionId}`);
      if (!r.ok) throw new Error('Failed to fetch lineage');
      return r.json();
    },
    staleTime: 30_000,
  });
}
