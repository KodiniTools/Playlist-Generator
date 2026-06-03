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
│   ├── FAQ.vue
│   ├── FileListCanvas.vue
│   ├── LanguageSwitcher.vue
│   ├── PlaylistConfig.vue
│   ├── PlaylistPreview.vue
│   ├── ThemeSwitcher.vue
│   └── ToolsGrid.vue
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
- **LanguageSwitcher**: Sprachumschalter
- **ThemeSwitcher**: Theme-Umschalter
- **FileListCanvas**: Canvas-basierte Dateiliste mit Scrolling
- **PlaylistConfig**: Formular für Konfiguration
- **PlaylistPreview**: Vorschau und Speichern
- **ToolsGrid**: Grid mit weiteren Tools
- **FAQ**: Häufig gestellte Fragen

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
