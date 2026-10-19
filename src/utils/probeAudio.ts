/** Wartezeit, bis eine Datei ohne Metadaten-Ereignis als nicht lesbar gilt. */
export const PROBE_TIMEOUT_MS = 10_000

/**
 * Liest nur die Metadaten (Header) einer Audiodatei über ein HTMLAudioElement,
 * ohne sie komplett zu dekodieren. Liefert die Dauer in Sekunden (oder null,
 * wenn der Browser keine endliche Dauer kennt, z. B. bei Streams). Wirft, wenn
 * der Browser die Datei nicht lesen kann oder nach `timeoutMs` nichts meldet.
 */
export function probeAudio(blob: Blob, timeoutMs = PROBE_TIMEOUT_MS): Promise<number | null> {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    const url = URL.createObjectURL(blob)

    const cleanup = () => {
      clearTimeout(timer)
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('error', onError)
      audio.removeAttribute('src')
      URL.revokeObjectURL(url)
    }
    const onLoaded = () => {
      const seconds = audio.duration
      cleanup()
      resolve(Number.isFinite(seconds) && seconds > 0 ? seconds : null)
    }
    const onError = () => {
      cleanup()
      reject(new Error('Audio-Metadaten nicht lesbar'))
    }
    const timer = setTimeout(() => {
      cleanup()
      reject(new Error(`Keine Audio-Metadaten nach ${timeoutMs} ms`))
    }, timeoutMs)

    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('error', onError)
    audio.preload = 'metadata'
    audio.src = url
  })
}
