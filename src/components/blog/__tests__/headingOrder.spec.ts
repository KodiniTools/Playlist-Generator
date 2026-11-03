// @vitest-environment node
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/** Überschriften-Ebenen im Template in Dokument-Reihenfolge. */
const headingLevels = (file: string): number[] =>
  [...readFileSync(resolve(__dirname, '..', file), 'utf8').matchAll(/<h([1-6])[\s>]/g)].map((m) =>
    Number(m[1]),
  )

describe('Blog-Artikel: Überschriften-Gliederung (Lighthouse heading-order)', () => {
  it.each(['BlogArticleDe.vue', 'BlogArticleEn.vue'])('%s überspringt keine Ebene', (file) => {
    const levels = headingLevels(file)
    expect(levels.length).toBeGreaterThan(10)
    // Der Artikel steht unter dem h1 der BlogPage.
    const skips = levels.filter((level, i) => level > (i === 0 ? 1 : (levels[i - 1] ?? 1)) + 1)
    expect(skips).toEqual([])
  })
})
