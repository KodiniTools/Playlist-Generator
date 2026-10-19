import { expect, test, type Page } from '@playwright/test'
import { audioFile, prepare, wav } from './helpers'

/** Zeilentext der Vorschau, ohne die aria-hidden Zeilennummern. */
const preview = (page: Page) =>
  page
    .getByRole('region', { name: 'Vorschau & Speichern' })
    .getByRole('listitem')
    .locator('span:not([aria-hidden="true"])')

/** Stand in IndexedDB (Layout aus src/utils/playlistPersistence.ts). */
function persisted(page: Page) {
  return page.evaluate(
    () =>
      new Promise<{ files: number; outputFormat?: string }>((resolve, reject) => {
        const request = indexedDB.open('kodinitools-playlist-generator')
        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
          const db = request.result
          if (!db.objectStoreNames.contains('files')) {
            db.close()
            resolve({ files: 0 })
            return
          }
          const tx = db.transaction(['files', 'meta'], 'readonly')
          const count = tx.objectStore('files').count()
          const meta = tx.objectStore('meta').get('current')
          tx.oncomplete = () => {
            db.close()
            resolve({ files: count.result, outputFormat: meta.result?.outputFormat })
          }
          tx.onerror = () => reject(tx.error)
        }
      }),
  )
}

async function openWithFiles(page: Page) {
  await prepare(page, 'de')
  await page.goto('./app')
  await page
    .locator('#fileInput')
    .setInputFiles([audioFile('b-song.wav', 2), audioFile('a-song.wav', 3)])
  await expect(page.getByRole('list', { name: 'Dateiliste' }).getByRole('listitem')).toHaveCount(2)
}

test.describe('Playlist erstellen', () => {
  test('listet Dateien alphabetisch und zeigt die M3U-Vorschau', async ({ page }) => {
    await openWithFiles(page)

    const rows = page.getByRole('list', { name: 'Dateiliste' }).getByRole('listitem')
    await expect(rows.nth(0)).toContainText('a-song.wav')
    await expect(rows.nth(0)).toContainText('0:03')
    await expect(rows.nth(1)).toContainText('b-song.wav')

    const lines = await preview(page).allTextContents()
    expect(lines[0]).toBe('#EXTM3U')
    expect(lines.filter((line) => line.endsWith('.wav'))).toEqual(['a-song.wav', 'b-song.wav'])
  })

  test('schreibt die gemessenen Laufzeiten in M3U und XSPF', async ({ page }) => {
    await openWithFiles(page)

    await expect
      .poll(() => preview(page).allTextContents())
      .toEqual(expect.arrayContaining(['#EXTINF:3,a-song', '#EXTINF:2,b-song']))

    await page.getByRole('combobox', { name: 'Vorschau-Format' }).selectOption('xspf')
    const xspf = (await preview(page).allTextContents()).join('\n')
    expect(xspf).toContain('<duration>3000</duration>')
    expect(xspf).toContain('<duration>2000</duration>')
  })

  test('wechselt das Format und schreibt PLS und JSON', async ({ page }) => {
    await openWithFiles(page)
    const format = page.getByRole('combobox', { name: 'Vorschau-Format' })

    await format.selectOption('pls')
    const pls = await preview(page).allTextContents()
    expect(pls).toContain('[playlist]')
    expect(pls).toContain('File1=a-song.wav')
    expect(pls).toContain('File2=b-song.wav')
    expect(pls).toContain('NumberOfEntries=2')

    await format.selectOption('json')
    const json = JSON.parse((await preview(page).allTextContents()).join('\n')) as unknown
    expect(JSON.stringify(json)).toContain('a-song.wav')
  })

  test('nimmt abgewählte Dateien nicht auf', async ({ page }) => {
    await openWithFiles(page)
    await page.getByRole('checkbox', { name: 'In Wiedergabeliste aufnehmen: a-song.wav' }).uncheck()

    const lines = await preview(page).allTextContents()
    expect(lines.filter((line) => line.endsWith('.wav'))).toEqual(['b-song.wav'])
  })

  test('entfernt eine Datei und stellt sie per Rückgängig wieder her', async ({ page }) => {
    await openWithFiles(page)
    const rows = page.getByRole('list', { name: 'Dateiliste' }).getByRole('listitem')

    await page.getByRole('button', { name: 'Entfernen: a-song.wav' }).click()
    await expect(rows).toHaveCount(1)

    await page.getByRole('button', { name: /^Rückgängig: / }).click()
    await expect(rows).toHaveCount(2)
    await expect(rows.nth(0)).toContainText('a-song.wav')
  })

  test('speichert den Vorschau-Inhalt unter dem Playlist-Namen', async ({ page }) => {
    await page.addInitScript(() => {
      const target = window as unknown as {
        __saved?: { name: string; content: string }
        showSaveFilePicker: (options: { suggestedName: string }) => Promise<unknown>
      }
      target.showSaveFilePicker = async ({ suggestedName }) => ({
        createWritable: async () => ({
          write: async (content: string) => {
            target.__saved = { name: suggestedName, content }
          },
          close: async () => {},
        }),
      })
    })
    await openWithFiles(page)
    await page.getByRole('textbox', { name: 'Wiedergabeliste benennen' }).fill('roadtrip')

    await page.getByRole('button', { name: 'Speichern unter...' }).click()

    await expect
      .poll(() => page.evaluate(() => (window as { __saved?: unknown }).__saved))
      .toBeTruthy()
    const saved = await page.evaluate(
      () => (window as unknown as { __saved: { name: string; content: string } }).__saved,
    )
    expect(saved.name).toBe('roadtrip.m3u')
    expect(saved.content.split('\n')).toEqual(await preview(page).allTextContents())
  })

  test('kopiert die Playlist in die Zwischenablage', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await openWithFiles(page)

    await page.getByRole('button', { name: 'Kopieren', exact: true }).click()

    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toContain('#EXTM3U')
    const copied = await page.evaluate(() => navigator.clipboard.readText())
    expect(copied).toContain('a-song.wav')
    expect(copied).toContain('b-song.wav')
  })

  test('behält Dateien und Einstellungen nach dem Neuladen', async ({ page }) => {
    await openWithFiles(page)
    await page.getByRole('combobox', { name: 'Vorschau-Format' }).selectOption('txt')
    // Persistenz schreibt entprellt; erst neu laden, wenn beides in IndexedDB steht.
    await expect.poll(() => persisted(page)).toEqual({ files: 2, outputFormat: 'txt' })

    await page.reload()

    await expect(page.getByRole('list', { name: 'Dateiliste' }).getByRole('listitem')).toHaveCount(
      2,
    )
    await expect(page.getByRole('combobox', { name: 'Vorschau-Format' })).toHaveValue('txt')
  })
})

test('übernimmt geteilte Dateien aus dem Audio-Konverter und verwirft unlesbare', async ({
  page,
}) => {
  await prepare(page, 'de')
  await page.goto('./faq')
  // So legt der Audio-Konverter Dateien ab (src/utils/sharedFileRepository.ts).
  await page.evaluate(
    async ([good]) => {
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('kodinitools-shared-files', 1)
        request.onupgradeneeded = () =>
          request.result.createObjectStore('audio-files', { keyPath: 'id', autoIncrement: true })
        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
          const db = request.result
          const tx = db.transaction('audio-files', 'readwrite')
          const store = tx.objectStore('audio-files')
          store.put({
            name: 'good.wav',
            blob: new Blob([new Uint8Array(good)], { type: 'audio/wav' }),
            mimeType: 'audio/wav',
          })
          store.put({
            name: 'broken.wav',
            blob: new Blob(['kein audio'], { type: 'audio/wav' }),
            mimeType: 'audio/wav',
          })
          tx.oncomplete = () => {
            db.close()
            resolve()
          }
          tx.onerror = () => reject(tx.error)
        }
      })
    },
    [[...wav(2)]] as const,
  )

  await page.goto('./app?source=audiokonverter')

  await expect(page.getByText('1 Datei(en) erfolgreich importiert')).toBeVisible()
  const rows = page.getByRole('list', { name: 'Dateiliste' }).getByRole('listitem')
  await expect(rows).toHaveCount(1)
  await expect(rows.nth(0)).toContainText('good.wav')
  await expect(rows.nth(0)).toContainText('0:02')
})
