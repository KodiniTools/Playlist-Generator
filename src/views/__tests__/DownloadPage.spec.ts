import { beforeEach, describe, expect, it } from 'vitest'
import DownloadPage from '../DownloadPage.vue'
import { useTranslation } from '../../composables/useTranslation'
import { PAGE_LINKS, mountPage } from './pageTestUtils'

describe('DownloadPage', () => {
  beforeEach(() => {
    useTranslation().setLanguage('de')
  })

  it('zeigt Navigation, Überschrift und die drei Download-Dateien', () => {
    const wrapper = mountPage(DownloadPage)
    const links = wrapper.findAll('a.app-header__link')
    expect(links.map((link) => link.attributes('href'))).toEqual(PAGE_LINKS)
    expect(wrapper.get('h1').text()).toBe('Playlist Generator für Windows')

    const buttons = wrapper.findAll('.file-card a')
    expect(buttons.map((a) => a.attributes('href'))).toEqual([
      '/playlist_generator/downloads/Playlist-Generator-Setup-x64.exe',
      '/playlist_generator/downloads/Playlist-Generator-x64-de-DE.msi',
      '/playlist_generator/downloads/Playlist-Generator-x64-en-US.msi',
    ])
    expect(buttons.map((a) => a.text())).toEqual([
      'EXE herunterladen',
      'MSI herunterladen',
      'MSI herunterladen',
    ])
    expect(buttons.every((a) => a.attributes('download') !== undefined)).toBe(true)
    expect(wrapper.findAll('.file-card--recommended')).toHaveLength(1)
  })

  it('übersetzt ins Englische', async () => {
    const wrapper = mountPage(DownloadPage)
    useTranslation().setLanguage('en')
    await wrapper.vm.$nextTick()
    expect(wrapper.get('h1').text()).toBe('Playlist Generator for Windows')
    expect(wrapper.get('.file-card a').text()).toBe('Download EXE')
  })
})
