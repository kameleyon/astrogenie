import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { getDistance, toPlanetData } from './utils'

/**
 * Detect Bowl pattern (all planets within 180 degrees)
 */
export function detectBowl(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  const sortedPlanets = [...planets].sort((a, b) => a.longitude - b.longitude)
  const span = getDistance(sortedPlanets[0].longitude, sortedPlanets[sortedPlanets.length - 1].longitude)

  if (span <= 180) {
    patterns.push({
      name: 'Bowl',
      planets: sortedPlanets.map(toPlanetData),
      description: 'All planets grouped within 180 degrees of the chart.'
    })
  }

  return patterns
}
