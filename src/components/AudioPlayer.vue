<template>
  <div v-if="files.length > 0" class="player" role="region" :aria-label="t('player_title')">
    <div class="player__inner">
      <PlayerTrackInfo :title="currentTrack?.title" :time-text="timeText" />

      <PlayerTransport
        :is-playing="isPlaying"
        :repeat-mode="repeatMode"
        @previous="previous"
        @stop="stop"
        @toggle-play="handlePlay"
        @next="next"
        @cycle-repeat="cycleRepeatMode"
      />

      <PlayerSeekBar
        :current-time="currentTime"
        :duration="duration"
        :label="t('player_title')"
        :value-text="timeText"
        @seek="seek"
      />

      <div class="player__right">
        <PlayerVolume
          :volume="volume"
          :muted="isMuted"
          @toggle-mute="toggleMute"
          @update:volume="setVolume"
        />
        <UiButton
          variant="ghost"
          size="sm"
          :class="['player__queue-toggle', { 'player__queue-toggle--active': showQueue }]"
          :aria-label="t('player_queue')"
          :aria-expanded="showQueue"
          aria-controls="player-queue"
          @click="toggleQueue"
        >
          <template #icon>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
            >
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </template>
          {{ playlist.length }}
        </UiButton>
      </div>
    </div>

    <Transition name="player-queue">
      <PlayerQueue
        v-if="showQueue"
        id="player-queue"
        :tracks="playlist"
        :current-index="currentTrackIndex"
        :is-playing="isPlaying"
        @play="play"
        @close="showQueue = false"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, toRef, watch } from 'vue'
  import { UiButton } from './ui'
  import PlayerQueue from './player/PlayerQueue.vue'
  import PlayerSeekBar from './player/PlayerSeekBar.vue'
  import PlayerTrackInfo from './player/PlayerTrackInfo.vue'
  import PlayerTransport from './player/PlayerTransport.vue'
  import PlayerVolume from './player/PlayerVolume.vue'
  import { useAudioPlayer } from '../composables/useAudioPlayer'
  import { useToast } from '../composables/useToast'
  import { useTranslation } from '../composables/useTranslation'

  /**
   * Player-Leiste am unteren Rand: Titel, Transport, Suchleiste, Lautstärke und
   * Warteschlange. Logik und Zustand liegen in useAudioPlayer, die Teile der
   * Leiste in components/player/. Die Leiste ist nur sichtbar, solange Dateien
   * vorhanden sind.
   */
  const props = withDefaults(
    defineProps<{
      files: File[]
      /** In der Dateiliste markierter Titel; der Play-Button startet ihn. */
      selectedIndex?: number
    }>(),
    { selectedIndex: -1 },
  )

  // Hält die Markierung in der Dateiliste synchron zum laufenden Titel.
  const emit = defineEmits<{
    'update:selectedIndex': [index: number]
  }>()

  const { t } = useTranslation()
  const toast = useToast()
  const filesRef = toRef(props, 'files')
  const showQueue = ref(false)

  const {
    isPlaying,
    currentTrackIndex,
    currentTrack,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    playlist,
    play,
    cue,
    pause,
    stop,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    cycleRepeatMode,
    formatTime,
  } = useAudioPlayer(filesRef)

  const timeText = computed(
    () => `${formatTime(currentTime.value)} / ${formatTime(duration.value)}`,
  )

  // Merkt sich, ob seit dem letzten Start ein anderer Titel in der Liste markiert
  // wurde: Dann startet Play diesen Titel, sonst setzt er den aktuellen fort.
  const selectionChanged = ref(false)
  watch(
    () => props.selectedIndex,
    (index) => {
      if (index < 0 || index >= playlist.value.length) return
      selectionChanged.value = true
      // Markierten Titel sofort anzeigen (laden ohne abzuspielen), aber eine
      // laufende Wiedergabe nie unterbrechen.
      if (!isPlaying.value && index !== currentTrackIndex.value) cue(index)
    },
  )

  const handlePlay = () => {
    if (isPlaying.value) {
      pause()
      return
    }

    const selected = props.selectedIndex
    const hasSelection = selected >= 0 && selected < playlist.value.length

    if (selectionChanged.value && hasSelection && selected !== currentTrackIndex.value) {
      play(selected)
    } else if (currentTrackIndex.value >= 0) {
      play()
    } else {
      play(hasSelection ? selected : 0)
    }

    selectionChanged.value = false
  }

  // "Läuft jetzt"-Toast nur, wenn ein Titel tatsächlich startet oder wechselt.
  const lastAnnounced = ref(-1)
  const announceNowPlaying = () => {
    const index = currentTrackIndex.value
    const track = playlist.value[index]
    if (index >= 0 && track && index !== lastAnnounced.value) {
      toast.info(`♪ ${track.title}`)
      lastAnnounced.value = index
    }
  }
  watch(isPlaying, (playing) => {
    if (playing) announceNowPlaying()
  })
  watch(currentTrackIndex, (index) => {
    if (isPlaying.value) announceNowPlaying()
    if (index >= 0) emit('update:selectedIndex', index)
  })

  // Aus der Dateiliste: laufenden Titel nicht neu starten, andere sofort abspielen.
  const playTrack = (index: number) => {
    if (index < 0 || index >= playlist.value.length) return
    if (index === currentTrackIndex.value) {
      if (!isPlaying.value) play()
    } else {
      play(index)
    }
  }

  defineExpose({ playTrack, currentTrackIndex, isPlaying })

  watch(
    () => props.files.length,
    (length) => {
      if (length === 0) showQueue.value = false
    },
  )

  const toggleQueue = () => {
    showQueue.value = !showQueue.value
  }
</script>

<style scoped>
  .player {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: var(--ds-z-player);
    background: var(--ds-surface-1);
    border-top: var(--ds-border-width) solid var(--ds-border);
    color: var(--ds-text);
  }

  .player__inner {
    display: flex;
    align-items: center;
    gap: var(--ds-space-4);
    max-width: var(--ds-container);
    min-height: var(--ds-player-height);
    margin: 0 auto;
    padding: var(--ds-space-2) var(--ds-gutter);
    box-sizing: border-box;
  }

  .player__right {
    display: flex;
    align-items: center;
    gap: var(--ds-space-2);
    flex: 0 0 auto;
  }

  .player__queue-toggle {
    font-variant-numeric: tabular-nums;
  }

  .player__queue-toggle--active {
    border-color: var(--ds-accent);
    color: var(--ds-accent);
  }

  /* Wirkt auf das Wurzelelement von PlayerQueue (trägt das Scope-Attribut dieser Komponente). */
  .player-queue-enter-active,
  .player-queue-leave-active {
    transition:
      opacity var(--ds-duration) var(--ds-ease),
      transform var(--ds-duration) var(--ds-ease);
  }

  .player-queue-enter-from,
  .player-queue-leave-to {
    opacity: 0;
    transform: translateY(8px);
  }

  @media (max-width: 480px) {
    .player__inner {
      gap: var(--ds-space-2);
      flex-wrap: wrap;
    }
  }
</style>
