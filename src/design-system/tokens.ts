/**
 * Typisierter Zugriff auf die Design Tokens (tokens.json) für JS/TS-Konsumenten,
 * z. B. Canvas-Zeichnung oder Tests. Laufzeit-Quelle für CSS bleibt tokens.css.
 */
import tokens from './tokens.json'

export type ThemeName = 'dark' | 'light'
export type ColorTokenName = keyof typeof tokens.color.dark
export type SpacingTokenName = keyof typeof tokens.spacing
export type RadiusTokenName = keyof typeof tokens.radius

/** Die kompletten Tokens, Struktur siehe tokens.json. */
export const designTokens = tokens

/** Farbwert eines Tokens für ein Theme, z. B. colorToken('dark', 'accent') → '#c9984d'. */
export function colorToken(theme: ThemeName, name: ColorTokenName): string {
  return tokens.color[theme][name].$value
}

/** Flache Farbkarte eines Themes, z. B. für die Canvas-Dateiliste. */
export function themeColors(theme: ThemeName): Readonly<Record<ColorTokenName, string>> {
  const source = tokens.color[theme]
  const result = {} as Record<ColorTokenName, string>
  for (const key of Object.keys(source) as ColorTokenName[]) {
    result[key] = source[key].$value
  }
  return result
}

/** CSS-Variablenname eines Farb-Tokens, z. B. colorCssVar('accent') → '--accent-color'. */
export function colorCssVar(name: ColorTokenName): string {
  return tokens.color.dark[name].$extensions.css
}

/** var()-Ausdruck mit optionalem Fallback: cssVar('accent') → 'var(--accent-color)'. */
export function cssVar(name: ColorTokenName, fallback?: string): string {
  const variable = colorCssVar(name)
  return fallback === undefined ? `var(${variable})` : `var(${variable}, ${fallback})`
}

/** Breakpoints in px, für window.matchMedia / ResizeObserver-Logik. */
export const breakpoints = {
  tablet: parseInt(tokens.layout.breakpoint.tablet.$value, 10),
  onboarding: parseInt(tokens.layout.breakpoint.onboarding.$value, 10),
  phone: parseInt(tokens.layout.breakpoint.phone.$value, 10),
} as const

/** Höhe der externen SSI-Navigation in px (Startwert, App.vue misst nach). */
export const externalNavHeightPx = parseInt(tokens.ssi.dark.externalNavHeight.$value, 10)
