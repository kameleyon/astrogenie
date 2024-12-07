import { AspectData, PlanetPosition } from './types'
import { PlanetName } from './planets'

export interface AspectDefinition {
  angle: number
  orb: number
  nature: 'harmonious' | 'challenging' | 'neutral'
  interpretation: string
}

export const MAJOR_ASPECTS: Record<string, AspectDefinition> = {
  conjunction: {
    angle: 0,
    orb: 10,
    nature: 'neutral',
    interpretation: 'Fusion and intensification of planetary energies'
  },
  opposition: {
    angle: 180,
    orb: 10,
    nature: 'challenging',
    interpretation: 'Tension and awareness between planetary energies'
  },
  trine: {
    angle: 120,
    orb: 8,
    nature: 'harmonious',
    interpretation: 'Easy flow and harmony between planetary energies'
  },
  square: {
    angle: 90,
    orb: 8,
    nature: 'challenging',
    interpretation: 'Tension and growth between planetary energies'
  },
  sextile: {
    angle: 60,
    orb: 6,
    nature: 'harmonious',
    interpretation: 'Opportunity and cooperation between planetary energies'
  }
}

export const MINOR_ASPECTS: Record<string, AspectDefinition> = {
  quintile: {
    angle: 72,
    orb: 2,
    nature: 'harmonious',
    interpretation: 'Creative expression and talent'
  },
  semisextile: {
    angle: 30,
    orb: 2,
    nature: 'neutral',
    interpretation: 'Subtle connection and minor adjustments'
  },
  quincunx: {
    angle: 150,
    orb: 3,
    nature: 'challenging',
    interpretation: 'Adjustment and adaptation required'
  },
  sesquiquadrate: {
    angle: 135,
    orb: 2,
    nature: 'challenging',
    interpretation: 'Internal tension and adjustment'
  },
  semisquare: {
    angle: 45,
    orb: 2,
    nature: 'challenging',
    interpretation: 'Minor challenges and irritations'
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
  const aspectTypes = includeMinorAspects 
    ? { ...MAJOR_ASPECTS, ...MINOR_ASPECTS }
    : MAJOR_ASPECTS

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
            aspect: aspectName,
            angle,
            orb
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
  const aspectDef = { ...MAJOR_ASPECTS, ...MINOR_ASPECTS }[aspect.aspect]
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
 * Get the nature of an aspect (harmonious, challenging, neutral)
 */
export function getAspectNature(aspectName: string): 'harmonious' | 'challenging' | 'neutral' {
  const aspect = { ...MAJOR_ASPECTS, ...MINOR_ASPECTS }[aspectName]
  return aspect?.nature || 'neutral'
}

/**
 * Calculate mutual reception between planets
 */
export function calculateMutualReceptions(
  planetPositions: Record<PlanetName, PlanetPosition>
): Array<{ planet1: PlanetName; planet2: PlanetName }> {
  const receptions: Array<{ planet1: PlanetName; planet2: PlanetName }> = []
  const planets = Object.keys(planetPositions) as PlanetName[]

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planet1 = planets[i]
      const planet2 = planets[j]
      const sign1 = planetPositions[planet1].sign
      const sign2 = planetPositions[planet2].sign

      // Check if planets are in each other's ruling signs
      // This is a simplified version - could be expanded to include exaltations
      if (isRulingSign(planet1, sign2) && isRulingSign(planet2, sign1)) {
        receptions.push({ planet1, planet2 })
      }
    }
  }

  return receptions
}

/**
 * Helper function to check if a planet rules a sign
 */
function isRulingSign(planet: PlanetName, sign: string): boolean {
  const rulerships: Record<PlanetName, string[]> = {
    Sun: ['Leo'],
    Moon: ['Cancer'],
    Mercury: ['Gemini', 'Virgo'],
    Venus: ['Taurus', 'Libra'],
    Mars: ['Aries', 'Scorpio'],
    Jupiter: ['Sagittarius', 'Pisces'],
    Saturn: ['Capricorn', 'Aquarius'],
    Uranus: ['Aquarius'],
    Neptune: ['Pisces'],
    Pluto: ['Scorpio']
  }

  return rulerships[planet]?.includes(sign) || false
}
