/** Intrinsische Bildmaße (px); verhindern Layout-Shift beim Laden. */
export const LANDING_IMAGE_WIDTH = 1120
export const LANDING_IMAGE_HEIGHT = 630

/**
 * URL des Landingpage-Bildes der Sprache (Dateien in `public/`).
 * `baseUrl` ist die Vite-Basis, mit oder ohne Schrägstrich am Ende.
 */
export function landingImageSrc(lang: string, baseUrl: string): string {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  return `${base}playlist-generator-landingpage-${lang === 'en' ? 'en' : 'de'}.webp`
}
