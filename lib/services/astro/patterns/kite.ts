import { PlanetPosition, PatternData, PatternVisualization, PatternPlanetData } from '../../../types/birth-chart'
import { isTrine, isOpposition, isSextile, toPlanetData, getDistance, normalizeAngle } from './utils'

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

interface KiteConfiguration {
  grandTrine: [PlanetPosition & { name: string }, PlanetPosition & { name: string }, PlanetPosition & { name: string }]
  oppositionPlanet: PlanetPosition & { name: string }
  apex: PlanetPosition & { name: string }
  weight: number
  element: string
  trineOrbs: [number, number, number]
  oppositionOrb: number
  sextileOrbs: [number, number]
}

/**
 * Detect Kite pattern
 * Requirements:
 * 1. Grand Trine base
 * 2. Opposition to one trine planet
 * 3. Sextiles to other trine planets
 * 4. Consider planet weights and elements
 */
export function detectKite(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  
  // Find all potential Kite configurations
  const configurations = findKiteConfigurations(planets)
  
  // Sort by weight/significance
  configurations.sort((a, b) => b.weight - a.weight)

  // Create pattern for each valid configuration
  for (const config of configurations) {
    const desc = createKiteDescription(config)
    const patternPlanets = [
      ...config.grandTrine,
      config.oppositionPlanet
    ].map(p => ({
      ...toPlanetData(p),
      position: `${p.formatted} ${p.sign}`
    }))

    patterns.push({
      name: 'Kite',
      planets: patternPlanets,
      description: desc,
      visualization: calculateKitePoints(patternPlanets, config.element)
    })
  }

  return patterns
}

/**
 * Find all valid Kite configurations
 */
function findKiteConfigurations(
  planets: Array<PlanetPosition & { name: string }>
): KiteConfiguration[] {
  const configurations: KiteConfiguration[] = []

  // First find Grand Trines
  for (let i = 0; i < planets.length - 3; i++) {
    for (let j = i + 1; j < planets.length - 2; j++) {
      for (let k = j + 1; k < planets.length - 1; k++) {
        const trine = [planets[i], planets[j], planets[k]] as [
          PlanetPosition & { name: string },
          PlanetPosition & { name: string },
          PlanetPosition & { name: string }
        ]

        if (isTrine(trine[0], trine[1]) && 
            isTrine(trine[1], trine[2]) && 
            isTrine(trine[2], trine[0])) {
          
          // For each remaining planet, check if it forms a kite
          const remainingPlanets = planets.filter(p => !trine.includes(p))
          for (const p4 of remainingPlanets) {
            // Check each trine point as potential opposition point
            for (let m = 0; m < 3; m++) {
              const apex = trine[m]
              const sextilePoints = [
                trine[(m + 1) % 3],
                trine[(m + 2) % 3]
              ]

              if (isOpposition(apex, p4) && 
                  isSextile(p4, sextilePoints[0]) && 
                  isSextile(p4, sextilePoints[1])) {
                
                const element = determineElement(trine)
                const weight = calculateKiteWeight(trine, p4)
                const trineOrbs: [number, number, number] = [
                  Math.abs(120 - getDistance(trine[0].longitude, trine[1].longitude)),
                  Math.abs(120 - getDistance(trine[1].longitude, trine[2].longitude)),
                  Math.abs(120 - getDistance(trine[2].longitude, trine[0].longitude))
                ]
                const oppositionOrb = Math.abs(180 - getDistance(apex.longitude, p4.longitude))
                const sextileOrbs: [number, number] = [
                  Math.abs(60 - getDistance(p4.longitude, sextilePoints[0].longitude)),
                  Math.abs(60 - getDistance(p4.longitude, sextilePoints[1].longitude))
                ]

                configurations.push({
                  grandTrine: trine,
                  oppositionPlanet: p4,
                  apex,
                  weight,
                  element,
                  trineOrbs,
                  oppositionOrb,
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
 * Calculate total weight of Kite based on involved planets
 */
function calculateKiteWeight(
  trine: [PlanetPosition & { name: string }, PlanetPosition & { name: string }, PlanetPosition & { name: string }],
  opposition: PlanetPosition & { name: string }
): number {
  const getWeight = (p: PlanetPosition & { name: string }) =>
    PLANET_WEIGHTS[p.name as keyof typeof PLANET_WEIGHTS] || 1

  return trine.reduce((sum, p) => sum + getWeight(p), 0) + getWeight(opposition)
}

/**
 * Determine element of Grand Trine base
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
 * Calculate visualization points for Kite
 */
function calculateKitePoints(
  planets: Array<PatternPlanetData & { position: string }>,
  element: string
): PatternVisualization {
  const centerX = 450  // Center of 900px width
  const centerY = 300  // Center of 600px height
  const radius = 200   // Distance from center to points
  
  // Grand Trine points
  const points = [
    // Bottom two points of trine
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
    // Top point of trine
    {
      x: centerX,
      y: centerY - radius,
      planet: planets[2]
    },
    // Opposition point (bottom)
    {
      x: centerX,
      y: centerY + radius,
      planet: planets[3]
    }
  ]

  return {
    type: 'kite',
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
 * Create detailed Kite description
 */
function createKiteDescription(config: KiteConfiguration): string {
  const elementMeanings = {
    Fire: "creative and spiritual expression",
    Earth: "practical manifestation and material achievement",
    Air: "intellectual understanding and communication",
    Water: "emotional awareness and intuitive flow",
    Mixed: "diverse talents and multi-faceted expression"
  }

  const apexNature = analyzeApexPlanet(config.apex)
  const oppositionNature = analyzeOppositionPlanet(config.oppositionPlanet)

  return `${config.element} Kite pattern with a Grand Trine in ${
    elementMeanings[config.element as keyof typeof elementMeanings]
  }, formed by ${config.grandTrine.map(p => `${p.name} in ${p.sign}`).join(', ')}. ` +
    `${config.oppositionPlanet.name} in ${config.oppositionPlanet.sign} ${oppositionNature}, ` +
    `opposing ${config.apex.name} which ${apexNature}. This pattern combines the harmonious flow ` +
    `of the Grand Trine with the dynamic tension of the opposition, creating opportunities for ` +
    `practical achievement and manifestation.`
}

/**
 * Analyze the nature of the apex planet
 */
function analyzeApexPlanet(apex: PlanetPosition & { name: string }): string {
  const personalPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars']
  const socialPlanets = ['Jupiter', 'Saturn']
  const outerPlanets = ['Uranus', 'Neptune', 'Pluto']

  if (personalPlanets.includes(apex.name)) {
    return 'channels the energy through personal expression and conscious direction'
  } else if (socialPlanets.includes(apex.name)) {
    return 'manifests through social responsibility and life direction'
  } else if (outerPlanets.includes(apex.name)) {
    return 'transforms through generational or collective themes'
  }
  return 'guides the pattern\'s expression'
}

/**
 * Analyze the nature of the opposition planet
 */
function analyzeOppositionPlanet(planet: PlanetPosition & { name: string }): string {
  const weight = PLANET_WEIGHTS[planet.name as keyof typeof PLANET_WEIGHTS] || 1
  
  if (weight >= 8) {
    return 'provides strong conscious focus and direction'
  } else if (weight >= 6) {
    return 'offers structured guidance and development'
  }
  return 'suggests subtle but persistent influence'
}

/**
 * Check if a Kite is exact
 */
export function isExactKite(pattern: PatternData): boolean {
  const TRINE_ORB = 2
  const OPPOSITION_ORB = 2
  const SEXTILE_ORB = 1.5
  const planets = pattern.planets

  // First three planets should form the Grand Trine
  for (let i = 0; i < 3; i++) {
    const p1 = planets[i]
    const p2 = planets[(i + 1) % 3]
    const trineOrb = Math.abs(120 - getDistance(p1.longitude, p2.longitude))
    if (trineOrb > TRINE_ORB) return false
  }

  // Fourth planet should form opposition and sextiles
  const p4 = planets[3]
  const oppositionOrb = Math.abs(180 - getDistance(p4.longitude, planets[0].longitude))
  if (oppositionOrb > OPPOSITION_ORB) return false

  const sextile1Orb = Math.abs(60 - getDistance(p4.longitude, planets[1].longitude))
  const sextile2Orb = Math.abs(60 - getDistance(p4.longitude, planets[2].longitude))
  if (sextile1Orb > SEXTILE_ORB || sextile2Orb > SEXTILE_ORB) return false

  return true
}
