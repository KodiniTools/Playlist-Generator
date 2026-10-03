import { describe, expect, it } from 'vitest'
import {
  estimateSeconds,
  extensionOf,
  formatBytes,
  formatClock,
  formatDurationLabel,
} from '../fileListFormat'

describe('fileListFormat', () => {
  it('liest die Dateiendung in Kleinbuchstaben', () => {
    expect(extensionOf('Summer_Mix.MP3')).toBe('mp3')
    expect(extensionOf('archive.tar.flac')).toBe('flac')
    expect(extensionOf('ohne-endung')).toBe('')
    expect(extensionOf('.versteckt')).toBe('')
    expect(extensionOf('endet-mit-punkt.')).toBe('')
  })

  it('formatiert Größen mit Locale und einer Nachkommastelle', () => {
    expect(formatBytes(0)).toBe('0 B')
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(9227469)).toBe('8,8 MB')
    expect(formatBytes(9227469, 'en-US')).toBe('8.8 MB')
    expect(formatBytes(1024 ** 3 * 1.5)).toBe('1,5 GB')
  })

  it('formatiert Dauern als Uhrzeit', () => {
    expect(formatClock(221)).toBe('3:41')
    expect(formatClock(5)).toBe('0:05')
    expect(formatClock(3725)).toBe('1:02:05')
    expect(formatClock(-3)).toBe('0:00')
  })

  it('formatiert Gesamtdauern als Text', () => {
    expect(formatDurationLabel(20)).toBe('< 1 min')
    expect(formatDurationLabel(2712)).toBe('45 min')
    expect(formatDurationLabel(3900)).toBe('1h 5min')
    expect(formatDurationLabel(7200)).toBe('2h')
  })

  it('schätzt die Dauer formatabhängig', () => {
    const size = 17640000
    expect(estimateSeconds('track.wav', size)).toBeCloseTo(100)
    expect(estimateSeconds('track.mp3', size)).toBeCloseTo(882)
    expect(estimateSeconds('track.unknown', size)).toBeCloseTo(882)
  })
})
