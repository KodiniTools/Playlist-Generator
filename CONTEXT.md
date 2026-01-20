# CONTEXT.md - Playlist Generator

Diese Datei dokumentiert den technischen Kontext des Playlist-Generator-Projekts.

---

## Tech-Stack

### Core Framework & Build Tools
| Technologie | Version | Beschreibung |
|-------------|---------|--------------|
| **Vue 3** | ^3.5.22 | Frontend UI Framework mit Composition API |
| **Vite** | ^7.1.7 | Moderner Build-Tool und Dev-Server |
| **TypeScript** | ~5.9.0 | Typsicheres JavaScript |
| **Node.js** | ^20.19.0 \|\| >=22.12.0 | Runtime-Umgebung |

### State Management & Routing
| Technologie | Version | Beschreibung |
|-------------|---------|--------------|
| **Pinia** | ^3.0.3 | Vue State Management |
| **Vue Router** | ^4.5.1 | Client-seitiges Routing |

### Testing
| Technologie | Version | Beschreibung |
|-------------|---------|--------------|
| **Playwright** | ^1.55.1 | E2E-Testing |
| **Vitest** | ^3.2.4 | Unit-Testing Framework |
| **@vue/test-utils** | ^2.4.6 | Vue Component Testing |
| **JSDOM** | ^27.0.0 | DOM-Implementation für Tests |

### Code-Qualität
| Technologie | Version | Beschreibung |
|-------------|---------|--------------|
| **ESLint** | ^9.33.0 | Code Linting |
| **eslint-plugin-vue** | ~10.4.0 | Vue-spezifische ESLint-Regeln |

### Browser-APIs (Keine Backend-Abhängigkeiten)
- **File API** - Datei-Uploads und Verarbeitung
- **Canvas API** - Interaktive Dateilisten-Darstellung
- **File System Access API** - Dateien speichern (Chrome 86+, Edge 86+)
- **Clipboard API** - Kopieren in Zwischenablage
- **localStorage** - Persistente Benutzereinstellungen

---

## Ordnerstruktur

```
Playlist-Generator/
├── src/                          # Haupt-Quellcode
│   ├── components/               # Wiederverwendbare Vue-Komponenten
│   │   ├── AppNavigation.vue     # Top-Navigation mit Mobile-Menü
│   │   ├── FAQ.vue               # FAQ-Anzeige-Komponente
│   │   ├── FileListCanvas.vue    # Canvas-basierte interaktive Dateiliste
│   │   ├── HelloWorld.vue        # Beispiel-Komponente
│   │   ├── LanguageSwitcher.vue  # Sprachauswahl (DE/EN)
│   │   ├── PlaylistConfig.vue    # Haupt-Konfigurationsformular
│   │   ├── PlaylistPreview.vue   # Vorschau und Speichern/Kopieren
│   │   ├── ThemeSwitcher.vue     # Dark/Light Theme Toggle
│   │   ├── ToastContainer.vue    # Toast-Benachrichtigungssystem
│   │   ├── ToolsGrid.vue         # Grid mit anderen Audio-Tools
│   │   ├── __tests__/            # Komponenten-Tests
│   │   └── icons/                # SVG-Icon-Komponenten
│   │
│   ├── composables/              # Vue Composition API Logik
│   │   ├── usePlaylist.js        # Kern-Playlist-Logik
│   │   ├── useTheme.js           # Theme-Verwaltung
│   │   ├── useToast.js           # Toast-Benachrichtigungen
│   │   └── useTranslation.js     # Internationalisierung (DE/EN)
│   │
│   ├── views/                    # Seiten-Komponenten
│   │   ├── AppPage.vue           # Haupt-Anwendungsseite
│   │   ├── BlogPage.vue          # Blog-Seite
│   │   ├── FaqPage.vue           # FAQ-Seite
│   │   └── LandingPage.vue       # Landing/Home-Seite
│   │
│   ├── router/                   # Vue Router Konfiguration
│   │   └── index.ts              # Routen-Definitionen
│   │
│   ├── stores/                   # Pinia State Management
│   │   └── counter.ts            # Beispiel-Store
│   │
│   ├── assets/                   # Statische Assets
│   │   ├── base.css              # CSS Reset und Basis-Styles
│   │   ├── main.css              # Globales CSS mit Theme-Variablen
│   │   └── logo.svg              # Anwendungs-Logo
│   │
│   ├── App.vue                   # Root-Komponente
│   ├── main.js                   # JavaScript Entry Point
│   ├── main.ts                   # TypeScript Entry Point
│   └── env.d.ts                  # TypeScript Umgebungsdefinitionen
│
├── e2e/                          # End-to-End Tests
│   ├── vue.spec.ts               # Playwright E2E Test Suite
│   └── tsconfig.json             # E2E Test TypeScript Config
│
├── .vscode/                      # VS Code Konfiguration
│
├── Konfigurationsdateien
│   ├── vite.config.ts            # Vite Konfiguration
│   ├── vitest.config.ts          # Vitest Konfiguration
│   ├── tsconfig.json             # Root TypeScript Config
│   ├── tsconfig.app.json         # App-spezifische TS Config
│   ├── tsconfig.node.json        # Node-spezifische TS Config
│   ├── eslint.config.ts          # ESLint Konfiguration
│   ├── playwright.config.ts      # Playwright E2E Konfiguration
│   ├── package.json              # Projekt-Dependencies & Scripts
│   └── index.html                # HTML Entry Point
│
├── Dokumentation
│   ├── README.md                 # Projekt-Dokumentation
│   ├── BLOG.md                   # Blog-Inhalte
│   ├── LICENSE                   # MIT Lizenz
│   └── deploy.ps1                # PowerShell Deployment-Skript
│
└── node_modules/                 # Installierte Dependencies
```

---

## Datenbankschema

### Keine Server-Datenbank

Dies ist eine **100% Client-seitige Anwendung** ohne Backend-Server oder Datenbank.

### Datenspeicherung (localStorage)

```javascript
// Theme-Präferenz
localStorage.getItem('theme')     // Werte: 'light' oder 'dark'

// Sprach-Präferenz
localStorage.getItem('language')  // Werte: 'de' oder 'en'
```

### In-Memory Datenstrukturen

#### File-Objekt (Browser File API)
```typescript
interface FileObject {
  name: string           // Dateiname mit Erweiterung
  size: number           // Dateigröße in Bytes
  lastModified: number   // Zeitstempel
  type: string           // MIME-Type
}
```

#### Playlist State (usePlaylist Composable)
```typescript
interface PlaylistState {
  files: File[]                // Array der ausgewählten Audio-Dateien
  sortOption: SortOption       // Sortierungsoption
  playlistName: string         // Benutzerdefinierter Playlist-Name
  outputFormat: OutputFormat   // Ausgabeformat
  playlistContent: string      // Generierter Playlist-Text
  replaceMode: boolean         // Dateien ersetzen vs. anhängen
  selectedFileIndex: number    // Aktuell ausgewählte Datei
}

type SortOption = 'alphabetical' | 'date' | 'random' | 'manual'
type OutputFormat = 'm3u' | 'json' | 'xspf'
```

### Unterstützte Audio-Formate

```javascript
const supportedFormats = ['.mp3', '.wav', '.flac']
```

### Generierte Playlist-Formate

#### M3U Format
```
#EXTM3U
#EXTINF:-1,Track Titel
dateiname.mp3
#EXTINF:-1,Weiterer Track
weitere.mp3
```

#### XSPF Format (XML Shareable Playlist Format)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<playlist version="1" xmlns="http://xspf.org/ns/0/">
  <title>Playlist Name</title>
  <trackList>
    <track>
      <location>dateiname.mp3</location>
      <title>Track Titel</title>
    </track>
  </trackList>
</playlist>
```

#### JSON Format
```json
[
  {
    "filename": "song.mp3",
    "title": "Song",
    "size": 5000000
  }
]
```

---

## Routen

| Pfad | View | Beschreibung |
|------|------|--------------|
| `/` | LandingPage.vue | Landing/Home-Seite |
| `/app` | AppPage.vue | Haupt-Anwendung |
| `/faq` | FaqPage.vue | FAQ-Seite |
| `/blog` | BlogPage.vue | Blog-Seite |

---

## NPM Scripts

```bash
npm run dev          # Startet Vite Dev-Server
npm run build        # Erstellt Produktions-Build
npm run preview      # Zeigt Produktions-Build an
npm run test:unit    # Führt Vitest Unit-Tests aus
npm run test:e2e     # Führt Playwright E2E-Tests aus
npm run lint         # Führt ESLint aus
npm run type-check   # TypeScript Type-Checking
```

---

## Tastenkürzel

| Kürzel | Aktion |
|--------|--------|
| `Ctrl+O` | Datei-Dialog öffnen |
| `Ctrl+S` | Playlist speichern |
| `Ctrl+C` | In Zwischenablage kopieren |
| `Delete` | Ausgewählte Datei entfernen |
| `↑/↓` | Dateien navigieren |
| `Escape` | Auswahl aufheben |

---

*Zuletzt aktualisiert: Januar 2026*
