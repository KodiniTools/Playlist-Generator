# UI-Komponenten (Modernisierung, Phase 1)

Bausteine des Zielbilds aus dem Design-Canvas (Reihe „Nachher“). Alle Komponenten:

- `<script setup lang="ts">` mit typisierten Props, Vue 3.5 (`defineModel`, `useId`).
- Styling ausschließlich über `--ds-*` Tokens aus `src/design-system/tokens-v2.css`.
- Native Elemente (`<button>`, `<input>`, `<label>`, `<section>`), Fokus-Ring statt Glow.
- Icons kommen über Slots als Inline-SVG. Empfohlen für die Migration: `lucide-vue-next`, Stroke 1.75.
- Je ein Vitest unter `__tests__/`.

```ts
import { UiButton, UiPanel, UiTextField } from '@/components/ui'
```

| Komponente           | Zweck                                                       | Wichtige Props / Events                                                                                                               |
| -------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `UiButton`           | Textbutton; `href` = Link, `to` = RouterLink                | `variant` primary · secondary · ghost · danger, `size` sm · md · lg, `block`, `href`, Slot `icon`                                     |
| `UiCallout`          | Ruhiger Hinweis im Textfluss                                | `type` info · success · warning · danger, `title`, Slot default                                                                       |
| `UiIconButton`       | Quadratischer Icon-Button                                   | `label` (Pflicht, wird aria-label), `variant`, `size` sm · md, `round`, `pressed` (aria-pressed)                                      |
| `UiSegmentedControl` | Eine Option aus wenigen, Radiogroup-Muster                  | `v-model`, `options` `{ value, label, disabled? }`, `label`, `size`; Pfeiltasten wechseln                                             |
| `UiSelect`           | Natives Select im System-Look                               | `v-model`, `options`, `label` (Pflicht), `inline`, `labelHidden`, `size`; Attrs → select                                              |
| `UiTextField`        | Einzeiliges Textfeld mit Label                              | `v-model`, `label`, `hint`, `error` (aria-invalid, role=alert), `required`, `disabled`, Attrs → input                                 |
| `UiPanel`            | Flache Fläche mit Kopfzeile                                 | `title`, `headingLevel` 2 · 3, `count`, `padded`, Slot `actions`                                                                      |
| `UiToast`            | Benachrichtigung                                            | `message`, `type` success · error · info, `actionLabel`, `dismissLabel`, `dismissOnClick`; Events `action`, `dismiss`                 |
| `UiDialog`           | Modaler Dialog, teleportiert nach body                      | `open`, `title`, `description`, `id` (für aria-controls), Slots default · `footer`; Event `close` (Escape, Hintergrund, Button)       |
| `UiKbd`              | Tastenkombination                                           | `keys: string[]`                                                                                                                      |
| `UiEmptyState`       | Leerzustand                                                 | `title`, `text`, Slots `icon` · `action`                                                                                              |
| `UiFileList`         | Dateiliste als DOM-Liste (ersetzt die frühere Canvas-Liste) | `items`, `v-model:selectedIndex`, `v-model:checked`, `playingIndex`, `isPlaying`, `labels`; Events `play`, `remove`, `move(from, to)` |

## Beispiel

```vue
<template>
  <UiPanel title="Dateien" :count="files.length">
    <template #actions>
      <UiButton variant="secondary">
        <template #icon><FolderIcon /></template>
        Ordner
      </UiButton>
      <UiButton variant="primary">Dateien hinzufügen</UiButton>
    </template>

    <UiSegmentedControl v-model="sort" label="Sortierung" :options="sortOptions" />
    <UiTextField v-model="name" label="Name der Wiedergabeliste" />
  </UiPanel>

  <UiDialog :open="confirmOpen" title="Liste leeren?" @close="confirmOpen = false">
    <template #footer>
      <UiButton @click="confirmOpen = false">Abbrechen</UiButton>
      <UiButton variant="danger" @click="clear">Leeren</UiButton>
    </template>
  </UiDialog>
</template>
```

## Regeln

- Keine Gradients, kein Glow, keine Scale-Hover. Hover ändert nur Farbe, 150 ms.
- Ein Rahmen (1 px), drei Radien (`--ds-radius-sm | -md | -lg`), Schatten nur in Toast und Dialog.
- Primär ist die einzige Goldfläche pro Ansicht. Danger ist textbasiert, Vollfläche nur im Dialog-Footer.
- Neue Komponenten kommen mit Test und landen im Barrel `index.ts`.

## UiFileList

Ersetzt die gezeichnete Canvas-Liste durch echte Zeilen: Griff, Häkchen, Name, Format-Chip, Dauer,
Größe und Aktionen. Die Schnittstelle entspricht der früheren Canvas-Liste, nur mit generischen
Einträgen statt `File`-Objekten:

```ts
interface FileListItem {
  id: string
  name: string
  size: number // Bytes
  duration?: number | null // Sekunden, null = noch unbekannt
}
```

- `v-model:selectedIndex`: markierte Zeile (-1 = keine). Pfeiltasten, Pos1/Ende, Enter (abspielen),
  Leertaste (Häkchen), Entf (entfernen), Escape (Auswahl aufheben), Alt+Pfeil (verschieben).
- `v-model:checked`: ids, die in die Wiedergabeliste aufgenommen werden. Ohne Angabe gelten alle als
  aufgenommen. Die Summenzeile zählt nur angehakte Titel; fehlt eine Dauer, wird wie bisher aus Format
  und Größe geschätzt und mit `~` markiert.
- `move(from, to)`: `to` ist der Index im Endzustand, genau wie `usePlaylist.moveFile`.
- Umsortieren per Pointer am Griff (Maus und Touch, Autoscroll am Rand) oder per Alt+Pfeil.
- Tasten, die die Liste verarbeitet, werden nicht an `window` weitergereicht. Der globale Handler in
  `AppPage.vue` greift also nur, wenn die Liste keinen Fokus hat.
- Bei sehr großen Listen (mehrere tausend Einträge) wäre Virtualisierung der nächste Schritt; die
  Liste rendert aktuell alle Zeilen.

Adapter für die Migration (Phase 2): `files.map((file) => ({ id: file.name, name: file.name, size:
file.size, duration: getDuration(file.name) }))` aus `useDurations`, `checked` aus `isFileSelected`.

## Noch nicht enthalten

- Dropzone und Switch folgen mit der weiteren App-Seite.
- Die App-Seite ist komplett umgestellt: `AppPage`, `AppHeader`, `OnboardingBanner`, `ToolsGrid`,
  `PlaylistConfig`, `PlaylistPreview`, `UndoRedoControls`, `ToastContainer`, `AudioPlayer` und
  `KeyboardShortcutsPanel`. Landing-, FAQ- und Blog-Seite laufen ebenfalls komplett auf `--ds-*`
  (AppHeader, UiButton mit `to`, UiCallout). Der Test `views/__tests__/tokensV2.spec.ts` hält diese
  Dateien frei von v1-Variablen, Gradients, rgba() und `.light-theme`-Regeln.
- `src/assets/main.css` enthält nur noch Token-Imports, Schrift, Reset, Body, die Angleichung des
  SSI-Footers (auf Elemente außerhalb von `#app` begrenzt), reduzierte Bewegung und Druck, alles auf
  `--ds-*`. Globale Element-Regeln (`header`, `details`, `input`, …) gibt es nicht mehr; der Test
  `tokensV2.spec.ts` verhindert ihre Rückkehr.
- Noch auf v1: nur die SSI-Partials außerhalb des Repos (deshalb bleibt `tokens.css` eingebunden).
  Im Repo gibt es keine v1-Nutzer mehr; die Alt-Komponenten und Vue-Starter-Reste sind gelöscht.
