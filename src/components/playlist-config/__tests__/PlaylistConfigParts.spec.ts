import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import PlaylistDropzone from '../PlaylistDropzone.vue'
import PlaylistNameRow from '../PlaylistNameRow.vue'
import PlaylistTargetLength from '../PlaylistTargetLength.vue'
import { useDurations } from '../../../composables/useDurations'
import { usePlaylist } from '../../../composables/usePlaylist'
import { useTranslation } from '../../../composables/useTranslation'

beforeEach(() => {
  useTranslation().setLanguage('de')
})

describe('PlaylistDropzone', () => {
  it('zeigt den Zustand beim Ziehen und meldet nur nicht leere Funde', async () => {
    const wrapper = mount(PlaylistDropzone)
    const zone = wrapper.get('.playlist-config__dropzone')
    await zone.trigger('dragenter')
    expect(zone.classes()).toContain('playlist-config__dropzone--over')

    const item = (name: string) => ({
      webkitGetAsEntry: () => null,
      getAsFile: () => new File(['x'], name),
    })
    await zone.trigger('drop', { dataTransfer: { items: [item('cover.jpg')] } })
    await flushPromises()
    expect(wrapper.emitted('files')).toBeUndefined()
    expect(zone.classes()).not.toContain('playlist-config__dropzone--over')

    await zone.trigger('drop', { dataTransfer: { items: [item('a.mp3')] } })
    await flushPromises()
    expect(wrapper.emitted('files')?.[0]?.[0]).toHaveLength(1)
  })
})

describe('PlaylistTargetLength', () => {
  const { files, excludedFiles } = usePlaylist()
  const { known } = useDurations()

  beforeEach(() => {
    files.value = [new File(['x'], 'a.mp3'), new File(['x'], 'b.mp3')]
    excludedFiles.value = new Set()
    known.clear()
    known.set('a.mp3', 120)
    known.set('b.mp3', 120)
  })

  it('prüft die Eingabe und setzt die Auswahl auf die Ziel-Länge', async () => {
    const wrapper = mount(PlaylistTargetLength)
    const input = wrapper.get('input')
    const note = () => wrapper.get('#target-length-note')

    await input.setValue('0')
    await wrapper.get('form').trigger('submit')
    expect(note().attributes('role')).toBe('alert')
    expect(input.attributes('aria-invalid')).toBe('true')

    await input.setValue('3')
    expect(note().attributes('role')).toBeUndefined()
    await wrapper.get('form').trigger('submit')
    expect(note().attributes('role')).toBeUndefined()
    expect(excludedFiles.value.size).toBe(1)
  })
})

describe('PlaylistNameRow', () => {
  it('meldet den Namen und öffnet die Entwürfe', async () => {
    const wrapper = mount(PlaylistNameRow, {
      props: { playlistName: 'Alt' },
      global: { stubs: { DraftsDialog: true } },
    })
    await wrapper.get('#playlistName').setValue('Neu')
    expect(wrapper.emitted('update:playlistName')).toEqual([['Neu']])
    await wrapper.get('[data-action="drafts-open"]').trigger('click')
    expect(wrapper.findComponent({ name: 'DraftsDialog' }).attributes('open')).toBe('true')
  })
})
