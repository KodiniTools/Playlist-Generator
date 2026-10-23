import { describe, expect, it } from 'vitest'
import {
  MAX_ZIP_ENTRIES,
  ZipError,
  extractAudioFromZip,
  isZipFile,
  sanitizeZipPath,
} from '../zipArchive'

interface TestEntry {
  name: string | Uint8Array
  data?: string | Uint8Array
  /** 0 = stored, 8 = deflate (Standard). */
  method?: number
  flags?: number
  /** Überschreibt die angegebene entpackte Größe (Zip-Bomben, defekte Archive). */
  size?: number
}

const encoder = new TextEncoder()
const bytesOf = (value: string | Uint8Array) =>
  typeof value === 'string' ? encoder.encode(value) : value

async function deflateRaw(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data as BlobPart])
    .stream()
    .pipeThrough(new CompressionStream('deflate-raw'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

/** Baut ein minimales ZIP (ohne CRC, die Implementierung prüft sie nicht). */
async function buildZip(entries: TestEntry[]): Promise<Blob> {
  const locals: Uint8Array[] = []
  const centrals: Uint8Array[] = []
  let offset = 0
  for (const entry of entries) {
    const name = bytesOf(entry.name)
    const raw = bytesOf(entry.data ?? '')
    const method = entry.method ?? 8
    const payload = method === 8 ? await deflateRaw(raw) : raw
    const size = entry.size ?? raw.byteLength
    // 2024-05-17 12:30:10
    const time = (12 << 11) | (30 << 5) | 5
    const date = ((2024 - 1980) << 9) | (5 << 5) | 17

    const local = new Uint8Array(30 + name.length + payload.length)
    const lv = new DataView(local.buffer)
    lv.setUint32(0, 0x04034b50, true)
    lv.setUint16(6, entry.flags ?? 0, true)
    lv.setUint16(8, method, true)
    lv.setUint16(10, time, true)
    lv.setUint16(12, date, true)
    lv.setUint32(18, payload.length, true)
    lv.setUint32(22, size, true)
    lv.setUint16(26, name.length, true)
    local.set(name, 30)
    local.set(payload, 30 + name.length)
    locals.push(local)

    const central = new Uint8Array(46 + name.length)
    const cv = new DataView(central.buffer)
    cv.setUint32(0, 0x02014b50, true)
    cv.setUint16(8, entry.flags ?? 0, true)
    cv.setUint16(10, method, true)
    cv.setUint16(12, time, true)
    cv.setUint16(14, date, true)
    cv.setUint32(20, payload.length, true)
    cv.setUint32(24, size, true)
    cv.setUint16(28, name.length, true)
    cv.setUint32(42, offset, true)
    central.set(name, 46)
    centrals.push(central)
    offset += local.length
  }
  const cdSize = centrals.reduce((n, c) => n + c.length, 0)
  const eocd = new Uint8Array(22)
  const ev = new DataView(eocd.buffer)
  ev.setUint32(0, 0x06054b50, true)
  ev.setUint16(8, entries.length, true)
  ev.setUint16(10, entries.length, true)
  ev.setUint32(12, cdSize, true)
  ev.setUint32(16, offset, true)
  return new Blob([...locals, ...centrals, eocd] as BlobPart[])
}

const textOf = (file: File) => file.arrayBuffer().then((b) => new TextDecoder().decode(b))

describe('isZipFile', () => {
  it('erkennt .zip unabhängig von Groß-/Kleinschreibung', () => {
    expect(isZipFile('album.zip')).toBe(true)
    expect(isZipFile('ALBUM.ZIP')).toBe(true)
    expect(isZipFile('album.zip.mp3')).toBe(false)
    expect(isZipFile('zip')).toBe(false)
  })
})

describe('sanitizeZipPath', () => {
  it('entfernt .., ., führende Slashes und Backslashes', () => {
    expect(sanitizeZipPath('/../../etc/passwd')).toBe('etc/passwd')
    expect(sanitizeZipPath('Album\\CD1\\.\\01.mp3')).toBe('Album/CD1/01.mp3')
    expect(sanitizeZipPath('a//b/../c.mp3')).toBe('a/b/c.mp3')
  })
})

describe('extractAudioFromZip', () => {
  it('entpackt MP3, WAV und FLAC (deflate und stored) mit Pfad und Datum', async () => {
    const zip = await buildZip([
      { name: 'Album/', data: '' },
      { name: 'Album/01 Intro.mp3', data: 'mp3-daten'.repeat(50) },
      { name: 'Album/02.WAV', data: 'wav', method: 0 },
      { name: 'Album/CD2/03.flac', data: 'flac-daten' },
    ])
    const { files, paths, skipped } = await extractAudioFromZip(zip)

    expect(files.map((f) => f.name)).toEqual(['01 Intro.mp3', '02.WAV', '03.flac'])
    expect(files.map((f) => paths.get(f))).toEqual([
      'Album/01 Intro.mp3',
      'Album/02.WAV',
      'Album/CD2/03.flac',
    ])
    expect(await textOf(files[0]!)).toBe('mp3-daten'.repeat(50))
    expect(await textOf(files[1]!)).toBe('wav')
    expect(files.map((f) => f.type)).toEqual(['audio/mpeg', 'audio/wav', 'audio/flac'])
    expect(new Date(files[0]!.lastModified).getFullYear()).toBe(2024)
    expect(skipped).toEqual([])
  })

  it('überspringt andere Formate und meldet sie, Systemdateien still', async () => {
    const zip = await buildZip([
      { name: 'song.mp3', data: 'a' },
      { name: 'cover.jpg', data: 'b' },
      { name: 'track.ogg', data: 'c' },
      { name: 'inner.zip', data: 'd' },
      { name: '__MACOSX/._song.mp3', data: 'e' },
      { name: '.DS_Store', data: 'f' },
      { name: 'Thumbs.db', data: 'g' },
    ])
    const { files, skipped } = await extractAudioFromZip(zip)
    expect(files.map((f) => f.name)).toEqual(['song.mp3'])
    expect(skipped).toEqual([
      { path: 'cover.jpg', reason: 'unsupported' },
      { path: 'track.ogg', reason: 'unsupported' },
      { path: 'inner.zip', reason: 'unsupported' },
    ])
  })

  it('macht Pfade mit .. unschädlich', async () => {
    const zip = await buildZip([{ name: '../../evil/x.mp3', data: 'x' }])
    const { files, paths } = await extractAudioFromZip(zip)
    expect(files[0]!.name).toBe('x.mp3')
    expect(paths.get(files[0]!)).toBe('evil/x.mp3')
  })

  it('liest Namen in UTF-8 und CP437', async () => {
    const cp437 = new Uint8Array([...encoder.encode('M'), 0x84, ...encoder.encode('dchen.mp3')])
    const zip = await buildZip([
      { name: 'Größe.mp3', data: 'a', flags: 0x800 },
      { name: cp437, data: 'b' },
    ])
    const { files } = await extractAudioFromZip(zip)
    expect(files.map((f) => f.name)).toEqual(['Größe.mp3', 'Mädchen.mp3'])
  })

  it('überspringt verschlüsselte und unbekannt komprimierte Einträge', async () => {
    const zip = await buildZip([
      { name: 'secret.mp3', data: 'a', flags: 0x1 },
      { name: 'bzip.mp3', data: 'b', method: 12 },
    ])
    const { files, skipped } = await extractAudioFromZip(zip)
    expect(files).toEqual([])
    expect(skipped).toEqual([
      { path: 'secret.mp3', reason: 'encrypted' },
      { path: 'bzip.mp3', reason: 'unsupported' },
    ])
  })

  it('bricht ab, wenn mehr Daten entstehen als angegeben (Zip-Bombe)', async () => {
    const zip = await buildZip([{ name: 'bomb.mp3', data: '0'.repeat(100_000), size: 1000 }])
    const { files, skipped } = await extractAudioFromZip(zip)
    expect(files).toEqual([])
    expect(skipped).toEqual([{ path: 'bomb.mp3', reason: 'corrupt' }])
  })

  it('lehnt unplausible Kompressionsraten ab, ohne zu entpacken', async () => {
    const zip = await buildZip([{ name: 'bomb.mp3', data: 'x', size: 500 * 1024 ** 2 }])
    const { skipped } = await extractAudioFromZip(zip)
    expect(skipped).toEqual([{ path: 'bomb.mp3', reason: 'too_large' }])
  })

  it('meldet zu kurze Daten als beschädigt', async () => {
    const zip = await buildZip([{ name: 'short.mp3', data: 'abc', size: 10 }])
    const { skipped } = await extractAudioFromZip(zip)
    expect(skipped).toEqual([{ path: 'short.mp3', reason: 'corrupt' }])
  })

  it('wirft ZipError für Dateien, die kein ZIP sind', async () => {
    await expect(extractAudioFromZip(new Blob(['kein zip, nur Text'.repeat(3)]))).rejects.toThrow(
      ZipError,
    )
    await expect(extractAudioFromZip(new Blob(['PK']))).rejects.toMatchObject({ code: 'invalid' })
  })

  it('wirft bei zu vielen Einträgen', async () => {
    const eocd = new Uint8Array(22)
    const view = new DataView(eocd.buffer)
    view.setUint32(0, 0x06054b50, true)
    view.setUint16(10, MAX_ZIP_ENTRIES + 1, true)
    await expect(extractAudioFromZip(new Blob([eocd]))).rejects.toMatchObject({
      code: 'too_many_entries',
    })
  })

  it('wirft, wenn die Audiodateien zusammen zu groß sind', async () => {
    const big = 900 * 1024 ** 2
    const zip = await buildZip([
      { name: 'a.wav', method: 0, data: 'a', size: big },
      { name: 'b.wav', method: 0, data: 'b', size: big },
      { name: 'c.wav', method: 0, data: 'c', size: big },
    ])
    await expect(extractAudioFromZip(zip)).rejects.toMatchObject({ code: 'too_large' })
  })
})
