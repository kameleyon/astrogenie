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
 * Generate personalized welcome message
 */
export async function generateWelcomeMessage(
  name: string,
  sunSign: string,
  moonSign: string,
  ascendant: string,
  significantFeatures: Array<{
    type: string
    description: string
  }>
): Promise<string> {
  const prompt = `Generate a warm, personalized welcome message for an astrology birth chart reading.

Details:
- Name: ${name}
- Sun Sign: ${sunSign}
- Moon Sign: ${moonSign}
- Ascendant: ${ascendant}
- Significant Features: ${significantFeatures.map(f => `${f.type} (${f.description})`).join(', ')}

The message should:
1. Warmly greet them by name
2. Acknowledge their unique combination of Sun, Moon, and Ascendant signs
3. Briefly describe:
   - Their core essence (Sun sign qualities)
   - Their emotional nature (Moon sign qualities)
   - Their outer personality (Ascendant qualities)
4. Highlight one or two significant features from their chart
5. Be encouraging and positive while maintaining astrological accuracy
6. Feel personal and engaging

Keep the tone warm, professional, and insightful. Make them feel seen and understood.
Format as a single, flowing paragraph without technical jargon.`

  return generateWithOpenRouter(prompt)
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

/**
 * Generate aspect interpretation
 */
export async function generateAspectInterpretation(
  planet1: string,
  planet2: string,
  aspectType: string,
  aspectAngle: number,
  orb: number,
  nature: 'harmonious' | 'challenging' | 'neutral'
): Promise<string> {
  const prompt = `Generate a detailed astrological interpretation for an aspect between two planets in a birth chart.
Consider:
- Planet 1: ${planet1}
- Planet 2: ${planet2}
- Aspect Type: ${aspectType}
- Angle: ${aspectAngle} degrees
- Orb: ${orb} degrees
- Nature: ${nature}

Please provide a comprehensive interpretation that includes:
1. The fundamental meaning of this planetary combination
2. How the aspect type influences the interaction between these planets
3. The significance of the orb (tighter orbs have stronger influence)
4. The psychological dynamics represented
5. Potential manifestations in life experiences
6. Traditional and modern interpretations
7. Constructive ways to work with this energy

Format the response in clear paragraphs without headings.`

  return generateWithOpenRouter(prompt)
}

/**
 * Generate aspect pattern interpretation
 */
export async function generateAspectPatternInterpretation(
  patternType: string,
  planets: string[],
  aspects: Array<{planet1: string, planet2: string, aspectType: string}>
): Promise<string> {
  const prompt = `Generate a detailed interpretation for a ${patternType} aspect pattern in a birth chart.
Pattern involves:
- Planets: ${planets.join(', ')}
- Aspects: ${aspects.map(a => `${a.planet1} ${a.aspectType} ${a.planet2}`).join(', ')}

Please provide a comprehensive interpretation that includes:
1. The significance of this aspect pattern
2. How the involved planets work together
3. The psychological dynamics represented
4. Potential manifestations in life experiences
5. Challenges and opportunities presented
6. Ways to consciously work with this energy

Format the response in clear paragraphs without headings.`

  return generateWithOpenRouter(prompt)
}
