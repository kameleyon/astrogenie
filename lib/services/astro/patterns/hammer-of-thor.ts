import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { isSquare, isSesquiquadrate, toPlanetData } from './utils'

/**
 * Detect Hammer of Thor pattern (two planets in square with both sesquiquadrate to a third)
 */
export function detectHammerOfThor(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []

  for (let i = 0; i < planets.length - 2; i++) {
    for (let j = i + 1; j < planets.length - 1; j++) {
      for (let k = j + 1; k < planets.length; k++) {
        const [p1, p2, p3] = [planets[i], planets[j], planets[k]]

        if (
          isSquare(p1, p2) &&
          isSesquiquadrate(p1, p3) &&
          isSesquiquadrate(p2, p3)
        ) {
          patterns.push({
            name: 'Hammer of Thor',
            planets: [p1, p2, p3].map(toPlanetData),
            description: 'Two planets in square, both sesquiquadrate to a third planet.'
          })
        }
      }
    }
  }

  return patterns
}
