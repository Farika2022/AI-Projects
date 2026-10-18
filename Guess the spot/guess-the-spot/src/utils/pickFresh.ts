/**
 * Pick a random index in [0, count) that differs from the one picked last time for this id,
 * so a landmark doesn't show the same fact or question twice in a row (remembered across games).
 */
export function pickFresh(storageKey: string, id: string, count: number): number {
  let last: Record<string, number> = {}
  try {
    last = JSON.parse(localStorage.getItem(storageKey) ?? '{}') as Record<string, number>
  } catch {
    // Storage unavailable or corrupt — fall back to a plain random pick.
  }

  const previous = last[id]
  const choices = Array.from({ length: count }, (_, i) => i).filter((i) => count === 1 || i !== previous)
  const index = choices[Math.floor(Math.random() * choices.length)]

  try {
    localStorage.setItem(storageKey, JSON.stringify({ ...last, [id]: index }))
  } catch {
    // Not remembered this time; that's fine.
  }
  return index
}
