import { describe, expect, it } from 'vitest'
import { formatPlaylist, type PlaylistTrack } from '../playlistFormats'

const track = (name: string, duration: number | null, size = 10): PlaylistTrack => ({
  file: new File(['x'.repeat(size)], name),
  duration,
})

const LIST = [track('Rock & Roll.mp3', 221.4), track('unbekannt.flac', null, 3)]

describe('formatPlaylist', () => {
  it('liefert für eine leere Liste nichts', () => {
    expect(formatPlaylist('m3u', [], 'x')).toBe('')
  })

  it.each(['m3u', 'm3u8'] as const)('%s schreibt Sekunden in #EXTINF, -1 wenn unbekannt', (f) => {
    expect(formatPlaylist(f, LIST, 'x')).toBe(
      '#EXTM3U\n#EXTINF:221,Rock & Roll\nRock & Roll.mp3\n#EXTINF:-1,unbekannt\nunbekannt.flac\n',
    )
  })

  it('pls schreibt Length in Sekunden, -1 wenn unbekannt', () => {
    expect(formatPlaylist('pls', LIST, 'x')).toBe(
      [
        '[playlist]',
        'File1=Rock & Roll.mp3',
        'Title1=Rock & Roll',
        'Length1=221',
        'File2=unbekannt.flac',
        'Title2=unbekannt',
        'Length2=-1',
        'NumberOfEntries=2',
        'Version=2',
        '',
      ].join('\n'),
    )
  })

  it('txt listet nur Dateinamen', () => {
    expect(formatPlaylist('txt', LIST, 'x')).toBe('Rock & Roll.mp3\nunbekannt.flac\n')
  })

  it('cue bleibt unverändert (jede Datei startet bei 00:00:00)', () => {
    expect(formatPlaylist('cue', LIST, 'Mein "Mix"')).toBe(
      [
        `TITLE "Mein 'Mix'"`,
        'FILE "Rock & Roll.mp3" MP3',
        '  TRACK 01 AUDIO',
        '    TITLE "Rock & Roll"',
        '    INDEX 01 00:00:00',
        'FILE "unbekannt.flac" WAVE',
        '  TRACK 02 AUDIO',
        '    TITLE "unbekannt"',
        '    INDEX 01 00:00:00',
        '',
      ].join('\n'),
    )
  })

  it('csv ergänzt die Spalte Duration (Seconds), leer wenn unbekannt', () => {
    expect(formatPlaylist('csv', LIST, 'x')).toBe(
      'Filename,Title,Size (Bytes),Duration (Seconds)\r\n' +
        'Rock & Roll.mp3,Rock & Roll,10,221\r\n' +
        'unbekannt.flac,unbekannt,3,\r\n',
    )
  })

  it('json ergänzt duration in Sekunden, null wenn unbekannt', () => {
    expect(JSON.parse(formatPlaylist('json', LIST, 'x'))).toEqual([
      { filename: 'Rock & Roll.mp3', title: 'Rock & Roll', size: 10, duration: 221 },
      { filename: 'unbekannt.flac', title: 'unbekannt', size: 3, duration: null },
    ])
  })

  it('xspf schreibt <duration> in Millisekunden und lässt sie weg, wenn unbekannt', () => {
    const xml = formatPlaylist('xspf', LIST, 'A & B')
    expect(xml).toContain('<title>A &amp; B</title>')
    expect(xml).toContain(
      '<location>Rock &amp; Roll.mp3</location>\n      <title>Rock &amp; Roll</title>\n      <duration>221400</duration>\n    </track>',
    )
    expect(xml).toContain(
      '<location>unbekannt.flac</location>\n      <title>unbekannt</title>\n    </track>',
    )
    expect(xml.match(/<duration>/g)).toHaveLength(1)
    expect(
      new DOMParser().parseFromString(xml, 'application/xml').querySelector('parsererror'),
    ).toBeNull()
  })
})
