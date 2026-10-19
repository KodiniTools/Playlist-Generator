import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { probeAudio } from '../probeAudio'

/** Minimales Audio-Double: merkt sich die letzte Instanz, Events löst der Test aus. */
class FakeAudio extends EventTarget {
  static last: FakeAudio | undefined
  duration = NaN
  preload = ''
  src = ''
  constructor() {
    super()
    FakeAudio.last = this
  }
  removeAttribute(name: string) {
    if (name === 'src') this.src = ''
  }
}

const current = (): FakeAudio => {
  if (!FakeAudio.last) throw new Error('Kein Audio-Element erzeugt')
  return FakeAudio.last
}

describe('probeAudio', () => {
  beforeEach(() => {
    FakeAudio.last = undefined
    vi.stubGlobal('Audio', FakeAudio)
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:probe'),
      revokeObjectURL: vi.fn(),
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('lädt nur Metadaten und liefert die Dauer', async () => {
    const result = probeAudio(new Blob(['x']))
    const audio = current()
    expect(audio.preload).toBe('metadata')
    expect(audio.src).toBe('blob:probe')

    audio.duration = 12.5
    audio.dispatchEvent(new Event('loadedmetadata'))

    await expect(result).resolves.toBe(12.5)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:probe')
    expect(audio.src).toBe('')
  })

  it('liefert null bei unbekannter Dauer', async () => {
    const result = probeAudio(new Blob(['x']))
    current().duration = Infinity
    current().dispatchEvent(new Event('loadedmetadata'))
    await expect(result).resolves.toBeNull()
  })

  it('wirft, wenn der Browser die Datei nicht lesen kann', async () => {
    const result = probeAudio(new Blob(['x']))
    current().dispatchEvent(new Event('error'))
    await expect(result).rejects.toThrow('nicht lesbar')
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:probe')
  })

  it('bricht nach dem Timeout ab und räumt auf', async () => {
    vi.useFakeTimers()
    const result = probeAudio(new Blob(['x']), 50).catch((error: Error) => error)
    await vi.advanceTimersByTimeAsync(50)
    expect((await result) as Error).toBeInstanceOf(Error)
    expect(((await result) as Error).message).toContain('50 ms')
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:probe')
  })
})
