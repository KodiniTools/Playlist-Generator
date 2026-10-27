import { designTokens, themeColors, type ThemeName } from '../design-system/tokens'
import { estimateSeconds } from '../components/ui/fileListFormat'
import type { AudioTags } from './audioTags'

/**
 * Teilbares Bild der Wiedergabeliste (Story 9:16 bzw. Post 1:1), gezeichnet auf
 * ein Canvas, komplett lokal. Layout und Text sind von der Zeichnung getrennt,
 * damit sie ohne echtes Canvas testbar bleiben.
 */

export type ShareImageFormat = 'story' | 'post'
export type ShareImageType = 'image/png' | 'image/jpeg'

export const SHARE_IMAGE_SIZES: Record<ShareImageFormat, { width: number; height: number }> = {
  story: { width: 1080, height: 1920 },
  post: { width: 1080, height: 1080 },
}

/** Höchstzahl sichtbarer Zeilen je Format (inkl. der „+ N weitere“-Zeile). */
export const SHARE_IMAGE_ROWS: Record<ShareImageFormat, number> = { story: 12, post: 6 }

export interface ShareTrack {
  title: string
  artist?: string
  /** Gemessene Dauer in Sekunden; null = unbekannt, wird nicht angezeigt. */
  seconds: number | null
}

export interface ShareImageData {
  name: string
  tracks: ShareTrack[]
  /** Fertig übersetzte Kopfzeile, z. B. „12 Titel · 48 min“. */
  meta: string
  /** Übersetztes Label über dem Namen, z. B. „WIEDERGABELISTE“. */
  kicker: string
  /** Übersetzt, mit `{count}`, z. B. „+ {count} weitere Titel“. */
  moreLabel: string
  footer: string
}

export interface ShareRows {
  tracks: ShareTrack[]
  /** Anzahl nicht gezeigter Titel; 0 = alle passen. */
  more: number
}

export interface ShareSummary {
  tracks: ShareTrack[]
  /** Gesamtdauer; fehlende Dauern sind wie in der Dateiliste aus der Größe geschätzt. */
  totalSeconds: number
  /** true, wenn mindestens eine Dauer geschätzt ist. */
  approximate: boolean
}

/** Titel fürs Bild: Tag-Titel/-Interpret, sonst Dateiname ohne Endung. */
export function summarizeTracks(
  files: readonly File[],
  getTags: (file: File) => AudioTags | null,
  getDuration: (name: string) => number | null,
): ShareSummary {
  let totalSeconds = 0
  let approximate = false
  const tracks = files.map((file) => {
    const tags = getTags(file)
    const seconds = getDuration(file.name)
    if (seconds === null) approximate = true
    totalSeconds += seconds ?? estimateSeconds(file.name, file.size)
    return {
      title: tags?.title?.trim() || file.name.replace(/\.[^.]+$/, ''),
      artist: tags?.artist?.trim() || undefined,
      seconds,
    }
  })
  return { tracks, totalSeconds, approximate }
}

/** Welche Titel aufs Bild passen; reicht der Platz nicht, wird die letzte Zeile zu „+ N weitere“. */
export function shareRows(tracks: ShareTrack[], format: ShareImageFormat): ShareRows {
  const max = SHARE_IMAGE_ROWS[format]
  if (tracks.length <= max) return { tracks, more: 0 }
  return { tracks: tracks.slice(0, max - 1), more: tracks.length - (max - 1) }
}

/** 3:04, 1:02:09 */
export function formatClock(seconds: number): string {
  const total = Math.max(0, Math.round(seconds))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = String(total % 60).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`
}

/** Gesamtdauer kompakt: „48 min“, „1 h 05 min“; mindestens 1 min. */
export function formatTotal(seconds: number): string {
  const minutes = Math.max(1, Math.round(seconds / 60))
  if (minutes < 60) return `${minutes} min`
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')} min`
}

/** Kürzt Text mit „…“, bis `measure(text)` höchstens `maxWidth` ist. */
export function fitText(text: string, maxWidth: number, measure: (text: string) => number): string {
  if (measure(text) <= maxWidth) return text
  const chars = Array.from(text)
  let low = 0
  let high = chars.length
  while (low < high) {
    const mid = Math.ceil((low + high) / 2)
    if (measure(`${chars.slice(0, mid).join('').trimEnd()}…`) <= maxWidth) low = mid
    else high = mid - 1
  }
  return `${chars.slice(0, low).join('').trimEnd()}…`
}

/** Bricht in höchstens `maxLines` Zeilen um; die letzte wird bei Bedarf gekürzt. */
export function wrapText(
  text: string,
  maxWidth: number,
  maxLines: number,
  measure: (text: string) => number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ''
  for (let i = 0; i < words.length; i++) {
    const candidate = current ? `${current} ${words[i]}` : words[i]!
    if (measure(candidate) <= maxWidth || !current) {
      current = candidate
      continue
    }
    if (lines.length === maxLines - 1) {
      lines.push(fitText(`${current} ${words.slice(i).join(' ')}`, maxWidth, measure))
      return lines
    }
    lines.push(current)
    current = words[i]!
  }
  if (current) lines.push(fitText(current, maxWidth, measure))
  return lines
}

/** Dateiname, z. B. „sommer_mix-story.png“. */
export function shareImageFileName(
  name: string,
  format: ShareImageFormat,
  type: ShareImageType,
): string {
  const base =
    name
      .trim()
      .replace(/[\\/:*?"<>|]+/g, '_')
      .slice(0, 80) || 'playlist'
  return `${base}-${format}.${type === 'image/png' ? 'png' : 'jpg'}`
}

const FONT = designTokens.typography.fontFamily.base.$value

interface Geometry {
  pad: number
  kicker: number
  title: number
  titleLines: number
  meta: number
  row: number
  track: number
  artist: number
  footer: number
}

const GEOMETRY: Record<ShareImageFormat, Geometry> = {
  story: {
    pad: 96,
    kicker: 30,
    title: 88,
    titleLines: 2,
    meta: 36,
    row: 104,
    track: 40,
    artist: 30,
    footer: 28,
  },
  post: {
    pad: 80,
    kicker: 26,
    title: 68,
    titleLines: 1,
    meta: 30,
    row: 92,
    track: 36,
    artist: 26,
    footer: 24,
  },
}

/** Vom Nutzer gewählte Farben (#rrggbb); fehlende Werte kommen aus dem Theme. */
export interface ShareColors {
  text: string
  background: string
}

export interface SharePalette {
  bg: string
  /** Ende des Hintergrund-Verlaufs. */
  bgEnd: string
  text: string
  muted: string
  accent: string
  border: string
}

/** #rgb oder #rrggbb → [r, g, b]; null bei ungültigem Wert. */
export function parseHex(color: string): [number, number, number] | null {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim())
  if (!match) return null
  const hex = match[1]!.length === 3 ? match[1]!.replace(/./g, '$&$&') : match[1]!
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number]
}

const toHex = (rgb: number[]) =>
  `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`

/** Mischt `a` mit `amount` (0–1) Anteil von `b`. */
export function mixColors(a: string, b: string, amount: number): string {
  const x = parseHex(a)
  const y = parseHex(b)
  if (!x || !y) return a
  return toHex(x.map((v, i) => v + (y[i]! - v) * amount))
}

/** Kontrastverhältnis nach WCAG 2.1 (1–21); 1 bei ungültigen Farben. */
export function contrastRatio(a: string, b: string): number {
  const luminance = (color: string) => {
    const rgb = parseHex(color)
    if (!rgb) return null
    const [r, g, bl] = rgb.map((v) => {
      const c = v / 255
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r! + 0.7152 * g! + 0.0722 * bl!
  }
  const la = luminance(a)
  const lb = luminance(b)
  if (la === null || lb === null) return 1
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/** Text- und Hintergrundfarbe des Themes, Startwerte für die Farbwähler. */
export function defaultShareColors(theme: ThemeName): ShareColors {
  const c = themeColors(theme)
  return { text: c.text, background: c.bg }
}

/**
 * Farben fürs Bild. Ohne eigene Farben exakt die Theme-Farben; mit eigenen
 * Farben werden Nebentöne aus Text und Hintergrund gemischt. Der Akzent des
 * Themes bleibt, solange er sich vom Hintergrund abhebt (≥ 3:1), sonst wird
 * die Textfarbe genommen.
 */
export function sharePalette(theme: ThemeName, colors?: Partial<ShareColors>): SharePalette {
  const c = themeColors(theme)
  const text = colors?.text && parseHex(colors.text) ? colors.text : c.text
  const bg = colors?.background && parseHex(colors.background) ? colors.background : c.bg
  if (text.toLowerCase() === c.text.toLowerCase() && bg.toLowerCase() === c.bg.toLowerCase()) {
    return { bg, bgEnd: c.bgSecondary, text, muted: c.muted, accent: c.accent, border: c.border }
  }
  return {
    bg,
    bgEnd: mixColors(bg, text, 0.06),
    text,
    muted: mixColors(text, bg, 0.35),
    accent: contrastRatio(c.accent, bg) >= 3 ? c.accent : text,
    border: mixColors(text, bg, 0.75),
  }
}

/** Zeichnet das Bild in einen 2D-Kontext der Größe `SHARE_IMAGE_SIZES[format]`. */
export function drawShareImage(
  ctx: CanvasRenderingContext2D,
  data: ShareImageData,
  format: ShareImageFormat,
  theme: ThemeName,
  colors?: Partial<ShareColors>,
): void {
  const { width, height } = SHARE_IMAGE_SIZES[format]
  const g = GEOMETRY[format]
  const c = sharePalette(theme, colors)
  const measure = (text: string) => ctx.measureText(text).width
  const font = (size: number, weight = 400) => `${weight} ${size}px ${FONT}`

  // Hintergrund mit leichtem Verlauf
  const background = ctx.createLinearGradient(0, 0, 0, height)
  background.addColorStop(0, c.bg)
  background.addColorStop(1, c.bgEnd)
  ctx.fillStyle = background
  ctx.fillRect(0, 0, width, height)

  // Schallplatte als Akzent oben rechts, angeschnitten
  const discR = format === 'story' ? 300 : 220
  const discX = width - discR * 0.45
  const discY = format === 'story' ? 250 : 150
  ctx.save()
  ctx.globalAlpha = 0.16
  ctx.fillStyle = c.accent
  ctx.beginPath()
  ctx.arc(discX, discY, discR, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 0.35
  ctx.strokeStyle = c.bg
  ctx.lineWidth = 2
  for (let r = discR * 0.42; r < discR; r += discR * 0.09) {
    ctx.beginPath()
    ctx.arc(discX, discY, r, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
  ctx.fillStyle = c.accent
  ctx.beginPath()
  ctx.arc(discX, discY, discR * 0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = c.bg
  ctx.beginPath()
  ctx.arc(discX, discY, discR * 0.05, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  const left = g.pad
  const right = width - g.pad
  const content = right - left
  let y = g.pad + (format === 'story' ? 40 : 0)

  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'

  // Kopf: Label, Name, Meta
  ctx.fillStyle = c.accent
  ctx.font = font(g.kicker, 700)
  y += g.kicker
  ctx.fillText(data.kicker.toUpperCase(), left, y)

  ctx.fillStyle = c.text
  ctx.font = font(g.title, 700)
  // Name endet vor dem Plattenlabel, damit er nicht in die Grafik läuft.
  const titleWidth = Math.min(content, discX - discR * 0.3 - 32 - left)
  const titleLines = wrapText(data.name, titleWidth, g.titleLines, measure)
  for (const line of titleLines) {
    y += g.title * 1.15
    ctx.fillText(line, left, y)
  }

  ctx.fillStyle = c.muted
  ctx.font = font(g.meta, 500)
  y += g.meta * 1.6
  ctx.fillText(data.meta, left, y)

  y += g.meta * 1.2
  ctx.fillStyle = c.accent
  ctx.fillRect(left, y, 120, 6)
  y += 40

  // Titelzeilen
  const { tracks, more } = shareRows(data.tracks, format)
  const numberWidth = g.track * 1.6
  const durationWidth = g.track * 3.2
  tracks.forEach((track, index) => {
    const top = y + index * g.row
    const textLeft = left + numberWidth
    const textWidth = content - numberWidth - durationWidth
    const hasArtist = Boolean(track.artist)
    const titleY = top + (hasArtist ? g.row * 0.45 : g.row * 0.62)

    ctx.fillStyle = c.accent
    ctx.font = font(g.track * 0.8, 700)
    ctx.fillText(String(index + 1).padStart(2, '0'), left, titleY)

    ctx.fillStyle = c.text
    ctx.font = font(g.track, 600)
    ctx.fillText(fitText(track.title, textWidth, measure), textLeft, titleY)

    if (hasArtist) {
      ctx.fillStyle = c.muted
      ctx.font = font(g.artist)
      ctx.fillText(fitText(track.artist!, textWidth, measure), textLeft, top + g.row * 0.82)
    }

    if (track.seconds !== null) {
      ctx.fillStyle = c.muted
      ctx.font = font(g.track * 0.8, 500)
      ctx.textAlign = 'right'
      ctx.fillText(formatClock(track.seconds), right, titleY)
      ctx.textAlign = 'left'
    }

    if (index < tracks.length - 1 || more > 0) {
      ctx.fillStyle = c.border
      ctx.globalAlpha = 0.5
      ctx.fillRect(textLeft, top + g.row - 1, content - numberWidth, 2)
      ctx.globalAlpha = 1
    }
  })

  if (more > 0) {
    ctx.fillStyle = c.accent
    ctx.font = font(g.track * 0.85, 600)
    ctx.fillText(
      data.moreLabel.replace('{count}', String(more)),
      left + numberWidth,
      y + tracks.length * g.row + g.row * 0.62,
    )
  }

  // Fußzeile
  ctx.fillStyle = c.muted
  ctx.font = font(g.footer, 500)
  ctx.fillText(fitText(data.footer, content, measure), left, height - g.pad + g.footer * 0.5)
}

/** Rendert das Bild als PNG/JPEG. Wartet vorher auf die App-Schrift, falls der Browser sie lädt. */
export async function renderShareImage(
  data: ShareImageData,
  format: ShareImageFormat,
  theme: ThemeName,
  type: ShareImageType = 'image/png',
  colors?: Partial<ShareColors>,
): Promise<Blob> {
  const { width, height } = SHARE_IMAGE_SIZES[format]
  try {
    await document.fonts?.load(`700 40px ${FONT}`)
  } catch {
    // Ohne Schrift zeichnet der Browser mit der Ersatzschrift.
  }
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D nicht verfügbar')
  drawShareImage(ctx, data, format, theme, colors)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Bild konnte nicht erzeugt werden'))),
      type,
      0.92,
    )
  })
}
