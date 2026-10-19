import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { prepare, type Locale, type Theme } from './helpers'

const tokens = JSON.parse(
  readFileSync(new URL('../src/design-system/tokens-v2.json', import.meta.url), 'utf8'),
) as { color: Record<Theme, Record<'surface0' | 'text', { $value: string }>> }

const PAGES: ReadonlyArray<{ path: string; heading: Record<Locale, string> }> = [
  {
    path: './',
    heading: { de: 'Audio Wiedergabeliste Generator', en: 'Audio Playlist Generator' },
  },
  {
    path: './app',
    heading: { de: 'Audio Wiedergabeliste Generator', en: 'Audio Playlist Generator' },
  },
  {
    path: './faq',
    heading: { de: 'Häufig gestellte Fragen', en: 'Frequently Asked Questions' },
  },
  {
    path: './blog',
    heading: {
      de: 'Der ultimative Audio Wiedergabeliste Generator: Alle Funktionen im Detail',
      en: 'The Ultimate Audio Playlist Generator: All Features in Detail',
    },
  },
]

/** '#0a1324' → 'rgb(10, 19, 36)', wie getComputedStyle es liefert. */
function rgb(hex: string): string {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
  return `rgb(${r}, ${g}, ${b})`
}

for (const { path, heading } of PAGES) {
  for (const locale of ['de', 'en'] as const) {
    for (const theme of ['dark', 'light'] as const) {
      test(`${path} · ${locale} · ${theme}`, async ({ page }, testInfo) => {
        const errors: string[] = []
        page.on('pageerror', (error) => errors.push(error.message))

        await prepare(page, locale, theme)
        await page.goto(path)

        await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading[locale])
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme)
        await expect(page.locator('body')).toHaveCSS(
          'background-color',
          rgb(tokens.color[theme].surface0.$value),
        )
        await expect(page.locator('body')).toHaveCSS('color', rgb(tokens.color[theme].text.$value))

        await testInfo.attach(`screenshot-${locale}-${theme}`, {
          body: await page.screenshot({ fullPage: true }),
          contentType: 'image/png',
        })
        expect(errors).toEqual([])
      })
    }
  }
}

test('Navigation im Header wechselt die Seiten', async ({ page }) => {
  await prepare(page, 'de')
  await page.goto('./')
  const nav = page.getByRole('navigation', { name: 'Seiten' })

  await nav.getByRole('link', { name: 'App' }).click()
  await expect(page).toHaveURL(/\/app$/)
  await nav.getByRole('link', { name: 'FAQ' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Häufig gestellte Fragen')
  await nav.getByRole('link', { name: 'Blog' }).click()
  await expect(page).toHaveURL(/\/blog$/)
  await nav.getByRole('link', { name: 'Start' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Audio Wiedergabeliste Generator',
  )
})

test('Titel und Beschreibung folgen Seite und Sprache, ?lang= hat Vorrang', async ({ page }) => {
  await prepare(page, 'de')
  await page.goto('./faq')
  await expect(page).toHaveTitle('FAQ – Audio Wiedergabeliste Generator')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://kodinitools.com/playlist_generator/faq',
  )

  await page.goto('./blog?lang=en')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'The Ultimate Audio Playlist Generator: All Features in Detail',
  )
  await expect(page).toHaveTitle('All Features in Detail – Audio Playlist Generator')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /^How the Audio Playlist Generator works/,
  )
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://kodinitools.com/playlist_generator/blog?lang=en',
  )
})
