const QUOTES_BY_TIER: { minScore: number; quotes: string[] }[] = [
  {
    minScore: 9,
    quotes: [
      'Genius-level IQ detected! Your brain is basically a walking world atlas.',
      'Einstein would ask YOU for directions. Absolutely brilliant!',
      'Top of the class! Your mind travels faster than light.',
    ],
  },
  {
    minScore: 6,
    quotes: [
      'Sharp mind! Your IQ is clearly well above sea level.',
      "Impressive! A few more trips around the globe and you'll be unstoppable.",
      'Big-brain energy! Keep exploring and nothing can stop you.',
    ],
  },
  {
    minScore: 3,
    quotes: [
      'Your brain is warming up nicely. Every great explorer started right here!',
      'Solid effort! Curiosity is the secret ingredient of a high IQ, and you have plenty.',
      'Getting smarter with every spin. Play again and watch that score climb!',
    ],
  },
  {
    minScore: 0,
    quotes: [
      'Every genius starts somewhere. Today you started your world tour!',
      "Mistakes are proof you're trying. Your brain just grew a little bigger.",
      "Columbus got lost too, and he still made history. Go again, you've got this!",
    ],
  },
]

/** A motivational quote for the score. `roll` is a random number in [0, 1). */
export function getQuote(score: number, roll: number): string {
  const tier = QUOTES_BY_TIER.find((t) => score >= t.minScore) ?? QUOTES_BY_TIER[QUOTES_BY_TIER.length - 1]
  return tier.quotes[Math.floor(roll * tier.quotes.length)]
}
