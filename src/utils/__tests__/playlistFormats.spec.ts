import { describe, expect, it } from 'vitest'
import {
  fileExtensionOf,
  formatChapterTime,
  formatPlaylist,
  toXspfLocation,
  type PlaylistTrack,
} from '../playlistFormats'
import { estimateSeconds, formatClock } from '../../components/ui/fileListFormat'
import type { AudioTags } from '../audioTags'

const track = (
  name: string,
  duration: number | null,
  size = 10,
  path = name,
  tags: AudioTags | null = null,
): PlaylistTrack => ({
  file: new File(['x'.repeat(size)], name),
  path,
  duration,
  tags,
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

  it('csv ergänzt Path und Duration (Seconds), Dauer leer wenn unbekannt', () => {
    expect(formatPlaylist('csv', LIST, 'x')).toBe(
      'Filename,Path,Title,Size (Bytes),Duration (Seconds),Artist,Album,Track\r\n' +
        'Rock & Roll.mp3,Rock & Roll.mp3,Rock & Roll,10,221,,,\r\n' +
        'unbekannt.flac,unbekannt.flac,unbekannt,3,,,,\r\n',
    )
  })

  it('json ergänzt duration in Sekunden, null wenn unbekannt', () => {
    expect(JSON.parse(formatPlaylist('json', LIST, 'x'))).toEqual([
      {
        filename: 'Rock & Roll.mp3',
        path: 'Rock & Roll.mp3',
        title: 'Rock & Roll',
        size: 10,
        duration: 221,
        artist: null,
        album: null,
        track: null,
      },
      {
        filename: 'unbekannt.flac',
        path: 'unbekannt.flac',
        title: 'unbekannt',
        size: 3,
        duration: null,
        artist: null,
        album: null,
        track: null,
      },
    ])
  })

  it('xspf schreibt <duration> in Millisekunden und lässt sie weg, wenn unbekannt', () => {
    const xml = formatPlaylist('xspf', LIST, 'A & B')
    expect(xml).toContain('<title>A &amp; B</title>')
    expect(xml).toContain(
      '<location>Rock%20%26%20Roll.mp3</location>\n      <title>Rock &amp; Roll</title>\n      <duration>221400</duration>\n    </track>',
    )
    expect(xml).toContain(
      '<location>unbekannt.flac</location>\n      <title>unbekannt</title>\n    </track>',
    )
    expect(xml.match(/<duration>/g)).toHaveLength(1)
    expect(
      new DOMParser().parseFromString(xml, 'application/xml').querySelector('parsererror'),
    ).toBeNull()
  })

  describe('mit Pfad statt Dateiname', () => {
    const withPath = [track('01 Intro.mp3', 60, 1, 'CD1/01 Intro.mp3')]

    it.each([
      ['m3u', '\nCD1/01 Intro.mp3\n'],
      ['pls', 'File1=CD1/01 Intro.mp3\n'],
      ['txt', 'CD1/01 Intro.mp3\n'],
      ['cue', 'FILE "CD1/01 Intro.mp3" MP3\n'],
      ['xspf', '<location>CD1/01%20Intro.mp3</location>'],
      ['csv', '01 Intro.mp3,CD1/01 Intro.mp3,01 Intro,1,60,,,'],
      ['json', '"path": "CD1/01 Intro.mp3"'],
    ] as const)('%s verweist auf den Pfad', (format, expected) => {
      expect(formatPlaylist(format, withPath, 'x')).toContain(expected)
    })

    it('behält den Titel aus dem Dateinamen', () => {
      expect(formatPlaylist('m3u', withPath, 'x')).toContain('#EXTINF:60,01 Intro\n')
    })
  })

  describe('mit Tags', () => {
    const tagged = [
      track('01.mp3', 200, 1, '01.mp3', {
        title: 'Hyperballad',
        artist: 'Björk',
        album: 'Post',
        track: 4,
      }),
      track('02.mp3', null, 1, '02.mp3', { title: 'Nur Titel' }),
      track('03.mp3', null, 1, '03.mp3', { artist: 'Nur Interpret' }),
    ]

    it('m3u und pls schreiben „Interpret - Titel“, sonst Tag-Titel oder Dateiname', () => {
      expect(formatPlaylist('m3u', tagged, 'x')).toBe(
        '#EXTM3U\n#EXTINF:200,Björk - Hyperballad\n01.mp3\n' +
          '#EXTINF:-1,Nur Titel\n02.mp3\n#EXTINF:-1,03\n03.mp3\n',
      )
      expect(formatPlaylist('pls', tagged, 'x')).toContain('Title1=Björk - Hyperballad\n')
    })

    it('cue schreibt TITLE und PERFORMER', () => {
      expect(formatPlaylist('cue', tagged.slice(0, 1), 'x')).toContain(
        '    TITLE "Hyperballad"\n    PERFORMER "Björk"\n    INDEX 01 00:00:00\n',
      )
    })

    it('xspf schreibt creator, album und trackNum in Schema-Reihenfolge', () => {
      const xml = formatPlaylist('xspf', tagged.slice(0, 1), 'x')
      expect(xml).toContain(
        '<title>Hyperballad</title>\n      <creator>Björk</creator>\n' +
          '      <album>Post</album>\n      <trackNum>4</trackNum>\n      <duration>200000</duration>',
      )
    })

    it('csv und json ergänzen Interpret, Album und Nummer', () => {
      expect(formatPlaylist('csv', tagged.slice(0, 1), 'x')).toContain(
        '01.mp3,01.mp3,Hyperballad,1,200,Björk,Post,4\r\n',
      )
      expect(JSON.parse(formatPlaylist('json', tagged.slice(0, 1), 'x'))).toEqual([
        {
          filename: '01.mp3',
          path: '01.mp3',
          title: 'Hyperballad',
          size: 1,
          duration: 200,
          artist: 'Björk',
          album: 'Post',
          track: 4,
        },
      ])
    })
  })
})

describe('YouTube-Kapitel', () => {
  it('schreibt Startzeiten ab 00:00 mit Interpret - Titel', () => {
    const list = [
      track('intro.mp3', 184.4),
      track('b.mp3', 200.6, 10, 'b.mp3', { artist: 'Band', title: 'Mittag' }),
      track('c.mp3', 61),
    ]
    expect(formatPlaylist('youtube', list, 'x')).toBe('00:00 intro\n03:04 Band - Mittag\n06:25 c\n')
  })

  it('wechselt ab einer Stunde auf H:MM:SS', () => {
    const list = [track('a.mp3', 3599.6), track('b.mp3', 3600), track('c.mp3', 10)]
    expect(formatPlaylist('youtube', list, 'x')).toBe('00:00 a\n1:00:00 b\n2:00:00 c\n')
  })

  it('schätzt unbekannte Dauern aus der Dateigröße', () => {
    const list = [track('a.mp3', null, 4_000_000), track('b.mp3', 10)]
    const start = formatChapterTime(estimateSeconds('a.mp3', 4_000_000))
    expect(formatPlaylist('youtube', list, 'x')).toBe(`00:00 a\n${start} b\n`)
  })

  it('formatiert Zeitmarken und nutzt .txt als Endung', () => {
    expect(formatChapterTime(0)).toBe('00:00')
    expect(formatChapterTime(59.5)).toBe('01:00')
    expect(formatChapterTime(3723)).toBe('1:02:03')
    expect(fileExtensionOf('youtube')).toBe('txt')
    expect(fileExtensionOf('m3u8')).toBe('m3u8')
  })
})

describe('Markdown und BBCode', () => {
  const LIST_TIMED = [
    track('intro.mp3', 184.4),
    track('b.mp3', 3600, 10, 'b.mp3', { artist: '*NSYNC', title: 'Bye_Bye [Live]' }),
  ]

  it('Markdown: fetter Name mit Gesamtdauer, nummerierte Liste, Sonderzeichen maskiert', () => {
    expect(formatPlaylist('markdown', LIST_TIMED, 'Sommer *Mix*')).toBe(
      '**Sommer \\*Mix\\*** · 1:03:04\n\n1. intro `3:04`\n2. \\*NSYNC - Bye\\_Bye \\[Live\\] `1:00:00`\n',
    )
  })

  it('BBCode: [list=1] mit kursiver Laufzeit', () => {
    expect(formatPlaylist('bbcode', LIST_TIMED, 'Sommer Mix')).toBe(
      '[b]Sommer Mix[/b] · 1:03:04\n[list=1]\n[*]intro [i](3:04)[/i]\n[*]*NSYNC - Bye_Bye [Live] [i](1:00:00)[/i]\n[/list]\n',
    )
  })

  it('markiert geschätzte Dauern mit ≈ und lässt einen leeren Namen weg', () => {
    const list = [track('a.mp3', null, 4_000_000), track('b.mp3', 10)]
    const est = estimateSeconds('a.mp3', 4_000_000)
    const md = formatPlaylist('markdown', list, '  ')
    expect(md.split('\n')[0]).toBe(`≈ ${formatClock(est + 10)}`)
    expect(md).toContain(`1. a \`≈ ${formatClock(est)}\``)
    expect(md).toContain('2. b `0:10`')
    expect(formatPlaylist('bbcode', list, '').startsWith('≈ ')).toBe(true)
  })

  it('nutzt .md bzw. .txt als Endung', () => {
    expect(fileExtensionOf('markdown')).toBe('md')
    expect(fileExtensionOf('bbcode')).toBe('txt')
  })
})

describe('toXspfLocation', () => {
  it.each([
    ['Früh & spät.mp3', 'Fr%C3%BCh%20%26%20sp%C3%A4t.mp3'],
    ['CD1/01 Intro.mp3', 'CD1/01%20Intro.mp3'],
    ['../Musik/#1.mp3', '../Musik/%231.mp3'],
    ['D:\\Musik\\CD 1\\a.mp3', 'file:///D:/Musik/CD%201/a.mp3'],
    ['c:/Musik/a.mp3', 'file:///c:/Musik/a.mp3'],
    ['\\\\nas\\Musik\\a b.mp3', 'file://nas/Musik/a%20b.mp3'],
    ['/home/ich/a b.mp3', 'file:///home/ich/a%20b.mp3'],
    ['https://example.com/musik/a%20b.mp3', 'https://example.com/musik/a%20b.mp3'],
  ])('%s → %s', (path, uri) => {
    expect(toXspfLocation(path)).toBe(uri)
  })
})
