# Playlist Generator als Windows-App

Die Web-App wird mit [Tauri 2](https://tauri.app) als Windows-Desktop-App verpackt
(gleiches Muster wie beim Bildkonverter).
Ergebnis: ein Installer (`.exe`, NSIS) und MSI-Pakete (`.msi`, Deutsch und Englisch).

## Installer bekommen

Gebaut wird auf GitHub Actions (Windows-Runner), Workflow `.github/workflows/desktop-windows.yml`:

- **Manuell:** GitHub → Actions → „Windows-Desktop-App“ → „Run workflow“. Die Dateien liegen danach
  im Lauf unter „Artifacts“ → `playlist-generator-windows` (ZIP mit `nsis/*.exe` und `msi/*.msi`).
- **Release per Klick:** „Run workflow“ → Haken bei **„Als GitHub-Release veröffentlichen“**.
  Der Tag heißt `desktop-v<version aus package.json>` und wird auf dem gebauten Commit angelegt.
  Für ein Update vorher `version` in `package.json` erhöhen (gleiche Version zweimal bricht ab).
  In der Liste der Läufe steht „– mit Release“ bzw. „– nur Build“.
- **Release per Tag:** Tag `desktop-vX.Y.Z` pushen (z. B. `git tag desktop-v1.0.0 && git push origin desktop-v1.0.0`).
- **Pull Requests**, die `src-tauri/`, den Workflow oder `vite.config.ts` ändern, bauen zur Probe
  (nur Artefakt, kein Release).

Das Release enthält Dateien mit festen Namen, die sich über
`https://github.com/KodiniTools/Playlist-Generator/releases/latest/download/<Name>` verlinken lassen:

| Datei                              | Inhalt                               |
| ---------------------------------- | ------------------------------------ |
| `Playlist-Generator-Setup-x64.exe` | Installer (NSIS), Sprache wählbar    |
| `Playlist-Generator-x64-de-DE.msi` | MSI-Paket Deutsch (z. B. für Firmen) |
| `Playlist-Generator-x64-en-US.msi` | MSI-Paket Englisch                   |

Die Versionsnummer kommt aus `package.json` (`version`, für MSI nur `X.Y.Z`).

## Lokal bauen (nur unter Windows)

Voraussetzungen: Node 22, Rust (stable, MSVC), Visual Studio Build Tools („Desktopentwicklung mit C++“).

```bash
npm ci
npm run tauri dev     # App-Fenster mit Vite-Dev-Server
npm run tauri build   # Installer nach src-tauri/target/release/bundle/{nsis,msi}/
```

## Wie es funktioniert

- `vite build --mode desktop` (`npm run build:desktop`) baut mit Basis `/` nach `dist-desktop/`.
  Der Web-Build (`npm run build`, Basis `/playlist_generator/`, `dist/`) und `deploy.sh` bleiben
  unverändert.
- Im Desktop-Build entfernt `vite.config.ts` die SSI-Includes (Navigation, Footer, Cookie-Banner),
  das FontAwesome-CSS der Server-Navigation und das PWA-Manifest aus `index.html`.
  An die Stelle der Server-Navigation tritt eine kleine Leiste mit Sprache (DE/EN) und Farbschema
  (`src/components/app/DesktopBar.vue`). Beim ersten Start gilt die Systemsprache.
- `IS_DESKTOP` (`src/utils/desktop.ts`) schaltet nur in der App:
  kein Service Worker, keine Übergabe an den Texteditor (die App teilt keinen localStorage mit
  kodinitools.com), PayPal-Spende und Facebook-Teilen öffnen die Web-Adressen.
- Audiodateien werden wie im Browser lokal gelesen und abgespielt; nichts wird hochgeladen.
  Drag & Drop von Dateien und Ordnern geht an die Ablagezone der App
  (`disable_drag_drop_handler` in `src-tauri/src/main.rs`).
- Links nach außen (kodinitools.com, PayPal, Facebook) öffnen im Standardbrowser.
- Favicon: Die App nutzt weiter nur `public/favicon.ico`. Das Programm-Icon
  (`src-tauri/icons/`) ist aus `public/icons/icon-512.png` erzeugt (`npx tauri icon`).
- Läuft auf Windows 10/11 mit Microsoft Edge WebView2 (dort vorinstalliert; sonst lädt der
  Installer WebView2 nach).

## Signatur

Die Installer sind nicht signiert. Windows SmartScreen zeigt beim ersten Start
„Der Computer wurde durch Windows geschützt“ → „Weitere Informationen“ → „Trotzdem ausführen“.
Für eine Signatur braucht es ein Code-Signing-Zertifikat (z. B. Azure Trusted Signing oder ein
OV/EV-Zertifikat); das lässt sich später im Workflow ergänzen.
