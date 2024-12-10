import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { getDistance, toPlanetData } from './utils'

/**
 * Detect Basket pattern (planets concentrated in one hemisphere with an additional "handle" planet)
 */
export function detectBasket(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  const sortedPlanets = [...planets].sort((a, b) => a.longitude - b.longitude)
  let handlePlanet = null

  const span = getDistance(sortedPlanets[0].longitude, sortedPlanets[sortedPlanets.length - 1].longitude)
  if (span <= 180) {
    for (const planet of planets) {
      if (
        getDistance(planet.longitude, sortedPlanets[0].longitude) > 90 &&
        getDistance(planet.longitude, sortedPlanets[sortedPlanets.length - 1].longitude) > 90
      ) {
        handlePlanet = planet
        break
      }
    }

    if (handlePlanet) {
      patterns.push({
        name: 'Basket',
        planets: planets.map(toPlanetData),
        description: 'A concentration of planets in one hemisphere with an additional handle planet.'
      })
    }
  }

  return patterns
}
