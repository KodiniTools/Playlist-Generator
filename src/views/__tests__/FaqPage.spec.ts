import { beforeEach, describe, expect, it } from 'vitest'
import FaqPage from '../FaqPage.vue'
import { useTranslation } from '../../composables/useTranslation'
import { PAGE_LINKS, mountPage } from './pageTestUtils'

describe('FaqPage', () => {
  beforeEach(() => {
    useTranslation().setLanguage('de')
  })

  it('nutzt den gemeinsamen AppHeader statt der Legacy-Kopfleiste', () => {
    const wrapper = mountPage(FaqPage)
    const links = wrapper.findAll('header.app-header a.app-header__link')
    expect(links.map((link) => link.attributes('href'))).toEqual(PAGE_LINKS)
    expect(wrapper.find('.page-header').exists()).toBe(false)
  })

  it('zeigt den übersetzten Seitentitel', async () => {
    const wrapper = mountPage(FaqPage)
    expect(wrapper.get('h1').text()).toBe('Häufig gestellte Fragen')

    useTranslation().setLanguage('en')
    await wrapper.vm.$nextTick()
    expect(wrapper.get('h1').text()).toBe('Frequently Asked Questions')
  })
})
