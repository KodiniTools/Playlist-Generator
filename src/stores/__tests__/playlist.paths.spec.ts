import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { setRelativePath } from '../../utils/trackPath'
import { usePlaylistStore } from '../playlist'

const fromFolder = (path: string) => {
  const file = new File(['x'], path.split('/').pop() ?? path)
  setRelativePath(file, path)
  return file
}

describe('playlist store – Pfad-Modus', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('schreibt je nach Modus Dateiname, relativen Pfad oder Basis und ist rückgängig machbar', async () => {
    const store = usePlaylistStore()
    store.addFiles([fromFolder('Musik/CD1/a.mp3'), fromFolder('Musik/CD2/b.mp3')])
    expect(store.playlistContent).toContain('\na.mp3\n')

    store.setPathMode('relative')
    await nextTick()
    expect(store.playlistContent).toContain('\nCD1/a.mp3\n')
    expect(store.playlistContent).toContain('\nCD2/b.mp3\n')

    store.setBasePath('https://example.com/m')
    await nextTick()
    expect(store.playlistContent).toContain('\nhttps://example.com/m/CD1/a.mp3\n')

    store.undo()
    await nextTick()
    expect(store.basePath).toBe('')
    expect(store.playlistContent).toContain('\nCD1/a.mp3\n')

    store.undo()
    await nextTick()
    expect(store.pathMode).toBe('name')
    expect(store.playlistContent).toContain('\na.mp3\n')
  })

  it('fasst Tippen im Basis-Feld zu einem Undo-Schritt zusammen', () => {
    const store = usePlaylistStore()
    store.setBasePath('D')
    store.setBasePath('D:')
    store.setBasePath('D:\\')
    expect(store.undoLabel).toBe('base_path_changed')
    store.undo()
    expect(store.basePath).toBe('')
  })
})
