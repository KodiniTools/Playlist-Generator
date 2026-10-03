import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import AppHeader from '../AppHeader.vue'
import { useTranslation } from '../../composables/useTranslation'

const RouterLinkStub = {
  props: ['to'],
  template: '<a :href="to"><slot /></a>',
}

function mountHeader(slots = {}) {
  return mount(AppHeader, { slots, global: { stubs: { RouterLink: RouterLinkStub } } })
}

describe('AppHeader', () => {
  beforeEach(() => {
    useTranslation().setLanguage('de')
  })

  it('rendert die vier Seitenlinks in einer beschrifteten Navigation', () => {
    const wrapper = mountHeader()
    expect(wrapper.get('nav').attributes('aria-label')).toBe('Seiten')
    const links = wrapper.findAll('a.app-header__link')
    expect(links.map((link) => link.attributes('href'))).toEqual(['/', '/app', '/faq', '/blog'])
    expect(links.map((link) => link.text())).toEqual(['Start', 'App', 'FAQ', 'Blog'])
    expect(wrapper.find('.app-header__actions').exists()).toBe(false)
  })

  it('zeigt Aktionen rechts, wenn der Slot befüllt ist', () => {
    const wrapper = mountHeader({ actions: '<button data-test="help">?</button>' })
    expect(wrapper.get('.app-header__actions [data-test="help"]').text()).toBe('?')
  })
})
