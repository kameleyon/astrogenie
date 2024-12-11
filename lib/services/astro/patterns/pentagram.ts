import { PlanetPosition, PatternData, PatternVisualization, PatternPlanetData } from '../../../types/birth-chart'
import { isSextile, isQuintile, toPlanetData, getDistance, normalizeAngle } from './utils'

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

interface PentagramConfiguration {
  planets: [PlanetPosition & { name: string }, PlanetPosition & { name: string },
           PlanetPosition & { name: string }, PlanetPosition & { name: string },
           PlanetPosition & { name: string }]
  weight: number
  orbs: {
    sextiles: [number, number, number, number, number]
    quintiles: [number, number, number, number, number]
  }
  elements: string[]
  harmony: number  // Measure of aspect precision
}

/**
 * Detect Pentagram pattern
 * Requirements:
 * 1. Five planets in sextile around perimeter
 * 2. Quintiles across points
 * 3. Consider planet weights and elements
 */
export function detectPentagram(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  
  // Find all potential Pentagram configurations
  const configurations = findPentagramConfigurations(planets)
  
  // Sort by weight/significance
  configurations.sort((a, b) => b.weight - a.weight)

  // Create pattern for each valid configuration
  for (const config of configurations) {
    const desc = createPentagramDescription(config)
    const patternPlanets = config.planets.map(p => ({
      ...toPlanetData(p),
      position: `${p.formatted} ${p.sign}`
    }))

    patterns.push({
      name: 'Pentagram',
      planets: patternPlanets,
      description: desc,
      visualization: calculatePentagramPoints(patternPlanets, config)
    })
  }

  return patterns
}

/**
 * Find all valid Pentagram configurations
 */
function findPentagramConfigurations(
  planets: Array<PlanetPosition & { name: string }>
): PentagramConfiguration[] {
  const configurations: PentagramConfiguration[] = []

  for (let i = 0; i < planets.length - 4; i++) {
    for (let j = i + 1; j < planets.length - 3; j++) {
      for (let k = j + 1; k < planets.length - 2; k++) {
        for (let l = k + 1; l < planets.length - 1; l++) {
          for (let m = l + 1; m < planets.length; m++) {
            const group = [planets[i], planets[j], planets[k], planets[l], planets[m]] as
              [PlanetPosition & { name: string }, PlanetPosition & { name: string },
               PlanetPosition & { name: string }, PlanetPosition & { name: string },
               PlanetPosition & { name: string }]

            if (isValidPentagram(group)) {
              const orbs = calculateOrbs(group)
              const weight = calculatePentagramWeight(group)
              const elements = group.map(p => getElement(p.sign))
              const harmony = calculateHarmony(orbs)

              configurations.push({
                planets: group,
                weight,
                orbs,
                elements,
                harmony
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
 * Check if planets form valid Pentagram
 */
function isValidPentagram(
  planets: [PlanetPosition & { name: string }, PlanetPosition & { name: string },
           PlanetPosition & { name: string }, PlanetPosition & { name: string },
           PlanetPosition & { name: string }]
): boolean {
  // Check sextiles around perimeter
  for (let i = 0; i < 5; i++) {
    if (!isSextile(planets[i], planets[(i + 1) % 5])) return false
  }

  // Check quintiles across points
  for (let i = 0; i < 5; i++) {
    if (!isQuintile(planets[i], planets[(i + 2) % 5])) return false
  }

  return true
}

/**
 * Calculate orbs for all aspects
 */
function calculateOrbs(
  planets: [PlanetPosition & { name: string }, PlanetPosition & { name: string },
           PlanetPosition & { name: string }, PlanetPosition & { name: string },
           PlanetPosition & { name: string }]
): {
  sextiles: [number, number, number, number, number]
  quintiles: [number, number, number, number, number]
} {
  return {
    sextiles: [0, 1, 2, 3, 4].map(i =>
      Math.abs(60 - getDistance(
        planets[i].longitude,
        planets[(i + 1) % 5].longitude
      ))
    ) as [number, number, number, number, number],
    quintiles: [0, 1, 2, 3, 4].map(i =>
      Math.abs(72 - getDistance(
        planets[i].longitude,
        planets[(i + 2) % 5].longitude
      ))
    ) as [number, number, number, number, number]
  }
}

/**
 * Calculate total weight of Pentagram
 */
function calculatePentagramWeight(
  planets: [PlanetPosition & { name: string }, PlanetPosition & { name: string },
           PlanetPosition & { name: string }, PlanetPosition & { name: string },
           PlanetPosition & { name: string }]
): number {
  return planets.reduce((sum, p) => 
    sum + (PLANET_WEIGHTS[p.name as keyof typeof PLANET_WEIGHTS] || 1), 0
  )
}

/**
 * Calculate harmony score based on aspect orbs
 */
function calculateHarmony(orbs: {
  sextiles: [number, number, number, number, number]
  quintiles: [number, number, number, number, number]
}): number {
  const avgSextileOrb = orbs.sextiles.reduce((sum, orb) => sum + orb, 0) / 5
  const avgQuintileOrb = orbs.quintiles.reduce((sum, orb) => sum + orb, 0) / 5
  
  // Lower orbs mean higher harmony
  return 10 - ((avgSextileOrb + avgQuintileOrb) / 2)
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
 * Calculate visualization points for Pentagram
 */
function calculatePentagramPoints(
  planets: Array<PatternPlanetData & { position: string }>,
  config: PentagramConfiguration
): PatternVisualization {
  const centerX = 450  // Center of 900px width
  const centerY = 300  // Center of 600px height
  const radius = 200   // Distance from center to points
  
  const points = planets.map((planet, i) => {
    const angle = (i * 72 - 90) * Math.PI / 180  // Start at top, go clockwise
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      planet
    }
  })

  return {
    type: 'pentagram',
    color: getPentagramColor(config),
    points
  }
}

/**
 * Get color based on configuration
 */
function getPentagramColor(config: PentagramConfiguration): string {
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

  // Modify color based on harmony
  const baseColor = elementColors[dominantElement as keyof typeof elementColors] || '#9C27B0'
  return config.harmony > 8 ? baseColor : adjustColorForDisharmony(baseColor)
}

/**
 * Adjust color for disharmonious configuration
 */
function adjustColorForDisharmony(color: string): string {
  // Darken the color for less harmonious configurations
  return color.replace(/^#/, '#7')
}

/**
 * Create detailed Pentagram description
 */
function createPentagramDescription(config: PentagramConfiguration): string {
  const harmony = config.harmony > 8 ? "highly harmonious" :
                 config.harmony > 6 ? "well-integrated" :
                 "moderately aligned"

  const elementalNature = analyzeElements(config.elements)
  const planetaryEmphasis = analyzePlanetTypes(config.planets)

  return `Pentagram pattern formed by ${
    config.planets.map(p => `${p.name} in ${p.sign}`).join(', ')
  }, connected by sextiles (orbs: ${
    config.orbs.sextiles.map(o => o.toFixed(1)).join('°, ')}°) and quintiles (orbs: ${
    config.orbs.quintiles.map(o => o.toFixed(1)).join('°, ')}°). This ${harmony} configuration ${
    elementalNature} ${planetaryEmphasis}`
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
    return "combines all elements in perfect balance,"
  }
  return `emphasizes ${dominantElements.join(" and ")} energy,`
}

/**
 * Analyze types of planets involved
 */
function analyzePlanetTypes(
  planets: [PlanetPosition & { name: string }, PlanetPosition & { name: string },
           PlanetPosition & { name: string }, PlanetPosition & { name: string },
           PlanetPosition & { name: string }]
): string {
  const hasLuminary = planets.some(p => p.name === 'Sun' || p.name === 'Moon')
  const hasPersonal = planets.some(p => ['Mercury', 'Venus', 'Mars'].includes(p.name))
  const hasTranspersonal = planets.some(p => ['Uranus', 'Neptune', 'Pluto'].includes(p.name))

  if (hasLuminary && hasTranspersonal) {
    return "suggesting a bridge between conscious awareness and spiritual insight."
  } else if (hasLuminary && hasPersonal) {
    return "indicating creative expression through personal talents."
  } else if (hasTranspersonal) {
    return "pointing to transformative spiritual potential."
  }
  return "offering unique creative opportunities."
}

/**
 * Check if a Pentagram is exact
 */
export function isExactPentagram(pattern: PatternData): boolean {
  const SEXTILE_ORB = 2
  const QUINTILE_ORB = 1.5
  const planets = pattern.planets

  // Check sextiles around the perimeter
  for (let i = 0; i < 5; i++) {
    const p1 = planets[i]
    const p2 = planets[(i + 1) % 5]
    const sextileOrb = Math.abs(60 - getDistance(p1.longitude, p2.longitude))
    if (sextileOrb > SEXTILE_ORB) return false
  }

  // Check quintiles across the points
  for (let i = 0; i < 5; i++) {
    const p1 = planets[i]
    const p2 = planets[(i + 2) % 5]
    const quintileOrb = Math.abs(72 - getDistance(p1.longitude, p2.longitude))
    if (quintileOrb > QUINTILE_ORB) return false
  }

  return true
}
