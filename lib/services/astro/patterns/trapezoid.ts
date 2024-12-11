import { PlanetPosition, PatternData, PatternVisualization, PatternPlanetData } from '../../../types/birth-chart'
import { isTrine, isSextile, isSquare, isOpposition, toPlanetData, getDistance, normalizeAngle } from './utils'

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

interface TrapezoidConfiguration {
  harmonicPairs: [[PlanetPosition & { name: string }, PlanetPosition & { name: string }],
                  [PlanetPosition & { name: string }, PlanetPosition & { name: string }]]
  tensePairs: [[PlanetPosition & { name: string }, PlanetPosition & { name: string }],
               [PlanetPosition & { name: string }, PlanetPosition & { name: string }]]
  weight: number
  orbs: {
    harmonic: [number, number]  // orbs for harmonious aspects
    tense: [number, number]     // orbs for tense aspects
  }
  aspectTypes: {
    harmonic: ['trine' | 'sextile', 'trine' | 'sextile']
    tense: ['square' | 'opposition', 'square' | 'opposition']
  }
  elements: string[]
  balance: number  // Ratio of harmonic to tense aspect precision
}

/**
 * Detect Trapezoid pattern
 * Requirements:
 * 1. Four planets forming trapezoid
 * 2. Two parallel harmonious aspects
 * 3. Two connecting tense aspects
 * 4. Consider planet weights and balance
 */
export function detectTrapezoid(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  
  // Find all potential Trapezoid configurations
  const configurations = findTrapezoidConfigurations(planets)
  
  // Sort by weight/significance
  configurations.sort((a, b) => b.weight - a.weight)

  // Create pattern for each valid configuration
  for (const config of configurations) {
    const desc = createTrapezoidDescription(config)
    const patternPlanets = [
      ...config.harmonicPairs[0],
      ...config.harmonicPairs[1]
    ].map(p => ({
      ...toPlanetData(p),
      position: `${p.formatted} ${p.sign}`
    }))

    patterns.push({
      name: 'Trapezoid',
      planets: patternPlanets,
      description: desc,
      visualization: calculateTrapezoidPoints(patternPlanets, config)
    })
  }

  return patterns
}

/**
 * Find all valid Trapezoid configurations
 */
function findTrapezoidConfigurations(
  planets: Array<PlanetPosition & { name: string }>
): TrapezoidConfiguration[] {
  const configurations: TrapezoidConfiguration[] = []

  for (let i = 0; i < planets.length - 3; i++) {
    for (let j = i + 1; j < planets.length - 2; j++) {
      for (let k = j + 1; k < planets.length - 1; k++) {
        for (let l = k + 1; l < planets.length; l++) {
          const group = [planets[i], planets[j], planets[k], planets[l]]
          const config = findValidConfiguration(group)
          
          if (config) {
            const weight = calculateTrapezoidWeight(group)
            const elements = group.map(p => getElement(p.sign))
            const balance = calculateAspectBalance(config.orbs)

            configurations.push({
              ...config,
              weight,
              elements,
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
 * Find valid aspect configuration for Trapezoid
 */
function findValidConfiguration(
  planets: Array<PlanetPosition & { name: string }>
): Omit<TrapezoidConfiguration, 'weight' | 'elements' | 'balance'> | null {
  // Try all possible combinations of pairs
  for (let i = 0; i < 3; i++) {
    for (let j = i + 1; j < 4; j++) {
      const pair1 = [planets[i], planets[j]]
      const remaining = planets.filter(p => !pair1.includes(p))
      
      if (isHarmonicPair(pair1[0], pair1[1])) {
        if (isHarmonicPair(remaining[0], remaining[1])) {
          // Found two harmonic pairs, check if they can be connected by tense aspects
          const tensePairs = findTenseConnections(pair1 as [PlanetPosition & { name: string }, PlanetPosition & { name: string }],
                                                remaining as [PlanetPosition & { name: string }, PlanetPosition & { name: string }])
          if (tensePairs) {
            return {
              harmonicPairs: [pair1, remaining] as [[PlanetPosition & { name: string }, PlanetPosition & { name: string }],
                                                   [PlanetPosition & { name: string }, PlanetPosition & { name: string }]],
              tensePairs,
              orbs: calculateOrbs(pair1 as [PlanetPosition & { name: string }, PlanetPosition & { name: string }],
                                remaining as [PlanetPosition & { name: string }, PlanetPosition & { name: string }],
                                tensePairs),
              aspectTypes: {
                harmonic: [getHarmonicAspectType(pair1[0], pair1[1]),
                          getHarmonicAspectType(remaining[0], remaining[1])] as ['trine' | 'sextile', 'trine' | 'sextile'],
                tense: [getTenseAspectType(tensePairs[0][0], tensePairs[0][1]),
                       getTenseAspectType(tensePairs[1][0], tensePairs[1][1])] as ['square' | 'opposition', 'square' | 'opposition']
              }
            }
          }
        }
      }
    }
  }

  return null
}

/**
 * Check if two planets form a harmonic aspect (trine or sextile)
 */
function isHarmonicPair(p1: PlanetPosition, p2: PlanetPosition): boolean {
  return isTrine(p1, p2) || isSextile(p1, p2)
}

/**
 * Get type of harmonic aspect between planets
 */
function getHarmonicAspectType(p1: PlanetPosition, p2: PlanetPosition): 'trine' | 'sextile' {
  return isTrine(p1, p2) ? 'trine' : 'sextile'
}

/**
 * Get type of tense aspect between planets
 */
function getTenseAspectType(p1: PlanetPosition, p2: PlanetPosition): 'square' | 'opposition' {
  return isSquare(p1, p2) ? 'square' : 'opposition'
}

/**
 * Find tense connections between harmonic pairs
 */
function findTenseConnections(
  pair1: [PlanetPosition & { name: string }, PlanetPosition & { name: string }],
  pair2: [PlanetPosition & { name: string }, PlanetPosition & { name: string }]
): [[PlanetPosition & { name: string }, PlanetPosition & { name: string }],
     [PlanetPosition & { name: string }, PlanetPosition & { name: string }]] | null {
  // Define possible connection patterns
  const patterns = [
    { first: [0, 0], second: [1, 1] },  // Connect corresponding planets
    { first: [0, 1], second: [1, 0] }   // Cross-connect planets
  ]

  for (const pattern of patterns) {
    // Create mutable connection pairs using the pattern
    const conn1: [PlanetPosition & { name: string }, PlanetPosition & { name: string }] = 
      [pair1[pattern.first[0]], pair2[pattern.first[1]]]
    const conn2: [PlanetPosition & { name: string }, PlanetPosition & { name: string }] = 
      [pair1[pattern.second[0]], pair2[pattern.second[1]]]

    if ((isSquare(conn1[0], conn1[1]) || isOpposition(conn1[0], conn1[1])) &&
        (isSquare(conn2[0], conn2[1]) || isOpposition(conn2[0], conn2[1]))) {
      return [conn1, conn2]
    }
  }

  return null
}

/**
 * Calculate orbs for all aspects
 */
function calculateOrbs(
  pair1: [PlanetPosition & { name: string }, PlanetPosition & { name: string }],
  pair2: [PlanetPosition & { name: string }, PlanetPosition & { name: string }],
  tensePairs: [[PlanetPosition & { name: string }, PlanetPosition & { name: string }],
               [PlanetPosition & { name: string }, PlanetPosition & { name: string }]]
): {
  harmonic: [number, number]
  tense: [number, number]
} {
  return {
    harmonic: [
      Math.abs(getHarmonicAspectAngle(pair1[0], pair1[1]) - getDistance(pair1[0].longitude, pair1[1].longitude)),
      Math.abs(getHarmonicAspectAngle(pair2[0], pair2[1]) - getDistance(pair2[0].longitude, pair2[1].longitude))
    ],
    tense: [
      Math.abs(getTenseAspectAngle(tensePairs[0][0], tensePairs[0][1]) - getDistance(tensePairs[0][0].longitude, tensePairs[0][1].longitude)),
      Math.abs(getTenseAspectAngle(tensePairs[1][0], tensePairs[1][1]) - getDistance(tensePairs[1][0].longitude, tensePairs[1][1].longitude))
    ]
  }
}

/**
 * Get expected angle for harmonic aspect
 */
function getHarmonicAspectAngle(p1: PlanetPosition, p2: PlanetPosition): number {
  return isTrine(p1, p2) ? 120 : 60
}

/**
 * Get expected angle for tense aspect
 */
function getTenseAspectAngle(p1: PlanetPosition, p2: PlanetPosition): number {
  return isSquare(p1, p2) ? 90 : 180
}

/**
 * Calculate total weight of Trapezoid
 */
function calculateTrapezoidWeight(planets: Array<PlanetPosition & { name: string }>): number {
  return planets.reduce((sum, p) => 
    sum + (PLANET_WEIGHTS[p.name as keyof typeof PLANET_WEIGHTS] || 1), 0
  )
}

/**
 * Calculate balance between harmonic and tense aspects
 */
function calculateAspectBalance(orbs: {
  harmonic: [number, number]
  tense: [number, number]
}): number {
  const avgHarmonic = (orbs.harmonic[0] + orbs.harmonic[1]) / 2
  const avgTense = (orbs.tense[0] + orbs.tense[1]) / 2
  return avgHarmonic / avgTense  // Lower ratio means better balance
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
  return 'Mixed'
}

/**
 * Calculate visualization points for Trapezoid
 */
function calculateTrapezoidPoints(
  planets: Array<PatternPlanetData & { position: string }>,
  config: TrapezoidConfiguration
): PatternVisualization {
  const centerX = 450  // Center of 900px width
  const centerY = 300  // Center of 600px height
  const width = 300    // Base width
  const height = 200   // Height
  const topWidth = 200 // Top width (smaller for trapezoid shape)
  
  const points = [
    // Bottom left
    {
      x: centerX - width/2,
      y: centerY + height/2,
      planet: planets[0]
    },
    // Bottom right
    {
      x: centerX + width/2,
      y: centerY + height/2,
      planet: planets[1]
    },
    // Top right
    {
      x: centerX + topWidth/2,
      y: centerY - height/2,
      planet: planets[2]
    },
    // Top left
    {
      x: centerX - topWidth/2,
      y: centerY - height/2,
      planet: planets[3]
    }
  ]

  return {
    type: 'trapezoid',
    color: getTrapezoidColor(config),
    points
  }
}

/**
 * Get color based on configuration
 */
function getTrapezoidColor(config: TrapezoidConfiguration): string {
  const elementColors = {
    Fire: '#F44336',   // Red
    Earth: '#795548',  // Brown
    Air: '#2196F3',    // Blue
    Water: '#00BCD4'   // Cyan
  }

  // Get dominant element
  const elementCounts = config.elements.reduce((counts, element) => {
    counts[element] = (counts[element] || 0) + 1
    return counts
  }, {} as Record<string, number>)

  const dominantElement = Object.entries(elementCounts)
    .sort(([,a], [,b]) => b - a)[0][0]

  // Modify color based on aspect balance
  const baseColor = elementColors[dominantElement as keyof typeof elementColors] || '#9C27B0'
  return config.balance < 1.2 ? baseColor : adjustColorForImbalance(baseColor)
}

/**
 * Adjust color for imbalanced configuration
 */
function adjustColorForImbalance(color: string): string {
  // Darken the color for imbalanced configurations
  return color.replace(/^#/, '#7')
}

/**
 * Create detailed Trapezoid description
 */
function createTrapezoidDescription(config: TrapezoidConfiguration): string {
  const harmonicDesc = config.aspectTypes.harmonic
    .map((type, i) => `${config.harmonicPairs[i][0].name}-${config.harmonicPairs[i][1].name} in ${type}`)
    .join(' and ')

  const tenseDesc = config.aspectTypes.tense
    .map((type, i) => `${config.tensePairs[i][0].name}-${config.tensePairs[i][1].name} in ${type}`)
    .join(' and ')

  const balance = config.balance < 1.2 ? "well-balanced" :
                 config.balance < 1.5 ? "moderately balanced" :
                 "dynamically charged"

  const elementalNature = analyzeElements(config.elements)

  return `Trapezoid pattern with ${harmonicDesc} (orbs: ${
    config.orbs.harmonic.map(o => o.toFixed(1)).join('°, ')}°), connected by ${
    tenseDesc} (orbs: ${config.orbs.tense.map(o => o.toFixed(1)).join('°, ')}°). ${
    elementalNature} This ${balance} configuration suggests structured growth through ` +
    `the integration of harmonious and challenging energies.`
}

/**
 * Analyze elemental composition
 */
function analyzeElements(elements: string[]): string {
  const elementCounts = elements.reduce((counts, element) => {
    counts[element] = (counts[element] || 0) + 1
    return counts
  }, {} as Record<string, number>)

  const dominantElements = Object.entries(elementCounts)
    .filter(([,count]) => count >= 2)
    .map(([element]) => element)

  if (dominantElements.length === 0) {
    return "The pattern combines all elements evenly."
  }
  return `The configuration emphasizes ${dominantElements.join(" and ")} energy.`
}

/**
 * Check if a Trapezoid is exact
 */
export function isExactTrapezoid(pattern: PatternData): boolean {
  const ORB = 2
  const planets = pattern.planets

  // Find the harmonic pairs
  let harmonious1 = false, harmonious2 = false
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      const dist = getDistance(planets[i].longitude, planets[j].longitude)
      if (Math.abs(120 - dist) <= ORB || Math.abs(60 - dist) <= ORB) {
        if (!harmonious1) harmonious1 = true
        else harmonious2 = true
      }
    }
  }

  // Find the tense aspects
  let tense1 = false, tense2 = false
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      const dist = getDistance(planets[i].longitude, planets[j].longitude)
      if (Math.abs(90 - dist) <= ORB || Math.abs(180 - dist) <= ORB) {
        if (!tense1) tense1 = true
        else tense2 = true
      }
    }
  }

  return harmonious1 && harmonious2 && tense1 && tense2
}
