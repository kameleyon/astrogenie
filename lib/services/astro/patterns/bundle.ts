import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { getDistance, toPlanetData, normalizeAngle } from './utils'

// Planet weights for distribution calculations
const PLANET_WEIGHTS = {
  Sun: 10,
  Moon: 10,
  Mercury: 8,
  Venus: 8,
  Mars: 8,
  Jupiter: 6,
  Saturn: 6,
  Uranus: 4,
  Neptune: 4,
  Pluto: 4,
  NorthNode: 2,
  Chiron: 2
}

interface PlanetCluster {
  planets: Array<PlanetPosition & { name: string }>
  centerLongitude: number
  span: number
  weight: number
}

/**
 * Detect Bundle pattern
 * Requirements:
 * 1. All planets within 120 degrees
 * 2. At least one major concentration of planets
 * 3. Proper consideration of planet weights and distribution
 */
export function detectBundle(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  const sortedPlanets = [...planets].sort((a, b) => a.longitude - b.longitude)
  
  // Calculate total span
  const span = getDistance(sortedPlanets[0].longitude, sortedPlanets[sortedPlanets.length - 1].longitude)
  if (span > 120) return patterns

  // Find clusters of planets
  const clusters = findPlanetClusters(sortedPlanets)
  
  // Check if we have at least one significant cluster
  const significantClusters = clusters.filter(cluster => 
    cluster.weight >= 20 && // At least two major planets worth of weight
    cluster.span <= 40 // Reasonably tight cluster
  )

  if (significantClusters.length > 0) {
    // Calculate hemisphere and quadrant distributions
    const hemispheres = analyzeHemispheres(sortedPlanets)
    const quadrants = analyzeQuadrants(sortedPlanets)

    // Format description based on analysis
    const mainCluster = significantClusters[0]
    const clusterSign = getZodiacSign(mainCluster.centerLongitude)
    const hemisphereDesc = getHemisphereDescription(hemispheres)
    const quadrantDesc = getQuadrantDescription(quadrants)

    patterns.push({
      name: 'Bundle',
      planets: sortedPlanets.map(toPlanetData),
      description: `All planets concentrated within ${span.toFixed(1)}° of the zodiac, ` +
        `with a main concentration in ${clusterSign}. ${hemisphereDesc} ${quadrantDesc} ` +
        `This pattern suggests a highly focused and specialized approach to life.`
    })
  }

  return patterns
}

/**
 * Find clusters of planets using weighted sliding window
 */
function findPlanetClusters(planets: Array<PlanetPosition & { name: string }>): PlanetCluster[] {
  const clusters: PlanetCluster[] = []
  const WINDOW_SIZE = 40 // degrees

  for (let i = 0; i < planets.length; i++) {
    const windowPlanets = planets.filter(p => 
      getDistance(planets[i].longitude, p.longitude) <= WINDOW_SIZE/2
    )

    if (windowPlanets.length >= 3) { // At least 3 planets for a cluster
      const weight = windowPlanets.reduce((sum, p) => 
        sum + (PLANET_WEIGHTS[p.name as keyof typeof PLANET_WEIGHTS] || 1), 0
      )

      // Calculate weighted center
      const weightedSum = windowPlanets.reduce((sum, p) => 
        sum + normalizeAngle(p.longitude) * (PLANET_WEIGHTS[p.name as keyof typeof PLANET_WEIGHTS] || 1), 0
      )
      const centerLongitude = normalizeAngle(weightedSum / weight)

      clusters.push({
        planets: windowPlanets,
        centerLongitude,
        span: getDistance(
          windowPlanets[0].longitude,
          windowPlanets[windowPlanets.length - 1].longitude
        ),
        weight
      })
    }
  }

  return clusters.sort((a, b) => b.weight - a.weight)
}

/**
 * Analyze hemisphere distributions
 */
function analyzeHemispheres(planets: Array<PlanetPosition & { name: string }>) {
  return {
    north: planets.filter(p => p.longitude >= 0 && p.longitude < 180).length,
    south: planets.filter(p => p.longitude >= 180).length,
    east: planets.filter(p => p.longitude >= 90 && p.longitude < 270).length,
    west: planets.filter(p => p.longitude < 90 || p.longitude >= 270).length
  }
}

/**
 * Analyze quadrant distributions
 */
function analyzeQuadrants(planets: Array<PlanetPosition & { name: string }>) {
  return {
    q1: planets.filter(p => p.longitude >= 0 && p.longitude < 90).length,
    q2: planets.filter(p => p.longitude >= 90 && p.longitude < 180).length,
    q3: planets.filter(p => p.longitude >= 180 && p.longitude < 270).length,
    q4: planets.filter(p => p.longitude >= 270).length
  }
}

/**
 * Get zodiac sign for a longitude
 */
function getZodiacSign(longitude: number): string {
  const signs = [
    "Aries", "Taurus", "Gemini", "Cancer",
    "Leo", "Virgo", "Libra", "Scorpio",
    "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ]
  const signIndex = Math.floor(normalizeAngle(longitude) / 30)
  return signs[signIndex]
}

/**
 * Generate hemisphere description
 */
function getHemisphereDescription(hemispheres: { north: number, south: number, east: number, west: number }): string {
  const descriptions = []
  if (hemispheres.north > hemispheres.south * 2) {
    descriptions.push('Strong northern hemisphere emphasis')
  }
  if (hemispheres.south > hemispheres.north * 2) {
    descriptions.push('Strong southern hemisphere emphasis')
  }
  if (hemispheres.east > hemispheres.west * 2) {
    descriptions.push('Strong eastern hemisphere emphasis')
  }
  if (hemispheres.west > hemispheres.east * 2) {
    descriptions.push('Strong western hemisphere emphasis')
  }
  return descriptions.join('. ') + (descriptions.length > 0 ? '.' : '')
}

/**
 * Generate quadrant description
 */
function getQuadrantDescription(quadrants: { q1: number, q2: number, q3: number, q4: number }): string {
  const max = Math.max(quadrants.q1, quadrants.q2, quadrants.q3, quadrants.q4)
  const quadrantNames = ['first', 'second', 'third', 'fourth']
  const dominantQuadrants = Object.entries(quadrants)
    .map(([key, value], index) => ({ name: quadrantNames[index], value }))
    .filter(q => q.value === max)

  if (dominantQuadrants.length === 1) {
    return `Emphasis in the ${dominantQuadrants[0].name} quadrant.`
  }
  return ''
}
