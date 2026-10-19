/** Wie der Export auf eine Datei verweist. */
export type PathMode = 'name' | 'relative'

// Relativer Pfad je Datei, wo der Browser ihn nicht selbst mitliefert
// (Drag & Drop von Ordnern, aus IndexedDB wiederhergestellte Dateien).
const relativePaths = new WeakMap<File, string>()

const normalize = (path: string) => path.replace(/\\/g, '/').replace(/^\/+/, '')

/** Merkt sich den Pfad relativ zum gewählten bzw. gezogenen Ordner, z. B. "Album/CD1/01.mp3". */
export function setRelativePath(file: File, path: string): void {
  const normalized = normalize(path)
  if (normalized && normalized !== file.name) relativePaths.set(file, normalized)
}

/** Relativer Pfad der Datei; ohne Ordner-Herkunft nur der Dateiname. */
export function relativePathOf(file: File): string {
  return relativePaths.get(file) ?? (normalize(file.webkitRelativePath ?? '') || file.name)
}

/** Gemeinsamer Ordner aller Pfade als Segmentliste (ohne Dateinamen). */
function commonDirectory(paths: string[][]): string[] {
  const [first, ...rest] = paths
  if (!first) return []
  const common = first.slice(0, -1)
  for (const segments of rest) {
    let i = 0
    while (i < common.length && i < segments.length - 1 && common[i] === segments[i]) i++
    common.length = i
  }
  return common
}

const isUrl = (base: string) => /^[a-z][a-z0-9+.-]*:\/\//i.test(base)

/**
 * Pfade für den Export.
 * - `name`: nur der Dateiname (bisheriges Verhalten).
 * - `relative`: Pfad ab dem gemeinsamen Ordner aller Titel; die Playlist gehört in diesen Ordner.
 * Ein nicht leerer `base` wird vorangestellt: als URL mit kodierten Segmenten, als
 * Windows-Pfad (enthält `\`) mit Backslashes, sonst mit `/`.
 */
export function resolveTrackPaths(files: File[], mode: PathMode, base: string): string[] {
  let segments = files.map((file) => [file.name])
  if (mode === 'relative') {
    const paths = files.map((file) => relativePathOf(file).split('/').filter(Boolean))
    const common = commonDirectory(paths)
    segments = paths.map((path) => path.slice(common.length))
  }

  const prefix = base.trim()
  if (!prefix) return segments.map((path) => path.join('/'))

  if (isUrl(prefix)) {
    const root = prefix.endsWith('/') ? prefix : `${prefix}/`
    return segments.map((path) => root + path.map(encodeURIComponent).join('/'))
  }
  if (prefix.includes('\\') && !prefix.includes('/')) {
    const root = prefix.endsWith('\\') ? prefix : `${prefix}\\`
    return segments.map((path) => root + path.join('\\'))
  }
  const root = prefix.endsWith('/') ? prefix : `${prefix}/`
  return segments.map((path) => root + path.join('/'))
}
