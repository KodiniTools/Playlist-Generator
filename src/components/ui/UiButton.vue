<template>
  <button
    :type="type"
    :class="[
      'ui-button',
      `ui-button--${variant}`,
      `ui-button--${size}`,
      { 'ui-button--block': block },
    ]"
    :disabled="disabled"
  >
    <span v-if="$slots.icon" class="ui-button__icon" aria-hidden="true">
      <slot name="icon" />
    </span>
    <slot />
  </button>
</template>

<script setup lang="ts">
  import type { ButtonSize, ButtonType, ButtonVariant } from './types'

  /**
   * Textbutton in vier Varianten. Primär ist die einzige Vollfläche in Gold,
   * alle anderen sind flach. Click-Listener fallen auf das native <button> durch.
   */
  withDefaults(
    defineProps<{
      variant?: ButtonVariant
      size?: ButtonSize
      type?: ButtonType
      disabled?: boolean
      block?: boolean
    }>(),
    { variant: 'secondary', size: 'md', type: 'button', disabled: false, block: false },
  )
</script>

<style scoped>
  .ui-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--ds-space-2);
    height: var(--ds-control-md);
    padding: 0 var(--ds-space-4);
    border: var(--ds-border-width) solid transparent;
    border-radius: var(--ds-radius-md);
    background: var(--ds-surface-2);
    color: var(--ds-text);
    font: inherit;
    font-size: var(--ds-text-md);
    font-weight: var(--ds-weight-medium);
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    transition:
      background-color var(--ds-duration) var(--ds-ease),
      border-color var(--ds-duration) var(--ds-ease),
      color var(--ds-duration) var(--ds-ease);
  }

  .ui-button:focus-visible {
    outline: none;
    box-shadow: var(--ds-focus-ring);
  }

  .ui-button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .ui-button--primary {
    background: var(--ds-accent);
    color: var(--ds-on-accent);
    font-weight: var(--ds-weight-semibold);
  }

  .ui-button--primary:hover:not(:disabled) {
    background: var(--ds-accent-hover);
  }

  .ui-button--secondary {
    border-color: var(--ds-border-strong);
  }

  .ui-button--secondary:hover:not(:disabled) {
    background: var(--ds-surface-3);
  }

  .ui-button--ghost {
    background: transparent;
    color: var(--ds-text-2);
  }

  .ui-button--ghost:hover:not(:disabled) {
    background: var(--ds-surface-2);
    color: var(--ds-text);
  }

  .ui-button--danger {
    background: transparent;
    color: var(--ds-danger);
  }

  .ui-button--danger:hover:not(:disabled) {
    background: var(--ds-surface-2);
  }

  .ui-button--sm {
    height: var(--ds-control-sm);
    padding: 0 var(--ds-space-3);
    border-radius: var(--ds-radius-sm);
    font-size: var(--ds-text-sm);
  }

  .ui-button--lg {
    height: var(--ds-control-lg);
    padding: 0 var(--ds-space-5);
  }

  .ui-button--block {
    width: 100%;
  }

  .ui-button__icon {
    display: inline-flex;
    width: var(--ds-icon-sm);
    height: var(--ds-icon-sm);
    flex-shrink: 0;
  }

  .ui-button__icon :deep(svg) {
    width: 100%;
    height: 100%;
  }
</style>
