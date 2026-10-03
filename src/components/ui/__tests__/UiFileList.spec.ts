import { mount, type DOMWrapper } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import UiFileList from '../UiFileList.vue'
import type { FileListItem } from '../types'

const items: FileListItem[] = [
  { id: 'a', name: 'Summer_Mix.mp3', size: 9227469, duration: 221 },
  { id: 'b', name: 'Chill_Vibes.mp3', size: 10590617, duration: 252 },
  { id: 'c', name: 'Road_Trip.flac', size: 15309209, duration: null },
  { id: 'd', name: 'Evening_Jazz.wav', size: 4928307, duration: 214 },
]

type Props = InstanceType<typeof UiFileList>['$props']

function mountList(props: Partial<Props> = {}) {
  return mount(UiFileList, { props: { items, ...props } })
}

function row(wrapper: ReturnType<typeof mountList>, index: number) {
  return wrapper.get(`[data-index="${index}"]`)
}

/** Native PointerEvents: jsdom kennt sie, Vue Test Utils kann ihre Getter aber nicht setzen. */
async function pointer(target: DOMWrapper<Element>, type: string, init: PointerEventInit = {}) {
  target.element.dispatchEvent(
    new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, ...init }),
  )
  await nextTick()
}

function mockRowRects(wrapper: ReturnType<typeof mountList>) {
  wrapper.findAll<HTMLLIElement>('.ui-file-list__row').forEach((item, index) => {
    item.element.getBoundingClientRect = () =>
      ({ top: index * 44, bottom: index * 44 + 44, height: 44 }) as DOMRect
  })
}

describe('UiFileList', () => {
  it('rendert jede Datei als Zeile mit Name, Format, Dauer und Größe', () => {
    const wrapper = mountList({ selectedIndex: 1 })
    const rows = wrapper.findAll('.ui-file-list__row')
    expect(rows).toHaveLength(4)
    expect(row(wrapper, 0).get('.ui-file-list__name-text').text()).toBe('Summer_Mix.mp3')
    expect(row(wrapper, 0).get('.ui-file-list__chip').text()).toBe('mp3')
    expect(row(wrapper, 0).get('.ui-file-list__duration').text()).toBe('3:41')
    expect(row(wrapper, 0).get('.ui-file-list__size').text()).toBe('8,8 MB')
    expect(row(wrapper, 2).get('.ui-file-list__duration').text()).toBe('–')

    expect(row(wrapper, 1).attributes('aria-current')).toBe('true')
    expect(rows.map((item) => item.attributes('tabindex'))).toEqual(['-1', '0', '-1', '-1'])
  })

  it('zeigt ohne Dateien den Leerzustand', () => {
    const wrapper = mountList({ items: [] })
    expect(wrapper.find('.ui-file-list__rows').exists()).toBe(false)
    expect(wrapper.get('.ui-empty__title').text()).toBe('Noch keine Dateien')
    expect(wrapper.find('.ui-file-list__summary').exists()).toBe(false)
  })

  it('markiert per Klick, spielt per Doppelklick und über die Aktionen', async () => {
    const wrapper = mountList()
    await row(wrapper, 2).trigger('click')
    expect(wrapper.emitted('update:selectedIndex')).toEqual([[2]])

    await row(wrapper, 2).trigger('dblclick')
    expect(wrapper.emitted('play')).toEqual([[2]])

    const actions = row(wrapper, 1).findAll('.ui-icon-button')
    expect(actions.map((button) => button.attributes('aria-label'))).toEqual([
      'Abspielen: Chill_Vibes.mp3',
      'Entfernen: Chill_Vibes.mp3',
    ])
    await actions.at(0)?.trigger('click')
    await actions.at(1)?.trigger('click')
    expect(wrapper.emitted('play')).toEqual([[2], [1]])
    expect(wrapper.emitted('remove')).toEqual([[1]])
    expect(wrapper.emitted('update:selectedIndex')).toEqual([[2]])
  })

  it('zeigt den laufenden Titel mit Pause-Aktion', () => {
    const wrapper = mountList({ playingIndex: 1, isPlaying: true })
    expect(row(wrapper, 1).classes()).toContain('ui-file-list__row--playing')
    expect(row(wrapper, 1).find('.ui-file-list__playing').exists()).toBe(true)
    expect(row(wrapper, 1).get('.ui-icon-button').attributes('aria-label')).toBe(
      'Pause: Chill_Vibes.mp3',
    )
    expect(row(wrapper, 0).find('.ui-file-list__playing').exists()).toBe(false)
  })

  it('verwaltet die Häkchen einzeln und über "Alle auswählen"', async () => {
    const wrapper = mountList({ checked: ['a', 'b', 'd'] })
    await nextTick()
    const selectAll = wrapper.get<HTMLInputElement>('.ui-file-list__select-all input')
    expect(selectAll.element.checked).toBe(false)
    expect(selectAll.element.indeterminate).toBe(true)
    expect(wrapper.get('.ui-file-list__count').text()).toBe('3/4')

    await row(wrapper, 2).get('input[type="checkbox"]').trigger('change')
    await row(wrapper, 0).get('input[type="checkbox"]').trigger('change')
    expect(wrapper.emitted('update:checked')).toEqual([[['a', 'b', 'd', 'c']], [['b', 'd']]])

    await selectAll.setValue(true)
    expect(wrapper.emitted('update:checked')?.at(-1)).toEqual([['a', 'b', 'c', 'd']])
  })

  it('fasst nur angehakte Titel zusammen und markiert Schätzungen', () => {
    const parts = (wrapper: ReturnType<typeof mountList>) =>
      wrapper
        .get('.ui-file-list__summary')
        .findAll('span')
        .map((span) => span.text())
        .filter((part) => part !== '·')

    expect(parts(mountList({ checked: ['a', 'b'] }))).toEqual(['2 Titel', '8 min', '18,9 MB'])

    const estimated = parts(mountList())
    expect(estimated.at(0)).toBe('4 Titel')
    expect(estimated.at(1)?.startsWith('~')).toBe(true)
    expect(estimated.at(2)).toBe('38,2 MB')
  })

  it('navigiert, spielt, hakt ab, entfernt und verschiebt per Tastatur', async () => {
    const wrapper = mount(UiFileList, {
      props: { items, selectedIndex: 1 },
      attachTo: document.body,
    })
    const outer = vi.fn()
    window.addEventListener('keydown', outer)

    await row(wrapper, 1).trigger('keydown', { key: 'ArrowDown' })
    await row(wrapper, 1).trigger('keydown', { key: 'ArrowUp' })
    await row(wrapper, 1).trigger('keydown', { key: 'End' })
    await row(wrapper, 1).trigger('keydown', { key: 'Home' })
    await row(wrapper, 0).trigger('keydown', { key: 'ArrowUp' })
    await row(wrapper, 1).trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('update:selectedIndex')).toEqual([[2], [0], [3], [0], [0], [-1]])

    await row(wrapper, 1).trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('play')).toEqual([[1]])

    await row(wrapper, 1).trigger('keydown', { key: ' ' })
    expect(wrapper.emitted('update:checked')).toEqual([[['a', 'c', 'd']]])

    await row(wrapper, 1).trigger('keydown', { key: 'Delete' })
    expect(wrapper.emitted('remove')).toEqual([[1]])

    await row(wrapper, 1).trigger('keydown', { key: 'ArrowDown', altKey: true })
    expect(wrapper.emitted('move')).toEqual([[1, 2]])
    expect(wrapper.emitted('update:selectedIndex')?.at(-1)).toEqual([2])

    await row(wrapper, 1).trigger('keydown', { key: 'Tab' })
    expect(outer).toHaveBeenCalledTimes(1)
    expect(outer.mock.calls.at(0)?.at(0)).toMatchObject({ key: 'Tab' })
    window.removeEventListener('keydown', outer)
    wrapper.unmount()
  })

  it('verschiebt per Pointer am Griff und nennt den Ziel-Index im Endzustand', async () => {
    const wrapper = mountList()
    mockRowRects(wrapper)

    const handle = row(wrapper, 0).get('.ui-file-list__handle')
    await pointer(handle, 'pointerdown', { button: 0, pointerType: 'mouse', clientY: 20 })
    expect(wrapper.classes()).toContain('ui-file-list--dragging')

    await pointer(handle, 'pointermove', { clientY: 120 })
    expect(row(wrapper, 0).classes()).toContain('ui-file-list__row--dragging')
    expect(row(wrapper, 3).classes()).toContain('ui-file-list__row--drop-before')

    await pointer(handle, 'pointerup')
    expect(wrapper.emitted('move')).toEqual([[0, 2]])
    expect(wrapper.emitted('update:selectedIndex')).toEqual([[2]])
    expect(wrapper.classes()).not.toContain('ui-file-list--dragging')
  })

  it('meldet keine Verschiebung, wenn die Zeile an ihrem Platz bleibt', async () => {
    const wrapper = mountList()
    mockRowRects(wrapper)
    const handle = row(wrapper, 1).get('.ui-file-list__handle')
    await pointer(handle, 'pointerdown', { button: 0, pointerType: 'mouse', clientY: 66 })
    await pointer(handle, 'pointermove', { clientY: 70 })
    expect(wrapper.find('.ui-file-list__row--drop-before').exists()).toBe(false)
    await pointer(handle, 'pointerup')
    expect(wrapper.emitted('move')).toBeUndefined()
  })

  it('übernimmt eigene Beschriftungen', () => {
    const wrapper = mountList({
      items: [],
      labels: { emptyTitle: 'No files yet', emptyText: 'Drop audio files here.' },
    })
    expect(wrapper.get('.ui-empty__title').text()).toBe('No files yet')
    expect(wrapper.get('.ui-empty__text').text()).toBe('Drop audio files here.')
  })
})
