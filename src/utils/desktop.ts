/**
 * Läuft die App als Windows-Desktop-App (Tauri)?
 * Gesetzt über den Build-Modus: `vite build --mode desktop` (siehe src-tauri/, DESKTOP.md).
 * Im Web-Build ist der Wert immer false, dort ändert sich nichts.
 */
export const IS_DESKTOP: boolean = import.meta.env.MODE === 'desktop'
