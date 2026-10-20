import { expect, test } from '@playwright/test'
import { prepare, wav } from './helpers'

test('Manifest ist verlinkt und beschreibt Icons und Dateizuordnungen', async ({
  page,
  request,
}) => {
  const href = '/playlist_generator/manifest.webmanifest'
  await page.goto('./')
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', href)

  const manifest = await (await request.get(href)).json()
  expect(manifest.start_url).toBe('/playlist_generator/app')
  expect(manifest.icons.map((icon: { sizes: string }) => icon.sizes)).toEqual(
    expect.arrayContaining(['192x192', '512x512']),
  )
  for (const icon of manifest.icons) {
    expect((await request.get(`/playlist_generator/${icon.src}`)).ok()).toBe(true)
  }
  const accept = manifest.file_handlers[0].accept
  expect(Object.values(accept).flat()).toEqual(
    expect.arrayContaining(['.mp3', '.wav', '.flac', '.m3u', '.m3u8', '.pls', '.xspf']),
  )
})

test('lädt die App nach dem ersten Besuch auch offline', async ({ page, context }) => {
  // Der Service Worker wird nur im Produktions-Build registriert (CI: vite preview).
  // eslint-disable-next-line playwright/no-skipped-test -- Dev-Server hat keinen Service Worker
  test.skip(!process.env.CI, 'nur gegen den Produktions-Build')
  await prepare(page, 'de')
  await page.goto('./app')
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
    // Warten, bis die gemeldeten Dateien im Cache liegen.
    const deadline = Date.now() + 5000
    while (Date.now() < deadline) {
      const keys = await caches.open('playlist-generator-v1').then((cache) => cache.keys())
      if (keys.some((request) => request.url.includes('/assets/') && request.url.endsWith('.js'))) {
        return
      }
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  })

  await context.setOffline(true)
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Audio Wiedergabeliste Generator',
  )
  await expect(page.locator('#fileInput')).toBeAttached()
  await context.setOffline(false)
})

test('übernimmt per „Öffnen mit“ gestartete Dateien', async ({ page }) => {
  await prepare(page, 'de')
  await page.addInitScript(
    (bytes) => {
      const data = new Uint8Array(bytes)
      const files = [new File([data], 'launch-b.wav'), new File([data], 'launch-a.wav')]
      Object.defineProperty(window, 'launchQueue', {
        value: {
          setConsumer(consumer: (params: { files: { getFile(): Promise<File> }[] }) => void) {
            consumer({ files: files.map((file) => ({ getFile: async () => file })) })
          },
        },
      })
    },
    Array.from(wav(1)),
  )
  await page.goto('./app')

  const rows = page.getByRole('list', { name: 'Dateiliste' }).getByRole('listitem')
  await expect(rows).toHaveCount(2)
  await expect(rows.nth(0)).toContainText('launch-a.wav')
})
