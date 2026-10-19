import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useDurations } from '../../composables/useDurations'
import { usePlaylistStore } from '../playlist'

describe('playlist store – Laufzeiten im Export', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('schreibt bekannte Laufzeiten und frischt den Export nach dem Messen auf', async () => {
    const store = usePlaylistStore()
    store.addFiles([new File(['x'], 'spaeter-gemessen.mp3')])
    expect(store.playlistContent).toContain('#EXTINF:-1,spaeter-gemessen')

    useDurations().setDuration('spaeter-gemessen.mp3', 187.6)
    await nextTick()

    expect(store.playlistContent).toContain('#EXTINF:188,spaeter-gemessen')
  })
})
