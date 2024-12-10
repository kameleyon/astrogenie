import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { getDistance, toPlanetData } from './utils'

/**
 * Detect Bucket pattern (planets with one opposite acting as a handle)
 */
export function detectBucket(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  const sortedPlanets = [...planets].sort((a, b) => a.longitude - b.longitude)
  let maxGap = 0
  let handlePlanet = null

  for (let i = 0; i < sortedPlanets.length; i++) {
    const nextIndex = (i + 1) % sortedPlanets.length
    const gap = getDistance(sortedPlanets[i].longitude, sortedPlanets[nextIndex].longitude)
    if (gap > maxGap) {
      maxGap = gap
      handlePlanet = sortedPlanets[i]
    }
  }

  if (maxGap >= 120 && handlePlanet) {
    const bowlPlanets = sortedPlanets.filter(p => p !== handlePlanet)
    patterns.push({
      name: 'Bucket',
      planets: [handlePlanet, ...bowlPlanets].map(toPlanetData),
      description: 'A concentration of planets with one acting as a handle.'
    })
  }

  return patterns
}
