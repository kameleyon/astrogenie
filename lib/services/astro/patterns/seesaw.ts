import { PlanetPosition, PatternData, PatternVisualization, PatternPlanetData } from '../../../types/birth-chart'
import { getDistance, isOpposition, toPlanetData, normalizeAngle } from './utils'

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

interface SeesawConfiguration {
  group1: Array<PlanetPosition & { name: string }>
  group2: Array<PlanetPosition & { name: string }>
  weight: number
  oppositions: Array<{
    planet1: PlanetPosition & { name: string }
    planet2: PlanetPosition & { name: string }
    orb: number
  }>
  spans: {
    group1: number
    group2: number
  }
  elements: {
    group1: string[]
    group2: string[]
  }
  modalities: {
    group1: string[]
    group2: string[]
  }
  tension: number  // Measure of opposition strength and group balance
}

/**
 * Detect Seesaw pattern
 * Requirements:
 * 1. Two opposing planet groups
 * 2. At least one opposition
 * 3. Groups within 60° spans
 * 4. Consider weights and balance
 */
export function detectSeesaw(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  
  // Find all potential Seesaw configurations
  const configurations = findSeesawConfigurations(planets)
  
  // Sort by weight/significance
  configurations.sort((a, b) => b.weight - a.weight)

  // Create pattern for each valid configuration
  for (const config of configurations) {
    const desc = createSeesawDescription(config)
    const patternPlanets = [
      ...config.group1,
      ...config.group2
    ].map(p => ({
      ...toPlanetData(p),
      position: `${p.formatted} ${p.sign}`
    }))

    patterns.push({
      name: 'Seesaw',
      planets: patternPlanets,
      description: desc,
      visualization: calculateSeesawPoints(patternPlanets, config)
    })
  }

  return patterns
}

/**
 * Find all valid Seesaw configurations
 */
function findSeesawConfigurations(
  planets: Array<PlanetPosition & { name: string }>
): SeesawConfiguration[] {
  const configurations: SeesawConfiguration[] = []
  const sortedPlanets = [...planets].sort((a, b) => a.longitude - b.longitude)

  // Try different split points
  for (let i = 0; i < sortedPlanets.length - 1; i++) {
    const midLong = (sortedPlanets[i].longitude + sortedPlanets[i + 1].longitude) / 2
    const oppositeMidLong = normalizeAngle(midLong + 180)

    // Group planets
    const group1: Array<PlanetPosition & { name: string }> = []
    const group2: Array<PlanetPosition & { name: string }> = []

    planets.forEach(planet => {
      const distToMid1 = getDistance(planet.longitude, midLong)
      const distToMid2 = getDistance(planet.longitude, oppositeMidLong)
      
      if (distToMid1 <= 60) {
        group1.push(planet)
      } else if (distToMid2 <= 60) {
        group2.push(planet)
      }
    })

    if (group1.length >= 2 && group2.length >= 2) {
      const oppositions = findOppositions(group1, group2)
      
      if (oppositions.length > 0) {
        const weight = calculateSeesawWeight(group1, group2)
        const spans = {
          group1: getGroupSpan(group1),
          group2: getGroupSpan(group2)
        }
        const elements = {
          group1: group1.map(p => getElement(p.sign)),
          group2: group2.map(p => getElement(p.sign))
        }
        const modalities = {
          group1: group1.map(p => getModality(p.sign)),
          group2: group2.map(p => getModality(p.sign))
        }
        const tension = calculateTension(oppositions, spans)

        configurations.push({
          group1,
          group2,
          weight,
          oppositions,
          spans,
          elements,
          modalities,
          tension
        })

        // Break after finding first valid configuration
        break
      }
    }
  }

  return configurations
}

/**
 * Find oppositions between groups
 */
function findOppositions(
  group1: Array<PlanetPosition & { name: string }>,
  group2: Array<PlanetPosition & { name: string }>
): Array<{
  planet1: PlanetPosition & { name: string }
  planet2: PlanetPosition & { name: string }
  orb: number
}> {
  const oppositions = []

  for (const p1 of group1) {
    for (const p2 of group2) {
      if (isOpposition(p1, p2)) {
        const orb = Math.abs(180 - getDistance(p1.longitude, p2.longitude))
        oppositions.push({ planet1: p1, planet2: p2, orb })
      }
    }
  }

  return oppositions
}

/**
 * Calculate total weight of Seesaw
 */
function calculateSeesawWeight(
  group1: Array<PlanetPosition & { name: string }>,
  group2: Array<PlanetPosition & { name: string }>
): number {
  const getWeight = (p: PlanetPosition & { name: string }) =>
    PLANET_WEIGHTS[p.name as keyof typeof PLANET_WEIGHTS] || 1

  return [...group1, ...group2].reduce((sum, p) => sum + getWeight(p), 0)
}

/**
 * Calculate span of a group
 */
function getGroupSpan(
  group: Array<PlanetPosition & { name: string }>
): number {
  if (group.length < 2) return 0
  const sortedLongs = group.map(p => p.longitude).sort((a, b) => a - b)
  return getDistance(sortedLongs[0], sortedLongs[sortedLongs.length - 1])
}

/**
 * Calculate tension based on oppositions and spans
 */
function calculateTension(
  oppositions: Array<{
    planet1: PlanetPosition & { name: string }
    planet2: PlanetPosition & { name: string }
    orb: number
  }>,
  spans: {
    group1: number
    group2: number
  }
): number {
  const avgOrb = oppositions.reduce((sum, opp) => sum + opp.orb, 0) / oppositions.length
  const spanDiff = Math.abs(spans.group1 - spans.group2)
  
  // Higher tension when orbs are tight and spans are similar
  return 10 - (avgOrb / 2) - (spanDiff / 12)
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
 * Get modality for a zodiac sign
 */
function getModality(sign: string): string {
  const modalities = {
    Cardinal: ['Aries', 'Cancer', 'Libra', 'Capricorn'],
    Fixed: ['Taurus', 'Leo', 'Scorpio', 'Aquarius'],
    Mutable: ['Gemini', 'Virgo', 'Sagittarius', 'Pisces']
  }

  for (const [modality, signs] of Object.entries(modalities)) {
    if (signs.includes(sign)) return modality
  }
  return 'Mixed'
}

/**
 * Calculate visualization points for Seesaw
 */
function calculateSeesawPoints(
  planets: Array<PatternPlanetData & { position: string }>,
  config: SeesawConfiguration
): PatternVisualization {
  const centerX = 450  // Center of 900px width
  const centerY = 300  // Center of 600px height
  const radius = 200   // Distance from center to points
  
  const group1Length = config.group1.length
  const group2Length = config.group2.length
  
  const points = [
    // Group 1 points (left side)
    ...planets.slice(0, group1Length).map((planet, i) => ({
      x: centerX - radius,
      y: centerY - radius/2 + (radius * i/(group1Length - 1)),
      planet
    })),
    // Group 2 points (right side)
    ...planets.slice(group1Length).map((planet, i) => ({
      x: centerX + radius,
      y: centerY - radius/2 + (radius * i/(group2Length - 1)),
      planet
    }))
  ]

  return {
    type: 'seesaw',
    color: getSeesawColor(config),
    points
  }
}

/**
 * Get color based on configuration
 */
function getSeesawColor(config: SeesawConfiguration): string {
  const elementColors = {
    Fire: '#F44336',   // Red
    Earth: '#795548',  // Brown
    Air: '#2196F3',    // Blue
    Water: '#00BCD4'   // Cyan
  }

  // Get dominant elements for each group
  const getDominantElement = (elements: string[]) => {
    const counts = elements.reduce((acc, el) => {
      acc[el] = (acc[el] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    return Object.entries(counts).sort(([,a], [,b]) => b - a)[0][0]
  }

  const element1 = getDominantElement(config.elements.group1)
  const element2 = getDominantElement(config.elements.group2)

  // Blend colors if different elements
  const color1 = elementColors[element1 as keyof typeof elementColors] || '#9C27B0'
  const color2 = elementColors[element2 as keyof typeof elementColors] || '#9C27B0'

  return config.tension > 7 ? blendColors(color1, color2, 0.5) : darkenColor(blendColors(color1, color2, 0.5))
}

/**
 * Blend two hex colors
 */
function blendColors(color1: string, color2: string, ratio: number): string {
  const hex = (x: number) => Math.round(x).toString(16).padStart(2, '0')
  const r1 = parseInt(color1.slice(1, 3), 16)
  const g1 = parseInt(color1.slice(3, 5), 16)
  const b1 = parseInt(color1.slice(5, 7), 16)
  const r2 = parseInt(color2.slice(1, 3), 16)
  const g2 = parseInt(color2.slice(3, 5), 16)
  const b2 = parseInt(color2.slice(5, 7), 16)
  
  const r = r1 * ratio + r2 * (1 - ratio)
  const g = g1 * ratio + g2 * (1 - ratio)
  const b = b1 * ratio + b2 * (1 - ratio)
  
  return `#${hex(r)}${hex(g)}${hex(b)}`
}

/**
 * Darken a hex color
 */
function darkenColor(color: string): string {
  return color.replace(/^#/, '#7')
}

/**
 * Create detailed Seesaw description
 */
function createSeesawDescription(config: SeesawConfiguration): string {
  const tension = config.tension > 8 ? "highly dynamic" :
                 config.tension > 6 ? "moderately balanced" :
                 "loosely connected"

  const elementalNature = analyzeElements(config)
  const modalityNature = analyzeModalities(config)

  return `Seesaw pattern between ${
    describeGroup(config.group1, 'first')} (span: ${config.spans.group1.toFixed(1)}°) and ${
    describeGroup(config.group2, 'second')} (span: ${config.spans.group2.toFixed(1)}°), connected by ${
    config.oppositions.map(opp => `${opp.planet1.name}-${opp.planet2.name} opposition (orb: ${
    opp.orb.toFixed(1)}°)`).join(' and ')}. This ${tension} configuration ${
    elementalNature} ${modalityNature}`
}

/**
 * Describe a group of planets
 */
function describeGroup(
  group: Array<PlanetPosition & { name: string }>,
  position: string
): string {
  return `${position} group (${group.map(p => `${p.name} in ${p.sign}`).join(', ')})`
}

/**
 * Analyze elemental composition
 */
function analyzeElements(config: SeesawConfiguration): string {
  const getDominantElement = (elements: string[]) => {
    const counts = elements.reduce((acc, el) => {
      acc[el] = (acc[el] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    return Object.entries(counts).sort(([,a], [,b]) => b - a)[0][0]
  }

  const element1 = getDominantElement(config.elements.group1)
  const element2 = getDominantElement(config.elements.group2)

  if (element1 === element2) {
    return `emphasizes ${element1} energy through different expressions,`
  }
  return `balances ${element1} and ${element2} energies,`
}

/**
 * Analyze modality composition
 */
function analyzeModalities(config: SeesawConfiguration): string {
  const getDominantModality = (modalities: string[]) => {
    const counts = modalities.reduce((acc, m) => {
      acc[m] = (acc[m] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    return Object.entries(counts).sort(([,a], [,b]) => b - a)[0][0]
  }

  const modality1 = getDominantModality(config.modalities.group1)
  const modality2 = getDominantModality(config.modalities.group2)

  if (modality1 === modality2) {
    return `expressing through ${modality1.toLowerCase()} modes of action.`
  }
  return `working through ${modality1.toLowerCase()} and ${modality2.toLowerCase()} approaches.`
}

/**
 * Check if a Seesaw is exact
 */
export function isExactSeesaw(pattern: PatternData): boolean {
  const GROUP_SPAN = 45
  const OPPOSITION_ORB = 3

  // Split planets into two groups based on longitude
  const sortedPlanets = [...pattern.planets].sort((a, b) => a.longitude - b.longitude)
  const midIndex = Math.floor(sortedPlanets.length / 2)
  const group1 = sortedPlanets.slice(0, midIndex)
  const group2 = sortedPlanets.slice(midIndex)

  // Check group spans
  const group1Span = getDistance(group1[0].longitude, group1[group1.length - 1].longitude)
  const group2Span = getDistance(group2[0].longitude, group2[group2.length - 1].longitude)
  if (group1Span > GROUP_SPAN || group2Span > GROUP_SPAN) return false

  // Check for at least one exact opposition
  let hasExactOpposition = false
  for (const p1 of group1) {
    for (const p2 of group2) {
      const orb = Math.abs(180 - getDistance(p1.longitude, p2.longitude))
      if (orb <= OPPOSITION_ORB) {
        hasExactOpposition = true
        break
      }
    }
    if (hasExactOpposition) break
  }

  return hasExactOpposition
}
