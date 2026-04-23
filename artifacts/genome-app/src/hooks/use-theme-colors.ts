import { useEffect, useMemo, useState } from 'react';

/**
 * Resolve a list of CSS custom properties from `:root` to their computed
 * literal color strings.
 *
 * Why this exists: components that draw to <canvas> (Chart.js, Three.js,
 * imperative 2d contexts) cannot read CSS variables — passing
 * `'var(--text-faint)'` to a canvas API silently falls back to `#000000`.
 * For those callers we have to resolve the variables to real values up front.
 *
 * The hook re-reads the values whenever `data-theme` flips on the
 * <html> element, so charts stay in sync when an admin changes the theme
 * without a page reload.
 */
export function useThemeColors<K extends string>(varNames: readonly K[]): Record<K, string> {
  const [theme, setTheme] = useState<string>(
    () => (typeof document !== 'undefined' ? document.documentElement.dataset.theme ?? 'dark' : 'dark')
  );

  useEffect(() => {
    const el = document.documentElement;
    const obs = new MutationObserver(() => {
      setTheme(el.dataset.theme ?? 'dark');
    });
    obs.observe(el, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  return useMemo(() => {
    const styles = getComputedStyle(document.documentElement);
    const out = {} as Record<K, string>;
    for (const name of varNames) {
      out[name] = styles.getPropertyValue(name).trim();
    }
    return out;
    // varNames is a stable readonly tuple at the call site; we depend on theme
    // so the values refresh on theme switch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);
}
