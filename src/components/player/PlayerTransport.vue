<template>
  <div class="player__controls">
    <UiIconButton :label="t('player_previous')" @click="emit('previous')">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <polygon points="19 20 9 12 19 4 19 20" />
        <rect x="4" y="4" width="2" height="16" rx="1" />
      </svg>
    </UiIconButton>
    <UiIconButton class="player__stop" :label="t('player_stop')" @click="emit('stop')">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <rect x="6" y="6" width="12" height="12" rx="1" />
      </svg>
    </UiIconButton>
    <UiIconButton
      variant="primary"
      round
      :label="isPlaying ? t('player_pause') : t('player_play')"
      @click="emit('toggle-play')"
    >
      <svg v-if="isPlaying" viewBox="0 0 24 24" fill="currentColor">
        <rect x="6" y="4" width="4" height="16" rx="1" />
        <rect x="14" y="4" width="4" height="16" rx="1" />
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="currentColor">
        <polygon points="7 3 20 12 7 21 7 3" />
      </svg>
    </UiIconButton>
    <UiIconButton :label="t('player_next')" @click="emit('next')">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <polygon points="5 4 15 12 5 20 5 4" />
        <rect x="18" y="4" width="2" height="16" rx="1" />
      </svg>
    </UiIconButton>
    <UiIconButton
      class="player__repeat"
      :label="repeatTitle"
      :pressed="repeatMode !== 'off'"
      @click="emit('cycle-repeat')"
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
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { UiIconButton } from '../ui'
  import type { RepeatMode } from '../../composables/useAudioPlayer'
  import { useTranslation } from '../../composables/useTranslation'

  /** Transport: Zurück, Stopp, Play/Pause, Weiter und Wiederholen. */
  const props = defineProps<{
    isPlaying: boolean
    repeatMode: RepeatMode
  }>()

  const emit = defineEmits<{
    previous: []
    stop: []
    'toggle-play': []
    next: []
    'cycle-repeat': []
  }>()

  const { t } = useTranslation()

  const repeatTitle = computed(() => {
    switch (props.repeatMode) {
      case 'all':
        return t.value('player_repeat_all')
      case 'one':
        return t.value('player_repeat_one')
      case 'off':
        return t.value('player_repeat_off')
      default: {
        const unknown: never = props.repeatMode
        return unknown
      }
    }
  })
</script>

<style scoped>
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

  @media (max-width: 480px) {
    .player__stop {
      display: none;
    }
  }
</style>
