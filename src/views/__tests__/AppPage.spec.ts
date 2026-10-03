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

const { files, playlistName } = usePlaylist()

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
      },
    },
  })
}

describe('AppPage', () => {
  beforeEach(() => {
    useTranslation().setLanguage('de')
    files.value = []
    playlistName.value = 'Sommer Mix'
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
