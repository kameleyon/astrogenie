import { PlanetPosition, PatternData, PatternVisualization, PatternPlanetData } from '../../../types/birth-chart'
import { isSextile, isTrine, isOpposition, toPlanetData, getDistance, normalizeAngle } from './utils'

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

interface WedgeConfiguration {
  basePlanets: [PlanetPosition & { name: string }, PlanetPosition & { name: string }]
  apexPlanet: PlanetPosition & { name: string }
  type: 'harmonious' | 'challenging'  // trine or opposition based
  weight: number
  orbs: {
    sextile: number
    aspects: [number, number]  // orbs to apex
  }
  elements: {
    base: [string, string]
    apex: string
  }
}

/**
 * Detect Wedge pattern
 * Requirements:
 * 1. Two planets in sextile
 * 2. Both trine or opposition to third planet
 * 3. Consider planet weights and elements
 */
export function detectWedge(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  
  // Find all potential Wedge configurations
  const configurations = findWedgeConfigurations(planets)
  
  // Sort by weight/significance
  configurations.sort((a, b) => b.weight - a.weight)

  // Create pattern for each valid configuration
  for (const config of configurations) {
    const desc = createWedgeDescription(config)
    const patternPlanets = [
      ...config.basePlanets,
      config.apexPlanet
    ].map(p => ({
      ...toPlanetData(p),
      position: `${p.formatted} ${p.sign}`
    }))

    patterns.push({
      name: 'Wedge',
      planets: patternPlanets,
      description: desc,
      visualization: calculateWedgePoints(patternPlanets, config)
    })
  }

  return patterns
}

/**
 * Find all valid Wedge configurations
 */
function findWedgeConfigurations(
  planets: Array<PlanetPosition & { name: string }>
): WedgeConfiguration[] {
  const configurations: WedgeConfiguration[] = []

  for (let i = 0; i < planets.length - 2; i++) {
    for (let j = i + 1; j < planets.length - 1; j++) {
      if (!isSextile(planets[i], planets[j])) continue

      for (let k = 0; k < planets.length; k++) {
        if (k === i || k === j) continue

        // Check for trine configuration
        if (isTrine(planets[i], planets[k]) && isTrine(planets[j], planets[k])) {
          configurations.push(createConfiguration(
            [planets[i], planets[j]],
            planets[k],
            'harmonious'
          ))
        }
        // Check for opposition configuration
        else if (isOpposition(planets[i], planets[k]) && isOpposition(planets[j], planets[k])) {
          configurations.push(createConfiguration(
            [planets[i], planets[j]],
            planets[k],
            'challenging'
          ))
        }
      }
    }
  }

  return configurations
}

/**
 * Create Wedge configuration with all necessary data
 */
function createConfiguration(
  base: [PlanetPosition & { name: string }, PlanetPosition & { name: string }],
  apex: PlanetPosition & { name: string },
  type: 'harmonious' | 'challenging'
): WedgeConfiguration {
  const sextileOrb = Math.abs(60 - getDistance(base[0].longitude, base[1].longitude))
  const aspectAngle = type === 'harmonious' ? 120 : 180
  const aspectOrbs: [number, number] = [
    Math.abs(aspectAngle - getDistance(base[0].longitude, apex.longitude)),
    Math.abs(aspectAngle - getDistance(base[1].longitude, apex.longitude))
  ]

  return {
    basePlanets: base,
    apexPlanet: apex,
    type,
    weight: calculateWedgeWeight(base, apex),
    orbs: {
      sextile: sextileOrb,
      aspects: aspectOrbs
    },
    elements: {
      base: [base[0].sign, base[1].sign],
      apex: apex.sign
    }
  }
}

/**
 * Calculate total weight of Wedge based on involved planets
 */
function calculateWedgeWeight(
  base: [PlanetPosition & { name: string }, PlanetPosition & { name: string }],
  apex: PlanetPosition & { name: string }
): number {
  const getWeight = (p: PlanetPosition & { name: string }) =>
    PLANET_WEIGHTS[p.name as keyof typeof PLANET_WEIGHTS] || 1

  // Apex planet gets double weight as it receives both aspects
  return getWeight(base[0]) + getWeight(base[1]) + (getWeight(apex) * 2)
}

/**
 * Calculate visualization points for Wedge
 */
function calculateWedgePoints(
  planets: Array<PatternPlanetData & { position: string }>,
  config: WedgeConfiguration
): PatternVisualization {
  const centerX = 450  // Center of 900px width
  const centerY = 300  // Center of 600px height
  const radius = 200   // Distance from center to points
  
  const points = [
    // Base planets (sextile)
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
    // Apex planet
    {
      x: centerX,
      y: centerY - radius,
      planet: planets[2]
    }
  ]

  return {
    type: 'wedge',
    color: getWedgeColor(config),
    points
  }
}

/**
 * Get color based on configuration type and elements
 */
function getWedgeColor(config: WedgeConfiguration): string {
  const elementColors = {
    Fire: '#F44336',   // Red
    Earth: '#795548',  // Brown
    Air: '#2196F3',    // Blue
    Water: '#00BCD4'   // Cyan
  }

  // Get dominant element
  const elements = [...config.elements.base, config.elements.apex]
  const elementCounts = elements.reduce((counts, sign) => {
    const element = getElement(sign)
    counts[element] = (counts[element] || 0) + 1
    return counts
  }, {} as Record<string, number>)

  const dominantElement = Object.entries(elementCounts)
    .sort(([,a], [,b]) => b - a)[0][0]

  // Modify color based on configuration type
  const baseColor = elementColors[dominantElement as keyof typeof elementColors]
  return config.type === 'harmonious' ? baseColor : adjustColorForChallenge(baseColor)
}

/**
 * Get element for a zodiac sign
 */
function getElement(sign: string): string {
  const elements = {
    Fire: ['Aries', 'Leo', 'Sagittarius'],
    Earth: ['Taurus', 'Virgo', 'Capricorn'],
    Air: ['Gemini', 'Libra', 'Aquarius'],
    Water: ['Cancer', 'Scorpio', 'Pisces']
  }

  for (const [element, signs] of Object.entries(elements)) {
    if (signs.includes(sign)) return element
  }
  return 'Fire' // Default fallback
}

/**
 * Adjust color for challenging configuration
 */
function adjustColorForChallenge(color: string): string {
  // Darken the color for challenging aspects
  return color.replace(/^#/, '#9')
}

/**
 * Create detailed Wedge description
 */
function createWedgeDescription(config: WedgeConfiguration): string {
  const aspectType = config.type === 'harmonious' ? 'trines' : 'oppositions'
  const nature = config.type === 'harmonious' ? 
    "harmonious integration and flow" : 
    "dynamic tension seeking resolution"

  const elementalNature = analyzeElements(config.elements)
  const planetaryEmphasis = analyzePlanetTypes(config)

  return `Wedge pattern with ${config.basePlanets[0].name} and ${
    config.basePlanets[1].name} in sextile (orb: ${config.orbs.sextile.toFixed(1)}°), ` +
    `both forming ${aspectType} to ${config.apexPlanet.name} (orbs: ${
    config.orbs.aspects[0].toFixed(1)}°, ${config.orbs.aspects[1].toFixed(1)}°). ` +
    `${elementalNature} This configuration suggests ${nature}, ${planetaryEmphasis}`
}

/**
 * Analyze elemental composition
 */
function analyzeElements(elements: { base: [string, string], apex: string }): string {
  const allElements = elements.base.map(getElement).concat(getElement(elements.apex))
  const uniqueElements = Array.from(new Set(allElements))

  if (uniqueElements.length === 1) {
    return `All planets are in ${uniqueElements[0]} signs, emphasizing ${
      uniqueElements[0].toLowerCase()} qualities.`
  }
  return `The pattern combines ${uniqueElements.join(" and ")} elements.`
}

/**
 * Analyze types of planets involved
 */
function analyzePlanetTypes(config: WedgeConfiguration): string {
  const hasLuminary = [...config.basePlanets, config.apexPlanet]
    .some(p => p.name === 'Sun' || p.name === 'Moon')
  const hasBenefic = [...config.basePlanets, config.apexPlanet]
    .some(p => ['Venus', 'Jupiter'].includes(p.name))
  const hasMalefic = [...config.basePlanets, config.apexPlanet]
    .some(p => ['Mars', 'Saturn'].includes(p.name))

  if (hasLuminary && hasBenefic) {
    return "with strong potential for conscious growth and development."
  } else if (hasLuminary && hasMalefic) {
    return "requiring conscious effort to overcome challenges."
  } else if (hasBenefic) {
    return "offering opportunities for growth and expansion."
  } else if (hasMalefic) {
    return "presenting challenges that strengthen character."
  }
  return "working through various levels of experience."
}

/**
 * Check if a Wedge is exact
 */
export function isExactWedge(pattern: PatternData): boolean {
  const ORB = 2
  const planets = pattern.planets

  // Check base sextile
  const sextileOrb = Math.abs(60 - getDistance(planets[0].longitude, planets[1].longitude))
  if (sextileOrb > ORB) return false

  // Determine if it's a trine or opposition configuration
  const aspectAngle = Math.round(getDistance(planets[0].longitude, planets[2].longitude) / 30) * 30
  const isTrineConfig = aspectAngle === 120

  // Check aspects to apex
  const targetAngle = isTrineConfig ? 120 : 180
  const aspect1Orb = Math.abs(targetAngle - getDistance(planets[0].longitude, planets[2].longitude))
  const aspect2Orb = Math.abs(targetAngle - getDistance(planets[1].longitude, planets[2].longitude))

  return aspect1Orb <= ORB && aspect2Orb <= ORB
}
