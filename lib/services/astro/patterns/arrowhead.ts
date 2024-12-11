import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { isSextile, isTrine, isOpposition, toPlanetData } from './utils'

/**
 * Detect Arrowhead pattern
 * Requirements:
 * 1. Two planets in sextile (60°)
 * 2. Both planets form either trine (120°) or opposition (180°) to a third planet
 * Creating an arrow-like triangular shape
 */
export function detectArrowhead(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  console.debug('Checking for Arrowhead patterns...')

  for (let i = 0; i < planets.length - 2; i++) {
    for (let j = i + 1; j < planets.length - 1; j++) {
      for (let k = j + 1; k < planets.length; k++) {
        const [p1, p2, p3] = [planets[i], planets[j], planets[k]]

        if (
          // Base sextile
          isSextile(p1, p2) &&
          // Connections to third planet (either trine or opposition)
          ((isTrine(p2, p3) && isTrine(p1, p3)) ||
           (isOpposition(p2, p3) && isOpposition(p1, p3)))
        ) {
          console.debug(`Arrowhead pattern found:`)
          console.debug(`Base sextile:`)
          console.debug(`- ${p1.name} at ${p1.formatted} ${p1.sign}`)
          console.debug(`- ${p2.name} at ${p2.formatted} ${p2.sign}`)
          console.debug(`Point:`)
          console.debug(`- ${p3.name} at ${p3.formatted} ${p3.sign}`)

          const patternPlanets = [p1, p2, p3].map(p => ({
            ...toPlanetData(p),
            position: `${p.formatted} ${p.sign}`
          }))

          const aspectType = isTrine(p1, p3) ? 'trines' : 'oppositions'
          patterns.push({
            name: 'Arrowhead',
            planets: patternPlanets,
            description: `${p1.name} and ${p2.name} in sextile, both forming ${aspectType} to ${p3.name}`
          })
        }
      }
    }
  }

  return patterns
}
