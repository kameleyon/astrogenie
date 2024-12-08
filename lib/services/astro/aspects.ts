import { AspectData, PlanetPosition, PlanetName, AspectType, AspectNature } from './types'
import { generateAspectInterpretation, generateAspectPatternInterpretation } from '../openrouter'

export interface AspectDefinition {
  angle: number
  orb: number
  nature: AspectNature
}

export const MAJOR_ASPECTS: Record<AspectType, AspectDefinition> = {
  conjunction: {
    angle: 0,
    orb: 10,
    nature: 'neutral'
  },
  opposition: {
    angle: 180,
    orb: 10,
    nature: 'challenging'
  },
  trine: {
    angle: 120,
    orb: 8,
    nature: 'harmonious'
  },
  square: {
    angle: 90,
    orb: 8,
    nature: 'challenging'
  },
  sextile: {
    angle: 60,
    orb: 6,
    nature: 'harmonious'
  },
  quintile: {
    angle: 72,
    orb: 2,
    nature: 'harmonious'
  },
  semisextile: {
    angle: 30,
    orb: 2,
    nature: 'neutral'
  },
  quincunx: {
    angle: 150,
    orb: 3,
    nature: 'challenging'
  },
  sesquiquadrate: {
    angle: 135,
    orb: 2,
    nature: 'challenging'
  },
  semisquare: {
    angle: 45,
    orb: 2,
    nature: 'challenging'
  }
}

/**
 * Calculate the angular difference between two points on the zodiac
 */
function calculateAngle(degree1: number, degree2: number): number {
  const diff = Math.abs(degree1 - degree2)
  return Math.min(diff, 360 - diff)
}

/**
 * Check if an angle forms a particular aspect within orb
 */
function isAspect(angle: number, aspectAngle: number, orb: number): boolean {
  return Math.abs(angle - aspectAngle) <= orb
}

/**
 * Calculate all aspects between planets
 */
export function calculateAspects(
  planetPositions: Record<PlanetName, PlanetPosition>,
  includeMinorAspects: boolean = false
): AspectData[] {
  const aspects: AspectData[] = []
  const aspectTypes = MAJOR_ASPECTS

  const planets = Object.keys(planetPositions) as PlanetName[]

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planet1 = planets[i]
      const planet2 = planets[j]
      const pos1 = planetPositions[planet1]
      const pos2 = planetPositions[planet2]

      const angle = calculateAngle(pos1.longitude, pos2.longitude)

      for (const [aspectName, aspectDef] of Object.entries(aspectTypes)) {
        if (isAspect(angle, aspectDef.angle, aspectDef.orb)) {
          const orb = Math.abs(angle - aspectDef.angle)
          aspects.push({
            planet1,
            planet2,
            aspect: aspectName as AspectType,
            angle,
            orb,
            nature: aspectDef.nature,
            strength: calculateAspectStrength({
              planet1,
              planet2,
              aspect: aspectName as AspectType,
              angle,
              orb,
              nature: aspectDef.nature
            }),
            applying: isApplyingAspect(pos1.longitudeSpeed, pos2.longitudeSpeed, angle, aspectDef.angle)
          })
          break // Only record the tightest aspect between two planets
        }
      }
    }
  }

  return aspects
}

/**
 * Calculate aspect strength based on orb and aspect type
 */
export function calculateAspectStrength(aspect: AspectData): number {
  const aspectDef = MAJOR_ASPECTS[aspect.aspect]
  if (!aspectDef) return 0

  // Base strength based on aspect type
  const baseStrength = {
    conjunction: 10,
    opposition: 9,
    trine: 8,
    square: 7,
    sextile: 6,
    quintile: 5,
    semisextile: 4,
    quincunx: 4,
    sesquiquadrate: 3,
    semisquare: 3
  }[aspect.aspect] || 0

  // Reduce strength based on orb
  const orbFactor = 1 - (aspect.orb / aspectDef.orb)
  return baseStrength * orbFactor
}

/**
 * Determine if an aspect is applying or separating
 */
function isApplyingAspect(
  speed1: number,
  speed2: number,
  currentAngle: number,
  aspectAngle: number
): boolean {
  const relativeSpeed = speed1 - speed2
  const angleToAspect = Math.abs(currentAngle - aspectAngle)
  
  // If relative speed is positive, faster planet is catching up
  return (relativeSpeed > 0 && angleToAspect > 0) ||
         (relativeSpeed < 0 && angleToAspect < 0)
}

/**
 * Get all aspects involving a specific planet
 */
export function getPlanetAspects(
  planet: PlanetName,
  aspects: AspectData[]
): AspectData[] {
  return aspects.filter(aspect => 
    aspect.planet1 === planet || aspect.planet2 === planet
  )
}

/**
 * Calculate the total aspect strength for a planet
 */
export function calculatePlanetAspectStrength(
  planet: PlanetName,
  aspects: AspectData[]
): number {
  const planetAspects = getPlanetAspects(planet, aspects)
  return planetAspects.reduce((total, aspect) => 
    total + calculateAspectStrength(aspect)
  , 0)
}

/**
 * Sort aspects by strength
 */
export function sortAspectsByStrength(aspects: AspectData[]): AspectData[] {
  return [...aspects].sort((a, b) => 
    calculateAspectStrength(b) - calculateAspectStrength(a)
  )
}

/**
 * Get the most significant aspects in a chart
 */
export function getSignificantAspects(
  aspects: AspectData[],
  limit: number = 5
): AspectData[] {
  return sortAspectsByStrength(aspects).slice(0, limit)
}

/**
 * Get detailed interpretation for an aspect
 */
export async function getAspectInterpretation(aspect: AspectData): Promise<string> {
  const aspectDef = MAJOR_ASPECTS[aspect.aspect]
  if (!aspectDef) return 'Unknown aspect type'

  return generateAspectInterpretation(
    aspect.planet1,
    aspect.planet2,
    aspect.aspect,
    aspect.angle,
    aspect.orb,
    aspectDef.nature
  )
}

export interface AspectPattern {
  type: string
  planets: PlanetName[]
  aspects: AspectData[]
}

/**
 * Detect aspect patterns in a chart
 */
export function detectAspectPatterns(aspects: AspectData[]): AspectPattern[] {
  const patterns: AspectPattern[] = []

  // Grand Trine detection
  const trines = aspects.filter(a => a.aspect === 'trine')
  for (let i = 0; i < trines.length; i++) {
    for (let j = i + 1; j < trines.length; j++) {
      const trine1 = trines[i]
      const trine2 = trines[j]
      
      // Check if these trines share a planet
      if (trine1.planet1 === trine2.planet1 || 
          trine1.planet1 === trine2.planet2 ||
          trine1.planet2 === trine2.planet1 ||
          trine1.planet2 === trine2.planet2) {
        
        // Get the third planet that would complete the grand trine
        const planets = new Set([trine1.planet1, trine1.planet2, trine2.planet1, trine2.planet2])
        if (planets.size === 3) {
          patterns.push({
            type: 'Grand Trine',
            planets: Array.from(planets) as PlanetName[],
            aspects: [trine1, trine2]
          })
        }
      }
    }
  }

  // T-Square detection
  const squares = aspects.filter(a => a.aspect === 'square')
  const oppositions = aspects.filter(a => a.aspect === 'opposition')
  
  for (const opposition of oppositions) {
    for (const square of squares) {
      if (square.planet1 === opposition.planet1 ||
          square.planet1 === opposition.planet2) {
        patterns.push({
          type: 'T-Square',
          planets: [opposition.planet1, opposition.planet2, square.planet2],
          aspects: [opposition, square]
        })
      }
      if (square.planet2 === opposition.planet1 ||
          square.planet2 === opposition.planet2) {
        patterns.push({
          type: 'T-Square',
          planets: [opposition.planet1, opposition.planet2, square.planet1],
          aspects: [opposition, square]
        })
      }
    }
  }

  return patterns
}

/**
 * Get interpretation for an aspect pattern
 */
export async function getPatternInterpretation(pattern: AspectPattern): Promise<string> {
  const aspectList = pattern.aspects.map(a => ({
    planet1: a.planet1,
    planet2: a.planet2,
    aspectType: a.aspect
  }))

  return generateAspectPatternInterpretation(
    pattern.type,
    pattern.planets,
    aspectList
  )
}
