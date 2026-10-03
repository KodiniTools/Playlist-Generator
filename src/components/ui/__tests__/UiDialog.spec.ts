import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UiDialog from '../UiDialog.vue'

function mountDialog(open: boolean) {
  return mount(UiDialog, {
    props: { open, title: 'Liste leeren?', description: '4 Titel werden entfernt.' },
    slots: { footer: '<button data-test="confirm">Leeren</button>' },
    global: { stubs: { teleport: true } },
  })
}

describe('UiDialog', () => {
  it('rendert geschlossen nichts', () => {
    const wrapper = mountDialog(false)
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('rendert geöffnet einen modalen Dialog mit Titel, Beschreibung und Footer', () => {
    const wrapper = mountDialog(true)
    const dialog = wrapper.get('[role="dialog"]')
    const title = wrapper.get('h2')
    const description = wrapper.get('.ui-dialog__description')
    expect(dialog.attributes('aria-modal')).toBe('true')
    expect(dialog.attributes('aria-labelledby')).toBe(title.attributes('id'))
    expect(dialog.attributes('aria-describedby')).toBe(description.attributes('id'))
    expect(title.text()).toBe('Liste leeren?')
    expect(wrapper.get('.ui-dialog__footer [data-test="confirm"]').text()).toBe('Leeren')
  })

  it('meldet close bei Escape, Klick auf den Hintergrund und den Schließen-Button', async () => {
    const wrapper = mountDialog(true)
    await wrapper.get('[role="dialog"]').trigger('keydown', { key: 'Escape' })
    await wrapper.get('.ui-dialog__backdrop').trigger('click')
    await wrapper.get('.ui-icon-button').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(3)
  })

  it('schließt nicht bei Klicks innerhalb des Dialogs', async () => {
    const wrapper = mountDialog(true)
    await wrapper.get('[role="dialog"]').trigger('click')
    await wrapper.get('[data-test="confirm"]').trigger('click')
    expect(wrapper.emitted('close')).toBeUndefined()
  })
})
