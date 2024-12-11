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

interface HemisphereData {
  planets: Array<PlanetPosition & { name: string }>
  weight: number
  startLongitude: number
  endLongitude: number
}

/**
 * Detect Bowl pattern
 * Requirements:
 * 1. All planets within 180 degrees
 * 2. Proper hemispheric distribution
 * 3. Consideration of planet weights and edge planets
 */
export function detectBowl(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  const sortedPlanets = [...planets].sort((a, b) => a.longitude - b.longitude)
  
  // Calculate total span
  const span = getDistance(sortedPlanets[0].longitude, sortedPlanets[sortedPlanets.length - 1].longitude)
  if (span > 180) return patterns

  // Analyze hemispheric distribution
  const hemispheres = analyzeHemispheres(sortedPlanets)
  
  // Check if we have a clear empty hemisphere
  const emptyHemisphere = findEmptyHemisphere(sortedPlanets)
  if (!emptyHemisphere) return patterns

  // Get edge planets (first and last in sequence)
  const edgePlanets = {
    leading: sortedPlanets[0],
    trailing: sortedPlanets[sortedPlanets.length - 1]
  }

  // Calculate weighted center of the bowl
  const weightedCenter = calculateWeightedCenter(sortedPlanets)
  const centerSign = getZodiacSign(weightedCenter)

  // Analyze distribution within the bowl
  const distribution = analyzeDistribution(sortedPlanets)

  // Create pattern description
  const desc = createBowlDescription(
    span,
    edgePlanets,
    emptyHemisphere,
    centerSign,
    distribution
  )

  patterns.push({
    name: 'Bowl',
    planets: sortedPlanets.map(toPlanetData),
    description: desc
  })

  return patterns
}

/**
 * Analyze hemispheric distribution of planets
 */
function analyzeHemispheres(planets: Array<PlanetPosition & { name: string }>): HemisphereData[] {
  const hemispheres: HemisphereData[] = []
  
  // Check each possible hemisphere (sliding 180° window)
  for (let start = 0; start < 360; start += 30) {
    const end = normalizeAngle(start + 180)
    const inHemisphere = planets.filter(p => {
      const long = normalizeAngle(p.longitude)
      return start <= end 
        ? (long >= start && long <= end)
        : (long >= start || long <= end)
    })

    if (inHemisphere.length > 0) {
      const weight = inHemisphere.reduce((sum, p) => 
        sum + (PLANET_WEIGHTS[p.name as keyof typeof PLANET_WEIGHTS] || 1), 0
      )

      hemispheres.push({
        planets: inHemisphere,
        weight,
        startLongitude: start,
        endLongitude: end
      })
    }
  }

  return hemispheres.sort((a, b) => b.weight - a.weight)
}

/**
 * Find the empty hemisphere (if any)
 */
function findEmptyHemisphere(planets: Array<PlanetPosition & { name: string }>): string | null {
  const hemispheres = [
    { name: 'Northern', range: [0, 180] },
    { name: 'Southern', range: [180, 360] },
    { name: 'Eastern', range: [90, 270] },
    { name: 'Western', range: [270, 90] }
  ]

  for (const hemi of hemispheres) {
    const [start, end] = hemi.range
    const inHemi = planets.filter(p => {
      const long = normalizeAngle(p.longitude)
      return start <= end 
        ? (long >= start && long <= end)
        : (long >= start || long <= end)
    })

    if (inHemi.length === 0) {
      return hemi.name
    }
  }

  return null
}

/**
 * Calculate weighted center of the bowl
 */
function calculateWeightedCenter(planets: Array<PlanetPosition & { name: string }>): number {
  const totalWeight = planets.reduce((sum, p) => 
    sum + (PLANET_WEIGHTS[p.name as keyof typeof PLANET_WEIGHTS] || 1), 0
  )

  const weightedSum = planets.reduce((sum, p) => 
    sum + normalizeAngle(p.longitude) * (PLANET_WEIGHTS[p.name as keyof typeof PLANET_WEIGHTS] || 1), 0
  )

  return normalizeAngle(weightedSum / totalWeight)
}

/**
 * Analyze distribution of planets within the bowl
 */
function analyzeDistribution(planets: Array<PlanetPosition & { name: string }>): string {
  const gaps = []
  for (let i = 0; i < planets.length - 1; i++) {
    const gap = getDistance(planets[i].longitude, planets[i + 1].longitude)
    if (gap > 30) {
      gaps.push({
        size: gap,
        between: [planets[i].name, planets[i + 1].name]
      })
    }
  }

  if (gaps.length === 0) return 'evenly distributed'
  if (gaps.length === 1) return 'one significant gap'
  return 'multiple gaps in distribution'
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
 * Create detailed bowl pattern description
 */
function createBowlDescription(
  span: number,
  edgePlanets: { leading: PlanetPosition & { name: string }, trailing: PlanetPosition & { name: string } },
  emptyHemisphere: string | null,
  centerSign: string,
  distribution: string
): string {
  return `Bowl pattern spanning ${span.toFixed(1)}°, ` +
    `from ${edgePlanets.leading.name} (${edgePlanets.leading.formatted} ${edgePlanets.leading.sign}) ` +
    `to ${edgePlanets.trailing.name} (${edgePlanets.trailing.formatted} ${edgePlanets.trailing.sign}). ` +
    `Empty ${emptyHemisphere} hemisphere, with weighted center in ${centerSign}. ` +
    `Planets are ${distribution} within the bowl. ` +
    `This pattern suggests a focused, self-contained approach to life with awareness of what's missing or needed.`
}
