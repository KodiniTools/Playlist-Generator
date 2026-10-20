/**
 * PWA-Helfer: „Öffnen mit“ über die File Handling API (Chromium; ohne
 * Unterstützung passiert nichts) und Registrierung des Service Workers.
 */

interface LaunchParams {
  files: readonly FileSystemFileHandle[]
}

interface LaunchQueue {
  setConsumer(consumer: (params: LaunchParams) => void): void
}

type WindowWithLaunchQueue = Window & { launchQueue?: LaunchQueue }

/** Ruft `onFiles` für jeden Start mit Dateien auf; liefert false ohne API. */
export function consumeLaunchedFiles(
  onFiles: (files: File[]) => void | Promise<void>,
  win: Window = window,
): boolean {
  const queue = (win as WindowWithLaunchQueue).launchQueue
  if (!queue) return false
  queue.setConsumer(async (params) => {
    if (!params.files?.length) return
    try {
      const files = await Promise.all(params.files.map((handle) => handle.getFile()))
      await onFiles(files)
    } catch (err) {
      console.warn('Could not open launched files:', err)
    }
  })
  return true
}

/** Adressen aller bisher geladenen Ressourcen (Skripte, Styles, Fonts, Bilder). */
function loadedResourceUrls(): string[] {
  return performance
    .getEntriesByType('resource')
    .map((entry) => entry.name)
    .filter((url) => url.startsWith(location.origin))
}

/**
 * Registriert den Service Worker (nur im Produktions-Build, nicht im Dev-Server)
 * und lässt ihn die schon geladenen Dateien für die Offline-Nutzung ablegen.
 */
export function registerServiceWorker(base: string): void {
  if (!('serviceWorker' in navigator)) return
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${base}sw.js`, { scope: base })
      .then(() => navigator.serviceWorker.ready)
      .then((registration) => {
        registration.active?.postMessage({ type: 'cache-urls', urls: loadedResourceUrls() })
      })
      .catch((err: unknown) => {
        console.warn('Service worker registration failed:', err)
      })
  })
}
