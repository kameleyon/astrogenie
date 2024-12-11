import { PlanetPosition, PatternData, PatternVisualization, PatternPlanetData } from '../../../types/birth-chart'
import { isOpposition, isSextile, isTrine, toPlanetData, getDistance, normalizeAngle } from './utils'

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

interface MysticRectangleConfiguration {
  planets: [PlanetPosition & { name: string }, PlanetPosition & { name: string }, 
           PlanetPosition & { name: string }, PlanetPosition & { name: string }]
  weight: number
  oppositionPairs: [[number, number], [number, number]]
  harmonicPairs: [[number, number], [number, number], [number, number], [number, number]]
  orbs: {
    oppositions: [number, number]
    trines: [number, number]
    sextiles: [number, number]
  }
  balance: number // Ratio of harmonious to dynamic aspects
}

/**
 * Detect Mystic Rectangle pattern
 * Requirements:
 * 1. Four planets forming a rectangle
 * 2. Two oppositions (long sides)
 * 3. Two trines and two sextiles (diagonals)
 */
export function detectMysticRectangle(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  
  // Find all potential Mystic Rectangle configurations
  const configurations = findMysticRectangleConfigurations(planets)
  
  // Sort by weight/significance
  configurations.sort((a, b) => b.weight - a.weight)

  // Create pattern for each valid configuration
  for (const config of configurations) {
    const desc = createMysticRectangleDescription(config)
    const patternPlanets = config.planets.map(p => ({
      ...toPlanetData(p),
      position: `${p.formatted} ${p.sign}`
    }))

    patterns.push({
      name: 'Mystic Rectangle',
      planets: patternPlanets,
      description: desc,
      visualization: calculateRectanglePoints(patternPlanets)
    })
  }

  return patterns
}

/**
 * Find all valid Mystic Rectangle configurations
 */
function findMysticRectangleConfigurations(
  planets: Array<PlanetPosition & { name: string }>
): MysticRectangleConfiguration[] {
  const configurations: MysticRectangleConfiguration[] = []

  for (let i = 0; i < planets.length - 3; i++) {
    for (let j = i + 1; j < planets.length - 2; j++) {
      for (let k = j + 1; k < planets.length - 1; k++) {
        for (let l = k + 1; l < planets.length; l++) {
          const group = [planets[i], planets[j], planets[k], planets[l]] as [
            PlanetPosition & { name: string },
            PlanetPosition & { name: string },
            PlanetPosition & { name: string },
            PlanetPosition & { name: string }
          ]

          // Check all possible configurations
          const validConfig = findValidConfiguration(group)
          if (validConfig) {
            const weight = calculateRectangleWeight(group)
            const balance = calculateAspectBalance(validConfig.orbs)

            configurations.push({
              planets: group,
              weight,
              ...validConfig,
              balance
            })
          }
        }
      }
    }
  }

  return configurations
}

/**
 * Find valid aspect configuration for four planets
 */
function findValidConfiguration(
  planets: [PlanetPosition & { name: string }, PlanetPosition & { name: string },
           PlanetPosition & { name: string }, PlanetPosition & { name: string }]
): {
  oppositionPairs: [[number, number], [number, number]]
  harmonicPairs: [[number, number], [number, number], [number, number], [number, number]]
  orbs: {
    oppositions: [number, number]
    trines: [number, number]
    sextiles: [number, number]
  }
} | null {
  // Check all possible opposition pairs
  const possibleConfigs = [
    {
      oppositionPairs: [[0, 2], [1, 3]] as [[number, number], [number, number]],
      harmonicPairs: [[0, 1], [1, 2], [2, 3], [3, 0]] as [[number, number], [number, number], [number, number], [number, number]]
    },
    {
      oppositionPairs: [[0, 3], [1, 2]] as [[number, number], [number, number]],
      harmonicPairs: [[0, 1], [1, 3], [3, 2], [2, 0]] as [[number, number], [number, number], [number, number], [number, number]]
    }
  ]

  for (const config of possibleConfigs) {
    // Check oppositions
    const oppositionsValid = config.oppositionPairs.every(([i, j]) => 
      isOpposition(planets[i], planets[j])
    )
    if (!oppositionsValid) continue

    // Check harmonic aspects (trines and sextiles)
    const harmonicValid = config.harmonicPairs.every(([i, j]) => 
      isTrine(planets[i], planets[j]) || isSextile(planets[i], planets[j])
    )
    if (!harmonicValid) continue

    // Calculate orbs
    const oppositionOrbs: [number, number] = [
      Math.abs(180 - getDistance(planets[config.oppositionPairs[0][0]].longitude, planets[config.oppositionPairs[0][1]].longitude)),
      Math.abs(180 - getDistance(planets[config.oppositionPairs[1][0]].longitude, planets[config.oppositionPairs[1][1]].longitude))
    ]

    const trineOrbs: [number, number] = [
      Math.abs(120 - getDistance(planets[config.harmonicPairs[0][0]].longitude, planets[config.harmonicPairs[0][1]].longitude)),
      Math.abs(120 - getDistance(planets[config.harmonicPairs[2][0]].longitude, planets[config.harmonicPairs[2][1]].longitude))
    ]

    const sextileOrbs: [number, number] = [
      Math.abs(60 - getDistance(planets[config.harmonicPairs[1][0]].longitude, planets[config.harmonicPairs[1][1]].longitude)),
      Math.abs(60 - getDistance(planets[config.harmonicPairs[3][0]].longitude, planets[config.harmonicPairs[3][1]].longitude))
    ]

    return {
      oppositionPairs: config.oppositionPairs,
      harmonicPairs: config.harmonicPairs,
      orbs: {
        oppositions: oppositionOrbs,
        trines: trineOrbs,
        sextiles: sextileOrbs
      }
    }
  }

  return null
}

/**
 * Calculate total weight of Mystic Rectangle based on involved planets
 */
function calculateRectangleWeight(
  planets: [PlanetPosition & { name: string }, PlanetPosition & { name: string },
           PlanetPosition & { name: string }, PlanetPosition & { name: string }]
): number {
  return planets.reduce((sum, p) => 
    sum + (PLANET_WEIGHTS[p.name as keyof typeof PLANET_WEIGHTS] || 1), 0
  )
}

/**
 * Calculate balance between harmonious and dynamic aspects
 */
function calculateAspectBalance(orbs: {
  oppositions: [number, number]
  trines: [number, number]
  sextiles: [number, number]
}): number {
  const avgOpposition = (orbs.oppositions[0] + orbs.oppositions[1]) / 2
  const avgHarmonic = (orbs.trines[0] + orbs.trines[1] + orbs.sextiles[0] + orbs.sextiles[1]) / 4
  
  // Higher ratio means more balanced (closer orbs in harmonious aspects)
  return avgHarmonic > 0 ? avgOpposition / avgHarmonic : 0
}

/**
 * Calculate visualization points for Mystic Rectangle
 */
function calculateRectanglePoints(
  planets: Array<PatternPlanetData & { position: string }>
): PatternVisualization {
  const centerX = 450  // Center of 900px width
  const centerY = 300  // Center of 600px height
  const width = 300    // Rectangle width
  const height = 200   // Rectangle height
  
  const points = [
    // Top left
    {
      x: centerX - width/2,
      y: centerY - height/2,
      planet: planets[0]
    },
    // Top right
    {
      x: centerX + width/2,
      y: centerY - height/2,
      planet: planets[1]
    },
    // Bottom right
    {
      x: centerX + width/2,
      y: centerY + height/2,
      planet: planets[2]
    },
    // Bottom left
    {
      x: centerX - width/2,
      y: centerY + height/2,
      planet: planets[3]
    }
  ]

  return {
    type: 'mystic-rectangle',
    color: getPatternColor(planets),
    points
  }
}

/**
 * Get color based on pattern balance
 */
function getPatternColor(planets: Array<PatternPlanetData & { position: string }>): string {
  const hasLuminary = planets.some(p => p.name === 'Sun' || p.name === 'Moon')
  const hasOuterPlanet = planets.some(p => ['Uranus', 'Neptune', 'Pluto'].includes(p.name))
  
  if (hasLuminary && hasOuterPlanet) {
    return '#9C27B0'  // Purple for dynamic integration
  } else if (hasLuminary) {
    return '#2196F3'  // Blue for conscious awareness
  } else if (hasOuterPlanet) {
    return '#4CAF50'  // Green for transformative potential
  }
  return '#FF9800'    // Orange for balanced energy
}

/**
 * Create detailed Mystic Rectangle description
 */
function createMysticRectangleDescription(config: MysticRectangleConfiguration): string {
  const balanceDesc = config.balance < 1.2 ? "well-balanced" :
                     config.balance < 1.5 ? "moderately balanced" :
                     "dynamically charged"

  const planetTypes = analyzePlanetTypes(config.planets)
  const emphasis = determinePlanetaryEmphasis(planetTypes)

  return `Mystic Rectangle pattern formed by ${
    config.planets.map(p => `${p.name} in ${p.sign}`).join(', ')
  }. This ${balanceDesc} configuration combines the dynamic tension of oppositions with harmonious trines and sextiles. ${
    emphasis
  } This pattern suggests a structured approach to handling polarities, with built-in support systems for managing challenges.`
}

/**
 * Analyze types of planets involved
 */
function analyzePlanetTypes(
  planets: [PlanetPosition & { name: string }, PlanetPosition & { name: string },
           PlanetPosition & { name: string }, PlanetPosition & { name: string }]
): {
  personal: number,
  social: number,
  outer: number
} {
  return planets.reduce((counts, p) => {
    if (['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'].includes(p.name)) {
      counts.personal++
    } else if (['Jupiter', 'Saturn'].includes(p.name)) {
      counts.social++
    } else if (['Uranus', 'Neptune', 'Pluto'].includes(p.name)) {
      counts.outer++
    }
    return counts
  }, { personal: 0, social: 0, outer: 0 })
}

/**
 * Determine emphasis based on planet types
 */
function determinePlanetaryEmphasis(types: { personal: number, social: number, outer: number }): string {
  if (types.personal >= 2) {
    return "The pattern emphasizes personal development and conscious integration of opposing forces."
  } else if (types.social >= 2) {
    return "The focus is on balancing social responsibilities and life direction."
  } else if (types.outer >= 2) {
    return "The pattern suggests transformative experiences through structured evolution."
  }
  return "The mixed planetary influences suggest a multi-layered process of integration."
}

/**
 * Check if a Mystic Rectangle is exact
 */
export function isExactMysticRectangle(pattern: PatternData): boolean {
  const ORB = 2
  const planets = pattern.planets

  // Check oppositions
  const opp1Orb = Math.abs(180 - getDistance(planets[0].longitude, planets[2].longitude))
  const opp2Orb = Math.abs(180 - getDistance(planets[1].longitude, planets[3].longitude))
  if (opp1Orb > ORB || opp2Orb > ORB) return false

  // Check sextiles and trines
  for (let i = 0; i < 4; i++) {
    const p1 = planets[i]
    const p2 = planets[(i + 1) % 4]
    const dist = getDistance(p1.longitude, p2.longitude)
    
    // Check if it's a sextile or trine
    const sextileOrb = Math.abs(60 - dist)
    const trineOrb = Math.abs(120 - dist)
    if (sextileOrb > ORB && trineOrb > ORB) return false
  }

  return true
}
