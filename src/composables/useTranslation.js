import { ref, computed, onUnmounted } from 'vue'

const translations = {
  de: {
    // Meta tags
    meta_title: "Audio Playlist Generator - M3U, XSPF & JSON Playlists Erstellen",
    meta_description: "Erstellen Sie einfach und schnell benutzerdefinierte Audio-Playlists (.m3u, .xspf, .json) aus Ihren MP3-, WAV- oder FLAC-Dateien. Sortieren, benennen und laden Sie Ihre Playlist herunter.",

    // Navigation
    nav_home: "Start",
    nav_app: "App",
    nav_faq: "FAQ",
    nav_blog: "Blog",

    // Landing Page - Hero
    hero_title: "Audio Playlist Generator",
    hero_subtitle: "Erstellen Sie professionelle Playlists in Sekunden",
    hero_description: "Verwandeln Sie Ihre lokalen Audiodateien in perfekt organisierte Playlists. Unterstützt M3U, XSPF und JSON – kostenlos und 100% lokal in Ihrem Browser.",
    hero_cta: "Jetzt starten",
    hero_learn_more: "Mehr erfahren",

    // Feature Cards
    feature1_title: "Mehrere Formate",
    feature1_desc: "Exportieren Sie Ihre Playlists in M3U, XSPF oder JSON – kompatibel mit VLC, Winamp, iTunes und mehr.",
    feature2_title: "100% Privat",
    feature2_desc: "Alle Dateien werden lokal verarbeitet. Keine Uploads, keine Server – Ihre Musik bleibt auf Ihrem Gerät.",
    feature3_title: "Flexible Sortierung",
    feature3_desc: "Ordnen Sie Tracks alphabetisch, nach Datum, zufällig oder per Drag & Drop nach Ihren Wünschen.",

    // Details Section
    details_title: "Leistungsstarke Funktionen",
    details_subtitle: "Alles, was Sie für perfekte Playlists brauchen",

    detail1_title: "Drag & Drop Upload",
    detail1_desc: "Ziehen Sie einfach Ihre MP3-, WAV- oder FLAC-Dateien in den Browser – keine komplizierte Auswahl nötig.",
    detail2_title: "Interaktive Trackliste",
    detail2_desc: "Visualisieren und bearbeiten Sie Ihre Playlist in Echtzeit mit unserer Canvas-basierten Oberfläche.",
    detail3_title: "Schnelle Tastenkombinationen",
    detail3_desc: "Strg+O zum Öffnen, Strg+S zum Speichern, Strg+C zum Kopieren – arbeiten Sie wie ein Profi.",
    detail4_title: "Theme-Wechsler",
    detail4_desc: "Wechseln Sie zwischen hellem und dunklem Design – perfekt für jede Umgebung.",
    detail5_title: "Mehrsprachig",
    detail5_desc: "Verfügbar auf Deutsch und Englisch – wechseln Sie die Sprache mit einem Klick.",
    detail6_title: "Keine Installation",
    detail6_desc: "Funktioniert direkt im Browser – kein Download, keine Installation erforderlich.",

    // CTA Section
    cta_title: "Bereit, loszulegen?",
    cta_desc: "Erstellen Sie jetzt Ihre erste Playlist – kostenlos und ohne Registrierung.",
    cta_button: "Playlist erstellen",

    // App Page
    notice_m3u: "Wichtiger Hinweis für M3U/XSPF-Playlists: Damit Mediaplayer (VLC, Winamp etc.) die Tracks finden, muss die Playlist-Datei im selben Ordner wie Ihre Audio-Dateien gespeichert werden.",
    main_title: "Audio Playlist Generator",
    subtitle: "Erstellen Sie professionelle Playlists mit modernem Design",
    description_text: "Wählen Sie Ihre lokalen Audio-Dateien (MP3, WAV, FLAC) aus, legen Sie die Sortierreihenfolge fest und exportieren Sie Ihre persönliche Playlist im M3U-, XSPF- oder JSON-Format. Ideal, um Ihre Musiksammlung für Mediaplayer wie VLC, Winamp oder Foobar2000 zu organisieren.",
    config_title: "Playlist Konfiguration",
    label_files: "1. Audio Dateien hinzufügen",
    click_to_upload: "dateien auswählen oder hierher ziehen...",
    drop_files_here: "dateien hier ablegen...",
    files_selected: "dateien ausgewählt",
    canvas_title: "interaktive trackliste",
    button_clear_title: "Liste leeren",
    stats_tracks: "Tracks",
    label_sort: "2. Abspielreihenfolge festlegen",
    sort_alpha: "Alphabetisch",
    sort_date: "Nach Datum",
    sort_random: "Zufällig",
    sort_manual: "Manuell (Drag & Drop)",
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
    button_copy: "Kopieren",

    // FAQ Page
    faq_page_title: "Häufig gestellte Fragen",
    faq_page_subtitle: "Alles, was Sie über den Audio Playlist Generator wissen müssen",
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
    faq_q6_title: "Welche Browser werden unterstützt?",
    faq_q6_text: "Der Audio Playlist Generator funktioniert in allen modernen Browsern (Chrome, Firefox, Safari, Edge). Die Speicherfunktion nutzt die File System Access API und ist am besten in Chrome und Edge verfügbar.",
    faq_q7_title: "Ist der Generator kostenlos?",
    faq_q7_text: "Ja, der Audio Playlist Generator ist vollständig kostenlos und erfordert keine Registrierung. Wenn Ihnen das Tool gefällt, können Sie uns gerne mit einer kleinen Spende unterstützen.",
    faq_q8_title: "Kann ich den Generator offline nutzen?",
    faq_q8_text: "Da die gesamte Verarbeitung lokal in Ihrem Browser stattfindet, benötigen Sie nur für den ersten Zugriff eine Internetverbindung. Sobald die Seite geladen ist, können Sie auch ohne Internet Playlists erstellen.",

    // Privacy Notice
    privacy_title: "Datenschutz-Hinweis",
    privacy_text: "Der Audio Playlist Generator verarbeitet alle Daten lokal in Ihrem Browser. Es werden keine Dateien auf Server hochgeladen und keine persönlichen Daten gespeichert. Die einzigen gespeicherten Daten sind Ihre Theme- und Sprachpräferenzen im lokalen Speicher Ihres Browsers.",

    // Toast Messages
    alert_save_error: "Fehler: Die Datei konnte nicht gespeichert werden.",
    alert_create_first: "Bitte erstellen Sie zuerst eine Playlist.",
    toast_files_added: "{count} Dateien hinzugefügt",
    toast_duplicates_skipped: "{count} Duplikate übersprungen",
    toast_playlist_saved: "Playlist gespeichert ✓",
    toast_copied: "In Zwischenablage kopiert ✓",
    toast_copy_error: "Kopieren fehlgeschlagen",
    replace_list_option: "Bestehende Liste ersetzen",

    // Shortcuts
    shortcut_open: "Dateien öffnen (Strg+O)",
    shortcut_save: "Speichern (Strg+S)",
    shortcut_copy: "Kopieren (Strg+C)",

    // Audio Player
    player_title: "Vorschau-Player",
    player_no_track: "Kein Track ausgewählt",
    player_play: "Abspielen",
    player_pause: "Pause",
    player_stop: "Stopp",
    player_previous: "Vorheriger Track",
    player_next: "Nächster Track",
    player_mute: "Stummschalten",
    player_unmute: "Ton einschalten",

    // Tools Section
    more_tools_title: "Entdecken Sie weitere Audio-Tools",
    tool1_title: "Moderner Musikplayer",
    tool1_desc: "Ein stilvoller, moderner Musikplayer mit beeindruckenden Visualisierungen, Playlist-Verwaltung und Unterstützung für lokale Audiodateien.",
    tool2_title: "Grafischer Equalizer",
    tool2_desc: "Passen Sie den Klang Ihrer Musik präzise an. Dieser 10-Band-Grafik-Equalizer ermöglicht es Ihnen, Frequenzen für das perfekte Hörerlebnis zu formen.",
    tool3_title: "Audio-Konverter",
    tool3_desc: "Konvertieren Sie Ihre Audiodateien schnell und einfach zwischen Formaten wie MP3, WAV und FLAC direkt in Ihrem Browser – ohne Uploads.",
    tool_button: "Ausprobieren",

    // Footer
    donate_button: "spenden",
    donate_title: "Mit PayPal spenden",
    footer_copyright: "Audio Playlist Generator"
  },
  en: {
    // Meta tags
    meta_title: "Audio Playlist Generator - Create M3U, XSPF & JSON Playlists",
    meta_description: "Easily and quickly create custom audio playlists (.m3u, .xspf, .json) from your MP3, WAV, or FLAC files. Sort, name, and download your playlist.",

    // Navigation
    nav_home: "Home",
    nav_app: "App",
    nav_faq: "FAQ",
    nav_blog: "Blog",

    // Landing Page - Hero
    hero_title: "Audio Playlist Generator",
    hero_subtitle: "Create professional playlists in seconds",
    hero_description: "Transform your local audio files into perfectly organized playlists. Supports M3U, XSPF, and JSON – free and 100% local in your browser.",
    hero_cta: "Get Started",
    hero_learn_more: "Learn More",

    // Feature Cards
    feature1_title: "Multiple Formats",
    feature1_desc: "Export your playlists to M3U, XSPF, or JSON – compatible with VLC, Winamp, iTunes, and more.",
    feature2_title: "100% Private",
    feature2_desc: "All files are processed locally. No uploads, no servers – your music stays on your device.",
    feature3_title: "Flexible Sorting",
    feature3_desc: "Arrange tracks alphabetically, by date, randomly, or drag & drop to your preference.",

    // Details Section
    details_title: "Powerful Features",
    details_subtitle: "Everything you need for perfect playlists",

    detail1_title: "Drag & Drop Upload",
    detail1_desc: "Simply drag your MP3, WAV, or FLAC files into the browser – no complicated selection needed.",
    detail2_title: "Interactive Track List",
    detail2_desc: "Visualize and edit your playlist in real-time with our canvas-based interface.",
    detail3_title: "Fast Keyboard Shortcuts",
    detail3_desc: "Ctrl+O to open, Ctrl+S to save, Ctrl+C to copy – work like a pro.",
    detail4_title: "Theme Switcher",
    detail4_desc: "Switch between light and dark design – perfect for any environment.",
    detail5_title: "Multilingual",
    detail5_desc: "Available in German and English – switch languages with one click.",
    detail6_title: "No Installation",
    detail6_desc: "Works directly in the browser – no download, no installation required.",

    // CTA Section
    cta_title: "Ready to get started?",
    cta_desc: "Create your first playlist now – free and without registration.",
    cta_button: "Create Playlist",

    // App Page
    notice_m3u: "Important Notice for M3U/XSPF Playlists: For media players (VLC, Winamp, etc.) to find the tracks, the playlist file must be saved in the same folder as your audio files.",
    main_title: "Audio Playlist Generator",
    subtitle: "Create professional playlists with a modern design",
    description_text: "Select your local audio files (MP3, WAV, FLAC), define the sorting order, and export your personal playlist in M3U, XSPF or JSON format. Ideal for organizing your music collection for media players like VLC, Winamp, or Foobar2000.",
    config_title: "Playlist Configuration",
    label_files: "1. add audio files",
    click_to_upload: "choose files or drag here...",
    drop_files_here: "drop files here...",
    files_selected: "files selected",
    canvas_title: "interactive track list",
    button_clear_title: "Clear List",
    stats_tracks: "Tracks",
    label_sort: "2. Set Playback Order",
    sort_alpha: "Alphabetical",
    sort_date: "By Date",
    sort_random: "Random",
    sort_manual: "Manual (Drag & Drop)",
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
    button_copy: "Copy",

    // FAQ Page
    faq_page_title: "Frequently Asked Questions",
    faq_page_subtitle: "Everything you need to know about the Audio Playlist Generator",
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
    faq_q6_title: "Which browsers are supported?",
    faq_q6_text: "The Audio Playlist Generator works in all modern browsers (Chrome, Firefox, Safari, Edge). The save function uses the File System Access API and works best in Chrome and Edge.",
    faq_q7_title: "Is the generator free?",
    faq_q7_text: "Yes, the Audio Playlist Generator is completely free and requires no registration. If you like the tool, feel free to support us with a small donation.",
    faq_q8_title: "Can I use the generator offline?",
    faq_q8_text: "Since all processing takes place locally in your browser, you only need an internet connection for the initial access. Once the page is loaded, you can create playlists even without internet.",

    // Privacy Notice
    privacy_title: "Privacy Notice",
    privacy_text: "The Audio Playlist Generator processes all data locally in your browser. No files are uploaded to servers and no personal data is stored. The only stored data are your theme and language preferences in your browser's local storage.",

    // Toast Messages
    alert_save_error: "Error: The file could not be saved.",
    alert_create_first: "Please create a playlist first.",
    toast_files_added: "{count} files added",
    toast_duplicates_skipped: "{count} duplicates skipped",
    toast_playlist_saved: "Playlist saved ✓",
    toast_copied: "Copied to clipboard ✓",
    toast_copy_error: "Copy failed",
    replace_list_option: "Replace existing list",

    // Shortcuts
    shortcut_open: "Open files (Ctrl+O)",
    shortcut_save: "Save (Ctrl+S)",
    shortcut_copy: "Copy (Ctrl+C)",

    // Audio Player
    player_title: "Preview Player",
    player_no_track: "No track selected",
    player_play: "Play",
    player_pause: "Pause",
    player_stop: "Stop",
    player_previous: "Previous track",
    player_next: "Next track",
    player_mute: "Mute",
    player_unmute: "Unmute",

    // Tools Section
    more_tools_title: "Discover More Audio Tools",
    tool1_title: "Modern Music Player",
    tool1_desc: "A stylish, modern music player with stunning visualizations, playlist management, and support for local audio files.",
    tool2_title: "Graphic Equalizer",
    tool2_desc: "Precisely adjust your music's sound. This 10-band graphic equalizer allows you to shape frequencies for the perfect listening experience.",
    tool3_title: "Audio Converter",
    tool3_desc: "Quickly and easily convert your audio files between formats like MP3, WAV, and FLAC directly in your browser—no uploads required.",
    tool_button: "Try It Out",

    // Footer
    donate_button: "donate",
    donate_title: "Donate with PayPal",
    footer_copyright: "Audio Playlist Generator"
  }
}

// Read from 'locale' (global nav key) with fallback to 'language' (legacy key)
const storedLang = localStorage.getItem('locale') || localStorage.getItem('language')
const currentLanguage = ref(storedLang || (navigator.language.startsWith('de') ? 'de' : 'en'))

// Ensure both keys are in sync on initialization
if (currentLanguage.value) {
  localStorage.setItem('locale', currentLanguage.value)
}

export function useTranslation() {
  const t = computed(() => (key) => {
    return translations[currentLanguage.value]?.[key] || key
  })

  const setLanguage = (lang) => {
    currentLanguage.value = lang
    // Write to both keys for compatibility with global nav and legacy code
    localStorage.setItem('locale', lang)
    localStorage.setItem('language', lang)
    document.documentElement.lang = lang
  }

  // Listen for language-changed events from the global navigation (SSI include)
  const handleGlobalLanguageChange = (e) => {
    const newLang = e.detail?.lang
    if (newLang && newLang !== currentLanguage.value) {
      setLanguage(newLang)
    }
  }

  window.addEventListener('language-changed', handleGlobalLanguageChange)

  onUnmounted(() => {
    window.removeEventListener('language-changed', handleGlobalLanguageChange)
  })

  return {
    currentLanguage,
    t,
    setLanguage
  }
}
