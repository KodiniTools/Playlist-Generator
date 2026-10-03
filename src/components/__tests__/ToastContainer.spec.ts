import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ToastContainer from '../ToastContainer.vue'
import { useToast } from '../../composables/useToast'
import { useTranslation } from '../../composables/useTranslation'

const { toasts, addToast } = useToast()

function mountContainer() {
  return mount(ToastContainer, { global: { stubs: { teleport: true } } })
}

describe('ToastContainer', () => {
  beforeEach(() => {
    useTranslation().setLanguage('de')
    toasts.value.splice(0)
  })

  it('zeigt jeden Toast aus dem Store als UiToast mit Typ und Nachricht', async () => {
    const wrapper = mountContainer()
    addToast('Gespeichert', 'success', 0)
    addToast('Fehlgeschlagen', 'error', 0)
    await wrapper.vm.$nextTick()

    const rendered = wrapper.findAll('.ui-toast')
    expect(rendered.map((toast) => toast.get('.ui-toast__message').text())).toEqual([
      'Gespeichert',
      'Fehlgeschlagen',
    ])
    expect(rendered.at(0)?.classes()).toContain('ui-toast--success')
    expect(rendered.at(1)?.attributes('role')).toBe('alert')
    expect(rendered.at(0)?.get('.ui-icon-button').attributes('aria-label')).toBe('Schließen')
  })

  it('entfernt Toasts über den Schließen-Button und per Klick auf die Fläche', async () => {
    const wrapper = mountContainer()
    addToast('Eins', 'info', 0)
    addToast('Zwei', 'info', 0)
    await wrapper.vm.$nextTick()

    await wrapper.findAll('.ui-toast').at(0)?.get('.ui-icon-button').trigger('click')
    expect(toasts.value.map((toast) => toast.message)).toEqual(['Zwei'])

    await wrapper.get('.ui-toast__message').trigger('click')
    expect(toasts.value).toHaveLength(0)
  })

  it('führt die Aktion aus und schließt den Toast danach', async () => {
    const wrapper = mountContainer()
    const callback = vi.fn()
    addToast('Datei entfernt', 'info', 0, { label: 'Rückgängig', callback })
    await wrapper.vm.$nextTick()

    const action = wrapper.get('.ui-toast .ui-button')
    expect(action.text()).toBe('Rückgängig')
    await action.trigger('click')
    expect(callback).toHaveBeenCalledTimes(1)
    expect(toasts.value).toHaveLength(0)
  })
})
