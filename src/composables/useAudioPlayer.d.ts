import type { ComputedRef, Ref } from 'vue'

export type RepeatMode = 'off' | 'all' | 'one'

export interface PlayerTrack {
  index: number
  name: string
  /** Dateiname ohne Endung. */
  title: string
  file: File
}

/** Typdeklaration für useAudioPlayer.js (ein <audio>-Element je Aufruf, kein Singleton). */
export function useAudioPlayer(filesRef: Ref<File[]>): {
  isPlaying: Ref<boolean>
  isPaused: Ref<boolean>
  currentTrackIndex: Ref<number>
  currentTrack: ComputedRef<PlayerTrack | null>
  currentTime: Ref<number>
  duration: Ref<number>
  volume: Ref<number>
  isMuted: Ref<boolean>
  repeatMode: Ref<RepeatMode>
  playlist: ComputedRef<PlayerTrack[]>
  /** Ohne Index: aktuellen Titel fortsetzen, sonst den ersten laden. */
  play(index?: number): void
  /** Lädt Titel und Dauer ohne abzuspielen. */
  cue(index: number): boolean
  cycleRepeatMode(): void
  pause(): void
  stop(): void
  togglePlay(): void
  next(): void
  previous(): void
  seek(seconds: number): void
  setVolume(value: number): void
  toggleMute(): void
  formatTime(seconds: number): string
}
