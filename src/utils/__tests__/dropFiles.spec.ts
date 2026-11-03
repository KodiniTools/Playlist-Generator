import { describe, expect, it, vi } from 'vitest'
import { collectDroppedFiles, hasDirectoryItem, isAudioFileName, type DropItem } from '../dropFiles'
import { relativePathOf } from '../trackPath'

const file = (name: string) => new File(['x'], name)

/** Minimales FileSystemFileEntry für jsdom. */
function fileEntry(path: string): FileSystemFileEntry {
  const name = path.split('/').pop() ?? path
  return {
    isFile: true,
    isDirectory: false,
    name,
    fullPath: path,
    file: (ok: (f: File) => void) => ok(file(name)),
  } as unknown as FileSystemFileEntry
}

/** Verzeichnis, dessen Reader die Einträge in einem Batch liefert, danach leer. */
function dirEntry(path: string, children: FileSystemEntry[]): FileSystemDirectoryEntry {
  return {
    isFile: false,
    isDirectory: true,
    name: path.split('/').pop(),
    fullPath: path,
    createReader: () => {
      let done = false
      return {
        readEntries: (ok: (entries: FileSystemEntry[]) => void) => {
          ok(done ? [] : children)
          done = true
        },
      }
    },
  } as unknown as FileSystemDirectoryEntry
}

const entryItem = (entry: FileSystemEntry): DropItem => ({
  webkitGetAsEntry: () => entry,
  getAsFile: () => null,
})

describe('dropFiles', () => {
  it('erkennt Audio-Endungen unabhängig von Groß-/Kleinschreibung', () => {
    expect(isAudioFileName('a.MP3')).toBe(true)
    expect(isAudioFileName('a.flac')).toBe(true)
    expect(isAudioFileName('cover.jpg')).toBe(false)
  })

  it('liest Ordner rekursiv, setzt relative Pfade und meldet Fortschritt', async () => {
    const tree = dirEntry('/Album', [
      fileEntry('/Album/01.mp3'),
      fileEntry('/Album/cover.jpg'),
      fileEntry('/Album/list.m3u'),
      dirEntry('/Album/CD2', [fileEntry('/Album/CD2/02.wav')]),
    ])
    const onProgress = vi.fn()
    const items = [entryItem(tree)]
    expect(hasDirectoryItem(items)).toBe(true)

    const files = await collectDroppedFiles(items, onProgress)
    expect(files.map((f) => f.name).sort()).toEqual(['01.mp3', '02.wav'])
    expect(files.map(relativePathOf).sort()).toEqual(['Album/01.mp3', 'Album/CD2/02.wav'])
    expect(onProgress).toHaveBeenCalled()
  })

  it('nimmt direkt gezogene Playlists und ZIPs, aber keine anderen Dateien', async () => {
    const plain = (name: string): DropItem => ({ getAsFile: () => file(name) })
    const items = [
      entryItem(fileEntry('/mix.m3u')),
      plain('archiv.zip'),
      plain('song.ogg'),
      plain('notes.txt'),
    ]
    expect(hasDirectoryItem(items)).toBe(false)
    const files = await collectDroppedFiles(items)
    expect(files.map((f) => f.name).sort()).toEqual(['archiv.zip', 'mix.m3u', 'song.ogg'])
  })

  it('liefert bei Lesefehlern eines Ordners die bis dahin gefundenen Dateien', async () => {
    const broken = {
      isFile: false,
      isDirectory: true,
      fullPath: '/x',
      createReader: () => ({ readEntries: (_ok: unknown, fail: () => void) => fail() }),
    } as unknown as FileSystemDirectoryEntry
    await expect(collectDroppedFiles([entryItem(broken)])).resolves.toEqual([])
  })
})
