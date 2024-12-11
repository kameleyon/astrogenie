import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { isTrine, isSextile, isOpposition, toPlanetData } from './utils'

/**
 * Detect Shield pattern
 * Requirements:
 * 1. Two planets in trine (120°) forming one side
 * 2. Another trine connecting to a third planet
 * 3. Two sextiles (60°) connecting to a fourth planet
 * 4. An opposition (180°) across the pattern
 */
export function detectShield(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  console.debug('Checking for Shield patterns...')

  for (let i = 0; i < planets.length - 3; i++) {
    for (let j = i + 1; j < planets.length - 2; j++) {
      for (let k = j + 1; k < planets.length - 1; k++) {
        for (let l = k + 1; l < planets.length; l++) {
          const [p1, p2, p3, p4] = [planets[i], planets[j], planets[k], planets[l]]

          if (
            // Check trines forming the base
            isTrine(p1, p2) && isTrine(p2, p3) &&
            // Check sextiles to the fourth planet
            isSextile(p3, p4) && isSextile(p4, p1) &&
            // Check opposition across the pattern
            isOpposition(p1, p3)
          ) {
            console.debug(`Shield pattern found:`)
            console.debug(`Base trines:`)
            console.debug(`- ${p1.name} at ${p1.formatted} ${p1.sign}`)
            console.debug(`- ${p2.name} at ${p2.formatted} ${p2.sign}`)
            console.debug(`- ${p3.name} at ${p3.formatted} ${p3.sign}`)
            console.debug(`Connecting point:`)
            console.debug(`- ${p4.name} at ${p4.formatted} ${p4.sign}`)

            const patternPlanets = [p1, p2, p3, p4].map(p => ({
              ...toPlanetData(p),
              position: `${p.formatted} ${p.sign}`
            }))

            patterns.push({
              name: 'Shield',
              planets: patternPlanets,
              description: `${p1.name}, ${p2.name}, and ${p3.name} connected by trines and opposition, with ${p4.name} forming sextiles`
            })
          }
        }
      }
    }
  }

  return patterns
}
