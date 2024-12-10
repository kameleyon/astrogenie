import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { getDistance, toPlanetData } from './utils'

/**
 * Detect Locomotive pattern (planets span 240 degrees, leaving an empty 120 degrees)
 */
export function detectLocomotive(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  const sortedPlanets = [...planets].sort((a, b) => a.longitude - b.longitude)
  const span = getDistance(sortedPlanets[0].longitude, sortedPlanets[sortedPlanets.length - 1].longitude)

  if (span >= 240) {
    const emptySpace = 360 - span
    if (emptySpace >= 120) {
      patterns.push({
        name: 'Locomotive',
        planets: sortedPlanets.map(toPlanetData),
        description: 'Planets span 240 degrees, leaving an empty space of 120 degrees.'
      })
    }
  }

  return patterns
}
