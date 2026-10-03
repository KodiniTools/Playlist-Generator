import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App.vue'
import { useTranslation } from '../composables/useTranslation'

/** jsdom kennt keinen ResizeObserver; die App beobachtet damit die SSI-Navigation. */
class ResizeObserverStub {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

function mountApp() {
  return mount(App, {
    attachTo: document.body,
    global: { stubs: { RouterView: true, ToastContainer: true } },
  })
}

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', ResizeObserverStub)
    localStorage.clear()
    useTranslation().setLanguage('de')
    document.body.innerHTML = '<div class="external-nav-wrapper"><nav>SSI</nav></div>'
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  it('übernimmt Sprachwechsel der SSI-Navigation aus dem language-changed-Event', () => {
    const wrapper = mountApp()
    const { currentLanguage } = useTranslation()

    window.dispatchEvent(new CustomEvent('language-changed', { detail: { lang: 'en' } }))
    expect(currentLanguage.value).toBe('en')

    // Ohne lang im detail bleibt die Sprache unverändert
    window.dispatchEvent(new CustomEvent('language-changed', { detail: {} }))
    expect(currentLanguage.value).toBe('en')

    wrapper.unmount()
    window.dispatchEvent(new CustomEvent('language-changed', { detail: { lang: 'de' } }))
    expect(currentLanguage.value).toBe('en')
  })

  it('misst die Höhe der externen Navigation und schreibt sie als CSS-Variable', () => {
    const wrapper = mountApp()
    expect(document.documentElement.style.getPropertyValue('--external-nav-height')).toMatch(
      /^\d+px$/,
    )
    wrapper.unmount()
  })
})
