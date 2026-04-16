import { useQuery, keepPreviousData } from "@tanstack/react-query";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export interface ExploreFilters {
  countries: string[];
  genders: string[];
  generations: string[];
  categories: string[];
  startDate?: string;
  endDate?: string;
}

export const DEFAULT_FILTERS: ExploreFilters = {
  countries: [],
  genders: [],
  generations: [],
  categories: [],
};

function buildQueryParams(f: ExploreFilters): URLSearchParams {
  const qp = new URLSearchParams();
  if (f.countries.length > 0) qp.set("countries", f.countries.join(","));
  if (f.genders.length > 0) qp.set("genders", f.genders.join(","));
  if (f.generations.length > 0) qp.set("generations", f.generations.join(","));
  if (f.startDate) qp.set("startDate", f.startDate);
  if (f.endDate) qp.set("endDate", f.endDate);
  return qp;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

interface DimData { avg: number; count: number; confidence?: number; }
interface StatsResponse { totalSubmissions: number; uniqueCountries: number; avgDimensionsExplored: number; }
interface DimensionsResponse { count: number; insufficientData: boolean; dimensions: Record<string, DimData>; }
interface GenerationData { label: string; start: number; end: number; count: number; avgBeliefs: Record<string, number>; }
interface GendersResponse { genders: Array<{ gender: string; count: number }>; }
interface CountriesResponse { countries: Array<{ countryCode: string; count: number }>; }
interface TimelinePoint { period: string; count: number; avgs: Record<string, number>; }
interface TimelineResponse { timeline: TimelinePoint[]; }
interface CountryBeliefsResponse { countryBeliefs: Record<string, { avg: number; count: number }>; }

export function useExploreStats(filters: ExploreFilters) {
  const qp = buildQueryParams(filters);
  return useQuery<StatsResponse>({
    queryKey: ["explore", "stats", qp.toString()],
    queryFn: () => fetchJson<StatsResponse>(`${API_BASE}/genome/stats?${qp}`),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useExploreDimensions(filters: ExploreFilters, enabled = true) {
  const qp = buildQueryParams(filters);
  return useQuery<DimensionsResponse>({
    queryKey: ["explore", "dimensions", qp.toString()],
    queryFn: () => fetchJson<DimensionsResponse>(`${API_BASE}/genome/explore/dimensions?${qp}`),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    enabled,
  });
}

export function useExploreGenerations(filters: ExploreFilters, enabled = true) {
  const qp = buildQueryParams(filters);
  return useQuery<{ generations: GenerationData[] }>({
    queryKey: ["explore", "generations", qp.toString()],
    queryFn: () => fetchJson<{ generations: GenerationData[] }>(`${API_BASE}/genome/explore/generations?${qp}`),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    enabled,
  });
}

export function useExploreGenders(filters: ExploreFilters, enabled = true) {
  const qp = buildQueryParams(filters);
  return useQuery<GendersResponse>({
    queryKey: ["explore", "genders", qp.toString()],
    queryFn: () => fetchJson<GendersResponse>(`${API_BASE}/genome/explore/genders?${qp}`),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    enabled,
  });
}

export function useExploreCountries(filters: ExploreFilters, enabled = true) {
  const qp = buildQueryParams(filters);
  return useQuery<CountriesResponse>({
    queryKey: ["explore", "countries", qp.toString()],
    queryFn: () => fetchJson<CountriesResponse>(`${API_BASE}/genome/explore/countries?${qp}`),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    enabled,
  });
}

export function useExploreTimeline(filters: ExploreFilters, interval: string, enabled = true) {
  const qp = buildQueryParams(filters);
  qp.set("interval", interval);
  return useQuery<TimelineResponse>({
    queryKey: ["explore", "timeline", qp.toString()],
    queryFn: () => fetchJson<TimelineResponse>(`${API_BASE}/genome/explore/timeline?${qp}`),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    enabled,
  });
}

export function useExploreCountryBeliefs(filters: ExploreFilters, enabled = true) {
  const qp = buildQueryParams(filters);
  return useQuery<CountryBeliefsResponse>({
    queryKey: ["explore", "country-beliefs", qp.toString()],
    queryFn: () => fetchJson<CountryBeliefsResponse>(`${API_BASE}/genome/explore/country-beliefs?${qp}`),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    enabled,
  });
}

export type { DimData, GenerationData, TimelinePoint, StatsResponse };
