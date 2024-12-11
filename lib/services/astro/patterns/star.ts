import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { isSextile, toPlanetData } from './utils'

/**
 * Detect Star pattern
 * Requirements:
 * 1. Five planets connected by sextile aspects (60°)
 * 2. Forms a five-pointed star shape around the chart
 * Creates a harmonious flow of energy between the planets
 */
export function detectStar(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  console.debug('Checking for Star patterns...')

  for (let i = 0; i < planets.length - 4; i++) {
    for (let j = i + 1; j < planets.length - 3; j++) {
      for (let k = j + 1; k < planets.length - 2; k++) {
        for (let l = k + 1; l < planets.length - 1; l++) {
          for (let m = l + 1; m < planets.length; m++) {
            const [p1, p2, p3, p4, p5] = [planets[i], planets[j], planets[k], planets[l], planets[m]]

            if (
              // Check sextiles forming the star points
              isSextile(p1, p2) && isSextile(p2, p3) &&
              isSextile(p3, p4) && isSextile(p4, p5) &&
              isSextile(p5, p1)
            ) {
              console.debug(`Star pattern found between:`)
              console.debug(`- ${p1.name} at ${p1.formatted} ${p1.sign}`)
              console.debug(`- ${p2.name} at ${p2.formatted} ${p2.sign}`)
              console.debug(`- ${p3.name} at ${p3.formatted} ${p3.sign}`)
              console.debug(`- ${p4.name} at ${p4.formatted} ${p4.sign}`)
              console.debug(`- ${p5.name} at ${p5.formatted} ${p5.sign}`)

              const patternPlanets = [p1, p2, p3, p4, p5].map(p => ({
                ...toPlanetData(p),
                position: `${p.formatted} ${p.sign}`
              }))

              patterns.push({
                name: 'Star',
                planets: patternPlanets,
                description: `Five planets in sextile: ${p1.name}, ${p2.name}, ${p3.name}, ${p4.name}, and ${p5.name} forming a star`
              })
            }
          }
        }
      }
    }
  }

  return patterns
}
