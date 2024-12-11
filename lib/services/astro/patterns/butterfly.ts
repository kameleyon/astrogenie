import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { isTrine, isSextile, toPlanetData } from './utils'

/**
 * Detect Butterfly pattern
 * Requirements:
 * 1. Two pairs of planets in trine (120°)
 * 2. Connected by sextiles (60°) between the pairs
 * Creating a butterfly-like shape with harmonious aspects
 */
export function detectButterfly(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  console.debug('Checking for Butterfly patterns...')

  for (let i = 0; i < planets.length - 3; i++) {
    for (let j = i + 1; j < planets.length - 2; j++) {
      for (let k = j + 1; k < planets.length - 1; k++) {
        for (let l = k + 1; l < planets.length; l++) {
          const [p1, p2, p3, p4] = [planets[i], planets[j], planets[k], planets[l]]

          if (
            // First pair in trine
            isTrine(p1, p2) &&
            // Second pair in trine
            isTrine(p3, p4) &&
            // Connecting sextiles
            isSextile(p2, p3) && isSextile(p4, p1)
          ) {
            console.debug(`Butterfly pattern found:`)
            console.debug(`First trine:`)
            console.debug(`- ${p1.name} at ${p1.formatted} ${p1.sign}`)
            console.debug(`- ${p2.name} at ${p2.formatted} ${p2.sign}`)
            console.debug(`Second trine:`)
            console.debug(`- ${p3.name} at ${p3.formatted} ${p3.sign}`)
            console.debug(`- ${p4.name} at ${p4.formatted} ${p4.sign}`)

            const patternPlanets = [p1, p2, p3, p4].map(p => ({
              ...toPlanetData(p),
              position: `${p.formatted} ${p.sign}`
            }))

            patterns.push({
              name: 'Butterfly',
              planets: patternPlanets,
              description: `${p1.name}-${p2.name} and ${p3.name}-${p4.name} in trines, connected by sextiles forming a butterfly shape`
            })
          }
        }
      }
    }
  }

  return patterns
}
