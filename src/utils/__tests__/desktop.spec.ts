import { afterEach, describe, expect, it, vi } from 'vitest'
import { IS_DESKTOP } from '../desktop'
import { languageFromSystem } from '../../composables/useTranslation'

describe('Desktop-Erkennung', () => {
  it('ist im Test- und Web-Build aus', () => {
    expect(IS_DESKTOP).toBe(false)
  })
})

describe('languageFromSystem', () => {
  it('wählt Deutsch für de-* und sonst Englisch', () => {
    expect(languageFromSystem(['de-DE', 'en-US'])).toBe('de')
    expect(languageFromSystem(['DE-at'])).toBe('de')
    expect(languageFromSystem(['en-GB', 'de-DE'])).toBe('en')
    expect(languageFromSystem(['fr-FR'])).toBe('en')
    expect(languageFromSystem([])).toBe('en')
  })
})

describe('Texteditor-Übergabe', () => {
  afterEach(() => {
    vi.doUnmock('../desktop')
    vi.resetModules()
  })

  async function offerWithContent(desktop: boolean) {
    vi.resetModules()
    vi.doMock('../desktop', () => ({ IS_DESKTOP: desktop }))
    const { setActivePinia, createPinia } = await import('pinia')
    setActivePinia(createPinia())
    const { usePlaylist } = await import('../../composables/usePlaylist')
    const { useTextEditorHandoff } = await import('../../composables/useTextEditorHandoff')
    usePlaylist().playlistContent.value = '#EXTM3U\nsong.mp3\n'
    const { handoffOffer, offerTextEditor } = useTextEditorHandoff()
    offerTextEditor('copied')
    return handoffOffer.value
  }

  it('wird im Web angeboten', async () => {
    expect(await offerWithContent(false)).toBe('copied')
  })

  it('wird in der Desktop-App nicht angeboten (kein gemeinsamer localStorage mit kodinitools.com)', async () => {
    expect(await offerWithContent(true)).toBeNull()
  })
})
