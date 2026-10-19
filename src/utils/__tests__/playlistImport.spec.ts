import { describe, expect, it } from 'vitest'
import {
  entryFileName,
  isPlaylistFile,
  parsePlaylistEntries,
  playlistFormatOf,
  playlistNameOf,
  readPlaylistText,
} from '../playlistImport'
import { formatPlaylist, type PlaylistTrack } from '../playlistFormats'

describe('Dateiname und Format', () => {
  it('erkennt Playlists an der Endung', () => {
    expect(isPlaylistFile('Mix.M3U8')).toBe(true)
    expect(isPlaylistFile('a.pls')).toBe(true)
    expect(isPlaylistFile('a.mp3')).toBe(false)
    expect(playlistFormatOf('Mix.M3U8')).toBe('m3u8')
    expect(playlistFormatOf('a.xspf')).toBe('xspf')
    expect(playlistFormatOf('a.json')).toBeNull()
    expect(playlistNameOf('roadtrip.m3u')).toBe('roadtrip')
  })

  it('nimmt das letzte Pfadsegment und dekodiert URIs', () => {
    expect(entryFileName('D:\\Musik\\CD 1\\a b.mp3', false)).toBe('a b.mp3')
    expect(entryFileName('CD1/01 Intro.mp3', false)).toBe('01 Intro.mp3')
    // Ohne URI-Kontext bleibt % wörtlich (Dateinamen dürfen % enthalten).
    expect(entryFileName('100%25.mp3', false)).toBe('100%25.mp3')
    expect(entryFileName('Fr%C3%BCh.mp3', true)).toBe('Früh.mp3')
    expect(entryFileName('file:///D:/Musik/a%20b.mp3', false)).toBe('a b.mp3')
    expect(entryFileName('https://x.de/m/a%20b.mp3?token=1', false)).toBe('a b.mp3')
    expect(entryFileName('kaputt%E0.mp3', true)).toBe('kaputt%E0.mp3')
  })
})

describe('parsePlaylistEntries', () => {
  it('M3U: Zeilen ohne # und ohne Leerzeilen, BOM und CRLF egal', () => {
    const text = '\ufeff#EXTM3U\r\n#EXTINF:12,A\r\nMusik/a.mp3\r\n\r\n  b.mp3  \r\n'
    expect(parsePlaylistEntries(text, 'm3u')).toEqual(['a.mp3', 'b.mp3'])
  })

  it('PLS: sortiert nach der Nummer hinter File', () => {
    const text = '[playlist]\nFile2=b.mp3\nTitle2=B\nFile1=C:\\x\\a.mp3\nNumberOfEntries=2\n'
    expect(parsePlaylistEntries(text, 'pls')).toEqual(['a.mp3', 'b.mp3'])
  })

  it('XSPF: location der Tracks, URI-dekodiert; kaputtes XML → leer', () => {
    const text = `<?xml version="1.0"?>
      <playlist version="1" xmlns="http://xspf.org/ns/0/">
        <location>https://ignorieren.de/liste.xspf</location>
        <trackList>
          <track><location>CD1/01%20Intro.mp3</location></track>
          <track><location>file:///D:/M/Fr%C3%BCh.mp3</location></track>
        </trackList>
      </playlist>`
    expect(parsePlaylistEntries(text, 'xspf')).toEqual(['01 Intro.mp3', 'Früh.mp3'])
    expect(parsePlaylistEntries('<playlist>', 'xspf')).toEqual([])
  })

  it.each(['m3u', 'pls', 'xspf'] as const)('liest den eigenen %s-Export wieder ein', (format) => {
    const tracks: PlaylistTrack[] = ['b & c.mp3', 'Früh.flac'].map((name) => ({
      file: new File(['x'], name),
      path: `CD 1/${name}`,
      duration: 60,
      tags: null,
    }))
    expect(parsePlaylistEntries(formatPlaylist(format, tracks, 'x'), format)).toEqual([
      'b & c.mp3',
      'Früh.flac',
    ])
  })
})

describe('readPlaylistText', () => {
  it('liest UTF-8 und fällt bei ungültigem UTF-8 auf Windows-1252 zurück', async () => {
    expect(await readPlaylistText(new Blob(['Früh.mp3']))).toBe('Früh.mp3')
    const latin1 = new Uint8Array([0x46, 0x72, 0xfc, 0x68]) // "Früh" in Windows-1252
    expect(await readPlaylistText(new Blob([latin1]))).toBe('Früh')
  })
})
