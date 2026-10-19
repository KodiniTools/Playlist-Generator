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
