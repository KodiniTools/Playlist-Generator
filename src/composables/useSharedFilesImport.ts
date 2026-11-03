import { ref, watch, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { CalloutType } from '../components/ui'
import { usePlaylist } from './usePlaylist'
import { useTranslation } from './useTranslation'
import { clearSharedFiles, getSharedFiles } from '../utils/sharedFileRepository'
import { isSharedSource } from '../utils/sharedSources'

export type BannerType = 'success' | 'error' | 'warning' | 'info'

export interface SharedBanner {
  type: BannerType
  message: string
}

export const calloutType = (type: BannerType): CalloutType => (type === 'error' ? 'danger' : type)

/**
 * Übernimmt Dateien, die andere KodiniTools (Audio-Normalizer, Audio-Schneider, …)
 * über IndexedDB übergeben haben, sobald `?source=` auf ein bekanntes Tool zeigt.
 * Muss in `setup` aufgerufen werden (Router, Watcher). Läuft je Instanz höchstens einmal.
 */
export function useSharedFilesImport(): { sharedBanner: Ref<SharedBanner | null> } {
  const { t } = useTranslation()
  const route = useRoute()
  const router = useRouter()
  const { addFiles, handleSharedFiles } = usePlaylist()

  const sharedBanner = ref<SharedBanner | null>(null)
  let sharedFilesHandled = false

  const querySource = (): string | null => {
    const source = route.query.source
    return typeof source === 'string' ? source : null
  }

  async function loadSharedFiles() {
    if (sharedFilesHandled) return
    sharedFilesHandled = true

    const source = querySource()
    const isNormalizer = source === 'audionormalizer'
    const isCutter = source === 'audio-cutter'
    const loadingKey = isNormalizer
      ? 'sharedFilesNormalizerLoading'
      : isCutter
        ? 'sharedFilesCutterLoading'
        : 'sharedFilesLoading'
    const emptyKey = isNormalizer
      ? 'sharedFilesNormalizerEmpty'
      : isCutter
        ? 'sharedFilesCutterEmpty'
        : 'sharedFilesEmpty'

    try {
      let records = await getSharedFiles()

      // Leere IndexedDB beim ersten Lesen: einmal nach 1 s erneut versuchen, falls
      // der Absender seinen Schreibvorgang noch nicht abgeschlossen hatte.
      if ((isNormalizer || isCutter) && (!records || records.length === 0)) {
        sharedBanner.value = {
          type: 'info',
          message: t.value(loadingKey).replace('{count}', '...'),
        }
        await new Promise((resolve) => setTimeout(resolve, 1000))
        records = await getSharedFiles()
      }

      if (!records?.length) {
        sharedBanner.value = {
          type: 'warning',
          message: t.value(emptyKey),
        }
        setTimeout(() => {
          sharedBanner.value = null
        }, 5000)
        return
      }

      sharedBanner.value = {
        type: 'info',
        message: t.value(loadingKey).replace('{count}', String(records.length)),
      }

      let loaded = 0

      if (isNormalizer) {
        // Normalizer-Dateien sind bereits gültige WAVs: direkt als File übernehmen.
        const normFiles = records
          .map((record) => {
            const blob =
              record.blob instanceof Blob
                ? record.blob
                : new Blob([record.blob], { type: record.mimeType || 'audio/wav' })
            if (blob.size === 0) return null
            return new File([blob], record.name, {
              type: record.mimeType || blob.type || 'audio/wav',
              lastModified: Date.now(),
            })
          })
          .filter((file): file is File => file !== null)

        loaded = addFiles(normFiles).added
      } else {
        const { processed } = await handleSharedFiles(records)
        loaded = processed
      }

      if (loaded > 0) {
        await clearSharedFiles()
        sharedBanner.value = {
          type: 'success',
          message: (isNormalizer
            ? t.value('sharedFilesNormalizerLoaded')
            : t.value('sharedFilesLoaded')
          ).replace('{count}', String(loaded)),
        }
      } else {
        sharedBanner.value = {
          type: 'warning',
          message: t.value(emptyKey),
        }
      }
    } catch (err) {
      console.error('Error loading shared files:', err)
      sharedBanner.value = { type: 'error', message: t.value('sharedFilesError') }
    }

    setTimeout(() => {
      sharedBanner.value = null
    }, 5000)
  }

  void router.isReady().then(() => {
    if (isSharedSource(querySource())) void loadSharedFiles()
  })

  watch(
    () => route.query.source,
    () => {
      if (isSharedSource(querySource())) void loadSharedFiles()
    },
  )

  return { sharedBanner }
}
