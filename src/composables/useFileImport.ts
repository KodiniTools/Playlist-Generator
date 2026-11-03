import { useToast } from './useToast'
import { usePlaylist } from './usePlaylist'
import { useTranslation, type TranslationKey } from './useTranslation'
import { isAudioFileName } from '../utils/dropFiles'
import {
  isPlaylistFile,
  parsePlaylistEntries,
  playlistFormatOf,
  playlistNameOf,
  readPlaylistText,
} from '../utils/playlistImport'
import { setRelativePath } from '../utils/trackPath'
import { extractAudioFromZip, isZipFile, ZipError } from '../utils/zipArchive'

/** Audio, Playlist oder ZIP: alles, was Dialog, Drop, Einfügen und „Öffnen mit“ annehmen. */
export const isImportableFileName = (name: string): boolean =>
  isAudioFileName(name) || isPlaylistFile(name) || isZipFile(name)

/**
 * Nimmt Dateien aus allen Quellen entgegen: entpackt ZIP-Archive (nacheinander),
 * fügt Audiodateien hinzu und öffnet eine mitgegebene Playlist danach.
 * Ergebnisse und Fehler meldet sie per Toast.
 */
export function useFileImport() {
  const { t } = useTranslation()
  const toast = useToast()
  const { addFiles, openPlaylist } = usePlaylist()

  /** Entpackt ein ZIP-Archiv und meldet Übersprungenes oder Fehler per Toast. */
  const unpackZip = async (zip: File): Promise<File[]> => {
    const fill = (key: TranslationKey, count = 0) =>
      t.value(key).replace('{name}', zip.name).replace('{count}', String(count))
    const busy = toast.addToast(fill('toast_zip_extracting'), 'info', 0)
    try {
      const { files, paths, skipped } = await extractAudioFromZip(zip)
      for (const file of files) setRelativePath(file, paths.get(file) ?? file.name)
      const unsupported = skipped.filter((entry) => entry.reason === 'unsupported').length
      const unreadable = skipped.length - unsupported
      if (files.length === 0 && unreadable === 0) {
        toast.error(fill('toast_zip_no_audio'))
        return files
      }
      if (unsupported > 0) toast.info(fill('toast_zip_skipped_unsupported', unsupported), 5000)
      if (unreadable > 0) toast.error(fill('toast_zip_skipped_unreadable', unreadable))
      return files
    } catch (err) {
      console.warn('Could not extract ZIP:', zip.name, err)
      const tooLarge = err instanceof ZipError && err.code !== 'invalid'
      toast.error(fill(tooLarge ? 'toast_zip_too_large' : 'toast_zip_invalid'))
      return []
    } finally {
      toast.removeToast(busy)
    }
  }

  const handleAddFiles = async (fileList: File[] | FileList) => {
    const all = Array.from(fileList)
    const zips = all.filter((file) => isZipFile(file.name))
    const unpacked: File[] = []
    // Nacheinander entpacken, damit nie mehrere Archive gleichzeitig im Speicher landen.
    for (const zip of zips) unpacked.push(...(await unpackZip(zip)))
    const rest = all.filter((file) => !isZipFile(file.name))
    const playlist = rest.find((file) => isPlaylistFile(file.name))
    const audio = [...rest.filter((file) => !isPlaylistFile(file.name)), ...unpacked]
    // Leere Archive sollen im Ersetzen-Modus nicht die Liste leeren.
    if (zips.length > 0 && audio.length === 0) {
      if (playlist) await handleOpenPlaylist(playlist)
      return
    }
    const { added, skipped } = addFiles(audio)
    if (added > 0) {
      toast.info(t.value('toast_files_added').replace('{count}', String(added)))
    }
    if (skipped > 0) {
      toast.info(t.value('toast_duplicates_skipped').replace('{count}', String(skipped)))
    }
    if (playlist) await handleOpenPlaylist(playlist)
  }

  const handleOpenPlaylist = async (file: File) => {
    const format = playlistFormatOf(file.name)
    if (!format) return
    const name = playlistNameOf(file.name)
    let entries: string[] = []
    try {
      entries = parsePlaylistEntries(await readPlaylistText(file), format)
    } catch (err) {
      console.warn('Could not read playlist:', file.name, err)
    }
    const fill = (key: TranslationKey, values: Record<string, number> = {}) =>
      Object.entries({ ...values, name }).reduce(
        (text, [k, v]) => text.replace(`{${k}}`, String(v)),
        t.value(key),
      )
    if (entries.length === 0) {
      toast.error(fill('toast_playlist_empty'))
      return
    }
    const { matched, total } = openPlaylist(entries, name, format)
    if (matched === 0) toast.error(fill('toast_playlist_no_match', { total }))
    else toast.success(fill('toast_playlist_opened', { matched, total }))
  }

  return { handleAddFiles, handleOpenPlaylist }
}
