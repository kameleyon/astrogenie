import { PlanetPosition, PatternData, PatternVisualization, PatternPlanetData } from '../../../types/birth-chart'
import { isOpposition, isSquare, toPlanetData, getDistance, normalizeAngle } from './utils'

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

interface DoubleTSquareConfiguration {
  sharedApex: PlanetPosition & { name: string }
  firstOpposition: [PlanetPosition & { name: string }, PlanetPosition & { name: string }]
  secondOpposition: [PlanetPosition & { name: string }, PlanetPosition & { name: string }]
  weight: number
  orbs: {
    oppositions: [number, number]
    squares: [number, number, number, number]
  }
  modality: string
  intensity: number // Based on planet weights and aspect precision
}

/**
 * Detect Double T-Square pattern
 * Requirements:
 * 1. Two T-Squares sharing an apex planet
 * 2. Each T-Square has opposition square to apex
 * 3. Consider planet weights and modalities
 */
export function detectDoubleTSquare(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  
  // Find all potential Double T-Square configurations
  const configurations = findDoubleTSquareConfigurations(planets)
  
  // Sort by weight/significance
  configurations.sort((a, b) => b.weight - a.weight)

  // Create pattern for each valid configuration
  for (const config of configurations) {
    const desc = createDoubleTSquareDescription(config)
    const patternPlanets = [
      ...config.firstOpposition,
      ...config.secondOpposition,
      config.sharedApex
    ].map(p => ({
      ...toPlanetData(p),
      position: `${p.formatted} ${p.sign}`
    }))

    patterns.push({
      name: 'Double T-Square',
      planets: patternPlanets,
      description: desc,
      visualization: calculateDoubleTSquarePoints(patternPlanets, config.modality)
    })
  }

  return patterns
}

/**
 * Find all valid Double T-Square configurations
 */
function findDoubleTSquareConfigurations(
  planets: Array<PlanetPosition & { name: string }>
): DoubleTSquareConfiguration[] {
  const configurations: DoubleTSquareConfiguration[] = []

  for (let i = 0; i < planets.length - 3; i++) {
    for (let j = i + 1; j < planets.length - 2; j++) {
      for (let k = j + 1; k < planets.length - 1; k++) {
        for (let l = k + 1; l < planets.length; l++) {
          // Try each planet as potential shared apex
          for (const apex of planets) {
            if ([i, j, k, l].includes(planets.indexOf(apex))) continue

            const group = [planets[i], planets[j], planets[k], planets[l]]
            const validConfig = findValidConfiguration(group, apex)
            
            if (validConfig) {
              const weight = calculateDoubleTSquareWeight(group, apex)
              const modality = determineModality([...group, apex])
              const intensity = calculateIntensity(weight, validConfig.orbs)

              configurations.push({
                ...validConfig,
                sharedApex: apex,
                weight,
                modality,
                intensity
              })
            }
          }
        }
      }
    }
  }

  return configurations
}

/**
 * Find valid aspect configuration for Double T-Square
 */
function findValidConfiguration(
  planets: Array<PlanetPosition & { name: string }>,
  apex: PlanetPosition & { name: string }
): {
  firstOpposition: [PlanetPosition & { name: string }, PlanetPosition & { name: string }]
  secondOpposition: [PlanetPosition & { name: string }, PlanetPosition & { name: string }]
  orbs: {
    oppositions: [number, number]
    squares: [number, number, number, number]
  }
} | null {
  // Try all possible opposition pairs
  for (let i = 0; i < 3; i++) {
    for (let j = i + 1; j < 4; j++) {
      const opp1 = [planets[i], planets[j]] as [PlanetPosition & { name: string }, PlanetPosition & { name: string }]
      if (!isOpposition(...opp1)) continue

      // Find second opposition among remaining planets
      const remaining = planets.filter(p => !opp1.includes(p))
      if (isOpposition(remaining[0], remaining[1])) {
        const opp2 = [remaining[0], remaining[1]] as [PlanetPosition & { name: string }, PlanetPosition & { name: string }]

        // Check if all planets square to apex
        if ([...opp1, ...opp2].every(p => isSquare(p, apex))) {
          return {
            firstOpposition: opp1,
            secondOpposition: opp2,
            orbs: {
              oppositions: [
                Math.abs(180 - getDistance(opp1[0].longitude, opp1[1].longitude)),
                Math.abs(180 - getDistance(opp2[0].longitude, opp2[1].longitude))
              ],
              squares: [
                Math.abs(90 - getDistance(opp1[0].longitude, apex.longitude)),
                Math.abs(90 - getDistance(opp1[1].longitude, apex.longitude)),
                Math.abs(90 - getDistance(opp2[0].longitude, apex.longitude)),
                Math.abs(90 - getDistance(opp2[1].longitude, apex.longitude))
              ]
            }
          }
        }
      }
    }
  }

  return null
}

/**
 * Calculate total weight of Double T-Square
 */
function calculateDoubleTSquareWeight(
  oppositionPlanets: Array<PlanetPosition & { name: string }>,
  apex: PlanetPosition & { name: string }
): number {
  const getWeight = (p: PlanetPosition & { name: string }) =>
    PLANET_WEIGHTS[p.name as keyof typeof PLANET_WEIGHTS] || 1

  // Apex planet gets triple weight as it receives four squares
  return oppositionPlanets.reduce((sum, p) => sum + getWeight(p), 0) + (getWeight(apex) * 3)
}

/**
 * Calculate intensity based on weights and orbs
 */
function calculateIntensity(
  weight: number,
  orbs: {
    oppositions: [number, number]
    squares: [number, number, number, number]
  }
): number {
  const avgOppOrb = (orbs.oppositions[0] + orbs.oppositions[1]) / 2
  const avgSquareOrb = orbs.squares.reduce((sum, orb) => sum + orb, 0) / 4
  const orbPrecision = 1 - ((avgOppOrb + avgSquareOrb) / 20) // 20° is max combined orb
  return weight * orbPrecision
}

/**
 * Determine modality of configuration
 */
function determineModality(planets: Array<PlanetPosition & { name: string }>): string {
  const signs = planets.map(p => p.sign)
  
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
 * Calculate visualization points for Double T-Square
 */
function calculateDoubleTSquarePoints(
  planets: Array<PatternPlanetData & { position: string }>,
  modality: string
): PatternVisualization {
  const centerX = 450  // Center of 900px width
  const centerY = 300  // Center of 600px height
  const radius = 200   // Distance from center to points
  
  const points = [
    // First opposition
    {
      x: centerX - radius,
      y: centerY - radius/2,
      planet: planets[0]
    },
    {
      x: centerX + radius,
      y: centerY - radius/2,
      planet: planets[1]
    },
    // Second opposition
    {
      x: centerX - radius,
      y: centerY + radius/2,
      planet: planets[2]
    },
    {
      x: centerX + radius,
      y: centerY + radius/2,
      planet: planets[3]
    },
    // Shared apex
    {
      x: centerX,
      y: centerY,
      planet: planets[4]
    }
  ]

  return {
    type: 'double-t-square',
    color: getModalityColor(modality),
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
 * Create detailed Double T-Square description
 */
function createDoubleTSquareDescription(config: DoubleTSquareConfiguration): string {
  const intensity = config.intensity > 20 ? "powerful" :
                   config.intensity > 15 ? "significant" :
                   "moderate"

  const apexNature = analyzeApexPlanet(config.sharedApex)
  const modalityMeaning = getModalityMeaning(config.modality)

  return `${intensity} Double T-Square pattern with ${config.sharedApex.name} in ${
    config.sharedApex.sign} as the shared apex ${apexNature}. First opposition between ${
    config.firstOpposition[0].name} and ${config.firstOpposition[1].name} (orb: ${
    config.orbs.oppositions[0].toFixed(1)}°), second opposition between ${
    config.secondOpposition[0].name} and ${config.secondOpposition[1].name} (orb: ${
    config.orbs.oppositions[1].toFixed(1)}°). This ${config.modality} configuration ${modalityMeaning}`
}

/**
 * Analyze nature of apex planet
 */
function analyzeApexPlanet(apex: PlanetPosition & { name: string }): string {
  if (['Sun', 'Moon'].includes(apex.name)) {
    return "focusing conscious awareness and emotional integration"
  } else if (['Mercury', 'Venus', 'Mars'].includes(apex.name)) {
    return "channeling personal expression and action"
  } else if (['Jupiter', 'Saturn'].includes(apex.name)) {
    return "mediating social and structural dynamics"
  } else if (['Uranus', 'Neptune', 'Pluto'].includes(apex.name)) {
    return "transforming through collective or generational themes"
  }
  return "integrating multiple levels of experience"
}

/**
 * Get meaning based on modality
 */
function getModalityMeaning(modality: string): string {
  switch (modality) {
    case 'Cardinal':
      return "drives initiative and catalyzes change through dynamic tension."
    case 'Fixed':
      return "builds endurance and determination through sustained pressure."
    case 'Mutable':
      return "develops adaptability and versatility through multiple challenges."
    default:
      return "combines different modes of action for comprehensive development."
  }
}

/**
 * Check if a Double T-Square is exact
 */
export function isExactDoubleTSquare(pattern: PatternData): boolean {
  const ORB = 2
  const planets = pattern.planets

  // Check oppositions
  const opp1Orb = Math.abs(180 - getDistance(planets[0].longitude, planets[1].longitude))
  const opp2Orb = Math.abs(180 - getDistance(planets[2].longitude, planets[3].longitude))
  if (opp1Orb > ORB || opp2Orb > ORB) return false

  // Check squares to shared point
  const sharedPoint = planets[4]
  for (let i = 0; i < 4; i++) {
    const squareOrb = Math.abs(90 - getDistance(planets[i].longitude, sharedPoint.longitude))
    if (squareOrb > ORB) return false
  }

  return true
}
