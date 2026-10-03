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

| Komponente           | Zweck                                      | Wichtige Props / Events                                                                               |
| -------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `UiButton`           | Textbutton                                 | `variant` primary · secondary · ghost · danger, `size` sm · md · lg, `block`, Slot `icon`             |
| `UiIconButton`       | Quadratischer Icon-Button                  | `label` (Pflicht, wird aria-label), `variant`, `size` sm · md, `round`, `pressed` (aria-pressed)      |
| `UiSegmentedControl` | Eine Option aus wenigen, Radiogroup-Muster | `v-model`, `options` `{ value, label, disabled? }`, `label`, `size`; Pfeiltasten wechseln             |
| `UiTextField`        | Einzeiliges Textfeld mit Label             | `v-model`, `label`, `hint`, `error` (aria-invalid, role=alert), `required`, `disabled`, Attrs → input |
| `UiPanel`            | Flache Fläche mit Kopfzeile                | `title`, `headingLevel` 2 · 3, `count`, `padded`, Slot `actions`                                      |
| `UiToast`            | Benachrichtigung                           | `message`, `type` success · error · info, `actionLabel`; Events `action`, `dismiss`                   |
| `UiDialog`           | Modaler Dialog, teleportiert nach body     | `open`, `title`, `description`, Slots default · `footer`; Event `close` (Escape, Hintergrund, Button) |
| `UiKbd`              | Tastenkombination                          | `keys: string[]`                                                                                      |
| `UiEmptyState`       | Leerzustand                                | `title`, `text`, Slots `icon` · `action`                                                              |

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

## Noch nicht enthalten

- Dateiliste (`UiFileList`), Dropzone, Select und Switch folgen in Phase 2 mit der App-Seite.
- Die bestehenden Komponenten (`PlaylistConfig`, `PlaylistPreview`, …) nutzen diese Bausteine noch nicht.
