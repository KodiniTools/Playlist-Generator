import { computed, ref } from 'vue'
import { usePlaylist } from './usePlaylist'
import { useToast } from './useToast'
import { useTranslation } from './useTranslation'
import { fileExtensionOf } from '../utils/playlistFormats'
import { FORMAT_MIME, openInTextEditor } from '../utils/textEditorHandoff'
import { IS_DESKTOP } from '../utils/desktop'

export type HandoffReason = 'saved' | 'copied'

/**
 * Übergabe an den Kodini Texteditor: Nach Kopieren oder Speichern fragt ein
 * Dialog, ob die Datei dort weiterbearbeitet werden soll. Annehmen legt sie ab
 * und öffnet den Editor; ohne Inhalt wird nichts angeboten. In der Desktop-App
 * nie: Sie teilt keinen localStorage mit kodinitools.com, die Übergabe käme nicht an.
 */
export function useTextEditorHandoff() {
  const { t } = useTranslation()
  const toast = useToast()
  const { playlistName, playlistContent, outputFormat } = usePlaylist()

  const handoffOffer = ref<HandoffReason | null>(null)

  const handoffFileName = computed(
    () => `${playlistName.value.trim() || 'playlist'}.${fileExtensionOf(outputFormat.value)}`,
  )

  const handoffDescription = computed(() =>
    t
      .value(handoffOffer.value === 'saved' ? 'handoff_text_saved' : 'handoff_text_copied')
      .replace('{name}', handoffFileName.value),
  )

  const offerTextEditor = (reason: HandoffReason) => {
    if (IS_DESKTOP || !playlistContent.value) return
    handoffOffer.value = reason
  }

  const declineHandoff = () => {
    handoffOffer.value = null
  }

  const acceptHandoff = () => {
    const opened = openInTextEditor({
      name: handoffFileName.value,
      content: playlistContent.value,
      mimeType: FORMAT_MIME[outputFormat.value],
    })
    handoffOffer.value = null
    if (!opened) toast.error(t.value('handoff_error'))
  }

  return { handoffOffer, handoffDescription, offerTextEditor, declineHandoff, acceptHandoff }
}
