<template>
  <div :class="['ui-file-list', { 'ui-file-list--dragging': drag !== null }]">
    <div v-if="items.length > 0" class="ui-file-list__toolbar">
      <label class="ui-file-list__select-all">
        <input
          ref="selectAllInput"
          type="checkbox"
          class="ui-file-list__checkbox"
          :checked="allChecked"
          @change="toggleAll(($event.target as HTMLInputElement).checked)"
        />
        <span>{{ text.selectAll }}</span>
        <span class="ui-file-list__count">{{ checkedCount }}/{{ items.length }}</span>
      </label>
      <div v-if="$slots.toolbar" class="ui-file-list__toolbar-slot">
        <slot name="toolbar" />
      </div>
    </div>

    <UiEmptyState v-if="items.length === 0" :title="text.emptyTitle" :text="text.emptyText">
      <template v-if="$slots.emptyIcon" #icon>
        <slot name="emptyIcon" />
      </template>
      <template v-if="$slots.emptyAction" #action>
        <slot name="emptyAction" />
      </template>
    </UiEmptyState>

    <ul
      v-else
      ref="listElement"
      class="ui-file-list__rows"
      :aria-label="text.list"
      :style="{ maxHeight }"
    >
      <li
        v-for="(item, index) in items"
        :key="item.id"
        :ref="(el) => setRowRef(el, index)"
        :class="['ui-file-list__row', rowModifiers(index)]"
        :tabindex="index === focusIndex ? 0 : -1"
        :aria-current="index === selectedIndex ? 'true' : undefined"
        :data-index="index"
        @click="emit('update:selectedIndex', index)"
        @dblclick="emit('play', index)"
        @keydown="onRowKeydown($event, index, item)"
      >
        <button
          type="button"
          class="ui-file-list__handle"
          :aria-label="`${text.dragHandle}: ${item.name}`"
          tabindex="-1"
          @pointerdown="onHandlePointerDown($event, index)"
          @pointermove="onHandlePointerMove"
          @pointerup="onHandlePointerUp"
          @pointercancel="onHandlePointerCancel"
          @click.stop
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <circle cx="9" cy="5" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="9" cy="19" r="1.5" />
            <circle cx="15" cy="5" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="15" cy="19" r="1.5" />
          </svg>
        </button>
        <input
          type="checkbox"
          class="ui-file-list__checkbox"
          :checked="isChecked(item)"
          :aria-label="`${text.include}: ${item.name}`"
          tabindex="-1"
          @change="toggleItem(item)"
          @click.stop
        />
        <span class="ui-file-list__name" :title="item.name">
          <svg
            v-if="isRowPlaying(index)"
            class="ui-file-list__playing"
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <rect x="2" y="6" width="2.5" height="8" rx="1" />
            <rect x="6.75" y="2" width="2.5" height="12" rx="1" />
            <rect x="11.5" y="8" width="2.5" height="6" rx="1" />
          </svg>
          <span class="ui-file-list__name-text">{{ item.name }}</span>
        </span>
        <span class="ui-file-list__chip">{{ extensionOf(item.name) || '–' }}</span>
        <span class="ui-file-list__duration">{{ durationText(item) }}</span>
        <span class="ui-file-list__size">{{ formatBytes(item.size, locale) }}</span>
        <span class="ui-file-list__actions" @click.stop @dblclick.stop>
          <UiIconButton
            size="sm"
            :label="`${isRowPlaying(index) ? text.pause : text.play}: ${item.name}`"
            tabindex="-1"
            @click="emit('play', index)"
          >
            <svg v-if="isRowPlaying(index)" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="currentColor">
              <polygon points="6 3 20 12 6 21 6 3" />
            </svg>
          </UiIconButton>
          <UiIconButton
            size="sm"
            :label="`${text.remove}: ${item.name}`"
            tabindex="-1"
            @click="emit('remove', index)"
          >
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
        </span>
      </li>
    </ul>

    <div v-if="showSummary && items.length > 0" class="ui-file-list__summary">
      <span>{{ checkedCount }} {{ text.tracks }}</span>
      <span aria-hidden="true">·</span>
      <span :title="summary.approximate ? text.approximate : undefined">
        {{ summary.approximate ? '~' : '' }}{{ summary.durationLabel }}
      </span>
      <span aria-hidden="true">·</span>
      <span>{{ summary.sizeLabel }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, ref, watch, watchEffect } from 'vue'
  import UiEmptyState from './UiEmptyState.vue'
  import UiIconButton from './UiIconButton.vue'
  import {
    estimateSeconds,
    extensionOf,
    formatBytes,
    formatClock,
    formatDurationLabel,
  } from './fileListFormat'
  import type { FileListItem, FileListLabels } from './types'

  /**
   * Dateiliste als echte DOM-Liste (ersetzt die frühere Canvas-Dateiliste).
   *
   * - `v-model:selectedIndex` ist die markierte Zeile (-1 = keine), Pfeiltasten,
   *   Pos1/Ende, Enter (abspielen), Leertaste (Häkchen), Entf (entfernen),
   *   Escape (Auswahl aufheben) und Alt+Pfeil (verschieben) arbeiten auf ihr.
   * - `v-model:checked` sind die ids, die in die Wiedergabeliste aufgenommen werden.
   *   Ohne Angabe gelten alle Einträge als aufgenommen.
   * - `move(from, to)` nennt `to` als Index im Endzustand, wie usePlaylist.moveFile.
   * - Umsortieren per Pointer am Griff (Maus und Touch) oder per Alt+Pfeil.
   *
   * Tasten, die die Liste verarbeitet, werden nicht weitergereicht; globale
   * Kurzbefehle greifen nur, solange die Liste keinen Fokus hat.
   */
  const props = withDefaults(
    defineProps<{
      items: FileListItem[]
      selectedIndex?: number
      checked?: string[]
      playingIndex?: number
      isPlaying?: boolean
      locale?: string
      maxHeight?: string
      showSummary?: boolean
      labels?: Partial<FileListLabels>
    }>(),
    {
      selectedIndex: -1,
      checked: undefined,
      playingIndex: -1,
      isPlaying: false,
      locale: 'de-DE',
      maxHeight: '320px',
      showSummary: true,
      labels: () => ({}),
    },
  )

  const emit = defineEmits<{
    'update:selectedIndex': [index: number]
    'update:checked': [ids: string[]]
    play: [index: number]
    remove: [index: number]
    move: [from: number, to: number]
  }>()

  const DEFAULT_LABELS: FileListLabels = {
    list: 'Dateiliste',
    selectAll: 'Alle auswählen',
    include: 'In Wiedergabeliste aufnehmen',
    dragHandle: 'Verschieben, auch mit Alt und Pfeiltasten',
    play: 'Abspielen',
    pause: 'Pause',
    remove: 'Entfernen',
    tracks: 'Titel',
    approximate: 'Dauer geschätzt, bis die Metadaten gelesen sind',
    emptyTitle: 'Noch keine Dateien',
    emptyText: 'Füge Audiodateien hinzu oder zieh sie hierher.',
  }

  const text = computed<FileListLabels>(() => ({ ...DEFAULT_LABELS, ...props.labels }))

  // --- Auswahl (Häkchen) -----------------------------------------------------

  const isChecked = (item: FileListItem) =>
    props.checked === undefined || props.checked.includes(item.id)

  const checkedItems = computed(() => props.items.filter(isChecked))
  const checkedCount = computed(() => checkedItems.value.length)
  const allChecked = computed(
    () => props.items.length > 0 && checkedCount.value === props.items.length,
  )
  const someChecked = computed(() => checkedCount.value > 0 && !allChecked.value)

  const selectAllInput = ref<HTMLInputElement | null>(null)
  watchEffect(() => {
    if (selectAllInput.value) selectAllInput.value.indeterminate = someChecked.value
  })

  function toggleItem(item: FileListItem) {
    const ids = checkedItems.value.map((entry) => entry.id)
    const next = isChecked(item) ? ids.filter((id) => id !== item.id) : [...ids, item.id]
    emit('update:checked', next)
  }

  function toggleAll(checked: boolean) {
    emit('update:checked', checked ? props.items.map((item) => item.id) : [])
  }

  // --- Markierte Zeile und Tastatur -------------------------------------------

  const rows = ref<(HTMLLIElement | undefined)[]>([])
  const listElement = ref<HTMLElement | null>(null)

  function setRowRef(el: unknown, index: number) {
    rows.value[index] = el instanceof HTMLLIElement ? el : undefined
  }

  watch(
    () => props.items.length,
    (length) => {
      rows.value.length = length
    },
  )

  const focusIndex = computed(() =>
    props.selectedIndex >= 0 && props.selectedIndex < props.items.length ? props.selectedIndex : 0,
  )

  const isRowPlaying = (index: number) => props.isPlaying && index === props.playingIndex

  function rowModifiers(index: number) {
    return {
      'ui-file-list__row--selected': index === props.selectedIndex,
      'ui-file-list__row--playing': isRowPlaying(index),
      'ui-file-list__row--dragging': drag.value?.from === index,
      'ui-file-list__row--drop-before': dropBeforeIndex.value === index,
      'ui-file-list__row--drop-after': dropAfterIndex.value === index,
    }
  }

  function select(index: number) {
    emit('update:selectedIndex', index)
    nextTick(() => rows.value[index]?.focus())
  }

  function moveBy(index: number, direction: 1 | -1) {
    const to = index + direction
    if (to < 0 || to >= props.items.length) return
    emit('move', index, to)
    select(to)
  }

  function onRowKeydown(event: KeyboardEvent, index: number, item: FileListItem) {
    const last = props.items.length - 1
    let handled = true

    if (event.altKey && event.key === 'ArrowDown') moveBy(index, 1)
    else if (event.altKey && event.key === 'ArrowUp') moveBy(index, -1)
    else if (event.key === 'ArrowDown') select(Math.min(index + 1, last))
    else if (event.key === 'ArrowUp') select(Math.max(index - 1, 0))
    else if (event.key === 'Home') select(0)
    else if (event.key === 'End') select(last)
    else if (event.key === 'Enter') emit('play', index)
    else if (event.key === ' ') toggleItem(item)
    else if (event.key === 'Delete' || event.key === 'Backspace') emit('remove', index)
    else if (event.key === 'Escape') emit('update:selectedIndex', -1)
    else handled = false

    if (handled) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  // --- Umsortieren per Pointer am Griff ---------------------------------------

  interface DragState {
    from: number
    dropIndex: number
  }

  const drag = ref<DragState | null>(null)
  const AUTO_SCROLL_EDGE = 24
  const AUTO_SCROLL_STEP = 8

  /** Ziel-Index im Endzustand, oder null wenn sich nichts ändern würde. */
  const dropTarget = computed(() => {
    const state = drag.value
    if (!state) return null
    const to = state.dropIndex > state.from ? state.dropIndex - 1 : state.dropIndex
    return to === state.from ? null : to
  })

  const dropBeforeIndex = computed(() => {
    const state = drag.value
    if (!state || dropTarget.value === null || state.dropIndex >= props.items.length) return -1
    return state.dropIndex
  })

  const dropAfterIndex = computed(() => {
    const state = drag.value
    if (!state || dropTarget.value === null || state.dropIndex < props.items.length) return -1
    return props.items.length - 1
  })

  function dropIndexFor(clientY: number): number {
    let index = 0
    for (const row of rows.value) {
      if (!row) continue
      const rect = row.getBoundingClientRect()
      if (clientY > rect.top + rect.height / 2) index++
    }
    return index
  }

  function autoScroll(clientY: number) {
    const list = listElement.value
    if (!list) return
    const rect = list.getBoundingClientRect()
    if (clientY < rect.top + AUTO_SCROLL_EDGE) list.scrollTop -= AUTO_SCROLL_STEP
    else if (clientY > rect.bottom - AUTO_SCROLL_EDGE) list.scrollTop += AUTO_SCROLL_STEP
  }

  function onHandlePointerDown(event: PointerEvent, index: number) {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    const handle = event.currentTarget
    if (handle instanceof HTMLElement && typeof handle.setPointerCapture === 'function') {
      handle.setPointerCapture(event.pointerId)
    }
    drag.value = { from: index, dropIndex: index }
    event.preventDefault()
  }

  function onHandlePointerMove(event: PointerEvent) {
    if (!drag.value) return
    drag.value.dropIndex = dropIndexFor(event.clientY)
    autoScroll(event.clientY)
  }

  function onHandlePointerUp() {
    const state = drag.value
    const to = dropTarget.value
    drag.value = null
    if (!state || to === null) return
    emit('move', state.from, to)
    emit('update:selectedIndex', to)
  }

  function onHandlePointerCancel() {
    drag.value = null
  }

  // --- Anzeige ----------------------------------------------------------------

  const durationText = (item: FileListItem) =>
    item.duration != null && item.duration > 0 ? formatClock(item.duration) : '–'

  const summary = computed(() => {
    let seconds = 0
    let bytes = 0
    let approximate = false
    for (const item of checkedItems.value) {
      bytes += item.size
      if (item.duration != null && item.duration > 0) {
        seconds += item.duration
      } else {
        seconds += estimateSeconds(item.name, item.size)
        approximate = true
      }
    }
    return {
      approximate,
      durationLabel: formatDurationLabel(seconds),
      sizeLabel: formatBytes(bytes, props.locale),
    }
  })
</script>

<style scoped>
  .ui-file-list {
    display: flex;
    flex-direction: column;
    gap: var(--ds-space-3);
  }

  .ui-file-list--dragging {
    user-select: none;
    cursor: grabbing;
  }

  .ui-file-list__toolbar {
    display: flex;
    align-items: center;
    gap: var(--ds-space-3);
    flex-wrap: wrap;
  }

  .ui-file-list__select-all {
    display: inline-flex;
    align-items: center;
    gap: var(--ds-space-2);
    font-size: var(--ds-text-sm);
    color: var(--ds-text-2);
    cursor: pointer;
  }

  .ui-file-list__count {
    color: var(--ds-text-3);
    font-variant-numeric: tabular-nums;
  }

  .ui-file-list__toolbar-slot {
    display: flex;
    align-items: center;
    gap: var(--ds-space-2);
    margin-left: auto;
  }

  .ui-file-list__checkbox {
    width: 16px;
    height: 16px;
    margin: 0;
    accent-color: var(--ds-accent);
    cursor: pointer;
    flex-shrink: 0;
  }

  .ui-file-list__checkbox:focus-visible {
    outline: none;
    box-shadow: var(--ds-focus-ring);
  }

  .ui-file-list__rows {
    list-style: none;
    margin: 0;
    padding: 0;
    overflow-y: auto;
    border: var(--ds-border-width) solid var(--ds-border);
    border-radius: var(--ds-radius-md);
    background: var(--ds-surface-1);
    scrollbar-width: thin;
  }

  .ui-file-list__row {
    display: grid;
    grid-template-columns: 16px 16px minmax(0, 1fr) auto 56px 72px auto;
    gap: var(--ds-space-3);
    align-items: center;
    height: var(--ds-row-height);
    padding: 0 var(--ds-space-3);
    border-bottom: var(--ds-border-width) solid var(--ds-border);
    color: var(--ds-text);
    font-size: var(--ds-text-md);
    cursor: default;
    transition: background-color var(--ds-duration) var(--ds-ease);
  }

  .ui-file-list__row:last-child {
    border-bottom: none;
  }

  .ui-file-list__row:hover {
    background: var(--ds-surface-3);
  }

  .ui-file-list__row:focus-visible {
    outline: none;
    box-shadow: inset var(--ds-focus-ring);
  }

  .ui-file-list__row--selected,
  .ui-file-list__row--selected:hover {
    background: var(--ds-accent-soft);
  }

  .ui-file-list__row--dragging {
    opacity: 0.4;
  }

  .ui-file-list__row--drop-before {
    box-shadow: inset 0 2px 0 var(--ds-accent);
  }

  .ui-file-list__row--drop-after {
    box-shadow: inset 0 -2px 0 var(--ds-accent);
  }

  .ui-file-list__handle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: var(--ds-row-height);
    padding: 0;
    border: none;
    background: transparent;
    color: var(--ds-text-3);
    cursor: grab;
    touch-action: none;
  }

  .ui-file-list__handle svg {
    width: 16px;
    height: 16px;
  }

  .ui-file-list__row:hover .ui-file-list__handle,
  .ui-file-list__row--selected .ui-file-list__handle {
    color: var(--ds-text-2);
  }

  .ui-file-list--dragging .ui-file-list__handle {
    cursor: grabbing;
  }

  .ui-file-list__name {
    display: flex;
    align-items: center;
    gap: var(--ds-space-2);
    min-width: 0;
    font-weight: var(--ds-weight-medium);
  }

  .ui-file-list__name-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ui-file-list__playing {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    fill: var(--ds-accent);
  }

  .ui-file-list__chip {
    display: inline-flex;
    align-items: center;
    height: 20px;
    padding: 0 calc(var(--ds-space-1) + 2px);
    border-radius: var(--ds-radius-sm);
    background: var(--ds-surface-2);
    color: var(--ds-text-2);
    font-family: var(--ds-font-mono);
    font-size: var(--ds-text-xs);
    font-weight: var(--ds-weight-medium);
    text-transform: uppercase;
  }

  .ui-file-list__duration,
  .ui-file-list__size {
    font-size: var(--ds-text-sm);
    font-variant-numeric: tabular-nums;
    text-align: right;
    white-space: nowrap;
  }

  .ui-file-list__duration {
    color: var(--ds-text-2);
  }

  .ui-file-list__size {
    color: var(--ds-text-3);
  }

  .ui-file-list__actions {
    display: flex;
    gap: 2px;
    opacity: 0;
    transition: opacity var(--ds-duration) var(--ds-ease);
  }

  .ui-file-list__row:hover .ui-file-list__actions,
  .ui-file-list__row:focus-within .ui-file-list__actions,
  .ui-file-list__row--selected .ui-file-list__actions,
  .ui-file-list__row--playing .ui-file-list__actions {
    opacity: 1;
  }

  .ui-file-list__summary {
    display: flex;
    gap: var(--ds-space-2);
    font-size: var(--ds-text-sm);
    color: var(--ds-text-3);
    font-variant-numeric: tabular-nums;
  }

  @media (max-width: 480px) {
    .ui-file-list__row {
      grid-template-columns: 16px 16px minmax(0, 1fr) auto;
    }

    .ui-file-list__duration,
    .ui-file-list__size,
    .ui-file-list__chip {
      display: none;
    }
  }
</style>
