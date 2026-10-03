<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <UiToast
          v-for="toast in toasts"
          :key="toast.id"
          :type="toast.type"
          :message="toast.message"
          :action-label="toast.action?.label"
          :dismiss-label="t('toast_close')"
          dismiss-on-click
          @action="runAction(toast)"
          @dismiss="removeToast(toast.id)"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
  import { UiToast } from './ui'
  import { useToast, type Toast } from '../composables/useToast'
  import { useTranslation } from '../composables/useTranslation'

  /** Stapelt die Toasts aus useToast unten rechts; jeder Toast ist ein UiToast. */
  const { toasts, removeToast } = useToast()
  const { t } = useTranslation()

  function runAction(toast: Toast) {
    toast.action?.callback()
    removeToast(toast.id)
  }
</script>

<style scoped>
  .toast-container {
    position: fixed;
    right: var(--ds-space-5);
    bottom: var(--ds-space-5);
    z-index: var(--ds-z-toast);
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--ds-space-2);
    max-width: min(400px, calc(100vw - 2 * var(--ds-space-5)));
    pointer-events: none;
  }

  .toast-container > * {
    pointer-events: auto;
  }

  .toast-enter-active,
  .toast-leave-active {
    transition:
      opacity var(--ds-duration-slow) var(--ds-ease),
      transform var(--ds-duration-slow) var(--ds-ease);
  }

  .toast-move {
    transition: transform var(--ds-duration-slow) var(--ds-ease);
  }

  .toast-enter-from,
  .toast-leave-to {
    opacity: 0;
    transform: translateY(8px);
  }

  @media (max-width: 480px) {
    .toast-container {
      left: var(--ds-space-3);
      right: var(--ds-space-3);
      bottom: var(--ds-space-3);
      max-width: none;
      align-items: stretch;
    }
  }
</style>
