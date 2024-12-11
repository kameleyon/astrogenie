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

interface HandleData {
  planet: PlanetPosition & { name: string }
  weight: number
  oppositionCount: number
  sextileCount: number
  trineCount: number
}

/**
 * Detect Bucket pattern
 * Requirements:
 * 1. One planet isolated from others (handle)
 * 2. Other planets grouped within 180° or less
 * 3. Handle planet's weight and aspects considered
 */
export function detectBucket(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  const sortedPlanets = [...planets].sort((a, b) => a.longitude - b.longitude)

  // Find potential handle planets (isolated by at least 120°)
  const potentialHandles = findPotentialHandles(sortedPlanets)
  if (potentialHandles.length === 0) return patterns

  // For each potential handle, analyze the pattern
  for (const handle of potentialHandles) {
    const bowlPlanets = sortedPlanets.filter(p => p !== handle.planet)
    
    // Check if remaining planets form a valid group (within 180°)
    const bowlSpan = getDistance(
      bowlPlanets[0].longitude,
      bowlPlanets[bowlPlanets.length - 1].longitude
    )
    
    if (bowlSpan <= 180) {
      // Analyze the handle's relationship to the bowl
      const handleAnalysis = analyzeHandle(handle, bowlPlanets)
      
      // Calculate weighted center of the bowl
      const bowlCenter = calculateWeightedCenter(bowlPlanets)
      const centerSign = getZodiacSign(bowlCenter)

      // Create pattern description
      const desc = createBucketDescription(
        handle,
        handleAnalysis,
        bowlSpan,
        centerSign,
        bowlPlanets
      )

      patterns.push({
        name: 'Bucket',
        planets: [handle.planet, ...bowlPlanets].map(toPlanetData),
        description: desc
      })
    }
  }

  return patterns
}

/**
 * Find potential handle planets
 */
function findPotentialHandles(planets: Array<PlanetPosition & { name: string }>): HandleData[] {
  const handles: HandleData[] = []

  for (const planet of planets) {
    // Calculate gaps to other planets
    const gaps = planets
      .filter(p => p !== planet)
      .map(p => getDistance(planet.longitude, p.longitude))
    
    const minGap = Math.min(...gaps)
    if (minGap >= 120) {
      // Count aspects to other planets
      const aspects = countAspects(planet, planets.filter(p => p !== planet))
      
      handles.push({
        planet,
        weight: PLANET_WEIGHTS[planet.name as keyof typeof PLANET_WEIGHTS] || 1,
        ...aspects
      })
    }
  }

  // Sort by weight and aspect counts
  return handles.sort((a, b) => 
    (b.weight + b.oppositionCount * 2 + b.trineCount + b.sextileCount) -
    (a.weight + a.oppositionCount * 2 + a.trineCount + a.sextileCount)
  )
}

/**
 * Count aspects between handle and bowl planets
 */
function countAspects(
  handle: PlanetPosition,
  bowlPlanets: Array<PlanetPosition & { name: string }>
): { oppositionCount: number, sextileCount: number, trineCount: number } {
  return {
    oppositionCount: bowlPlanets.filter(p => 
      Math.abs(getDistance(handle.longitude, p.longitude) - 180) <= 10
    ).length,
    sextileCount: bowlPlanets.filter(p => 
      Math.abs(getDistance(handle.longitude, p.longitude) - 60) <= 6
    ).length,
    trineCount: bowlPlanets.filter(p => 
      Math.abs(getDistance(handle.longitude, p.longitude) - 120) <= 8
    ).length
  }
}

/**
 * Analyze handle's relationship to bowl
 */
function analyzeHandle(handle: HandleData, bowlPlanets: Array<PlanetPosition & { name: string }>): string {
  const aspects = []
  if (handle.oppositionCount > 0) aspects.push('opposition')
  if (handle.trineCount > 0) aspects.push('trine')
  if (handle.sextileCount > 0) aspects.push('sextile')

  const handleStrength = handle.weight >= 8 ? 'strong' :
                        handle.weight >= 6 ? 'moderate' :
                        'subtle'

  return `${handleStrength} handle ${
    aspects.length > 0 ? 
    `forming ${aspects.join(' and ')} aspects to the bowl` :
    'without major aspects to the bowl'
  }`
}

/**
 * Calculate weighted center of planets
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
 * Create detailed bucket pattern description
 */
function createBucketDescription(
  handle: HandleData,
  handleAnalysis: string,
  bowlSpan: number,
  centerSign: string,
  bowlPlanets: Array<PlanetPosition & { name: string }>
): string {
  return `Bucket pattern with ${handle.planet.name} in ${handle.planet.sign} ` +
    `(${handle.planet.formatted}) as a ${handleAnalysis}. ` +
    `Main concentration of planets spans ${bowlSpan.toFixed(1)}° with center in ${centerSign}. ` +
    `The ${handle.planet.name} handle represents a focal point for expressing or accessing ` +
    `the energies of the other planets, suggesting a specific channel for achievement or growth.`
}
