import { PlanetPosition, PatternData, PatternVisualization, PatternPlanetData } from '../../../types/birth-chart'
import { isSextile, isQuincunx, toPlanetData, getDistance, normalizeAngle } from './utils'

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

interface YodConfiguration {
  base1: PlanetPosition & { name: string }
  base2: PlanetPosition & { name: string }
  apex: PlanetPosition & { name: string }
  weight: number
  baseMidpoint: number
  sextileOrb: number
  quincunxOrbs: [number, number]  // Tuple type for exactly two numbers
}

/**
 * Detect Yod (Finger of God) pattern
 * Requirements:
 * 1. Two planets in sextile (60°)
 * 2. Both quincunx (150°) to apex planet
 * 3. Consider planet weights and houses
 * 4. Analyze apex planet's role
 */
export function detectYod(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  
  // Find all potential Yod configurations
  const configurations = findYodConfigurations(planets)
  
  // Sort by weight/significance
  configurations.sort((a, b) => b.weight - a.weight)

  // Create pattern for each valid configuration
  for (const config of configurations) {
    const desc = createYodDescription(config)
    const patternPlanets = [config.base1, config.base2, config.apex].map(p => ({
      ...toPlanetData(p),
      position: `${p.formatted} ${p.sign}`
    }))

    patterns.push({
      name: 'Finger of God (Yod)',
      planets: patternPlanets,
      description: desc,
      visualization: calculateYodPoints(patternPlanets)
    })
  }

  return patterns
}

/**
 * Find all valid Yod configurations
 */
function findYodConfigurations(
  planets: Array<PlanetPosition & { name: string }>
): YodConfiguration[] {
  const configurations: YodConfiguration[] = []

  for (let i = 0; i < planets.length - 2; i++) {
    for (let j = i + 1; j < planets.length - 1; j++) {
      if (!isSextile(planets[i], planets[j])) continue

      for (let k = 0; k < planets.length; k++) {
        if (k === i || k === j) continue

        if (isQuincunx(planets[i], planets[k]) && isQuincunx(planets[j], planets[k])) {
          const weight = calculateYodWeight(planets[i], planets[j], planets[k])
          const baseMidpoint = calculateMidpoint(planets[i].longitude, planets[j].longitude)
          const sextileOrb = Math.abs(60 - getDistance(planets[i].longitude, planets[j].longitude))
          
          // Explicitly create tuple of two numbers
          const quincunxOrbs: [number, number] = [
            Math.abs(150 - getDistance(planets[i].longitude, planets[k].longitude)),
            Math.abs(150 - getDistance(planets[j].longitude, planets[k].longitude))
          ]

          configurations.push({
            base1: planets[i],
            base2: planets[j],
            apex: planets[k],
            weight,
            baseMidpoint,
            sextileOrb,
            quincunxOrbs
          })
        }
      }
    }
  }

  return configurations
}

/**
 * Calculate total weight of Yod based on involved planets
 */
function calculateYodWeight(
  base1: PlanetPosition & { name: string },
  base2: PlanetPosition & { name: string },
  apex: PlanetPosition & { name: string }
): number {
  const getWeight = (p: PlanetPosition & { name: string }) =>
    PLANET_WEIGHTS[p.name as keyof typeof PLANET_WEIGHTS] || 1

  // Apex planet gets double weight as it receives both quincunxes
  return getWeight(base1) + getWeight(base2) + (getWeight(apex) * 2)
}

/**
 * Calculate midpoint between two longitudes
 */
function calculateMidpoint(long1: number, long2: number): number {
  const diff = getDistance(long1, long2)
  const midpoint = long1 + (diff / 2)
  return normalizeAngle(midpoint)
}

/**
 * Calculate visualization points for Yod
 */
function calculateYodPoints(planets: Array<PatternPlanetData>): PatternVisualization {
  const centerX = 450  // Center of 900px width
  const centerY = 300  // Center of 600px height
  const radius = 200   // Distance from center to points
  
  // Base planets at bottom
  const points = [
    {
      x: centerX - radius * Math.cos(Math.PI / 6),
      y: centerY + radius * Math.sin(Math.PI / 6),
      planet: planets[0]
    },
    {
      x: centerX + radius * Math.cos(Math.PI / 6),
      y: centerY + radius * Math.sin(Math.PI / 6),
      planet: planets[1]
    },
    // Apex planet at top
    {
      x: centerX,
      y: centerY - radius,
      planet: planets[2]
    }
  ]

  return {
    type: 'yod',
    color: '#9C27B0',  // Purple for karmic/fated aspects
    points
  }
}

/**
 * Create detailed Yod description
 */
function createYodDescription(config: YodConfiguration): string {
  const apexNature = analyzeApexPlanet(config.apex)
  const baseHarmony = analyzeSextileBase(config.base1, config.base2)
  const resolution = getYodResolution(config)

  return `Yod (Finger of God) pattern with ${config.apex.name} in ${config.apex.sign} ` +
    `at the apex (${apexNature}), receiving quincunxes from ${config.base1.name} ` +
    `in ${config.base1.sign} and ${config.base2.name} in ${config.base2.sign} ` +
    `(${baseHarmony}). ${resolution}`
}

/**
 * Analyze the nature of the apex planet
 */
function analyzeApexPlanet(apex: PlanetPosition & { name: string }): string {
  const personalPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars']
  const socialPlanets = ['Jupiter', 'Saturn']
  const outerPlanets = ['Uranus', 'Neptune', 'Pluto']

  if (personalPlanets.includes(apex.name)) {
    return 'focusing personal development and conscious adjustment'
  } else if (socialPlanets.includes(apex.name)) {
    return 'highlighting social responsibility and life direction'
  } else if (outerPlanets.includes(apex.name)) {
    return 'indicating transformative or generational themes'
  }
  return 'suggesting karmic or developmental imperatives'
}

/**
 * Analyze the sextile base relationship
 */
function analyzeSextileBase(
  base1: PlanetPosition & { name: string },
  base2: PlanetPosition & { name: string }
): string {
  const weight1 = PLANET_WEIGHTS[base1.name as keyof typeof PLANET_WEIGHTS] || 1
  const weight2 = PLANET_WEIGHTS[base2.name as keyof typeof PLANET_WEIGHTS] || 1
  
  if (weight1 + weight2 >= 16) {
    return 'forming a powerful cooperative base'
  } else if (weight1 + weight2 >= 12) {
    return 'creating a supportive foundation'
  }
  return 'providing background support'
}

/**
 * Get interpretation of Yod resolution
 */
function getYodResolution(config: YodConfiguration): string {
  const apexHouse = Math.floor(config.apex.longitude / 30) + 1
  const baseMidpointHouse = Math.floor(config.baseMidpoint / 30) + 1

  return `This configuration suggests a need for adjustment and special development ` +
    `in matters of the ${getHouseArea(apexHouse)}, drawing upon resources and abilities ` +
    `related to the ${getHouseArea(baseMidpointHouse)}. The resolution involves ` +
    `integrating these seemingly incompatible energies through conscious awareness ` +
    `and purposeful action.`
}

/**
 * Get general area of life for a house
 */
function getHouseArea(house: number): string {
  const areas = [
    "self-expression",
    "resources and values",
    "communication",
    "foundations and family",
    "creativity and pleasure",
    "work and service",
    "relationships",
    "transformation",
    "higher learning",
    "career and status",
    "groups and aspirations",
    "spirituality and unconscious"
  ]
  return areas[house - 1]
}

/**
 * Check if a Yod is exact
 */
export function isExactYod(pattern: PatternData): boolean {
  const SEXTILE_ORB = 2
  const QUINCUNX_ORB = 1.5
  const [base1, base2, apex] = pattern.planets

  // Check sextile between base planets
  const sextileOrb = Math.abs(60 - getDistance(base1.longitude, base2.longitude))
  if (sextileOrb > SEXTILE_ORB) return false

  // Check quincunxes to apex
  const quincunx1Orb = Math.abs(150 - getDistance(base1.longitude, apex.longitude))
  const quincunx2Orb = Math.abs(150 - getDistance(base2.longitude, apex.longitude))
  
  return quincunx1Orb <= QUINCUNX_ORB && quincunx2Orb <= QUINCUNX_ORB
}
