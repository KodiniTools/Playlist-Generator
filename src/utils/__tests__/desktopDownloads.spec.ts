import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { DESKTOP_DOWNLOADS, downloadUrl, fileExtension } from '../desktopDownloads'

const ROOT = resolve(__dirname, '../../..')

describe('desktopDownloads', () => {
  it('verlinkt die Dateien unter <Basis>/downloads/', () => {
    expect(downloadUrl('Playlist-Generator-Setup-x64.exe', '/playlist_generator/')).toBe(
      '/playlist_generator/downloads/Playlist-Generator-Setup-x64.exe',
    )
    expect(downloadUrl('a b.msi', '/x')).toBe('/x/downloads/a%20b.msi')
  })

  it('liefert die Endung für die Button-Beschriftung', () => {
    expect(fileExtension('Playlist-Generator-Setup-x64.exe')).toBe('EXE')
    expect(fileExtension('Playlist-Generator-x64-de-DE.msi')).toBe('MSI')
    expect(fileExtension('ohne-endung')).toBe('')
  })

  it('nutzt dieselben festen Namen wie Release-Workflow und deploy-downloads.sh', () => {
    const workflow = readFileSync(resolve(ROOT, '.github/workflows/desktop-windows.yml'), 'utf8')
    const script = readFileSync(resolve(ROOT, 'deploy-downloads.sh'), 'utf8')
    for (const { file } of DESKTOP_DOWNLOADS) {
      expect(workflow).toContain(`dl/${file}`)
      expect(script).toContain(file)
    }
  })

  it('deploy.sh lässt den Ordner downloads/ beim Veröffentlichen stehen', () => {
    const deploy = readFileSync(resolve(ROOT, 'deploy.sh'), 'utf8')
    expect(deploy).toMatch(/^KEEP=\(.*\/downloads\/.*\)$/m)
  })
})
