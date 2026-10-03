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

  it('zeigt den Datenschutzhinweis als Erfolgs-Callout', () => {
    const wrapper = mountPage(FaqPage)
    const callout = wrapper.get('.privacy-notice')
    expect(callout.classes()).toContain('ui-callout--success')
    expect(callout.get('.ui-callout__title').text()).toBe(useTranslation().t.value('privacy_title'))
    expect(callout.text()).toContain(useTranslation().t.value('privacy_text'))
  })

  it('rendert alle neun Fragen übersetzt und führt per UiButton zur App', () => {
    const wrapper = mountPage(FaqPage)
    const questions = wrapper.findAll('details')
    expect(questions).toHaveLength(9)
    expect(questions[0]?.get('summary').text()).toBe(useTranslation().t.value('faq_q1_title'))
    expect(wrapper.text()).not.toContain('faq_q')
    expect(wrapper.get('a.ui-button--primary[href="/app"]').text()).toBe(
      useTranslation().t.value('cta_button'),
    )
  })

  it('zeigt den übersetzten Seitentitel', async () => {
    const wrapper = mountPage(FaqPage)
    expect(wrapper.get('h1').text()).toBe('Häufig gestellte Fragen')

    useTranslation().setLanguage('en')
    await wrapper.vm.$nextTick()
    expect(wrapper.get('h1').text()).toBe('Frequently Asked Questions')
  })
})
