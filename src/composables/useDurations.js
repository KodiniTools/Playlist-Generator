import { reactive } from 'vue'

// Module-level singleton: filename → duration in seconds (real, from audio metadata)
const known = reactive(new Map())

export function useDurations() {
  const setDuration = (filename, seconds) => {
    if (filename && isFinite(seconds) && seconds > 0) {
      known.set(filename, seconds)
    }
  }

  const getDuration = (filename) => known.get(filename) ?? null

  return { known, setDuration, getDuration }
}
