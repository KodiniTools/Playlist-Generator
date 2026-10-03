import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import UndoRedoControls from '../UndoRedoControls.vue'
import { useTranslation } from '../../composables/useTranslation'
import { useUndoRedo } from '../../composables/useUndoRedo'

vi.mock('../../composables/useUndoRedo', async () => {
  const { computed, ref } = await import('vue')
  const canUndo = ref(true)
  const canRedo = ref(false)
  const state = {
    canUndo,
    canRedo,
    undoTitle: computed(() =>
      canUndo.value ? 'Rückgängig: Datei hinzugefügt' : 'Nichts rückgängig zu machen',
    ),
    redoTitle: computed(() =>
      canRedo.value ? 'Wiederholen: Sortierung' : 'Nichts zu wiederholen',
    ),
    performUndo: vi.fn(() => true),
    performRedo: vi.fn(() => true),
  }
  return { useUndoRedo: () => state }
})

const state = useUndoRedo()

describe('UndoRedoControls', () => {
  beforeEach(() => {
    useTranslation().setLanguage('de')
    state.canUndo.value = true
    state.canRedo.value = false
    vi.mocked(state.performUndo).mockClear()
    vi.mocked(state.performRedo).mockClear()
  })

  it('rendert eine beschriftete Gruppe mit zwei Buttons und deren Zuständen', () => {
    const wrapper = mount(UndoRedoControls)
    expect(wrapper.attributes('role')).toBe('group')
    expect(wrapper.attributes('aria-label')).toBe('Rückgängig / Wiederholen')

    const [undo, redo] = wrapper.findAll('button')
    expect(undo?.attributes('aria-label')).toBe('Rückgängig: Datei hinzugefügt')
    expect(undo?.attributes('title')).toBe('Rückgängig: Datei hinzugefügt')
    expect(undo?.attributes('disabled')).toBeUndefined()
    expect(undo?.text()).toBe('Rückgängig')

    expect(redo?.attributes('aria-label')).toBe('Nichts zu wiederholen')
    expect(redo?.attributes('disabled')).toBeDefined()
    expect(redo?.text()).toBe('Wiederholen')
  })

  it('ruft performUndo und performRedo auf, aber nicht im gesperrten Zustand', async () => {
    const wrapper = mount(UndoRedoControls)
    await wrapper.get('[data-action="undo"]').trigger('click')
    await wrapper.get('[data-action="redo"]').trigger('click')
    expect(state.performUndo).toHaveBeenCalledTimes(1)
    expect(state.performRedo).not.toHaveBeenCalled()

    state.canRedo.value = true
    await wrapper.vm.$nextTick()
    expect(wrapper.get('[data-action="redo"]').attributes('disabled')).toBeUndefined()
    await wrapper.get('[data-action="redo"]').trigger('click')
    expect(state.performRedo).toHaveBeenCalledTimes(1)
  })
})
