export function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/** A random tile order for a jigsaw, guaranteed not to already be solved. */
export function scrambleTiles(count: number): number[] {
  const solved = Array.from({ length: count }, (_, i) => i)
  let order = shuffle(solved)
  while (order.every((tile, i) => tile === i)) order = shuffle(solved)
  return order
}
