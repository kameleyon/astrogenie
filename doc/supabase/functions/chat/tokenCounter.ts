// Simple token counter based on GPT-3 tokenizer approximation
export function countTokens(text: string): number {
  // This is a simple approximation. For production, you might want to use a proper tokenizer
  const words = text.trim().split(/\s+/)
  return Math.ceil(words.length * 1.3) // Rough estimate: 1 word ≈ 1.3 tokens
}