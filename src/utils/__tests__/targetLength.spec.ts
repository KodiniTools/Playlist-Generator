import { describe, expect, it } from 'vitest'
import { pickForTarget } from '../targetLength'

const entries = [
  { item: 'a', seconds: 200 },
  { item: 'b', seconds: 300 },
  { item: 'c', seconds: 100 },
  { item: 'd', seconds: 50 },
]

describe('pickForTarget', () => {
  it('der Reihe nach: längster Anfang, der hineinpasst', () => {
    expect([...pickForTarget(entries, 500, 'order')]).toEqual(['a', 'b'])
    // c würde nach dem Schnitt noch passen, wird aber nicht nachgezogen.
    expect([...pickForTarget(entries, 400, 'order')]).toEqual(['a'])
  })

  it('zufällig: überspringt, was nicht passt, und füllt weiter auf', () => {
    // random() = 0 dreht die Liste zu b, c, d, a.
    expect([...pickForTarget(entries, 400, 'random', () => 0)].sort()).toEqual(['b', 'c'])
    expect([...pickForTarget(entries, 460, 'random', () => 0)].sort()).toEqual(['b', 'c', 'd'])
  })

  it('nimmt alles, wenn die Ziel-Länge reicht', () => {
    expect(pickForTarget(entries, 10_000, 'order').size).toBe(4)
  })

  it('liefert nichts für ungültige oder zu kurze Ziele', () => {
    expect(pickForTarget(entries, 0, 'order').size).toBe(0)
    expect(pickForTarget(entries, NaN, 'random').size).toBe(0)
    expect(pickForTarget(entries, 100, 'order').size).toBe(0)
  })
})
