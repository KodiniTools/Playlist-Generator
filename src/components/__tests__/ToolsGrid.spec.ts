import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import ToolsGrid from '../ToolsGrid.vue'
import { useTranslation } from '../../composables/useTranslation'

describe('ToolsGrid', () => {
  beforeEach(() => {
    useTranslation().setLanguage('de')
  })

  it('verweist auf die drei anderen KodiniTools in neuen Tabs', () => {
    const wrapper = mount(ToolsGrid)
    expect(wrapper.get('h2').text()).toBe('Entdecken Sie weitere Audio-Tools')
    expect(wrapper.attributes('aria-labelledby')).toBe(wrapper.get('h2').attributes('id'))

    const cards = wrapper.findAll('.tools__card')
    expect(cards.map((card) => card.get('h3').text())).toEqual([
      'Moderner Musikplayer',
      'Grafischer Equalizer',
      'Audio-Konverter',
    ])

    const links = wrapper.findAll('a.ui-button')
    expect(links.map((link) => link.attributes('href'))).toEqual([
      'https://kodinitools.com/ultimativermusikplayer/',
      'https://kodinitools.com/equaliser19/',
      'https://kodinitools.com/audiokonverter/',
    ])
    for (const link of links) {
      expect(link.attributes('target')).toBe('_blank')
      expect(link.attributes('rel')).toBe('noopener noreferrer')
      expect(link.text()).toBe('Ausprobieren')
    }
  })
})
