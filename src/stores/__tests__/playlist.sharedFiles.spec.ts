import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { probeAudio } from '../../utils/probeAudio'
import { useDurations } from '../../composables/useDurations'
import { usePlaylistStore } from '../playlist'

vi.mock('../../utils/probeAudio', () => ({ probeAudio: vi.fn() }))

const probe = vi.mocked(probeAudio)

describe('playlist store – handleSharedFiles', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    probe.mockReset()
  })

  it('übernimmt lesbare Dateien, merkt die Dauer und dekodiert nichts', async () => {
    probe.mockResolvedValueOnce(42).mockResolvedValueOnce(null)
    const decode = vi.fn()
    vi.stubGlobal(
      'AudioContext',
      vi.fn(() => ({ decodeAudioData: decode, close: vi.fn() })),
    )
    const store = usePlaylistStore()

    const { processed } = await store.handleSharedFiles([
      { name: 'b.wav', blob: new Blob(['b'], { type: 'audio/wav' }) },
      { name: 'a.mp3', blob: new Uint8Array([1, 2]).buffer, mimeType: 'audio/mpeg' },
    ])

    expect(processed).toBe(2)
    expect(store.files.map((f) => f.name)).toEqual(['a.mp3', 'b.wav'])
    expect(store.files.find((f) => f.name === 'a.mp3')?.type).toBe('audio/mpeg')
    expect(useDurations().getDuration('b.wav')).toBe(42)
    expect(decode).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  it('überspringt nicht lesbare, leere und doppelte Dateien', async () => {
    probe.mockRejectedValueOnce(new Error('kaputt')).mockResolvedValue(1)
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const store = usePlaylistStore()
    store.addFiles([new File(['x'], 'dup.wav')])

    const { processed } = await store.handleSharedFiles([
      { name: 'broken.wav', blob: new Blob(['x']) },
      { name: 'empty.wav', blob: new Blob([]) },
      { name: 'DUP.wav', blob: new Blob(['x']) },
      { name: 'ok.flac', blob: new Blob(['x']) },
    ])

    expect(processed).toBe(1)
    expect(store.files.map((f) => f.name)).toEqual(['dup.wav', 'ok.flac'])
    expect(probe).toHaveBeenCalledTimes(3)
  })

  it('fasst einen Import zu einem Undo-Schritt zusammen', async () => {
    probe.mockResolvedValue(1)
    const store = usePlaylistStore()

    await store.handleSharedFiles([
      { name: 'x.wav', blob: new Blob(['x']) },
      { name: 'y.wav', blob: new Blob(['y']) },
    ])
    store.undo()

    expect(store.files).toEqual([])
  })
})
