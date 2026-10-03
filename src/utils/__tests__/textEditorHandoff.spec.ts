import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  FORMAT_MIME,
  HANDOFF_STORAGE_KEY,
  openInTextEditor,
  storeHandoff,
  textEditorUrl,
} from '../textEditorHandoff'

const doc = { name: 'techno.csv', content: 'Filename,Title\na.wav,a', mimeType: FORMAT_MIME.csv }

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('textEditorHandoff', () => {
  it('zielt auf die App-Route des Editors mit Quellkennung', () => {
    expect(textEditorUrl()).toBe('https://kodinitools.com/texteditor/app?source=playlist_generator')
  })

  it('legt den Eintrag mit Version, Quelle und Zeitstempel ab', () => {
    expect(storeHandoff(doc, 1234)).toBe(true)
    expect(JSON.parse(localStorage.getItem(HANDOFF_STORAGE_KEY) ?? '{}')).toEqual({
      version: 1,
      source: 'playlist_generator',
      name: 'techno.csv',
      content: 'Filename,Title\na.wav,a',
      mimeType: 'text/csv',
      sharedAt: 1234,
    })
  })

  it('öffnet den Editor erst nach erfolgreichem Ablegen', () => {
    const open = vi.fn()
    expect(openInTextEditor(doc, open)).toBe(true)
    expect(open).toHaveBeenCalledWith(textEditorUrl())
    expect(localStorage.getItem(HANDOFF_STORAGE_KEY)).not.toBeNull()
  })

  it('öffnet nichts, wenn der Speicher nicht beschreibbar ist', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })
    const open = vi.fn()
    expect(openInTextEditor(doc, open)).toBe(false)
    expect(open).not.toHaveBeenCalled()
  })

  it('kennt für jedes Ausgabeformat einen MIME-Typ', () => {
    expect(Object.keys(FORMAT_MIME).sort()).toEqual(
      ['csv', 'cue', 'json', 'm3u', 'm3u8', 'pls', 'txt', 'xspf'].sort(),
    )
  })
})
