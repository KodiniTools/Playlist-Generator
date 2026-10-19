import { ref } from 'vue'
import { readAudioTags, type AudioTags } from '../utils/audioTags'

// Modul-Singleton je File-Objekt (gleiche Namen in verschiedenen Ordnern bleiben getrennt).
const tags = new WeakMap<File, AudioTags | null>()
const reading = new WeakSet<File>()
// WeakMap ist nicht reaktiv; jede neue Antwort zählt hoch.
const revision = ref(0)

/** Tags (Interpret, Titel, Album, Nummer) aus den Audiodateien, asynchron gelesen. */
export function useTrackTags() {
  /** Gelesene Tags; null = (noch) keine. Reaktiv über `revision`. */
  const getTags = (file: File): AudioTags | null => {
    void revision.value
    return tags.get(file) ?? null
  }

  /** Liest die Tags aller noch unbekannten Dateien, höchstens 4 gleichzeitig. Wirft nie. */
  const readTags = async (files: Iterable<File>) => {
    const pending: File[] = []
    for (const file of files) {
      if (tags.has(file) || reading.has(file)) continue
      reading.add(file)
      pending.push(file)
    }
    if (pending.length === 0) return

    let cursor = 0
    const worker = async () => {
      while (cursor < pending.length) {
        const file = pending[cursor++]!
        const result = await readAudioTags(file)
        tags.set(file, result)
        reading.delete(file)
        if (result) revision.value++
      }
    }
    await Promise.all(Array.from({ length: Math.min(4, pending.length) }, worker))
  }

  return { revision, getTags, readTags }
}
