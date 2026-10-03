import type { Ref } from 'vue'

export type Theme = 'dark' | 'light'

/**
 * Typdeklaration für useTheme.js. Setzt body.light-theme (App) und
 * html[data-theme] (SSI-Partials) und folgt theme-changed-Events der SSI-Navigation.
 */
export function useTheme(): {
  currentTheme: Ref<string>
  toggleTheme(): void
  setTheme(theme: Theme): void
  isLight(): boolean
}
