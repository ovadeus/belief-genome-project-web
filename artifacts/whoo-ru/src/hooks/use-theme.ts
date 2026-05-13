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
 * No-op — kept for backwards compatibility with existing imports.
 *
 * History: previously this hook fetched /api/theme on mount and re-applied
 * the server's value on top of the localStorage-cached value set by the
 * bootstrap script in index.html. That second pass caused a visible flash
 * (light → dark or dark → light) whenever the cached value differed from
 * the server response, even briefly. The flash looked unprofessional and
 * could not be reliably eliminated without server-side rendering.
 *
 * Trade-off: if an admin changes the site theme via the admin panel, only
 * their own browser sees the change immediately (their localStorage gets
 * overwritten by useAdminTheme.save). Other visitors keep using their
 * cached value until they manually clear browser data. For a low-frequency
 * setting like a site-wide theme, this is acceptable.
 *
 * To make admin changes propagate to all visitors instantly, you would
 * need server-side injection of the activeTheme into index.html at request
 * time (Vite plugin in dev, build-time + edge-middleware in production).
 */
export function useThemeBootstrap(): void {
  // intentionally empty — see comment above
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
