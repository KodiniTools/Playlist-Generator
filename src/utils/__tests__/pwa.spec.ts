import { describe, expect, it, vi } from 'vitest'
import { consumeLaunchedFiles } from '../pwa'

type Handle = { getFile: () => Promise<File> }
type Consumer = (params: { files: Handle[] }) => Promise<void>

/** Fenster mit nachgebauter launchQueue; `launch` startet die App mit Handles. */
function fakeWindow() {
  let consumer: Consumer | undefined
  const win = { launchQueue: { setConsumer: (fn: Consumer) => (consumer = fn) } }
  return { win: win as unknown as Window, launch: (files: Handle[]) => consumer!({ files }) }
}

const handle = (file: File): Handle => ({ getFile: async () => file })

describe('consumeLaunchedFiles', () => {
  it('liefert false ohne launchQueue', () => {
    expect(consumeLaunchedFiles(vi.fn(), {} as Window)).toBe(false)
  })

  it('reicht die gestarteten Dateien weiter und ignoriert Starts ohne Dateien', async () => {
    const { win, launch } = fakeWindow()
    const onFiles = vi.fn()
    expect(consumeLaunchedFiles(onFiles, win)).toBe(true)

    await launch([])
    expect(onFiles).not.toHaveBeenCalled()

    const files = [new File(['a'], 'a.mp3'), new File(['b'], 'mix.m3u')]
    await launch(files.map(handle))
    expect(onFiles).toHaveBeenCalledWith(files)
  })

  it('fängt Fehler beim Lesen der Dateien ab', async () => {
    const { win, launch } = fakeWindow()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const onFiles = vi.fn()
    consumeLaunchedFiles(onFiles, win)
    await launch([{ getFile: () => Promise.reject(new Error('weg')) }])
    expect(onFiles).not.toHaveBeenCalled()
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})
