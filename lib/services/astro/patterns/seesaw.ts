import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { getDistance, toPlanetData } from './utils'

/**
 * Detect Seesaw pattern (two groups of planets opposing each other)
 */
export function detectSeesaw(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  const sortedPlanets = [...planets].sort((a, b) => a.longitude - b.longitude)
  const midPoint = (sortedPlanets[0].longitude + sortedPlanets[sortedPlanets.length - 1].longitude) / 2

  const group1 = planets.filter(p => getDistance(p.longitude, midPoint) <= 90)
  const group2 = planets.filter(p => !group1.includes(p))

  if (group1.length > 1 && group2.length > 1) {
    patterns.push({
      name: 'Seesaw',
      planets: planets.map(toPlanetData),
      description: 'Two groups of planets in opposition forming a balance.'
    })
  }

  return patterns
}
