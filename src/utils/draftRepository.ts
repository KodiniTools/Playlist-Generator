/**
 * Benannte Entwürfe: vollständige Kopien einer Playlist (Dateien + Einstellungen)
 * in einer eigenen IndexedDB, getrennt vom laufenden Arbeitsstand
 * (playlistPersistence.ts). Alles bleibt lokal im Browser.
 */

import { relativePathOf, setRelativePath } from './trackPath'
import type { PersistedMeta } from './playlistPersistence'

const DB_NAME = 'kodinitools-playlist-drafts'
const STORE = 'drafts'
const DB_VERSION = 1

interface DraftFile {
  name: string
  blob: Blob
  lastModified: number
  relativePath?: string
}

interface DraftRecord {
  id?: number
  name: string
  savedAt: number
  meta: PersistedMeta
  files: DraftFile[]
}

/** Eintrag für die Liste der Entwürfe (ohne Dateiinhalte). */
export interface DraftSummary {
  id: number
  name: string
  savedAt: number
  trackCount: number
}

export interface Draft {
  meta: PersistedMeta
  files: File[]
}

export function draftsAvailable(): boolean {
  return typeof indexedDB !== 'undefined'
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

/** Führt `fn` in einer Transaktion aus und liefert das Ergebnis des letzten Requests. */
async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T> | void,
): Promise<T | undefined> {
  const db = await openDB()
  try {
    return await new Promise<T | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE, mode)
      const req = fn(tx.objectStore(STORE))
      tx.oncomplete = () => resolve(req ? req.result : undefined)
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
  } finally {
    db.close()
  }
}

const allRecords = async () =>
  ((await withStore<DraftRecord[]>('readonly', (store) => store.getAll())) ?? []) as DraftRecord[]

/** Alle Entwürfe, zuletzt gespeicherte zuerst. */
export async function listDrafts(): Promise<DraftSummary[]> {
  if (!draftsAvailable()) return []
  return (await allRecords())
    .map((r) => ({ id: r.id!, name: r.name, savedAt: r.savedAt, trackCount: r.files.length }))
    .sort((a, b) => b.savedAt - a.savedAt)
}

/** Speichert einen Entwurf; ein vorhandener mit gleichem Namen wird ersetzt. */
export async function saveDraft(name: string, meta: PersistedMeta, files: File[]): Promise<void> {
  if (!draftsAvailable()) return
  const existing = (await allRecords()).find((r) => r.name === name)
  const record: DraftRecord = {
    ...(existing?.id !== undefined ? { id: existing.id } : {}),
    name,
    savedAt: Date.now(),
    meta,
    files: files.map((file) => {
      const entry: DraftFile = { name: file.name, blob: file, lastModified: file.lastModified }
      const relativePath = relativePathOf(file)
      if (relativePath !== file.name) entry.relativePath = relativePath
      return entry
    }),
  }
  await withStore('readwrite', (store) => store.put(record))
}

/** Lädt einen Entwurf als neue File-Objekte; null, wenn es ihn nicht mehr gibt. */
export async function loadDraft(id: number): Promise<Draft | null> {
  if (!draftsAvailable()) return null
  const record = await withStore<DraftRecord | undefined>('readonly', (store) => store.get(id))
  if (!record) return null
  const files = record.files.map((f) => {
    const file = new File([f.blob], f.name, { lastModified: f.lastModified })
    if (f.relativePath) setRelativePath(file, f.relativePath)
    return file
  })
  return { meta: record.meta, files }
}

export async function deleteDraft(id: number): Promise<void> {
  if (!draftsAvailable()) return
  await withStore('readwrite', (store) => store.delete(id))
}
