import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { useAppShortcuts, type AppShortcutHandlers } from '../useAppShortcuts'
import { isImportableFileName } from '../useFileImport'

function setup(moveResult = true) {
  const handlers: AppShortcutHandlers = {
    openFiles: vi.fn(),
    save: vi.fn(),
    copy: vi.fn(),
    deleteSelected: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    moveSelection: vi.fn(() => moveResult),
    clearSelection: vi.fn(),
  }
  const wrapper = mount(
    defineComponent({
      setup() {
        useAppShortcuts(handlers)
        return () => h('div')
      },
    }),
    { attachTo: document.body },
  )
  return { handlers, wrapper }
}

const press = (key: string, init: KeyboardEventInit = {}) => {
  const event = new KeyboardEvent('keydown', { key, cancelable: true, ...init })
  window.dispatchEvent(event)
  return event
}

let unmount: (() => void) | null = null
afterEach(() => {
  unmount?.()
  unmount = null
  document.body.innerHTML = ''
})

describe('useAppShortcuts', () => {
  it('ordnet Tasten den Aktionen zu', () => {
    const { handlers, wrapper } = setup()
    unmount = () => wrapper.unmount()

    expect(press('o', { ctrlKey: true }).defaultPrevented).toBe(true)
    press('s', { metaKey: true })
    press('c', { ctrlKey: true })
    press('Delete')
    press('z', { ctrlKey: true })
    press('Z', { ctrlKey: true, shiftKey: true })
    press('y', { ctrlKey: true })
    press('ArrowDown')
    press('ArrowUp')
    press('Escape')

    expect(handlers.openFiles).toHaveBeenCalledOnce()
    expect(handlers.save).toHaveBeenCalledOnce()
    expect(handlers.copy).toHaveBeenCalledOnce()
    expect(handlers.deleteSelected).toHaveBeenCalledOnce()
    expect(handlers.undo).toHaveBeenCalledOnce()
    expect(handlers.redo).toHaveBeenCalledTimes(2)
    expect(handlers.moveSelection).toHaveBeenNthCalledWith(1, 1)
    expect(handlers.moveSelection).toHaveBeenNthCalledWith(2, -1)
    expect(handlers.clearSelection).toHaveBeenCalledOnce()
  })

  it('lässt Pfeile scrollen, wenn es nichts zu markieren gibt', () => {
    const { wrapper } = setup(false)
    unmount = () => wrapper.unmount()
    expect(press('ArrowDown').defaultPrevented).toBe(false)
  })

  it('greift nicht in Eingabefeldern und nicht mehr nach dem Unmount', () => {
    const { handlers, wrapper } = setup()
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()
    press('Delete')
    expect(handlers.deleteSelected).not.toHaveBeenCalled()

    input.blur()
    wrapper.unmount()
    press('Delete')
    expect(handlers.deleteSelected).not.toHaveBeenCalled()
  })
})

describe('isImportableFileName', () => {
  it('nimmt Audio, Playlists und ZIP an', () => {
    expect(['a.mp3', 'b.FLAC', 'c.m3u8', 'd.xspf', 'e.zip'].every(isImportableFileName)).toBe(true)
    expect(isImportableFileName('cover.jpg')).toBe(false)
  })
})
