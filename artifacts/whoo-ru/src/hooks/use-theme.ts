import { useEffect, useState, useCallback } from "react";

export type ThemeName = "dark" | "light";
const VALID: ThemeName[] = ["dark", "light"];
const STORAGE_KEY = "bgpTheme";

function isValid(v: unknown): v is ThemeName {
  return typeof v === "string" && (VALID as string[]).includes(v);
}

export function applyTheme(theme: ThemeName): void {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* private mode / quota */
  }
}

/**
 * Public bootstrap hook — fetches the admin-selected theme from the API on
 * mount, applies it if it differs from the cached value. Use ONCE near the
 * root of the app (App.tsx). The inline script in index.html has already set
 * a cached value before React mounts, so this is the second-pass refresh.
 */
export function useThemeBootstrap(): void {
  useEffect(() => {
    let cancelled = false;
    fetch("/api/theme", { headers: { Accept: "application/json" } })
      .then(r => (r.ok ? r.json() : null))
      .then((data: { activeTheme?: string } | null) => {
        if (cancelled || !data) return;
        const next = isValid(data.activeTheme) ? data.activeTheme : "dark";
        if (document.documentElement.dataset.theme !== next) {
          applyTheme(next);
        }
      })
      .catch(() => { /* keep cached value on network error */ });
    return () => { cancelled = true; };
  }, []);
}

/**
 * Admin hook — reads/writes the activeTheme via the admin API. Returns the
 * current value, a setter that persists + applies immediately, and pending state.
 */
export function useAdminTheme() {
  const [theme, setTheme] = useState<ThemeName | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/theme", { credentials: "include" })
      .then(r => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then((data: { activeTheme: string }) => {
        if (cancelled) return;
        const v: ThemeName = isValid(data.activeTheme) ? data.activeTheme : "dark";
        setTheme(v);
      })
      .catch(e => { if (!cancelled) setError(String(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const save = useCallback(async (next: ThemeName) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/theme", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeTheme: next }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setTheme(next);
      applyTheme(next);
    } catch (e) {
      setError(String(e));
      throw e;
    } finally {
      setSaving(false);
    }
  }, []);

  return { theme, loading, saving, error, save };
}
