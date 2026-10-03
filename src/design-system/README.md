# Design-System · Tokens

Design Tokens des Playlist Generators. Visuelle Referenz: Design-Canvas
[Playlist Generator Design System](https://claude.ai/artifact/7s6DErko6GCkaAdqWXkKSu).

Es gibt zwei Sets, die parallel geladen werden:

| Set    | Namespace          | Status                                                                                                                                 |
| ------ | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| **v1** | `--accent-color` … | Ursprünglicher Ist-Zustand. Im Repo nur noch von nicht eingebundenen Alt-Komponenten genutzt; bleibt für die SSI-Partials eingebunden. |
| **v2** | `--ds-*`           | Zielbild der Modernisierung. App, Seiten und `main.css` laufen darauf; v1 fällt, sobald die Partials umgestellt sind.                  |

## Dateien

| Datei                            | Zweck                                                                                    |
| -------------------------------- | ---------------------------------------------------------------------------------------- |
| `tokens.css` / `tokens-v2.css`   | **Laufzeit-Quellen.** CSS Custom Properties, Dark auf `:root`, Light auf `.light-theme`. |
| `tokens.json` / `tokens-v2.json` | Maschinenlesbare Fassung (W3C-Design-Tokens-nah), `$extensions.css` nennt die Variable.  |
| `tokens.ts` / `tokens-v2.ts`     | Typisierter Zugriff für JS/TS.                                                           |
| `__tests__/tokens.spec.ts`       | Konsistenz v1: JSON ↔ CSS ↔ `main.css`, `var()`-Nutzung in Komponenten.                  |
| `__tests__/tokens-v2.spec.ts`    | Konsistenz v2 plus Namespace-Schutz und Kontrast-Audit (WCAG AA).                        |
| `__tests__/tokenTestUtils.ts`    | Gemeinsame Helfer: CSS-Block-Parser, Token-Walker, Kontrastberechnung.                   |

`main.css` bindet beide CSS-Dateien per `@import` ein, definiert selbst keine Variablen und enthält
nur noch globale Basis-Regeln (Reset, Body, SSI-Footer, Bewegung, Druck) auf `--ds-*`.

## Theme-Mechanik

`useTheme.js` setzt `body.light-theme` (für die App) und `html[data-theme="light"]` (für die
SSI-Partials). Dark ist Standard. Tokens, die andere Variablen referenzieren, sind in den
Light-Selektoren erneut deklariert, weil `var()` innerhalb einer Custom Property auf dem
deklarierenden Element aufgelöst wird. In v2 tragen beide Light-Selektoren den vollständigen Satz,
damit auch die Partials `--ds-*` nutzen können.

## v2 verwenden

```css
.panel {
  background: var(--ds-surface-1);
  border: var(--ds-border-width) solid var(--ds-border);
  border-radius: var(--ds-radius-lg);
  padding: var(--ds-space-5);
}

.button-primary {
  height: var(--ds-control-md);
  padding: 0 var(--ds-space-4);
  border-radius: var(--ds-radius-md);
  background: var(--ds-accent);
  color: var(--ds-on-accent);
  font-weight: var(--ds-weight-semibold);
  transition: background var(--ds-duration) var(--ds-ease);
}

.button-primary:hover {
  background: var(--ds-accent-hover);
}

.button-primary:focus-visible {
  outline: none;
  box-shadow: var(--ds-focus-ring);
}
```

```ts
import { colorTokenV2, themeColorsV2, controlSizesV2 } from '@/design-system/tokens-v2'

colorTokenV2('dark', 'accent') // '#d4a257'
themeColorsV2('light').surface1 // '#ffffff'
controlSizesV2.row // 44
```

## v2 Token-Gruppen

- **color**: `--ds-surface-0…3`, `--ds-border`, `--ds-border-strong`, `--ds-text`, `--ds-text-2`,
  `--ds-text-3`, `--ds-accent`, `--ds-accent-hover`, `--ds-accent-soft`, `--ds-on-accent`, `--ds-link`,
  `--ds-success | -warning | -danger | -info`.
- **effect**: `--ds-focus-ring` (2 px Abstand, 2 px Gold), `--ds-shadow-overlay` (einziger Schatten).
- **typography**: `--ds-font-sans`, `--ds-font-mono`, `--ds-text-xs … -3xl` (12 · 13 · 14 · 16 · 20 · 24 · 32),
  `--ds-weight-*`, `--ds-leading`, `--ds-leading-tight`, `--ds-tracking-tight`.
- **spacing**: `--ds-space-1 … -16` im 4er-Raster.
- **radius / border**: `--ds-radius-sm | -md | -lg | -full` (6 / 10 / 16 / 999), `--ds-border-width` 1 px.
- **motion**: `--ds-duration` 150 ms, `--ds-duration-slow` 250 ms, `--ds-ease`.
- **size**: `--ds-control-sm | -md | -lg` (28 / 36 / 40), `--ds-row-height` 44, `--ds-topbar-height`,
  `--ds-player-height`, `--ds-icon-sm | -md`, `--ds-icon-stroke`.
- **layout / zIndex**: `--ds-container`, `--ds-gutter`, `--ds-gap`, `--ds-z-*`. Breakpoints nur im JSON.

## Regeln für v2

- Gold ist Vollfläche für Primäraktion, Fokus und aktive Zustände. Keine Gradients, kein Glow.
- Ein Rahmen: 1 px. Drei Radien: 6 / 10 / 16. Schatten nur für Overlays.
- Hover ändert Farbe, nie Größe. 150 ms, nur Opacity und Transform animieren.
- Icons aus einem Set (Lucide, Stroke 1.75), keine Emoji.
- Textfarben erreichen auf allen Flächen mindestens 4.5:1, Status- und Linkfarben als Text auf Panels
  ebenfalls. Der Test `tokens-v2.spec.ts` erzwingt das; wer einen Wert ändert, muss den Kontrast halten.

## Token hinzufügen oder ändern

1. Wert im passenden JSON eintragen (mit `$extensions.css`).
2. Dieselbe Variable in der passenden CSS-Datei setzen (theme-abhängig in `:root` **und** beiden Light-Selektoren).
3. `npm run test:unit` ausführen. Die Tests schlagen fehl bei Abweichungen zwischen JSON und CSS,
   fehlenden Light-Gegenstücken, Variablen ohne JSON-Eintrag, Namespace-Kollisionen zwischen v1 und v2,
   Kontrastverstößen in v2 und `var()`-Nutzungen ohne Definition und ohne Fallback.

## Migration v1 → v2

| v1                                        | v2                                            |
| ----------------------------------------- | --------------------------------------------- | --- | ---- |
| `--bg-color`, `--bg-secondary` (Gradient) | `--ds-surface-0` (flach)                      |
| `--panel-color`                           | `--ds-surface-1`                              |
| `--input-bg`, `--btn-color`               | `--ds-surface-2`                              |
| `--border-color`                          | `--ds-border`, Felder `--ds-border-strong`    |
| `--text-color`, `--muted-color`           | `--ds-text`, `--ds-text-2`, `--ds-text-3`     |
| Gradient Gold → Blau                      | `--ds-accent` als Vollfläche                  |
| `--glow-color` (Fokus, Hover)             | `--ds-focus-ring`, Hover `--ds-accent-hover`  |
| `--shadow-*` auf Karten und Buttons       | kein Schatten; Overlays `--ds-shadow-overlay` |
| Radien 5–25 px                            | `--ds-radius-sm                               | -md | -lg` |

## Bekannte Abweichungen im Code (nicht Teil der Tokens)

- Legacy-Hover-Tints `rgba(242, 226, 142, …)` / `rgba(162, 134, 128, …)` sowie schwarze Gradients
  `rgba(12, 12, 16, …)` / `rgba(22, 22, 28, …)` in Page-Header, Player-Bar, Feature-Cards, Onboarding.
- `--text-secondary` (PlaylistConfig) und `--card-bg` (AudioPlayer) sind nirgends definiert und laufen
  auf ihren Fallback.
- Supreme ist nur in 400 geladen, Gewichte 500–700 werden synthetisiert.
- Primär-Buttons (v1): Navy-Text auf dem Blau-Ende des Gradients erreicht nur etwa 2.3:1 Kontrast.
