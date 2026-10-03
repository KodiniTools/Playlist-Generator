<template>
  <div v-if="files.length > 0" class="player" role="region" :aria-label="t('player_title')">
    <div class="player__inner">
      <div class="player__track">
        <span class="player__art" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </span>
        <div class="player__meta">
          <span v-if="currentTrack" class="player__title" :title="currentTrack.title">
            {{ currentTrack.title }}
          </span>
          <span v-else class="player__title player__title--empty">{{ t('player_no_track') }}</span>
          <span class="player__time"
            >{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span
          >
        </div>
      </div>

      <div class="player__controls">
        <UiIconButton :label="t('player_previous')" @click="previous">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <polygon points="19 20 9 12 19 4 19 20" />
            <rect x="4" y="4" width="2" height="16" rx="1" />
          </svg>
        </UiIconButton>
        <UiIconButton class="player__stop" :label="t('player_stop')" @click="stop">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="6" width="12" height="12" rx="1" />
          </svg>
        </UiIconButton>
        <UiIconButton
          variant="primary"
          round
          :label="isPlaying ? t('player_pause') : t('player_play')"
          @click="handlePlay"
        >
          <svg v-if="isPlaying" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <polygon points="7 3 20 12 7 21 7 3" />
          </svg>
        </UiIconButton>
        <UiIconButton :label="t('player_next')" @click="next">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 4 15 12 5 20 5 4" />
            <rect x="18" y="4" width="2" height="16" rx="1" />
          </svg>
        </UiIconButton>
        <UiIconButton
          class="player__repeat"
          :label="repeatTitle"
          :pressed="repeatMode !== 'off'"
          @click="cycleRepeatMode"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="17 1 21 5 17 9" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <polyline points="7 23 3 19 7 15" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
          <span v-if="repeatMode === 'one'" class="player__repeat-badge" aria-hidden="true">1</span>
        </UiIconButton>
      </div>

      <div
        ref="progressBarRef"
        class="player__seek"
        role="slider"
        tabindex="0"
        :aria-label="t('player_title')"
        :aria-valuemin="0"
        :aria-valuemax="Math.round(duration)"
        :aria-valuenow="Math.round(currentTime)"
        :aria-valuetext="`${formatTime(currentTime)} / ${formatTime(duration)}`"
        @pointerdown="onSeekPointerDown"
        @pointermove="onSeekPointerMove"
        @pointerup="onSeekPointerUp"
        @pointercancel="onSeekPointerUp"
        @keydown="onSeekKeydown"
      >
        <span class="player__seek-track">
          <span class="player__seek-fill" :style="{ width: `${progressPercent}%` }"></span>
        </span>
      </div>

      <div class="player__right">
        <div class="player__volume">
          <UiIconButton
            :label="isMuted ? t('player_unmute') : t('player_mute')"
            @click="toggleMute"
          >
            <svg
              v-if="isMuted || volume === 0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
            <svg
              v-else
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path v-if="volume >= 0.5" d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          </UiIconButton>
          <label for="player-volume" class="player__sr-only">{{ t('player_volume') }}</label>
          <input
            id="player-volume"
            type="range"
            class="player__volume-slider"
            min="0"
            max="1"
            step="0.01"
            :value="volume"
            @input="onVolumeChange"
          />
        </div>
        <UiButton
          variant="ghost"
          size="sm"
          :class="['player__queue-toggle', { 'player__queue-toggle--active': showQueue }]"
          :aria-label="t('player_queue')"
          :aria-expanded="showQueue"
          aria-controls="player-queue"
          @click="toggleQueue"
        >
          <template #icon>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
            >
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </template>
          {{ playlist.length }}
        </UiButton>
      </div>
    </div>

    <Transition name="player-queue">
      <div v-if="showQueue" id="player-queue" class="player__queue">
        <div class="player__queue-header">
          <span class="player__queue-title">{{ t('player_queue') }}</span>
          <UiIconButton size="sm" :label="t('shortcuts_close_btn')" @click="showQueue = false">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </UiIconButton>
        </div>
        <ul class="player__queue-list">
          <li v-for="(track, idx) in playlist" :key="`${track.name}-${idx}`">
            <button
              type="button"
              :class="[
                'player__queue-item',
                { 'player__queue-item--active': idx === currentTrackIndex },
              ]"
              :title="track.title"
              :aria-current="idx === currentTrackIndex ? 'true' : undefined"
              @click="play(idx)"
            >
              <span class="player__queue-index">{{ idx + 1 }}</span>
              <span class="player__queue-name">{{ track.title }}</span>
              <svg
                v-if="idx === currentTrackIndex && isPlaying"
                class="player__queue-playing"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <rect x="2" y="6" width="2.5" height="8" rx="1" />
                <rect x="6.75" y="2" width="2.5" height="12" rx="1" />
                <rect x="11.5" y="8" width="2.5" height="6" rx="1" />
              </svg>
            </button>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, toRef, watch } from 'vue'
  import { UiButton, UiIconButton } from './ui'
  import { useAudioPlayer } from '../composables/useAudioPlayer'
  import { useToast } from '../composables/useToast'
  import { useTranslation } from '../composables/useTranslation'

  /**
   * Player-Leiste am unteren Rand: Titel, Transport, Suchleiste, Lautstärke und
   * Warteschlange. Logik und Zustand liegen in useAudioPlayer; die Leiste ist
   * nur sichtbar, solange Dateien vorhanden sind.
   */
  const props = withDefaults(
    defineProps<{
      files: File[]
      /** In der Dateiliste markierter Titel; der Play-Button startet ihn. */
      selectedIndex?: number
    }>(),
    { selectedIndex: -1 },
  )

  // Hält die Markierung in der Dateiliste synchron zum laufenden Titel.
  const emit = defineEmits<{
    'update:selectedIndex': [index: number]
  }>()

  const { t } = useTranslation()
  const toast = useToast()
  const filesRef = toRef(props, 'files')
  const progressBarRef = ref<HTMLElement | null>(null)
  const showQueue = ref(false)

  const {
    isPlaying,
    currentTrackIndex,
    currentTrack,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    playlist,
    play,
    cue,
    pause,
    stop,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    cycleRepeatMode,
    formatTime,
  } = useAudioPlayer(filesRef)

  const repeatTitle = computed(() => {
    if (repeatMode.value === 'all') return t.value('player_repeat_all')
    if (repeatMode.value === 'one') return t.value('player_repeat_one')
    return t.value('player_repeat_off')
  })

  // Merkt sich, ob seit dem letzten Start ein anderer Titel in der Liste markiert
  // wurde: Dann startet Play diesen Titel, sonst setzt er den aktuellen fort.
  const selectionChanged = ref(false)
  watch(
    () => props.selectedIndex,
    (index) => {
      if (index < 0 || index >= playlist.value.length) return
      selectionChanged.value = true
      // Markierten Titel sofort anzeigen (laden ohne abzuspielen), aber eine
      // laufende Wiedergabe nie unterbrechen.
      if (!isPlaying.value && index !== currentTrackIndex.value) cue(index)
    },
  )

  const handlePlay = () => {
    if (isPlaying.value) {
      pause()
      return
    }

    const selected = props.selectedIndex
    const hasSelection = selected >= 0 && selected < playlist.value.length

    if (selectionChanged.value && hasSelection && selected !== currentTrackIndex.value) {
      play(selected)
    } else if (currentTrackIndex.value >= 0) {
      play()
    } else {
      play(hasSelection ? selected : 0)
    }

    selectionChanged.value = false
  }

  // "Läuft jetzt"-Toast nur, wenn ein Titel tatsächlich startet oder wechselt.
  const lastAnnounced = ref(-1)
  const announceNowPlaying = () => {
    const index = currentTrackIndex.value
    const track = playlist.value[index]
    if (index >= 0 && track && index !== lastAnnounced.value) {
      toast.info(`♪ ${track.title}`)
      lastAnnounced.value = index
    }
  }
  watch(isPlaying, (playing) => {
    if (playing) announceNowPlaying()
  })
  watch(currentTrackIndex, (index) => {
    if (isPlaying.value) announceNowPlaying()
    if (index >= 0) emit('update:selectedIndex', index)
  })

  // Aus der Dateiliste: laufenden Titel nicht neu starten, andere sofort abspielen.
  const playTrack = (index: number) => {
    if (index < 0 || index >= playlist.value.length) return
    if (index === currentTrackIndex.value) {
      if (!isPlaying.value) play()
    } else {
      play(index)
    }
  }

  defineExpose({ playTrack, currentTrackIndex, isPlaying })

  watch(
    () => props.files.length,
    (length) => {
      if (length === 0) showQueue.value = false
    },
  )

  const toggleQueue = () => {
    showQueue.value = !showQueue.value
  }

  const progressPercent = computed(() =>
    duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0,
  )

  // --- Suchleiste: Pointer (Maus, Touch) und Tastatur ------------------------------

  const SEEK_STEP_SECONDS = 5
  let seeking = false

  const seekFromPointer = (event: PointerEvent) => {
    const bar = progressBarRef.value
    if (!bar || duration.value <= 0) return
    const rect = bar.getBoundingClientRect()
    if (rect.width <= 0) return
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
    seek(ratio * duration.value)
  }

  const onSeekPointerDown = (event: PointerEvent) => {
    if (duration.value <= 0) return
    seeking = true
    const bar = event.currentTarget
    if (bar instanceof HTMLElement && typeof bar.setPointerCapture === 'function') {
      bar.setPointerCapture(event.pointerId)
    }
    seekFromPointer(event)
    event.preventDefault()
  }

  const onSeekPointerMove = (event: PointerEvent) => {
    if (seeking) seekFromPointer(event)
  }

  const onSeekPointerUp = () => {
    seeking = false
  }

  const onSeekKeydown = (event: KeyboardEvent) => {
    if (duration.value <= 0) return
    const targets: Record<string, number> = {
      ArrowRight: currentTime.value + SEEK_STEP_SECONDS,
      ArrowUp: currentTime.value + SEEK_STEP_SECONDS,
      ArrowLeft: currentTime.value - SEEK_STEP_SECONDS,
      ArrowDown: currentTime.value - SEEK_STEP_SECONDS,
      Home: 0,
      End: duration.value,
    }
    const target = targets[event.key]
    if (target === undefined) return
    event.preventDefault()
    seek(Math.max(0, Math.min(duration.value, target)))
  }

  const onVolumeChange = (event: Event) => {
    setVolume(parseFloat((event.target as HTMLInputElement).value))
  }
</script>

<style scoped>
  .player {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: var(--ds-z-player);
    background: var(--ds-surface-1);
    border-top: var(--ds-border-width) solid var(--ds-border);
    color: var(--ds-text);
  }

  .player__inner {
    display: flex;
    align-items: center;
    gap: var(--ds-space-4);
    max-width: var(--ds-container);
    min-height: var(--ds-player-height);
    margin: 0 auto;
    padding: var(--ds-space-2) var(--ds-gutter);
    box-sizing: border-box;
  }

  .player__track {
    display: flex;
    align-items: center;
    gap: var(--ds-space-2);
    flex: 1 1 180px;
    min-width: 0;
  }

  .player__art {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--ds-control-md);
    height: var(--ds-control-md);
    border-radius: var(--ds-radius-md);
    background: var(--ds-surface-2);
    color: var(--ds-accent);
    flex-shrink: 0;
  }

  .player__art svg {
    width: var(--ds-icon-sm);
    height: var(--ds-icon-sm);
  }

  .player__meta {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .player__title {
    font-size: var(--ds-text-md);
    font-weight: var(--ds-weight-medium);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .player__title--empty {
    color: var(--ds-text-3);
    font-weight: var(--ds-weight-regular);
  }

  .player__time {
    font-size: var(--ds-text-xs);
    color: var(--ds-text-3);
    font-variant-numeric: tabular-nums;
  }

  .player__controls {
    display: flex;
    align-items: center;
    gap: var(--ds-space-1);
    flex: 0 0 auto;
  }

  .player__repeat {
    position: relative;
  }

  .player__repeat-badge {
    position: absolute;
    right: 4px;
    bottom: 3px;
    font-size: 9px;
    font-weight: var(--ds-weight-bold);
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  .player__seek {
    display: flex;
    align-items: center;
    flex: 2 1 160px;
    min-width: 0;
    height: var(--ds-control-sm);
    border-radius: var(--ds-radius-sm);
    cursor: pointer;
    touch-action: none;
  }

  .player__seek:focus-visible {
    outline: none;
    box-shadow: var(--ds-focus-ring);
  }

  .player__seek-track {
    display: block;
    width: 100%;
    height: 4px;
    border-radius: var(--ds-radius-full);
    background: var(--ds-surface-3);
    overflow: hidden;
  }

  .player__seek-fill {
    display: block;
    height: 100%;
    background: var(--ds-accent);
    transition: width 0.1s linear;
  }

  .player__right {
    display: flex;
    align-items: center;
    gap: var(--ds-space-2);
    flex: 0 0 auto;
  }

  .player__volume {
    display: flex;
    align-items: center;
    gap: var(--ds-space-1);
  }

  .player__volume-slider {
    width: 80px;
    height: 4px;
    accent-color: var(--ds-accent);
    cursor: pointer;
  }

  .player__volume-slider:focus-visible {
    outline: none;
    box-shadow: var(--ds-focus-ring);
    border-radius: var(--ds-radius-full);
  }

  .player__sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
  }

  .player__queue-toggle {
    font-variant-numeric: tabular-nums;
  }

  .player__queue-toggle--active {
    border-color: var(--ds-accent);
    color: var(--ds-accent);
  }

  .player__queue {
    position: absolute;
    bottom: 100%;
    right: max(var(--ds-gutter), calc((100% - var(--ds-container)) / 2 + var(--ds-gutter)));
    width: min(380px, calc(100vw - 2 * var(--ds-gutter)));
    max-height: 50vh;
    margin-bottom: var(--ds-space-2);
    display: flex;
    flex-direction: column;
    background: var(--ds-surface-1);
    border: var(--ds-border-width) solid var(--ds-border);
    border-radius: var(--ds-radius-lg);
    box-shadow: var(--ds-shadow-overlay);
    overflow: hidden;
  }

  .player__queue-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ds-space-2);
    padding: var(--ds-space-2) var(--ds-space-2) var(--ds-space-2) var(--ds-space-4);
    border-bottom: var(--ds-border-width) solid var(--ds-border);
  }

  .player__queue-title {
    font-size: var(--ds-text-sm);
    font-weight: var(--ds-weight-semibold);
  }

  .player__queue-list {
    list-style: none;
    margin: 0;
    padding: var(--ds-space-1) 0;
    overflow-y: auto;
    scrollbar-width: thin;
  }

  .player__queue-item {
    display: grid;
    grid-template-columns: 24px minmax(0, 1fr) auto;
    gap: var(--ds-space-2);
    align-items: center;
    width: 100%;
    height: var(--ds-control-md);
    padding: 0 var(--ds-space-4);
    border: none;
    background: transparent;
    color: var(--ds-text);
    font: inherit;
    font-size: var(--ds-text-sm);
    text-align: left;
    cursor: pointer;
    transition: background-color var(--ds-duration) var(--ds-ease);
  }

  .player__queue-item:hover {
    background: var(--ds-surface-3);
  }

  .player__queue-item:focus-visible {
    outline: none;
    box-shadow: inset var(--ds-focus-ring);
  }

  .player__queue-item--active {
    background: var(--ds-accent-soft);
    color: var(--ds-accent);
    font-weight: var(--ds-weight-medium);
  }

  .player__queue-index {
    color: var(--ds-text-3);
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .player__queue-item--active .player__queue-index {
    color: var(--ds-accent);
  }

  .player__queue-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .player__queue-playing {
    width: 14px;
    height: 14px;
    fill: var(--ds-accent);
  }

  .player-queue-enter-active,
  .player-queue-leave-active {
    transition:
      opacity var(--ds-duration) var(--ds-ease),
      transform var(--ds-duration) var(--ds-ease);
  }

  .player-queue-enter-from,
  .player-queue-leave-to {
    opacity: 0;
    transform: translateY(8px);
  }

  @media (max-width: 768px) {
    .player__volume {
      display: none;
    }
  }

  @media (max-width: 480px) {
    .player__inner {
      gap: var(--ds-space-2);
      flex-wrap: wrap;
    }

    .player__stop {
      display: none;
    }

    .player__seek {
      order: 10;
      flex-basis: 100%;
      height: 20px;
    }
  }
</style>
