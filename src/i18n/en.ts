import type { TranslationKey } from './de'

// Record<TranslationKey, string> macht fehlende oder überzählige EN-Schlüssel zum Compile-Fehler.
const en: Record<TranslationKey, string> = {
  // Navigation
  nav_home: 'Home',
  nav_app: 'App',
  nav_faq: 'FAQ',
  nav_blog: 'Blog',
  nav_label: 'Pages',

  // Desktop app: bar instead of the server navigation
  desktop_bar_label: 'Settings',
  desktop_language: 'Language',
  desktop_theme: 'Theme',
  desktop_theme_dark: 'Dark',
  desktop_theme_light: 'Light',

  // Download page (Windows app)
  nav_download: 'Download',
  meta_title_download: 'Download Playlist Generator for Windows – free desktop app',
  meta_description_download:
    'The Audio Playlist Generator as a free Windows app: installer (.exe) or MSI package for Windows 10 and 11. Create playlists locally on your PC.',
  download_eyebrow: 'Windows app',
  download_title: 'Playlist Generator for Windows',
  download_subtitle:
    'All features of the playlist generator as an app on your PC – with its own window, a Start menu entry and no internet required.',
  download_requirements: 'Windows 10 or 11 · 64-bit · about 10 MB of disk space',
  download_files_label: 'Download files',
  download_recommended: 'Recommended',
  download_button: 'Download {ext}',
  download_size_note:
    'Each file is only about 2 MB and you only need one of them. For most people the installer (.exe) is the right one.',
  download_exe_title: 'Installer (.exe)',
  download_exe_desc:
    'For most users: installs without administrator rights, choose German or English.',
  download_msi_de_title: 'MSI package German',
  download_msi_de_desc: 'For IT departments and software deployment, setup dialog in German.',
  download_msi_en_title: 'MSI package English',
  download_msi_en_desc: 'For IT departments and software deployment, setup dialog in English.',
  download_notes_title: 'Good to know',
  download_note_smartscreen_title: 'Windows SmartScreen notice',
  download_note_smartscreen_text:
    'The app is not digitally signed yet. On first launch Windows shows “Windows protected your PC”: click “More info”, then “Run anyway”. If your browser blocks the download, choose “Keep” in the download list.',
  download_note_offline_title: 'Local and offline',
  download_note_offline_text:
    'Adding, sorting, playing and saving files as M3U, XSPF, JSON and more runs entirely on your computer. Nothing is uploaded.',
  download_note_webview_title: 'Microsoft Edge WebView2',
  download_note_webview_text:
    'The app uses the WebView2 runtime, which is usually already installed on Windows 10 and 11. If it is missing, the installer downloads it automatically.',

  // Page title and description (document.title, meta description)
  meta_title_landing: 'M3U Playlist Creator – Free Online Playlist Maker | KodiniTools',
  meta_description_landing:
    'Create an M3U playlist from MP3, WAV and FLAC files, or export as M3U8, PLS, XSPF, JSON or CSV. Free, runs locally in your browser, no upload.',
  meta_title_app: 'Create a Playlist – Audio Playlist Generator',
  meta_description_app:
    'Add audio files, sort them and save as M3U, PLS, XSPF, JSON or CSV. With durations, metadata and drafts, right in your browser.',
  meta_title_faq: 'FAQ – Audio Playlist Generator',
  meta_description_faq:
    'Answers about M3U, XSPF and JSON, supported audio formats, paths in the playlist and privacy.',
  meta_title_blog: 'All Features in Detail – Audio Playlist Generator',
  meta_description_blog:
    'How the Audio Playlist Generator works: formats, sorting, keyboard shortcuts and tips for perfect playlists.',

  // Landing Page - Hero
  hero_title: 'Audio Playlist Generator',
  hero_subtitle: 'Create an M3U playlist in seconds, right in your browser',
  hero_description:
    'Transform your local audio files into perfectly organized playlists. Supports M3U, XSPF, and JSON – free and 100% local in your browser.',
  hero_cta: 'Get Started',
  hero_learn_more: 'Learn More',

  // Feature Cards
  feature1_title: 'Multiple Formats',
  feature1_desc:
    'Export your playlists to M3U, XSPF, or JSON – compatible with VLC, Winamp, iTunes, and more.',
  feature2_title: '100% Private',
  feature2_desc:
    'All files are processed locally. No uploads, no servers – your music stays on your device.',
  feature3_title: 'Flexible Sorting',
  feature3_desc:
    'Arrange tracks alphabetically, by date, by artist and album, randomly, or drag & drop to your preference.',

  // Details Section
  details_title: 'Powerful Features',
  details_subtitle: 'Everything you need for perfect playlists',

  detail1_title: 'Drag & Drop Upload',
  detail1_desc:
    'Simply drag your MP3, WAV, or FLAC files into the browser – no complicated selection needed.',
  detail2_title: 'Interactive Track List',
  detail2_desc: 'Visualize and edit your playlist in real-time with our canvas-based interface.',
  detail3_title: 'Fast Keyboard Shortcuts',
  detail3_desc: '{mod}+O to open, {mod}+S to save, {mod}+C to copy – work like a pro.',
  detail4_title: 'Theme Switcher',
  detail4_desc: 'Switch between light and dark design – perfect for any environment.',
  detail5_title: 'Multilingual',
  detail5_desc: 'Available in German and English – switch languages with one click.',
  detail6_title: 'No Installation',
  detail6_desc: 'Works directly in the browser – no download, no installation required.',

  // Trust Badges
  trust_free: 'Free',
  trust_no_registration: 'No Registration',
  trust_private: '100% Local & Private',

  // App Preview Labels
  preview_files_label: 'Audio Files',
  preview_output_label: 'Playlist Preview',

  // CTA Section
  cta_title: 'Ready to get started?',
  cta_desc: 'Create your first playlist now – free and without registration.',
  cta_button: 'Create Playlist for Free',

  // App Page
  notice_m3u:
    'Important Notice for M3U/XSPF Playlists: For media players (VLC, Winamp, etc.) to find the tracks, the playlist file must be saved in the same folder as your audio files.',
  main_title: 'Audio Playlist Generator',
  subtitle: 'Create professional playlists with a modern design',
  button_add_files: 'Add Files',
  button_add_folder: 'Add Folder',
  scanning_folder: 'Scanning folder…',
  select_all: 'Select all',
  button_clear_title: 'Clear List',
  stats_tracks: 'Tracks',
  duration_approx_title: 'Estimated total duration (not all tracks played yet)',
  label_sort: 'Set playback order',
  sort_alpha: 'Alphabetical',
  sort_date: 'By Date',
  sort_artist: 'Artist',
  label_target_length: 'Target length in minutes',
  label_target_mode: 'Pick tracks',
  target_mode_order: 'In order',
  target_mode_random: 'Random',
  button_fit_target: 'Adjust selection',
  hint_target_length: 'Checks tracks so the selection is at most this long.',
  error_target_length: 'Please enter a whole number from 1 to 1440.',
  error_target_none: 'No track is short enough for this length.',
  sort_random: 'Random',
  sort_manual: 'Manual',
  label_name: 'Name playlist',
  placeholder_name: 'Enter a name...',
  preview_title: 'Preview & Save',
  label_format: 'Preview Format',
  format_youtube: 'YouTube chapters',
  format_markdown: 'Markdown (Discord, Reddit)',
  format_bbcode: 'BBCode (forums)',
  label_path_mode: 'Paths in the playlist',
  path_mode_name: 'File name',
  path_mode_relative: 'Relative path',
  label_base_path: 'Base path or URL (optional)',
  placeholder_base_path: 'e.g. D:\\Music\\ or https://example.com/music/',
  notice_paths_relative:
    'Paths start at the folder shared by all tracks. Save the playlist in that folder.',
  placeholder_output: "Click 'Create Playlist' to see a preview here...",
  button_save: 'Save As...',
  button_copy: 'Copy',
  button_share: 'Share',
  button_share_image: 'Share as image',
  share_image_title: 'Share as image',
  share_image_description:
    'An image of the checked tracks for Instagram, WhatsApp and more. It is created locally in your browser.',
  share_image_format: 'Image format',
  share_image_story: 'Story 9:16',
  share_image_post: 'Post 1:1',
  share_image_theme: 'Color scheme',
  share_image_dark: 'Dark',
  share_image_light: 'Light',
  share_image_type: 'File type',
  share_image_text_color: 'Text color',
  share_image_background_color: 'Background',
  share_image_reset_colors: 'Reset colors',
  share_image_photo_pick: 'Choose background image…',
  share_image_photo_replace: 'Other image…',
  share_image_photo_remove: 'Remove image',
  share_image_photo_opacity: 'Opacity',
  share_image_photo_hint: 'PNG, JPEG or WebP, ideally 2:3 (story) or 1:1 (post).',
  toast_share_photo_type: 'Please choose a PNG, JPEG or WebP image.',
  toast_share_photo_size: 'The image is too large (at most 20 MB and 50 megapixels).',
  toast_share_photo_decode: 'The image could not be read.',
  share_image_low_contrast:
    'Low contrast between text and background: the image will be hard to read on a phone.',
  share_image_preview_alt: 'Image preview',
  share_image_rendering: 'Creating image…',
  share_image_download: 'Download',
  share_image_share: 'Share…',
  share_image_kicker: 'Playlist',
  share_image_meta: '{count} tracks · {duration}',
  share_image_more: '+ {count} more tracks',
  share_image_footer: 'Made with the Audio Playlist Generator · kodinitools.com',
  toast_share_image_saved: 'Image saved',
  toast_share_image_error: 'The image could not be created or shared.',
  lines: 'lines',
  preview_empty_title: 'No preview yet',

  // FAQ Page
  faq_page_title: 'Frequently Asked Questions',
  faq_page_subtitle: 'Everything you need to know about the Audio Playlist Generator',
  faq_title: 'Frequently Asked Questions (FAQ)',
  faq_q1_title: 'What is an M3U file?',
  faq_q1_text:
    'An M3U file is a plain text file that lists the paths to audio or video files. It is used by many media players (e.g., VLC, Winamp, iTunes) to organize and play playlists.',
  faq_q9_title: 'What is an XSPF file?',
  faq_q9_text:
    'XSPF (XML Shareable Playlist Format) is a modern, open standard for playlists. Unlike M3U, it is structured in XML format, which makes it more flexible. It is supported by many players like VLC and is ideal for sharing playlists between different programs and systems.',
  faq_q2_title: 'Which audio formats are supported?',
  faq_q2_text:
    'The generator supports the most common audio formats: <strong>.mp3</strong>, <strong>.wav</strong>, and <strong>.flac</strong>. Other file types will be ignored. ZIP archives are extracted right in the browser and the audio files inside are added.',
  faq_q3_title: 'Are my files uploaded anywhere?',
  faq_q3_text:
    'No, absolutely not. All processing happens exclusively locally in your browser. Your audio files never leave your computer.',
  faq_q4_title: 'Why are the paths in the playlist just the filenames?',
  faq_q4_text:
    'The tool intentionally uses relative paths (just the filename). This is why you need to save the playlist file in the same folder as your music. This allows the playlist to work even if you move the entire folder to another computer.',
  faq_q5_title: 'What is the JSON format good for?',
  faq_q5_text:
    'JSON is a data format often used by developers or in web applications. You could use a JSON playlist to dynamically display the track list on a website or to process it in your own software project. For regular media players, M3U or XSPF is the better choice.',
  faq_q6_title: 'Which browsers are supported?',
  faq_q6_text:
    'The Audio Playlist Generator works in all modern browsers (Chrome, Firefox, Safari, Edge). The save function uses the File System Access API and works best in Chrome and Edge.',
  faq_q7_title: 'Is the generator free?',
  faq_q7_text:
    'Yes, the Audio Playlist Generator is completely free and requires no registration. If you like the tool, feel free to support us with a small donation.',
  faq_q8_title: 'Can I use the generator offline?',
  faq_q8_text:
    'Since all processing takes place locally in your browser, you only need an internet connection for the initial access. Once the page is loaded, you can create playlists even without internet.',

  // Privacy Notice
  privacy_title: 'Privacy Notice',
  privacy_text:
    "The Audio Playlist Generator processes all data locally in your browser. No files are uploaded to servers and no personal data is stored. The only stored data are your theme and language preferences in your browser's local storage.",

  // Toast Messages
  alert_save_error: 'Error: The file could not be saved.',
  alert_create_first: 'Please create a playlist first.',
  toast_files_added: '{count} files added',
  toast_duplicates_skipped: '{count} duplicates skipped',
  toast_playlist_saved: 'Playlist saved ✓',
  toast_copied: 'Copied to clipboard ✓',
  handoff_title: 'Open in text editor?',
  handoff_text_saved:
    '"{name}" has been saved. Would you like to continue editing it in the Kodini text editor?',
  handoff_text_copied:
    '"{name}" is in your clipboard. Would you like to continue editing the playlist in the Kodini text editor?',
  handoff_accept: 'Open in text editor',
  handoff_decline: 'Not now',
  handoff_error: 'Handoff not possible: browser storage is unavailable.',
  toast_copy_error: 'Copy failed',
  toast_share_error: 'Sharing failed',
  toast_share_copied: 'Sharing is not available here – the playlist is on your clipboard.',
  toast_close: 'Close',
  toast_file_removed: 'Track removed',
  toast_files_cleared: 'List cleared',
  toast_undo_btn: 'Undo',
  toast_undo_done: 'Undone: {action}',
  toast_redo_done: 'Redone: {action}',

  // Undo / Redo
  undo_redo_group: 'Undo / Redo',
  undo_btn: 'Undo',
  redo_btn: 'Redo',
  undo_title: 'Nothing to undo ({mod}+Z)',
  redo_title: 'Nothing to redo ({mod}+Y)',
  undo_title_with_action: 'Undo: {action} ({mod}+Z)',
  redo_title_with_action: 'Redo: {action} ({mod}+Y)',
  history_files_added: 'Files added',
  history_files_cleared: 'List cleared',
  history_file_removed: 'Track removed',
  history_file_moved: 'Track moved',
  history_sorted: 'Sort order changed',
  history_selection_changed: 'Track selection changed',
  history_name_changed: 'Name changed',
  history_format_changed: 'Format changed',
  history_replace_mode_changed: 'Replace option changed',
  history_path_mode_changed: 'Path mode changed',
  history_base_path_changed: 'Base path changed',
  history_target_length_applied: 'Target length applied',
  history_playlist_opened: 'Playlist opened',
  history_draft_loaded: 'Draft loaded',
  button_drafts: 'Drafts',
  drafts_title: 'Drafts',
  drafts_description:
    'Saved playlists with files and settings. They are stored in this browser only.',
  drafts_save_current: 'Save “{name}” as draft',
  drafts_empty: 'No drafts saved yet.',
  drafts_tracks: '{count} tracks',
  drafts_load: 'Load',
  drafts_delete: 'Delete',
  drafts_delete_confirm: 'Really delete?',
  drafts_list_label: 'Saved drafts',
  toast_draft_saved: 'Draft “{name}” saved.',
  toast_draft_loaded: 'Draft “{name}” loaded.',
  toast_draft_error: 'The draft could not be saved or loaded.',
  button_open_playlist: 'Open playlist',
  title_open_playlist: 'Open an M3U, PLS or XSPF file and apply its order',
  toast_playlist_opened: 'Opened “{name}”: {matched} of {total} tracks found.',
  toast_playlist_no_match:
    'None of the {total} tracks in “{name}” are in the list. Add the audio files first.',
  toast_playlist_empty: 'No tracks found in “{name}”.',
  toast_zip_extracting: 'Extracting “{name}”…',
  toast_zip_no_audio: 'No MP3, WAV or FLAC files found in “{name}”.',
  toast_zip_skipped_unsupported:
    '{count} files from “{name}” skipped: only MP3, WAV and FLAC are added.',
  toast_zip_skipped_unreadable:
    '{count} audio files from “{name}” skipped: encrypted, damaged or too large.',
  toast_zip_invalid: '“{name}” is not a readable ZIP archive.',
  toast_zip_too_large:
    '“{name}” is too large to extract in the browser (at most 2 GB of audio and 5000 files).',
  replace_list_option: 'Replace existing list',
  files_panel_title: 'Files',
  drop_zone_title: 'Drop files or folders here',
  drop_zone_hint: 'or {mod}+V to paste',
  file_list_label: 'File list',
  file_list_include: 'Include in playlist',
  file_list_drag_handle: 'Move, also with Alt and arrow keys',
  file_list_remove: 'Remove',
  file_list_empty_title: 'No files yet',
  file_list_empty_text: 'Add audio files or drop them here.',

  // Shared Files (audiokonverter)
  sharedFilesLoading: 'Importing {count} file(s) from Audio Converter…',
  sharedFilesLoaded: '{count} file(s) successfully imported',
  sharedFilesEmpty: 'No files found from Audio Converter',
  sharedFilesError: 'Error importing files',

  // Shared Files (audionormalizer)
  sharedFilesNormalizerLoading: 'Importing {count} normalised file(s)…',
  sharedFilesNormalizerLoaded: '{count} normalised file(s) successfully imported',
  sharedFilesNormalizerEmpty: 'No normalised files found',

  // Shared Files (audio-cutter)
  sharedFilesCutterLoading: 'Importing {count} edited file(s) from Audio Cutter…',
  sharedFilesCutterEmpty: 'No files found from Audio Cutter',

  // Shortcuts
  shortcut_open: 'Open files ({mod}+O)',
  shortcut_save: 'Save ({mod}+S)',
  shortcut_copy: 'Copy ({mod}+C)',

  // Onboarding Banner
  onboarding_aria: 'Quick guide',
  onboarding_step1: 'Add files',
  onboarding_step2: 'Set order',
  onboarding_step3: 'Save playlist',

  // Keyboard Shortcuts Panel
  shortcuts_panel_title: 'Keyboard Shortcuts',
  shortcuts_close_btn: 'Close',
  shortcuts_hint_btn: 'Show keyboard shortcuts',
  shortcut_open_desc: 'Open files',
  shortcut_save_desc: 'Save playlist',
  shortcut_copy_desc: 'Copy to clipboard',
  shortcut_delete_desc: 'Delete selected track',
  shortcut_undo_desc: 'Undo last action',
  shortcut_redo_desc: 'Redo action',
  shortcut_arrows_desc: 'Select track',
  shortcut_escape_desc: 'Clear selection',
  shortcut_question_desc: 'Open / close this panel',

  // Format descriptions (shown below format tabs)
  format_desc_m3u: 'Compatible with VLC, Winamp, Foobar2000 and most media players.',
  format_desc_m3u8:
    'M3U in UTF-8 – preserves accents and special characters, ideal for modern players and streaming.',
  format_desc_pls:
    'Widely supported format – works with VLC, Winamp, foobar2000 and internet radio.',
  format_desc_txt:
    'Simple text list with one filename per line – universal for scripts and USB sticks.',
  format_desc_cue:
    'Track sheet for DJ mixes and albums – compatible with foobar2000, VLC and CD burning tools.',
  format_desc_csv: 'Spreadsheet export (filename, title, size) – opens in Excel or Google Sheets.',
  format_desc_xspf: 'Modern XML standard – ideal for VLC and sharing between applications.',
  format_desc_json: 'For developers and web apps – not suitable for regular media players.',
  format_desc_youtube:
    'Chapters with start times to paste into the YouTube description of a mix (at least 3 tracks, each at least 10 seconds).',
  format_desc_markdown:
    'Numbered list with durations to paste into Discord, Reddit, GitHub and other Markdown sites.',
  format_desc_bbcode:
    'Numbered list with durations for BBCode forums (phpBB, vBulletin, XenForo, Steam).',

  // Audio Player
  player_title: 'Preview Player',
  player_no_track: 'No track selected',
  player_play: 'Play',
  player_pause: 'Pause',
  player_stop: 'Stop',
  player_previous: 'Previous track',
  player_next: 'Next track',
  player_mute: 'Mute',
  player_volume: 'Volume',
  slider_value: 'Value',
  slider_reset: 'Reset',
  color_pick: 'Pick color',
  color_hue: 'Hue',
  color_saturation: 'Saturation',
  color_lightness: 'Lightness',
  color_hex: 'Hex value',
  color_invalid_hex: 'Invalid hex value (e.g. #ff8800)',
  player_unmute: 'Unmute',
  player_queue: 'Queue',
  player_repeat_off: 'Repeat: Off',
  player_repeat_all: 'Repeat: Entire playlist',
  player_repeat_one: 'Repeat: Current track',

  // Tools Section
  more_tools_title: 'Discover More Audio Tools',
  tool1_title: 'Modern Music Player',
  tool1_desc:
    'A stylish, modern music player with stunning visualizations, playlist management, and support for local audio files.',
  tool2_title: 'Graphic Equalizer',
  tool2_desc:
    "Precisely adjust your music's sound. This 10-band graphic equalizer allows you to shape frequencies for the perfect listening experience.",
  tool3_title: 'Audio Converter',
  tool3_desc:
    'Quickly and easily convert your audio files between formats like MP3, WAV, and FLAC directly in your browser—no uploads required.',
  tool4_title: 'Playlist Converter',
  tool4_desc:
    'Merge any number of MP3 or WAV files into one continuous audio file and export it as MP3, OGG or WebM.',
  tool5_title: 'Audio Cutter',
  tool5_desc:
    'Trim audio files with millisecond precision, add fade-in and fade-out, and export as MP3, WAV, OGG, AAC or FLAC.',
  tool6_title: 'Audio Visualizer',
  tool6_desc:
    'Turn your music into animated visualizations with text, an image and your own colours, and export the result as an MP4 video.',
  tool_button: 'Try It Out',

  // Landing Page – KodiniTools Section
  landing_tools_title: 'More KodiniTools for Your Music',
  landing_tools_subtitle:
    'Free browser tools that perfectly complement the Playlist Generator – no upload, no registration.',
  landing_tool_playlist_converter_title: 'Audio Playlist Converter',
  landing_tool_playlist_converter_desc:
    'Convert existing playlists between M3U, XSPF and JSON – ideal for adapting your generated playlists to other players.',
  landing_tool_audio_converter_title: 'Audio Converter',
  landing_tool_audio_converter_desc:
    'Convert audio files between MP3, WAV, FLAC and more – right in your browser, before adding them to your playlist.',
  landing_tool_normalizer_title: 'Audio Normalizer',
  landing_tool_normalizer_desc:
    'Level out the volume of your tracks so your playlist plays without jarring loudness jumps.',
  landing_tool_link: 'Open tool',
  landing_tool_link_aria: 'opens in a new tab',

  // Footer
  donate_button: 'donate',
  donate_title: 'Donate with PayPal',
  facebook_share: 'Share',
  facebook_share_title: 'Share on Facebook',
}

export default en
