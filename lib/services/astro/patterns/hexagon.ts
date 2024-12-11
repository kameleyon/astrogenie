import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { isSextile, toPlanetData } from './utils'

/**
 * Detect Hexagon pattern
 * Requirements:
 * 1. Six planets connected by sextile aspects (60°)
 * 2. Forms a regular hexagon shape around the chart
 */
export function detectHexagon(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  console.debug('Checking for Hexagon patterns...')

  for (let i = 0; i < planets.length - 5; i++) {
    for (let j = i + 1; j < planets.length - 4; j++) {
      for (let k = j + 1; k < planets.length - 3; k++) {
        for (let l = k + 1; l < planets.length - 2; l++) {
          for (let m = l + 1; m < planets.length - 1; m++) {
            for (let n = m + 1; n < planets.length; n++) {
              const [p1, p2, p3, p4, p5, p6] = [planets[i], planets[j], planets[k], planets[l], planets[m], planets[n]]

              if (
                // Check sextiles around the hexagon
                isSextile(p1, p2) && isSextile(p2, p3) &&
                isSextile(p3, p4) && isSextile(p4, p5) &&
                isSextile(p5, p6) && isSextile(p6, p1)
              ) {
                console.debug(`Hexagon pattern found between:`)
                console.debug(`- ${p1.name} at ${p1.formatted} ${p1.sign}`)
                console.debug(`- ${p2.name} at ${p2.formatted} ${p2.sign}`)
                console.debug(`- ${p3.name} at ${p3.formatted} ${p3.sign}`)
                console.debug(`- ${p4.name} at ${p4.formatted} ${p4.sign}`)
                console.debug(`- ${p5.name} at ${p5.formatted} ${p5.sign}`)
                console.debug(`- ${p6.name} at ${p6.formatted} ${p6.sign}`)

                const patternPlanets = [p1, p2, p3, p4, p5, p6].map(p => ({
                  ...toPlanetData(p),
                  position: `${p.formatted} ${p.sign}`
                }))

                patterns.push({
                  name: 'Hexagon',
                  planets: patternPlanets,
                  description: `Six planets in sextile: ${p1.name}, ${p2.name}, ${p3.name}, ${p4.name}, ${p5.name}, and ${p6.name} forming a hexagon`
                })
              }
            }
          }
        }
      }
    }
  }

  return patterns
}
