# Design-System · Tokens

Design Tokens des Playlist Generators, extrahiert aus `src/assets/main.css` und den scoped Styles der
Vue-Komponenten. Visuelle Referenz: Design-Canvas
[Playlist Generator Design System](https://claude.ai/artifact/7s6DErko6GCkaAdqWXkKSu).

## Dateien

| Datei                      | Zweck                                                                                          |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| `tokens.css`               | **Laufzeit-Quelle.** Alle CSS Custom Properties (Dark auf `:root`, Light auf `.light-theme`).  |
| `tokens.json`              | Maschinenlesbare Fassung (an das W3C-Design-Tokens-Format angelehnt), `$extensions.css` = Var. |
| `tokens.ts`                | Typisierter Zugriff für JS/TS (`colorToken`, `themeColors`, `cssVar`, `breakpoints`).          |
| `__tests__/tokens.spec.ts` | Hält JSON, CSS und `main.css` konsistent (siehe unten).                                        |

`main.css` bindet `tokens.css` per `@import` ein und definiert selbst keine Variablen mehr.

## Theme-Mechanik

`useTheme.js` setzt `body.light-theme` (für die App) und `html[data-theme="light"]` (für die
SSI-Partials). Dark ist Standard. Tokens, die andere Variablen referenzieren (`--shadow-panel`,
`--shadow-focus-ring`, …), sind in `.light-theme` erneut deklariert, weil `var()` innerhalb einer
Custom Property auf dem deklarierenden Element aufgelöst wird.

## Verwendung

```css
/* In Komponenten: bestehende Variablen bleiben unverändert gültig */
.panel {
  background: var(--panel-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-panel);
  padding: var(--space-24);
  box-shadow: var(--shadow-panel);
  transition: border-color var(--duration-base) var(--ease-standard);
}
```

```ts
import { colorToken, themeColors, breakpoints } from '@/design-system/tokens'

colorToken('dark', 'accent') // '#c9984d'
themeColors('light').bg // '#f5f4d6'
breakpoints.tablet // 768
```

## Token-Gruppen

- **color.dark / color.light**: 16 Farben je Theme, Variablennamen wie bisher (`--accent-color`, …).
- **ssi.dark / ssi.light**: `--color-*`-Spiegel für Nav, Footer und Cookie-Banner. Nicht in der App nutzen.
- **typography**: `--font-family-*`, `--font-size-*` (rem-Skala zu 15px), `--font-weight-*`,
  `--line-height-*`, `--letter-spacing-*`.
- **spacing**: `--space-3` … `--space-50`, Schlüssel = Pixelwert.
- **radius**: semantisch (`--radius-control` 8px, `--radius-input` 12px, `--radius-panel` 16px, …).
- **shadow**: `--shadow-card`, `--shadow-dialog`, theme-abhängig `--shadow-panel`, `--shadow-button-hover`,
  `--shadow-glow`, `--shadow-focus-ring`.
- **motion**: `--duration-*` (0.15s … 0.8s), `--ease-standard | -emphasized | -spring`.
- **layout / zIndex**: `--container-max-width`, `--grid-gap`, `--player-bar-height`, `--z-*`.
  Breakpoints (768 / 540 / 480) nur im JSON und in `tokens.ts`, da in Media Queries keine Variablen möglich sind.

## Token hinzufügen oder ändern

1. Wert in `tokens.json` eintragen (mit `$extensions.css`).
2. Dieselbe Variable in `tokens.css` setzen (theme-abhängig in `:root` **und** `.light-theme`).
3. `npm run test:unit` ausführen. Der Test schlägt fehl bei Abweichungen zwischen JSON und CSS,
   fehlenden Light-Gegenstücken, Variablen ohne JSON-Eintrag oder `var()`-Nutzungen ohne Definition
   und ohne Fallback.

## Bekannte Abweichungen im Code (nicht Teil der Tokens)

- `FileListCanvas.vue` zeichnet mit einer eigenen, älteren Palette (`#F2E28E`, `#A28680`, `#0C0C10`).
  Migration auf `themeColors()` aus `tokens.ts` ist der nächste sinnvolle Schritt.
- Legacy-Hover-Tints `rgba(242, 226, 142, …)` / `rgba(162, 134, 128, …)` sowie schwarze Gradients
  `rgba(12, 12, 16, …)` / `rgba(22, 22, 28, …)` in Page-Header, Player-Bar, Feature-Cards, Onboarding.
- `--text-secondary` (PlaylistConfig) und `--card-bg` (AudioPlayer) sind nirgends definiert und laufen
  auf ihren Fallback.
- Supreme ist nur in 400 geladen, Gewichte 500–700 werden synthetisiert.
- Primär-Buttons: Navy-Text auf dem Blau-Ende des Gradients erreicht nur etwa 2.3:1 Kontrast.
