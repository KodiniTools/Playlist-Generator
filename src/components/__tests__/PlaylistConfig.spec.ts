import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PlaylistConfig from '../PlaylistConfig.vue'
import { useDurations } from '../../composables/useDurations'
import { usePlaylist } from '../../composables/usePlaylist'
import { useTranslation } from '../../composables/useTranslation'

// Dauern werden über <audio> und Blob-URLs gelesen, beides kennt jsdom nicht.
vi.mock('../../composables/useDurations', async () => {
  const { reactive } = await import('vue')
  const known = reactive(new Map<string, number>())
  const measureDurations = vi.fn(async () => {})
  return {
    useDurations: () => ({
      known,
      measureDurations,
      getDuration: (name: string) => known.get(name) ?? null,
      setDuration: vi.fn(),
    }),
  }
})

const { known, measureDurations } = useDurations()
const { files, excludedFiles, isFileSelected, clearHistory } = usePlaylist()

const makeFile = (name: string, size: number) =>
  new File([new Uint8Array(size)], name, { type: 'audio/mpeg' })

type Props = InstanceType<typeof PlaylistConfig>['$props']

function mountConfig(props: Partial<Props> = {}) {
  return mount(PlaylistConfig, {
    props: {
      files: files.value,
      sortOption: 'manual',
      playlistName: '',
      replaceMode: false,
      selectedFileIndex: -1,
      ...props,
    },
  })
}

describe('PlaylistConfig', () => {
  beforeEach(() => {
    useTranslation().setLanguage('de')
    files.value = [
      makeFile('Summer_Mix.mp3', 2048),
      makeFile('Chill_Vibes.mp3', 4096),
      makeFile('Road_Trip.flac', 8192),
    ]
    excludedFiles.value = new Set()
    clearHistory()
    known.clear()
    known.set('Summer_Mix.mp3', 221)
    vi.mocked(measureDurations).mockClear()
  })

  it('zeigt die Dateien als Liste im Panel und liest Dauern aus', () => {
    const wrapper = mountConfig()
    expect(wrapper.get('.ui-panel__title').text()).toBe('Dateien')
    expect(wrapper.get('.ui-panel__count').text()).toBe('3')

    const rows = wrapper.findAll('.ui-file-list__row')
    expect(rows.map((row) => row.get('.ui-file-list__name-text').text())).toEqual([
      'Summer_Mix.mp3',
      'Chill_Vibes.mp3',
      'Road_Trip.flac',
    ])
    expect(rows.at(0)?.get('.ui-file-list__duration').text()).toBe('3:41')
    expect(rows.at(1)?.get('.ui-file-list__duration').text()).toBe('–')
    expect(measureDurations).toHaveBeenCalledWith(files.value)
  })

  it('meldet Sortierung, Namen und Ersetzen-Modus an die AppPage', async () => {
    const wrapper = mountConfig()
    await wrapper.get('[data-value="date"]').trigger('click')
    expect(wrapper.emitted('update:sortOption')).toEqual([['date']])

    await wrapper.get('#playlistName').setValue('Sommer Mix 2026')
    expect(wrapper.emitted('update:playlistName')).toEqual([['Sommer Mix 2026']])

    await wrapper.get('.playlist-config__replace input').setValue(true)
    expect(wrapper.emitted('update:replaceMode')).toEqual([[true]])
  })

  it('reicht Auswahl, Abspielen, Entfernen, Verschieben und Leeren durch', async () => {
    const wrapper = mountConfig({ selectedFileIndex: 1 })
    const row = wrapper.get('[data-index="1"]')

    await row.trigger('click')
    expect(wrapper.emitted('update:selectedFileIndex')).toEqual([[1]])

    await row.trigger('dblclick')
    expect(wrapper.emitted('playFile')).toEqual([[1]])

    await row.findAll('.ui-icon-button').at(1)?.trigger('click')
    expect(wrapper.emitted('removeFile')).toEqual([[1]])

    await row.trigger('keydown', { key: 'ArrowDown', altKey: true })
    expect(wrapper.emitted('moveFile')).toEqual([[1, 2]])

    const clearButton = wrapper
      .findAll('.ui-button')
      .find((button) => button.text() === 'Liste leeren')
    await clearButton?.trigger('click')
    expect(wrapper.emitted('clearFiles')).toHaveLength(1)
  })

  it('schreibt Häkchen in usePlaylist', async () => {
    const wrapper = mountConfig()
    const second = files.value.at(1)
    expect(second).toBeDefined()

    await wrapper.get('[data-index="1"] input[type="checkbox"]').setValue(false)
    expect(isFileSelected(second!)).toBe(false)
    expect(wrapper.get('.ui-file-list__count').text()).toBe('2/3')

    // Teilauswahl: "Alle auswählen" ist indeterminate, der nächste Klick nimmt alle auf
    const selectAll = wrapper.get('.ui-file-list__select-all input')
    await selectAll.setValue(true)
    expect(excludedFiles.value.size).toBe(0)

    await selectAll.setValue(false)
    expect(excludedFiles.value.size).toBe(3)
  })

  it('öffnet den Dateidialog über den Button und über openFileDialog', async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {})
    const wrapper = mountConfig()

    await wrapper.get('.ui-button--primary').trigger('click')
    expect(click).toHaveBeenCalledTimes(1)

    const exposed = wrapper.vm as unknown as { openFileDialog: () => void }
    exposed.openFileDialog()
    expect(click).toHaveBeenCalledTimes(2)
    click.mockRestore()
  })

  it('nimmt Dateien aus Dialog und Drop entgegen', async () => {
    const wrapper = mountConfig()
    await wrapper.get('#fileInput').trigger('change')
    expect(wrapper.emitted('addFiles')).toHaveLength(1)

    const dropped = makeFile('Evening_Jazz.wav', 512)
    const ignored = makeFile('cover.jpg', 128)
    const item = (file: File) => ({ webkitGetAsEntry: () => null, getAsFile: () => file })
    await wrapper.get('.playlist-config__dropzone').trigger('drop', {
      dataTransfer: { items: [item(dropped), item(ignored)] },
    })
    await flushPromises()
    expect(wrapper.emitted('addFiles')?.at(1)).toEqual([[dropped]])
    expect(wrapper.get('.playlist-config__dropzone').classes()).not.toContain(
      'playlist-config__dropzone--over',
    )
  })

  it('zeigt ohne Dateien den Leerzustand und keinen Ersetzen-Schalter', () => {
    files.value = []
    const wrapper = mountConfig({ files: [] })
    expect(wrapper.get('.ui-empty__title').text()).toBe('Noch keine Dateien')
    expect(wrapper.find('.playlist-config__replace').exists()).toBe(false)
    expect(wrapper.get('.ui-panel__count').text()).toBe('0')
  })
})
