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

interface LocomotiveSection {
  startPlanet: PlanetPosition & { name: string }
  endPlanet: PlanetPosition & { name: string }
  span: number
  planets: Array<PlanetPosition & { name: string }>
  weight: number
}

interface SectionData {
  planets: Array<PlanetPosition & { name: string }>
  weight: number
  startLongitude?: number
  endLongitude?: number
}

interface SectionAnalysis {
  firstThird: SectionData
  middleThird: SectionData
  lastThird: SectionData
}

/**
 * Detect Locomotive pattern
 * Requirements:
 * 1. Planets span approximately 240 degrees
 * 2. Empty space of approximately 120 degrees
 * 3. Leading planet significance considered
 * 4. Distribution analysis within occupied space
 */
export function detectLocomotive(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  const sortedPlanets = [...planets].sort((a, b) => a.longitude - b.longitude)
  
  // Find potential locomotive configurations
  const configurations = findLocomotiveConfigurations(sortedPlanets)
  
  for (const config of configurations) {
    // Analyze the distribution within the locomotive
    const sections = analyzeSections(config.planets)
    
    // Analyze the leading planet
    const leadingPlanet = analyzeLeadingPlanet(config.planets[0], sections)
    
    // Analyze the empty space
    const emptySpaceAnalysis = analyzeEmptySpace(
      config.planets[config.planets.length - 1].longitude,
      config.planets[0].longitude
    )

    // Calculate weighted center
    const center = calculateWeightedCenter(config.planets)
    const centerSign = getZodiacSign(center)

    // Create pattern description
    const desc = createLocomotiveDescription(
      config,
      leadingPlanet,
      sections,
      emptySpaceAnalysis,
      centerSign
    )

    patterns.push({
      name: 'Locomotive',
      planets: config.planets.map(toPlanetData),
      description: desc
    })
  }

  return patterns
}

/**
 * Find valid locomotive configurations
 */
function findLocomotiveConfigurations(planets: Array<PlanetPosition & { name: string }>): LocomotiveSection[] {
  const configurations: LocomotiveSection[] = []
  
  // Check each possible starting point
  for (let i = 0; i < planets.length; i++) {
    const orderedPlanets = [
      ...planets.slice(i),
      ...planets.slice(0, i)
    ]
    
    const span = getDistance(
      orderedPlanets[0].longitude,
      orderedPlanets[orderedPlanets.length - 1].longitude
    )

    // Valid locomotive should span about 240° (allowing some orb)
    if (span >= 220 && span <= 260) {
      const weight = orderedPlanets.reduce((sum, p) => 
        sum + (PLANET_WEIGHTS[p.name as keyof typeof PLANET_WEIGHTS] || 1), 0
      )

      configurations.push({
        startPlanet: orderedPlanets[0],
        endPlanet: orderedPlanets[orderedPlanets.length - 1],
        span,
        planets: orderedPlanets,
        weight
      })
    }
  }

  return configurations.sort((a, b) => b.weight - a.weight)
}

/**
 * Analyze sections of the locomotive
 */
function analyzeSections(planets: Array<PlanetPosition & { name: string }>): SectionAnalysis {
  const span = getDistance(planets[0].longitude, planets[planets.length - 1].longitude)
  const thirdSize = span / 3
  const startLong = planets[0].longitude

  const sections: SectionAnalysis = {
    firstThird: { planets: [], weight: 0, startLongitude: startLong },
    middleThird: { planets: [], weight: 0 },
    lastThird: { planets: [], weight: 0 }
  }

  // Distribute planets into sections
  for (const planet of planets) {
    const distance = getDistance(startLong, planet.longitude)
    const weight = PLANET_WEIGHTS[planet.name as keyof typeof PLANET_WEIGHTS] || 1

    if (distance <= thirdSize) {
      sections.firstThird.planets.push(planet)
      sections.firstThird.weight += weight
    } else if (distance <= thirdSize * 2) {
      sections.middleThird.planets.push(planet)
      sections.middleThird.weight += weight
    } else {
      sections.lastThird.planets.push(planet)
      sections.lastThird.weight += weight
    }
  }

  return sections
}

/**
 * Analyze the leading planet
 */
function analyzeLeadingPlanet(
  planet: PlanetPosition & { name: string },
  sections: SectionAnalysis
): string {
  const weight = PLANET_WEIGHTS[planet.name as keyof typeof PLANET_WEIGHTS] || 1
  const isInStrongSection = sections.firstThird.weight >= sections.middleThird.weight &&
                           sections.firstThird.weight >= sections.lastThird.weight

  if (weight >= 8) return 'very strong'
  if (weight >= 6) return isInStrongSection ? 'strong' : 'moderate'
  return isInStrongSection ? 'moderate' : 'subtle'
}

/**
 * Analyze the empty space
 */
function analyzeEmptySpace(endLong: number, startLong: number): string {
  const emptySpace = normalizeAngle(startLong - endLong)
  if (emptySpace > 150) return 'significant void'
  if (emptySpace > 130) return 'clear void'
  return 'moderate void'
}

/**
 * Calculate weighted center
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
 * Create detailed locomotive pattern description
 */
function createLocomotiveDescription(
  config: LocomotiveSection,
  leadingPlanetStrength: string,
  sections: SectionAnalysis,
  emptySpaceDesc: string,
  centerSign: string
): string {
  return `Locomotive pattern spanning ${config.span.toFixed(1)}° with a ${emptySpaceDesc}. ` +
    `Led by a ${leadingPlanetStrength} ${config.startPlanet.name} in ${config.startPlanet.sign} ` +
    `(${config.startPlanet.formatted}), driving the chart's energy forward. ` +
    `The pattern's weighted center falls in ${centerSign}, ` +
    `with ${sections.firstThird.planets.length} planets in the first third, ` +
    `${sections.middleThird.planets.length} in the middle, and ` +
    `${sections.lastThird.planets.length} in the final third. ` +
    `This suggests a dynamic, self-driven approach to life with clear direction and purpose.`
}
