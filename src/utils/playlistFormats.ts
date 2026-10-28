import type { OutputFormat } from '../stores/playlist'
import type { AudioTags } from './audioTags'
import { estimateSeconds, formatClock } from '../components/ui/fileListFormat'

/**
 * Ein Eintrag der Playlist: Datei, Verweis für den Export (Dateiname, relativer Pfad
 * oder mit Basis, siehe trackPath.ts), gemessene Dauer in Sekunden (null = unbekannt)
 * und gelesene Tags (null = keine, siehe audioTags.ts).
 */
export interface PlaylistTrack {
  file: File
  path: string
  duration: number | null
  tags: AudioTags | null
}

/** Titel aus dem Tag, sonst Dateiname ohne Endung. */
const titleOf = ({ file, tags }: PlaylistTrack) => tags?.title ?? file.name.replace(/\.[^/.]+$/, '')

/** Anzeigename für M3U/PLS: „Interpret - Titel“, wenn beides im Tag steht. */
const displayTitleOf = (track: PlaylistTrack) =>
  track.tags?.artist && track.tags.title
    ? `${track.tags.artist} - ${track.tags.title}`
    : titleOf(track)

/** Ganze Sekunden für M3U/PLS/CSV/JSON; -1 bzw. leer steht für „unbekannt“. */
const seconds = (duration: number | null) => (duration === null ? null : Math.round(duration))

const escapeXml = (str: string) => {
  return str.replace(/[<>&'"]/g, (char) => {
    switch (char) {
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '&':
        return '&amp;'
      case "'":
        return '&apos;'
      case '"':
        return '&quot;'
      default:
        return char
    }
  })
}

const generateM3u = (list: PlaylistTrack[]) => {
  let output = '#EXTM3U\n'
  list.forEach((track) => {
    output += `#EXTINF:${seconds(track.duration) ?? -1},${displayTitleOf(track)}\n${track.path}\n`
  })
  return output
}

const generatePls = (list: PlaylistTrack[]) => {
  let output = '[playlist]\n'
  list.forEach((track, index) => {
    const n = index + 1
    output += `File${n}=${track.path}\n`
    output += `Title${n}=${displayTitleOf(track)}\n`
    output += `Length${n}=${seconds(track.duration) ?? -1}\n`
  })
  output += `NumberOfEntries=${list.length}\n`
  output += 'Version=2\n'
  return output
}

const generateTxt = (list: PlaylistTrack[]) => {
  return list.map(({ path }) => path).join('\n') + '\n'
}

// Map an audio extension to a CUE sheet FILE type. Non-standard types
// (e.g. FLAC/OGG) fall back to WAVE, which players accept.
const cueFileType = (name: string) => {
  const ext = (name.split('.').pop() ?? '').toLowerCase()
  if (ext === 'mp3') return 'MP3'
  if (ext === 'aiff' || ext === 'aif') return 'AIFF'
  return 'WAVE'
}

const generateCue = (list: PlaylistTrack[], playlistName: string) => {
  let output = `TITLE "${playlistName.replace(/"/g, "'")}"\n`
  const quote = (text: string) => `"${text.replace(/"/g, "'")}"`
  list.forEach((track, index) => {
    const trackNum = String(index + 1).padStart(2, '0')
    output += `FILE ${quote(track.path)} ${cueFileType(track.file.name)}\n`
    output += `  TRACK ${trackNum} AUDIO\n`
    output += `    TITLE ${quote(titleOf(track))}\n`
    if (track.tags?.artist) output += `    PERFORMER ${quote(track.tags.artist)}\n`
    output += `    INDEX 01 00:00:00\n`
  })
  return output
}

// Escape a value for CSV (RFC 4180): wrap in quotes and double any
// embedded quotes when it contains a comma, quote or newline.
const escapeCsv = (value: string | number) => {
  const str = String(value)
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

const generateCsv = (list: PlaylistTrack[]) => {
  const header = 'Filename,Path,Title,Size (Bytes),Duration (Seconds),Artist,Album,Track'
  const rows = list.map((track) =>
    [
      escapeCsv(track.file.name),
      escapeCsv(track.path),
      escapeCsv(titleOf(track)),
      escapeCsv(track.file.size ?? ''),
      escapeCsv(seconds(track.duration) ?? ''),
      escapeCsv(track.tags?.artist ?? ''),
      escapeCsv(track.tags?.album ?? ''),
      escapeCsv(track.tags?.track ?? ''),
    ].join(','),
  )
  return [header, ...rows].join('\r\n') + '\r\n'
}

const generateJson = (list: PlaylistTrack[]) => {
  const playlistData = list.map((track) => ({
    filename: track.file.name,
    path: track.path,
    title: titleOf(track),
    size: track.file.size,
    duration: seconds(track.duration),
    artist: track.tags?.artist ?? null,
    album: track.tags?.album ?? null,
    track: track.tags?.track ?? null,
  }))
  return JSON.stringify(playlistData, null, 4)
}

/**
 * XSPF verlangt in <location> eine URI: Pfadsegmente werden prozentkodiert,
 * absolute Pfade werden zu file:-URIs, fertige URLs bleiben unverändert.
 * - CD1/01 Intro.mp3      → CD1/01%20Intro.mp3
 * - D:\Musik\Früh.mp3     → file:///D:/Musik/Fr%C3%BCh.mp3
 * - \\nas\Musik\a.mp3     → file://nas/Musik/a.mp3
 * - /home/ich/a b.mp3     → file:///home/ich/a%20b.mp3
 */
export function toXspfLocation(path: string): string {
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(path)) return path
  const encode = (segments: string[]) => segments.map(encodeURIComponent).join('/')
  const drive = path.match(/^([a-z]):[\\/](.*)$/i)
  if (drive) return `file:///${drive[1]}:/${encode(drive[2]!.split(/[\\/]/))}`
  if (/^\\\\[^\\]/.test(path)) return `file://${encode(path.slice(2).split('\\'))}`
  if (path.startsWith('/')) return `file://${encode(path.split('/'))}`
  return encode(path.split(/[\\/]/))
}

const generateXspf = (list: PlaylistTrack[], playlistName: string) => {
  const tracks = list
    .map((track) => {
      // Reihenfolge laut XSPF-Schema: location, title, creator, album, trackNum, duration.
      const lines = [
        `<location>${escapeXml(toXspfLocation(track.path))}</location>`,
        `<title>${escapeXml(titleOf(track))}</title>`,
      ]
      const { artist, album, track: trackNum } = track.tags ?? {}
      if (artist) lines.push(`<creator>${escapeXml(artist)}</creator>`)
      if (album) lines.push(`<album>${escapeXml(album)}</album>`)
      if (trackNum !== undefined) lines.push(`<trackNum>${trackNum}</trackNum>`)
      // <duration> in Millisekunden, optional.
      if (track.duration !== null) {
        lines.push(`<duration>${Math.round(track.duration * 1000)}</duration>`)
      }
      return `    <track>\n${lines.map((line) => `      ${line}\n`).join('')}    </track>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
  <playlist version="1" xmlns="http://xspf.org/ns/0/">
    <title>${escapeXml(playlistName)}</title>
    <trackList>
  ${tracks}
    </trackList>
  </playlist>`
}

/** Dateiendung ohne Punkt; YouTube-Kapitel und BBCode sind reiner Text. */
export const fileExtensionOf = (format: OutputFormat): string => {
  if (format === 'youtube' || format === 'bbcode') return 'txt'
  if (format === 'markdown') return 'md'
  return format
}

/** Kapitel-Zeitmarke für YouTube: „03:04“, ab einer Stunde „1:02:09“. */
export function formatChapterTime(seconds: number): string {
  const total = Math.max(0, Math.round(seconds))
  const h = Math.floor(total / 3600)
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0')
  const s = String(total % 60).padStart(2, '0')
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`
}

/**
 * YouTube-Kapitel für die Videobeschreibung eines Mixes: „00:00 Intro“, je Titel eine
 * Zeile mit seiner Startzeit. Unbekannte Dauern werden wie in der Dateiliste aus der
 * Dateigröße geschätzt, damit die folgenden Marken nicht alle verrutschen.
 */
const generateYoutubeChapters = (list: PlaylistTrack[]) => {
  let start = 0
  return (
    list
      .map((track) => {
        const line = `${formatChapterTime(start)} ${displayTitleOf(track)}`
        start += track.duration ?? estimateSeconds(track.file.name, track.file.size)
        return line
      })
      .join('\n') + '\n'
  )
}

/**
 * Laufzeit je Titel und gesamt für Markdown/BBCode. Unbekannte Dauern werden aus der
 * Dateigröße geschätzt und mit „≈“ markiert, wie die Gesamtdauer in der Dateiliste.
 */
const timedTracks = (list: PlaylistTrack[]) => {
  let total = 0
  let approximate = false
  const tracks = list.map((track) => {
    const estimated = track.duration === null
    const seconds = track.duration ?? estimateSeconds(track.file.name, track.file.size)
    total += seconds
    if (estimated) approximate = true
    return { title: displayTitleOf(track), time: `${estimated ? '≈ ' : ''}${formatClock(seconds)}` }
  })
  return { tracks, total: `${approximate ? '≈ ' : ''}${formatClock(total)}` }
}

/** Markdown-Sonderzeichen maskieren, damit Titel wie „*NSYNC“ nicht fett werden. */
const escapeMarkdown = (text: string) => text.replace(/[\\`*_~|[\]<>#]/g, '\\$&')

/**
 * Markdown für Discord, Reddit & Co.: fetter Name mit Gesamtdauer, darunter eine
 * nummerierte Liste mit Laufzeiten als Inline-Code.
 */
const generateMarkdown = (list: PlaylistTrack[], playlistName: string) => {
  const { tracks, total } = timedTracks(list)
  const lines = tracks.map((t, i) => `${i + 1}. ${escapeMarkdown(t.title)} \`${t.time}\``)
  const name = playlistName.trim()
  const head = name ? `**${escapeMarkdown(name)}** · ${total}` : total
  return `${head}\n\n${lines.join('\n')}\n`
}

/** BBCode für Foren (phpBB, vBulletin, XenForo …): nummerierte [list=1]. */
const generateBbcode = (list: PlaylistTrack[], playlistName: string) => {
  const { tracks, total } = timedTracks(list)
  const items = tracks.map((t) => `[*]${t.title} [i](${t.time})[/i]`)
  const name = playlistName.trim()
  const head = name ? `[b]${name}[/b] · ${total}` : total
  return `${head}\n[list=1]\n${items.join('\n')}\n[/list]\n`
}

/** Erzeugt den Playlist-Text im gewünschten Format. Leere Liste → ''. */
export function formatPlaylist(
  format: OutputFormat,
  list: PlaylistTrack[],
  playlistName: string,
): string {
  if (list.length === 0) return ''

  switch (format) {
    case 'm3u':
    // M3U8 is the UTF-8 encoded variant of M3U — identical content, but the
    // .m3u8 extension signals UTF-8 so titles with umlauts / non-Latin
    // characters are interpreted correctly by players.
    case 'm3u8':
      return generateM3u(list)
    case 'pls':
      return generatePls(list)
    case 'txt':
      return generateTxt(list)
    case 'cue':
      return generateCue(list, playlistName)
    case 'csv':
      return generateCsv(list)
    case 'json':
      return generateJson(list)
    case 'xspf':
      return generateXspf(list, playlistName)
    case 'youtube':
      return generateYoutubeChapters(list)
    case 'markdown':
      return generateMarkdown(list, playlistName)
    case 'bbcode':
      return generateBbcode(list, playlistName)
    default: {
      const unsupported: never = format
      return `Unsupported format: ${String(unsupported)}`
    }
  }
}
