import { PlanetPosition, PatternData, PatternVisualization, PatternPlanetData } from '../../../types/birth-chart'
import { isSquare, isSesquiquadrate, toPlanetData, getDistance, normalizeAngle } from './utils'

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

interface HammerConfiguration {
  basePlanets: [PlanetPosition & { name: string }, PlanetPosition & { name: string }]
  apexPlanet: PlanetPosition & { name: string }
  weight: number
  orbs: {
    square: number
    sesquiquadrates: [number, number]
  }
  intensity: number // Based on planet weights and aspect precision
}

/**
 * Detect Hammer of Thor pattern
 * Requirements:
 * 1. Two planets in square aspect (90°)
 * 2. Both square planets form sesquiquadrate aspects (135°) to apex
 * 3. Consider planet weights and intensity
 */
export function detectHammerOfThor(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  
  // Find all potential Hammer configurations
  const configurations = findHammerConfigurations(planets)
  
  // Sort by weight/significance
  configurations.sort((a, b) => b.weight - a.weight)

  // Create pattern for each valid configuration
  for (const config of configurations) {
    const desc = createHammerDescription(config)
    const patternPlanets = [
      ...config.basePlanets,
      config.apexPlanet
    ].map(p => ({
      ...toPlanetData(p),
      position: `${p.formatted} ${p.sign}`
    }))

    patterns.push({
      name: 'Hammer of Thor',
      planets: patternPlanets,
      description: desc,
      visualization: calculateHammerPoints(patternPlanets)
    })
  }

  return patterns
}

/**
 * Find all valid Hammer configurations
 */
function findHammerConfigurations(
  planets: Array<PlanetPosition & { name: string }>
): HammerConfiguration[] {
  const configurations: HammerConfiguration[] = []

  for (let i = 0; i < planets.length - 2; i++) {
    for (let j = i + 1; j < planets.length - 1; j++) {
      if (!isSquare(planets[i], planets[j])) continue

      for (let k = 0; k < planets.length; k++) {
        if (k === i || k === j) continue

        if (isSesquiquadrate(planets[i], planets[k]) && 
            isSesquiquadrate(planets[j], planets[k])) {
          
          const squareOrb = Math.abs(90 - getDistance(planets[i].longitude, planets[j].longitude))
          const sesquiOrbs: [number, number] = [
            Math.abs(135 - getDistance(planets[i].longitude, planets[k].longitude)),
            Math.abs(135 - getDistance(planets[j].longitude, planets[k].longitude))
          ]

          const weight = calculateHammerWeight(planets[i], planets[j], planets[k])
          const intensity = calculateIntensity(weight, squareOrb, sesquiOrbs)

          configurations.push({
            basePlanets: [planets[i], planets[j]],
            apexPlanet: planets[k],
            weight,
            orbs: {
              square: squareOrb,
              sesquiquadrates: sesquiOrbs
            },
            intensity
          })
        }
      }
    }
  }

  return configurations
}

/**
 * Calculate total weight of Hammer based on involved planets
 */
function calculateHammerWeight(
  p1: PlanetPosition & { name: string },
  p2: PlanetPosition & { name: string },
  apex: PlanetPosition & { name: string }
): number {
  const getWeight = (p: PlanetPosition & { name: string }) =>
    PLANET_WEIGHTS[p.name as keyof typeof PLANET_WEIGHTS] || 1

  // Apex planet gets double weight as it receives both sesquiquadrates
  return getWeight(p1) + getWeight(p2) + (getWeight(apex) * 2)
}

/**
 * Calculate intensity based on weights and orbs
 */
function calculateIntensity(
  weight: number,
  squareOrb: number,
  sesquiOrbs: [number, number]
): number {
  const avgSesquiOrb = (sesquiOrbs[0] + sesquiOrbs[1]) / 2
  const orbPrecision = 1 - ((squareOrb + avgSesquiOrb) / 15) // 15° is max combined orb
  return weight * orbPrecision
}

/**
 * Calculate visualization points for Hammer
 */
function calculateHammerPoints(
  planets: Array<PatternPlanetData & { position: string }>
): PatternVisualization {
  const centerX = 450  // Center of 900px width
  const centerY = 300  // Center of 600px height
  const radius = 200   // Distance from center to points
  
  const points = [
    // Base planets (square aspect)
    {
      x: centerX - radius * Math.cos(Math.PI / 4),
      y: centerY + radius * Math.sin(Math.PI / 4),
      planet: planets[0]
    },
    {
      x: centerX + radius * Math.cos(Math.PI / 4),
      y: centerY + radius * Math.sin(Math.PI / 4),
      planet: planets[1]
    },
    // Apex planet (hammer point)
    {
      x: centerX,
      y: centerY - radius,
      planet: planets[2]
    }
  ]

  return {
    type: 'hammer',
    color: getHammerColor(planets),
    points
  }
}

/**
 * Get color based on planets involved
 */
function getHammerColor(planets: Array<PatternPlanetData & { position: string }>): string {
  const hasMalefic = planets.some(p => ['Mars', 'Saturn', 'Pluto'].includes(p.name))
  const hasBenefic = planets.some(p => ['Venus', 'Jupiter'].includes(p.name))
  
  if (hasMalefic && hasBenefic) {
    return '#9C27B0'  // Purple for mixed influences
  } else if (hasMalefic) {
    return '#F44336'  // Red for challenging energy
  } else if (hasBenefic) {
    return '#FF9800'  // Orange for constructive tension
  }
  return '#795548'    // Brown for neutral energy
}

/**
 * Create detailed Hammer description
 */
function createHammerDescription(config: HammerConfiguration): string {
  const intensity = config.intensity > 15 ? "powerful" :
                   config.intensity > 10 ? "significant" :
                   "moderate"

  const planetNature = analyzePlanetNature(config)
  const resolution = determineResolution(config)

  return `${intensity} Hammer of Thor pattern with ${config.basePlanets[0].name} and ${
    config.basePlanets[1].name} in square aspect (orb: ${config.orbs.square.toFixed(1)}°), ` +
    `both forming sesquiquadrates to ${config.apexPlanet.name} (orbs: ${
    config.orbs.sesquiquadrates[0].toFixed(1)}°, ${config.orbs.sesquiquadrates[1].toFixed(1)}°). ${
    planetNature} ${resolution}`
}

/**
 * Analyze nature of planets involved
 */
function analyzePlanetNature(config: HammerConfiguration): string {
  const hasMalefic = [...config.basePlanets, config.apexPlanet]
    .some(p => ['Mars', 'Saturn', 'Pluto'].includes(p.name))
  const hasBenefic = [...config.basePlanets, config.apexPlanet]
    .some(p => ['Venus', 'Jupiter'].includes(p.name))
  
  if (hasMalefic && hasBenefic) {
    return "This configuration combines challenging and supportive energies,"
  } else if (hasMalefic) {
    return "This intensely challenging configuration"
  } else if (hasBenefic) {
    return "This growth-oriented configuration"
  }
  return "This transformative configuration"
}

/**
 * Determine resolution path based on planets
 */
function determineResolution(config: HammerConfiguration): string {
  const apexNature = config.apexPlanet.name === 'Mars' ? "direct action" :
                    config.apexPlanet.name === 'Saturn' ? "disciplined effort" :
                    config.apexPlanet.name === 'Jupiter' ? "expanded understanding" :
                    config.apexPlanet.name === 'Uranus' ? "innovative solutions" :
                    config.apexPlanet.name === 'Neptune' ? "spiritual insight" :
                    config.apexPlanet.name === 'Pluto' ? "deep transformation" :
                    "focused development"

  return `suggests resolution through ${apexNature} in matters of ${config.apexPlanet.sign}.`
}

/**
 * Check if a Hammer of Thor is exact
 */
export function isExactHammerOfThor(pattern: PatternData): boolean {
  const SQUARE_ORB = 2
  const SESQUI_ORB = 1.5
  const planets = pattern.planets

  // First two planets should form the square
  const squareOrb = Math.abs(90 - getDistance(planets[0].longitude, planets[1].longitude))
  if (squareOrb > SQUARE_ORB) return false

  // Both should form sesquiquadrates with the apex
  const sesqui1Orb = Math.abs(135 - getDistance(planets[0].longitude, planets[2].longitude))
  const sesqui2Orb = Math.abs(135 - getDistance(planets[1].longitude, planets[2].longitude))
  
  return sesqui1Orb <= SESQUI_ORB && sesqui2Orb <= SESQUI_ORB
}
