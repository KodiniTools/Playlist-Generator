/**
 * Entpackt Audiodateien aus ZIP-Archiven, komplett im Browser.
 *
 * Gelesen wird über das zentrale Verzeichnis am Ende des Archivs; die Daten
 * werden erst beim Entpacken einzeln aus dem Blob geschnitten. Unterstützt
 * werden „stored“ (0) und „deflate“ (8) über `DecompressionStream`.
 *
 * Schutz vor Zip-Bomben: Größen aus dem Verzeichnis werden vor dem Entpacken
 * gegen die Limits geprüft, und beim Entpacken wird abgebrochen, sobald mehr
 * Bytes entstehen als angegeben. Pfade dienen nur als Anzeige- bzw. Exportpfad,
 * es wird nichts ins Dateisystem geschrieben; `..` und führende `/` fallen weg.
 */

/** Höchstzahl der Einträge im zentralen Verzeichnis. */
export const MAX_ZIP_ENTRIES = 5000
/** Höchstgröße einer entpackten Datei. */
export const MAX_ENTRY_BYTES = 1024 ** 3
/** Höchstgröße aller entpackten Audiodateien eines Archivs zusammen. */
export const MAX_TOTAL_BYTES = 2 * 1024 ** 3
/** Höchstes Verhältnis entpackt/gepackt; Deflate schafft technisch etwa 1032:1. */
export const MAX_RATIO = 1100

const ZIP_EXTENSION = /\.zip$/i
const AUDIO_EXTENSION = /\.(mp3|wav|flac)$/i
const AUDIO_TYPES: Record<string, string> = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  flac: 'audio/flac',
}

const SIG_EOCD = 0x06054b50
const SIG_CENTRAL = 0x02014b50
const SIG_LOCAL = 0x04034b50
const EOCD_MIN = 22
const EOCD_MAX_SEARCH = EOCD_MIN + 0xffff

export type ZipErrorCode = 'invalid' | 'zip64' | 'too_many_entries' | 'too_large'

/** Archiv als Ganzes nicht lesbar oder über den Limits. */
export class ZipError extends Error {
  constructor(readonly code: ZipErrorCode) {
    super(`ZIP: ${code}`)
    this.name = 'ZipError'
  }
}

/** Warum eine Datei aus dem Archiv nicht übernommen wurde. */
export type ZipSkipReason = 'unsupported' | 'encrypted' | 'too_large' | 'corrupt'

export interface ZipSkipped {
  path: string
  reason: ZipSkipReason
}

export interface ZipExtractResult {
  /** Entpackte MP3-, WAV- und FLAC-Dateien in Archiv-Reihenfolge. */
  files: File[]
  /** Pfad je Datei relativ zum Archiv, z. B. "Album/CD1/01.mp3". */
  paths: Map<File, string>
  /** Übersprungene Dateien (keine Ordner und keine Systemdateien wie __MACOSX). */
  skipped: ZipSkipped[]
}

interface CentralEntry {
  path: string
  flags: number
  method: number
  compressedSize: number
  size: number
  localOffset: number
  lastModified: number
}

/** true für Dateien mit Endung .zip. */
export function isZipFile(name: string): boolean {
  return ZIP_EXTENSION.test(name)
}

// CP437 (Standard-Kodierung ohne UTF-8-Flag), Zeichen 0x80–0xFF.
const CP437_HIGH =
  'ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐' +
  '└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ '

function decodeName(bytes: Uint8Array, utf8: boolean): string {
  if (utf8) return new TextDecoder('utf-8').decode(bytes)
  // Viele Packer setzen das Flag nicht, schreiben aber trotzdem UTF-8.
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    let text = ''
    for (const byte of bytes)
      text += byte < 0x80 ? String.fromCharCode(byte) : CP437_HIGH[byte - 0x80]
    return text
  }
}

/** Pfad ohne leere, `.`- und `..`-Segmente, mit `/` als Trenner. */
export function sanitizeZipPath(path: string): string {
  return path
    .replace(/\\/g, '/')
    .split('/')
    .filter((segment) => segment !== '' && segment !== '.' && segment !== '..')
    .join('/')
}

/** Systemdateien, die Packer mit ablegen und die niemand vermisst. */
function isJunk(path: string): boolean {
  const segments = path.split('/')
  const base = segments[segments.length - 1] ?? ''
  return (
    segments[0] === '__MACOSX' || base.startsWith('.') || /^(thumbs\.db|desktop\.ini)$/i.test(base)
  )
}

/** DOS-Datum/-Zeit (lokale Zeit) als Zeitstempel in ms. */
function dosDateTime(date: number, time: number): number {
  const year = 1980 + (date >> 9)
  const month = ((date >> 5) & 0x0f) - 1
  const day = date & 0x1f
  const stamp = new Date(
    year,
    month,
    day || 1,
    time >> 11,
    (time >> 5) & 0x3f,
    (time & 0x1f) * 2,
  ).getTime()
  return Number.isFinite(stamp) ? stamp : Date.now()
}

const readBytes = async (blob: Blob, start: number, end: number) =>
  new DataView(await blob.slice(start, end).arrayBuffer())

async function readCentralDirectory(blob: Blob): Promise<CentralEntry[]> {
  if (blob.size < EOCD_MIN) throw new ZipError('invalid')
  const tailStart = Math.max(0, blob.size - EOCD_MAX_SEARCH)
  const tail = await readBytes(blob, tailStart, blob.size)

  let eocd = -1
  for (let i = tail.byteLength - EOCD_MIN; i >= 0; i--) {
    if (tail.getUint32(i, true) === SIG_EOCD) {
      eocd = i
      break
    }
  }
  if (eocd < 0) throw new ZipError('invalid')

  const count = tail.getUint16(eocd + 10, true)
  const cdSize = tail.getUint32(eocd + 12, true)
  const cdOffset = tail.getUint32(eocd + 16, true)
  if (count === 0xffff || cdSize === 0xffffffff || cdOffset === 0xffffffff) {
    throw new ZipError('zip64')
  }
  if (count > MAX_ZIP_ENTRIES) throw new ZipError('too_many_entries')
  if (cdOffset + cdSize > blob.size) throw new ZipError('invalid')

  const cd = await readBytes(blob, cdOffset, cdOffset + cdSize)
  const bytes = new Uint8Array(cd.buffer, cd.byteOffset, cd.byteLength)
  const entries: CentralEntry[] = []
  let p = 0
  for (let i = 0; i < count; i++) {
    if (p + 46 > cd.byteLength || cd.getUint32(p, true) !== SIG_CENTRAL) {
      throw new ZipError('invalid')
    }
    const flags = cd.getUint16(p + 8, true)
    const nameLength = cd.getUint16(p + 28, true)
    const extraLength = cd.getUint16(p + 30, true)
    const commentLength = cd.getUint16(p + 32, true)
    if (p + 46 + nameLength > cd.byteLength) throw new ZipError('invalid')
    entries.push({
      path: decodeName(bytes.subarray(p + 46, p + 46 + nameLength), (flags & 0x800) !== 0),
      flags,
      method: cd.getUint16(p + 10, true),
      lastModified: dosDateTime(cd.getUint16(p + 14, true), cd.getUint16(p + 12, true)),
      compressedSize: cd.getUint32(p + 20, true),
      size: cd.getUint32(p + 24, true),
      localOffset: cd.getUint32(p + 42, true),
    })
    p += 46 + nameLength + extraLength + commentLength
  }
  return entries
}

/** Inflate mit hartem Limit: mehr als `expected` Bytes gelten als defekt. */
async function inflate(data: Blob, expected: number): Promise<Blob | null> {
  const reader = data.stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      total += value.byteLength
      if (total > expected) {
        await reader.cancel()
        return null
      }
      chunks.push(value)
    }
  } catch {
    return null
  }
  return total === expected ? new Blob(chunks as BlobPart[]) : null
}

async function extractEntry(blob: Blob, entry: CentralEntry): Promise<Blob | null> {
  if (entry.localOffset + 30 > blob.size) return null
  const local = await readBytes(blob, entry.localOffset, entry.localOffset + 30)
  if (local.getUint32(0, true) !== SIG_LOCAL) return null
  const start = entry.localOffset + 30 + local.getUint16(26, true) + local.getUint16(28, true)
  const end = start + entry.compressedSize
  if (end > blob.size) return null
  const data = blob.slice(start, end)
  if (entry.method === 0) return entry.compressedSize === entry.size ? data : null
  return inflate(data, entry.size)
}

/**
 * Liest ein ZIP-Archiv und liefert die enthaltenen MP3-, WAV- und FLAC-Dateien.
 * Andere Dateien, verschlüsselte, defekte und zu große Einträge werden in
 * `skipped` gemeldet. Wirft `ZipError`, wenn das Archiv selbst nicht lesbar ist
 * oder die Audiodateien zusammen `MAX_TOTAL_BYTES` überschreiten.
 */
export async function extractAudioFromZip(blob: Blob): Promise<ZipExtractResult> {
  const entries = await readCentralDirectory(blob)
  const skipped: ZipSkipped[] = []
  const audio: (CentralEntry & { clean: string })[] = []

  for (const entry of entries) {
    if (entry.path.endsWith('/') || entry.path.endsWith('\\')) continue
    const clean = sanitizeZipPath(entry.path)
    if (!clean || isJunk(clean)) continue
    if (!AUDIO_EXTENSION.test(clean)) skipped.push({ path: clean, reason: 'unsupported' })
    else if (entry.flags & 0x1) skipped.push({ path: clean, reason: 'encrypted' })
    else if (entry.method !== 0 && entry.method !== 8) {
      skipped.push({ path: clean, reason: 'unsupported' })
    } else if (
      entry.size > MAX_ENTRY_BYTES ||
      (entry.method === 8 && entry.size > Math.max(entry.compressedSize, 1) * MAX_RATIO)
    ) {
      skipped.push({ path: clean, reason: 'too_large' })
    } else audio.push({ ...entry, clean })
  }

  if (audio.reduce((sum, entry) => sum + entry.size, 0) > MAX_TOTAL_BYTES) {
    throw new ZipError('too_large')
  }

  const files: File[] = []
  const paths = new Map<File, string>()
  for (const entry of audio) {
    const data = await extractEntry(blob, entry)
    if (!data) {
      skipped.push({ path: entry.clean, reason: 'corrupt' })
      continue
    }
    const name = entry.clean.split('/').pop()!
    const ext = name.split('.').pop()!.toLowerCase()
    const file = new File([data], name, {
      type: AUDIO_TYPES[ext] ?? '',
      lastModified: entry.lastModified,
    })
    files.push(file)
    paths.set(file, entry.clean)
  }
  return { files, paths, skipped }
}
