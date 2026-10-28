import { describe, expect, it } from 'vitest'
import { SHARED_SOURCES, isSharedSource } from '../sharedSources'

describe('isSharedSource', () => {
  it('nimmt Audiokonverter, Normalisierer und Audio-Schneider an', () => {
    expect(SHARED_SOURCES).toEqual(['audiokonverter', 'audionormalizer', 'audio-cutter'])
    for (const source of SHARED_SOURCES) expect(isSharedSource(source)).toBe(true)
  })

  it('lehnt unbekannte, fehlende und nicht-String-Quellen ab', () => {
    expect(isSharedSource('playlist_generator')).toBe(false)
    expect(isSharedSource(undefined)).toBe(false)
    expect(isSharedSource(null)).toBe(false)
    expect(isSharedSource(['audio-cutter'])).toBe(false)
  })
})
