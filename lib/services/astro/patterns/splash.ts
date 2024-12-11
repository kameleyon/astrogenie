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

interface DistributionAnalysis {
  occupiedHouses: number
  occupiedSigns: number
  quadrantDistribution: number[]
  elementDistribution: number[]
  minSeparation: number
  weightedDistribution: number
}

/**
 * Detect Splash pattern
 * Requirements:
 * 1. Planets widely distributed (at least 10 houses)
 * 2. Good angular separation between planets
 * 3. Balanced distribution across quadrants and elements
 * 4. Consideration of planet weights
 */
export function detectSplash(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  
  // Analyze distribution
  const analysis = analyzeDistribution(planets)
  
  // Check if distribution meets Splash criteria
  if (isValidSplash(analysis)) {
    const desc = createSplashDescription(planets, analysis)
    
    patterns.push({
      name: 'Splash',
      planets: planets.map(toPlanetData),
      description: desc
    })
  }

  return patterns
}

/**
 * Analyze planetary distribution
 */
function analyzeDistribution(planets: Array<PlanetPosition & { name: string }>): DistributionAnalysis {
  // Initialize house and sign occupancy
  const houseOccupancy = Array(12).fill(0)
  const signOccupancy = Array(12).fill(0)
  const quadrantOccupancy = Array(4).fill(0)
  const elementOccupancy = Array(4).fill(0) // Fire, Earth, Air, Water

  // Track minimum separation between any two planets
  let minSeparation = 360
  
  // Calculate weighted distribution score
  let weightedDistribution = 0
  const totalWeight = planets.reduce((sum, p) => 
    sum + (PLANET_WEIGHTS[p.name as keyof typeof PLANET_WEIGHTS] || 1), 0
  )

  // Analyze each planet's position
  planets.forEach((planet, i) => {
    const houseIndex = Math.floor((planet.longitude / 30) % 12)
    const signIndex = Math.floor(normalizeAngle(planet.longitude) / 30)
    const quadrantIndex = Math.floor(houseIndex / 3)
    const elementIndex = Math.floor(signIndex / 3)
    const weight = PLANET_WEIGHTS[planet.name as keyof typeof PLANET_WEIGHTS] || 1

    houseOccupancy[houseIndex]++
    signOccupancy[signIndex]++
    quadrantOccupancy[quadrantIndex] += weight
    elementOccupancy[elementIndex] += weight

    // Check separation from other planets
    planets.forEach((otherPlanet, j) => {
      if (i !== j) {
        const separation = getDistance(planet.longitude, otherPlanet.longitude)
        minSeparation = Math.min(minSeparation, separation)
      }
    })

    // Add to weighted distribution score based on planet's isolation
    const nearestNeighborDist = planets
      .filter(p => p !== planet)
      .reduce((min, p) => Math.min(min, getDistance(planet.longitude, p.longitude)), 360)
    weightedDistribution += (nearestNeighborDist / 360) * weight
  })

  // Normalize weighted distribution
  weightedDistribution = weightedDistribution / totalWeight

  return {
    occupiedHouses: houseOccupancy.filter(count => count > 0).length,
    occupiedSigns: signOccupancy.filter(count => count > 0).length,
    quadrantDistribution: quadrantOccupancy,
    elementDistribution: elementOccupancy,
    minSeparation,
    weightedDistribution
  }
}

/**
 * Check if distribution qualifies as a Splash pattern
 */
function isValidSplash(analysis: DistributionAnalysis): boolean {
  // Must occupy at least 10 houses
  if (analysis.occupiedHouses < 10) return false

  // Must have reasonable minimum separation between planets
  if (analysis.minSeparation < 15) return false

  // Check quadrant distribution (no quadrant should be empty)
  if (analysis.quadrantDistribution.some(count => count === 0)) return false

  // Check element distribution (no element should be empty)
  if (analysis.elementDistribution.some(count => count === 0)) return false

  // Check weighted distribution score (higher means better spread)
  if (analysis.weightedDistribution < 0.4) return false

  return true
}

/**
 * Create detailed splash pattern description
 */
function createSplashDescription(
  planets: Array<PlanetPosition & { name: string }>,
  analysis: DistributionAnalysis
): string {
  const quadrantStrength = analysis.quadrantDistribution
    .map((weight, i) => ({ weight, quadrant: i + 1 }))
    .sort((a, b) => b.weight - a.weight)

  const elementStrength = analysis.elementDistribution
    .map((weight, i) => ({ 
      weight, 
      element: ['Fire', 'Earth', 'Air', 'Water'][i]
    }))
    .sort((a, b) => b.weight - a.weight)

  return `Splash pattern with planets distributed across ${analysis.occupiedHouses} houses ` +
    `and ${analysis.occupiedSigns} signs. ` +
    `Strongest presence in the ${quadrantStrength[0].quadrant}${getOrdinalSuffix(quadrantStrength[0].quadrant)} ` +
    `quadrant with ${elementStrength[0].element} element emphasis. ` +
    `Minimum separation between planets is ${Math.round(analysis.minSeparation)}°. ` +
    `This wide distribution suggests versatility and diverse interests, with ability to ` +
    `engage effectively in many areas of life simultaneously.`
}

/**
 * Get ordinal suffix for a number
 */
function getOrdinalSuffix(num: number): string {
  const j = num % 10
  const k = num % 100
  if (j === 1 && k !== 11) return 'st'
  if (j === 2 && k !== 12) return 'nd'
  if (j === 3 && k !== 13) return 'rd'
  return 'th'
}
