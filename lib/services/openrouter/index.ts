const OPENROUTER_API_KEY = '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'
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

/**
 * Generate text using OpenRouter API
 */
export async function generateWithOpenRouter(prompt: string): Promise<string> {
  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://astrogenie.app',
      },
      body: JSON.stringify({
        model: 'google/gemini-flash-1.5-8b',
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`)
    }

    const data: OpenRouterResponse = await response.json()
    return data.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('Error generating text with OpenRouter:', error)
    throw error
  }
}

/**
 * Generate house interpretation
 */
export async function generateHouseInterpretation(
  house: number,
  element: string,
  quality: string,
  ruler: string,
  occupants: string[]
): Promise<string> {
  const prompt = `Generate a detailed astrological interpretation for House ${house} in a birth chart.
Consider:
- Element: ${element}
- Quality/Modality: ${quality}
- Ruling Planet: ${ruler}
${occupants.length > 0 ? `- Occupied by planets: ${occupants.join(', ')}` : '- No planets in this house'}

Please provide a comprehensive interpretation that includes:
1. The fundamental meaning and significance of this house
2. How the house's element and quality influence its expression
3. The role of the ruling planet
4. If there are planets in the house, their impact
5. Key life areas and matters governed by this house
6. Traditional and modern interpretations

Format the response in clear paragraphs without headings.`

  return generateWithOpenRouter(prompt)
}
