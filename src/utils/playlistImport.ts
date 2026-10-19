import type { OutputFormat } from '../stores/playlist'

/** Playlist-Formate, die sich öffnen lassen. */
export type OpenableFormat = Extract<OutputFormat, 'm3u' | 'm3u8' | 'pls' | 'xspf'>

const PLAYLIST_EXTENSION = /\.(m3u8?|pls|xspf)$/i

/** true für .m3u, .m3u8, .pls und .xspf. */
export function isPlaylistFile(name: string): boolean {
  return PLAYLIST_EXTENSION.test(name)
}

/** Format aus der Dateiendung; null, wenn es keine Playlist ist. */
export function playlistFormatOf(name: string): OpenableFormat | null {
  const ext = name.match(PLAYLIST_EXTENSION)?.[1]?.toLowerCase()
  return ext === 'm3u' || ext === 'm3u8' || ext === 'pls' || ext === 'xspf' ? ext : null
}

/** Name ohne Endung, z. B. "roadtrip" aus "roadtrip.m3u". */
export function playlistNameOf(name: string): string {
  return name.replace(PLAYLIST_EXTENSION, '')
}

/**
 * Text einer Playlist-Datei: UTF-8, sonst Windows-1252 (ältere .m3u/.pls
 * aus Winamp & Co. sind nicht UTF-8).
 */
export async function readPlaylistText(file: Blob): Promise<string> {
  const bytes = await file.arrayBuffer()
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    return new TextDecoder('windows-1252').decode(bytes)
  }
}

const hasScheme = (entry: string) =>
  /^[a-z][a-z0-9+.-]*:/i.test(entry) && !/^[a-z]:[\\/]/i.test(entry)

const safeDecode = (text: string) => {
  try {
    return decodeURIComponent(text)
  } catch {
    return text
  }
}

/**
 * Dateiname eines Eintrags (letztes Pfadsegment). URIs (XSPF, file:, http:)
 * werden dekodiert; Abfrage und Anker fallen weg.
 */
export function entryFileName(entry: string, isUri: boolean): string {
  let path = entry.trim()
  if (isUri || hasScheme(path)) path = safeDecode(path.replace(/[?#].*$/, ''))
  return path.split(/[\\/]/).pop() ?? ''
}

/** Einträge in Reihenfolge, wie sie in der Datei stehen. */
function rawEntries(text: string, format: OpenableFormat): string[] {
  const content = text.replace(/^﻿/, '')
  switch (format) {
    case 'm3u':
    case 'm3u8':
      return content
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#'))
    case 'pls': {
      const files: [number, string][] = []
      for (const line of content.split(/\r?\n/)) {
        const match = line.trim().match(/^File(\d+)\s*=\s*(.+)$/i)
        if (match) files.push([Number(match[1]), match[2]!.trim()])
      }
      return files.sort((a, b) => a[0] - b[0]).map(([, path]) => path)
    }
    case 'xspf': {
      const doc = new DOMParser().parseFromString(content, 'application/xml')
      if (doc.querySelector('parsererror')) return []
      return Array.from(doc.querySelectorAll('track > location'))
        .map((node) => node.textContent?.trim() ?? '')
        .filter(Boolean)
    }
    default: {
      const unsupported: never = format
      return unsupported
    }
  }
}

/** Dateinamen der Einträge einer Playlist, in ihrer Reihenfolge. */
export function parsePlaylistEntries(text: string, format: OpenableFormat): string[] {
  return rawEntries(text, format)
    .map((entry) => entryFileName(entry, format === 'xspf'))
    .filter(Boolean)
}
