import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { isConjunction, toPlanetData, getDistance, normalizeAngle } from './utils'

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

interface StelliumGroup {
  planets: Array<PlanetPosition & { name: string }>
  weight: number
  centerLongitude: number
  span: number
  house: number
  sign: string
}

/**
 * Detect Stellium pattern
 * Requirements:
 * 1. Three or more planets in close conjunction
 * 2. All planets within orb (varies by planet weight)
 * 3. Consider both sign and house positions
 * 4. Weight-based significance evaluation
 */
export function detectStellium(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  const processedPlanets = new Set<string>()

  // Find all potential stellium groups
  const stelliumGroups: StelliumGroup[] = []
  
  // Check each planet as a potential stellium center
  for (let i = 0; i < planets.length - 2; i++) {
    if (processedPlanets.has(planets[i].name)) continue

    const group = findStelliumGroup(planets[i], planets)
    
    if (group.planets.length >= 3) {
      stelliumGroups.push(group)
      group.planets.forEach(p => processedPlanets.add(p.name))
    }
  }

  // Sort stelliums by weight/significance
  stelliumGroups.sort((a, b) => b.weight - a.weight)

  // Create pattern for each valid stellium
  for (const group of stelliumGroups) {
    const desc = createStelliumDescription(group)
    
    patterns.push({
      name: 'Stellium',
      planets: group.planets.map(toPlanetData),
      description: desc
    })
  }

  return patterns
}

/**
 * Find planets forming a stellium group with a center planet
 */
function findStelliumGroup(
  centerPlanet: PlanetPosition & { name: string },
  allPlanets: Array<PlanetPosition & { name: string }>
): StelliumGroup {
  const group = [centerPlanet]
  const centerWeight = PLANET_WEIGHTS[centerPlanet.name as keyof typeof PLANET_WEIGHTS] || 1
  let totalWeight = centerWeight

  // Find all planets in conjunction with the center
  for (let i = 0; i < allPlanets.length; i++) {
    const planet = allPlanets[i]
    if (planet === centerPlanet) continue

    // Calculate orb based on planet weights
    const planetWeight = PLANET_WEIGHTS[planet.name as keyof typeof PLANET_WEIGHTS] || 1
    const maxOrb = getMaxOrb(centerWeight, planetWeight)

    // Check if planet is within orb of the center and all group members
    if (isWithinOrb(planet, group, maxOrb)) {
      group.push(planet)
      totalWeight += planetWeight
    }
  }

  // Sort planets by longitude
  group.sort((a, b) => a.longitude - b.longitude)

  // Calculate weighted center
  const weightedSum = group.reduce((sum, p) => {
    const weight = PLANET_WEIGHTS[p.name as keyof typeof PLANET_WEIGHTS] || 1
    return sum + normalizeAngle(p.longitude) * weight
  }, 0)
  const centerLongitude = normalizeAngle(weightedSum / totalWeight)

  return {
    planets: group,
    weight: totalWeight,
    centerLongitude,
    span: getDistance(group[0].longitude, group[group.length - 1].longitude),
    house: Math.floor(centerLongitude / 30) + 1,
    sign: getZodiacSign(centerLongitude)
  }
}

/**
 * Calculate maximum allowed orb based on planet weights
 */
function getMaxOrb(weight1: number, weight2: number): number {
  const baseOrb = 12 // Maximum possible orb
  const weightFactor = (weight1 + weight2) / 20 // 20 is max combined weight (Sun + Moon)
  return baseOrb * weightFactor
}

/**
 * Check if a planet is within orb of all planets in a group
 */
function isWithinOrb(
  planet: PlanetPosition,
  group: Array<PlanetPosition & { name: string }>,
  maxOrb: number
): boolean {
  return group.every(groupPlanet => {
    const orb = getDistance(planet.longitude, groupPlanet.longitude)
    return orb <= maxOrb
  })
}

/**
 * Get zodiac sign for a longitude
 */
function getZodiacSign(longitude: number): string {
  const signs = [
    "Aries", "Taurus", "Gemini", "Cancer",
    "Leo", "Virgo", "Libra", "Scorpio",
    "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ]
  const signIndex = Math.floor(normalizeAngle(longitude) / 30)
  return signs[signIndex]
}

/**
 * Create detailed stellium description
 */
function createStelliumDescription(group: StelliumGroup): string {
  // Sort planets by weight for description
  const sortedPlanets = [...group.planets].sort((a, b) => {
    const weightA = PLANET_WEIGHTS[a.name as keyof typeof PLANET_WEIGHTS] || 1
    const weightB = PLANET_WEIGHTS[b.name as keyof typeof PLANET_WEIGHTS] || 1
    return weightB - weightA
  })

  // Determine stellium nature based on planets involved
  const hasLuminary = sortedPlanets.some(p => p.name === 'Sun' || p.name === 'Moon')
  const hasPersonalPlanet = sortedPlanets.some(p => 
    ['Mercury', 'Venus', 'Mars'].includes(p.name)
  )
  const hasOuterPlanet = sortedPlanets.some(p => 
    ['Uranus', 'Neptune', 'Pluto'].includes(p.name)
  )

  let nature = hasLuminary ? 'powerful personal' :
               hasPersonalPlanet ? 'significant personal' :
               hasOuterPlanet ? 'transformative' : 'focused'

  return `${nature} Stellium of ${group.planets.length} planets in ${group.sign} ` +
    `(${group.house}${getOrdinalSuffix(group.house)} house), ` +
    `spanning ${group.span.toFixed(1)}°: ${
      sortedPlanets.map(p => `${p.name} (${p.formatted})`).join(', ')
    }. ` +
    `This concentration of planetary energy suggests ${getStelliumMeaning(group)}.`
}

/**
 * Get ordinal suffix for a number
 */
function getOrdinalSuffix(num: number): string {
  const j = num % 10
  const k = num % 100
  if (j === 1 && k !== 11) return 'st'
  if (j === 2 && k !== 12) return 'nd'
  if (j === 3 && k !== 13) return 'rd'
  return 'th'
}

/**
 * Get interpretation based on stellium composition
 */
function getStelliumMeaning(group: StelliumGroup): string {
  const sign = group.sign
  const house = group.house
  
  // Basic meanings by element
  const elementMeanings = {
    Fire: "dynamic expression and creative energy",
    Earth: "practical focus and material concerns",
    Air: "intellectual activity and communication",
    Water: "emotional depth and intuitive understanding"
  }

  // Get element
  const element = ["Aries", "Leo", "Sagittarius"].includes(sign) ? "Fire" :
                 ["Taurus", "Virgo", "Capricorn"].includes(sign) ? "Earth" :
                 ["Gemini", "Libra", "Aquarius"].includes(sign) ? "Air" :
                 "Water"

  return `a powerful focus on ${elementMeanings[element]} ` +
         `in matters of the ${house}${getOrdinalSuffix(house)} house`
}
