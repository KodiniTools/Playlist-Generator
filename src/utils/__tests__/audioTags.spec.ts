import { describe, expect, it } from 'vitest'
import {
  compareByArtist,
  parseId3v1,
  parseId3v2,
  parseRiffInfo,
  parseVorbisComment,
  readAudioTags,
} from '../audioTags'

const utf8 = (text: string) => new TextEncoder().encode(text)
const latin1 = (text: string) => Uint8Array.from(text, (c) => c.charCodeAt(0))
const concat = (...parts: ArrayLike<number>[]) => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0))
  let offset = 0
  for (const part of parts) {
    out.set(part, offset)
    offset += part.length
  }
  return out
}
const be32 = (n: number) => [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff]
const le32 = (n: number) => [n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff]
const synchsafe = (n: number) => [(n >> 21) & 0x7f, (n >> 14) & 0x7f, (n >> 7) & 0x7f, n & 0x7f]
const utf16le = (text: string) => {
  const out: number[] = [0xff, 0xfe]
  for (const c of text) out.push(c.charCodeAt(0) & 0xff, c.charCodeAt(0) >> 8)
  return out
}

/** ID3v2-Tag aus [Frame-Id, Kodierung, Text-Bytes]. */
function id3v2(version: 2 | 3 | 4, frames: [string, number, ArrayLike<number>][], padding = 0) {
  const body = concat(
    ...frames.map(([id, encoding, text]) => {
      const data = concat([encoding], text)
      if (version === 2) {
        const n = data.length
        return concat(latin1(id), [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff], data)
      }
      const size = version === 4 ? synchsafe(data.length) : be32(data.length)
      return concat(latin1(id), size, [0, 0], data)
    }),
    new Uint8Array(padding),
  )
  return concat(latin1('ID3'), [version, 0, 0], synchsafe(body.length), body)
}

function id3v1(title: string, artist: string, album: string, track?: number) {
  const out = new Uint8Array(128)
  out.set(latin1('TAG'), 0)
  out.set(latin1(title).subarray(0, 30), 3)
  out.set(latin1(artist).subarray(0, 30), 33)
  out.set(latin1(album).subarray(0, 30), 63)
  if (track !== undefined) out[126] = track
  return out
}

function vorbisComment(entries: string[]) {
  const vendor = utf8('reference libFLAC')
  return concat(
    le32(vendor.length),
    vendor,
    le32(entries.length),
    ...entries.map((e) => concat(le32(utf8(e).length), utf8(e))),
  )
}

function flac(entries: string[]) {
  const streamInfo = new Uint8Array(34)
  const comment = vorbisComment(entries)
  const n = comment.length
  return concat(
    latin1('fLaC'),
    [0x00, 0, 0, 34],
    streamInfo,
    [0x80 | 4, (n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff],
    comment,
    new Uint8Array(16), // Audio-Frames
  )
}

function riffChunk(id: string, data: Uint8Array) {
  return concat(latin1(id), le32(data.length), data, data.length % 2 ? [0] : [])
}

function wav(chunks: Uint8Array[]) {
  const fmt = riffChunk('fmt ', new Uint8Array(16))
  const data = riffChunk('data', new Uint8Array(8))
  const body = concat(latin1('WAVE'), fmt, data, ...chunks)
  return concat(latin1('RIFF'), le32(body.length), body)
}

const infoList = (fields: [string, string][]) =>
  riffChunk(
    'LIST',
    concat(latin1('INFO'), ...fields.map(([id, text]) => riffChunk(id, utf8(`${text}\0`)))),
  )

const file = (bytes: Uint8Array, name = 'x.mp3') => new File([new Uint8Array(bytes)], name)

describe('parseId3v2', () => {
  it('liest ID3v2.3 mit Latin-1 und UTF-16', () => {
    const tag = id3v2(3, [
      ['TIT2', 1, utf16le('Café del Mar')],
      ['TPE1', 0, latin1('Energy 52')],
      ['TALB', 0, latin1('Trance Classics')],
      ['TRCK', 0, latin1('03/12')],
      ['TPOS', 0, latin1('2/2')],
    ])
    expect(parseId3v2(tag)).toEqual({
      title: 'Café del Mar',
      artist: 'Energy 52',
      album: 'Trance Classics',
      track: 3,
      disc: 2,
    })
  })

  it('liest ID3v2.4 mit UTF-8 und synchsafe Frame-Größen, nimmt den ersten Wert', () => {
    const long = 'Ü'.repeat(100) // > 127 Bytes, prüft die synchsafe Größe
    const tag = id3v2(
      4,
      [
        ['TIT2', 3, utf8(long)],
        ['TPE1', 3, utf8('Björk\0Thom Yorke')],
      ],
      32,
    )
    expect(parseId3v2(tag)).toEqual({ title: long, artist: 'Björk' })
  })

  it('liest ID3v2.2 mit dreistelligen Frame-Ids', () => {
    const tag = id3v2(2, [
      ['TT2', 0, latin1('Old Song')],
      ['TP1', 0, latin1('Old Band')],
      ['TRK', 0, latin1('7')],
    ])
    expect(parseId3v2(tag)).toEqual({ title: 'Old Song', artist: 'Old Band', track: 7 })
  })

  it('nimmt den Album-Interpreten, wenn TPE1 fehlt', () => {
    const tag = id3v2(3, [['TPE2', 0, latin1('Various Artists')]])
    expect(parseId3v2(tag)).toEqual({ artist: 'Various Artists' })
  })

  it('ignoriert leere Frames und liefert null ohne Treffer', () => {
    expect(parseId3v2(id3v2(3, [['TIT2', 0, latin1('  ')]]))).toBeNull()
    expect(parseId3v2(id3v2(3, [['COMM', 0, latin1('egal')]]))).toBeNull()
    expect(parseId3v2(latin1('nicht id3'))).toBeNull()
  })

  it('bricht bei abgeschnittenem Tag ab, ohne zu werfen', () => {
    const tag = id3v2(3, [['TIT2', 0, latin1('Ganz')]])
    expect(() => parseId3v2(tag.subarray(0, tag.length - 2))).not.toThrow()
  })
})

describe('parseId3v1', () => {
  it('liest Titel, Interpret, Album und die v1.1-Titelnummer', () => {
    expect(parseId3v1(id3v1('Song', 'Band', 'Album', 4))).toEqual({
      title: 'Song',
      artist: 'Band',
      album: 'Album',
      track: 4,
    })
  })

  it('liefert null ohne Kennung', () => {
    expect(parseId3v1(new Uint8Array(128))).toBeNull()
  })
})

describe('parseVorbisComment', () => {
  it('liest Felder ohne Rücksicht auf Groß-/Kleinschreibung', () => {
    expect(
      parseVorbisComment(
        vorbisComment([
          'title=Hyperballad',
          'ARTIST=Björk',
          'Album=Post',
          'TRACKNUMBER=4',
          'DISCNUMBER=1',
        ]),
      ),
    ).toEqual({ title: 'Hyperballad', artist: 'Björk', album: 'Post', track: 4, disc: 1 })
  })

  it('liefert null für zu kurze Blöcke', () => {
    expect(parseVorbisComment(new Uint8Array(3))).toBeNull()
  })
})

describe('parseRiffInfo', () => {
  it('liest INAM, IART, IPRD und ITRK', () => {
    const list = infoList([
      ['INAM', 'Intro'],
      ['IART', 'Band'],
      ['IPRD', 'Live'],
      ['ITRK', '1'],
    ])
    // LIST-Header (8 Bytes) und "INFO" überspringen.
    expect(parseRiffInfo(list.subarray(12))).toEqual({
      title: 'Intro',
      artist: 'Band',
      album: 'Live',
      track: 1,
    })
  })
})

describe('readAudioTags', () => {
  it('MP3 mit ID3v2 und ID3v1: v2 gewinnt, v1 ergänzt fehlende Felder', async () => {
    const bytes = concat(
      id3v2(3, [['TIT2', 0, latin1('Neu')]]),
      new Uint8Array(64),
      id3v1('Alt', 'Band', 'Album'),
    )
    expect(await readAudioTags(file(bytes))).toEqual({
      title: 'Neu',
      artist: 'Band',
      album: 'Album',
    })
  })

  it('MP3 nur mit ID3v1', async () => {
    const bytes = concat(new Uint8Array(64), id3v1('Song', 'Band', ''))
    expect(await readAudioTags(file(bytes))).toEqual({ title: 'Song', artist: 'Band' })
  })

  it('FLAC mit VORBIS_COMMENT', async () => {
    expect(await readAudioTags(file(flac(['TITLE=Song', 'ARTIST=Band']), 'a.flac'))).toEqual({
      title: 'Song',
      artist: 'Band',
    })
  })

  it('FLAC mit vorangestelltem ID3v2', async () => {
    const bytes = concat(id3v2(3, [['TALB', 0, latin1('Album')]]), flac(['TITLE=Song']))
    expect(await readAudioTags(file(bytes, 'a.flac'))).toEqual({ title: 'Song', album: 'Album' })
  })

  it('WAV mit LIST/INFO', async () => {
    const bytes = wav([
      infoList([
        ['INAM', 'Song'],
        ['IART', 'Band'],
      ]),
    ])
    expect(await readAudioTags(file(bytes, 'a.wav'))).toEqual({ title: 'Song', artist: 'Band' })
  })

  it('WAV mit id3-Chunk, INFO ergänzt', async () => {
    const bytes = wav([
      infoList([['IPRD', 'Album']]),
      riffChunk('id3 ', id3v2(4, [['TIT2', 3, utf8('Song')]])),
    ])
    expect(await readAudioTags(file(bytes, 'a.wav'))).toEqual({ title: 'Song', album: 'Album' })
  })

  it('liefert null für Dateien ohne Tags', async () => {
    expect(await readAudioTags(file(wav([]), 'a.wav'))).toBeNull()
    expect(await readAudioTags(file(new Uint8Array(10)))).toBeNull()
    expect(await readAudioTags(file(new Uint8Array(0)))).toBeNull()
  })
})

describe('compareByArtist', () => {
  const entry = (name: string, tags: Parameters<typeof compareByArtist>[0]['tags']) => ({
    name,
    tags,
  })

  it('sortiert nach Interpret, Album, CD, Nummer; ohne Tags zuletzt', () => {
    const list = [
      entry('ohne.mp3', null),
      entry('b2.mp3', { artist: 'Beta', album: 'X', disc: 2, track: 1 }),
      entry('b1.mp3', { artist: 'beta', album: 'X', disc: 1, track: 10 }),
      entry('b0.mp3', { artist: 'Beta', album: 'X', disc: 1, track: 2 }),
      entry('a.mp3', { artist: 'Alpha', album: 'Z' }),
      entry('nur-titel.mp3', { title: 'T' }),
    ]
    expect(list.sort(compareByArtist).map((e) => e.name)).toEqual([
      'a.mp3',
      'b0.mp3',
      'b1.mp3',
      'b2.mp3',
      'nur-titel.mp3',
      'ohne.mp3',
    ])
  })
})
