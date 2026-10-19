import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePlaylistStore } from '../playlist'

const names = (files: File[]) => files.map((f) => f.name)

describe('playlist store – Playlist öffnen', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('übernimmt Reihenfolge, Auswahl, Name und Format; ein Undo-Schritt', () => {
    const store = usePlaylistStore()
    store.addFiles(['a.mp3', 'b.mp3', 'c.mp3', 'd.mp3'].map((n) => new File(['x'], n)))

    const result = store.openPlaylist(['C.MP3', 'fehlt.mp3', 'a.mp3', 'c.mp3'], 'mix', 'pls')

    expect(result).toEqual({ matched: 2, total: 4 })
    expect(names(store.files)).toEqual(['c.mp3', 'a.mp3', 'b.mp3', 'd.mp3'])
    expect(store.files.map(store.isFileSelected)).toEqual([true, true, false, false])
    expect(store.sortOption).toBe('manual')
    expect(store.playlistName).toBe('mix')
    expect(store.outputFormat).toBe('pls')
    expect(store.playlistContent).toContain('File1=c.mp3\n')
    expect(store.playlistContent).not.toContain('b.mp3')

    store.undo()
    expect(names(store.files)).toEqual(['a.mp3', 'b.mp3', 'c.mp3', 'd.mp3'])
    expect(store.files.every(store.isFileSelected)).toBe(true)
    expect(store.outputFormat).toBe('m3u')
  })

  it('ändert nichts ohne Treffer', () => {
    const store = usePlaylistStore()
    store.addFiles([new File(['x'], 'a.mp3')])
    expect(store.openPlaylist(['z.mp3'], 'mix', 'xspf')).toEqual({ matched: 0, total: 1 })
    expect(store.undoLabel).toBe('files_added')
    expect(store.playlistName).toBe('meine_wiedergabeliste')
  })
})
