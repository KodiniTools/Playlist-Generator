/**
 * Übergabe der fertigen Wiedergabeliste an den Kodini Texteditor.
 *
 * Protokoll (beide Tools liegen unter kodinitools.com, teilen also localStorage):
 * 1. Eintrag unter HANDOFF_STORAGE_KEY ablegen
 *    { version: 1, source, name, content, mimeType, sharedAt }
 * 2. TEXT_EDITOR_APP_URL mit ?source=playlist_generator in einem neuen Tab öffnen.
 * Der Editor liest den Eintrag beim Start genau einmal, entfernt ihn und öffnet
 * ein neues Dokument. Gegenstück: text-editor/src/utils/handoff.ts
 */
import type { OutputFormat } from '../composables/usePlaylist'

export const TEXT_EDITOR_APP_URL = 'https://kodinitools.com/texteditor/app'
export const HANDOFF_STORAGE_KEY = 'kodinitools-texteditor-handoff-v1'
export const HANDOFF_VERSION = 1
export const HANDOFF_SOURCE = 'playlist_generator'

export interface HandoffDocument {
  name: string
  content: string
  mimeType: string
}

export const FORMAT_MIME: Readonly<Record<OutputFormat, string>> = {
  m3u: 'audio/x-mpegurl',
  m3u8: 'application/vnd.apple.mpegurl',
  pls: 'audio/x-scpls',
  txt: 'text/plain',
  cue: 'application/x-cue',
  csv: 'text/csv',
  json: 'application/json',
  xspf: 'application/xspf+xml',
}

/** Ziel-URL des Editors mit Quellkennung. */
export function textEditorUrl(): string {
  return `${TEXT_EDITOR_APP_URL}?source=${HANDOFF_SOURCE}`
}

/** Legt die Datei für den Editor ab. false, wenn localStorage fehlt oder voll ist. */
export function storeHandoff(doc: HandoffDocument, now: number = Date.now()): boolean {
  const entry = {
    version: HANDOFF_VERSION,
    source: HANDOFF_SOURCE,
    name: doc.name,
    content: doc.content,
    mimeType: doc.mimeType,
    sharedAt: now,
  }
  try {
    localStorage.setItem(HANDOFF_STORAGE_KEY, JSON.stringify(entry))
    return true
  } catch {
    return false
  }
}

/**
 * Legt die Datei ab und öffnet den Editor in einem neuen Tab. Muss aus einer
 * Nutzeraktion heraus aufgerufen werden (Popup-Blocker). false = nichts geöffnet.
 */
export function openInTextEditor(
  doc: HandoffDocument,
  open: (url: string) => unknown = (url) => window.open(url, '_blank', 'noopener'),
): boolean {
  if (!storeHandoff(doc)) return false
  open(textEditorUrl())
  return true
}
