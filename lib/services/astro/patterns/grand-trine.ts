import { PlanetPosition, PatternData, PatternPlanetData, PatternVisualization } from '../../../types/birth-chart'
import { isTrine, toPlanetData, getDistance, normalizeAngle } from './utils'

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

interface GrandTrineConfiguration {
  planets: Array<PlanetPosition & { name: string }>
  weight: number
  element: string
  houses: number[]
  isActive: boolean
}

/**
 * Detect Grand Trine pattern
 * Requirements:
 * 1. Three planets in trine aspects (120°)
 * 2. Consider planet weights and elements
 * 3. Analyze house positions
 * 4. Determine if active or passive
 */
export function detectGrandTrines(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  
  // Find all potential Grand Trine configurations
  const configurations = findGrandTrineConfigurations(planets)
  
  // Sort by weight/significance
  configurations.sort((a, b) => b.weight - a.weight)

  // Create pattern for each valid configuration
  for (const config of configurations) {
    const desc = createGrandTrineDescription(config)
    const patternPlanets = config.planets.map(p => ({
      ...toPlanetData(p),
      position: `${p.formatted} ${p.sign}`
    }))

    patterns.push({
      name: 'Grand Trine',
      planets: patternPlanets,
      description: desc,
      visualization: calculateTrianglePoints(patternPlanets, config.element)
    })
  }

  return patterns
}

/**
 * Find all valid Grand Trine configurations
 */
function findGrandTrineConfigurations(
  planets: Array<PlanetPosition & { name: string }>
): GrandTrineConfiguration[] {
  const configurations: GrandTrineConfiguration[] = []

  for (let i = 0; i < planets.length - 2; i++) {
    for (let j = i + 1; j < planets.length - 1; j++) {
      for (let k = j + 1; k < planets.length; k++) {
        const p1 = planets[i]
        const p2 = planets[j]
        const p3 = planets[k]

        if (isTrine(p1, p2) && isTrine(p2, p3) && isTrine(p3, p1)) {
          const trineGroup = [p1, p2, p3]
          const element = determineElement(trineGroup)
          const weight = calculateGrandTrineWeight(trineGroup)
          const houses = trineGroup.map(p => Math.floor(p.longitude / 30) + 1)
          const isActive = determineIfActive(trineGroup)

          configurations.push({
            planets: trineGroup,
            weight,
            element,
            houses,
            isActive
          })
        }
      }
    }
  }

  return configurations
}

/**
 * Calculate total weight of Grand Trine based on involved planets
 */
function calculateGrandTrineWeight(planets: Array<PlanetPosition & { name: string }>): number {
  return planets.reduce((sum, p) => 
    sum + (PLANET_WEIGHTS[p.name as keyof typeof PLANET_WEIGHTS] || 1), 0
  )
}

/**
 * Determine element of Grand Trine
 */
function determineElement(planets: Array<PlanetPosition & { name: string }>): string {
  const elements = {
    'Fire': ['Aries', 'Leo', 'Sagittarius'],
    'Earth': ['Taurus', 'Virgo', 'Capricorn'],
    'Air': ['Gemini', 'Libra', 'Aquarius'],
    'Water': ['Cancer', 'Scorpio', 'Pisces']
  }

  for (const [element, signs] of Object.entries(elements)) {
    if (planets.every(planet => signs.includes(planet.sign))) {
      return element
    }
  }

  return 'Mixed'
}

/**
 * Determine if Grand Trine is active or passive
 */
function determineIfActive(planets: Array<PlanetPosition & { name: string }>): boolean {
  const activePlanets = ['Sun', 'Mars', 'Jupiter', 'Uranus', 'Pluto']
  return planets.some(p => activePlanets.includes(p.name))
}

/**
 * Calculate visualization points for Grand Trine
 */
function calculateTrianglePoints(
  planets: PatternPlanetData[],
  element: string
): PatternVisualization {
  const centerX = 450  // Center of 900px width
  const centerY = 300  // Center of 600px height
  const radius = 200   // Distance from center to points
  const points = planets.map((planet, i) => {
    const angle = (i * 120 - 90) * Math.PI / 180  // Start at top, go clockwise
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      planet
    }
  })

  return {
    type: 'triangle',
    color: getElementColor(element),
    points
  }
}

/**
 * Get color based on element
 */
function getElementColor(element: string): string {
  switch (element) {
    case 'Fire': return '#F44336'   // Red
    case 'Earth': return '#795548'  // Brown
    case 'Air': return '#2196F3'    // Blue
    case 'Water': return '#00BCD4'  // Cyan
    default: return '#9C27B0'       // Purple for mixed
  }
}

/**
 * Create detailed Grand Trine description
 */
function createGrandTrineDescription(config: GrandTrineConfiguration): string {
  const elementMeanings = {
    Fire: "creative inspiration and spiritual energy",
    Earth: "practical manifestation and material success",
    Air: "intellectual harmony and social connection",
    Water: "emotional flow and intuitive understanding",
    Mixed: "diverse talents and multi-faceted expression"
  }

  const activityLevel = config.isActive ? 
    "an active configuration suggesting dynamic use of these gifts" :
    "a more passive configuration suggesting natural talents that need conscious activation"

  const houseAreas = config.houses
    .map(h => getHouseArea(h))
    .filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
    .join(", ")

  return `${config.element} Grand Trine formed by ${
    config.planets.map(p => `${p.name} in ${p.sign}`).join(', ')
  }. This harmonious pattern suggests natural gifts in ${
    elementMeanings[config.element as keyof typeof elementMeanings]
  }, expressing through the areas of ${houseAreas}. This is ${activityLevel}.`
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
 * Check if a Grand Trine is exact
 */
export function isExactGrandTrine(pattern: PatternData): boolean {
  const EXACT_ORB = 2
  const planets = pattern.planets

  for (let i = 0; i < planets.length; i++) {
    const p1 = planets[i]
    const p2 = planets[(i + 1) % planets.length]
    const angle = Math.abs(p1.longitude - p2.longitude)
    const diff = Math.abs(angle - 120)
    if (diff > EXACT_ORB) {
      return false
    }
  }

  return true
}
