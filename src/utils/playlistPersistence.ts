/**
 * Playlist Persistence – keeps the working playlist (uploaded files + settings)
 * in IndexedDB so it survives a full page reload or leaving/returning to the
 * app via the site-wide navigation. Everything stays local in the browser.
 *
 * Two stores are used so that cheap, frequent changes (settings, checkbox
 * selection) don't rewrite the potentially large audio blobs:
 *   - files: one record per track  { idx, name, blob, lastModified }
 *   - meta:  a single record        { key, sortOption, playlistName, ... }
 */

import { relativePathOf, setRelativePath } from './trackPath'

const DB_NAME = 'kodinitools-playlist-generator'
const FILES_STORE = 'files'
const META_STORE = 'meta'
const DB_VERSION = 1
const META_KEY = 'current'

/** Settings and checkbox selection, persisted separately from the files. */
export interface PersistedMeta {
  sortOption: string
  playlistName: string
  outputFormat: string
  replaceMode: boolean
  pathMode: string
  basePath: string
  excludedNames: string[]
}

interface MetaRecord extends Partial<PersistedMeta> {
  key: string
}

interface FileRecord {
  idx: number
  name: string
  blob: Blob
  lastModified?: number
  /** Pfad ab dem gewählten Ordner, nur wenn er vom Dateinamen abweicht. */
  relativePath?: string
}

function hasIndexedDB() {
  return typeof indexedDB !== 'undefined'
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(FILES_STORE)) {
        db.createObjectStore(FILES_STORE, { keyPath: 'idx' })
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: 'key' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function runTx(
  db: IDBDatabase,
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode)
    fn(tx.objectStore(storeName))
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

function getAll<T>(db: IDBDatabase, storeName: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const req = db.transaction(storeName, 'readonly').objectStore(storeName).getAll()
    req.onsuccess = () => resolve((req.result as T[]) || [])
    req.onerror = () => reject(req.error)
  })
}

/** Persist the ordered list of files (the heavy write). */
export async function saveFiles(files: File[]): Promise<void> {
  if (!hasIndexedDB()) return
  const db = await openDB()
  try {
    await runTx(db, FILES_STORE, 'readwrite', (store) => {
      store.clear()
      files.forEach((file, idx) => {
        const record: FileRecord = {
          idx,
          name: file.name,
          blob: file,
          lastModified: file.lastModified,
        }
        const relativePath = relativePathOf(file)
        if (relativePath !== file.name) record.relativePath = relativePath
        store.put(record)
      })
    })
  } finally {
    db.close()
  }
}

/** Persist the small settings/selection record (cheap, frequent write). */
export async function saveMeta(meta: PersistedMeta): Promise<void> {
  if (!hasIndexedDB()) return
  const db = await openDB()
  try {
    await runTx(db, META_STORE, 'readwrite', (store) => {
      store.put({ key: META_KEY, ...meta })
    })
  } finally {
    db.close()
  }
}

/** Load the persisted playlist. Fields of `meta` may be missing in old records. */
export async function loadState(): Promise<{ meta: MetaRecord | null; files: File[] }> {
  if (!hasIndexedDB()) return { meta: null, files: [] }
  const db = await openDB()
  try {
    const [metaRecs, fileRecs] = await Promise.all([
      getAll<MetaRecord>(db, META_STORE),
      getAll<FileRecord>(db, FILES_STORE),
    ])
    const meta = metaRecs.find((m) => m.key === META_KEY) || null
    fileRecs.sort((a, b) => a.idx - b.idx)
    const files = fileRecs.map((r) => {
      const file = new File([r.blob], r.name, { lastModified: r.lastModified || Date.now() })
      if (r.relativePath) setRelativePath(file, r.relativePath)
      return file
    })
    return { meta, files }
  } finally {
    db.close()
  }
}

/** Remove everything (used when the user clears the list). */
export async function clearState(): Promise<void> {
  if (!hasIndexedDB()) return
  const db = await openDB()
  try {
    await runTx(db, FILES_STORE, 'readwrite', (store) => store.clear())
    await runTx(db, META_STORE, 'readwrite', (store) => store.clear())
  } finally {
    db.close()
  }
}
