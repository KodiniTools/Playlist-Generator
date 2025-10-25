import { ref, computed } from 'vue'

const translations = {
  de: {
    meta_title: "Audio Playlist Generator - M3U, XSPF & JSON Playlists Erstellen",
    meta_description: "Erstellen Sie einfach und schnell benutzerdefinierte Audio-Playlists (.m3u, .xspf, .json) aus Ihren MP3-, WAV- oder FLAC-Dateien. Sortieren, benennen und laden Sie Ihre Playlist herunter.",
    notice_m3u: "Wichtiger Hinweis für M3U/XSPF-Playlists: Damit Mediaplayer (VLC, Winamp etc.) die Tracks finden, muss die Playlist-Datei im selben Ordner wie Ihre Audio-Dateien gespeichert werden.",
    main_title: "Audio Playlist Generator",
    subtitle: "Erstellen Sie professionelle Playlists mit modernem Design",
    description_text: "Wählen Sie Ihre lokalen Audio-Dateien (MP3, WAV, FLAC) aus, legen Sie die Sortierreihenfolge fest und exportieren Sie Ihre persönliche Playlist im M3U-, XSPF- oder JSON-Format. Ideal, um Ihre Musiksammlung für Mediaplayer wie VLC, Winamp oder Foobar2000 zu organisieren.",
    config_title: "Playlist Konfiguration",
    label_files: "1. Audio Dateien hinzufügen",
    canvas_title: "Interaktive Trackliste",
    button_clear_title: "Liste leeren",
    label_sort: "2. Abspielreihenfolge festlegen",
    sort_alpha: "Alphabetisch",
    sort_date: "Nach Datum",
    sort_random: "Zufällig",
    label_name: "3. Playlist benennen",
    placeholder_name: "Geben Sie einen Namen ein...",
    button_create: "4. Playlist erstellen",
    preview_title: "Vorschau & Speichern",
    label_format: "Vorschau-Format",
    format_m3u: "M3U Playlist",
    format_xspf: "XSPF Playlist",
    format_json: "JSON Datei",
    placeholder_output: "Klicken Sie auf 'Playlist erstellen', um hier eine Vorschau zu sehen...",
    button_save: "Speichern unter...",
    faq_title: "Häufig gestellte Fragen (FAQ)",
    faq_q1_title: "Was ist eine M3U-Datei?",
    faq_q1_text: "Eine M3U-Datei ist eine einfache Textdatei, die die Pfade zu Audio- oder Videodateien auflistet. Sie wird von vielen Mediaplayern (z.B. VLC, Winamp, iTunes) verwendet, um Playlists zu organisieren und abzuspielen.",
    faq_q9_title: "Was ist eine XSPF-Datei?",
    faq_q9_text: "XSPF (XML Shareable Playlist Format) ist ein moderner, offener Standard für Playlists. Im Gegensatz zu M3U ist sie im XML-Format strukturiert, was sie flexibler macht. Sie wird von vielen Playern wie VLC unterstützt und ist ideal, um Playlists zwischen verschiedenen Programmen und Systemen auszutauschen.",
    faq_q2_title: "Welche Audioformate werden unterstützt?",
    faq_q2_text: "Der Generator unterstützt die gängigsten Audioformate: <strong>.mp3</strong>, <strong>.wav</strong> und <strong>.flac</strong>. Andere Dateitypen werden ignoriert.",
    faq_q3_title: "Werden meine Dateien irgendwo hochgeladen?",
    faq_q3_text: "Nein, absolut nicht. Die gesamte Verarbeitung geschieht ausschliesslich lokal in Ihrem Browser. Ihre Audio-Dateien verlassen zu keinem Zeitpunkt Ihren Computer.",
    faq_q4_title: "Warum sind die Pfade in der Playlist nur die Dateinamen?",
    faq_q4_text: "Das Tool verwendet bewusst relative Pfade (nur den Dateinamen). Darum müssen Sie die Playlist-Datei im selben Ordner wie Ihre Musik speichern. Dadurch funktioniert die Playlist auch dann noch, wenn Sie den gesamten Ordner auf einen anderen Computer verschieben.",
    faq_q5_title: "Wofür ist das JSON-Format gut?",
    faq_q5_text: "JSON ist ein Datenformat, das oft von Entwicklern oder in Webanwendungen verwendet wird. Sie könnten eine JSON-Playlist z.B. nutzen, um die Trackliste auf einer Webseite dynamisch anzuzeigen oder in einem eigenen Softwareprojekt zu verarbeiten. Für normale Mediaplayer sind M3U oder XSPF die bessere Wahl.",
    alert_save_error: "Fehler: Die Datei konnte nicht gespeichert werden.",
    alert_create_first: "Bitte erstellen Sie zuerst eine Playlist.",
    more_tools_title: "Entdecken Sie weitere Audio-Tools",
    tool1_title: "Moderner Musikplayer",
    tool1_desc: "Ein stilvoller, moderner Musikplayer mit beeindruckenden Visualisierungen, Playlist-Verwaltung und Unterstützung für lokale Audiodateien.",
    tool2_title: "Grafischer Equalizer",
    tool2_desc: "Passen Sie den Klang Ihrer Musik präzise an. Dieser 10-Band-Grafik-Equalizer ermöglicht es Ihnen, Frequenzen für das perfekte Hörerlebnis zu formen.",
    tool3_title: "Audio-Konverter",
    tool3_desc: "Konvertieren Sie Ihre Audiodateien schnell und einfach zwischen Formaten wie MP3, WAV und FLAC direkt in Ihrem Browser – ohne Uploads.",
    tool_button: "Ausprobieren"
  },
  en: {
    meta_title: "Audio Playlist Generator - Create M3U, XSPF & JSON Playlists",
    meta_description: "Easily and quickly create custom audio playlists (.m3u, .xspf, .json) from your MP3, WAV, or FLAC files. Sort, name, and download your playlist.",
    notice_m3u: "Important Notice for M3U/XSPF Playlists: For media players (VLC, Winamp, etc.) to find the tracks, the playlist file must be saved in the same folder as your audio files.",
    main_title: "Audio Playlist Generator",
    subtitle: "Create professional playlists with a modern design",
    description_text: "Select your local audio files (MP3, WAV, FLAC), define the sorting order, and export your personal playlist in M3U, XSPF or JSON format. Ideal for organizing your music collection for media players like VLC, Winamp, or Foobar2000.",
    config_title: "Playlist Configuration",
    label_files: "1. Add Audio Files",
    canvas_title: "Interactive Track List",
    button_clear_title: "Clear List",
    label_sort: "2. Set Playback Order",
    sort_alpha: "Alphabetical",
    sort_date: "By Date",
    sort_random: "Random",
    label_name: "3. Name Playlist",
    placeholder_name: "Enter a name...",
    button_create: "4. Create Playlist",
    preview_title: "Preview & Save",
    label_format: "Preview Format",
    format_m3u: "M3U Playlist",
    format_xspf: "XSPF Playlist",
    format_json: "JSON File",
    placeholder_output: "Click 'Create Playlist' to see a preview here...",
    button_save: "Save As...",
    faq_title: "Frequently Asked Questions (FAQ)",
    faq_q1_title: "What is an M3U file?",
    faq_q1_text: "An M3U file is a plain text file that lists the paths to audio or video files. It is used by many media players (e.g., VLC, Winamp, iTunes) to organize and play playlists.",
    faq_q9_title: "What is an XSPF file?",
    faq_q9_text: "XSPF (XML Shareable Playlist Format) is a modern, open standard for playlists. Unlike M3U, it is structured in XML format, which makes it more flexible. It is supported by many players like VLC and is ideal for sharing playlists between different programs and systems.",
    faq_q2_title: "Which audio formats are supported?",
    faq_q2_text: "The generator supports the most common audio formats: <strong>.mp3</strong>, <strong>.wav</strong>, and <strong>.flac</strong>. Other file types will be ignored.",
    faq_q3_title: "Are my files uploaded anywhere?",
    faq_q3_text: "No, absolutely not. All processing happens exclusively locally in your browser. Your audio files never leave your computer.",
    faq_q4_title: "Why are the paths in the playlist just the filenames?",
    faq_q4_text: "The tool intentionally uses relative paths (just the filename). This is why you need to save the playlist file in the same folder as your music. This allows the playlist to work even if you move the entire folder to another computer.",
    faq_q5_title: "What is the JSON format good for?",
    faq_q5_text: "JSON is a data format often used by developers or in web applications. You could use a JSON playlist to dynamically display the track list on a website or to process it in your own software project. For regular media players, M3U or XSPF is the better choice.",
    alert_save_error: "Error: The file could not be saved.",
    alert_create_first: "Please create a playlist first.",
    more_tools_title: "Discover More Audio Tools",
    tool1_title: "Modern Music Player",
    tool1_desc: "A stylish, modern music player with stunning visualizations, playlist management, and support for local audio files.",
    tool2_title: "Graphic Equalizer",
    tool2_desc: "Precisely adjust your music's sound. This 10-band graphic equalizer allows you to shape frequencies for the perfect listening experience.",
    tool3_title: "Audio Converter",
    tool3_desc: "Quickly and easily convert your audio files between formats like MP3, WAV, and FLAC directly in your browser—no uploads required.",
    tool_button: "Try It Out"
  }
}

const currentLanguage = ref(localStorage.getItem('language') || (navigator.language.startsWith('de') ? 'de' : 'en'))

export function useTranslation() {
  const t = computed(() => (key) => {
    return translations[currentLanguage.value]?.[key] || key
  })

  const setLanguage = (lang) => {
    currentLanguage.value = lang
    localStorage.setItem('language', lang)
    document.documentElement.lang = lang
  }

  return {
    currentLanguage,
    t,
    setLanguage
  }
}
