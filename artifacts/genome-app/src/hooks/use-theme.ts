export type ThemeName = "dark" | "light";

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
 * The HTML bootstrap script in index.html now sets the theme from
 * localStorage before first paint and is the only source of truth.
 *
 * Trade-off: if an admin changes the site theme via the admin panel in
 * whoo-ru, only their own browser sees the change immediately. Other
 * visitors keep using their cached value until they manually clear browser
 * data. For a low-frequency setting like a site-wide theme, this is fine.
 */
export function useThemeBootstrap(): void {
  // intentionally empty — see comment above
}
