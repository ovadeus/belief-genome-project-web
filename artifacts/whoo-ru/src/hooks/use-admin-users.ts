import { useEffect, useRef, useState } from "react";

/**
 * Debounce a value by `delay` ms. Used to avoid firing an admin-list query
 * on every keystroke in the search field.
 */
function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  const tRef = useRef<number | null>(null);
  useEffect(() => {
    if (tRef.current) window.clearTimeout(tRef.current);
    tRef.current = window.setTimeout(() => setDebounced(value), delay);
    return () => { if (tRef.current) window.clearTimeout(tRef.current); };
  }, [value, delay]);
  return debounced;
}

export interface AdminGenomeUser {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  probeCount: number;
  latestDnaString: string | null;
  latestDnaAt: string | null;
}

export interface AdminGenomeUsersPage {
  users: AdminGenomeUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Params {
  page?: number;
  limit?: number;
  search?: string;
}

export function useAdminGenomeUsers(params: Params) {
  const { page = 1, limit = 25, search = "" } = params;
  const debouncedSearch = useDebounced(search, 250);
  const [data, setData] = useState<AdminGenomeUsersPage | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (debouncedSearch) qs.set("search", debouncedSearch);
    fetch(`/api/admin/users?${qs.toString()}`, { credentials: "include" })
      .then(r => (r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`)))
      .then((json: AdminGenomeUsersPage) => { if (!cancelled) setData(json); })
      .catch(e => { if (!cancelled) setError(String(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, limit, debouncedSearch]);

  return { data, isLoading, error };
}
