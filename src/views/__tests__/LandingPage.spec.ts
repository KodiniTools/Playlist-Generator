import { describe, it, expect, beforeEach } from 'vitest'
import LandingPage from '../LandingPage.vue'
import { useTranslation } from '../../composables/useTranslation'
import { PAGE_LINKS, mountPage } from './pageTestUtils'

const KODINI_TOOL_URLS = [
  'https://kodinitools.com/playlistkonverter/',
  'https://kodinitools.com/audiokonverter/',
  'https://kodinitools.com/audionormalisierer/',
]

function mountLandingPage() {
  return mountPage(LandingPage)
}

describe('LandingPage – KodiniTools section', () => {
  beforeEach(() => {
    useTranslation().setLanguage('de')
  })

  it('links to the three KodiniTools', () => {
    const wrapper = mountLandingPage()
    const links = wrapper.findAll('a.tool-link-card')

    expect(links).toHaveLength(3)
    expect(links.map((l) => l.attributes('href'))).toEqual(KODINI_TOOL_URLS)
  })

  it('opens the tools in a new tab safely', () => {
    const wrapper = mountLandingPage()

    for (const link of wrapper.findAll('a.tool-link-card')) {
      expect(link.attributes('target')).toBe('_blank')
      expect(link.attributes('rel')).toBe('noopener noreferrer')
    }
  })

  it('renders translated titles in German and English', () => {
    const wrapper = mountLandingPage()
    const section = () => wrapper.find('#kodinitools')

    expect(section().text()).toContain('Audio Wiedergabeliste Konverter')
    expect(section().text()).toContain('Audio Konverter')
    expect(section().text()).toContain('Audio Normalizer')

    useTranslation().setLanguage('en')
    return wrapper.vm.$nextTick().then(() => {
      expect(section().text()).toContain('Audio Playlist Converter')
      expect(section().text()).toContain('Audio Converter')
      expect(section().text()).toContain('Audio Normalizer')
      // No untranslated keys leak into the DOM
      expect(section().text()).not.toContain('landing_tool')
    })
  })
})

describe('LandingPage – Kopfleiste', () => {
  beforeEach(() => {
    useTranslation().setLanguage('de')
  })

  it('nutzt den gemeinsamen AppHeader statt der Legacy-Kopfleiste', () => {
    const wrapper = mountLandingPage()
    const links = wrapper.findAll('header.app-header a.app-header__link')
    expect(links.map((link) => link.attributes('href'))).toEqual(PAGE_LINKS)
    expect(wrapper.find('.page-header').exists()).toBe(false)
    expect(wrapper.get('.hero-title').text()).toBe('Audio Wiedergabeliste Generator')
  })
})

describe('LandingPage – Aktionen', () => {
  beforeEach(() => {
    useTranslation().setLanguage('de')
  })

  it('führt mit UiButtons zur App und zu den Features', () => {
    const wrapper = mountLandingPage()
    const { t } = useTranslation()
    const toApp = wrapper.findAll('a.ui-button--primary[href="/app"]')
    expect(toApp.map((link) => link.text())).toEqual([t.value('hero_cta'), t.value('cta_button')])
    expect(wrapper.get('a.ui-button--secondary[href="#features"]').text()).toBe('Mehr erfahren')
    expect(wrapper.get('a.scroll-indicator').attributes('aria-label')).toBe('Mehr erfahren')
    expect(wrapper.find('.btn').exists()).toBe(false)
  })
})
