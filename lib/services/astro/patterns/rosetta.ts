import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { isConjunction, isSquare, isOpposition, toPlanetData } from './utils'

/**
 * Detect Rosetta pattern
 * Requirements:
 * 1. Two pairs of planets in conjunction (0°)
 * 2. The pairs form squares (90°) and oppositions (180°) with each other
 */
export function detectRosetta(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  console.debug('Checking for Rosetta patterns...')

  for (let i = 0; i < planets.length - 3; i++) {
    for (let j = i + 1; j < planets.length - 2; j++) {
      for (let k = j + 1; k < planets.length - 1; k++) {
        for (let l = k + 1; l < planets.length; l++) {
          const [p1, p2, p3, p4] = [planets[i], planets[j], planets[k], planets[l]]

          if (
            // Check conjunctions between pairs
            isConjunction(p1, p2) && isConjunction(p3, p4) &&
            // Check squares between pairs
            isSquare(p1, p3) && isSquare(p2, p4) &&
            // Check oppositions between pairs
            isOpposition(p1, p4) && isOpposition(p2, p3)
          ) {
            console.debug(`Rosetta pattern found:`)
            console.debug(`First conjunction:`)
            console.debug(`- ${p1.name} at ${p1.formatted} ${p1.sign}`)
            console.debug(`- ${p2.name} at ${p2.formatted} ${p2.sign}`)
            console.debug(`Second conjunction:`)
            console.debug(`- ${p3.name} at ${p3.formatted} ${p3.sign}`)
            console.debug(`- ${p4.name} at ${p4.formatted} ${p4.sign}`)

            const patternPlanets = [p1, p2, p3, p4].map(p => ({
              ...toPlanetData(p),
              position: `${p.formatted} ${p.sign}`
            }))

            patterns.push({
              name: 'Rosetta',
              planets: patternPlanets,
              description: `${p1.name}-${p2.name} and ${p3.name}-${p4.name} in conjunction, forming squares and oppositions`
            })
          }
        }
      }
    }
  }

  return patterns
}
