import { crc32, deflateRawSync, deflateSync } from 'node:zlib'
import type { Page } from '@playwright/test'

export type Locale = 'de' | 'en'
export type Theme = 'dark' | 'light'

/** Setzt Sprache und Theme vor dem ersten Skript der Seite (wie die SSI-Navigation). */
export async function prepare(page: Page, locale: Locale, theme: Theme = 'dark'): Promise<void> {
  await page.addInitScript(
    ([l, t]) => {
      localStorage.setItem('locale', l)
      localStorage.setItem('theme', t)
    },
    [locale, theme] as const,
  )
}

/** Kleine, gültige Mono-PCM-WAV-Datei (8 kHz, Stille) mit der angegebenen Länge. */
export function wav(seconds: number): Buffer {
  const sampleRate = 8000
  const dataBytes = sampleRate * seconds * 2
  const buffer = Buffer.alloc(44 + dataBytes)
  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataBytes, 4)
  buffer.write('WAVEfmt ', 8)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20)
  buffer.writeUInt16LE(1, 22)
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(sampleRate * 2, 28)
  buffer.writeUInt16LE(2, 32)
  buffer.writeUInt16LE(16, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataBytes, 40)
  return buffer
}

export function audioFile(name: string, seconds = 1) {
  return { name, mimeType: 'audio/wav', buffer: wav(seconds) }
}

/** WAV mit LIST/INFO-Chunk (INAM Titel, IART Interpret, IPRD Album, ITRK Nummer). */
export function taggedAudioFile(
  name: string,
  tags: { title?: string; artist?: string; album?: string; track?: number },
  seconds = 1,
) {
  const fields: [string, string | number | undefined][] = [
    ['INAM', tags.title],
    ['IART', tags.artist],
    ['IPRD', tags.album],
    ['ITRK', tags.track],
  ]
  const chunks = fields
    .filter(([, value]) => value !== undefined)
    .map(([id, value]) => {
      const text = Buffer.from(`${value}\0`, 'utf8')
      const data = text.length % 2 ? Buffer.concat([text, Buffer.alloc(1)]) : text
      const header = Buffer.alloc(8)
      header.write(id, 0)
      header.writeUInt32LE(text.length, 4)
      return Buffer.concat([header, data])
    })
  const info = Buffer.concat([Buffer.from('INFO'), ...chunks])
  const list = Buffer.alloc(8)
  list.write('LIST', 0)
  list.writeUInt32LE(info.length, 4)
  const base = wav(seconds)
  const buffer = Buffer.concat([base, list, info])
  buffer.writeUInt32LE(buffer.length - 8, 4) // RIFF-Größe anpassen
  return { name, mimeType: 'audio/wav', buffer }
}

/** ZIP-Archiv (deflate, UTF-8-Namen) aus Pfad → Inhalt. */
export function zipFile(name: string, entries: Record<string, Buffer | string>) {
  const locals: Buffer[] = []
  const centrals: Buffer[] = []
  let offset = 0
  for (const [path, content] of Object.entries(entries)) {
    const fileName = Buffer.from(path, 'utf8')
    const raw = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8')
    const data = deflateRawSync(raw)
    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(0x800, 6)
    local.writeUInt16LE(8, 8)
    local.writeUInt16LE(0x5821, 12) // 2024-01-01
    local.writeUInt32LE(crc32(raw), 14)
    local.writeUInt32LE(data.length, 18)
    local.writeUInt32LE(raw.length, 22)
    local.writeUInt16LE(fileName.length, 26)
    const central = Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50, 0)
    central.writeUInt16LE(20, 4)
    central.writeUInt16LE(20, 6)
    local.copy(central, 8, 6, 30) // Flags bis Namenslänge stimmen überein
    central.writeUInt32LE(offset, 42)
    locals.push(local, fileName, data)
    centrals.push(central, fileName)
    offset += local.length + fileName.length + data.length
  }
  const directory = Buffer.concat(centrals)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(Object.keys(entries).length, 8)
  end.writeUInt16LE(Object.keys(entries).length, 10)
  end.writeUInt32LE(directory.length, 12)
  end.writeUInt32LE(offset, 16)
  return { name, mimeType: 'application/zip', buffer: Buffer.concat([...locals, directory, end]) }
}

/** Einfarbiges PNG (RGB) der angegebenen Größe. */
export function pngFile(
  name: string,
  width: number,
  height: number,
  rgb: [number, number, number],
) {
  const chunk = (type: string, data: Buffer) => {
    const head = Buffer.alloc(8)
    head.writeUInt32BE(data.length, 0)
    head.write(type, 4)
    const crc = Buffer.alloc(4)
    crc.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type), data])), 0)
    return Buffer.concat([head, data, crc])
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // Bittiefe
  ihdr[9] = 2 // RGB
  const row = Buffer.concat([Buffer.from([0]), Buffer.from(Array(width).fill(rgb).flat())])
  const raw = Buffer.concat(Array(height).fill(row))
  const buffer = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
  return { name, mimeType: 'image/png', buffer }
}
