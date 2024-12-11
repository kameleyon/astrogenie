import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { isSextile, isQuincunx, isOpposition, toPlanetData } from './utils'

/**
 * Detect Boomerang Yod pattern
 * Requirements:
 * 1. Two planets in sextile (60°)
 * 2. Both sextile planets form quincunx aspects (150°) to a third planet
 * 3. A fourth planet opposes (180°) the apex planet
 */
export function detectBoomerangYod(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  console.debug('Checking for Boomerang Yod patterns...')

  for (let i = 0; i < planets.length - 3; i++) {
    for (let j = i + 1; j < planets.length - 2; j++) {
      for (let k = j + 1; k < planets.length - 1; k++) {
        for (let l = k + 1; l < planets.length; l++) {
          const [p1, p2, p3, p4] = [planets[i], planets[j], planets[k], planets[l]]

          if (
            // Base sextile
            isSextile(p1, p2) &&
            // Quincunxes to apex
            isQuincunx(p1, p3) && isQuincunx(p2, p3) &&
            // Opposition to apex
            isOpposition(p3, p4)
          ) {
            console.debug(`Boomerang Yod pattern found:`)
            console.debug(`Base sextile:`)
            console.debug(`- ${p1.name} at ${p1.formatted} ${p1.sign}`)
            console.debug(`- ${p2.name} at ${p2.formatted} ${p2.sign}`)
            console.debug(`Apex:`)
            console.debug(`- ${p3.name} at ${p3.formatted} ${p3.sign}`)
            console.debug(`Opposition point:`)
            console.debug(`- ${p4.name} at ${p4.formatted} ${p4.sign}`)

            const patternPlanets = [p1, p2, p3, p4].map(p => ({
              ...toPlanetData(p),
              position: `${p.formatted} ${p.sign}`
            }))

            patterns.push({
              name: 'Boomerang Yod',
              planets: patternPlanets,
              description: `${p1.name} and ${p2.name} in sextile, both quincunx to ${p3.name}, which is opposed by ${p4.name}`
            })
          }
        }
      }
    }
  }

  return patterns
}
