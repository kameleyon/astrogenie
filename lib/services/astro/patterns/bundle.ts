import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { getDistance, toPlanetData } from './utils'

/**
 * Detect Bundle pattern (planets within 120 degrees)
 */
export function detectBundle(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  const sortedPlanets = [...planets].sort((a, b) => a.longitude - b.longitude)
  const span = getDistance(sortedPlanets[0].longitude, sortedPlanets[sortedPlanets.length - 1].longitude)

  if (span <= 120) {
    patterns.push({
      name: 'Bundle',
      planets: sortedPlanets.map(toPlanetData),
      description: 'All planets grouped tightly within 120 degrees.'
    })
  }

  return patterns
}
