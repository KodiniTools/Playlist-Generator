import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PlaylistPreview from '../PlaylistPreview.vue'
import { useToast } from '../../composables/useToast'
import { useTranslation } from '../../composables/useTranslation'

const content = '#EXTM3U\n#EXTINF:221,Summer Mix\nSummer_Mix.mp3'
const { toasts } = useToast()

type Props = InstanceType<typeof PlaylistPreview>['$props']

function mountPreview(props: Partial<Props> = {}) {
  return mount(PlaylistPreview, {
    props: { outputFormat: 'm3u', playlistContent: content, ...props },
  })
}

describe('PlaylistPreview', () => {
  beforeEach(() => {
    useTranslation().setLanguage('de')
    toasts.value.splice(0)
  })

  it('zeigt Format, Beschreibung, Pfad-Hinweis und Zeilen mit Nummern', () => {
    const wrapper = mountPreview({ playlistName: 'Sommer Mix' })
    expect(wrapper.get('.ui-panel__title').text()).toBe('Vorschau & Speichern')
    expect(wrapper.get<HTMLSelectElement>('#outputFormat').element.value).toBe('m3u')
    expect(wrapper.get('.playlist-preview__format-desc').text()).toContain('VLC')
    expect(wrapper.find('.ui-callout').exists()).toBe(true)
    expect(wrapper.get('.playlist-preview__file-name').text()).toBe('Sommer Mix.m3u')
    expect(wrapper.get('.playlist-preview__line-count').text()).toBe('3 Zeilen')

    const lines = wrapper.findAll('.playlist-preview__line')
    expect(lines.map((line) => line.get('.playlist-preview__line-text').text())).toEqual([
      '#EXTM3U',
      '#EXTINF:221,Summer Mix',
      'Summer_Mix.mp3',
    ])
    expect(lines.at(0)?.get('.playlist-preview__line-text').classes()).toContain(
      'playlist-preview__line-text--directive',
    )
    expect(lines.at(2)?.get('.playlist-preview__line-text').classes()).not.toContain(
      'playlist-preview__line-text--directive',
    )
  })

  it('meldet den Formatwechsel und blendet den Hinweis bei JSON aus', async () => {
    const wrapper = mountPreview()
    await wrapper.get('#outputFormat').setValue('json')
    expect(wrapper.emitted('update:outputFormat')).toEqual([['json']])
    expect(wrapper.find('.ui-callout').exists()).toBe(false)
    expect(wrapper.get('.playlist-preview__file-name').text()).toBe('playlist.json')
    expect(wrapper.get('.playlist-preview__format-desc').text()).toContain('Entwickler')

    await wrapper.setProps({ outputFormat: 'xspf' })
    expect(wrapper.get<HTMLSelectElement>('#outputFormat').element.value).toBe('xspf')
  })

  it('bietet YouTube-Kapitel als Textdatei ohne Pfad-Einstellungen an', async () => {
    const wrapper = mountPreview({ playlistName: 'Mix' })
    expect(wrapper.find('#outputFormat option[value="youtube"]').text()).toBe('YouTube-Kapitel')
    await wrapper.get('#outputFormat').setValue('youtube')
    expect(wrapper.emitted('update:outputFormat')).toEqual([['youtube']])
    expect(wrapper.get('.playlist-preview__file-name').text()).toBe('Mix.txt')
    expect(wrapper.get('.playlist-preview__format-desc').text()).toContain('YouTube')
    expect(wrapper.text()).not.toContain('Pfade in der Wiedergabeliste')
    expect(wrapper.find('.ui-callout').exists()).toBe(false)
  })

  it('zeigt ohne Inhalt den Leerzustand und sperrt Kopieren', () => {
    const wrapper = mountPreview({ playlistContent: '' })
    expect(wrapper.find('.playlist-preview__lines').exists()).toBe(false)
    expect(wrapper.get('.ui-empty__title').text()).toBe('Noch keine Vorschau')
    expect(wrapper.get('[data-action="copy"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('.ui-button--primary').attributes('disabled')).toBeUndefined()
  })

  it('kopiert in die Zwischenablage und meldet Erfolg oder Fehler als Toast', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })

    const wrapper = mountPreview()
    await wrapper.get('[data-action="copy"]').trigger('click')
    await flushPromises()
    expect(writeText).toHaveBeenCalledWith(content)
    expect(toasts.value.map((toast) => toast.type)).toEqual(['success'])
    expect(wrapper.emitted('copied')).toHaveLength(1)

    writeText.mockRejectedValueOnce(new Error('denied'))
    await wrapper.get('[data-action="copy"]').trigger('click')
    await flushPromises()
    expect(toasts.value.map((toast) => toast.type)).toEqual(['success', 'error'])
    expect(wrapper.emitted('copied')).toHaveLength(1)
  })

  it('bietet Kopieren nur einmal an, in der Aktionsleiste', () => {
    const wrapper = mountPreview()
    expect(wrapper.find('.playlist-preview__code-header .ui-icon-button').exists()).toBe(false)
    const copyButtons = wrapper.findAll('button[aria-label="Kopieren"]')
    expect(copyButtons).toHaveLength(1)
    expect(wrapper.find('.playlist-preview__actions [aria-label="Kopieren"]').exists()).toBe(true)
    expect(copyButtons[0]?.attributes('title')).toMatch(/^Kopieren \(/)
    expect(copyButtons[0]?.text()).toBe('')
  })

  describe('Teilen', () => {
    const share = vi.fn()
    const canShare = vi.fn()

    beforeEach(() => {
      share.mockReset().mockResolvedValue(undefined)
      canShare.mockReset().mockReturnValue(true)
      Object.assign(navigator, { share, canShare })
    })

    afterEach(() => {
      Reflect.deleteProperty(navigator, 'share')
      Reflect.deleteProperty(navigator, 'canShare')
    })

    it.each([
      ['txt', 'Sommer Mix.txt', 'text/plain'],
      ['csv', 'Sommer Mix.csv', 'text/csv'],
      ['youtube', 'Sommer Mix.txt', 'text/plain'],
    ] as const)('teilt %s als Datei', async (format, name, type) => {
      const wrapper = mountPreview({ playlistName: 'Sommer Mix', outputFormat: format })
      await wrapper.get('[data-action="share"]').trigger('click')
      await flushPromises()
      const data = share.mock.calls[0]![0] as ShareData
      expect(data.title).toBe('Sommer Mix')
      const file = data.files![0]!
      expect([file.name, file.type]).toEqual([name, type])
      expect(await new Response(file).text()).toBe(content)
    })

    it.each(['m3u', 'm3u8', 'pls', 'cue', 'xspf', 'json'] as const)(
      'teilt %s als Text, weil Chrome den Dateityp ablehnt',
      async (format) => {
        const wrapper = mountPreview({ outputFormat: format })
        await wrapper.get('[data-action="share"]').trigger('click')
        await flushPromises()
        expect(share).toHaveBeenCalledWith({ title: 'playlist', text: content })
        expect(canShare).not.toHaveBeenCalled()
      },
    )

    it('teilt als Text, wenn das System auch TXT nicht annimmt', async () => {
      canShare.mockReturnValue(false)
      const wrapper = mountPreview({ outputFormat: 'txt' })
      await wrapper.get('[data-action="share"]').trigger('click')
      await flushPromises()
      expect(share).toHaveBeenCalledWith({ title: 'playlist', text: content })
    })

    it('kopiert bei Ablehnung in die Zwischenablage, schweigt beim Abbruch', async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {})
      const writeText = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
      const wrapper = mountPreview()
      share.mockRejectedValueOnce(new DOMException('abgebrochen', 'AbortError'))
      await wrapper.get('[data-action="share"]').trigger('click')
      await flushPromises()
      expect(toasts.value).toEqual([])
      expect(writeText).not.toHaveBeenCalled()

      share.mockRejectedValueOnce(new DOMException('Permission denied', 'NotAllowedError'))
      await wrapper.get('[data-action="share"]').trigger('click')
      await flushPromises()
      expect(writeText).toHaveBeenCalledWith(content)
      expect(toasts.value.map((t) => [t.type, t.message])).toEqual([
        ['info', 'Teilen hier nicht möglich – die Playlist liegt in der Zwischenablage.'],
      ])

      writeText.mockRejectedValueOnce(new Error('kein Fokus'))
      share.mockRejectedValueOnce(new Error('kaputt'))
      await wrapper.get('[data-action="share"]').trigger('click')
      await flushPromises()
      expect(toasts.value.at(-1)?.message).toBe('Teilen fehlgeschlagen')
    })

    it('ist ohne Inhalt gesperrt und fehlt ohne Web Share API', () => {
      expect(
        mountPreview({ playlistContent: '' }).get('[data-action="share"]').attributes('disabled'),
      ).toBeDefined()
      Reflect.deleteProperty(navigator, 'share')
      expect(mountPreview().find('[data-action="share"]').exists()).toBe(false)
    })
  })

  it('meldet Speichern an die AppPage', async () => {
    const wrapper = mountPreview()
    await wrapper.get('.ui-button--primary').trigger('click')
    expect(wrapper.emitted('save')).toHaveLength(1)
  })

  it('öffnet den Bild-Dialog nur mit Inhalt', async () => {
    const empty = mountPreview({ playlistContent: '' })
    expect(empty.get('[data-action="share-image"]').attributes('disabled')).toBeDefined()

    const wrapper = mountPreview()
    const dialog = wrapper.findComponent({ name: 'ShareImageDialog' })
    expect(dialog.props('open')).toBe(false)
    await wrapper.get('[data-action="share-image"]').trigger('click')
    expect(dialog.props('open')).toBe(true)
  })
})
