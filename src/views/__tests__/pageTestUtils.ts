import type { Component } from 'vue'
import { mount } from '@vue/test-utils'

/** RouterLink-Ersatz ohne Router-Instanz: rendert einen Anker mit dem Ziel als href. */
export const RouterLinkStub = {
  props: ['to'],
  template: '<a :href="to"><slot /></a>',
}

export function mountPage(page: Component) {
  return mount(page, { global: { stubs: { RouterLink: RouterLinkStub } } })
}

/** Erwartete Reihenfolge der Seitenlinks im AppHeader. */
export const PAGE_LINKS = ['/', '/app', '/faq', '/blog']
