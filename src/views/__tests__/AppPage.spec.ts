import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AppPage from '../AppPage.vue'
import PlaylistConfig from '../../components/PlaylistConfig.vue'
import PlaylistPreview from '../../components/PlaylistPreview.vue'
import { usePlaylist } from '../../composables/usePlaylist'
import { useTranslation } from '../../composables/useTranslation'

const routeQuery: Record<string, string> = {}

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: routeQuery }),
  useRouter: () => ({ isReady: () => Promise.resolve() }),
  RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' },
}))

vi.mock('../../utils/sharedFileRepository', () => ({
  getSharedFiles: vi.fn(async () => []),
  clearSharedFiles: vi.fn(async () => {}),
  shareFiles: vi.fn(async () => {}),
}))

const { files, playlistName, playlistContent, outputFormat } = usePlaylist()

function mountPage() {
  return mount(AppPage, {
    global: {
      stubs: {
        PlaylistConfig: true,
        PlaylistPreview: true,
        AudioPlayer: true,
        ToolsGrid: true,
        KeyboardShortcutsPanel: true,
        OnboardingBanner: true,
        teleport: true,
      },
    },
  })
}

describe('AppPage', () => {
  beforeEach(() => {
    useTranslation().setLanguage('de')
    files.value = []
    playlistName.value = 'Sommer Mix'
    playlistContent.value = ''
    outputFormat.value = 'm3u'
    localStorage.clear()
    delete routeQuery.source
  })

  it('baut Kopfzeile, Einleitung, Arbeitsbereich und Footer auf', () => {
    const wrapper = mountPage()
    expect(wrapper.findAll('.app-header__link')).toHaveLength(4)
    expect(wrapper.get('.app-page__title').text()).toBe('Audio Wiedergabeliste Generator')
    expect(wrapper.get('.app-page__subtitle').text().length).toBeGreaterThan(0)

    const workspace = wrapper.get('.app-page__workspace')
    expect(workspace.findComponent(PlaylistConfig).exists()).toBe(true)
    expect(workspace.findComponent(PlaylistPreview).exists()).toBe(true)

    const footerButtons = wrapper.findAll('.app-page__footer .ui-button')
    expect(footerButtons).toHaveLength(2)
    expect(footerButtons.at(0)?.attributes('type')).toBe('submit')
    expect(wrapper.classes()).not.toContain('app-page--has-player')
  })

  it('reicht Playlist-Name und Wiedergabezustand an die Panels durch', () => {
    const wrapper = mountPage()
    expect(wrapper.findComponent(PlaylistPreview).props('playlistName')).toBe('Sommer Mix')
    const config = wrapper.findComponent(PlaylistConfig)
    expect(config.props('playingIndex')).toBe(-1)
    expect(config.props('isPlaying')).toBe(false)
    expect(config.props('playlistName')).toBe('Sommer Mix')
  })

  it('zeigt geteilte Dateien als Hinweis an', async () => {
    routeQuery.source = 'audiokonverter'
    const wrapper = mountPage()
    await flushPromises()
    const callout = wrapper.get('.ui-callout')
    expect(callout.classes()).toContain('ui-callout--warning')
    expect(callout.text()).toBe(useTranslation().t.value('sharedFilesEmpty'))
  })

  it('reserviert Platz für den Player, sobald Dateien vorhanden sind', async () => {
    files.value = [new File([new Uint8Array(4)], 'a.mp3')]
    const wrapper = mountPage()
    expect(wrapper.classes()).toContain('app-page--has-player')
  })
})

describe('AppPage – Übergabe an den Texteditor', () => {
  const content = '#EXTM3U\n#EXTINF:0,Track\ntrack.mp3'

  beforeEach(() => {
    useTranslation().setLanguage('de')
    files.value = []
    playlistName.value = 'Sommer Mix'
    // Format vor dem Inhalt setzen: bei leerer Dateiliste regeneriert der Watcher nichts.
    outputFormat.value = 'csv'
    playlistContent.value = content
    localStorage.clear()
    delete routeQuery.source
  })

  it('bietet nach dem Kopieren den Texteditor an und übergibt bei Zustimmung', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    const wrapper = mountPage()
    expect(wrapper.find('.ui-dialog').exists()).toBe(false)

    wrapper.findComponent(PlaylistPreview).vm.$emit('copied')
    await flushPromises()
    const dialog = wrapper.get('.ui-dialog')
    expect(dialog.get('.ui-dialog__title').text()).toBe('Im Texteditor öffnen?')
    expect(dialog.get('.ui-dialog__description').text()).toContain('„Sommer Mix.csv“')
    expect(dialog.get('.ui-dialog__description').text()).toContain('Zwischenablage')

    await dialog.get('[data-action="handoff-accept"]').trigger('click')
    expect(open).toHaveBeenCalledWith(
      'https://kodinitools.com/texteditor/app?source=playlist_generator',
      '_blank',
      'noopener',
    )
    const stored = JSON.parse(localStorage.getItem('kodinitools-texteditor-handoff-v1') ?? '{}')
    expect(stored).toMatchObject({
      version: 1,
      source: 'playlist_generator',
      name: 'Sommer Mix.csv',
      content,
      mimeType: 'text/csv',
    })
    expect(wrapper.find('.ui-dialog').exists()).toBe(false)
    open.mockRestore()
  })

  it('übergibt bei Ablehnung nichts', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    const wrapper = mountPage()
    wrapper.findComponent(PlaylistPreview).vm.$emit('copied')
    await flushPromises()

    await wrapper.get('[data-action="handoff-decline"]').trigger('click')
    expect(wrapper.find('.ui-dialog').exists()).toBe(false)
    expect(open).not.toHaveBeenCalled()
    expect(localStorage.getItem('kodinitools-texteditor-handoff-v1')).toBeNull()
    open.mockRestore()
  })

  it('bietet den Texteditor nach erfolgreichem Speichern an, nicht nach Abbruch', async () => {
    const write = vi.fn(async () => {})
    const close = vi.fn(async () => {})
    const picker = vi.fn(async () => ({ createWritable: async () => ({ write, close }) }))
    Object.defineProperty(window, 'showSaveFilePicker', { value: picker, configurable: true })

    const wrapper = mountPage()
    wrapper.findComponent(PlaylistPreview).vm.$emit('save')
    await flushPromises()
    expect(write).toHaveBeenCalledWith(content)
    expect(wrapper.get('.ui-dialog__description').text()).toContain('gespeichert')
    await wrapper.get('[data-action="handoff-decline"]').trigger('click')

    picker.mockRejectedValueOnce(Object.assign(new Error('cancel'), { name: 'AbortError' }))
    wrapper.findComponent(PlaylistPreview).vm.$emit('save')
    await flushPromises()
    expect(wrapper.find('.ui-dialog').exists()).toBe(false)
  })

  it('bietet ohne Inhalt nichts an', async () => {
    playlistContent.value = ''
    const wrapper = mountPage()
    wrapper.findComponent(PlaylistPreview).vm.$emit('copied')
    await flushPromises()
    expect(wrapper.find('.ui-dialog').exists()).toBe(false)
  })
})
