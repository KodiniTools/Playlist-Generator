<template>
  <div class="audio-player" v-if="files.length > 0">
    <h3 class="player-title">{{ t('player_title') }}</h3>

    <!-- Current Track Display -->
    <div class="player-track-display">
      <span class="track-label" v-if="currentTrack">
        {{ currentTrack.title }}
      </span>
      <span class="track-label track-label-empty" v-else>
        {{ t('player_no_track') }}
      </span>
    </div>

    <!-- Progress Bar -->
    <div class="player-progress-wrapper">
      <span class="player-time">{{ formatTime(currentTime) }}</span>
      <div
        class="player-progress-bar"
        @mousedown="onProgressMouseDown"
        ref="progressBarRef"
      >
        <div
          class="player-progress-fill"
          :style="{ width: progressPercent + '%' }"
        ></div>
      </div>
      <span class="player-time">{{ formatTime(duration) }}</span>
    </div>

    <!-- Controls -->
    <div class="player-controls">
      <button
        class="player-btn player-btn-sm"
        @click="previous"
        :title="t('player_previous')"
      >
        <svg viewBox="0 0 24 24" width="18" height="18">
          <polygon points="19,20 9,12 19,4" fill="currentColor"/>
          <line x1="5" y1="4" x2="5" y2="20" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>

      <button
        class="player-btn player-btn-sm"
        @click="stop"
        :title="t('player_stop')"
      >
        <svg viewBox="0 0 24 24" width="18" height="18">
          <rect x="6" y="6" width="12" height="12" rx="1" fill="currentColor"/>
        </svg>
      </button>

      <button
        class="player-btn player-btn-play"
        @click="togglePlay"
        :title="isPlaying ? t('player_pause') : t('player_play')"
      >
        <svg v-if="!isPlaying" viewBox="0 0 24 24" width="22" height="22">
          <polygon points="6,3 20,12 6,21" fill="currentColor"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" width="22" height="22">
          <rect x="5" y="4" width="5" height="16" rx="1" fill="currentColor"/>
          <rect x="14" y="4" width="5" height="16" rx="1" fill="currentColor"/>
        </svg>
      </button>

      <button
        class="player-btn player-btn-sm"
        @click="next"
        :title="t('player_next')"
      >
        <svg viewBox="0 0 24 24" width="18" height="18">
          <polygon points="5,4 15,12 5,20" fill="currentColor"/>
          <line x1="19" y1="4" x2="19" y2="20" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
    </div>

    <!-- Volume Control -->
    <div class="player-volume">
      <button
        class="player-btn player-btn-sm"
        @click="toggleMute"
        :title="isMuted ? t('player_unmute') : t('player_mute')"
      >
        <svg v-if="isMuted || volume === 0" viewBox="0 0 24 24" width="16" height="16">
          <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <svg v-else-if="volume < 0.5" viewBox="0 0 24 24" width="16" height="16">
          <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" width="16" height="16">
          <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
      <input
        type="range"
        class="volume-slider"
        min="0"
        max="1"
        step="0.01"
        :value="volume"
        @input="onVolumeChange"
      >
    </div>

    <!-- Mini Track List -->
    <div class="player-tracklist">
      <div
        v-for="(track, idx) in playlist"
        :key="track.name + idx"
        class="player-tracklist-item"
        :class="{
          'player-tracklist-active': idx === currentTrackIndex,
          'player-tracklist-playing': idx === currentTrackIndex && isPlaying
        }"
        @click="play(idx)"
        :title="track.title"
      >
        <span class="tracklist-index">{{ idx + 1 }}</span>
        <span class="tracklist-name">{{ track.title }}</span>
        <span class="tracklist-playing-icon" v-if="idx === currentTrackIndex && isPlaying">
          <svg viewBox="0 0 12 12" width="12" height="12">
            <rect x="1" y="4" width="2" height="8" fill="currentColor">
              <animate attributeName="height" values="8;4;8" dur="0.8s" repeatCount="indefinite"/>
              <animate attributeName="y" values="4;6;4" dur="0.8s" repeatCount="indefinite"/>
            </rect>
            <rect x="5" y="2" width="2" height="10" fill="currentColor">
              <animate attributeName="height" values="10;5;10" dur="0.6s" repeatCount="indefinite"/>
              <animate attributeName="y" values="2;5;2" dur="0.6s" repeatCount="indefinite"/>
            </rect>
            <rect x="9" y="5" width="2" height="7" fill="currentColor">
              <animate attributeName="height" values="7;3;7" dur="0.7s" repeatCount="indefinite"/>
              <animate attributeName="y" values="5;7;5" dur="0.7s" repeatCount="indefinite"/>
            </rect>
          </svg>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, toRef } from 'vue'
import { useAudioPlayer } from '../composables/useAudioPlayer'
import { useTranslation } from '../composables/useTranslation'

const props = defineProps({
  files: {
    type: Array,
    required: true
  }
})

const { t } = useTranslation()
const filesRef = toRef(props, 'files')
const progressBarRef = ref(null)

const {
  isPlaying,
  isPaused,
  currentTrackIndex,
  currentTrack,
  currentTime,
  duration,
  volume,
  isMuted,
  playlist,
  play,
  pause,
  stop,
  togglePlay,
  next,
  previous,
  seek,
  setVolume,
  toggleMute,
  formatTime
} = useAudioPlayer(filesRef)

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
.audio-player {
  margin-top: 20px;
  padding: 20px;
  background: linear-gradient(135deg,
    rgba(14, 28, 50, 0.6),
    rgba(14, 28, 50, 0.4));
  border: 1px solid var(--border-color);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.light-theme .audio-player {
  background: linear-gradient(135deg,
    rgba(245, 244, 214, 0.6),
    rgba(248, 225, 169, 0.3));
}

.player-title {
  font-size: 1rem;
  color: var(--accent-color);
  margin: 0 0 15px 0;
  text-align: center;
  font-weight: 600;
}

/* Track Display */
.player-track-display {
  text-align: center;
  margin-bottom: 12px;
  min-height: 24px;
}

.track-label {
  font-size: 0.9rem;
  color: var(--text-color);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.track-label-empty {
  color: var(--muted-color);
  font-style: italic;
}

/* Progress Bar */
.player-progress-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
}

.player-time {
  font-size: 0.75rem;
  color: var(--muted-color);
  min-width: 36px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.player-progress-bar {
  flex: 1;
  height: 6px;
  background: var(--input-bg);
  border-radius: 3px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.player-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-color), var(--accent-secondary));
  border-radius: 3px;
  transition: width 0.1s linear;
}

/* Controls */
.player-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 12px;
}

.player-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--btn-color);
  border: 1px solid var(--border-color);
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
}

.player-btn:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
  background: rgba(201, 152, 77, 0.1);
}

.light-theme .player-btn:hover {
  background: rgba(1, 79, 153, 0.1);
}

.player-btn-sm {
  width: 34px;
  height: 34px;
  border-radius: 8px;
}

.player-btn-play {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-color), var(--accent-secondary));
  color: var(--accent-text-color);
  border: none;
}

.player-btn-play:hover {
  transform: scale(1.08);
  box-shadow: 0 4px 15px var(--shadow-color);
  color: var(--accent-text-color);
  background: linear-gradient(135deg, var(--accent-color), var(--accent-secondary));
}

/* Volume */
.player-volume {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
}

.volume-slider {
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--accent-color);
  cursor: pointer;
  border: 2px solid var(--accent-text-color);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.volume-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--accent-color);
  cursor: pointer;
  border: 2px solid var(--accent-text-color);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

/* Track List */
.player-tracklist {
  max-height: 180px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--input-bg);
}

.player-tracklist::-webkit-scrollbar {
  width: 6px;
}

.player-tracklist::-webkit-scrollbar-track {
  background: transparent;
}

.player-tracklist::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.player-tracklist-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  border-bottom: 1px solid rgba(42, 74, 106, 0.3);
  font-size: 0.82rem;
}

.player-tracklist-item:last-child {
  border-bottom: none;
}

.player-tracklist-item:hover {
  background: rgba(201, 152, 77, 0.08);
}

.light-theme .player-tracklist-item:hover {
  background: rgba(1, 79, 153, 0.08);
}

.player-tracklist-active {
  background: rgba(201, 152, 77, 0.15);
  border-left: 3px solid var(--accent-color);
  padding-left: 9px;
}

.light-theme .player-tracklist-active {
  background: rgba(1, 79, 153, 0.12);
}

.tracklist-index {
  color: var(--muted-color);
  min-width: 20px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.player-tracklist-active .tracklist-index {
  color: var(--accent-color);
  font-weight: 600;
}

.tracklist-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-color);
}

.player-tracklist-active .tracklist-name {
  color: var(--accent-color);
  font-weight: 500;
}

.tracklist-playing-icon {
  color: var(--accent-color);
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 480px) {
  .audio-player {
    padding: 14px;
    border-radius: 12px;
    margin-top: 15px;
  }

  .player-title {
    font-size: 0.9rem;
    margin: 0 0 10px 0;
  }

  .track-label {
    font-size: 0.82rem;
  }

  .player-progress-wrapper {
    gap: 6px;
    margin-bottom: 10px;
  }

  .player-time {
    font-size: 0.7rem;
    min-width: 30px;
  }

  .player-controls {
    gap: 8px;
    margin-bottom: 10px;
  }

  .player-btn-sm {
    width: 36px;
    height: 36px;
  }

  .player-btn-play {
    width: 42px;
    height: 42px;
  }

  .player-volume {
    margin-bottom: 10px;
  }

  .volume-slider::-webkit-slider-thumb {
    width: 18px;
    height: 18px;
  }

  .volume-slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
  }

  .player-tracklist {
    max-height: 130px;
    border-radius: 8px;
  }

  .player-tracklist-item {
    padding: 7px 10px;
    font-size: 0.78rem;
  }
}
</style>
