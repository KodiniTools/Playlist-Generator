import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import DesktopBar from '../DesktopBar.vue'
import { useTranslation } from '../../../composables/useTranslation'

describe('DesktopBar (nur Desktop-App)', () => {
  const { setLanguage } = useTranslation()

  beforeEach(() => {
    setLanguage('de')
  })

  afterEach(() => {
    setLanguage('de')
  })

  it('schaltet die Sprache über dieselben Schlüssel wie die Server-Navigation', async () => {
    const wrapper = mount(DesktopBar)
    await wrapper.find('[data-value="en"]').trigger('click')

    expect(useTranslation().currentLanguage.value).toBe('en')
    expect(localStorage.getItem('locale')).toBe('en')
    expect(document.documentElement.lang).toBe('en')
    expect(wrapper.find('[data-value="light"]').text()).toBe('Light')
    wrapper.unmount()
  })

  it('schaltet das Farbschema (body.light-theme und html[data-theme])', async () => {
    const wrapper = mount(DesktopBar)
    // Erst die Beobachter von useTheme() (MutationObserver) zur Ruhe kommen lassen
    await flushPromises()
    await wrapper.find('[data-value="light"]').trigger('click')
    expect(document.body.classList.contains('light-theme')).toBe(true)
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(localStorage.getItem('theme')).toBe('light')

    await wrapper.find('[data-value="dark"]').trigger('click')
    expect(document.body.classList.contains('light-theme')).toBe(false)
    wrapper.unmount()
  })
})
