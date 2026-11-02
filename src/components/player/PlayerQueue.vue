<template>
  <div class="player__queue">
    <div class="player__queue-header">
      <span class="player__queue-title">{{ t('player_queue') }}</span>
      <UiIconButton size="sm" :label="t('shortcuts_close_btn')" @click="emit('close')">
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
      <li v-for="(track, idx) in tracks" :key="`${track.name}-${idx}`">
        <button
          type="button"
          :class="['player__queue-item', { 'player__queue-item--active': idx === currentIndex }]"
          :title="track.title"
          :aria-current="idx === currentIndex ? 'true' : undefined"
          @click="emit('play', idx)"
        >
          <span class="player__queue-index">{{ idx + 1 }}</span>
          <span class="player__queue-name">{{ track.title }}</span>
          <svg
            v-if="idx === currentIndex && isPlaying"
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
</template>

<script setup lang="ts">
  import { UiIconButton } from '../ui'
  import type { PlayerTrack } from '../../composables/useAudioPlayer'
  import { useTranslation } from '../../composables/useTranslation'

  /** Warteschlange über der Player-Leiste; Klick auf einen Eintrag spielt ihn ab. */
  defineProps<{
    tracks: readonly PlayerTrack[]
    currentIndex: number
    isPlaying: boolean
  }>()

  const emit = defineEmits<{
    play: [index: number]
    close: []
  }>()

  const { t } = useTranslation()
</script>

<style scoped>
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
</style>
