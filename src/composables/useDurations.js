import { reactive } from 'vue'

// Module-level singleton: filename → duration in seconds (real, from audio metadata)
const known = reactive(new Map())

// Names currently being probed, so overlapping calls don't measure twice.
const measuring = new Set()

// Read the real duration of a single File from its audio metadata. Only the
// metadata (header) is loaded, never the whole file, so this is fast and works
// fully offline. Resolves regardless of success — failures just leave the file
// without a known duration (an estimate is used instead).
const measureFile = (file) =>
  new Promise((resolve) => {
    const audio = new Audio()
    const url = URL.createObjectURL(file)

    const cleanup = () => {
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('error', onError)
      URL.revokeObjectURL(url)
      audio.removeAttribute('src')
    }

    const onLoaded = () => {
      const seconds = audio.duration
      if (isFinite(seconds) && seconds > 0) known.set(file.name, seconds)
      cleanup()
      resolve()
    }
    const onError = () => {
      cleanup()
      resolve()
    }

    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('error', onError)
    audio.preload = 'metadata'
    audio.src = url
  })

export function useDurations() {
  const setDuration = (filename, seconds) => {
    if (filename && isFinite(seconds) && seconds > 0) {
      known.set(filename, seconds)
    }
  }

  const getDuration = (filename) => known.get(filename) ?? null

  // Ensure every file has a real, metadata-based duration. Files already known
  // (or already being measured) are skipped. Runs with limited concurrency to
  // avoid opening too many decoders at once.
  const measureDurations = async (files) => {
    const pending = []
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
        const file = pending[cursor++]
        try {
          await measureFile(file)
        } finally {
          measuring.delete(file.name)
        }
      }
    }
    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, pending.length) }, worker),
    )
  }

  return { known, setDuration, getDuration, measureDurations }
}
