<template>
  <div class="player-bar" v-if="files.length > 0" role="region" :aria-label="t('player_title')">
    <!-- Full-width seek strip along the top edge of the bar -->
    <div
      class="pb-progress"
      @mousedown="onProgressMouseDown"
      ref="progressBarRef"
      role="slider"
      :aria-valuemin="0"
      :aria-valuemax="Math.round(duration)"
      :aria-valuenow="Math.round(currentTime)"
      :aria-label="t('player_title')"
    >
      <div class="pb-progress-fill" :style="{ width: progressPercent + '%' }"></div>
    </div>

    <div class="pb-inner">
      <!-- Left: current track + time -->
      <div class="pb-track">
        <span class="pb-track-title" v-if="currentTrack" :title="currentTrack.title">
          {{ currentTrack.title }}
        </span>
        <span class="pb-track-title pb-track-empty" v-else>{{ t('player_no_track') }}</span>
        <span class="pb-time">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
      </div>

      <!-- Center: transport controls -->
      <div class="pb-controls">
        <button class="pb-btn pb-btn-sm" @click="previous" :title="t('player_previous')">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <polygon points="19,20 9,12 19,4" fill="currentColor" />
            <line x1="5" y1="4" x2="5" y2="20" stroke="currentColor" stroke-width="2" />
          </svg>
        </button>

        <button class="pb-btn pb-btn-sm" @click="stop" :title="t('player_stop')">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <rect x="6" y="6" width="12" height="12" rx="1" fill="currentColor" />
          </svg>
        </button>

        <button
          class="pb-btn pb-btn-play"
          @click="handlePlay"
          :title="isPlaying ? t('player_pause') : t('player_play')"
        >
          <svg v-if="!isPlaying" viewBox="0 0 24 24" width="22" height="22">
            <polygon points="6,3 20,12 6,21" fill="currentColor" />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="22" height="22">
            <rect x="5" y="4" width="5" height="16" rx="1" fill="currentColor" />
            <rect x="14" y="4" width="5" height="16" rx="1" fill="currentColor" />
          </svg>
        </button>

        <button class="pb-btn pb-btn-sm" @click="next" :title="t('player_next')">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <polygon points="5,4 15,12 5,20" fill="currentColor" />
            <line x1="19" y1="4" x2="19" y2="20" stroke="currentColor" stroke-width="2" />
          </svg>
        </button>
      </div>

      <!-- Right: volume + queue toggle -->
      <div class="pb-right">
        <div class="pb-volume">
          <button
            class="pb-btn pb-btn-sm"
            @click="toggleMute"
            :title="isMuted ? t('player_unmute') : t('player_mute')"
          >
            <svg v-if="isMuted || volume === 0" viewBox="0 0 24 24" width="16" height="16">
              <polygon
                points="11,5 6,9 2,9 2,15 6,15 11,19"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linejoin="round"
              />
              <line
                x1="23"
                y1="9"
                x2="17"
                y2="15"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
              <line
                x1="17"
                y1="9"
                x2="23"
                y2="15"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            <svg v-else-if="volume < 0.5" viewBox="0 0 24 24" width="16" height="16">
              <polygon
                points="11,5 6,9 2,9 2,15 6,15 11,19"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linejoin="round"
              />
              <path
                d="M15.54 8.46a5 5 0 0 1 0 7.07"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            <svg v-else viewBox="0 0 24 24" width="16" height="16">
              <polygon
                points="11,5 6,9 2,9 2,15 6,15 11,19"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linejoin="round"
              />
              <path
                d="M15.54 8.46a5 5 0 0 1 0 7.07"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
              <path
                d="M19.07 4.93a10 10 0 0 1 0 14.14"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
          <input
            type="range"
            class="pb-volume-slider"
            min="0"
            max="1"
            step="0.01"
            :value="volume"
            @input="onVolumeChange"
            :title="t('player_mute')"
          />
        </div>

        <button
          class="pb-btn pb-btn-sm pb-queue-toggle"
          :class="{ active: showQueue }"
          @click="toggleQueue"
          :title="t('player_queue')"
          :aria-expanded="showQueue"
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <circle cx="3.5" cy="6" r="1.2" fill="currentColor" stroke="none" />
            <circle cx="3.5" cy="12" r="1.2" fill="currentColor" stroke="none" />
            <circle cx="3.5" cy="18" r="1.2" fill="currentColor" stroke="none" />
          </svg>
          <span class="pb-queue-count">{{ playlist.length }}</span>
        </button>
      </div>
    </div>

    <!-- Expandable queue / tracklist above the bar -->
    <Transition name="pb-queue-fade">
      <div class="pb-queue" v-if="showQueue">
        <div class="pb-queue-header">
          <span class="pb-queue-title">{{ t('player_queue') }}</span>
          <button
            class="pb-btn pb-btn-sm"
            @click="showQueue = false"
            :title="t('shortcuts_close_btn')"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            >
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </svg>
          </button>
        </div>
        <div class="pb-queue-list">
          <div
            v-for="(track, idx) in playlist"
            :key="track.name + idx"
            class="pb-queue-item"
            :class="{
              'pb-queue-active': idx === currentTrackIndex,
              'pb-queue-playing': idx === currentTrackIndex && isPlaying,
            }"
            @click="play(idx)"
            :title="track.title"
          >
            <span class="pb-queue-index">{{ idx + 1 }}</span>
            <span class="pb-queue-name">{{ track.title }}</span>
            <span class="pb-queue-playing-icon" v-if="idx === currentTrackIndex && isPlaying">
              <svg viewBox="0 0 12 12" width="12" height="12">
                <rect x="1" y="4" width="2" height="8" fill="currentColor">
                  <animate
                    attributeName="height"
                    values="8;4;8"
                    dur="0.8s"
                    repeatCount="indefinite"
                  />
                  <animate attributeName="y" values="4;6;4" dur="0.8s" repeatCount="indefinite" />
                </rect>
                <rect x="5" y="2" width="2" height="10" fill="currentColor">
                  <animate
                    attributeName="height"
                    values="10;5;10"
                    dur="0.6s"
                    repeatCount="indefinite"
                  />
                  <animate attributeName="y" values="2;5;2" dur="0.6s" repeatCount="indefinite" />
                </rect>
                <rect x="9" y="5" width="2" height="7" fill="currentColor">
                  <animate
                    attributeName="height"
                    values="7;3;7"
                    dur="0.7s"
                    repeatCount="indefinite"
                  />
                  <animate attributeName="y" values="5;7;5" dur="0.7s" repeatCount="indefinite" />
                </rect>
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, toRef, watch } from 'vue'
  import { useAudioPlayer } from '../composables/useAudioPlayer'
  import { useTranslation } from '../composables/useTranslation'
  import { useToast } from '../composables/useToast'

  const props = defineProps({
    files: {
      type: Array,
      required: true,
    },
    // Index of the track currently selected in the interactive track list.
    // The play button starts this track when pressed.
    selectedIndex: {
      type: Number,
      default: -1,
    },
  })

  const { t } = useTranslation()
  const toast = useToast()
  const filesRef = toRef(props, 'files')
  const progressBarRef = ref(null)
  const showQueue = ref(false)

  const {
    isPlaying,
    currentTrackIndex,
    currentTrack,
    currentTime,
    duration,
    volume,
    isMuted,
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
    formatTime,
  } = useAudioPlayer(filesRef)

  // Track whether the user actively picked a different track in the
  // interactive list since the last time playback started. This lets the
  // play button start a freshly selected track, while still resuming the
  // current track after a pause (instead of jumping back to a stale
  // selection when playback has since advanced).
  const selectionChanged = ref(false)
  watch(
    () => props.selectedIndex,
    (idx) => {
      if (idx < 0 || idx >= playlist.value.length) return
      selectionChanged.value = true
      // Reflect the clicked track in the player right away by cueing it
      // (loads title + duration without playing). Skip while a track is
      // playing so an active selection for delete/reorder never interrupts
      // playback — the bar keeps showing the track that is actually playing.
      if (!isPlaying.value && idx !== currentTrackIndex.value) {
        cue(idx)
      }
    },
  )

  // Play button: honour the track selected in the interactive track list.
  // - playing                         → pause
  // - selection changed to another track → start that selected track
  // - a track is loaded (paused/stopped) → resume/restart it
  // - nothing loaded yet              → start the selection, or the first track
  const handlePlay = () => {
    if (isPlaying.value) {
      pause()
      return
    }

    const sel = props.selectedIndex
    const hasSelection = typeof sel === 'number' && sel >= 0 && sel < playlist.value.length

    if (selectionChanged.value && hasSelection && sel !== currentTrackIndex.value) {
      play(sel)
    } else if (currentTrackIndex.value >= 0) {
      play()
    } else {
      play(hasSelection ? sel : 0)
    }

    selectionChanged.value = false
  }

  // "Now playing" toast — only when a track actually starts playing or the
  // playing track advances, never for a pure cue (selection without playback).
  const lastAnnounced = ref(-1)
  const announceNowPlaying = () => {
    const idx = currentTrackIndex.value
    if (idx >= 0 && playlist.value[idx] && idx !== lastAnnounced.value) {
      toast.info(`♪ ${playlist.value[idx].title}`)
      lastAnnounced.value = idx
    }
  }
  // Playback starts (play from stopped/paused resolves)
  watch(isPlaying, (playing) => {
    if (playing) announceNowPlaying()
  })
  // Track changes while already playing (auto-advance, next/previous)
  watch(currentTrackIndex, () => {
    if (isPlaying.value) announceNowPlaying()
  })

  // Close the queue automatically once every track is gone
  watch(
    () => props.files.length,
    (len) => {
      if (len === 0) showQueue.value = false
    },
  )

  const toggleQueue = () => {
    showQueue.value = !showQueue.value
  }

  const progressPercent = computed(() => {
    if (!duration.value || duration.value === 0) return 0
    return (currentTime.value / duration.value) * 100
  })

  const onProgressMouseDown = (e) => {
    if (!progressBarRef.value || !duration.value) return
    const rect = progressBarRef.value.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    seek(percent * duration.value)

    const onMouseMove = (moveEvent) => {
      const p = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width))
      seek(p * duration.value)
    }

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  const onVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value))
  }
</script>

<style scoped>
  /* ===== Persistent sticky player bar (bottom of viewport) ===== */
  .player-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 900;
    background: linear-gradient(135deg, rgba(12, 12, 16, 0.96), rgba(22, 22, 28, 0.96));
    backdrop-filter: blur(20px);
    border-top: 1px solid var(--border-color);
    box-shadow: 0 -6px 24px rgba(0, 0, 0, 0.35);
  }

  .light-theme .player-bar {
    background: linear-gradient(135deg, rgba(245, 245, 245, 0.96), rgba(232, 232, 232, 0.96));
    box-shadow: 0 -6px 24px rgba(0, 0, 0, 0.12);
  }

  /* Seek strip along the top edge */
  .pb-progress {
    position: relative;
    height: 6px;
    background: var(--input-bg);
    cursor: pointer;
    overflow: hidden;
  }

  .pb-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent-color), var(--accent-secondary));
    transition: width 0.1s linear;
  }

  .pb-inner {
    display: flex;
    align-items: center;
    gap: 18px;
    max-width: 1200px;
    margin: 0 auto;
    padding: 10px 20px;
  }

  /* Left: track info */
  .pb-track {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
    flex: 1 1 0;
  }

  .pb-track-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .pb-track-empty {
    color: var(--muted-color);
    font-style: italic;
    font-weight: 500;
  }

  .pb-time {
    font-size: 0.72rem;
    color: var(--muted-color);
    font-variant-numeric: tabular-nums;
    margin-top: 2px;
  }

  /* Center: transport */
  .pb-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    flex: 0 0 auto;
  }

  /* Right: volume + queue */
  .pb-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    flex: 1 1 0;
    min-width: 0;
  }

  .pb-volume {
    display: flex;
    align-items: center;
    gap: 8px;
    max-width: 160px;
  }

  .pb-volume-slider {
    width: 90px;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    background: var(--input-bg);
    border: 1px solid var(--border-color);
    border-radius: 2px;
    outline: none;
    cursor: pointer;
  }

  .pb-volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--accent-color);
    cursor: pointer;
    border: 2px solid var(--accent-text-color);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  }

  .pb-volume-slider::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--accent-color);
    cursor: pointer;
    border: 2px solid var(--accent-text-color);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  }

  /* Buttons (shared) */
  .pb-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--btn-color);
    border: 1px solid var(--border-color);
    color: var(--text-color);
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0;
    flex-shrink: 0;
  }

  .pb-btn:hover {
    border-color: var(--accent-color);
    color: var(--accent-color);
    background: rgba(201, 152, 77, 0.1);
  }

  .light-theme .pb-btn:hover {
    background: rgba(1, 79, 153, 0.1);
  }

  .pb-btn-sm {
    width: 34px;
    height: 34px;
    border-radius: 8px;
  }

  .pb-btn-play {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--accent-color), var(--accent-secondary));
    color: var(--accent-text-color);
    border: none;
  }

  .pb-btn-play:hover {
    transform: scale(1.08);
    box-shadow: 0 4px 15px var(--shadow-color);
    color: var(--accent-text-color);
    background: linear-gradient(135deg, var(--accent-color), var(--accent-secondary));
  }

  /* Queue toggle */
  .pb-queue-toggle {
    position: relative;
    width: auto;
    padding: 0 10px;
    gap: 6px;
  }

  .pb-queue-toggle.active {
    border-color: var(--accent-color);
    color: var(--accent-color);
  }

  .pb-queue-count {
    font-size: 0.72rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  /* Queue popover */
  .pb-queue {
    position: absolute;
    bottom: 100%;
    right: max(20px, calc((100% - 1200px) / 2 + 20px));
    width: min(380px, calc(100vw - 40px));
    max-height: 50vh;
    margin-bottom: 8px;
    display: flex;
    flex-direction: column;
    background: var(--card-bg, var(--input-bg));
    border: 1px solid var(--border-color);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
  }

  .light-theme .pb-queue {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.18);
  }

  .pb-queue-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-bottom: 1px solid var(--border-color);
    background: rgba(0, 0, 0, 0.15);
  }

  .light-theme .pb-queue-header {
    background: rgba(0, 0, 0, 0.04);
  }

  .pb-queue-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--accent-color);
  }

  .pb-queue-list {
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--border-color) transparent;
  }

  .pb-queue-list::-webkit-scrollbar {
    width: 6px;
  }

  .pb-queue-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .pb-queue-list::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;
  }

  .pb-queue-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 14px;
    cursor: pointer;
    transition: all 0.15s ease;
    border-bottom: 1px solid rgba(42, 74, 106, 0.3);
    font-size: 0.82rem;
  }

  .pb-queue-item:last-child {
    border-bottom: none;
  }

  .pb-queue-item:hover {
    background: rgba(201, 152, 77, 0.08);
  }

  .light-theme .pb-queue-item:hover {
    background: rgba(1, 79, 153, 0.08);
  }

  .pb-queue-active {
    background: rgba(201, 152, 77, 0.15);
    border-left: 3px solid var(--accent-color);
    padding-left: 11px;
  }

  .light-theme .pb-queue-active {
    background: rgba(1, 79, 153, 0.12);
  }

  .pb-queue-index {
    color: var(--muted-color);
    min-width: 20px;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .pb-queue-active .pb-queue-index {
    color: var(--accent-color);
    font-weight: 600;
  }

  .pb-queue-name {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--text-color);
  }

  .pb-queue-active .pb-queue-name {
    color: var(--accent-color);
    font-weight: 500;
  }

  .pb-queue-playing-icon {
    color: var(--accent-color);
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  /* Queue open/close transition */
  .pb-queue-fade-enter-active,
  .pb-queue-fade-leave-active {
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }
  .pb-queue-fade-enter-from,
  .pb-queue-fade-leave-to {
    opacity: 0;
    transform: translateY(8px);
  }

  /* ===== Responsive ===== */
  @media (max-width: 768px) {
    .pb-inner {
      gap: 10px;
      padding: 8px 12px;
    }

    .pb-volume {
      display: none;
    }

    .pb-right {
      flex: 0 0 auto;
    }
  }

  @media (max-width: 480px) {
    .pb-inner {
      gap: 8px;
    }

    .pb-track-title {
      font-size: 0.82rem;
    }

    .pb-controls {
      gap: 6px;
    }

    .pb-btn-sm {
      width: 36px;
      height: 36px;
    }

    .pb-btn-play {
      width: 42px;
      height: 42px;
    }

    /* Stop button is the least essential on very small screens */
    .pb-controls .pb-btn-sm:nth-child(2) {
      display: none;
    }
  }
</style>
