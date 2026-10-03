/** Typdeklaration für sharedFileRepository.js (IndexedDB-Übergabe zwischen KodiniTools). */
export interface SharedFileRecord {
  name: string
  blob: Blob | ArrayBuffer
  mimeType?: string
}

export function shareFiles(files: { name: string; blob: Blob }[]): Promise<void>
export function getSharedFiles(): Promise<SharedFileRecord[]>
export function clearSharedFiles(): Promise<void>
