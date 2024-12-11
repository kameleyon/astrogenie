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

interface CastleConfiguration {
  grandTrine: [PlanetPosition & { name: string },
               PlanetPosition & { name: string },
               PlanetPosition & { name: string }]
  enhancingPlanet: PlanetPosition & { name: string }
  weight: number
  orbs: {
    trines: [number, number, number]  // Grand Trine orbs
    harmonics: Array<{   // Additional harmonious aspects
      planet: PlanetPosition & { name: string }
      aspect: 'trine' | 'sextile'
      orb: number
    }>
  }
  elements: string[]
  stability: number  // Measure of aspect precision and balance
}

/**
 * Detect Castle pattern
 * Requirements:
 * 1. Grand Trine base
 * 2. Additional planet with harmonious aspects
 * 3. Consider planet weights and elements
 */
export function detectCastle(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  
  // Find all potential Castle configurations
  const configurations = findCastleConfigurations(planets)
  
  // Sort by weight/significance
  configurations.sort((a, b) => b.weight - a.weight)

  // Create pattern for each valid configuration
  for (const config of configurations) {
    const desc = createCastleDescription(config)
    const patternPlanets = [
      ...config.grandTrine,
      config.enhancingPlanet
    ].map(p => ({
      ...toPlanetData(p),
      position: `${p.formatted} ${p.sign}`
    }))

    patterns.push({
      name: 'Castle',
      planets: patternPlanets,
      description: desc,
      visualization: calculateCastlePoints(patternPlanets, config)
    })
  }

  return patterns
}

/**
 * Find all valid Castle configurations
 */
function findCastleConfigurations(
  planets: Array<PlanetPosition & { name: string }>
): CastleConfiguration[] {
  const configurations: CastleConfiguration[] = []

  // Find Grand Trines first
  for (let i = 0; i < planets.length - 2; i++) {
    for (let j = i + 1; j < planets.length - 1; j++) {
      for (let k = j + 1; k < planets.length; k++) {
        const trineGroup = [planets[i], planets[j], planets[k]] as
          [PlanetPosition & { name: string },
           PlanetPosition & { name: string },
           PlanetPosition & { name: string }]

        if (isGrandTrine(trineGroup)) {
          const trineOrbs = calculateTrineOrbs(trineGroup)
          
          // Check remaining planets for harmonious aspects
          const remainingPlanets = planets.filter(p => !trineGroup.includes(p))
          
          for (const enhancer of remainingPlanets) {
            const harmonicAspects = findHarmonicAspects(enhancer, trineGroup)
            
            if (harmonicAspects.length >= 2) {  // Must connect to at least 2 trine planets
              const weight = calculateCastleWeight(trineGroup, enhancer)
              const elements = [...trineGroup, enhancer].map(p => getElement(p.sign))
              const stability = calculateStability(trineOrbs, harmonicAspects)

              configurations.push({
                grandTrine: trineGroup,
                enhancingPlanet: enhancer,
                weight,
                orbs: {
                  trines: trineOrbs,
                  harmonics: harmonicAspects
                },
                elements,
                stability
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
 * Check if three planets form a Grand Trine
 */
function isGrandTrine(
  planets: [PlanetPosition & { name: string },
           PlanetPosition & { name: string },
           PlanetPosition & { name: string }]
): boolean {
  return isTrine(planets[0], planets[1]) &&
         isTrine(planets[1], planets[2]) &&
         isTrine(planets[2], planets[0])
}

/**
 * Calculate orbs for Grand Trine
 */
function calculateTrineOrbs(
  planets: [PlanetPosition & { name: string },
           PlanetPosition & { name: string },
           PlanetPosition & { name: string }]
): [number, number, number] {
  return [
    Math.abs(120 - getDistance(planets[0].longitude, planets[1].longitude)),
    Math.abs(120 - getDistance(planets[1].longitude, planets[2].longitude)),
    Math.abs(120 - getDistance(planets[2].longitude, planets[0].longitude))
  ]
}

/**
 * Find harmonious aspects between a planet and Grand Trine
 */
function findHarmonicAspects(
  planet: PlanetPosition & { name: string },
  trineGroup: [PlanetPosition & { name: string },
               PlanetPosition & { name: string },
               PlanetPosition & { name: string }]
): Array<{
  planet: PlanetPosition & { name: string }
  aspect: 'trine' | 'sextile'
  orb: number
}> {
  const aspects: Array<{
    planet: PlanetPosition & { name: string }
    aspect: 'trine' | 'sextile'
    orb: number
  }> = []

  for (const trine of trineGroup) {
    const dist = getDistance(planet.longitude, trine.longitude)
    if (isTrine(planet, trine)) {
      aspects.push({
        planet: trine,
        aspect: 'trine',
        orb: Math.abs(120 - dist)
      })
    } else if (isSextile(planet, trine)) {
      aspects.push({
        planet: trine,
        aspect: 'sextile',
        orb: Math.abs(60 - dist)
      })
    }
  }

  return aspects
}

/**
 * Calculate total weight of Castle
 */
function calculateCastleWeight(
  trineGroup: [PlanetPosition & { name: string },
               PlanetPosition & { name: string },
               PlanetPosition & { name: string }],
  enhancer: PlanetPosition & { name: string }
): number {
  const getWeight = (p: PlanetPosition & { name: string }) =>
    PLANET_WEIGHTS[p.name as keyof typeof PLANET_WEIGHTS] || 1

  return trineGroup.reduce((sum, p) => sum + getWeight(p), 0) + getWeight(enhancer)
}

/**
 * Calculate stability score based on aspect orbs
 */
function calculateStability(
  trineOrbs: [number, number, number],
  harmonicAspects: Array<{
    planet: PlanetPosition & { name: string }
    aspect: 'trine' | 'sextile'
    orb: number
  }>
): number {
  const avgTrineOrb = trineOrbs.reduce((sum, orb) => sum + orb, 0) / 3
  const avgHarmonicOrb = harmonicAspects.reduce((sum, aspect) => sum + aspect.orb, 0) / 
                        harmonicAspects.length
  
  // Lower orbs mean higher stability
  return 10 - ((avgTrineOrb + avgHarmonicOrb) / 2)
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
 * Calculate visualization points for Castle
 */
function calculateCastlePoints(
  planets: Array<PatternPlanetData & { position: string }>,
  config: CastleConfiguration
): PatternVisualization {
  const centerX = 450  // Center of 900px width
  const centerY = 300  // Center of 600px height
  const radius = 200   // Distance from center to points
  
  const points = [
    // Grand Trine points
    ...planets.slice(0, 3).map((planet, i) => {
      const angle = (i * 120 - 90) * Math.PI / 180  // Start at top, go clockwise
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        planet
      }
    }),
    // Enhancing planet at center-top
    {
      x: centerX,
      y: centerY - radius/2,
      planet: planets[3]
    }
  ]

  return {
    type: 'castle',
    color: getCastleColor(config),
    points
  }
}

/**
 * Get color based on configuration
 */
function getCastleColor(config: CastleConfiguration): string {
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

  // Modify color based on stability
  const baseColor = elementColors[dominantElement as keyof typeof elementColors] || '#9C27B0'
  return config.stability > 8 ? baseColor : adjustColorForInstability(baseColor)
}

/**
 * Adjust color for less stable configuration
 */
function adjustColorForInstability(color: string): string {
  // Darken the color for less stable configurations
  return color.replace(/^#/, '#7')
}

/**
 * Create detailed Castle description
 */
function createCastleDescription(config: CastleConfiguration): string {
  const stability = config.stability > 8 ? "highly stable" :
                   config.stability > 6 ? "well-grounded" :
                   "moderately balanced"

  const elementalNature = analyzeElements(config.elements)
  const planetaryEmphasis = analyzePlanetTypes([...config.grandTrine, config.enhancingPlanet])

  return `Castle pattern with Grand Trine between ${
    config.grandTrine.map(p => `${p.name} in ${p.sign}`).join(', ')
  } (orbs: ${config.orbs.trines.map(o => o.toFixed(1)).join('°, ')}°), enhanced by ${
    config.enhancingPlanet.name} forming ${
    config.orbs.harmonics.map(h => `${h.aspect} to ${h.planet.name} (orb: ${h.orb.toFixed(1)}°)`).join(' and ')
  }. This ${stability} configuration ${elementalNature} ${planetaryEmphasis}`
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
    return "combines all elements in balanced expression,"
  }
  return `emphasizes ${dominantElements.join(" and ")} energy,`
}

/**
 * Analyze types of planets involved
 */
function analyzePlanetTypes(planets: Array<PlanetPosition & { name: string }>): string {
  const hasLuminary = planets.some(p => p.name === 'Sun' || p.name === 'Moon')
  const hasBenefic = planets.some(p => ['Venus', 'Jupiter'].includes(p.name))
  const hasEarth = planets.some(p => ['Saturn'].includes(p.name))

  if (hasLuminary && hasEarth) {
    return "suggesting conscious integration of practical talents."
  } else if (hasLuminary && hasBenefic) {
    return "indicating natural gifts finding stable expression."
  } else if (hasEarth) {
    return "offering grounded support for development."
  }
  return "providing structure for harmonious growth."
}

/**
 * Check if a Castle is exact
 */
export function isExactCastle(pattern: PatternData): boolean {
  const TRINE_ORB = 2
  const SEXTILE_ORB = 1.5
  const planets = pattern.planets

  // First three planets should form the Grand Trine
  for (let i = 0; i < 3; i++) {
    const p1 = planets[i]
    const p2 = planets[(i + 1) % 3]
    const trineOrb = Math.abs(120 - getDistance(p1.longitude, p2.longitude))
    if (trineOrb > TRINE_ORB) return false
  }

  // Fourth planet should form harmonious aspects with at least two of the others
  const p4 = planets[3]
  let exactAspects = 0

  for (let i = 0; i < 3; i++) {
    const dist = getDistance(p4.longitude, planets[i].longitude)
    const trineOrb = Math.abs(120 - dist)
    const sextileOrb = Math.abs(60 - dist)
    
    if (trineOrb <= TRINE_ORB || sextileOrb <= SEXTILE_ORB) {
      exactAspects++
    }
  }

  return exactAspects >= 2
}
