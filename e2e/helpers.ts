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
