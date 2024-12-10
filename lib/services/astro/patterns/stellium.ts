import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { isConjunction, toPlanetData } from './utils'

/**
 * Detect Stellium pattern (three or more planets in close conjunction)
 */
export function detectStellium(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []

  for (let i = 0; i < planets.length - 2; i++) {
    const group = [planets[i]]

    for (let j = i + 1; j < planets.length; j++) {
      if (isConjunction(planets[i], planets[j], 8)) {
        group.push(planets[j])
      }
    }

    if (group.length >= 3) {
      patterns.push({
        name: 'Stellium',
        planets: group.map(toPlanetData),
        description: 'Three or more planets in close conjunction.'
      })
    }
  }

  return patterns
}
