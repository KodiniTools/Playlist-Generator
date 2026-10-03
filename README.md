# Audio Playlist Generator für M3U, XSPF und JSON-Playlists - Vue 3 Edition

Eine moderne Vue 3-Anwendung zum Erstellen von Audio-Playlists in verschiedenen Formaten (M3U, XSPF, JSON).

## Features

- 🎵 **Mehrere Formate**: Unterstützung für M3U, XSPF und JSON-Playlists
- 📁 **Lokale Verarbeitung**: Alle Dateien werden lokal im Browser verarbeitet
- 🔄 **Flexible Sortierung**: Alphabetisch, nach Datum oder zufällig
- 🎨 **Theme-Wechsler**: Dark/Light Mode
- 🌍 **Mehrsprachig**: Deutsch und Englisch
- 📊 **Canvas-Liste**: Interaktive Dateiliste mit Scrolling
- 💾 **Einfaches Speichern**: Nutzt die File System Access API

## Technologie-Stack

- **Vue 3** mit Composition API
- **Vite** als Build-Tool
- **Canvas API** für die Dateiliste
- **File System Access API** für das Speichern

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Die Anwendung läuft dann auf [http://localhost:5173](http://localhost:5173)

## Build für Production

```bash
npm run build
```

Die Build-Dateien werden im `dist`-Ordner erstellt.

## Preview Production Build

```bash
npm run preview
```

## Projektstruktur

```
src/
├── components/          # Vue-Komponenten
│   ├── AppHeader.vue
│   ├── PlaylistConfig.vue
│   ├── PlaylistPreview.vue
│   ├── ToolsGrid.vue
│   └── ui/              # Design-System-Komponenten (Ui*)
├── composables/         # Wiederverwendbare Logik
│   ├── usePlaylist.js
│   ├── useTheme.js
│   └── useTranslation.js
├── assets/
│   └── main.css        # Globale Styles
├── App.vue             # Haupt-Komponente
└── main.js             # App-Einstiegspunkt
```

## Komponenten-Übersicht

### Composables

- **usePlaylist**: Verwaltet Dateien, Sortierung und Playlist-Generierung
- **useTheme**: Handhabt Theme-Wechsel (Dark/Light)
- **useTranslation**: Verwaltet Mehrsprachigkeit (DE/EN)

### Komponenten

- **App.vue**: Hauptkomponente mit Layout
- **AppHeader**: Seitennavigation aller Vue-Seiten
- **UiFileList** (`src/components/ui/`): Dateiliste als DOM-Liste mit Tastatur- und Drag-Sortierung
- **PlaylistConfig**: Formular für Konfiguration
- **PlaylistPreview**: Vorschau und Speichern
- **ToolsGrid**: Grid mit weiteren Tools
- **FaqPage** (`src/views/`): Häufig gestellte Fragen

## Übergabe an den Kodini Texteditor

Nach **Kopieren** oder **Speichern unter…** bietet ein Dialog an, die Wiedergabeliste im
[Kodini Texteditor](https://kodinitools.com/texteditor/) weiterzubearbeiten („Im Texteditor
öffnen“ / „Nicht jetzt“). Bei Zustimmung legt die App die Datei unter
`localStorage['kodinitools-texteditor-handoff-v1']` ab (`{ version: 1, source, name, content,
mimeType, sharedAt }`) und öffnet `https://kodinitools.com/texteditor/app?source=playlist_generator`
in einem neuen Tab. Der Editor übernimmt den Eintrag beim Start als neues Dokument und entfernt ihn.
Umsetzung: `src/utils/textEditorHandoff.ts` (getestet), Dialog in `src/views/AppPage.vue`.

## Browser-Kompatibilität

Die Anwendung nutzt moderne Web-APIs:

- **File API**: Alle modernen Browser
- **Canvas API**: Alle modernen Browser
- **File System Access API**: Chrome 86+, Edge 86+ (für das Speichern)

## Lizenz

MIT License

## Migrationshinweise

Diese Anwendung wurde von Vanilla JavaScript zu Vue 3 migriert. Wichtige Änderungen:

1. **Reaktivität**: Alle Zustandsverwaltung nutzt Vue's Reaktivitätssystem
2. **Komponenten**: UI ist in wiederverwendbare Komponenten aufgeteilt
3. **Composables**: Logik ist in Composables ausgelagert für bessere Wiederverwendbarkeit
4. **Single File Components**: HTML, JavaScript und CSS-Scoping in .vue-Dateien
5. **Build-System**: Vite für schnelles HMR (Hot Module Replacement)

```

```

## Author

- Dinko Ramić - Kodini Tools - kodinitools.com
