<template>
  <div ref="rootEl" class="slider-field" :class="{ 'slider-field--disabled': disabled }">
    <input
      type="range"
      class="slider-field__range"
      :class="rangeClass"
      :style="rangeStyle"
      :aria-labelledby="autoLabelledby || undefined"
      v-bind="rangeAttrs($attrs)"
      :min="min"
      :max="max"
      :step="step"
      :value="numericValue"
      :disabled="disabled"
      @pointerdown="beginInteraction"
      @keydown="beginInteraction"
      @input="onRangeInput"
      @change="commitInteraction"
    />
    <input
      ref="numEl"
      type="number"
      class="slider-field__num"
      inputmode="decimal"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      :aria-label="
        $attrs['aria-label'] ? `${$attrs['aria-label']} (${t('slider_value')})` : t('slider_value')
      "
      @input="onNumberInput"
      @change="commitInteraction"
      @blur="onNumberBlur"
    />
    <button
      v-if="hasDefault"
      type="button"
      class="slider-field__reset"
      :title="resetTitle"
      :aria-label="resetTitle"
      :disabled="disabled || isAtDefault"
      @click="reset"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
  /**
   * SliderField – Ersatz für einen nackten `<input type="range">`, übernommen aus dem
   * Visualizer (Template und CSS unverändert, Script nach TS portiert).
   *
   * Zeile aus Regler, Zahlen-Spinner (`type="number"`) und Reset-Button, der auf
   * `defaultValue` zurücksetzt. Ohne `defaultValue` wird kein Reset-Button gerendert.
   *
   * v-model: Zahl (Strings werden beim Empfang in Zahlen gewandelt, emittiert
   * werden immer Zahlen, gerundet auf die Nachkommastellen von `step`).
   *
   * Events:
   * - `update:modelValue` (number) – live bei jeder Änderung
   * - `start` (number: Wert vor der Änderung) – Beginn einer Interaktion
   * - `change` (number) – Abschluss einer Interaktion (Regler losgelassen, Feld verlassen, Reset)
   * - `reset` (number) – nach einem Klick auf den Reset-Button
   *
   * Nicht-Prop-Attribute (`class`, `style`, `id`, `aria-*`, `data-*`, `title`, …) landen auf
   * dem Range-Input. Damit scoped CSS der Eltern auch den Range-Input trifft, erhält er
   * zusätzlich die Scope-Attribute des Elternkontexts (siehe `useParentScopeAttrs`).
   */
  import {
    computed,
    getCurrentInstance,
    onMounted,
    ref,
    useAttrs,
    useId,
    watch,
    type HTMLAttributes,
    type StyleValue,
    type VNode,
  } from 'vue'
  import { useTranslation } from '@/composables/useTranslation'

  defineOptions({ inheritAttrs: false })

  const props = withDefaults(
    defineProps<{
      modelValue?: number | string
      min?: number | string
      max?: number | string
      step?: number | string
      /** Wert für den Reset-Button. Ohne Angabe gibt es keinen Reset-Button. */
      defaultValue?: number | string
      disabled?: boolean
    }>(),
    { modelValue: 0, min: 0, max: 100, step: 1, defaultValue: undefined, disabled: false },
  )

  const emit = defineEmits<{
    'update:modelValue': [value: number]
    start: [value: number]
    change: [value: number]
    reset: [value: number]
  }>()

  const { t } = useTranslation()

  // ── Scope-Attribute des Elternkontexts (für dessen scoped CSS) ─────────────
  /**
   * Vue setzt die `data-v-…`-Scope-Attribute eines Elternteils nur auf das
   * Wurzelelement einer Kindkomponente. Der Range-Input ist hier aber ein
   * Kindelement, soll jedoch von Eltern-Selektoren getroffen werden. Deshalb
   * werden dieselben Attribute hier eingesammelt und an den Range-Input gebunden.
   */
  function useParentScopeAttrs(): Record<string, string> {
    const scopeAttrs: Record<string, string> = {}
    let inst = getCurrentInstance()
    while (inst) {
      const vnode = inst.vnode as VNode & { slotScopeIds?: string[] | null }
      if (vnode.scopeId) scopeAttrs[vnode.scopeId] = ''
      if (vnode.slotScopeIds) for (const id of vnode.slotScopeIds) scopeAttrs[id] = ''
      const parent = inst.parent
      // Ist diese Komponente die Wurzel ihres Elternteils, erbt sie auch dessen Scope.
      if (parent && parent.subTree === vnode) inst = parent
      else break
    }
    return scopeAttrs
  }
  const parentScopeAttrs = useParentScopeAttrs()

  /** Alle Attribute außer class/style (die werden separat gebunden) + Scope-Attribute. */
  function rangeAttrs(all: Record<string, unknown>): Record<string, unknown> {
    const rest = Object.fromEntries(
      Object.entries(all).filter(([key]) => key !== 'class' && key !== 'style'),
    )
    return { ...parentScopeAttrs, ...rest }
  }

  // ── Barrierefreiheit: Name des Reglers ─────────────────────────────────────
  /**
   * Gibt der Aufrufer selbst keinen Namen an (aria-label, aria-labelledby oder id für
   * ein `<label for>`), wird eine direkt davor stehende Beschriftung per
   * aria-labelledby verknüpft. Der Name folgt so auch einem Sprachwechsel.
   */
  const attrs = useAttrs()
  const rangeClass = computed(() => attrs.class as HTMLAttributes['class'])
  const rangeStyle = computed(() => attrs.style as StyleValue)
  const rootEl = ref<HTMLElement | null>(null)
  const autoLabelledby = ref<string | null>(null)
  const generatedLabelId = `slider-label-${useId()}`

  function findPrecedingLabel(root: HTMLElement | null): Element | null {
    const prev = root?.previousElementSibling
    if (!prev) return null
    if (prev.tagName === 'LABEL') return prev
    return prev.querySelector('.label-text, label')
  }

  onMounted(() => {
    if (attrs['aria-label'] || attrs['aria-labelledby'] || attrs.id) return
    const label = findPrecedingLabel(rootEl.value)
    if (!label) return
    if (!label.id) label.id = generatedLabelId
    autoLabelledby.value = label.id
  })

  // ── Werte ──────────────────────────────────────────────────────────────────
  const decimals = computed(() => {
    const s = String(props.step)
    const i = s.indexOf('.')
    return i === -1 ? 0 : s.length - i - 1
  })

  function roundTo(value: number): number {
    const f = 10 ** decimals.value
    return Math.round(value * f) / f
  }

  function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value))
  }

  function toNumber(value: number | string | undefined, fallback: number): number {
    const n = typeof value === 'number' ? value : parseFloat(value ?? '')
    return Number.isFinite(n) ? n : fallback
  }

  const minNum = computed(() => toNumber(props.min, 0))
  const maxNum = computed(() => toNumber(props.max, 100))
  const numericValue = computed(() => toNumber(props.modelValue, minNum.value))
  const hasDefault = computed(() => props.defaultValue !== undefined && props.defaultValue !== null)
  const defaultNum = computed(() => toNumber(props.defaultValue, minNum.value))
  const isAtDefault = computed(
    () => hasDefault.value && roundTo(numericValue.value) === roundTo(defaultNum.value),
  )
  const resetTitle = computed(() =>
    hasDefault.value ? `${t.value('slider_reset')} (${formatValue(defaultNum.value)})` : '',
  )

  function formatValue(n: number): string {
    return roundTo(n).toFixed(decimals.value)
  }

  // Das Zahlenfeld wird bewusst NICHT über ein reaktives `:value` gebunden: Vue würde
  // bei jedem Re-Render den gebundenen Wert zurückschreiben, während der Nutzer noch
  // tippt. Stattdessen wird der DOM-Wert imperativ synchronisiert, und nur dann, wenn
  // die Änderung nicht aus dem Feld selbst kam.
  const numEl = ref<HTMLInputElement | null>(null)
  let lastNumberEmit: number | null = null

  function syncNumberField(force = false) {
    const el = numEl.value
    if (!el) return
    const n = numericValue.value
    const cameFromThisField = lastNumberEmit !== null && lastNumberEmit === n
    const focused = typeof document !== 'undefined' && document.activeElement === el
    if (!force && focused && cameFromThisField) return
    const formatted = formatValue(n)
    if (el.value !== formatted) el.value = formatted
  }

  onMounted(() => syncNumberField(true))
  watch(numericValue, () => syncNumberField())

  // ── Interaktion (start/change) ─────────────────────────────────────────────
  let interacting = false
  let valueBeforeInteraction: number | null = null
  // Zuletzt emittierter Wert, unabhängig davon, ob der Elternteil den Prop schon zurückgespielt hat.
  let lastEmitted: number | null = null

  function beginInteraction() {
    if (interacting) return
    interacting = true
    valueBeforeInteraction = numericValue.value
    emit('start', valueBeforeInteraction)
  }

  function commitInteraction() {
    if (!interacting) return
    interacting = false
    const value = lastEmitted ?? numericValue.value
    if (value !== valueBeforeInteraction) emit('change', value)
    valueBeforeInteraction = null
    lastEmitted = null
  }

  function applyValue(raw: number) {
    const value = roundTo(clamp(raw, minNum.value, maxNum.value))
    if (value === numericValue.value && typeof props.modelValue === 'number') return
    lastEmitted = value
    emit('update:modelValue', value)
  }

  function onRangeInput(event: Event) {
    beginInteraction()
    applyValue(parseFloat((event.target as HTMLInputElement).value))
  }

  function onNumberInput(event: Event) {
    const raw = (event.target as HTMLInputElement).value
    if (raw === '' || raw === '-' || raw === '.' || raw === '-.') return // Nutzer tippt noch
    const n = Number(raw)
    if (!Number.isFinite(n)) return
    beginInteraction()
    lastNumberEmit = roundTo(clamp(n, minNum.value, maxNum.value))
    applyValue(n)
  }

  function onNumberBlur() {
    lastNumberEmit = null
    syncNumberField(true)
    commitInteraction()
  }

  function reset() {
    if (!hasDefault.value || isAtDefault.value) return
    beginInteraction()
    applyValue(defaultNum.value)
    commitInteraction()
    emit('reset', roundTo(defaultNum.value))
  }
</script>

<style scoped src="./range.css"></style>

<style scoped>
  /* Anatomie wie ControlSlider + ResetButton im Collage Maker: Regler, Zahlenfeld
   (ds-control-sm, mono) und Reset als Ghost-Icon-Button (UiIconButton size="sm"). */
  .slider-field {
    display: flex;
    align-items: center;
    gap: var(--ds-space-2);
    width: 100%;
    /* In Flex-Zeilen der Eltern (Slider + Wert-Anzeige) den Restplatz einnehmen. */
    flex: 1 1 auto;
    min-width: 0;
    box-sizing: border-box;
  }
  .slider-field--disabled {
    opacity: 0.45;
  }

  /* Der Range-Input trägt zusätzlich die Klasse(n) der Elternkomponente. */
  .slider-field__range {
    flex: 1 1 auto;
    min-width: 0;
  }

  .slider-field__num {
    flex: none;
    box-sizing: border-box;
    width: 64px;
    height: var(--ds-control-sm);
    padding: 0 var(--ds-space-1) 0 var(--ds-space-2);
    background: var(--ds-surface-2);
    border: var(--ds-border-width) solid var(--ds-border-strong);
    border-radius: var(--ds-radius-sm);
    color: var(--ds-text);
    font-family: var(--ds-font-mono);
    font-size: var(--ds-text-xs);
    font-variant-numeric: tabular-nums;
    line-height: 1;
    transition:
      border-color var(--ds-duration) var(--ds-ease),
      box-shadow var(--ds-duration) var(--ds-ease);
  }
  .slider-field__num:focus-visible {
    outline: none;
    border-color: var(--ds-accent);
    box-shadow: var(--ds-focus-ring);
  }
  /* Spinner-Pfeile dauerhaft sichtbar (Chrome/Safari blenden sie sonst erst beim Hover ein). */
  .slider-field__num::-webkit-inner-spin-button,
  .slider-field__num::-webkit-outer-spin-button {
    opacity: 1;
    margin: 0;
    cursor: pointer;
  }

  .slider-field__reset {
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--ds-control-sm);
    height: var(--ds-control-sm);
    padding: 0;
    border: var(--ds-border-width) solid transparent;
    border-radius: var(--ds-radius-sm);
    background: transparent;
    color: var(--ds-text-2);
    cursor: pointer;
    transition:
      background-color var(--ds-duration) var(--ds-ease),
      color var(--ds-duration) var(--ds-ease);
  }
  .slider-field__reset svg {
    width: var(--ds-icon-sm);
    height: var(--ds-icon-sm);
  }
  .slider-field__reset:hover:not(:disabled) {
    background: var(--ds-surface-2);
    color: var(--ds-text);
  }
  .slider-field__reset:focus-visible {
    outline: none;
    box-shadow: var(--ds-focus-ring);
  }
  .slider-field__reset:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
</style>
