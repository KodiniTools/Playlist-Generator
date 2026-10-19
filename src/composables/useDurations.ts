import { reactive } from 'vue'
import { probeAudio } from '../utils/probeAudio'

// Module-level singleton: filename → duration in seconds (real, from audio metadata)
const known = reactive(new Map<string, number>())

// Names currently being probed, so overlapping calls don't measure twice.
const measuring = new Set<string>()

// Read the real duration of a single File from its audio metadata (see
// probeAudio). Never throws — failures just leave the file without a known
// duration (an estimate is used instead).
const measureFile = async (file: File) => {
  try {
    const seconds = await probeAudio(file)
    if (seconds !== null) known.set(file.name, seconds)
  } catch {
    // Nicht lesbar: Schätzung bleibt.
  }
}

/** Dauern aus Audio-Metadaten, Singleton-Map. */
export function useDurations() {
  const setDuration = (filename: string, seconds: number) => {
    if (filename && isFinite(seconds) && seconds > 0) {
      known.set(filename, seconds)
    }
  }

  const getDuration = (filename: string): number | null => known.get(filename) ?? null

  // Ensure every file has a real, metadata-based duration. Files already known
  // (or already being measured) are skipped. Runs with limited concurrency to
  // avoid opening too many decoders at once.
  const measureDurations = async (files: Iterable<File> | null | undefined) => {
    const pending: File[] = []
    for (const file of files || []) {
      if (!file || !file.name) continue
      if (known.has(file.name) || measuring.has(file.name)) continue
      measuring.add(file.name)
      pending.push(file)
    }
    if (pending.length === 0) return

    const CONCURRENCY = 4
    let cursor = 0
    const worker = async () => {
      while (cursor < pending.length) {
        const file = pending[cursor++]!
        try {
          await measureFile(file)
        } finally {
          measuring.delete(file.name)
        }
      }
    }
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, pending.length) }, worker))
  }

  return { known, setDuration, getDuration, measureDurations }
}
