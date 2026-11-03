import { isPlaylistFile } from './playlistImport'
import { setRelativePath } from './trackPath'
import { isZipFile } from './zipArchive'

/** Endungen, die beim Ordner-Scan und beim Drop als Audiodatei zählen. */
export const AUDIO_EXTENSIONS = /\.(mp3|wav|flac|ogg|aac|m4a|wma|opus)$/i

export const isAudioFileName = (name: string): boolean => AUDIO_EXTENSIONS.test(name)

/** Minimal benötigte Form eines DataTransferItem (für Tests ohne echten Drag). */
export type DropItem = Pick<DataTransferItem, 'getAsFile'> & {
  webkitGetAsEntry?: () => FileSystemEntry | null
}

const entryOf = (item: DropItem): FileSystemEntry | null =>
  item.webkitGetAsEntry ? item.webkitGetAsEntry() : null

/** true, wenn mindestens ein gezogenes Element ein Ordner ist. */
export const hasDirectoryItem = (items: ArrayLike<DropItem>): boolean =>
  Array.from(items).some((item) => entryOf(item)?.isDirectory === true)

/**
 * Liest ein Verzeichnis rekursiv und sammelt Audiodateien (mit relativem Pfad);
 * `onProgress` meldet die Anzahl gefundener Dateien dieses Verzeichnisses.
 * Lesefehler beenden den Scan des Verzeichnisses ohne Rejection.
 */
export const readDirectoryEntry = (
  directory: FileSystemDirectoryEntry,
  onProgress?: (count: number) => void,
): Promise<File[]> =>
  new Promise((resolve) => {
    const reader = directory.createReader()
    const results: File[] = []

    const readBatch = () => {
      reader.readEntries(
        (entries) => {
          if (entries.length === 0) {
            resolve(results)
            return
          }
          const pending = entries.map((entry) => {
            if (entry.isFile) {
              return new Promise<void>((done) => {
                ;(entry as FileSystemFileEntry).file(
                  (file) => {
                    if (isAudioFileName(file.name)) {
                      setRelativePath(file, entry.fullPath)
                      results.push(file)
                      onProgress?.(results.length)
                    }
                    done()
                  },
                  () => done(),
                )
              })
            }
            if (entry.isDirectory) {
              return readDirectoryEntry(entry as FileSystemDirectoryEntry, onProgress).then(
                (files) => {
                  results.push(...files)
                },
              )
            }
            return Promise.resolve()
          })
          void Promise.all(pending).then(readBatch)
        },
        () => resolve(results),
      )
    }

    readBatch()
  })

/**
 * Sammelt aus einem Drop alle Audiodateien (Ordner rekursiv) sowie direkt
 * gezogene Playlists und ZIP-Archive. Playlists und ZIPs aus Ordnern bleiben außen vor.
 */
export async function collectDroppedFiles(
  items: ArrayLike<DropItem>,
  onProgress?: (count: number) => void,
): Promise<File[]> {
  const collected: File[] = []

  const pending = Array.from(items).map((item) => {
    const entry = entryOf(item)
    if (!entry) {
      const file = item.getAsFile()
      if (
        file &&
        (isAudioFileName(file.name) || isPlaylistFile(file.name) || isZipFile(file.name))
      ) {
        collected.push(file)
      }
      return Promise.resolve()
    }

    if (entry.isFile) {
      return new Promise<void>((done) => {
        ;(entry as FileSystemFileEntry).file(
          (file) => {
            if (isAudioFileName(file.name)) {
              setRelativePath(file, entry.fullPath)
              collected.push(file)
            } else if (isPlaylistFile(file.name) || isZipFile(file.name)) {
              collected.push(file)
            }
            done()
          },
          () => done(),
        )
      })
    }

    if (entry.isDirectory) {
      return readDirectoryEntry(entry as FileSystemDirectoryEntry, onProgress).then((files) => {
        collected.push(...files)
      })
    }

    return Promise.resolve()
  })

  await Promise.all(pending)
  return collected
}
