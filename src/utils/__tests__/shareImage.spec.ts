import { afterEach, describe, expect, it, vi } from 'vitest'
import { themeColors } from '../../design-system/tokens'
import { estimateSeconds } from '../../components/ui/fileListFormat'
import {
  BackgroundImageError,
  MAX_BACKGROUND_BYTES,
  SHARE_IMAGE_ROWS,
  coverCrop,
  loadBackgroundImage,
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
      { title: 'b', artist: undefined, seconds: estimateSeconds('b.mp3', b.size), estimated: true },
    ])
    expect(summary.approximate).toBe(true)
    expect(summary.totalSeconds).toBe(120 + estimateSeconds('b.mp3', b.size))
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

  it('kennzeichnet geschätzte Dauern mit ≈', () => {
    const { ctx, texts } = recordingContext()
    drawShareImage(
      ctx,
      data({
        tracks: [
          { title: 'A', seconds: 200 },
          { title: 'B', seconds: 249, estimated: true },
        ],
      }),
      'story',
      'dark',
    )
    const all = texts.map((t) => t.text)
    expect(all).toContain('3:20')
    expect(all).toContain('≈ 4:09')
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

describe('Hintergrundbild', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('schneidet mittig zu wie object-fit: cover', () => {
    // 2:3 in Story 9:16: volle Höhe, Seiten werden abgeschnitten.
    expect(coverCrop(1200, 1800, 1080, 1920)).toEqual({
      sx: 93.75,
      sy: 0,
      sw: 1012.5,
      sh: 1800,
    })
    expect(coverCrop(1000, 1000, 1080, 1080)).toEqual({ sx: 0, sy: 0, sw: 1000, sh: 1000 })
    // Querformat im Post: volle Höhe, mittig.
    expect(coverCrop(2000, 1000, 1080, 1080)).toEqual({ sx: 500, sy: 0, sw: 1000, sh: 1000 })
  })

  it('nimmt nur PNG, JPEG und WebP bis zur Höchstgröße an', async () => {
    const bitmap = { width: 100, height: 100, close: vi.fn() }
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn(async () => bitmap),
    )

    await expect(
      loadBackgroundImage(new File(['x'], 'a.webp', { type: 'image/webp' })),
    ).resolves.toBe(bitmap)
    await expect(
      loadBackgroundImage(new File(['<svg/>'], 'a.svg', { type: 'image/svg+xml' })),
    ).rejects.toMatchObject({ code: 'type' })
    const big = new File(['x'], 'a.png', { type: 'image/png' })
    Object.defineProperty(big, 'size', { value: MAX_BACKGROUND_BYTES + 1 })
    await expect(loadBackgroundImage(big)).rejects.toMatchObject({ code: 'size' })
  })

  it('meldet unlesbare und zu große Bilder', async () => {
    const huge = { width: 10_000, height: 10_000, close: vi.fn() }
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn().mockRejectedValueOnce(new Error('kaputt')).mockResolvedValueOnce(huge),
    )
    const file = () => new File(['x'], 'a.jpg', { type: 'image/jpeg' })
    await expect(loadBackgroundImage(file())).rejects.toBeInstanceOf(BackgroundImageError)
    await expect(loadBackgroundImage(file())).rejects.toMatchObject({ code: 'size' })
    expect(huge.close).toHaveBeenCalled()
  })

  it('zeichnet das Bild mit Deckkraft über die Hintergrundfarbe', () => {
    const { ctx, texts } = recordingContext()
    const calls: { alpha: number; args: unknown[] }[] = []
    let alpha = 1
    const spy = new Proxy(ctx as unknown as Record<string, unknown>, {
      get: (target, key: string) =>
        key === 'drawImage'
          ? (...args: unknown[]) => calls.push({ alpha, args })
          : key === 'globalAlpha'
            ? alpha
            : target[key],
      set: (target, key: string, value) => {
        if (key === 'globalAlpha') alpha = value
        else target[key] = value
        return true
      },
    }) as unknown as CanvasRenderingContext2D
    const image = { width: 2000, height: 1000 } as unknown as ImageBitmap
    drawShareImage(spy, data(), 'post', 'dark', undefined, { image, opacity: 0.4 })

    expect(spy.shadowBlur).toBe(18)
    // Heller Text im dunklen Theme → dunkler Schatten.
    expect(spy.shadowColor).toBe('rgba(0, 0, 0, 0.6)')
    expect(calls).toHaveLength(1)
    expect(calls[0]).toEqual({ alpha: 0.4, args: [image, 500, 0, 1000, 1000, 0, 0, 1080, 1080] })
    expect(texts.length).toBeGreaterThan(0)
  })

  it('lässt das Bild bei Deckkraft 0 weg', () => {
    const { ctx } = recordingContext()
    const drawImage = vi.fn()
    ;(ctx as unknown as Record<string, unknown>).drawImage = drawImage
    const image = { width: 10, height: 10 } as unknown as ImageBitmap
    drawShareImage(ctx, data(), 'post', 'dark', undefined, { image, opacity: 0 })
    expect(drawImage).not.toHaveBeenCalled()
  })
})
