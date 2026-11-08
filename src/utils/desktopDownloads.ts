/**
 * Download-Dateien der Windows-App. Sie liegen auf dem eigenen Server unter
 * /playlist_generator/downloads/ (abgelegt von deploy-downloads.sh, das sie aus
 * dem GitHub-Release holt). Release-Workflow (.github/workflows/desktop-windows.yml)
 * und Skript verwenden genau diese festen Namen, damit die Links bei jeder neuen
 * Version gültig bleiben. deploy.sh lässt den Ordner beim Veröffentlichen stehen.
 */
import type { TranslationKey } from '../composables/useTranslation'

export type DesktopDownloadKey = 'exe' | 'msiDe' | 'msiEn'

export interface DesktopDownload {
  key: DesktopDownloadKey
  /** Fester Dateiname des Release-Assets */
  file: string
  /** Hervorgehobene Empfehlung (für die meisten Nutzer) */
  recommended: boolean
  title: TranslationKey
  description: TranslationKey
}

export const DESKTOP_DOWNLOADS: readonly DesktopDownload[] = [
  {
    key: 'exe',
    file: 'Playlist-Generator-Setup-x64.exe',
    recommended: true,
    title: 'download_exe_title',
    description: 'download_exe_desc',
  },
  {
    key: 'msiDe',
    file: 'Playlist-Generator-x64-de-DE.msi',
    recommended: false,
    title: 'download_msi_de_title',
    description: 'download_msi_de_desc',
  },
  {
    key: 'msiEn',
    file: 'Playlist-Generator-x64-en-US.msi',
    recommended: false,
    title: 'download_msi_en_title',
    description: 'download_msi_en_desc',
  },
]

/** Link zur Datei auf dem eigenen Server, z. B. /playlist_generator/downloads/<Datei>. */
export function downloadUrl(file: string, base: string = import.meta.env.BASE_URL): string {
  return `${base.replace(/\/?$/, '/')}downloads/${encodeURIComponent(file)}`
}

/** Endung in Großbuchstaben für die Button-Beschriftung (EXE, MSI). */
export function fileExtension(file: string): string {
  const dot = file.lastIndexOf('.')
  return dot === -1 ? '' : file.slice(dot + 1).toUpperCase()
}
