import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { toPlanetData } from './utils'

/**
 * Detect Splash pattern (planets evenly distributed across the chart)
 */
export function detectSplash(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  const numHouses = 12
  const houseOccupancy = Array(numHouses).fill(0)

  planets.forEach(planet => {
    const houseIndex = Math.floor((planet.longitude / 360) * numHouses)
    houseOccupancy[houseIndex]++
  })

  const occupiedHouses = houseOccupancy.filter(count => count > 0).length

  if (occupiedHouses >= 10) {
    patterns.push({
      name: 'Splash',
      planets: planets.map(toPlanetData),
      description: 'Planets evenly distributed across the chart.'
    })
  }

  return patterns
}
