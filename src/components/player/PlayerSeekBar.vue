<template>
  <div
    ref="barRef"
    class="player__seek"
    role="slider"
    tabindex="0"
    :aria-label="label"
    :aria-valuemin="0"
    :aria-valuemax="Math.round(duration)"
    :aria-valuenow="Math.round(currentTime)"
    :aria-valuetext="valueText"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @keydown="onKeydown"
  >
    <span class="player__seek-track">
      <span class="player__seek-fill" :style="{ width: `${progressPercent}%` }"></span>
    </span>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'

  /**
   * Suchleiste als ARIA-Slider: Pointer (Maus, Touch, mit Capture beim Ziehen)
   * und Tastatur (Pfeile ±5 s, Pos1/Ende). Meldet die Zielzeit über `seek`.
   */
  const props = defineProps<{
    currentTime: number
    duration: number
    label: string
    /** Vorlesetext, z. B. „1:05 / 3:20“. */
    valueText: string
  }>()

  const emit = defineEmits<{
    seek: [seconds: number]
  }>()

  const SEEK_STEP_SECONDS = 5
  const barRef = ref<HTMLElement | null>(null)
  let seeking = false

  const progressPercent = computed(() =>
    props.duration > 0 ? (props.currentTime / props.duration) * 100 : 0,
  )

  const seekFromPointer = (event: PointerEvent) => {
    const bar = barRef.value
    if (!bar || props.duration <= 0) return
    const rect = bar.getBoundingClientRect()
    if (rect.width <= 0) return
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
    emit('seek', ratio * props.duration)
  }

  const onPointerDown = (event: PointerEvent) => {
    if (props.duration <= 0) return
    seeking = true
    const bar = event.currentTarget
    if (bar instanceof HTMLElement && typeof bar.setPointerCapture === 'function') {
      bar.setPointerCapture(event.pointerId)
    }
    seekFromPointer(event)
    event.preventDefault()
  }

  const onPointerMove = (event: PointerEvent) => {
    if (seeking) seekFromPointer(event)
  }

  const onPointerUp = () => {
    seeking = false
  }

  const onKeydown = (event: KeyboardEvent) => {
    if (props.duration <= 0) return
    const targets: Record<string, number> = {
      ArrowRight: props.currentTime + SEEK_STEP_SECONDS,
      ArrowUp: props.currentTime + SEEK_STEP_SECONDS,
      ArrowLeft: props.currentTime - SEEK_STEP_SECONDS,
      ArrowDown: props.currentTime - SEEK_STEP_SECONDS,
      Home: 0,
      End: props.duration,
    }
    const target = targets[event.key]
    if (target === undefined) return
    event.preventDefault()
    emit('seek', Math.max(0, Math.min(props.duration, target)))
  }
</script>

<style scoped>
  .player__seek {
    display: flex;
    align-items: center;
    flex: 2 1 160px;
    min-width: 0;
    height: var(--ds-control-sm);
    border-radius: var(--ds-radius-sm);
    cursor: pointer;
    touch-action: none;
  }

  .player__seek:focus-visible {
    outline: none;
    box-shadow: var(--ds-focus-ring);
  }

  .player__seek-track {
    display: block;
    width: 100%;
    height: 4px;
    border-radius: var(--ds-radius-full);
    background: var(--ds-surface-3);
    overflow: hidden;
  }

  .player__seek-fill {
    display: block;
    height: 100%;
    background: var(--ds-accent);
    transition: width 0.1s linear;
  }

  @media (max-width: 480px) {
    .player__seek {
      order: 10;
      flex-basis: 100%;
      height: 20px;
    }
  }
</style>
