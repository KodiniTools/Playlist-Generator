import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import AudioPlayer from '../AudioPlayer.vue'
import { useAudioPlayer } from '../../composables/useAudioPlayer'
import { useToast } from '../../composables/useToast'
import { useTranslation } from '../../composables/useTranslation'

// Das echte Composable braucht ein <audio>-Element mit play(); jsdom hat das nicht.
vi.mock('../../composables/useAudioPlayer', async () => {
  const { computed, ref } = await import('vue')
  const files = ref<File[]>([])
  const isPlaying = ref(false)
  const currentTrackIndex = ref(-1)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(0.7)
  const isMuted = ref(false)
  const repeatMode = ref<'off' | 'all' | 'one'>('off')
  const playlist = computed(() =>
    files.value.map((file, index) => ({
      index,
      name: file.name,
      title: file.name.replace(/\.[^/.]+$/, ''),
      file,
    })),
  )
  const currentTrack = computed(() => playlist.value[currentTrackIndex.value] ?? null)
  const state = {
    isPlaying,
    isPaused: ref(false),
    currentTrackIndex,
    currentTrack,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    playlist,
    play: vi.fn((index?: number) => {
      if (typeof index === 'number') currentTrackIndex.value = index
      else if (currentTrackIndex.value === -1) currentTrackIndex.value = 0
      isPlaying.value = true
    }),
    cue: vi.fn((index: number) => {
      currentTrackIndex.value = index
      return true
    }),
    pause: vi.fn(() => {
      isPlaying.value = false
    }),
    stop: vi.fn(),
    togglePlay: vi.fn(),
    next: vi.fn(),
    previous: vi.fn(),
    seek: vi.fn((seconds: number) => {
      currentTime.value = seconds
    }),
    setVolume: vi.fn(),
    toggleMute: vi.fn(),
    cycleRepeatMode: vi.fn(),
    formatTime: (seconds: number) =>
      `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`,
  }
  return {
    useAudioPlayer: (filesRef: { value: File[] }) => {
      files.value = filesRef.value
      return state
    },
  }
})

const player = useAudioPlayer(ref<File[]>([]))
const { toasts } = useToast()

const files = [
  new File([new Uint8Array(8)], 'Summer_Mix.mp3'),
  new File([new Uint8Array(8)], 'Chill_Vibes.mp3'),
  new File([new Uint8Array(8)], 'Road_Trip.flac'),
]

function mountPlayer(selectedIndex = -1) {
  return mount(AudioPlayer, { props: { files, selectedIndex } })
}

const button = (wrapper: ReturnType<typeof mountPlayer>, label: string) =>
  wrapper.get(`button[aria-label="${label}"]`)

describe('AudioPlayer', () => {
  beforeEach(() => {
    useTranslation().setLanguage('de')
    toasts.value.splice(0)
    player.isPlaying.value = false
    player.currentTrackIndex.value = -1
    player.currentTime.value = 0
    player.duration.value = 0
    player.repeatMode.value = 'off'
    for (const fn of [player.play, player.pause, player.seek, player.setVolume, player.next]) {
      vi.mocked(fn).mockClear()
    }
  })

  it('rendert nichts ohne Dateien und sonst die Leiste mit Transport und Titel', () => {
    expect(
      mount(AudioPlayer, { props: { files: [] } })
        .find('.player')
        .exists(),
    ).toBe(false)

    const wrapper = mountPlayer()
    expect(wrapper.get('.player').attributes('role')).toBe('region')
    expect(wrapper.get('.player__title').classes()).toContain('player__title--empty')
    expect(button(wrapper, 'Abspielen').classes()).toContain('ui-icon-button--primary')
    expect(wrapper.get('[role="slider"]').attributes('aria-valuenow')).toBe('0')
    expect(wrapper.get('.player__queue-toggle').text()).toBe('3')
  })

  it('startet die Markierung, pausiert und setzt fort', async () => {
    const wrapper = mountPlayer(1)
    await button(wrapper, 'Abspielen').trigger('click')
    expect(player.play).toHaveBeenCalledWith(1)
    expect(wrapper.get('.player__title').text()).toBe('Chill_Vibes')
    expect(toasts.value.at(0)?.message).toBe('♪ Chill_Vibes')

    await button(wrapper, 'Pause').trigger('click')
    expect(player.pause).toHaveBeenCalledTimes(1)

    await button(wrapper, 'Abspielen').trigger('click')
    expect(vi.mocked(player.play).mock.calls.at(-1)).toEqual([])
  })

  it('synchronisiert die Markierung der Liste mit dem laufenden Titel', async () => {
    const wrapper = mountPlayer()
    player.currentTrackIndex.value = 2
    await nextTick()
    expect(wrapper.emitted('update:selectedIndex')).toEqual([[2]])
  })

  it('spult per Tastatur und Zeiger in der Suchleiste', async () => {
    const wrapper = mountPlayer()
    player.duration.value = 200
    player.currentTime.value = 10
    await nextTick()

    const slider = wrapper.get('[role="slider"]')
    await slider.trigger('keydown', { key: 'ArrowRight' })
    expect(player.seek).toHaveBeenLastCalledWith(15)
    await slider.trigger('keydown', { key: 'End' })
    expect(player.seek).toHaveBeenLastCalledWith(200)

    slider.element.getBoundingClientRect = () => ({ left: 0, width: 400 }) as DOMRect
    slider.element.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, cancelable: true, clientX: 100 }),
    )
    expect(player.seek).toHaveBeenLastCalledWith(50)
  })

  it('zeigt Wiederholen als Umschalter, stellt die Lautstärke und öffnet die Warteschlange', async () => {
    const wrapper = mountPlayer()
    player.repeatMode.value = 'one'
    await nextTick()
    const repeat = wrapper.get('.player__repeat')
    expect(repeat.attributes('aria-pressed')).toBe('true')
    expect(repeat.get('.player__repeat-badge').text()).toBe('1')

    await wrapper.get('#player-volume').setValue('0.25')
    expect(player.setVolume).toHaveBeenCalledWith(0.25)

    player.isPlaying.value = true
    player.currentTrackIndex.value = 0
    await wrapper.get('.player__queue-toggle').trigger('click')
    const items = wrapper.findAll('.player__queue-item')
    expect(items).toHaveLength(3)
    expect(items.at(0)?.classes()).toContain('player__queue-item--active')
    expect(items.at(0)?.find('.player__queue-playing').exists()).toBe(true)
    await items.at(2)?.trigger('click')
    expect(player.play).toHaveBeenCalledWith(2)
  })

  it('stellt playTrack für die Dateiliste bereit', () => {
    const wrapper = mountPlayer()
    const exposed = wrapper.vm as unknown as { playTrack: (index: number) => void }
    exposed.playTrack(1)
    expect(player.play).toHaveBeenLastCalledWith(1)

    player.isPlaying.value = false
    exposed.playTrack(1)
    expect(vi.mocked(player.play).mock.calls.at(-1)).toEqual([])

    exposed.playTrack(99)
    expect(player.play).toHaveBeenCalledTimes(2)
  })
})
