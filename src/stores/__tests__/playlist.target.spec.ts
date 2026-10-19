import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useDurations } from '../../composables/useDurations'
import { usePlaylistStore } from '../playlist'

describe('playlist store – Ziel-Länge', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('hakt der Reihe nach bis zur Ziel-Länge an und ist rückgängig machbar', () => {
    const { setDuration } = useDurations()
    setDuration('t1.mp3', 240)
    setDuration('t2.mp3', 240)
    setDuration('t3.mp3', 240)
    const store = usePlaylistStore()
    store.addFiles(['t1.mp3', 't2.mp3', 't3.mp3'].map((name) => new File(['x'], name)))

    expect(store.fitToLength(600, 'order')).toBe(2)
    expect(store.files.map(store.isFileSelected)).toEqual([true, true, false])
    expect(store.playlistContent).not.toContain('t3.mp3')
    expect(store.undoLabel).toBe('target_length_applied')

    // Gleiche Auswahl noch einmal: kein weiterer Undo-Schritt.
    store.fitToLength(600, 'order')
    store.undo()
    expect(store.files.every(store.isFileSelected)).toBe(true)
    expect(store.undoLabel).toBe('files_added')
  })

  it('ändert nichts, wenn kein Titel passt', () => {
    const store = usePlaylistStore()
    // Ohne gemessene Dauer: Schätzung aus Größe (mp3 ≈ 20 000 Bytes/s) → 100 s.
    store.addFiles([new File(['x'.repeat(2_000_000)], 'gross.mp3')])
    expect(store.fitToLength(60, 'order')).toBe(0)
    expect(store.undoLabel).toBe('files_added')
    expect(store.isFileSelected(store.files[0]!)).toBe(true)
  })
})
