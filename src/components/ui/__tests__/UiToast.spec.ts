import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UiToast from '../UiToast.vue'

describe('UiToast', () => {
  it('ist standardmäßig eine Info mit role=status', () => {
    const wrapper = mount(UiToast, { props: { message: '4 Dateien hinzugefügt' } })
    expect(wrapper.attributes('role')).toBe('status')
    expect(wrapper.classes()).toContain('ui-toast--info')
    expect(wrapper.get('.ui-toast__message').text()).toBe('4 Dateien hinzugefügt')
    expect(wrapper.find('.ui-button').exists()).toBe(false)
    expect(wrapper.get('.ui-icon-button').attributes('aria-label')).toBe('Schließen')
  })

  it('macht Fehler zu role=alert', () => {
    const wrapper = mount(UiToast, { props: { message: 'Fehler', type: 'error' } })
    expect(wrapper.attributes('role')).toBe('alert')
    expect(wrapper.classes()).toContain('ui-toast--error')
  })

  it('meldet Aktion und Schließen als Events', async () => {
    const wrapper = mount(UiToast, {
      props: { message: 'Gespeichert', type: 'success', actionLabel: 'Rückgängig' },
    })
    await wrapper.get('.ui-button').trigger('click')
    await wrapper.get('.ui-icon-button').trigger('click')
    expect(wrapper.emitted('action')).toHaveLength(1)
    expect(wrapper.emitted('dismiss')).toHaveLength(1)
  })
})
