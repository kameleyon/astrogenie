import * as swisseph from 'swisseph'
import { PlanetPosition } from './types'

interface SwissEphemerisResult {
  longitude: number
  latitude: number
  distance: number
  longitudeSpeed: number
  latitudeSpeed: number
  distanceSpeed: number
}

// Planet indices matching Swiss Ephemeris
export const PLANET_INDICES = {
  Sun: swisseph.SE_SUN,
  Moon: swisseph.SE_MOON,
  Mercury: swisseph.SE_MERCURY,
  Venus: swisseph.SE_VENUS,
  Mars: swisseph.SE_MARS,
  Jupiter: swisseph.SE_JUPITER,
  Saturn: swisseph.SE_SATURN,
  Uranus: swisseph.SE_URANUS,
  Neptune: swisseph.SE_NEPTUNE,
  Pluto: swisseph.SE_PLUTO
} as const

export type PlanetName = keyof typeof PLANET_INDICES

// Zodiac signs and their degree ranges
const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer",
  "Leo", "Virgo", "Libra", "Scorpio",
  "Sagittarius", "Capricorn", "Aquarius", "Pisces"
] as const

export type ZodiacSign = typeof ZODIAC_SIGNS[number]

/**
 * Get zodiac sign based on longitude
 */
export function getZodiacSign(longitude: number): ZodiacSign {
  // Normalize longitude to 0-360 range
  const normalizedLongitude = ((longitude % 360) + 360) % 360
  const signIndex = Math.floor(normalizedLongitude / 30)
  return ZODIAC_SIGNS[signIndex]
}

/**
 * Calculate planet positions using Swiss Ephemeris
 */
export async function calculatePlanetPositions(julianDay: number): Promise<Record<PlanetName, PlanetPosition>> {
  const positions: Record<PlanetName, PlanetPosition> = {} as Record<PlanetName, PlanetPosition>
  const flags = swisseph.SEFLG_SPEED | swisseph.SEFLG_SWIEPH

  try {
    // Calculate positions for each planet
    for (const [planet, index] of Object.entries(PLANET_INDICES)) {
      const result = await new Promise<number[]>((resolve, reject) => {
        swisseph.calc_ut(julianDay, index, flags, (data: number[], err: string | null) => {
          if (err) reject(new Error(err))
          else resolve(data)
        })
      })

      positions[planet as PlanetName] = {
        longitude: result[0],
        latitude: result[1],
        distance: result[2],
        longitudeSpeed: result[3],
        sign: getZodiacSign(result[0])
      }
    }

    return positions
  } catch (error) {
    console.error('Error calculating planet positions:', error)
    throw new Error('Failed to calculate planet positions')
  }
}

/**
 * Calculate retrograde status for a planet
 */
export function isRetrograde(longitudeSpeed: number): boolean {
  return longitudeSpeed < 0
}

type DignityType = "domicile" | "exaltation" | "fall" | "detriment" | "neutral"

interface PlanetDignity {
  domicile: ZodiacSign | ZodiacSign[]
  exaltation: ZodiacSign
  fall: ZodiacSign
  detriment: ZodiacSign | ZodiacSign[]
}

const PLANET_DIGNITIES: Record<PlanetName, PlanetDignity> = {
  Sun: { domicile: "Leo", exaltation: "Aries", fall: "Libra", detriment: "Aquarius" },
  Moon: { domicile: "Cancer", exaltation: "Taurus", fall: "Scorpio", detriment: "Capricorn" },
  Mercury: { domicile: ["Gemini", "Virgo"], exaltation: "Virgo", fall: "Pisces", detriment: ["Sagittarius", "Pisces"] },
  Venus: { domicile: ["Taurus", "Libra"], exaltation: "Pisces", fall: "Virgo", detriment: ["Aries", "Scorpio"] },
  Mars: { domicile: ["Aries", "Scorpio"], exaltation: "Capricorn", fall: "Cancer", detriment: ["Libra", "Taurus"] },
  Jupiter: { domicile: ["Sagittarius", "Pisces"], exaltation: "Cancer", fall: "Capricorn", detriment: ["Gemini", "Virgo"] },
  Saturn: { domicile: ["Capricorn", "Aquarius"], exaltation: "Libra", fall: "Aries", detriment: ["Cancer", "Leo"] },
  Uranus: { domicile: "Aquarius", exaltation: "Scorpio", fall: "Leo", detriment: "Leo" },
  Neptune: { domicile: "Pisces", exaltation: "Cancer", fall: "Capricorn", detriment: "Virgo" },
  Pluto: { domicile: "Scorpio", exaltation: "Aries", fall: "Libra", detriment: "Taurus" }
}

/**
 * Get planet's dignity in current sign
 */
export function getPlanetDignity(planet: PlanetName, sign: ZodiacSign): DignityType {
  const planetDignities = PLANET_DIGNITIES[planet]
  if (!planetDignities) return "neutral"

  if (Array.isArray(planetDignities.domicile)) {
    if (planetDignities.domicile.includes(sign)) return "domicile"
  } else if (planetDignities.domicile === sign) {
    return "domicile"
  }

  if (planetDignities.exaltation === sign) return "exaltation"
  if (planetDignities.fall === sign) return "fall"
  
  if (Array.isArray(planetDignities.detriment)) {
    if (planetDignities.detriment.includes(sign)) return "detriment"
  } else if (planetDignities.detriment === sign) {
    return "detriment"
  }

  return "neutral"
}

const DIGNITY_SCORES: Record<DignityType, number> = {
  domicile: 5,
  exaltation: 4,
  neutral: 0,
  detriment: -4,
  fall: -5
}

/**
 * Get planet's essential dignity score
 */
export function getEssentialDignityScore(planet: PlanetName, sign: ZodiacSign): number {
  const dignity = getPlanetDignity(planet, sign)
  return DIGNITY_SCORES[dignity]
}

/**
 * Calculate planet phase (e.g., for Moon phases or planetary visibility)
 */
export function calculatePlanetPhase(planetLongitude: number, sunLongitude: number): string {
  const difference = ((planetLongitude - sunLongitude + 360) % 360)
  
  if (difference < 45) return "New"
  if (difference < 135) return "Waxing"
  if (difference < 225) return "Full"
  if (difference < 315) return "Waning"
  return "New"
}

const AVERAGE_SPEEDS: Record<PlanetName, number> = {
  Sun: 0.9856,
  Moon: 13.1763,
  Mercury: 1.383,
  Venus: 1.2,
  Mars: 0.524,
  Jupiter: 0.083,
  Saturn: 0.034,
  Uranus: 0.012,
  Neptune: 0.006,
  Pluto: 0.004
}

/**
 * Get planet's speed classification
 */
export function getPlanetSpeedStatus(longitudeSpeed: number, planet: PlanetName): string {
  const avgSpeed = AVERAGE_SPEEDS[planet]
  const ratio = Math.abs(longitudeSpeed) / avgSpeed

  if (longitudeSpeed < 0) return "Retrograde"
  if (ratio < 0.75) return "Slow"
  if (ratio > 1.25) return "Fast"
  return "Normal"
}
