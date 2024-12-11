import { PlanetPosition, PatternData, PatternVisualization, PatternPlanetData } from '../../../types/birth-chart'
import { isSextile, isTrine, toPlanetData, getDistance, normalizeAngle } from './utils'

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

interface GrandSextileConfiguration {
  planets: [PlanetPosition & { name: string }, PlanetPosition & { name: string },
           PlanetPosition & { name: string }, PlanetPosition & { name: string },
           PlanetPosition & { name: string }, PlanetPosition & { name: string }]
  weight: number
  orbs: {
    sextiles: [number, number, number, number, number, number]
    trines: [number, number, number]
  }
  elementDistribution: Record<string, number>
  harmony: number // Measure of aspect precision
}

/**
 * Detect Grand Sextile pattern
 * Requirements:
 * 1. Six planets in sextile forming hexagon
 * 2. Creates trines between alternate planets
 * 3. Consider planet weights and elements
 */
export function detectGrandSextile(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  
  // Find all potential Grand Sextile configurations
  const configurations = findGrandSextileConfigurations(planets)
  
  // Sort by weight/significance
  configurations.sort((a, b) => b.weight - a.weight)

  // Create pattern for each valid configuration
  for (const config of configurations) {
    const desc = createGrandSextileDescription(config)
    const patternPlanets = config.planets.map(p => ({
      ...toPlanetData(p),
      position: `${p.formatted} ${p.sign}`
    }))

    patterns.push({
      name: 'Grand Sextile',
      planets: patternPlanets,
      description: desc,
      visualization: calculateHexagonPoints(patternPlanets, config.elementDistribution)
    })
  }

  return patterns
}

/**
 * Find all valid Grand Sextile configurations
 */
function findGrandSextileConfigurations(
  planets: Array<PlanetPosition & { name: string }>
): GrandSextileConfiguration[] {
  const configurations: GrandSextileConfiguration[] = []

  for (let i = 0; i < planets.length - 5; i++) {
    for (let j = i + 1; j < planets.length - 4; j++) {
      for (let k = j + 1; k < planets.length - 3; k++) {
        for (let l = k + 1; l < planets.length - 2; l++) {
          for (let m = l + 1; m < planets.length - 1; m++) {
            for (let n = m + 1; n < planets.length; n++) {
              const group = [planets[i], planets[j], planets[k],
                           planets[l], planets[m], planets[n]] as [
                PlanetPosition & { name: string }, PlanetPosition & { name: string },
                PlanetPosition & { name: string }, PlanetPosition & { name: string },
                PlanetPosition & { name: string }, PlanetPosition & { name: string }
              ]

              if (isValidGrandSextile(group)) {
                const sextileOrbs = calculateSextileOrbs(group)
                const trineOrbs = calculateTrineOrbs(group)
                const weight = calculateGrandSextileWeight(group)
                const elementDistribution = calculateElementDistribution(group)
                const harmony = calculateHarmony(sextileOrbs, trineOrbs)

                configurations.push({
                  planets: group,
                  weight,
                  orbs: {
                    sextiles: sextileOrbs,
                    trines: trineOrbs
                  },
                  elementDistribution,
                  harmony
                })
              }
            }
          }
        }
      }
    }
  }

  return configurations
}

/**
 * Check if planets form valid Grand Sextile
 */
function isValidGrandSextile(
  planets: [PlanetPosition & { name: string }, PlanetPosition & { name: string },
           PlanetPosition & { name: string }, PlanetPosition & { name: string },
           PlanetPosition & { name: string }, PlanetPosition & { name: string }]
): boolean {
  // Check sextiles around the hexagon
  for (let i = 0; i < 6; i++) {
    if (!isSextile(planets[i], planets[(i + 1) % 6])) return false
  }

  // Check trines across the hexagon
  for (let i = 0; i < 3; i++) {
    if (!isTrine(planets[i], planets[(i + 3) % 6])) return false
  }

  return true
}

/**
 * Calculate sextile orbs around the hexagon
 */
function calculateSextileOrbs(
  planets: [PlanetPosition & { name: string }, PlanetPosition & { name: string },
           PlanetPosition & { name: string }, PlanetPosition & { name: string },
           PlanetPosition & { name: string }, PlanetPosition & { name: string }]
): [number, number, number, number, number, number] {
  return [0, 1, 2, 3, 4, 5].map(i => 
    Math.abs(60 - getDistance(
      planets[i].longitude,
      planets[(i + 1) % 6].longitude
    ))
  ) as [number, number, number, number, number, number]
}

/**
 * Calculate trine orbs across the hexagon
 */
function calculateTrineOrbs(
  planets: [PlanetPosition & { name: string }, PlanetPosition & { name: string },
           PlanetPosition & { name: string }, PlanetPosition & { name: string },
           PlanetPosition & { name: string }, PlanetPosition & { name: string }]
): [number, number, number] {
  return [0, 1, 2].map(i =>
    Math.abs(120 - getDistance(
      planets[i].longitude,
      planets[(i + 3) % 6].longitude
    ))
  ) as [number, number, number]
}

/**
 * Calculate total weight of Grand Sextile
 */
function calculateGrandSextileWeight(
  planets: [PlanetPosition & { name: string }, PlanetPosition & { name: string },
           PlanetPosition & { name: string }, PlanetPosition & { name: string },
           PlanetPosition & { name: string }, PlanetPosition & { name: string }]
): number {
  return planets.reduce((sum, p) => 
    sum + (PLANET_WEIGHTS[p.name as keyof typeof PLANET_WEIGHTS] || 1), 0
  )
}

/**
 * Calculate element distribution
 */
function calculateElementDistribution(
  planets: [PlanetPosition & { name: string }, PlanetPosition & { name: string },
           PlanetPosition & { name: string }, PlanetPosition & { name: string },
           PlanetPosition & { name: string }, PlanetPosition & { name: string }]
): Record<string, number> {
  const elements = {
    'Fire': ['Aries', 'Leo', 'Sagittarius'],
    'Earth': ['Taurus', 'Virgo', 'Capricorn'],
    'Air': ['Gemini', 'Libra', 'Aquarius'],
    'Water': ['Cancer', 'Scorpio', 'Pisces']
  }

  const distribution: Record<string, number> = {
    'Fire': 0,
    'Earth': 0,
    'Air': 0,
    'Water': 0
  }

  planets.forEach(planet => {
    for (const [element, signs] of Object.entries(elements)) {
      if (signs.includes(planet.sign)) {
        distribution[element]++
        break
      }
    }
  })

  return distribution
}

/**
 * Calculate harmony score based on aspect orbs
 */
function calculateHarmony(
  sextileOrbs: [number, number, number, number, number, number],
  trineOrbs: [number, number, number]
): number {
  const avgSextileOrb = sextileOrbs.reduce((sum, orb) => sum + orb, 0) / 6
  const avgTrineOrb = trineOrbs.reduce((sum, orb) => sum + orb, 0) / 3
  
  // Lower orbs mean higher harmony
  return 10 - ((avgSextileOrb + avgTrineOrb) / 2)
}

/**
 * Calculate visualization points for hexagon
 */
function calculateHexagonPoints(
  planets: Array<PatternPlanetData & { position: string }>,
  elements: Record<string, number>
): PatternVisualization {
  const centerX = 450  // Center of 900px width
  const centerY = 300  // Center of 600px height
  const radius = 200   // Distance from center to points
  
  const points = planets.map((planet, i) => {
    const angle = (i * 60) * Math.PI / 180  // 60° between each point
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      planet
    }
  })

  return {
    type: 'hexagon',
    color: getElementColor(elements),
    points
  }
}

/**
 * Get color based on dominant elements
 */
function getElementColor(elements: Record<string, number>): string {
  const dominantElement = Object.entries(elements)
    .sort(([,a], [,b]) => b - a)[0][0]

  const colors = {
    Fire: '#F44336',   // Red
    Earth: '#795548',  // Brown
    Air: '#2196F3',    // Blue
    Water: '#00BCD4'   // Cyan
  }

  return colors[dominantElement as keyof typeof colors]
}

/**
 * Create detailed Grand Sextile description
 */
function createGrandSextileDescription(config: GrandSextileConfiguration): string {
  const elementEmphasis = analyzeElements(config.elementDistribution)
  const planetaryEmphasis = analyzePlanetTypes(config.planets)
  const harmonyLevel = config.harmony > 8 ? "exceptionally harmonious" :
                      config.harmony > 6 ? "well-integrated" :
                      "moderately balanced"

  return `Grand Sextile pattern forming a ${harmonyLevel} hexagon between ${
    config.planets.map(p => `${p.name} in ${p.sign}`).join(', ')
  }. ${elementEmphasis} ${planetaryEmphasis} This rare configuration suggests exceptional potential for ` +
    `balance and manifestation through the integration of multiple talents and abilities.`
}

/**
 * Analyze element distribution
 */
function analyzeElements(elements: Record<string, number>): string {
  const dominantElements = Object.entries(elements)
    .filter(([,count]) => count >= 2)
    .map(([element]) => element)

  if (dominantElements.length === 0) {
    return "The pattern shows an even distribution across elements."
  }
  return `The configuration emphasizes ${dominantElements.join(" and ")} energy.`
}

/**
 * Analyze types of planets involved
 */
function analyzePlanetTypes(
  planets: [PlanetPosition & { name: string }, PlanetPosition & { name: string },
           PlanetPosition & { name: string }, PlanetPosition & { name: string },
           PlanetPosition & { name: string }, PlanetPosition & { name: string }]
): string {
  const hasLuminary = planets.some(p => p.name === 'Sun' || p.name === 'Moon')
  const hasPersonal = planets.some(p => ['Mercury', 'Venus', 'Mars'].includes(p.name))
  const hasSocial = planets.some(p => ['Jupiter', 'Saturn'].includes(p.name))
  const hasOuter = planets.some(p => ['Uranus', 'Neptune', 'Pluto'].includes(p.name))

  const aspects = []
  if (hasLuminary) aspects.push("conscious awareness")
  if (hasPersonal) aspects.push("personal expression")
  if (hasSocial) aspects.push("social integration")
  if (hasOuter) aspects.push("transformative potential")

  return `It combines ${aspects.join(", ")}.`
}

/**
 * Check if a Grand Sextile is exact
 */
export function isExactGrandSextile(pattern: PatternData): boolean {
  const SEXTILE_ORB = 2
  const TRINE_ORB = 2
  const planets = pattern.planets

  // Check sextiles around the hexagon
  for (let i = 0; i < 6; i++) {
    const p1 = planets[i]
    const p2 = planets[(i + 1) % 6]
    const sextileOrb = Math.abs(60 - getDistance(p1.longitude, p2.longitude))
    if (sextileOrb > SEXTILE_ORB) return false
  }

  // Check trines across the hexagon
  for (let i = 0; i < 3; i++) {
    const p1 = planets[i]
    const p2 = planets[(i + 3) % 6]
    const trineOrb = Math.abs(120 - getDistance(p1.longitude, p2.longitude))
    if (trineOrb > TRINE_ORB) return false
  }

  return true
}
