import { expect, test, type Page } from '@playwright/test'
import { audioFile, pngFile, prepare, taggedAudioFile, wav, zipFile } from './helpers'

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

  test('schreibt YouTube-Kapitel mit Startzeiten aus den Laufzeiten', async ({ page }) => {
    await openWithFiles(page)
    await expect.poll(() => preview(page).allTextContents()).toContain('#EXTINF:3,a-song')

    await page.getByRole('combobox', { name: 'Vorschau-Format' }).selectOption('youtube')
    await expect
      .poll(() => preview(page).allTextContents())
      .toEqual(['00:00 a-song', '00:03 b-song', ''])
    await expect(page.getByText('Pfade in der Wiedergabeliste')).toHaveCount(0)
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

    await page.getByRole('button', { name: 'Speichern', exact: true }).click()

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

  test('teilt CSV als Datei und PLS als Text', async ({ page }) => {
    // Headless-Chromium unter Linux hat keine Web Share API; aufgezeichnet wird der Aufruf.
    await page.addInitScript(() => {
      const shared: { title?: string; name?: string; type?: string; text?: string }[] = []
      Object.assign(window, { __shared: shared })
      Object.assign(navigator, {
        canShare: () => true,
        share: async (data: ShareData) => {
          const file = data.files?.[0]
          shared.push({
            title: data.title,
            name: file?.name,
            type: file?.type,
            text: file ? await file.text() : data.text,
          })
        },
      })
    })
    await openWithFiles(page)
    await page.getByRole('textbox', { name: 'Wiedergabeliste benennen' }).fill('roadtrip')
    await page.getByRole('combobox', { name: 'Vorschau-Format' }).selectOption('csv')
    await page
      .getByRole('region', { name: 'Vorschau & Speichern' })
      .getByRole('button', { name: 'Teilen', exact: true })
      .click()

    const shared = () =>
      page.evaluate(() => (window as unknown as { __shared: { name?: string }[] }).__shared)
    await expect.poll(shared).toHaveLength(1)
    const [entry] = (await shared()) as {
      title: string
      name: string
      type: string
      text: string
    }[]
    expect(entry).toMatchObject({ title: 'roadtrip', name: 'roadtrip.csv', type: 'text/csv' })
    expect(entry!.text).toContain('a-song.wav')

    // PLS lehnt Chrome als Datei ab, deshalb geht es als Text raus.
    await page.getByRole('combobox', { name: 'Vorschau-Format' }).selectOption('pls')
    await page
      .getByRole('region', { name: 'Vorschau & Speichern' })
      .getByRole('button', { name: 'Teilen', exact: true })
      .click()
    await expect.poll(shared).toHaveLength(2)
    const [, asText] = (await shared()) as { name?: string; text: string }[]
    expect(asText!.name).toBeUndefined()
    expect(asText!.text).toContain('[playlist]')
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

test('schreibt relative Pfade und Basis-URL für einen gezogenen Ordner', async ({ page }) => {
  await prepare(page, 'de')
  await page.goto('./app')

  // Drop eines Ordners "Musik" mit CD1/CD2 über die File-and-Directory-Entries-API,
  // so wie der Browser sie beim Ziehen aus dem Dateimanager liefert.
  const dropzone = page.locator('.playlist-config__dropzone')
  await expect(dropzone).toBeVisible()
  await dropzone.evaluate((element) => {
    type Entry = Record<string, unknown>
    const fileEntry = (fullPath: string): Entry => ({
      isFile: true,
      isDirectory: false,
      fullPath,
      file: (done: (file: File) => void) =>
        done(new File(['x'], fullPath.split('/').pop() ?? '', { type: 'audio/wav' })),
    })
    const dirEntry = (fullPath: string, children: Entry[]): Entry => ({
      isFile: false,
      isDirectory: true,
      fullPath,
      createReader: () => {
        let read = false
        return {
          readEntries: (done: (entries: Entry[]) => void) => {
            done(read ? [] : children)
            read = true
          },
        }
      },
    })
    const root = dirEntry('/Musik', [
      dirEntry('/Musik/CD1', [fileEntry('/Musik/CD1/a song.wav')]),
      dirEntry('/Musik/CD2', [fileEntry('/Musik/CD2/b-song.wav')]),
    ])
    const drop = new Event('drop', { bubbles: true, cancelable: true })
    Object.defineProperty(drop, 'dataTransfer', {
      value: { items: [{ webkitGetAsEntry: () => root, getAsFile: () => null }] },
    })
    element.dispatchEvent(drop)
  })
  await expect(page.getByRole('list', { name: 'Dateiliste' }).getByRole('listitem')).toHaveCount(2)

  await page.getByRole('radio', { name: 'Relativer Pfad' }).click()
  await expect
    .poll(() => preview(page).allTextContents())
    .toEqual(expect.arrayContaining(['CD1/a song.wav', 'CD2/b-song.wav']))
  await expect(page.getByText('Pfade beginnen beim gemeinsamen Ordner')).toBeVisible()

  await page
    .getByRole('textbox', { name: 'Basis-Pfad oder URL (optional)' })
    .fill('https://example.com/musik')
  await expect
    .poll(() => preview(page).allTextContents())
    .toEqual(expect.arrayContaining(['https://example.com/musik/CD1/a%20song.wav']))

  // Eine lose Datei dazu: Es gibt keinen gemeinsamen Ordner mehr, "Musik/" bleibt im Pfad.
  await page.locator('#fileInput').setInputFiles([audioFile('c.wav')])
  await expect
    .poll(() => preview(page).allTextContents())
    .toEqual(
      expect.arrayContaining([
        'https://example.com/musik/Musik/CD1/a%20song.wav',
        'https://example.com/musik/c.wav',
      ]),
    )

  // Pfade und Einstellungen überstehen das Neuladen.
  await expect.poll(() => persisted(page)).toMatchObject({ files: 3 })
  await page.reload()
  await expect
    .poll(() => preview(page).allTextContents())
    .toEqual(expect.arrayContaining(['https://example.com/musik/Musik/CD2/b-song.wav']))
})

test('liest Interpret und Titel aus den Tags und sortiert nach Interpret', async ({ page }) => {
  await prepare(page, 'de')
  await page.goto('./app')
  await page
    .locator('#fileInput')
    .setInputFiles([
      taggedAudioFile('a.wav', { title: 'Zweites Lied', artist: 'Beta', album: 'X', track: 2 }),
      taggedAudioFile('b.wav', { title: 'Erstes Lied', artist: 'Beta', album: 'X', track: 1 }),
      taggedAudioFile('c.wav', { title: 'Hyperballad', artist: 'Björk' }),
      audioFile('d.wav'),
    ])
  const rows = page.getByRole('list', { name: 'Dateiliste' }).getByRole('listitem')
  await expect(rows).toHaveCount(4)
  await expect(rows.nth(2)).toContainText('Björk – Hyperballad')

  await expect
    .poll(() => preview(page).allTextContents())
    .toEqual(expect.arrayContaining(['#EXTINF:1,Björk - Hyperballad', '#EXTINF:1,d']))

  await page.getByRole('radio', { name: 'Interpret' }).click()
  const order = async () =>
    (await preview(page).allTextContents()).filter((line) => line.endsWith('.wav'))
  await expect.poll(order).toEqual(['b.wav', 'a.wav', 'c.wav', 'd.wav'])

  await page.getByRole('combobox', { name: 'Vorschau-Format' }).selectOption('xspf')
  const xspf = (await preview(page).allTextContents()).join('\n')
  expect(xspf).toContain('<creator>Beta</creator>')
  expect(xspf).toContain('<album>X</album>')
  expect(xspf).toContain('<trackNum>1</trackNum>')
})

test('wählt Titel bis zur Ziel-Länge aus', async ({ page }) => {
  await prepare(page, 'de')
  await page.goto('./app')
  await page
    .locator('#fileInput')
    .setInputFiles([audioFile('a.wav', 25), audioFile('b.wav', 25), audioFile('c.wav', 25)])
  const rows = page.getByRole('list', { name: 'Dateiliste' }).getByRole('listitem')
  await expect(rows).toHaveCount(3)
  await expect(rows.nth(2)).toContainText('0:25')

  await page.getByRole('textbox', { name: 'Ziel-Länge in Minuten' }).fill('1')
  await page.getByRole('button', { name: 'Auswahl anpassen' }).click()

  const tracks = async () =>
    (await preview(page).allTextContents()).filter((line) => line.endsWith('.wav'))
  await expect.poll(tracks).toEqual(['a.wav', 'b.wav'])
  await expect(
    page.getByRole('checkbox', { name: 'In Wiedergabeliste aufnehmen: c.wav' }),
  ).not.toBeChecked()

  await page.getByRole('textbox', { name: 'Ziel-Länge in Minuten' }).fill('0')
  await page.getByRole('button', { name: 'Auswahl anpassen' }).click()
  await expect(page.getByText('Bitte eine ganze Zahl von 1 bis 1440 eingeben.')).toBeVisible()

  await page.getByRole('button', { name: /^Rückgängig: / }).click()
  await expect.poll(tracks).toEqual(['a.wav', 'b.wav', 'c.wav'])
})

test('öffnet eine bestehende Playlist und übernimmt Reihenfolge und Auswahl', async ({ page }) => {
  await prepare(page, 'de')
  await page.goto('./app')
  const m3u = Buffer.from('#EXTM3U\n#EXTINF:1,C\nMusik/c.wav\nfehlt.wav\na.wav\n', 'utf8')
  // Audiodateien und Playlist in einem Schritt, wie aus dem Dateidialog.
  await page
    .locator('#fileInput')
    .setInputFiles([
      audioFile('a.wav'),
      audioFile('b.wav'),
      audioFile('c.wav'),
      { name: 'roadtrip.m3u', mimeType: 'audio/x-mpegurl', buffer: m3u },
    ])

  await expect(page.getByText('„roadtrip“ geöffnet: 2 von 3 Titeln gefunden.')).toBeVisible()
  const rows = page.getByRole('list', { name: 'Dateiliste' }).getByRole('listitem')
  await expect(rows.nth(0)).toContainText('c.wav')
  await expect(rows.nth(1)).toContainText('a.wav')
  await expect(
    page.getByRole('checkbox', { name: 'In Wiedergabeliste aufnehmen: b.wav' }),
  ).not.toBeChecked()
  await expect(page.getByRole('textbox', { name: 'Wiedergabeliste benennen' })).toHaveValue(
    'roadtrip',
  )

  // Danach über den eigenen Knopf eine XSPF mit anderer Reihenfolge öffnen.
  const xspf = Buffer.from(
    '<?xml version="1.0"?><playlist version="1" xmlns="http://xspf.org/ns/0/"><trackList>' +
      '<track><location>b.wav</location></track><track><location>c.wav</location></track>' +
      '</trackList></playlist>',
  )
  await page
    .locator('#playlistInput')
    .setInputFiles({ name: 'zwei.xspf', mimeType: 'application/xspf+xml', buffer: xspf })
  await expect(page.getByText('„zwei“ geöffnet: 2 von 2 Titeln gefunden.')).toBeVisible()
  await expect(page.getByRole('combobox', { name: 'Vorschau-Format' })).toHaveValue('xspf')
  const xml = (await preview(page).allTextContents()).join('\n')
  expect(xml.indexOf('<location>b.wav</location>')).toBeLessThan(
    xml.indexOf('<location>c.wav</location>'),
  )
  expect(xml).not.toContain('a.wav')
})

test('speichert Entwürfe, lädt sie wieder und löscht sie', async ({ page }) => {
  await openWithFiles(page)
  await page.getByRole('textbox', { name: 'Wiedergabeliste benennen' }).fill('roadtrip')
  await page.getByRole('checkbox', { name: 'In Wiedergabeliste aufnehmen: b-song.wav' }).uncheck()

  const dialog = page.getByRole('dialog', { name: 'Entwürfe' })
  await page.getByRole('button', { name: 'Entwürfe' }).click()
  await expect(dialog.getByText('Noch keine Entwürfe gespeichert.')).toBeVisible()
  await dialog.getByRole('button', { name: '„roadtrip“ als Entwurf speichern' }).click()
  await expect(dialog.getByRole('listitem')).toHaveCount(1)
  await expect(dialog.getByRole('listitem')).toContainText('2 Titel')
  await dialog.getByRole('button', { name: 'Schließen' }).click()

  // Liste leeren und neu benennen, dann den Entwurf laden.
  await page.getByRole('button', { name: 'Liste leeren' }).click()
  const rows = page.getByRole('list', { name: 'Dateiliste' }).getByRole('listitem')
  await expect(rows).toHaveCount(0)
  await page.getByRole('textbox', { name: 'Wiedergabeliste benennen' }).fill('anders')

  await page.getByRole('button', { name: 'Entwürfe' }).click()
  await dialog.getByRole('button', { name: 'Laden: roadtrip' }).click()
  await expect(dialog).toBeHidden()
  await expect(rows).toHaveCount(2)
  await expect(page.getByRole('textbox', { name: 'Wiedergabeliste benennen' })).toHaveValue(
    'roadtrip',
  )
  await expect(
    page.getByRole('checkbox', { name: 'In Wiedergabeliste aufnehmen: b-song.wav' }),
  ).not.toBeChecked()

  // Löschen braucht einen zweiten Klick.
  await page.getByRole('button', { name: 'Entwürfe' }).click()
  await dialog.getByRole('button', { name: 'Löschen: roadtrip' }).click()
  await expect(dialog.getByRole('listitem')).toHaveCount(1)
  await dialog.getByRole('button', { name: 'Wirklich löschen?: roadtrip' }).click()
  await expect(dialog.getByText('Noch keine Entwürfe gespeichert.')).toBeVisible()
})

test('nutzt auf dem Mac ⌘ für Kürzel und zeigt ⌘ an', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, 'platform', { get: () => 'MacIntel' })
    Object.defineProperty(Navigator.prototype, 'userAgentData', {
      get: () => ({ platform: 'macOS' }),
    })
  })
  await openWithFiles(page)
  const rows = page.getByRole('list', { name: 'Dateiliste' }).getByRole('listitem')

  await page.getByRole('button', { name: 'Entfernen: a-song.wav' }).click()
  await expect(rows).toHaveCount(1)
  await expect(page.getByRole('button', { name: /^Rückgängig: / })).toHaveAttribute(
    'title',
    /\(⌘\+Z\)$/,
  )
  await expect(page.getByText('oder ⌘+V zum Einfügen')).toBeVisible()

  await page.keyboard.press('Meta+z')
  await expect(rows).toHaveCount(2)
  await page.keyboard.press('Meta+Shift+z')
  await expect(rows).toHaveCount(1)
  await page.keyboard.press('Control+z')
  await expect(rows).toHaveCount(2)

  await page.keyboard.press('?')
  const dialog = page.getByRole('dialog', { name: 'Tastaturkürzel' })
  await expect(dialog.locator('kbd').first()).toHaveText('⌘')
})

test('entpackt ein ZIP-Archiv und übernimmt nur MP3, WAV und FLAC', async ({ page }) => {
  await prepare(page, 'de')
  await page.goto('./app')
  await page.locator('#fileInput').setInputFiles([
    zipFile('Album.zip', {
      'Album/01 Morgen.wav': wav(2),
      'Album/02 Abend.wav': wav(3),
      'Album/cover.jpg': 'kein Audio',
      '__MACOSX/Album/._01 Morgen.wav': 'Systemdatei',
    }),
  ])

  const rows = page.getByRole('list', { name: 'Dateiliste' }).getByRole('listitem')
  await expect(rows).toHaveCount(2)
  await expect(rows.nth(0)).toContainText('01 Morgen.wav')
  await expect(page.getByText('2 Dateien hinzugefügt')).toBeVisible()
  await expect(
    page.getByText(
      '1 Dateien aus „Album.zip“ übersprungen: nur MP3, WAV und FLAC werden übernommen.',
    ),
  ).toBeVisible()
  // Echte Laufzeiten: die entpackten Daten sind abspielbar.
  await expect(rows.nth(1)).toContainText('0:03')
})

test('erzeugt ein Story-Bild der Playlist und lädt es herunter', async ({ page }) => {
  await prepare(page, 'de')
  await page.goto('./app')
  await page
    .locator('#fileInput')
    .setInputFiles([
      taggedAudioFile('a.wav', { title: 'Morgenlicht', artist: 'Die Band' }, 2),
      audioFile('b.wav', 3),
    ])
  await page.getByRole('button', { name: 'Als Bild teilen' }).click()

  const dialog = page.getByRole('dialog', { name: 'Als Bild teilen' })
  const preview = dialog.getByRole('img', { name: 'Vorschau des Bildes' })
  await expect(preview).toBeVisible()
  await expect
    .poll(() => preview.evaluate((img: HTMLImageElement) => [img.naturalWidth, img.naturalHeight]))
    .toEqual([1080, 1920])

  await dialog.getByRole('radio', { name: 'Post 1:1' }).click()
  await expect.poll(() => preview.evaluate((img: HTMLImageElement) => img.naturalHeight)).toBe(1080)

  const download = page.waitForEvent('download')
  await dialog.getByRole('button', { name: 'Herunterladen' }).click()
  expect((await download).suggestedFilename()).toBe('meine_wiedergabeliste-post.png')
})

test('zeichnet das Bild in selbst gewählten Text- und Hintergrundfarben', async ({ page }) => {
  await prepare(page, 'de')
  await page.goto('./app')
  await page.locator('#fileInput').setInputFiles([audioFile('a.wav', 2)])
  await page.getByRole('button', { name: 'Als Bild teilen' }).click()

  const dialog = page.getByRole('dialog', { name: 'Als Bild teilen' })
  const preview = dialog.getByRole('img', { name: 'Vorschau des Bildes' })
  await expect(preview).toBeVisible()
  await dialog.getByLabel('Hintergrund').fill('#ff6600')
  await dialog.getByLabel('Textfarbe').fill('#101010')

  // Pixel oben links = Hintergrundfarbe (Start des Verlaufs).
  const corner = () =>
    preview.evaluate((img: HTMLImageElement) => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      return Array.from(ctx.getImageData(2, 2, 1, 1).data.slice(0, 3))
    })
  await expect.poll(corner).toEqual([255, 102, 0])
  await expect(dialog.getByText(/Geringer Kontrast/)).toHaveCount(0)

  await dialog.getByRole('button', { name: 'Farben zurücksetzen' }).click()
  await expect.poll(corner).toEqual([9, 20, 40])
})

test('legt ein hochgeladenes Hintergrundbild mit Deckkraft unter das Bild', async ({ page }) => {
  await prepare(page, 'de')
  await page.goto('./app')
  await page.locator('#fileInput').setInputFiles([audioFile('a.wav', 2)])
  await page.getByRole('button', { name: 'Als Bild teilen' }).click()

  const dialog = page.getByRole('dialog', { name: 'Als Bild teilen' })
  const preview = dialog.getByRole('img', { name: 'Vorschau des Bildes' })
  await expect(preview).toBeVisible()
  await dialog
    .locator('[data-input="background-image"]')
    .setInputFiles([pngFile('rot.png', 40, 60, [255, 0, 0])])
  await expect(dialog.getByText('rot.png')).toBeVisible()

  const corner = () =>
    preview.evaluate((img: HTMLImageElement) => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      return Array.from(ctx.getImageData(2, 2, 1, 1).data.slice(0, 3))
    })
  const slider = dialog.getByLabel('Deckkraft')
  await slider.fill('100')
  await expect.poll(corner).toEqual([255, 0, 0])
  await slider.fill('0')
  await expect.poll(corner).toEqual([9, 20, 40])

  await dialog.getByRole('button', { name: 'Bild entfernen' }).click()
  await expect(dialog.getByText('rot.png')).toHaveCount(0)
})
