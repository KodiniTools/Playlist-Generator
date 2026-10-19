/**
 * Liest Titel-Metadaten direkt aus den Header-Bytes einer Audiodatei, ohne Bibliothek
 * und ohne die Datei komplett zu laden:
 * - MP3: ID3v2.2/2.3/2.4 am Anfang, ID3v1 in den letzten 128 Bytes als Ergänzung.
 * - FLAC: VORBIS_COMMENT-Block.
 * - WAV: LIST/INFO-Chunk und eingebettetes ID3v2 (`id3 `-Chunk).
 */
export interface AudioTags {
  title?: string
  artist?: string
  album?: string
  /** Titelnummer auf dem Album (aus "3/12" wird 3). */
  track?: number
  disc?: number
}

// Obergrenze für einen einzelnen Tag-Block (große Cover-Bilder werden abgeschnitten,
// die Text-Frames stehen fast immer davor).
const MAX_TAG_BYTES = 4 * 1024 * 1024
const MAX_CHUNKS = 64

async function readBytes(blob: Blob, start: number, length: number): Promise<Uint8Array> {
  const end = Math.min(blob.size, start + Math.max(0, length))
  if (start >= end) return new Uint8Array(0)
  return new Uint8Array(await blob.slice(start, end).arrayBuffer())
}

const ascii = (bytes: Uint8Array, start: number, length: number) =>
  String.fromCharCode(...bytes.subarray(start, start + length))

const u32be = (b: Uint8Array, o: number) =>
  ((b[o]! << 24) | (b[o + 1]! << 16) | (b[o + 2]! << 8) | b[o + 3]!) >>> 0
const u32le = (b: Uint8Array, o: number) =>
  (b[o]! | (b[o + 1]! << 8) | (b[o + 2]! << 16) | (b[o + 3]! << 24)) >>> 0
const u24be = (b: Uint8Array, o: number) => (b[o]! << 16) | (b[o + 1]! << 8) | b[o + 2]!
const synchsafe = (b: Uint8Array, o: number) =>
  ((b[o]! & 0x7f) << 21) |
  ((b[o + 1]! & 0x7f) << 14) |
  ((b[o + 2]! & 0x7f) << 7) |
  (b[o + 3]! & 0x7f)

const decoders = new Map<string, TextDecoder>()
function decode(bytes: Uint8Array, encoding: string): string {
  let decoder = decoders.get(encoding)
  if (!decoder) {
    decoder = new TextDecoder(encoding)
    decoders.set(encoding, decoder)
  }
  return decoder.decode(bytes)
}

/** Einzeilig machen (Playlists sind zeilenbasiert), Rand trimmen, Leeres verwerfen. */
function clean(value: string | undefined): string | undefined {
  const text = value
    ?.replace(/[\r\n]+/g, ' ')
    // \s deckt auch das BOM (U+FEFF) ab; Null-Bytes stammen aus Feldern fester Länge.
    .replace(/^[\s\0]+|[\s\0]+$/g, '')
  return text ? text : undefined
}

/** "3", "03" oder "3/12" → 3; alles andere → undefined. */
function number(value: string | undefined): number | undefined {
  const match = value?.trim().match(/^(\d+)/)
  const n = match ? Number(match[1]) : NaN
  return Number.isFinite(n) && n > 0 ? n : undefined
}

const hasAny = (tags: AudioTags) => Object.values(tags).some((v) => v !== undefined)

/** Fehlende Felder von `a` mit Werten aus `b` auffüllen. */
function merge(a: AudioTags, b: AudioTags | null): AudioTags {
  if (!b) return a
  return {
    title: a.title ?? b.title,
    artist: a.artist ?? b.artist,
    album: a.album ?? b.album,
    track: a.track ?? b.track,
    disc: a.disc ?? b.disc,
  }
}

// --- ID3v2 ----------------------------------------------------------------------

/** Entfernt die Unsynchronisation (0xFF 0x00 → 0xFF). */
function deunsync(bytes: Uint8Array): Uint8Array {
  const out = new Uint8Array(bytes.length)
  let n = 0
  for (let i = 0; i < bytes.length; i++) {
    out[n++] = bytes[i]!
    if (bytes[i] === 0xff && bytes[i + 1] === 0x00) i++
  }
  return out.subarray(0, n)
}

/** Text-Frame: Kodierungs-Byte, dann Text; bei mehreren Werten (v2.4, Null-getrennt) der erste. */
function id3Text(data: Uint8Array): string | undefined {
  if (data.length < 2) return undefined
  const body = data.subarray(1)
  let text: string
  switch (data[0]) {
    case 1: {
      // UTF-16 mit BOM; ohne BOM Little Endian annehmen.
      const be = body[0] === 0xfe && body[1] === 0xff
      text = decode(body, be ? 'utf-16be' : 'utf-16le')
      break
    }
    case 2:
      text = decode(body, 'utf-16be')
      break
    case 3:
      text = decode(body, 'utf-8')
      break
    default:
      text = decode(body, 'windows-1252')
  }
  return clean(text.split('\u0000').find((part) => clean(part)))
}

const ID3_FIELDS: Record<string, keyof AudioTags | 'albumArtist'> = {
  TIT2: 'title',
  TT2: 'title',
  TPE1: 'artist',
  TP1: 'artist',
  TPE2: 'albumArtist',
  TP2: 'albumArtist',
  TALB: 'album',
  TAL: 'album',
  TRCK: 'track',
  TRK: 'track',
  TPOS: 'disc',
  TPA: 'disc',
}

/** Wertet einen kompletten ID3v2-Tag (inkl. 10-Byte-Header) aus. */
export function parseId3v2(tag: Uint8Array): AudioTags | null {
  if (tag.length < 10 || ascii(tag, 0, 3) !== 'ID3') return null
  const version = tag[3]!
  const flags = tag[5]!
  if (version < 2 || version > 4) return null
  // v2.2 mit Kompression ist nicht definiert.
  if (version === 2 && flags & 0x40) return null

  let body = tag.subarray(10, 10 + synchsafe(tag, 6))
  if (flags & 0x80 && version < 4) body = deunsync(body)

  let offset = 0
  if (flags & 0x40) {
    // Erweiterter Header: v2.3 Größe ohne die 4 Größen-Bytes, v2.4 synchsafe inklusive.
    offset = version === 3 ? u32be(body, 0) + 4 : synchsafe(body, 0)
  }

  const idLength = version === 2 ? 3 : 4
  const headerLength = version === 2 ? 6 : 10
  const found: Partial<Record<keyof AudioTags | 'albumArtist', string>> = {}

  while (offset + headerLength <= body.length) {
    if (body[offset] === 0) break // Padding
    const id = ascii(body, offset, idLength)
    if (!/^[A-Z0-9]+$/.test(id)) break
    const size =
      version === 2
        ? u24be(body, offset + 3)
        : version === 4
          ? synchsafe(body, offset + 4)
          : u32be(body, offset + 4)
    const format = version === 2 ? 0 : body[offset + 9]!
    const start = offset + headerLength
    offset = start + size
    if (size <= 0 || offset > body.length) break

    const field = ID3_FIELDS[id]
    if (!field || found[field] !== undefined) continue

    let data = body.subarray(start, start + size)
    if (version === 4) {
      // Kompression (0x08) und Verschlüsselung (0x04) lassen sich nicht lesen.
      if (format & 0x0c) continue
      if (format & 0x40) data = data.subarray(1) // Gruppen-Id
      if (format & 0x01) data = data.subarray(4) // Datenlänge
      if (format & 0x02 || flags & 0x80) data = deunsync(data)
    } else if (version === 3) {
      if (format & 0xc0) continue
      if (format & 0x20) data = data.subarray(1)
    }
    found[field] = id3Text(data)
  }

  const tags: AudioTags = {
    title: found.title,
    artist: found.artist ?? found.albumArtist,
    album: found.album,
    track: number(found.track),
    disc: number(found.disc),
  }
  return hasAny(tags) ? tags : null
}

async function readId3v2(blob: Blob, start = 0): Promise<AudioTags | null> {
  const header = await readBytes(blob, start, 10)
  if (header.length < 10 || ascii(header, 0, 3) !== 'ID3') return null
  const size = Math.min(synchsafe(header, 6), MAX_TAG_BYTES)
  return parseId3v2(await readBytes(blob, start, 10 + size))
}

// --- ID3v1 ----------------------------------------------------------------------

/** Die letzten 128 Bytes einer MP3-Datei. */
export function parseId3v1(bytes: Uint8Array): AudioTags | null {
  if (bytes.length !== 128 || ascii(bytes, 0, 3) !== 'TAG') return null
  const field = (start: number, length: number) =>
    clean(decode(bytes.subarray(start, start + length), 'windows-1252').split('\u0000')[0])
  const tags: AudioTags = {
    title: field(3, 30),
    artist: field(33, 30),
    album: field(63, 30),
    // ID3v1.1: Byte 125 = 0, Byte 126 = Titelnummer.
    track: bytes[125] === 0 && bytes[126]! > 0 ? bytes[126] : undefined,
  }
  return hasAny(tags) ? tags : null
}

async function readId3v1(blob: Blob): Promise<AudioTags | null> {
  if (blob.size < 128) return null
  return parseId3v1(await readBytes(blob, blob.size - 128, 128))
}

// --- FLAC / Vorbis Comment --------------------------------------------------------

/** VORBIS_COMMENT-Block (Little Endian, "KEY=Wert" in UTF-8). */
export function parseVorbisComment(block: Uint8Array): AudioTags | null {
  if (block.length < 8) return null
  const fields = new Map<string, string>()
  let offset = 4 + u32le(block, 0) // Vendor-String überspringen
  if (offset + 4 > block.length) return null
  const count = u32le(block, offset)
  offset += 4
  for (let i = 0; i < count && offset + 4 <= block.length; i++) {
    const length = u32le(block, offset)
    offset += 4
    if (offset + length > block.length) break
    const entry = decode(block.subarray(offset, offset + length), 'utf-8')
    offset += length
    const eq = entry.indexOf('=')
    if (eq <= 0) continue
    const key = entry.slice(0, eq).toUpperCase()
    if (!fields.has(key)) fields.set(key, entry.slice(eq + 1))
  }
  const tags: AudioTags = {
    title: clean(fields.get('TITLE')),
    artist: clean(fields.get('ARTIST')) ?? clean(fields.get('ALBUMARTIST')),
    album: clean(fields.get('ALBUM')),
    track: number(fields.get('TRACKNUMBER')),
    disc: number(fields.get('DISCNUMBER')),
  }
  return hasAny(tags) ? tags : null
}

async function readFlac(blob: Blob, start: number): Promise<AudioTags | null> {
  let offset = start + 4 // "fLaC"
  for (let i = 0; i < MAX_CHUNKS; i++) {
    const header = await readBytes(blob, offset, 4)
    if (header.length < 4) return null
    const last = header[0]! & 0x80
    const type = header[0]! & 0x7f
    const length = u24be(header, 1)
    if (type === 4) return parseVorbisComment(await readBytes(blob, offset + 4, length))
    if (last) return null
    offset += 4 + length
  }
  return null
}

// --- WAV (RIFF) -------------------------------------------------------------------

const INFO_FIELDS: Record<string, keyof AudioTags> = {
  INAM: 'title',
  IART: 'artist',
  IPRD: 'album',
  ITRK: 'track',
  IPRT: 'track',
}

/** Inhalt eines LIST-Chunks mit Typ "INFO" (ohne die 4 Bytes "INFO"). */
export function parseRiffInfo(bytes: Uint8Array): AudioTags | null {
  const found: Partial<Record<keyof AudioTags, string>> = {}
  let offset = 0
  while (offset + 8 <= bytes.length) {
    const id = ascii(bytes, offset, 4)
    const size = u32le(bytes, offset + 4)
    const start = offset + 8
    offset = start + size + (size % 2)
    if (start + size > bytes.length) break
    const field = INFO_FIELDS[id]
    if (field && found[field] === undefined) {
      // Kein Kodierungs-Feld vorhanden; UTF-8 ist heute üblich und für ASCII identisch.
      found[field] = clean(decode(bytes.subarray(start, start + size), 'utf-8'))
    }
  }
  const tags: AudioTags = {
    title: found.title,
    artist: found.artist,
    album: found.album,
    track: number(found.track),
  }
  return hasAny(tags) ? tags : null
}

async function readWav(blob: Blob): Promise<AudioTags | null> {
  let id3: AudioTags | null = null
  let info: AudioTags | null = null
  let offset = 12
  for (let i = 0; i < MAX_CHUNKS && offset + 8 <= blob.size; i++) {
    const header = await readBytes(blob, offset, 12)
    if (header.length < 8) break
    const id = ascii(header, 0, 4)
    const size = u32le(header, 4)
    if (id === 'LIST' && header.length >= 12 && ascii(header, 8, 4) === 'INFO') {
      info = parseRiffInfo(await readBytes(blob, offset + 12, Math.min(size - 4, MAX_TAG_BYTES)))
    } else if (id === 'id3 ' || id === 'ID3 ') {
      id3 = await readId3v2(blob, offset + 8)
    }
    offset += 8 + size + (size % 2)
  }
  // ID3 ist meist vollständiger als INFO.
  return id3 ? merge(id3, info) : info
}

// --- Einstieg ---------------------------------------------------------------------

/**
 * Liest die Tags einer Audiodatei. Erkennt das Format am Inhalt, nicht an der Endung.
 * Wirft nie; `null` heißt „keine lesbaren Tags“.
 */
export async function readAudioTags(blob: Blob): Promise<AudioTags | null> {
  try {
    const head = await readBytes(blob, 0, 12)
    if (head.length >= 12 && ascii(head, 0, 4) === 'RIFF' && ascii(head, 8, 4) === 'WAVE') {
      return await readWav(blob)
    }
    if (head.length >= 4 && ascii(head, 0, 4) === 'fLaC') return await readFlac(blob, 0)

    if (head.length >= 10 && ascii(head, 0, 3) === 'ID3') {
      const v2 = await readId3v2(blob)
      // Manche FLAC-Dateien tragen vorne zusätzlich einen ID3v2-Tag.
      const after = 10 + synchsafe(head, 6) + (head[5]! & 0x10 ? 10 : 0)
      const next = await readBytes(blob, after, 4)
      if (next.length === 4 && ascii(next, 0, 4) === 'fLaC') {
        const flac = await readFlac(blob, after)
        return flac ? merge(flac, v2) : v2
      }
      const v1 = await readId3v1(blob)
      return v2 ? merge(v2, v1) : v1
    }
    return await readId3v1(blob)
  } catch {
    return null
  }
}

// --- Sortierung -------------------------------------------------------------------

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

// Fehlende Angaben sortieren nach vorhandenen.
const byText = (a?: string, b?: string) =>
  a === b ? 0 : a === undefined ? 1 : b === undefined ? -1 : collator.compare(a, b)
const byNumber = (a?: number, b?: number) =>
  a === b ? 0 : a === undefined ? 1 : b === undefined ? -1 : a - b

/** Interpret → Album → CD → Titelnummer → Titel → Dateiname. */
export function compareByArtist(
  a: { name: string; tags: AudioTags | null },
  b: { name: string; tags: AudioTags | null },
): number {
  return (
    byText(a.tags?.artist, b.tags?.artist) ||
    byText(a.tags?.album, b.tags?.album) ||
    byNumber(a.tags?.disc, b.tags?.disc) ||
    byNumber(a.tags?.track, b.tags?.track) ||
    byText(a.tags?.title, b.tags?.title) ||
    collator.compare(a.name, b.name)
  )
}
