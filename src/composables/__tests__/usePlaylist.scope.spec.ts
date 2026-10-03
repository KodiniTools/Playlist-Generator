import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mk = (name: string) => new File(['x'], name, { lastModified: 1 })

/**
 * Die Watcher von usePlaylist werden beim ersten Aufruf registriert. Passiert der
 * im Setup einer Komponente (AppPage), dürfen sie deren Unmount nicht mit sterben:
 * nach Landing -> App -> Landing -> App müssen Formatwechsel weiter wirken.
 */
describe('usePlaylist – Watcher überleben die erste aufrufende Komponente', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('regeneriert den Inhalt nach Formatwechsel, auch wenn die erste Komponente weg ist', async () => {
    const { usePlaylist } = await import('../usePlaylist')

    const Host = defineComponent({
      setup() {
        usePlaylist()
        return () => h('div')
      },
    })
    const host = mount(Host)
    await nextTick()

    const p = usePlaylist()
    p.addFiles([mk('a.mp3'), mk('b.mp3')])
    p.setOutputFormat('m3u')
    await nextTick()
    expect(p.playlistContent.value).toContain('#EXTM3U')

    host.unmount()

    p.setOutputFormat('json')
    await nextTick()
    expect(p.outputFormat.value).toBe('json')
    expect(p.playlistContent.value.trimStart().startsWith('[')).toBe(true)
    expect(p.playlistContent.value).not.toContain('#EXTM3U')

    p.setOutputFormat('txt')
    await nextTick()
    expect(p.playlistContent.value.trimEnd().split('\n')).toEqual(['a.mp3', 'b.mp3'])
  })
})
