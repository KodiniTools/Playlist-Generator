/** Wie Titel für eine Ziel-Länge gewählt werden. */
export type FillMode = 'order' | 'random'

/**
 * Wählt Einträge, deren Gesamtdauer die Ziel-Länge nicht überschreitet.
 * - `order`: der längste Anfang der Liste, der hineinpasst (vorhersehbarer Schnitt).
 * - `random`: zufällige Reihenfolge; was nicht mehr passt, wird übersprungen,
 *   damit die Ziel-Länge möglichst gut gefüllt wird.
 */
export function pickForTarget<T>(
  entries: readonly { item: T; seconds: number }[],
  targetSeconds: number,
  mode: FillMode,
  random: () => number = Math.random,
): Set<T> {
  const picked = new Set<T>()
  if (!(targetSeconds > 0)) return picked

  const candidates = entries.slice()
  if (mode === 'random') {
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      ;[candidates[i], candidates[j]] = [candidates[j]!, candidates[i]!]
    }
  }

  let total = 0
  for (const { item, seconds } of candidates) {
    if (total + seconds > targetSeconds) {
      if (mode === 'order') break
      continue
    }
    total += seconds
    picked.add(item)
  }
  return picked
}
