import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import KeyboardShortcutsPanel from '../KeyboardShortcutsPanel.vue'
import { useTranslation } from '../../composables/useTranslation'

function mountPanel() {
  return mount(KeyboardShortcutsPanel, {
    attachTo: document.body,
    global: { stubs: { teleport: true } },
  })
}

async function pressKey(key: string) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
  await nextTick()
}

describe('KeyboardShortcutsPanel', () => {
  beforeEach(() => {
    useTranslation().setLanguage('de')
    document.body.innerHTML = ''
  })

  it('öffnet den Dialog über den Fragezeichen-Button und listet alle Kürzel', async () => {
    const wrapper = mountPanel()
    const trigger = wrapper.get('.ui-icon-button')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(trigger.attributes('aria-controls')).toBe('shortcuts-panel')
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)

    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('true')
    const dialog = wrapper.get('[role="dialog"]')
    expect(dialog.attributes('id')).toBe('shortcuts-panel')
    expect(wrapper.get('h2').text()).toBe('Tastaturkürzel')

    const items = wrapper.findAll('.shortcuts__item')
    expect(items).toHaveLength(9)
    expect(
      items
        .at(0)
        ?.findAll('kbd')
        .map((key) => key.text()),
    ).toEqual(['Ctrl', 'O'])
    expect(items.at(0)?.get('.shortcuts__desc').text().length).toBeGreaterThan(0)
    wrapper.unmount()
  })

  it('reagiert auf die Taste ? und schließt mit Escape, aber nicht beim Tippen', async () => {
    const wrapper = mountPanel()
    await pressKey('?')
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)

    await pressKey('Escape')
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)

    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()
    await pressKey('?')
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    wrapper.unmount()
  })
})
