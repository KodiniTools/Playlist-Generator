import { describe, expect, it } from 'vitest'
import { hasModifier, isApplePlatform, modifierLabel } from '../platform'

const nav = (platform: string, uaPlatform?: string) =>
  ({
    platform,
    ...(uaPlatform === undefined ? {} : { userAgentData: { platform: uaPlatform } }),
  }) as unknown as Navigator

describe('isApplePlatform', () => {
  it('erkennt macOS, iPadOS und iOS, bevorzugt userAgentData', () => {
    expect(isApplePlatform(nav('MacIntel'))).toBe(true)
    expect(isApplePlatform(nav('iPad'))).toBe(true)
    expect(isApplePlatform(nav('Linux x86_64', 'macOS'))).toBe(true)
    expect(isApplePlatform(nav('Win32'))).toBe(false)
    expect(isApplePlatform(nav('MacIntel', 'Windows'))).toBe(false)
    expect(isApplePlatform(nav(''))).toBe(false)
    expect(isApplePlatform(undefined)).toBe(false)
  })
})

describe('hasModifier', () => {
  it('akzeptiert Strg/Ctrl und ⌘', () => {
    expect(hasModifier(new KeyboardEvent('keydown', { key: 's', ctrlKey: true }))).toBe(true)
    expect(hasModifier(new KeyboardEvent('keydown', { key: 's', metaKey: true }))).toBe(true)
    expect(hasModifier(new KeyboardEvent('keydown', { key: 's', altKey: true }))).toBe(false)
  })
})

describe('modifierLabel', () => {
  it('zeigt ⌘ auf Apple-Geräten, sonst Strg bzw. Ctrl', () => {
    expect(modifierLabel('de', true)).toBe('⌘')
    expect(modifierLabel('en', true)).toBe('⌘')
    expect(modifierLabel('de', false)).toBe('Strg')
    expect(modifierLabel('en', false)).toBe('Ctrl')
  })
})
