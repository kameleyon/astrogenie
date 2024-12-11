import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { isSextile, isOpposition, toPlanetData } from './utils'

/**
 * Detect Diamond pattern
 * Requirements:
 * 1. Four planets connected by sextiles (60°) around the perimeter
 * 2. Two pairs of planets in opposition (180°) across the center
 * Creating a diamond shape with balanced aspects
 */
export function detectDiamond(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  console.debug('Checking for Diamond patterns...')

  for (let i = 0; i < planets.length - 3; i++) {
    for (let j = i + 1; j < planets.length - 2; j++) {
      for (let k = j + 1; k < planets.length - 1; k++) {
        for (let l = k + 1; l < planets.length; l++) {
          const [p1, p2, p3, p4] = [planets[i], planets[j], planets[k], planets[l]]

          if (
            // Check sextiles around the perimeter
            isSextile(p1, p2) && isSextile(p2, p3) &&
            isSextile(p3, p4) && isSextile(p4, p1) &&
            // Check oppositions across the center
            isOpposition(p1, p3) && isOpposition(p2, p4)
          ) {
            console.debug(`Diamond pattern found:`)
            console.debug(`First opposition:`)
            console.debug(`- ${p1.name} at ${p1.formatted} ${p1.sign}`)
            console.debug(`- ${p3.name} at ${p3.formatted} ${p3.sign}`)
            console.debug(`Second opposition:`)
            console.debug(`- ${p2.name} at ${p2.formatted} ${p2.sign}`)
            console.debug(`- ${p4.name} at ${p4.formatted} ${p4.sign}`)

            const patternPlanets = [p1, p2, p3, p4].map(p => ({
              ...toPlanetData(p),
              position: `${p.formatted} ${p.sign}`
            }))

            patterns.push({
              name: 'Diamond',
              planets: patternPlanets,
              description: `${p1.name}-${p3.name} and ${p2.name}-${p4.name} in opposition, connected by sextiles forming a diamond shape`
            })
          }
        }
      }
    }
  }

  return patterns
}
