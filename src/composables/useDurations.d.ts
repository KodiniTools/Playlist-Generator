/** Typdeklaration für useDurations.js (Dauern aus Audio-Metadaten, Singleton-Map). */
export function useDurations(): {
  /** Dateiname → Dauer in Sekunden, reaktiv. */
  known: Map<string, number>
  setDuration(filename: string, seconds: number): void
  getDuration(filename: string): number | null
  measureDurations(files: Iterable<File> | null | undefined): Promise<void>
}
