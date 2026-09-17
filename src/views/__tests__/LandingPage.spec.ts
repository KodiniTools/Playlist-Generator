import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import LandingPage from '../LandingPage.vue'
import { useTranslation } from '../../composables/useTranslation'

const KODINI_TOOL_URLS = [
  'https://kodinitools.com/playlistkonverter/',
  'https://kodinitools.com/audiokonverter/',
  'https://kodinitools.com/audionormalisierer/',
]

function mountLandingPage() {
  return mount(LandingPage, {
    global: {
      stubs: {
        // Landing page uses <router-link>; render as plain anchor without a router instance
        RouterLink: { template: '<a><slot /></a>' },
      },
    },
  })
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
