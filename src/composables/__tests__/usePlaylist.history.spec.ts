import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'
import { nextTick } from 'vue'
import { usePlaylist } from '../usePlaylist'

const mk = (name: string, lastModified = 1) => new File(['x'], name, { lastModified })

const names = (files: File[]) => files.map((f) => f.name)

describe('usePlaylist – undo/redo', () => {
  const p = usePlaylist()

  beforeAll(async () => {
    // Let the (no-op without IndexedDB) persistence restore settle.
    await new Promise((r) => setTimeout(r, 0))
    await nextTick()
  })

  it('keeps steps recorded while the persisted state was still loading', async () => {
    // Fresh module instance: usePlaylist() kicks off the async restore.
    vi.resetModules()
    const fresh = await import('../usePlaylist')
    const q = fresh.usePlaylist()
    q.addFiles([mk('early.mp3')])
    expect(q.canUndo.value).toBe(true)
    await new Promise((r) => setTimeout(r, 0))
    await nextTick()
    expect(q.canUndo.value).toBe(true)
    expect(q.undo()).toBe('files_added')
    expect(q.files.value).toHaveLength(0)
  })

  beforeEach(() => {
    p.files.value = []
    p.excludedFiles.value = new Set()
    p.sortOption.value = 'alphabetical'
    p.playlistName.value = 'meine_wiedergabeliste'
    p.outputFormat.value = 'm3u'
    p.replaceMode.value = false
    p.selectedFileIndex.value = -1
    p.generatePlaylist()
    p.clearHistory()
  })

  it('undoes and redoes adding files', () => {
    expect(p.canUndo.value).toBe(false)
    p.addFiles([mk('b.mp3'), mk('a.mp3')])
    expect(names(p.files.value)).toEqual(['a.mp3', 'b.mp3'])
    expect(p.undoLabel.value).toBe('files_added')

    expect(p.undo()).toBe('files_added')
    expect(p.files.value).toHaveLength(0)
    expect(p.playlistContent.value).toBe('')

    expect(p.redo()).toBe('files_added')
    expect(names(p.files.value)).toEqual(['a.mp3', 'b.mp3'])
    expect(p.playlistContent.value).toContain('a.mp3')
  })

  it('does not record a step when only duplicates are added', () => {
    p.addFiles([mk('a.mp3')])
    p.clearHistory()
    const result = p.addFiles([mk('A.MP3')])
    expect(result).toEqual({ added: 0, skipped: 1 })
    expect(p.canUndo.value).toBe(false)
  })

  it('restores a removed track at its original position', () => {
    p.addFiles([mk('a.mp3'), mk('b.mp3'), mk('c.mp3')])
    p.removeFile(1)
    expect(names(p.files.value)).toEqual(['a.mp3', 'c.mp3'])

    p.undo()
    expect(names(p.files.value)).toEqual(['a.mp3', 'b.mp3', 'c.mp3'])
    p.redo()
    expect(names(p.files.value)).toEqual(['a.mp3', 'c.mp3'])
  })

  it('undoes clearing the list and keeps the checkbox selection', () => {
    p.addFiles([mk('a.mp3'), mk('b.mp3')])
    p.toggleFileSelected(1) // uncheck b
    p.clearFiles()
    expect(p.files.value).toHaveLength(0)

    p.undo() // clear
    expect(names(p.files.value)).toEqual(['a.mp3', 'b.mp3'])
    expect(p.isFileSelected(p.files.value[0])).toBe(true)
    expect(p.isFileSelected(p.files.value[1])).toBe(false)
    expect(p.playlistContent.value).not.toContain('b.mp3')

    p.undo() // toggle
    expect(p.isFileSelected(p.files.value[1])).toBe(true)
    expect(p.playlistContent.value).toContain('b.mp3')
  })

  it('clearing an empty list is not recorded', () => {
    p.clearFiles()
    expect(p.canUndo.value).toBe(false)
  })

  it('undoes a manual move including the switch to manual sort mode', () => {
    p.addFiles([mk('a.mp3'), mk('b.mp3'), mk('c.mp3')])
    p.moveFile(0, 2)
    expect(names(p.files.value)).toEqual(['b.mp3', 'c.mp3', 'a.mp3'])
    expect(p.sortOption.value).toBe('manual')

    p.undo()
    expect(names(p.files.value)).toEqual(['a.mp3', 'b.mp3', 'c.mp3'])
    expect(p.sortOption.value).toBe('alphabetical')
  })

  it('undoes a sort option change together with the resulting order', () => {
    p.addFiles([mk('b.mp3', 2), mk('a.mp3', 3), mk('c.mp3', 1)])
    expect(names(p.files.value)).toEqual(['a.mp3', 'b.mp3', 'c.mp3'])

    p.applySortOption('date')
    expect(p.sortOption.value).toBe('date')
    expect(names(p.files.value)).toEqual(['c.mp3', 'b.mp3', 'a.mp3'])

    expect(p.undo()).toBe('sorted')
    expect(p.sortOption.value).toBe('alphabetical')
    expect(names(p.files.value)).toEqual(['a.mp3', 'b.mp3', 'c.mp3'])
  })

  it('merges consecutive name edits into one step', () => {
    p.setPlaylistName('m')
    p.setPlaylistName('mi')
    p.setPlaylistName('mix')
    expect(p.playlistName.value).toBe('mix')

    expect(p.undo()).toBe('name_changed')
    expect(p.playlistName.value).toBe('meine_wiedergabeliste')
    expect(p.canUndo.value).toBe(false)

    p.redo()
    expect(p.playlistName.value).toBe('mix')
  })

  it('records format and replace-mode changes, ignoring no-op sets', () => {
    p.setOutputFormat('m3u') // no change
    p.setReplaceMode(false) // no change
    expect(p.canUndo.value).toBe(false)

    p.setOutputFormat('json')
    p.setReplaceMode(true)
    expect(p.undo()).toBe('replace_mode_changed')
    expect(p.replaceMode.value).toBe(false)
    expect(p.undo()).toBe('format_changed')
    expect(p.outputFormat.value).toBe('m3u')
  })

  it('clamps the UI selection when undo shortens the list', () => {
    p.addFiles([mk('a.mp3')])
    p.selectedFileIndex.value = 0
    p.undo()
    expect(p.selectedFileIndex.value).toBe(-1)
  })

  it('a new action after undo discards the redo branch', () => {
    p.addFiles([mk('a.mp3')])
    p.undo()
    p.addFiles([mk('z.mp3')])
    expect(p.canRedo.value).toBe(false)
    expect(names(p.files.value)).toEqual(['z.mp3'])
  })
})
