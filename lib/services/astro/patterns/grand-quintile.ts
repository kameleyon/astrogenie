import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { isQuintile, toPlanetData } from './utils'

/**
 * Detect Grand Quintile pattern
 * Requirements:
 * 1. Five planets connected by quintile aspects (72°)
 * 2. Forms a regular pentagon shape
 */
export function detectGrandQuintile(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  console.debug('Checking for Grand Quintile patterns...')

  for (let i = 0; i < planets.length - 4; i++) {
    for (let j = i + 1; j < planets.length - 3; j++) {
      for (let k = j + 1; k < planets.length - 2; k++) {
        for (let l = k + 1; l < planets.length - 1; l++) {
          for (let m = l + 1; m < planets.length; m++) {
            const [p1, p2, p3, p4, p5] = [planets[i], planets[j], planets[k], planets[l], planets[m]]

            if (
              // Check quintiles forming the pentagon
              isQuintile(p1, p2) && isQuintile(p2, p3) &&
              isQuintile(p3, p4) && isQuintile(p4, p5) &&
              isQuintile(p5, p1)
            ) {
              console.debug(`Grand Quintile pattern found between:`)
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
                name: 'Grand Quintile',
                planets: patternPlanets,
                description: `Five planets in quintile aspects: ${p1.name} (${p1.formatted} ${p1.sign}), ${p2.name} (${p2.formatted} ${p2.sign}), ${p3.name} (${p3.formatted} ${p3.sign}), ${p4.name} (${p4.formatted} ${p4.sign}), and ${p5.name} (${p5.formatted} ${p5.sign})`
              })
            }
          }
        }
      }
    }
  }

  return patterns
}
