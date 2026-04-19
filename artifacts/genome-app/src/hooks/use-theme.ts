import { useEffect } from "react";

export type ThemeName = "dark" | "light";
const VALID: ThemeName[] = ["dark", "light"];
const STORAGE_KEY = "bgpTheme";

function isValid(v: unknown): v is ThemeName {
  return typeof v === "string" && (VALID as string[]).includes(v);
}

/**
 * Read-only bootstrap — fetches the admin-selected theme from the API on
 * mount, applies it if it differs from the cached value. Mount ONCE near the
 * root of App.tsx. The inline script in index.html sets a cached theme before
 * React renders to avoid a flash; this hook does the second-pass refresh so
 * an admin's change propagates within one full page load.
 */
export function useThemeBootstrap(): void {
  useEffect(() => {
    let cancelled = false;
    fetch("/api/theme", { headers: { Accept: "application/json" } })
      .then(r => (r.ok ? r.json() : null))
      .then((data: { activeTheme?: string } | null) => {
        if (cancelled || !data) return;
        const next: ThemeName = isValid(data.activeTheme) ? data.activeTheme : "dark";
        if (document.documentElement.dataset.theme !== next) {
          document.documentElement.dataset.theme = next;
          try { localStorage.setItem(STORAGE_KEY, next); } catch { /* ignore */ }
        }
      })
      .catch(() => { /* keep cached value on network error */ });
    return () => { cancelled = true; };
  }, []);
}
