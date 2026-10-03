<template>
  <div class="shortcuts">
    <UiIconButton
      size="sm"
      :label="t('shortcuts_hint_btn')"
      :aria-expanded="isOpen"
      aria-controls="shortcuts-panel"
      @click="toggle"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    </UiIconButton>

    <UiDialog
      id="shortcuts-panel"
      :open="isOpen"
      :title="t('shortcuts_panel_title')"
      :close-label="t('shortcuts_close_btn')"
      @close="close"
    >
      <ul class="shortcuts__list">
        <li v-for="shortcut in shortcuts" :key="shortcut.keys.join('+')" class="shortcuts__item">
          <span class="shortcuts__desc">{{ t(shortcut.descKey) }}</span>
          <UiKbd :keys="shortcut.keys" />
        </li>
      </ul>
    </UiDialog>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, onUnmounted, ref } from 'vue'
  import { UiDialog, UiIconButton, UiKbd } from './ui'
  import { useTranslation } from '../composables/useTranslation'

  /**
   * Fragezeichen-Button in der Kopfzeile plus Dialog mit allen Tastaturkürzeln.
   * Die Taste ? öffnet und schließt den Dialog, solange kein Textfeld den Fokus hat.
   */
  const { t } = useTranslation()
  const isOpen = ref(false)

  const shortcuts: ReadonlyArray<{ keys: string[]; descKey: string }> = [
    { keys: ['Ctrl', 'O'], descKey: 'shortcut_open_desc' },
    { keys: ['Ctrl', 'S'], descKey: 'shortcut_save_desc' },
    { keys: ['Ctrl', 'C'], descKey: 'shortcut_copy_desc' },
    { keys: ['Delete'], descKey: 'shortcut_delete_desc' },
    { keys: ['Ctrl', 'Z'], descKey: 'shortcut_undo_desc' },
    { keys: ['Ctrl', 'Y'], descKey: 'shortcut_redo_desc' },
    { keys: ['↑', '↓'], descKey: 'shortcut_arrows_desc' },
    { keys: ['Esc'], descKey: 'shortcut_escape_desc' },
    { keys: ['?'], descKey: 'shortcut_question_desc' },
  ]

  const toggle = () => {
    isOpen.value = !isOpen.value
  }

  const close = () => {
    isOpen.value = false
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isOpen.value) {
      close()
      return
    }
    const active = document.activeElement
    const isTyping =
      active !== null && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')
    if (!isTyping && event.key === '?') toggle()
  }

  onMounted(() => window.addEventListener('keydown', onKeyDown))
  onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>

<style scoped>
  .shortcuts {
    display: inline-flex;
  }

  .shortcuts__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }

  .shortcuts__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ds-space-3);
    min-height: var(--ds-control-md);
    padding: var(--ds-space-1) 0;
    border-bottom: var(--ds-border-width) solid var(--ds-border);
  }

  .shortcuts__item:last-child {
    border-bottom: none;
  }

  .shortcuts__desc {
    font-size: var(--ds-text-sm);
    color: var(--ds-text-2);
  }
</style>
