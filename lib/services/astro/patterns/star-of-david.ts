import { PlanetPosition, PatternData, PatternVisualization, PatternPlanetData } from '../../../types/birth-chart'
import { isTrine, isSextile, toPlanetData, getDistance, normalizeAngle } from './utils'

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

interface StarOfDavidConfiguration {
  firstTrine: [PlanetPosition & { name: string }, PlanetPosition & { name: string }, PlanetPosition & { name: string }]
  secondTrine: [PlanetPosition & { name: string }, PlanetPosition & { name: string }, PlanetPosition & { name: string }]
  weight: number
  elements: [string, string]  // Elements of first and second trine
  trineOrbs: [number, number, number, number, number, number]  // All six trine orbs
  sextileOrbs: [number, number, number]  // Three connecting sextile orbs
}

/**
 * Detect Star of David pattern
 * Requirements:
 * 1. Two Grand Trines
 * 2. Connected by sextiles
 * 3. Consider planet weights and elements
 */
export function detectStarOfDavid(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  
  // Find all potential Star of David configurations
  const configurations = findStarOfDavidConfigurations(planets)
  
  // Sort by weight/significance
  configurations.sort((a, b) => b.weight - a.weight)

  // Create pattern for each valid configuration
  for (const config of configurations) {
    const desc = createStarOfDavidDescription(config)
    const patternPlanets = [
      ...config.firstTrine,
      ...config.secondTrine
    ].map(p => ({
      ...toPlanetData(p),
      position: `${p.formatted} ${p.sign}`
    }))

    patterns.push({
      name: 'Star of David',
      planets: patternPlanets,
      description: desc,
      visualization: calculateStarPoints(patternPlanets, config.elements)
    })
  }

  return patterns
}

/**
 * Find all valid Star of David configurations
 */
function findStarOfDavidConfigurations(
  planets: Array<PlanetPosition & { name: string }>
): StarOfDavidConfiguration[] {
  const configurations: StarOfDavidConfiguration[] = []

  for (let i = 0; i < planets.length - 5; i++) {
    for (let j = i + 1; j < planets.length - 4; j++) {
      for (let k = j + 1; k < planets.length - 3; k++) {
        // Check first Grand Trine
        const trine1 = [planets[i], planets[j], planets[k]] as [
          PlanetPosition & { name: string },
          PlanetPosition & { name: string },
          PlanetPosition & { name: string }
        ]

        if (!isGrandTrine(trine1)) continue

        // For remaining planets, find second Grand Trine
        for (let l = k + 1; l < planets.length - 2; l++) {
          for (let m = l + 1; m < planets.length - 1; m++) {
            for (let n = m + 1; n < planets.length; n++) {
              const trine2 = [planets[l], planets[m], planets[n]] as [
                PlanetPosition & { name: string },
                PlanetPosition & { name: string },
                PlanetPosition & { name: string }
              ]

              if (!isGrandTrine(trine2)) continue

              // Check if trines are connected by sextiles
              if (areSextileConnected(trine1, trine2)) {
                const weight = calculateStarWeight(trine1, trine2)
                const elements: [string, string] = [
                  determineElement(trine1),
                  determineElement(trine2)
                ]
                const trineOrbs = calculateTrineOrbs(trine1, trine2)
                const sextileOrbs = calculateSextileOrbs(trine1, trine2)

                configurations.push({
                  firstTrine: trine1,
                  secondTrine: trine2,
                  weight,
                  elements,
                  trineOrbs,
                  sextileOrbs
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
 * Check if three planets form a Grand Trine
 */
function isGrandTrine(
  planets: [PlanetPosition & { name: string }, PlanetPosition & { name: string }, PlanetPosition & { name: string }]
): boolean {
  return isTrine(planets[0], planets[1]) &&
         isTrine(planets[1], planets[2]) &&
         isTrine(planets[2], planets[0])
}

/**
 * Check if two Grand Trines are connected by sextiles
 */
function areSextileConnected(
  trine1: [PlanetPosition & { name: string }, PlanetPosition & { name: string }, PlanetPosition & { name: string }],
  trine2: [PlanetPosition & { name: string }, PlanetPosition & { name: string }, PlanetPosition & { name: string }]
): boolean {
  return isSextile(trine1[0], trine2[0]) &&
         isSextile(trine1[1], trine2[1]) &&
         isSextile(trine1[2], trine2[2])
}

/**
 * Calculate total weight of Star of David based on involved planets
 */
function calculateStarWeight(
  trine1: [PlanetPosition & { name: string }, PlanetPosition & { name: string }, PlanetPosition & { name: string }],
  trine2: [PlanetPosition & { name: string }, PlanetPosition & { name: string }, PlanetPosition & { name: string }]
): number {
  const getWeight = (p: PlanetPosition & { name: string }) =>
    PLANET_WEIGHTS[p.name as keyof typeof PLANET_WEIGHTS] || 1

  return [...trine1, ...trine2].reduce((sum, p) => sum + getWeight(p), 0)
}

/**
 * Determine element of a Grand Trine
 */
function determineElement(
  trine: [PlanetPosition & { name: string }, PlanetPosition & { name: string }, PlanetPosition & { name: string }]
): string {
  const elements = {
    'Fire': ['Aries', 'Leo', 'Sagittarius'],
    'Earth': ['Taurus', 'Virgo', 'Capricorn'],
    'Air': ['Gemini', 'Libra', 'Aquarius'],
    'Water': ['Cancer', 'Scorpio', 'Pisces']
  }

  for (const [element, signs] of Object.entries(elements)) {
    if (trine.every(planet => signs.includes(planet.sign))) {
      return element
    }
  }

  return 'Mixed'
}

/**
 * Calculate all trine orbs
 */
function calculateTrineOrbs(
  trine1: [PlanetPosition & { name: string }, PlanetPosition & { name: string }, PlanetPosition & { name: string }],
  trine2: [PlanetPosition & { name: string }, PlanetPosition & { name: string }, PlanetPosition & { name: string }]
): [number, number, number, number, number, number] {
  return [
    Math.abs(120 - getDistance(trine1[0].longitude, trine1[1].longitude)),
    Math.abs(120 - getDistance(trine1[1].longitude, trine1[2].longitude)),
    Math.abs(120 - getDistance(trine1[2].longitude, trine1[0].longitude)),
    Math.abs(120 - getDistance(trine2[0].longitude, trine2[1].longitude)),
    Math.abs(120 - getDistance(trine2[1].longitude, trine2[2].longitude)),
    Math.abs(120 - getDistance(trine2[2].longitude, trine2[0].longitude))
  ]
}

/**
 * Calculate sextile orbs between trines
 */
function calculateSextileOrbs(
  trine1: [PlanetPosition & { name: string }, PlanetPosition & { name: string }, PlanetPosition & { name: string }],
  trine2: [PlanetPosition & { name: string }, PlanetPosition & { name: string }, PlanetPosition & { name: string }]
): [number, number, number] {
  return [
    Math.abs(60 - getDistance(trine1[0].longitude, trine2[0].longitude)),
    Math.abs(60 - getDistance(trine1[1].longitude, trine2[1].longitude)),
    Math.abs(60 - getDistance(trine1[2].longitude, trine2[2].longitude))
  ]
}

/**
 * Calculate visualization points for Star of David
 */
function calculateStarPoints(
  planets: Array<PatternPlanetData & { position: string }>,
  elements: [string, string]
): PatternVisualization {
  const centerX = 450  // Center of 900px width
  const centerY = 300  // Center of 600px height
  const radius = 200   // Distance from center to points
  
  // Calculate points for first triangle (pointing up)
  const points1 = [0, 1, 2].map(i => {
    const angle = (i * 120 - 90) * Math.PI / 180
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      planet: planets[i]
    }
  })

  // Calculate points for second triangle (pointing down)
  const points2 = [0, 1, 2].map(i => {
    const angle = (i * 120 + 90) * Math.PI / 180
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      planet: planets[i + 3]
    }
  })

  return {
    type: 'star-of-david',
    color: getElementColor(elements),
    points: [...points1, ...points2]
  }
}

/**
 * Get color based on elements
 */
function getElementColor(elements: [string, string]): string {
  const elementColors = {
    Fire: '#F44336',   // Red
    Earth: '#795548',  // Brown
    Air: '#2196F3',    // Blue
    Water: '#00BCD4',  // Cyan
    Mixed: '#9C27B0'   // Purple
  }

  if (elements[0] === elements[1]) {
    return elementColors[elements[0] as keyof typeof elementColors]
  }
  return elementColors.Mixed
}

/**
 * Create detailed Star of David description
 */
function createStarOfDavidDescription(config: StarOfDavidConfiguration): string {
  const elementMeanings = {
    Fire: "creative and spiritual expression",
    Earth: "practical manifestation and material achievement",
    Air: "intellectual understanding and communication",
    Water: "emotional awareness and intuitive flow",
    Mixed: "diverse talents and multi-faceted expression"
  }

  const [element1, element2] = config.elements
  const elementDesc = element1 === element2 ?
    `${element1} element, emphasizing ${elementMeanings[element1 as keyof typeof elementMeanings]}` :
    `${element1} and ${element2} elements, combining ${elementMeanings[element1 as keyof typeof elementMeanings]} with ${elementMeanings[element2 as keyof typeof elementMeanings]}`

  return `Star of David pattern with two interwoven Grand Trines in the ${elementDesc}. ` +
    `First trine formed by ${config.firstTrine.map(p => `${p.name} in ${p.sign}`).join(', ')}, ` +
    `second trine by ${config.secondTrine.map(p => `${p.name} in ${p.sign}`).join(', ')}. ` +
    `This rare configuration suggests exceptional harmony and balance, with potential for ` +
    `significant manifestation and achievement through the integration of multiple talents.`
}

/**
 * Check if a Star of David is exact
 */
export function isExactStarOfDavid(pattern: PatternData): boolean {
  const TRINE_ORB = 2
  const SEXTILE_ORB = 1.5
  const planets = pattern.planets

  // Check first Grand Trine
  for (let i = 0; i < 3; i++) {
    const p1 = planets[i]
    const p2 = planets[(i + 1) % 3]
    const trineOrb = Math.abs(120 - getDistance(p1.longitude, p2.longitude))
    if (trineOrb > TRINE_ORB) return false
  }

  // Check second Grand Trine
  for (let i = 3; i < 6; i++) {
    const p1 = planets[i]
    const p2 = planets[((i + 1) % 3) + 3]
    const trineOrb = Math.abs(120 - getDistance(p1.longitude, p2.longitude))
    if (trineOrb > TRINE_ORB) return false
  }

  // Check connecting sextiles
  for (let i = 0; i < 3; i++) {
    const sextileOrb = Math.abs(60 - getDistance(planets[i].longitude, planets[i + 3].longitude))
    if (sextileOrb > SEXTILE_ORB) return false
  }

  return true
}
