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

describe('LandingPage – Aufbau nach dem Vorbild Audio Normalizer', () => {
  beforeEach(() => {
    useTranslation().setLanguage('de')
  })

  it('hat die Sektionen Hero, Funktionen, Vorteile, FAQ und weitere Tools in dieser Reihenfolge', () => {
    const wrapper = mountLandingPage()
    const sections = wrapper.findAll('.landing-page > section')
    expect(sections.map((section) => section.classes()[0])).toEqual([
      'hero',
      'features',
      'benefits',
      'faq',
      'tools-section',
    ])
    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.findAll('.feature-card')).toHaveLength(6)
    expect(wrapper.findAll('.benefit-card')).toHaveLength(3)
    expect(wrapper.findAll('.faq-item')).toHaveLength(6)
  })

  it('führt im Hero mit genau einem Button zur App', () => {
    const wrapper = mountLandingPage()
    const { t } = useTranslation()
    const links = wrapper.findAll('.hero a')
    expect(links).toHaveLength(1)
    expect(links[0]?.attributes('href')).toBe('/app')
    expect(links[0]?.text()).toBe(`${t.value('hero_cta')} →`)
  })

  it('zeigt das Hero-Bild der Sprache mit festen Maßen (kein Layout-Shift)', async () => {
    const wrapper = mountLandingPage()
    const image = () => wrapper.get('.hero-media img')
    expect(image().attributes('src')).toMatch(/playlist-generator-landingpage-de\.webp$/)
    expect(image().attributes('width')).toBe('1120')
    expect(image().attributes('height')).toBe('630')
    expect(image().attributes('alt')).toBe(useTranslation().t.value('hero_image_alt'))

    useTranslation().setLanguage('en')
    await wrapper.vm.$nextTick()
    expect(image().attributes('src')).toMatch(/playlist-generator-landingpage-en\.webp$/)
  })

  it('klappt FAQ-Antworten per Button auf und zu (aria-expanded)', async () => {
    const wrapper = mountLandingPage()
    const first = wrapper.get('.faq-item')
    const button = first.get('button.faq-question')
    expect(button.attributes('aria-expanded')).toBe('false')
    expect(first.get('.faq-answer').isVisible()).toBe(false)

    await button.trigger('click')
    expect(button.attributes('aria-expanded')).toBe('true')
    expect(first.classes()).toContain('faq-open')
    expect(first.get('.faq-answer').text()).toContain('M3U')

    await button.trigger('click')
    expect(button.attributes('aria-expanded')).toBe('false')
  })
})
