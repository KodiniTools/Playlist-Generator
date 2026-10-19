import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePlaylistStore } from '../playlist'

/** MP3-Datei, die nur einen ID3v1-Tag enthält (die letzten 128 Bytes). */
const mp3 = (name: string, title: string, artist: string, album = '', track = 0) => {
  const tag = new Uint8Array(128)
  const put = (text: string, offset: number) =>
    tag.set(
      Array.from(text.slice(0, 30), (c) => c.charCodeAt(0)),
      offset,
    )
  put('TAG', 0)
  put(title, 3)
  put(artist, 33)
  put(album, 63)
  tag[126] = track
  return new File([new Uint8Array(64), tag], name)
}

/** Wartet, bis die asynchron gelesenen Tags im Export stehen. */
const until = async (check: () => boolean) => {
  for (let i = 0; i < 50 && !check(); i++) await new Promise((r) => setTimeout(r, 10))
  expect(check()).toBe(true)
}

describe('playlist store – Tags', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('schreibt nach dem Lesen „Interpret - Titel“ in den Export', async () => {
    const store = usePlaylistStore()
    store.addFiles([mp3('01.mp3', 'Hyperballad', 'Bjork')])
    expect(store.playlistContent).toContain('#EXTINF:-1,01\n')

    await until(() => store.playlistContent.includes('#EXTINF:-1,Bjork - Hyperballad\n'))
  })

  it('sortiert nach Interpret, Album und Nummer und sortiert neu, sobald Tags eintreffen', async () => {
    const store = usePlaylistStore()
    store.addFiles([
      mp3('a.mp3', 'Zwei', 'Beta', 'X', 2),
      mp3('b.mp3', 'Eins', 'Beta', 'X', 1),
      mp3('c.mp3', 'Lied', 'Alpha'),
      new File(['ohne tags'], 'd.mp3'),
    ])
    store.applySortOption('artist')

    await until(() => store.files.map((f) => f.name).join() === 'c.mp3,b.mp3,a.mp3,d.mp3')

    store.undo()
    expect(store.sortOption).toBe('alphabetical')
    expect(store.files.map((f) => f.name)).toEqual(['a.mp3', 'b.mp3', 'c.mp3', 'd.mp3'])
  })
})
