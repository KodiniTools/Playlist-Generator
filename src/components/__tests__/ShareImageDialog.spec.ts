import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ShareImageDialog from '../ShareImageDialog.vue'
import { usePlaylist } from '../../composables/usePlaylist'
import { useToast } from '../../composables/useToast'
import { useTranslation } from '../../composables/useTranslation'
import {
  BackgroundImageError,
  defaultShareColors,
  loadBackgroundImage,
  renderShareImage,
} from '../../utils/shareImage'

vi.mock('../../utils/shareImage', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../utils/shareImage')>()),
  renderShareImage: vi.fn(async () => new Blob(['png'], { type: 'image/png' })),
  loadBackgroundImage: vi.fn(),
}))

const render = vi.mocked(renderShareImage)
const loadImage = vi.mocked(loadBackgroundImage)

/** Wählt eine Datei im versteckten Datei-Input. */
async function pickFile(wrapper: ReturnType<typeof mountDialog>, file: File) {
  const input = wrapper.get('[data-input="background-image"]')
  Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
  await input.trigger('change')
  await flushPromises()
}
const { files, playlistName, excludedFiles } = usePlaylist()
const { toasts } = useToast()

const mountDialog = () =>
  mount(ShareImageDialog, { props: { open: true }, global: { stubs: { teleport: true } } })

describe('ShareImageDialog', () => {
  beforeEach(() => {
    useTranslation().setLanguage('de')
    render.mockClear()
    toasts.value.splice(0)
    playlistName.value = 'Sommer Mix'
    const a = new File(['a'], 'a.mp3')
    const b = new File(['b'], 'b.mp3')
    files.value = [a, b]
    excludedFiles.value = new Set([b])
    URL.createObjectURL = vi.fn(() => 'blob:preview')
    URL.revokeObjectURL = vi.fn()
    document.body.classList.remove('light-theme')
  })

  afterEach(() => {
    files.value = []
    excludedFiles.value = new Set()
  })

  it('rendert nur angehakte Titel, als Story im aktuellen Theme', async () => {
    document.body.classList.add('light-theme')
    const wrapper = mountDialog()
    await flushPromises()

    expect(render).toHaveBeenCalledTimes(1)
    const [data, format, theme, type] = render.mock.calls[0]!
    expect(data.name).toBe('Sommer Mix')
    expect(data.tracks.map((t) => t.title)).toEqual(['a'])
    expect(data.meta).toMatch(/^1 Titel · /)
    expect([format, theme, type]).toEqual(['story', 'light', 'image/png'])
    expect(wrapper.get('img').attributes('src')).toBe('blob:preview')
    expect(wrapper.get('img').attributes('width')).toBe('1080')
  })

  it('rendert neu bei Format- und Dateityp-Wechsel', async () => {
    const wrapper = mountDialog()
    await flushPromises()
    const radios = wrapper.findAll('[role="radio"]')
    await radios.find((r) => r.text() === 'Post 1:1')!.trigger('click')
    await radios.find((r) => r.text() === 'JPEG')!.trigger('click')
    await flushPromises()

    const last = render.mock.calls.at(-1)!
    expect(last[1]).toBe('post')
    expect(last[3]).toBe('image/jpeg')
    expect(wrapper.get('img').attributes('height')).toBe('1080')
  })

  it('lädt das Bild mit passendem Dateinamen herunter', async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const wrapper = mountDialog()
    await flushPromises()
    await wrapper.get('[data-action="download"]').trigger('click')

    const link = click.mock.contexts[0] as HTMLAnchorElement
    expect(link.download).toBe('Sommer Mix-story.png')
    expect(link.href).toBe('blob:preview')
    expect(toasts.value.map((t) => t.message)).toContain('Bild gespeichert')
    click.mockRestore()
  })

  it('meldet Fehler beim Erzeugen', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    render.mockRejectedValueOnce(new Error('kein Canvas'))
    const wrapper = mountDialog()
    await flushPromises()
    expect(wrapper.find('img').exists()).toBe(false)
    expect(toasts.value.map((t) => t.type)).toEqual(['error'])
  })

  it('übernimmt eigene Text- und Hintergrundfarben und setzt sie zurück', async () => {
    const wrapper = mountDialog()
    await flushPromises()
    expect(wrapper.get('[data-action="reset-colors"]').attributes('disabled')).toBeDefined()

    await wrapper.get('[data-color="text"]').setValue('#222222')
    await wrapper.get('[data-color="background"]').setValue('#ffcc00')
    await flushPromises()
    expect(render.mock.calls.at(-1)![4]).toEqual({ text: '#222222', background: '#ffcc00' })
    expect(wrapper.find('.ui-callout').exists()).toBe(false)

    await wrapper.get('[data-action="reset-colors"]').trigger('click')
    await flushPromises()
    expect(render.mock.calls.at(-1)![4]).toEqual(defaultShareColors('dark'))
  })

  it('warnt bei zu wenig Kontrast', async () => {
    const wrapper = mountDialog()
    await wrapper.get('[data-color="text"]').setValue('#777777')
    await wrapper.get('[data-color="background"]').setValue('#888888')
    expect(wrapper.get('.ui-callout').text()).toContain('Geringer Kontrast')
  })

  it('startet beim Wechsel des Farbschemas mit dessen Farben', async () => {
    const wrapper = mountDialog()
    await wrapper.get('[data-color="text"]').setValue('#123456')
    const light = wrapper.findAll('[role="radio"]').find((r) => r.text() === 'Hell')!
    await light.trigger('click')
    await flushPromises()
    expect(render.mock.calls.at(-1)![4]).toEqual(defaultShareColors('light'))
    expect((wrapper.get('[data-color="text"]').element as HTMLInputElement).value).toBe(
      defaultShareColors('light').text,
    )
  })

  it('legt ein Hintergrundbild mit einstellbarer Deckkraft unter den Text', async () => {
    const bitmap = { width: 1200, height: 1800, close: vi.fn() } as unknown as ImageBitmap
    loadImage.mockResolvedValueOnce(bitmap)
    const wrapper = mountDialog()
    await flushPromises()
    expect(wrapper.text()).toContain('PNG, JPEG oder WebP')

    await pickFile(wrapper, new File(['x'], 'strand.jpg', { type: 'image/jpeg' }))
    expect(render.mock.calls.at(-1)![5]).toEqual({ image: bitmap, opacity: 0.6 })
    expect(wrapper.text()).toContain('strand.jpg')

    await wrapper.get('[data-input="background-opacity"]').setValue('25')
    await flushPromises()
    expect(render.mock.calls.at(-1)![5]).toEqual({ image: bitmap, opacity: 0.25 })
    expect(wrapper.text()).toContain('25 %')

    await wrapper.get('[data-action="remove-background"]').trigger('click')
    await flushPromises()
    expect(render.mock.calls.at(-1)![5]).toBeNull()
    expect(bitmap.close).toHaveBeenCalled()
  })

  it('meldet ungeeignete Bilder', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    loadImage.mockRejectedValueOnce(new BackgroundImageError('type'))
    const wrapper = mountDialog()
    await flushPromises()
    await pickFile(wrapper, new File(['x'], 'bild.gif', { type: 'image/gif' }))
    expect(toasts.value.map((t) => t.message)).toContain(
      'Bitte ein PNG-, JPEG- oder WebP-Bild wählen.',
    )
    expect(wrapper.find('[data-action="remove-background"]').exists()).toBe(false)
  })

  it('blendet den Kontrast-Hinweis aus, solange ein Foto den Hintergrund bildet', async () => {
    loadImage.mockResolvedValueOnce({
      width: 10,
      height: 10,
      close: vi.fn(),
    } as unknown as ImageBitmap)
    const wrapper = mountDialog()
    await wrapper.get('[data-color="text"]').setValue('#777777')
    await wrapper.get('[data-color="background"]').setValue('#888888')
    expect(wrapper.find('.ui-callout').exists()).toBe(true)
    await pickFile(wrapper, new File(['x'], 'foto.png', { type: 'image/png' }))
    expect(wrapper.find('.ui-callout').exists()).toBe(false)
  })
})
