import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { getDistance, toPlanetData } from './utils'

/**
 * Detect Basket pattern
 * Requirements:
 * 1. Most planets concentrated within 180° (one hemisphere)
 * 2. One planet isolated on the opposite side ("handle")
 * 3. Handle planet must be at least 90° from both ends of the group
 */
export function detectBasket(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  console.debug('Checking for Basket pattern...')

  // Sort planets by longitude
  const sortedPlanets = [...planets].sort((a, b) => a.longitude - b.longitude)
  let handlePlanet = null
  let mainGroup: Array<PlanetPosition & { name: string }> = []

  // Check if main group spans less than 180°
  const span = getDistance(sortedPlanets[0].longitude, sortedPlanets[sortedPlanets.length - 1].longitude)
  if (span <= 180) {
    // Look for a handle planet
    for (const planet of planets) {
      const distToFirst = getDistance(planet.longitude, sortedPlanets[0].longitude)
      const distToLast = getDistance(planet.longitude, sortedPlanets[sortedPlanets.length - 1].longitude)

      if (distToFirst > 90 && distToLast > 90) {
        handlePlanet = planet
        mainGroup = sortedPlanets.filter(p => p !== planet)
        break
      }
    }

    if (handlePlanet) {
      console.debug(`Basket pattern found:`)
      console.debug(`Handle planet:`)
      console.debug(`- ${handlePlanet.name} at ${handlePlanet.formatted} ${handlePlanet.sign}`)
      console.debug(`Main group:`)
      mainGroup.forEach(p => {
        console.debug(`- ${p.name} at ${p.formatted} ${p.sign}`)
      })

      const patternPlanets = [...mainGroup, handlePlanet].map(p => ({
        ...toPlanetData(p),
        position: `${p.formatted} ${p.sign}`
      }))

      patterns.push({
        name: 'Basket',
        planets: patternPlanets,
        description: `${mainGroup.length} planets concentrated in one hemisphere with ${handlePlanet.name} (${handlePlanet.formatted} ${handlePlanet.sign}) forming the handle`
      })
    }
  }

  return patterns
}
