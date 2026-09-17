<template>
  <div class="undo-redo" role="group" :aria-label="t('undo_redo_group')">
    <button
      type="button"
      class="history-btn"
      :disabled="!canUndo"
      :title="undoTitle"
      :aria-label="undoTitle"
      data-action="undo"
      @click="performUndo"
    >
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <polyline points="3 7 3 13 9 13" />
        <path d="M21 17a9 9 0 0 0-15-6.7L3 13" />
      </svg>
      <span class="history-label">{{ t('undo_btn') }}</span>
    </button>
    <button
      type="button"
      class="history-btn"
      :disabled="!canRedo"
      :title="redoTitle"
      :aria-label="redoTitle"
      data-action="redo"
      @click="performRedo"
    >
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <polyline points="21 7 21 13 15 13" />
        <path d="M3 17a9 9 0 0 1 15-6.7L21 13" />
      </svg>
      <span class="history-label">{{ t('redo_btn') }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
  import { useTranslation } from '../composables/useTranslation'
  import { useUndoRedo } from '../composables/useUndoRedo'

  const { t } = useTranslation()
  const { canUndo, canRedo, undoTitle, redoTitle, performUndo, performRedo } = useUndoRedo()
</script>

<style scoped>
  .undo-redo {
    display: inline-flex;
    gap: 6px;
    flex-shrink: 0;
  }

  .history-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 8px;
    border: 1.5px solid var(--border-color);
    background: transparent;
    color: var(--muted-color);
    font-family: inherit;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition:
      border-color 0.2s ease,
      color 0.2s ease,
      background 0.2s ease;
  }

  .history-btn:hover:not(:disabled),
  .history-btn:focus-visible {
    border-color: var(--accent-color);
    color: var(--accent-color);
    background: rgba(242, 226, 142, 0.08);
    outline: none;
  }

  .light-theme .history-btn:hover:not(:disabled),
  .light-theme .history-btn:focus-visible {
    background: rgba(162, 134, 128, 0.08);
  }

  .history-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    .history-btn {
      padding: 6px 8px;
    }

    .history-label {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
    }
  }
</style>
