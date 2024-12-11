import { PlanetPosition, PatternData, PatternVisualization, PatternPlanetData } from '../../../types/birth-chart'
import { isSquare, isOpposition, toPlanetData, getDistance, normalizeAngle } from './utils'

// Planet weights for significance calculations
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

interface TSquareConfiguration {
  opposingPlanets: [PlanetPosition & { name: string }, PlanetPosition & { name: string }]
  apexPlanet: PlanetPosition & { name: string }
  weight: number
  modality: string
  emptyLeg: number // Longitude of the empty leg
}

/**
 * Detect T-Square pattern
 * Requirements:
 * 1. Two planets in opposition
 * 2. Both square to a third (apex) planet
 * 3. Consider planet weights and modalities
 * 4. Analyze empty leg position
 */
export function detectTSquares(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  
  // Find all potential T-Square configurations
  const configurations = findTSquareConfigurations(planets)
  
  // Sort by weight/significance
  configurations.sort((a, b) => b.weight - a.weight)

  // Create pattern for each valid configuration
  for (const config of configurations) {
    const desc = createTSquareDescription(config)
    const patternPlanets = [
      ...config.opposingPlanets,
      config.apexPlanet
    ].map(p => ({
      ...toPlanetData(p),
      position: `${p.formatted} ${p.sign}`
    }))

    patterns.push({
      name: 'T-Square',
      planets: patternPlanets,
      description: desc,
      visualization: calculateTSquarePoints(patternPlanets)
    })
  }

  return patterns
}

/**
 * Find all valid T-Square configurations
 */
function findTSquareConfigurations(
  planets: Array<PlanetPosition & { name: string }>
): TSquareConfiguration[] {
  const configurations: TSquareConfiguration[] = []

  for (let i = 0; i < planets.length - 2; i++) {
    for (let j = i + 1; j < planets.length - 1; j++) {
      if (!isOpposition(planets[i], planets[j])) continue

      for (let k = 0; k < planets.length; k++) {
        if (k === i || k === j) continue

        if (isSquare(planets[i], planets[k]) && isSquare(planets[j], planets[k])) {
          const weight = calculateTSquareWeight(planets[i], planets[j], planets[k])
          const modality = determineTSquareModality(planets[i], planets[j], planets[k])
          const emptyLeg = calculateEmptyLeg(planets[k].longitude)

          configurations.push({
            opposingPlanets: [planets[i], planets[j]],
            apexPlanet: planets[k],
            weight,
            modality,
            emptyLeg
          })
        }
      }
    }
  }

  return configurations
}

/**
 * Calculate total weight of T-Square based on involved planets
 */
function calculateTSquareWeight(
  p1: PlanetPosition & { name: string },
  p2: PlanetPosition & { name: string },
  apex: PlanetPosition & { name: string }
): number {
  const getWeight = (p: PlanetPosition & { name: string }) =>
    PLANET_WEIGHTS[p.name as keyof typeof PLANET_WEIGHTS] || 1

  // Apex planet gets double weight as it receives both squares
  return getWeight(p1) + getWeight(p2) + (getWeight(apex) * 2)
}

/**
 * Determine modality of T-Square (Cardinal, Fixed, Mutable)
 */
function determineTSquareModality(
  p1: PlanetPosition & { name: string },
  p2: PlanetPosition & { name: string },
  apex: PlanetPosition & { name: string }
): string {
  const signs = [p1.sign, p2.sign, apex.sign]
  
  const cardinalSigns = ['Aries', 'Cancer', 'Libra', 'Capricorn']
  const fixedSigns = ['Taurus', 'Leo', 'Scorpio', 'Aquarius']
  const mutableSigns = ['Gemini', 'Virgo', 'Sagittarius', 'Pisces']

  const isAllCardinal = signs.every(sign => cardinalSigns.includes(sign))
  const isAllFixed = signs.every(sign => fixedSigns.includes(sign))
  const isAllMutable = signs.every(sign => mutableSigns.includes(sign))

  if (isAllCardinal) return 'Cardinal'
  if (isAllFixed) return 'Fixed'
  if (isAllMutable) return 'Mutable'
  return 'Mixed'
}

/**
 * Calculate position of empty leg (opposite apex)
 */
function calculateEmptyLeg(apexLongitude: number): number {
  return normalizeAngle(apexLongitude + 180)
}

/**
 * Calculate visualization points for T-Square
 */
function calculateTSquarePoints(planets: PatternPlanetData[]): PatternVisualization {
  const centerX = 450  // Center of 900px width
  const centerY = 300  // Center of 600px height
  const radius = 200   // Distance from center to points
  const points = []

  // Opposing planets
  points.push({
    x: centerX - radius,
    y: centerY,
    planet: planets[0]
  })
  points.push({
    x: centerX + radius,
    y: centerY,
    planet: planets[1]
  })

  // Apex planet
  points.push({
    x: centerX,
    y: centerY - radius,
    planet: planets[2]
  })

  return {
    type: 't-square',
    color: getModalityColor(determineTSquareModality(
      planets[0] as any,
      planets[1] as any,
      planets[2] as any
    )),
    points
  }
}

/**
 * Get color based on modality
 */
function getModalityColor(modality: string): string {
  switch (modality) {
    case 'Cardinal': return '#F44336' // Red for initiating energy
    case 'Fixed': return '#2196F3'    // Blue for stabilizing energy
    case 'Mutable': return '#4CAF50'  // Green for adaptable energy
    default: return '#9C27B0'         // Purple for mixed modalities
  }
}

/**
 * Create detailed T-Square description
 */
function createTSquareDescription(config: TSquareConfiguration): string {
  const [p1, p2] = config.opposingPlanets
  const apex = config.apexPlanet
  const emptyLegSign = getZodiacSign(config.emptyLeg)

  const modalityMeaning = {
    Cardinal: "initiating action and creating change",
    Fixed: "maintaining stability and persistence",
    Mutable: "adapting and finding flexible solutions",
    Mixed: "combining different modes of expression"
  }

  return `${config.modality} T-Square formed by ${p1.name} in ${p1.sign} opposing ` +
    `${p2.name} in ${p2.sign}, both square to ${apex.name} in ${apex.sign} at the apex. ` +
    `The empty leg falls in ${emptyLegSign}, suggesting a path for resolution through ` +
    `${modalityMeaning[config.modality as keyof typeof modalityMeaning]}. ` +
    `This configuration creates dynamic tension focused through the ${apex.name}, ` +
    `driving growth and development.`
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
