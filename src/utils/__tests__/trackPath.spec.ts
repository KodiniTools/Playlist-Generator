import { describe, expect, it } from 'vitest'
import { relativePathOf, resolveTrackPaths, setRelativePath } from '../trackPath'

/** Datei wie aus einem Ordner-Import, Pfad wie webkitRelativePath / entry.fullPath. */
const fromFolder = (path: string) => {
  const file = new File(['x'], path.split('/').pop() ?? path)
  setRelativePath(file, path)
  return file
}

describe('relativePathOf', () => {
  it('nutzt den gemerkten Pfad ohne führenden Slash und mit /', () => {
    expect(relativePathOf(fromFolder('/Musik/A/01.mp3'))).toBe('Musik/A/01.mp3')
    expect(relativePathOf(fromFolder('Musik\\B\\02.mp3'))).toBe('Musik/B/02.mp3')
  })

  it('fällt auf webkitRelativePath und dann auf den Dateinamen zurück', () => {
    const picked = new File(['x'], '03.mp3')
    Object.defineProperty(picked, 'webkitRelativePath', { value: 'Musik/C/03.mp3' })
    expect(relativePathOf(picked)).toBe('Musik/C/03.mp3')
    expect(relativePathOf(new File(['x'], 'lose.mp3'))).toBe('lose.mp3')
  })
})

describe('resolveTrackPaths', () => {
  const album = [fromFolder('Musik/Album/CD1/01.mp3'), fromFolder('Musik/Album/CD2/01 b.mp3')]

  it('name: nur Dateinamen (bisheriges Verhalten)', () => {
    expect(resolveTrackPaths(album, 'name', '')).toEqual(['01.mp3', '01 b.mp3'])
  })

  it('relative: Pfad ab dem gemeinsamen Ordner aller Titel', () => {
    expect(resolveTrackPaths(album, 'relative', '')).toEqual(['CD1/01.mp3', 'CD2/01 b.mp3'])
  })

  it('relative: Titel im selben Ordner ergeben nur Dateinamen', () => {
    const flat = [fromFolder('Musik/A/x.mp3'), fromFolder('Musik/A/y.mp3')]
    expect(resolveTrackPaths(flat, 'relative', '')).toEqual(['x.mp3', 'y.mp3'])
  })

  it('relative: Titel aus verschiedenen gezogenen Ordnern behalten ihren Ordner', () => {
    const mixed = [fromFolder('A/x.mp3'), fromFolder('B/sub/y.mp3'), new File(['x'], 'z.mp3')]
    expect(resolveTrackPaths(mixed, 'relative', '')).toEqual(['A/x.mp3', 'B/sub/y.mp3', 'z.mp3'])
  })

  it('Basis-URL: Segmente kodiert, Slash ergänzt', () => {
    expect(resolveTrackPaths(album, 'relative', ' https://example.com/musik ')).toEqual([
      'https://example.com/musik/CD1/01.mp3',
      'https://example.com/musik/CD2/01%20b.mp3',
    ])
  })

  it('Windows-Basis: Backslashes durchgehend', () => {
    expect(resolveTrackPaths(album, 'relative', 'D:\\Musik')).toEqual([
      'D:\\Musik\\CD1\\01.mp3',
      'D:\\Musik\\CD2\\01 b.mp3',
    ])
  })

  it('Unix-Basis: Slash ergänzt, keine Kodierung', () => {
    expect(resolveTrackPaths(album, 'name', '/home/kodini/Musik/')).toEqual([
      '/home/kodini/Musik/01.mp3',
      '/home/kodini/Musik/01 b.mp3',
    ])
  })

  it('leere Liste', () => {
    expect(resolveTrackPaths([], 'relative', 'x')).toEqual([])
  })
})
