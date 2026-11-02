<template>
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
      <span v-if="title" class="player__title" :title="title">
        {{ title }}
      </span>
      <span v-else class="player__title player__title--empty">{{ t('player_no_track') }}</span>
      <span class="player__time">{{ timeText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useTranslation } from '../../composables/useTranslation'

  /** Titel des laufenden Tracks mit Zeitangabe „aktuell / gesamt“. */
  defineProps<{
    /** Titel des aktuellen Tracks; leer zeigt „Kein Titel“. */
    title?: string | null
    /** Fertig formatierte Zeit, z. B. „1:05 / 3:20“. */
    timeText: string
  }>()

  const { t } = useTranslation()
</script>

<style scoped>
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
</style>
