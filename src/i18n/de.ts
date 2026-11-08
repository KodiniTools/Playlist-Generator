/**
 * Deutsche Texte; Referenz für alle Schlüssel. Neue Schlüssel zuerst hier
 * eintragen, `en.ts` meldet fehlende oder überzählige Schlüssel dann als Typfehler.
 */
const de = {
  // Navigation
  nav_home: 'Startseite',
  nav_app: 'App',
  nav_faq: 'FAQ',
  nav_blog: 'Blog',
  nav_label: 'Seiten',

  // Desktop-App: Leiste statt der Server-Navigation
  desktop_bar_label: 'Einstellungen',
  desktop_language: 'Sprache',
  desktop_theme: 'Farbschema',
  desktop_theme_dark: 'Dunkel',
  desktop_theme_light: 'Hell',

  // Download-Seite (Windows-App)
  nav_download: 'Download',
  meta_title_download: 'Playlist Generator für Windows herunterladen – kostenlose Desktop-App',
  meta_description_download:
    'Den Audio Wiedergabeliste Generator als kostenlose Windows-App: Installer (.exe) oder MSI-Paket für Windows 10 und 11. Wiedergabelisten lokal auf dem PC erstellen.',
  download_eyebrow: 'Windows-App',
  download_title: 'Playlist Generator für Windows',
  download_subtitle:
    'Alle Funktionen des Wiedergabeliste Generators als App auf Ihrem PC – mit eigenem Fenster, Startmenü-Eintrag und ohne Internet nutzbar.',
  download_requirements: 'Windows 10 oder 11 · 64-Bit · ca. 10 MB Speicherplatz',
  download_files_label: 'Download-Dateien',
  download_recommended: 'Empfohlen',
  download_button: '{ext} herunterladen',
  download_size_note:
    'Jede Datei ist nur rund 2 MB groß, Sie brauchen nur eine davon. Für die meisten ist der Installer (.exe) richtig.',
  download_exe_title: 'Installer (.exe)',
  download_exe_desc:
    'Für die meisten Nutzer: Installation ohne Administratorrechte, Sprache Deutsch oder Englisch wählbar.',
  download_msi_de_title: 'MSI-Paket Deutsch',
  download_msi_de_desc:
    'Für IT-Abteilungen und Softwareverteilung, Installationsdialog auf Deutsch.',
  download_msi_en_title: 'MSI-Paket Englisch',
  download_msi_en_desc:
    'Für IT-Abteilungen und Softwareverteilung, Installationsdialog auf Englisch.',
  download_notes_title: 'Gut zu wissen',
  download_note_smartscreen_title: 'Windows-SmartScreen-Hinweis',
  download_note_smartscreen_text:
    'Die App ist noch nicht digital signiert. Beim ersten Start zeigt Windows „Der Computer wurde durch Windows geschützt“: Klicken Sie auf „Weitere Informationen“ und dann auf „Trotzdem ausführen“. Blockiert der Browser den Download, wählen Sie in der Download-Liste „Behalten“.',
  download_note_offline_title: 'Lokal und ohne Internet',
  download_note_offline_text:
    'Dateien hinzufügen, sortieren, anhören und als M3U, XSPF, JSON & Co. speichern läuft komplett auf Ihrem Rechner. Nichts wird hochgeladen.',
  download_note_webview_title: 'Microsoft Edge WebView2',
  download_note_webview_text:
    'Die App nutzt die WebView2-Laufzeit, die unter Windows 10 und 11 meist schon installiert ist. Fehlt sie, lädt der Installer sie automatisch nach.',

  // Seitentitel und Beschreibung (document.title, meta description)
  meta_title_landing: 'Audio Wiedergabeliste Generator – M3U, PLS, XSPF & JSON erstellen',
  meta_description_landing:
    'Erstellen Sie Wiedergabelisten (.m3u, .m3u8, .pls, .xspf, .json, .csv) aus MP3-, WAV- und FLAC-Dateien. Alles läuft lokal im Browser, ohne Upload.',
  meta_title_app: 'Wiedergabeliste erstellen – Audio Wiedergabeliste Generator',
  meta_description_app:
    'Audiodateien hinzufügen, sortieren und als M3U, PLS, XSPF, JSON oder CSV speichern. Mit Laufzeiten, Metadaten und Entwürfen, direkt im Browser.',
  meta_title_faq: 'FAQ – Audio Wiedergabeliste Generator',
  meta_description_faq:
    'Antworten zu M3U, XSPF und JSON, unterstützten Audioformaten, Pfaden in der Wiedergabeliste und Datenschutz.',
  meta_title_blog: 'Alle Funktionen im Detail – Audio Wiedergabeliste Generator',
  meta_description_blog:
    'Wie der Audio Wiedergabeliste Generator funktioniert: Formate, Sortierung, Tastenkürzel und Tipps für perfekte Wiedergabelisten.',

  // Landing Page - Hero
  hero_title: 'Audio Wiedergabeliste Generator',
  hero_subtitle: 'Erstellen Sie professionelle Wiedergabelisten in Sekunden',
  hero_description:
    'Verwandeln Sie Ihre lokalen Audiodateien in perfekt organisierte Wiedergabelisten. Unterstützt M3U, XSPF und JSON – kostenlos und 100% lokal in Ihrem Browser.',
  hero_cta: 'Jetzt starten',
  hero_learn_more: 'Mehr erfahren',

  // Feature Cards
  feature1_title: 'Mehrere Formate',
  feature1_desc:
    'Exportieren Sie Ihre Wiedergabelisten in M3U, XSPF oder JSON – kompatibel mit VLC, Winamp, iTunes und mehr.',
  feature2_title: '100% Privat',
  feature2_desc:
    'Alle Dateien werden lokal verarbeitet. Keine Uploads, keine Server – Ihre Musik bleibt auf Ihrem Gerät.',
  feature3_title: 'Flexible Sortierung',
  feature3_desc:
    'Ordnen Sie Tracks alphabetisch, nach Datum, nach Interpret und Album, zufällig oder per Drag & Drop nach Ihren Wünschen.',

  // Details Section
  details_title: 'Leistungsstarke Funktionen',
  details_subtitle: 'Alles, was Sie für perfekte Wiedergabelisten brauchen',

  detail1_title: 'Drag & Drop Upload',
  detail1_desc:
    'Ziehen Sie einfach Ihre MP3-, WAV- oder FLAC-Dateien in den Browser – keine komplizierte Auswahl nötig.',
  detail2_title: 'Interaktive Trackliste',
  detail2_desc:
    'Visualisieren und bearbeiten Sie Ihre Wiedergabeliste in Echtzeit mit unserer Canvas-basierten Oberfläche.',
  detail3_title: 'Schnelle Tastenkombinationen',
  detail3_desc:
    '{mod}+O zum Öffnen, {mod}+S zum Speichern, {mod}+C zum Kopieren – arbeiten Sie wie ein Profi.',
  detail4_title: 'Theme-Wechsler',
  detail4_desc: 'Wechseln Sie zwischen hellem und dunklem Design – perfekt für jede Umgebung.',
  detail5_title: 'Mehrsprachig',
  detail5_desc: 'Verfügbar auf Deutsch und Englisch – wechseln Sie die Sprache mit einem Klick.',
  detail6_title: 'Keine Installation',
  detail6_desc: 'Funktioniert direkt im Browser – kein Download, keine Installation erforderlich.',

  // Trust Badges
  trust_free: 'Kostenlos',
  trust_no_registration: 'Keine Registrierung',
  trust_private: '100% Lokal & Privat',

  // App Preview Labels
  preview_files_label: 'Audiodateien',
  preview_output_label: 'Wiedergabeliste-Vorschau',

  // CTA Section
  cta_title: 'Bereit, loszulegen?',
  cta_desc: 'Erstellen Sie jetzt Ihre erste Wiedergabeliste – kostenlos und ohne Registrierung.',
  cta_button: 'Kostenlos Wiedergabeliste erstellen',

  // App Page
  notice_m3u:
    'Wichtiger Hinweis für M3U/XSPF-Wiedergabelisten: Damit Mediaplayer (VLC, Winamp etc.) die Tracks finden, muss die Wiedergabeliste-Datei im selben Ordner wie Ihre Audio-Dateien gespeichert werden.',
  main_title: 'Audio Wiedergabeliste Generator',
  subtitle: 'Erstellen Sie professionelle Wiedergabelisten mit modernem Design',
  button_add_files: 'Dateien hinzufügen',
  button_add_folder: 'Ordner hinzufügen',
  scanning_folder: 'Ordner wird durchsucht…',
  select_all: 'Alle auswählen',
  button_clear_title: 'Liste leeren',
  stats_tracks: 'Tracks',
  duration_approx_title: 'Geschätzte Gesamtdauer (noch nicht alle Tracks abgespielt)',
  label_sort: 'Abspielreihenfolge festlegen',
  sort_alpha: 'Alphabetisch',
  sort_date: 'Nach Datum',
  sort_artist: 'Interpret',
  label_target_length: 'Ziel-Länge in Minuten',
  label_target_mode: 'Titel wählen',
  target_mode_order: 'Der Reihe nach',
  target_mode_random: 'Zufällig',
  button_fit_target: 'Auswahl anpassen',
  hint_target_length: 'Setzt die Häkchen so, dass die Auswahl höchstens so lang ist.',
  error_target_length: 'Bitte eine ganze Zahl von 1 bis 1440 eingeben.',
  error_target_none: 'Kein Titel ist kurz genug für diese Länge.',
  sort_random: 'Zufällig',
  sort_manual: 'Manuell',
  label_name: 'Wiedergabeliste benennen',
  placeholder_name: 'Geben Sie einen Namen ein...',
  preview_title: 'Vorschau & Speichern',
  label_format: 'Vorschau-Format',
  format_youtube: 'YouTube-Kapitel',
  format_markdown: 'Markdown (Discord, Reddit)',
  format_bbcode: 'BBCode (Foren)',
  label_path_mode: 'Pfade in der Wiedergabeliste',
  path_mode_name: 'Dateiname',
  path_mode_relative: 'Relativer Pfad',
  label_base_path: 'Basis-Pfad oder URL (optional)',
  placeholder_base_path: 'z. B. D:\\Musik\\ oder https://example.com/musik/',
  notice_paths_relative:
    'Pfade beginnen beim gemeinsamen Ordner aller Titel. Speichern Sie die Wiedergabeliste in diesem Ordner.',
  placeholder_output:
    "Klicken Sie auf 'Wiedergabeliste erstellen', um hier eine Vorschau zu sehen...",
  button_save: 'Speichern',
  button_copy: 'Kopieren',
  button_share: 'Teilen',
  button_share_image: 'Als Bild teilen',
  share_image_title: 'Als Bild teilen',
  share_image_description:
    'Ein Bild der angehakten Titel für Instagram, WhatsApp & Co. Es wird lokal im Browser erzeugt.',
  share_image_format: 'Bildformat',
  share_image_story: 'Story 9:16',
  share_image_post: 'Post 1:1',
  share_image_theme: 'Farbschema',
  share_image_dark: 'Dunkel',
  share_image_light: 'Hell',
  share_image_type: 'Dateityp',
  share_image_text_color: 'Textfarbe',
  share_image_background_color: 'Hintergrund',
  share_image_reset_colors: 'Farben zurücksetzen',
  share_image_photo_pick: 'Hintergrundbild wählen…',
  share_image_photo_replace: 'Anderes Bild…',
  share_image_photo_remove: 'Bild entfernen',
  share_image_photo_opacity: 'Deckkraft',
  share_image_photo_hint: 'PNG, JPEG oder WebP, am besten 2:3 (Story) oder 1:1 (Post).',
  toast_share_photo_type: 'Bitte ein PNG-, JPEG- oder WebP-Bild wählen.',
  toast_share_photo_size: 'Das Bild ist zu groß (höchstens 20 MB und 50 Megapixel).',
  toast_share_photo_decode: 'Das Bild konnte nicht gelesen werden.',
  share_image_low_contrast:
    'Geringer Kontrast zwischen Text und Hintergrund: Das Bild ist auf dem Handy schwer lesbar.',
  share_image_preview_alt: 'Vorschau des Bildes',
  share_image_rendering: 'Bild wird erzeugt…',
  share_image_download: 'Herunterladen',
  share_image_share: 'Teilen…',
  share_image_kicker: 'Wiedergabeliste',
  share_image_meta: '{count} Titel · {duration}',
  share_image_more: '+ {count} weitere Titel',
  share_image_footer: 'Erstellt mit dem Audio Wiedergabeliste Generator · kodinitools.com',
  toast_share_image_saved: 'Bild gespeichert',
  toast_share_image_error: 'Das Bild konnte nicht erzeugt oder geteilt werden.',
  lines: 'Zeilen',
  preview_empty_title: 'Noch keine Vorschau',

  // FAQ Page
  faq_page_title: 'Häufig gestellte Fragen',
  faq_page_subtitle: 'Alles, was Sie über den Audio Wiedergabeliste Generator wissen müssen',
  faq_title: 'Häufig gestellte Fragen (FAQ)',
  faq_q1_title: 'Was ist eine M3U-Datei?',
  faq_q1_text:
    'Eine M3U-Datei ist eine einfache Textdatei, die die Pfade zu Audio- oder Videodateien auflistet. Sie wird von vielen Mediaplayern (z.B. VLC, Winamp, iTunes) verwendet, um Wiedergabelisten zu organisieren und abzuspielen.',
  faq_q9_title: 'Was ist eine XSPF-Datei?',
  faq_q9_text:
    'XSPF (XML Shareable Wiedergabeliste Format) ist ein moderner, offener Standard für Wiedergabelisten. Im Gegensatz zu M3U ist sie im XML-Format strukturiert, was sie flexibler macht. Sie wird von vielen Playern wie VLC unterstützt und ist ideal, um Wiedergabelisten zwischen verschiedenen Programmen und Systemen auszutauschen.',
  faq_q2_title: 'Welche Audioformate werden unterstützt?',
  faq_q2_text:
    'Der Generator unterstützt die gängigsten Audioformate: <strong>.mp3</strong>, <strong>.wav</strong> und <strong>.flac</strong>. Andere Dateitypen werden ignoriert. ZIP-Archive werden direkt im Browser entpackt und die enthaltenen Audiodateien übernommen.',
  faq_q3_title: 'Werden meine Dateien irgendwo hochgeladen?',
  faq_q3_text:
    'Nein, absolut nicht. Die gesamte Verarbeitung geschieht ausschliesslich lokal in Ihrem Browser. Ihre Audio-Dateien verlassen zu keinem Zeitpunkt Ihren Computer.',
  faq_q4_title: 'Warum sind die Pfade in der Wiedergabeliste nur die Dateinamen?',
  faq_q4_text:
    'Das Tool verwendet bewusst relative Pfade (nur den Dateinamen). Darum müssen Sie die Wiedergabeliste-Datei im selben Ordner wie Ihre Musik speichern. Dadurch funktioniert die Wiedergabeliste auch dann noch, wenn Sie den gesamten Ordner auf einen anderen Computer verschieben.',
  faq_q5_title: 'Wofür ist das JSON-Format gut?',
  faq_q5_text:
    'JSON ist ein Datenformat, das oft von Entwicklern oder in Webanwendungen verwendet wird. Sie könnten eine JSON-Wiedergabeliste z.B. nutzen, um die Trackliste auf einer Webseite dynamisch anzuzeigen oder in einem eigenen Softwareprojekt zu verarbeiten. Für normale Mediaplayer sind M3U oder XSPF die bessere Wahl.',
  faq_q6_title: 'Welche Browser werden unterstützt?',
  faq_q6_text:
    'Der Audio Wiedergabeliste Generator funktioniert in allen modernen Browsern (Chrome, Firefox, Safari, Edge). Die Speicherfunktion nutzt die File System Access API und ist am besten in Chrome und Edge verfügbar.',
  faq_q7_title: 'Ist der Generator kostenlos?',
  faq_q7_text:
    'Ja, der Audio Wiedergabeliste Generator ist vollständig kostenlos und erfordert keine Registrierung. Wenn Ihnen das Tool gefällt, können Sie uns gerne mit einer kleinen Spende unterstützen.',
  faq_q8_title: 'Kann ich den Generator offline nutzen?',
  faq_q8_text:
    'Da die gesamte Verarbeitung lokal in Ihrem Browser stattfindet, benötigen Sie nur für den ersten Zugriff eine Internetverbindung. Sobald die Seite geladen ist, können Sie auch ohne Internet Wiedergabelisten erstellen.',

  // Privacy Notice
  privacy_title: 'Datenschutz-Hinweis',
  privacy_text:
    'Der Audio Wiedergabeliste Generator verarbeitet alle Daten lokal in Ihrem Browser. Es werden keine Dateien auf Server hochgeladen und keine persönlichen Daten gespeichert. Die einzigen gespeicherten Daten sind Ihre Theme- und Sprachpräferenzen im lokalen Speicher Ihres Browsers.',

  // Toast Messages
  alert_save_error: 'Fehler: Die Datei konnte nicht gespeichert werden.',
  alert_create_first: 'Bitte erstellen Sie zuerst eine Wiedergabeliste.',
  toast_files_added: '{count} Dateien hinzugefügt',
  toast_duplicates_skipped: '{count} Duplikate übersprungen',
  toast_playlist_saved: 'Wiedergabeliste gespeichert ✓',
  toast_copied: 'In Zwischenablage kopiert ✓',
  handoff_title: 'Im Texteditor öffnen?',
  handoff_text_saved:
    '„{name}“ wurde gespeichert. Möchten Sie die Datei jetzt im Kodini Texteditor weiterbearbeiten?',
  handoff_text_copied:
    '„{name}“ liegt in der Zwischenablage. Möchten Sie die Wiedergabeliste jetzt im Kodini Texteditor weiterbearbeiten?',
  handoff_accept: 'Im Texteditor öffnen',
  handoff_decline: 'Nicht jetzt',
  handoff_error: 'Übergabe nicht möglich: Der Browser-Speicher ist nicht verfügbar.',
  toast_copy_error: 'Kopieren fehlgeschlagen',
  toast_share_error: 'Teilen fehlgeschlagen',
  toast_share_copied: 'Teilen hier nicht möglich – die Playlist liegt in der Zwischenablage.',
  toast_close: 'Schließen',
  toast_file_removed: 'Track entfernt',
  toast_files_cleared: 'Liste geleert',
  toast_undo_btn: 'Rückgängig',
  toast_undo_done: 'Rückgängig: {action}',
  toast_redo_done: 'Wiederholt: {action}',

  // Undo / Redo
  undo_redo_group: 'Rückgängig / Wiederholen',
  undo_btn: 'Rückgängig',
  redo_btn: 'Wiederholen',
  undo_title: 'Nichts rückgängig zu machen ({mod}+Z)',
  redo_title: 'Nichts zu wiederholen ({mod}+Y)',
  undo_title_with_action: 'Rückgängig: {action} ({mod}+Z)',
  redo_title_with_action: 'Wiederholen: {action} ({mod}+Y)',
  history_files_added: 'Dateien hinzugefügt',
  history_files_cleared: 'Liste geleert',
  history_file_removed: 'Track entfernt',
  history_file_moved: 'Track verschoben',
  history_sorted: 'Sortierung geändert',
  history_selection_changed: 'Trackauswahl geändert',
  history_name_changed: 'Name geändert',
  history_format_changed: 'Format geändert',
  history_replace_mode_changed: 'Ersetzen-Option geändert',
  history_path_mode_changed: 'Pfad-Modus geändert',
  history_base_path_changed: 'Basis-Pfad geändert',
  history_target_length_applied: 'Ziel-Länge angewendet',
  history_playlist_opened: 'Wiedergabeliste geöffnet',
  history_draft_loaded: 'Entwurf geladen',
  button_drafts: 'Entwürfe',
  drafts_title: 'Entwürfe',
  drafts_description:
    'Gespeicherte Wiedergabelisten mit Dateien und Einstellungen. Sie liegen nur in diesem Browser.',
  drafts_save_current: '„{name}“ als Entwurf speichern',
  drafts_empty: 'Noch keine Entwürfe gespeichert.',
  drafts_tracks: '{count} Titel',
  drafts_load: 'Laden',
  drafts_delete: 'Löschen',
  drafts_delete_confirm: 'Wirklich löschen?',
  drafts_list_label: 'Gespeicherte Entwürfe',
  toast_draft_saved: 'Entwurf „{name}“ gespeichert.',
  toast_draft_loaded: 'Entwurf „{name}“ geladen.',
  toast_draft_error: 'Der Entwurf konnte nicht gespeichert oder geladen werden.',
  button_open_playlist: 'Playlist öffnen',
  title_open_playlist: 'M3U-, PLS- oder XSPF-Datei öffnen und Reihenfolge übernehmen',
  toast_playlist_opened: '„{name}“ geöffnet: {matched} von {total} Titeln gefunden.',
  toast_playlist_no_match:
    'Keiner der {total} Titel aus „{name}“ ist in der Liste. Fügen Sie zuerst die Audiodateien hinzu.',
  toast_playlist_empty: 'In „{name}“ wurden keine Titel gefunden.',
  toast_zip_extracting: '„{name}“ wird entpackt…',
  toast_zip_no_audio: 'In „{name}“ wurden keine MP3-, WAV- oder FLAC-Dateien gefunden.',
  toast_zip_skipped_unsupported:
    '{count} Dateien aus „{name}“ übersprungen: nur MP3, WAV und FLAC werden übernommen.',
  toast_zip_skipped_unreadable:
    '{count} Audiodateien aus „{name}“ übersprungen: verschlüsselt, beschädigt oder zu groß.',
  toast_zip_invalid: '„{name}“ ist kein lesbares ZIP-Archiv.',
  toast_zip_too_large:
    '„{name}“ ist zu groß zum Entpacken im Browser (höchstens 2 GB Audio und 5000 Dateien).',
  replace_list_option: 'Bestehende Liste ersetzen',
  files_panel_title: 'Dateien',
  drop_zone_title: 'Dateien oder Ordner hierher ziehen',
  drop_zone_hint: 'oder {mod}+V zum Einfügen',
  file_list_label: 'Dateiliste',
  file_list_include: 'In Wiedergabeliste aufnehmen',
  file_list_drag_handle: 'Verschieben, auch mit Alt und Pfeiltasten',
  file_list_remove: 'Entfernen',
  file_list_empty_title: 'Noch keine Dateien',
  file_list_empty_text: 'Füge Audiodateien hinzu oder zieh sie hierher.',

  // Shared Files (audiokonverter)
  sharedFilesLoading: '{count} Datei(en) vom Audio Konverter werden importiert…',
  sharedFilesLoaded: '{count} Datei(en) erfolgreich importiert',
  sharedFilesEmpty: 'Keine Dateien vom Audio Konverter gefunden',
  sharedFilesError: 'Fehler beim Importieren',

  // Shared Files (audionormalizer)
  sharedFilesNormalizerLoading: '{count} normalisierte Datei(en) werden importiert…',
  sharedFilesNormalizerLoaded: '{count} normalisierte Datei(en) erfolgreich importiert',
  sharedFilesNormalizerEmpty: 'Keine normalisierten Dateien gefunden',

  // Shared Files (audio-cutter)
  sharedFilesCutterLoading: '{count} geschnittene Datei(en) vom Audio-Schneider werden importiert…',
  sharedFilesCutterEmpty: 'Keine Dateien vom Audio-Schneider gefunden',

  // Shortcuts
  shortcut_open: 'Dateien öffnen ({mod}+O)',
  shortcut_save: 'Speichern ({mod}+S)',
  shortcut_copy: 'Kopieren ({mod}+C)',

  // Onboarding Banner
  onboarding_aria: 'Kurzanleitung',
  onboarding_step1: 'Dateien hinzufügen',
  onboarding_step2: 'Reihenfolge festlegen',
  onboarding_step3: 'Wiedergabeliste speichern',

  // Keyboard Shortcuts Panel
  shortcuts_panel_title: 'Tastaturkürzel',
  shortcuts_close_btn: 'Schließen',
  shortcuts_hint_btn: 'Tastaturkürzel anzeigen',
  shortcut_open_desc: 'Dateien öffnen',
  shortcut_save_desc: 'Wiedergabeliste speichern',
  shortcut_copy_desc: 'In Zwischenablage kopieren',
  shortcut_delete_desc: 'Ausgewählten Track löschen',
  shortcut_undo_desc: 'Letzte Aktion rückgängig machen',
  shortcut_redo_desc: 'Aktion wiederholen',
  shortcut_arrows_desc: 'Track auswählen',
  shortcut_escape_desc: 'Auswahl aufheben',
  shortcut_question_desc: 'Dieses Panel öffnen / schließen',

  // Format descriptions (shown below format tabs)
  format_desc_m3u: 'Kompatibel mit VLC, Winamp, Foobar2000 und den meisten Mediaplayern.',
  format_desc_m3u8:
    'M3U in UTF-8 – bewahrt Umlaute und Sonderzeichen, ideal für moderne Player und Streaming.',
  format_desc_pls:
    'Weit verbreitetes Format – kompatibel mit VLC, Winamp, foobar2000 und Internetradio.',
  format_desc_txt:
    'Einfache Textliste mit einem Dateinamen pro Zeile – universell für Skripte und USB-Sticks.',
  format_desc_cue:
    'Track-Sheet für DJ-Mixes und Alben – kompatibel mit foobar2000, VLC und CD-Brennprogrammen.',
  format_desc_csv:
    'Tabellen-Export (Dateiname, Titel, Größe) – öffnet sich in Excel oder Google Sheets.',
  format_desc_xspf: 'Moderner XML-Standard – ideal für VLC und Austausch zwischen Programmen.',
  format_desc_json: 'Für Entwickler und Webanwendungen – nicht für normale Mediaplayer geeignet.',
  format_desc_youtube:
    'Kapitel mit Startzeiten zum Einfügen in die YouTube-Videobeschreibung eines Mixes (mind. 3 Titel, je mind. 10 Sekunden).',
  format_desc_markdown:
    'Nummerierte Liste mit Laufzeiten zum Einfügen in Discord, Reddit, GitHub und andere Markdown-Seiten.',
  format_desc_bbcode:
    'Nummerierte Liste mit Laufzeiten für Foren mit BBCode (phpBB, vBulletin, XenForo, Steam).',

  // Audio Player
  player_title: 'Vorschau-Player',
  player_no_track: 'Kein Track ausgewählt',
  player_play: 'Abspielen',
  player_pause: 'Pause',
  player_stop: 'Stopp',
  player_previous: 'Vorheriger Track',
  player_next: 'Nächster Track',
  player_mute: 'Stummschalten',
  player_volume: 'Lautstärke',
  slider_value: 'Wert',
  slider_reset: 'Zurücksetzen',
  color_pick: 'Farbe wählen',
  color_hue: 'Farbton',
  color_saturation: 'Sättigung',
  color_lightness: 'Helligkeit',
  color_hex: 'Hex-Wert',
  color_invalid_hex: 'Ungültiger Hex-Wert (z. B. #ff8800)',
  player_unmute: 'Ton einschalten',
  player_queue: 'Warteschlange',
  player_repeat_off: 'Wiederholen: Aus',
  player_repeat_all: 'Wiederholen: Ganze Wiedergabeliste',
  player_repeat_one: 'Wiederholen: Aktueller Track',

  // Tools Section
  more_tools_title: 'Entdecken Sie weitere Audio-Tools',
  tool1_title: 'Moderner Musikplayer',
  tool1_desc:
    'Ein stilvoller, moderner Musikplayer mit beeindruckenden Visualisierungen, Wiedergabeliste-Verwaltung und Unterstützung für lokale Audiodateien.',
  tool2_title: 'Grafischer Equalizer',
  tool2_desc:
    'Passen Sie den Klang Ihrer Musik präzise an. Dieser 10-Band-Grafik-Equalizer ermöglicht es Ihnen, Frequenzen für das perfekte Hörerlebnis zu formen.',
  tool3_title: 'Audio-Konverter',
  tool3_desc:
    'Konvertieren Sie Ihre Audiodateien schnell und einfach zwischen Formaten wie MP3, WAV und FLAC direkt in Ihrem Browser – ohne Uploads.',
  tool4_title: 'Wiedergabeliste-Konverter',
  tool4_desc:
    'Fügen Sie beliebig viele MP3- oder WAV-Dateien zu einer durchgehenden Audiodatei zusammen und exportieren Sie sie als MP3, OGG oder WebM.',
  tool5_title: 'Audio-Cutter',
  tool5_desc:
    'Schneiden Sie Audiodateien millisekundengenau zu, mit Fade-In und Fade-Out, und exportieren Sie als MP3, WAV, OGG, AAC oder FLAC.',
  tool6_title: 'Audio-Visualizer',
  tool6_desc:
    'Verwandeln Sie Ihre Musik in animierte Visualisierungen mit Text, Bild und eigenen Farben und exportieren Sie das Ergebnis als MP4-Video.',
  tool_button: 'Ausprobieren',

  // Landing Page – KodiniTools Section
  landing_tools_title: 'Weitere KodiniTools für Ihre Musik',
  landing_tools_subtitle:
    'Kostenlose Browser-Tools, die den Wiedergabeliste Generator perfekt ergänzen – ohne Upload, ohne Registrierung.',
  landing_tool_playlist_converter_title: 'Audio Wiedergabeliste Konverter',
  landing_tool_playlist_converter_desc:
    'Konvertieren Sie bestehende Wiedergabelisten zwischen M3U, XSPF und JSON – ideal, um erstellte Wiedergabelisten für andere Player anzupassen.',
  landing_tool_audio_converter_title: 'Audio Konverter',
  landing_tool_audio_converter_desc:
    'Wandeln Sie Audiodateien zwischen MP3, WAV, FLAC und weiteren Formaten um – direkt im Browser, bevor Sie sie in Ihre Wiedergabeliste aufnehmen.',
  landing_tool_normalizer_title: 'Audio Normalizer',
  landing_tool_normalizer_desc:
    'Gleichen Sie die Lautstärke Ihrer Titel an, damit Ihre Wiedergabeliste ohne störende Pegelsprünge läuft.',
  landing_tool_link: 'Tool öffnen',
  landing_tool_link_aria: 'öffnet in einem neuen Tab',

  // Footer
  donate_button: 'spenden',
  donate_title: 'Mit PayPal spenden',
  facebook_share: 'Teilen',
  facebook_share_title: 'Auf Facebook teilen',
}

/** Alle gültigen Übersetzungs-Schlüssel, abgeleitet aus der deutschen Tabelle. */
export type TranslationKey = keyof typeof de

export default de
