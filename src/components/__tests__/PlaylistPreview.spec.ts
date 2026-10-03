import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
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

  it('zeigt ohne Inhalt den Leerzustand und sperrt Kopieren', () => {
    const wrapper = mountPreview({ playlistContent: '' })
    expect(wrapper.find('.playlist-preview__lines').exists()).toBe(false)
    expect(wrapper.get('.ui-empty__title').text()).toBe('Noch keine Vorschau')
    expect(wrapper.get('.ui-icon-button').attributes('disabled')).toBeDefined()
    expect(wrapper.get('.ui-button--secondary').attributes('disabled')).toBeDefined()
    expect(wrapper.get('.ui-button--primary').attributes('disabled')).toBeUndefined()
  })

  it('kopiert in die Zwischenablage und meldet Erfolg oder Fehler als Toast', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })

    const wrapper = mountPreview()
    await wrapper.get('.ui-button--secondary').trigger('click')
    await flushPromises()
    expect(writeText).toHaveBeenCalledWith(content)
    expect(toasts.value.map((toast) => toast.type)).toEqual(['success'])

    writeText.mockRejectedValueOnce(new Error('denied'))
    await wrapper.get('.ui-icon-button').trigger('click')
    await flushPromises()
    expect(toasts.value.map((toast) => toast.type)).toEqual(['success', 'error'])
  })

  it('meldet Speichern an die AppPage', async () => {
    const wrapper = mountPreview()
    await wrapper.get('.ui-button--primary').trigger('click')
    expect(wrapper.emitted('save')).toHaveLength(1)
  })
})
