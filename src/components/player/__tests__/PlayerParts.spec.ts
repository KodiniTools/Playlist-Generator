import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import PlayerQueue from '../PlayerQueue.vue'
import PlayerSeekBar from '../PlayerSeekBar.vue'
import PlayerTransport from '../PlayerTransport.vue'
import PlayerVolume from '../PlayerVolume.vue'
import { useTranslation } from '../../../composables/useTranslation'

beforeEach(() => {
  useTranslation().setLanguage('de')
})

describe('PlayerSeekBar', () => {
  const mountBar = (currentTime: number, duration: number) =>
    mount(PlayerSeekBar, { props: { currentTime, duration, label: 'Suche', valueText: 'x' } })

  it('springt per Tastatur um 5 s und klemmt auf 0 bis Dauer', async () => {
    const wrapper = mountBar(3, 100)
    const bar = wrapper.get('[role="slider"]')
    await bar.trigger('keydown', { key: 'ArrowRight' })
    await bar.trigger('keydown', { key: 'ArrowLeft' })
    await bar.trigger('keydown', { key: 'End' })
    await bar.trigger('keydown', { key: 'Home' })
    await bar.trigger('keydown', { key: 'a' })
    expect(wrapper.emitted('seek')).toEqual([[8], [0], [100], [0]])
    expect(bar.attributes('aria-valuemax')).toBe('100')
    expect(wrapper.get('.player__seek-fill').attributes('style')).toContain('width: 3%')
  })

  it('meldet ohne Dauer nichts', async () => {
    const wrapper = mountBar(0, 0)
    await wrapper.get('[role="slider"]').trigger('keydown', { key: 'End' })
    expect(wrapper.emitted('seek')).toBeUndefined()
    expect(wrapper.get('.player__seek-fill').attributes('style')).toContain('width: 0%')
  })
})

describe('PlayerTransport', () => {
  it('meldet die Transport-Aktionen und zeigt den Wiederholmodus', async () => {
    const wrapper = mount(PlayerTransport, { props: { isPlaying: false, repeatMode: 'one' } })
    for (const label of ['Vorheriger Track', 'Stopp', 'Abspielen', 'Nächster Track']) {
      const button = wrapper.find(`button[aria-label="${label}"]`)
      expect(button.exists()).toBe(true)
      await button.trigger('click')
    }
    await wrapper.get('.player__repeat').trigger('click')
    expect(Object.keys(wrapper.emitted())).toEqual(
      expect.arrayContaining(['previous', 'stop', 'toggle-play', 'next', 'cycle-repeat']),
    )
    expect(wrapper.get('.player__repeat').attributes('aria-label')).toBe(
      'Wiederholen: Aktueller Track',
    )
    expect(wrapper.get('.player__repeat-badge').text()).toBe('1')

    await wrapper.setProps({ isPlaying: true, repeatMode: 'off' })
    expect(wrapper.find('button[aria-label="Pause"]').exists()).toBe(true)
    expect(wrapper.find('.player__repeat-badge').exists()).toBe(false)
  })
})

describe('PlayerVolume', () => {
  it('meldet Lautstärke und Stummschalten', async () => {
    const wrapper = mount(PlayerVolume, { props: { volume: 0.8, muted: false } })
    await wrapper.get('#player-volume').setValue('0.25')
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('update:volume')).toEqual([[0.25]])
    expect(wrapper.emitted('toggle-mute')).toHaveLength(1)
  })
})

describe('PlayerQueue', () => {
  it('markiert den aktuellen Titel und meldet Klicks', async () => {
    const file = new File([''], 'a.mp3')
    const tracks = [
      { index: 0, name: 'a.mp3', title: 'a', file },
      { index: 1, name: 'b.mp3', title: 'b', file },
    ]
    const wrapper = mount(PlayerQueue, { props: { tracks, currentIndex: 1, isPlaying: true } })
    const items = wrapper.findAll('.player__queue-item')
    expect(items.at(1)?.attributes('aria-current')).toBe('true')
    expect(items.at(1)?.find('.player__queue-playing').exists()).toBe(true)
    await items.at(0)?.trigger('click')
    await wrapper.get('.player__queue-header button').trigger('click')
    expect(wrapper.emitted('play')).toEqual([[0]])
    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
