import type { OutputFormat } from '../stores/playlist'

/**
 * Ein Eintrag der Playlist: Datei, Verweis für den Export (Dateiname, relativer Pfad
 * oder mit Basis, siehe trackPath.ts) und gemessene Dauer in Sekunden (null = unbekannt).
 */
export interface PlaylistTrack {
  file: File
  path: string
  duration: number | null
}

const titleOf = (file: File) => file.name.replace(/\.[^/.]+$/, '')

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
  list.forEach(({ file, path, duration }) => {
    output += `#EXTINF:${seconds(duration) ?? -1},${titleOf(file)}\n${path}\n`
  })
  return output
}

const generatePls = (list: PlaylistTrack[]) => {
  let output = '[playlist]\n'
  list.forEach(({ file, path, duration }, index) => {
    const n = index + 1
    output += `File${n}=${path}\n`
    output += `Title${n}=${titleOf(file)}\n`
    output += `Length${n}=${seconds(duration) ?? -1}\n`
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
  list.forEach(({ file, path }, index) => {
    const title = titleOf(file).replace(/"/g, "'")
    const trackNum = String(index + 1).padStart(2, '0')
    output += `FILE "${path.replace(/"/g, "'")}" ${cueFileType(file.name)}\n`
    output += `  TRACK ${trackNum} AUDIO\n`
    output += `    TITLE "${title}"\n`
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
  const header = 'Filename,Path,Title,Size (Bytes),Duration (Seconds)'
  const rows = list.map(({ file, path, duration }) =>
    [
      escapeCsv(file.name),
      escapeCsv(path),
      escapeCsv(titleOf(file)),
      escapeCsv(file.size ?? ''),
      escapeCsv(seconds(duration) ?? ''),
    ].join(','),
  )
  return [header, ...rows].join('\r\n') + '\r\n'
}

const generateJson = (list: PlaylistTrack[]) => {
  const playlistData = list.map(({ file, path, duration }) => ({
    filename: file.name,
    path,
    title: titleOf(file),
    size: file.size,
    duration: seconds(duration),
  }))
  return JSON.stringify(playlistData, null, 4)
}

const generateXspf = (list: PlaylistTrack[], playlistName: string) => {
  const tracks = list
    .map(({ file, path, duration }) => {
      const title = escapeXml(titleOf(file))
      const location = escapeXml(path)
      // XSPF: <duration> in Millisekunden, optional.
      const durationTag =
        duration === null ? '' : `\n      <duration>${Math.round(duration * 1000)}</duration>`
      return `    <track>\n      <location>${location}</location>\n      <title>${title}</title>${durationTag}\n    </track>`
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
    default: {
      const unsupported: never = format
      return `Unsupported format: ${String(unsupported)}`
    }
  }
}
