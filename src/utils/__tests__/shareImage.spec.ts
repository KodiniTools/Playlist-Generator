import { describe, expect, it } from 'vitest'
import { themeColors } from '../../design-system/tokens'
import {
  SHARE_IMAGE_ROWS,
  contrastRatio,
  defaultShareColors,
  mixColors,
  parseHex,
  sharePalette,
  drawShareImage,
  fitText,
  formatClock,
  formatTotal,
  shareImageFileName,
  shareRows,
  summarizeTracks,
  wrapText,
  type ShareImageData,
  type ShareTrack,
} from '../shareImage'

/** 10 px je Zeichen. */
const measure = (text: string) => Array.from(text).length * 10

const tracks = (count: number): ShareTrack[] =>
  Array.from({ length: count }, (_, i) => ({ title: `Titel ${i + 1}`, seconds: 180 }))

/** Kontext, der Texte und Füllfarben mitschreibt. */
function recordingContext() {
  const texts: { text: string; fill: string }[] = []
  let fill = ''
  const gradient = { addColorStop: () => {} }
  const ctx = new Proxy(
    {
      measureText: (text: string) => ({ width: measure(text) }),
      createLinearGradient: () => gradient,
      fillText: (text: string) => texts.push({ text, fill }),
    } as Record<string, unknown>,
    {
      get: (target, key: string) =>
        key in target ? target[key] : key === 'fillStyle' ? fill : () => {},
      set: (target, key: string, value) => {
        if (key === 'fillStyle') fill = value
        else target[key] = value
        return true
      },
    },
  ) as unknown as CanvasRenderingContext2D
  return { ctx, texts }
}

const data = (overrides: Partial<ShareImageData> = {}): ShareImageData => ({
  name: 'Sommer Mix',
  tracks: tracks(3),
  kicker: 'Wiedergabeliste',
  meta: '3 Titel · 9 min',
  moreLabel: '+ {count} weitere Titel',
  footer: 'Erstellt mit dem Audio Wiedergabeliste Generator',
  ...overrides,
})

describe('formatClock / formatTotal', () => {
  it('formatiert Laufzeiten', () => {
    expect(formatClock(184)).toBe('3:04')
    expect(formatClock(3729)).toBe('1:02:09')
    expect(formatClock(-5)).toBe('0:00')
  })

  it('formatiert die Gesamtdauer kompakt', () => {
    expect(formatTotal(10)).toBe('1 min')
    expect(formatTotal(48 * 60)).toBe('48 min')
    expect(formatTotal(65 * 60)).toBe('1 h 05 min')
  })
})

describe('shareRows', () => {
  it('zeigt alle Titel, wenn sie passen', () => {
    expect(shareRows(tracks(6), 'post')).toEqual({ tracks: tracks(6), more: 0 })
  })

  it('macht die letzte Zeile zu „+ N weitere“', () => {
    const rows = shareRows(tracks(20), 'story')
    expect(rows.tracks).toHaveLength(SHARE_IMAGE_ROWS.story - 1)
    expect(rows.more).toBe(20 - (SHARE_IMAGE_ROWS.story - 1))
  })
})

describe('fitText / wrapText', () => {
  it('kürzt mit Auslassungszeichen auf die Breite', () => {
    expect(fitText('kurz', 100, measure)).toBe('kurz')
    const cut = fitText('ein sehr langer Titel', 100, measure)
    expect(cut.endsWith('…')).toBe(true)
    expect(measure(cut)).toBeLessThanOrEqual(100)
  })

  it('bricht um und kürzt die letzte erlaubte Zeile', () => {
    expect(wrapText('Sommer Mix 2024', 90, 2, measure)).toEqual(['Sommer', 'Mix 2024'])
    const lines = wrapText('eins zwei drei vier fünf sechs', 100, 2, measure)
    expect(lines).toHaveLength(2)
    expect(lines[1]!.endsWith('…')).toBe(true)
  })

  it('kürzt ein einzelnes überlanges Wort', () => {
    expect(wrapText('Donaudampfschifffahrt', 100, 2, measure)).toEqual([
      fitText('Donaudampfschifffahrt', 100, measure),
    ])
  })
})

describe('shareImageFileName', () => {
  it('bildet einen sicheren Dateinamen', () => {
    expect(shareImageFileName('Sommer/Mix: 2024', 'story', 'image/png')).toBe(
      'Sommer_Mix_ 2024-story.png',
    )
    expect(shareImageFileName('  ', 'post', 'image/jpeg')).toBe('playlist-post.jpg')
  })
})

describe('summarizeTracks', () => {
  it('nimmt Tags, sonst den Dateinamen, und schätzt fehlende Dauern', () => {
    const a = new File(['x'], '01 intro.mp3')
    const b = new File([new Uint8Array(16_000 * 60)], 'b.mp3')
    const summary = summarizeTracks(
      [a, b],
      (file) => (file === a ? { title: 'Intro', artist: 'Band' } : null),
      (name) => (name === '01 intro.mp3' ? 120 : null),
    )
    expect(summary.tracks).toEqual([
      { title: 'Intro', artist: 'Band', seconds: 120 },
      { title: 'b', artist: undefined, seconds: null },
    ])
    expect(summary.approximate).toBe(true)
    expect(summary.totalSeconds).toBeGreaterThan(120)
  })
})

describe('drawShareImage', () => {
  it('zeichnet Kopf, Titel mit Nummer, Dauer und Fußzeile in Theme-Farben', () => {
    const { ctx, texts } = recordingContext()
    drawShareImage(
      ctx,
      data({ tracks: [{ title: 'Intro', artist: 'Band', seconds: 184 }] }),
      'story',
      'dark',
    )
    const dark = themeColors('dark')
    const all = texts.map((t) => t.text)
    expect(all).toEqual([
      'WIEDERGABELISTE',
      'Sommer Mix',
      '3 Titel · 9 min',
      '01',
      'Intro',
      'Band',
      '3:04',
      'Erstellt mit dem Audio Wiedergabeliste Generator',
    ])
    expect(texts.find((t) => t.text === 'Intro')?.fill).toBe(dark.text)
    expect(texts.find((t) => t.text === '01')?.fill).toBe(dark.accent)
  })

  it('zeigt bei vielen Titeln „+ N weitere“ und nutzt helle Farben', () => {
    const { ctx, texts } = recordingContext()
    drawShareImage(ctx, data({ tracks: tracks(10) }), 'post', 'light')
    const all = texts.map((t) => t.text)
    expect(all).toContain('05')
    expect(all).not.toContain('06')
    expect(all).toContain('+ 5 weitere Titel')
    expect(texts.find((t) => t.text === 'Titel 1')?.fill).toBe(themeColors('light').text)
  })
})

describe('Farben', () => {
  it('liest und mischt Hex-Farben', () => {
    expect(parseHex('#fff')).toEqual([255, 255, 255])
    expect(parseHex('#0a1B2c')).toEqual([10, 27, 44])
    expect(parseHex('rot')).toBeNull()
    expect(mixColors('#000000', '#ffffff', 0.5)).toBe('#808080')
  })

  it('berechnet den Kontrast nach WCAG', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21)
    expect(contrastRatio('#777777', '#777777')).toBe(1)
  })

  it('nutzt ohne eigene Farben genau die Theme-Farben', () => {
    const dark = themeColors('dark')
    expect(defaultShareColors('dark')).toEqual({ text: dark.text, background: dark.bg })
    expect(sharePalette('dark', defaultShareColors('dark'))).toEqual({
      bg: dark.bg,
      bgEnd: dark.bgSecondary,
      text: dark.text,
      muted: dark.muted,
      accent: dark.accent,
      border: dark.border,
    })
  })

  it('leitet Nebentöne aus eigenen Farben ab', () => {
    const palette = sharePalette('dark', { text: '#ffffff', background: '#000000' })
    expect(palette).toMatchObject({ bg: '#000000', text: '#ffffff', muted: '#a6a6a6' })
    expect(palette.bgEnd).toBe('#0f0f0f')
    expect(palette.accent).toBe(themeColors('dark').accent)
  })

  it('ersetzt den Akzent durch die Textfarbe, wenn er im Hintergrund verschwindet', () => {
    const accent = themeColors('dark').accent
    expect(sharePalette('dark', { text: '#000000', background: accent }).accent).toBe('#000000')
  })

  it('ignoriert ungültige Farben', () => {
    expect(sharePalette('light', { text: 'blau', background: '' })).toEqual(sharePalette('light'))
  })

  it('zeichnet mit eigenen Farben', () => {
    const { ctx, texts } = recordingContext()
    drawShareImage(ctx, data(), 'post', 'dark', { text: '#ff0000', background: '#ffffff' })
    expect(texts.find((t) => t.text === 'Sommer Mix')?.fill).toBe('#ff0000')
    expect(texts.find((t) => t.text === 'Titel 1')?.fill).toBe('#ff0000')
  })
})
