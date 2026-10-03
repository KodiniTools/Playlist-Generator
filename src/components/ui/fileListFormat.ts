/**
 * Reine Formatierungs- und Schätzfunktionen für UiFileList.
 * Die Schätzung der Dauer übernimmt das Verhalten der früheren Canvas-Dateiliste:
 * Bytes pro Sekunde je Container, bis die echte Dauer aus den Metadaten vorliegt.
 */

/** Grobe Bytes pro Sekunde je Format; unkomprimierte Formate liegen weit höher. */
export const BYTES_PER_SECOND: Readonly<Record<string, number>> = {
  wav: 176400,
  aiff: 176400,
  aif: 176400,
  flac: 110000,
  alac: 110000,
  mp3: 20000,
  m4a: 20000,
  aac: 20000,
  wma: 20000,
  ogg: 16000,
  opus: 16000,
}

const DEFAULT_BYTES_PER_SECOND = 20000
const SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const

/** Dateiendung in Kleinbuchstaben ohne Punkt, leer wenn keine vorhanden. */
export function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot > 0 && dot < name.length - 1 ? name.slice(dot + 1).toLowerCase() : ''
}

/** Geschätzte Dauer in Sekunden aus Dateigröße und Format. */
export function estimateSeconds(name: string, size: number): number {
  const bytesPerSecond = BYTES_PER_SECOND[extensionOf(name)] ?? DEFAULT_BYTES_PER_SECOND
  return size / bytesPerSecond
}

/** Dateigröße mit einer Nachkommastelle, z. B. "8,8 MB" (de-DE). */
export function formatBytes(bytes: number, locale = 'de-DE'): string {
  if (!(bytes > 0)) return '0 B'
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), SIZE_UNITS.length - 1)
  const value = bytes / 1024 ** exponent
  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: exponent === 0 ? 0 : 1,
  }).format(value)
  return `${formatted} ${SIZE_UNITS[exponent] ?? 'B'}`
}

/** Dauer als Uhrzeit, z. B. "3:41" oder "1:02:05". */
export function formatClock(seconds: number): string {
  const total = Math.max(0, Math.round(seconds))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const rest = String(total % 60).padStart(2, '0')
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${rest}`
  return `${minutes}:${rest}`
}

/** Gesamtdauer als Text, z. B. "< 1 min", "45 min", "1h 5min", "2h". */
export function formatDurationLabel(seconds: number): string {
  const minutes = Math.round(seconds / 60)
  if (minutes < 1) return '< 1 min'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest > 0 ? `${hours}h ${rest}min` : `${hours}h`
}
