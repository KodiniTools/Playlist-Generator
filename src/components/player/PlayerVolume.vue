<template>
  <div class="player__volume">
    <UiIconButton
      :label="muted ? t('player_unmute') : t('player_mute')"
      @click="emit('toggle-mute')"
    >
      <svg
        v-if="muted || volume === 0"
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
      @input="onInput"
    />
  </div>
</template>

<script setup lang="ts">
  import { UiIconButton } from '../ui'
  import { useTranslation } from '../../composables/useTranslation'

  /** Stummschalten und Lautstärke (0–1); ab 768 px Breite ausgeblendet. */
  defineProps<{
    volume: number
    muted: boolean
  }>()

  const emit = defineEmits<{
    'toggle-mute': []
    'update:volume': [volume: number]
  }>()

  const { t } = useTranslation()

  const onInput = (event: Event) => {
    const value = parseFloat((event.target as HTMLInputElement).value)
    if (Number.isFinite(value)) emit('update:volume', value)
  }
</script>

<style scoped>
  .player__volume {
    display: flex;
    align-items: center;
    gap: var(--ds-space-1);
  }

  /* Spur und Daumen kommen aus ui/range.css (zweiter Style-Block unten). */
  .player__volume-slider {
    width: 80px;
  }

  .player__sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
  }

  @media (max-width: 768px) {
    .player__volume {
      display: none;
    }
  }
</style>

<style scoped src="../ui/range.css"></style>
