<template>
  <div class="undo-redo" role="group" :aria-label="t('undo_redo_group')">
    <UiButton
      variant="ghost"
      size="sm"
      :disabled="!canUndo"
      :title="undoTitle"
      :aria-label="undoTitle"
      data-action="undo"
      @click="performUndo"
    >
      <template #icon>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="3 7 3 13 9 13" />
          <path d="M21 17a9 9 0 0 0-15-6.7L3 13" />
        </svg>
      </template>
      <span class="undo-redo__label">{{ t('undo_btn') }}</span>
    </UiButton>
    <UiButton
      variant="ghost"
      size="sm"
      :disabled="!canRedo"
      :title="redoTitle"
      :aria-label="redoTitle"
      data-action="redo"
      @click="performRedo"
    >
      <template #icon>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="21 7 21 13 15 13" />
          <path d="M3 17a9 9 0 0 1 15-6.7L21 13" />
        </svg>
      </template>
      <span class="undo-redo__label">{{ t('redo_btn') }}</span>
    </UiButton>
  </div>
</template>

<script setup lang="ts">
  import { UiButton } from './ui'
  import { useTranslation } from '../composables/useTranslation'
  import { useUndoRedo } from '../composables/useUndoRedo'

  /** Rückgängig / Wiederholen als Buttongruppe; Logik und Toasts liegen in useUndoRedo. */
  const { t } = useTranslation()
  const { canUndo, canRedo, undoTitle, redoTitle, performUndo, performRedo } = useUndoRedo()
</script>

<style scoped>
  .undo-redo {
    display: inline-flex;
    gap: var(--ds-space-1);
    flex-shrink: 0;
  }

  @media (max-width: 480px) {
    .undo-redo__label {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
    }
  }
</style>
