<template>
  <div>
    <button
      type="button"
      class="shortcuts-trigger"
      :title="t('shortcuts_hint_btn')"
      :aria-label="t('shortcuts_hint_btn')"
      :aria-expanded="isOpen"
      aria-controls="shortcuts-panel"
      @click="toggle"
    >
      ?
    </button>

    <Teleport to="body">
      <Transition name="backdrop">
        <div v-if="isOpen" class="shortcuts-backdrop" @click="close" />
      </Transition>

      <Transition name="panel">
        <div
          v-if="isOpen"
          id="shortcuts-panel"
          class="shortcuts-panel"
          role="dialog"
          :aria-label="t('shortcuts_panel_title')"
          aria-modal="true"
        >
          <div class="panel-header">
            <h2>{{ t('shortcuts_panel_title') }}</h2>
            <button
              type="button"
              class="close-btn"
              :aria-label="t('shortcuts_close_btn')"
              @click="close"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <ul class="shortcuts-list" role="list">
            <li v-for="s in shortcuts" :key="s.keys.join('+')">
              <span class="keys">
                <kbd v-for="k in s.keys" :key="k">{{ k }}</kbd>
              </span>
              <span class="desc">{{ t(s.descKey) }}</span>
            </li>
          </ul>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import { useTranslation } from '../composables/useTranslation'

  const { t } = useTranslation()
  const isOpen = ref(false)

  const shortcuts = [
    { keys: ['Ctrl', 'O'], descKey: 'shortcut_open_desc' },
    { keys: ['Ctrl', 'S'], descKey: 'shortcut_save_desc' },
    { keys: ['Ctrl', 'C'], descKey: 'shortcut_copy_desc' },
    { keys: ['Delete'], descKey: 'shortcut_delete_desc' },
    { keys: ['↑', '↓'], descKey: 'shortcut_arrows_desc' },
    { keys: ['Esc'], descKey: 'shortcut_escape_desc' },
    { keys: ['?'], descKey: 'shortcut_question_desc' },
  ]

  const toggle = () => { isOpen.value = !isOpen.value }
  const close = () => { isOpen.value = false }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen.value) {
      close()
      return
    }
    const active = document.activeElement
    const isTyping = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')
    if (!isTyping && e.key === '?') {
      toggle()
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeyDown))
  onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>

<style scoped>
  .shortcuts-trigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 1.5px solid var(--border-color);
    background: transparent;
    color: var(--muted-color);
    font-size: 0.85rem;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    transition:
      border-color 0.2s ease,
      color 0.2s ease,
      background 0.2s ease;
    flex-shrink: 0;
  }

  .shortcuts-trigger:hover {
    border-color: var(--accent-color);
    color: var(--accent-color);
    background: rgba(242, 226, 142, 0.08);
  }

  .light-theme .shortcuts-trigger:hover {
    background: rgba(162, 134, 128, 0.08);
  }

  /* Backdrop */
  .shortcuts-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(2px);
    z-index: 1000;
  }

  /* Panel */
  .shortcuts-panel {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1001;
    width: min(380px, calc(100vw - 32px));
    background: var(--panel-color, #16161c);
    border: 1px solid var(--border-color);
    border-radius: 18px;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
    overflow: hidden;
  }

  .light-theme .shortcuts-panel {
    background: #ffffff;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.15);
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 20px 14px;
    border-bottom: 1px solid var(--border-color);
  }

  .panel-header h2 {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: var(--accent-color);
    letter-spacing: 0.01em;
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: var(--muted-color);
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;
  }

  .close-btn:hover {
    background: var(--border-color);
    color: var(--text-color);
  }

  .shortcuts-list {
    list-style: none;
    margin: 0;
    padding: 10px 0 14px;
  }

  .shortcuts-list li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 9px 20px;
    transition: background 0.15s ease;
  }

  .shortcuts-list li:hover {
    background: rgba(242, 226, 142, 0.05);
  }

  .light-theme .shortcuts-list li:hover {
    background: rgba(162, 134, 128, 0.06);
  }

  .keys {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  }

  kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 24px;
    padding: 0 6px;
    border: 1px solid var(--border-color);
    border-bottom-width: 2px;
    border-radius: 5px;
    background: var(--input-bg, rgba(0, 0, 0, 0.2));
    color: var(--text-color);
    font-family: inherit;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }

  .light-theme kbd {
    background: rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.18);
    border-bottom-color: rgba(0, 0, 0, 0.3);
  }

  .desc {
    font-size: 0.88rem;
    color: var(--muted-color);
    text-align: right;
    flex: 1;
  }

  /* Transitions */
  .backdrop-enter-active,
  .backdrop-leave-active {
    transition: opacity 0.2s ease;
  }
  .backdrop-enter-from,
  .backdrop-leave-to {
    opacity: 0;
  }

  .panel-enter-active {
    transition:
      opacity 0.2s ease,
      transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .panel-leave-active {
    transition:
      opacity 0.15s ease,
      transform 0.15s ease;
  }
  .panel-enter-from,
  .panel-leave-to {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.95);
  }
</style>
