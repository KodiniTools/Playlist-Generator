/**
 * Quellen, deren Übergabe (?source=<tool>) der Playlist-Generator annimmt.
 * Die Dateien selbst liegen im gemeinsamen IndexedDB-Store (sharedFileRepository).
 */
export const SHARED_SOURCES = ['audiokonverter', 'audionormalizer', 'audio-cutter'] as const

export type SharedSource = (typeof SHARED_SOURCES)[number]

export function isSharedSource(value: unknown): value is SharedSource {
  return typeof value === 'string' && (SHARED_SOURCES as readonly string[]).includes(value)
}
