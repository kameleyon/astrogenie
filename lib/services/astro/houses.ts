import * as swisseph from 'swisseph'
import { HousePosition, GeoPosition } from './types'
import { getZodiacSign } from './planets'

// Map our house system codes to Swiss Ephemeris constants
const HOUSE_SYSTEM_MAP = {
  'P': swisseph.SE_HSYS_PLACIDUS,
  'K': swisseph.SE_HSYS_KOCH,
  'O': swisseph.SE_HSYS_PORPHYRIUS,
  'R': swisseph.SE_HSYS_REGIOMONTANUS,
  'C': swisseph.SE_HSYS_CAMPANUS,
  'E': swisseph.SE_HSYS_EQUAL,
  'W': swisseph.SE_HSYS_WHOLE_SIGN,
  'X': swisseph.SE_HSYS_MERIDIAN,
  'M': swisseph.SE_HSYS_MORINUS,
  'H': swisseph.SE_HSYS_HORIZONTAL,
  'T': swisseph.SE_HSYS_POLICH_PAGE,
  'B': swisseph.SE_HSYS_ALCABITIUS,
  'A': swisseph.SE_HSYS_GAUQUELIN
} as const

export type HouseSystem = keyof typeof HOUSE_SYSTEM_MAP

interface HouseSystemInfo {
  name: string
  description: string
  bestUseCase: string
}

export const HOUSE_SYSTEMS: Record<HouseSystem, HouseSystemInfo> = {
  P: {
    name: 'Placidus',
    description: 'Time-based system dividing the ecliptic by planetary hours',
    bestUseCase: 'Traditional Western astrology, psychological interpretation'
  },
  K: {
    name: 'Koch',
    description: 'Time-based system using trisection of diurnal/nocturnal arcs',
    bestUseCase: 'Psychological astrology, timing of events'
  },
  O: {
    name: 'Porphyry',
    description: 'Space-based system trisecting the ecliptic between angles',
    bestUseCase: 'Simple calculations, traditional astrology'
  },
  R: {
    name: 'Regiomontanus',
    description: 'Great circle system using the celestial equator',
    bestUseCase: 'Medieval astrology, horary questions'
  },
  C: {
    name: 'Campanus',
    description: 'Great circle system using the prime vertical',
    bestUseCase: 'Spiritual and psychological interpretation'
  },
  E: {
    name: 'Equal House',
    description: 'Equal 30° divisions from the Ascendant',
    bestUseCase: 'Simple interpretations, beginners'
  },
  W: {
    name: 'Whole Sign',
    description: 'Each house equals one complete sign',
    bestUseCase: 'Traditional Hellenistic astrology'
  },
  X: {
    name: 'Meridian',
    description: 'Houses divided equally from the meridian',
    bestUseCase: 'Focus on career and public life'
  },
  M: {
    name: 'Morinus',
    description: 'Uses the celestial equator and equal divisions',
    bestUseCase: 'Modern psychological interpretation'
  },
  H: {
    name: 'Horizontal',
    description: 'Based on the horizon and prime vertical',
    bestUseCase: 'Local space astrology'
  },
  T: {
    name: 'Topocentric',
    description: 'Similar to Placidus but accounts for observer location',
    bestUseCase: 'Precise timing, location-specific interpretation'
  },
  B: {
    name: 'Alcabitius',
    description: 'Semi-temporal system used in medieval astrology',
    bestUseCase: 'Traditional and medieval techniques'
  },
  A: {
    name: 'Equal MC',
    description: 'Equal houses from the Midheaven',
    bestUseCase: 'Focus on career and life direction'
  }
}

/**
 * Calculate house cusps using specified house system with Swiss Ephemeris
 */
export async function calculateHouseCusps(
  julianDay: number,
  position: GeoPosition,
  houseSystem: HouseSystem = 'P'
): Promise<{
  cusps: Record<number, HousePosition>
  ascendant: number
  midheaven: number
}> {
  return new Promise((resolve, reject) => {
    try {
      const hsys = HOUSE_SYSTEM_MAP[houseSystem]
      swisseph.swe_houses(
        julianDay,
        position.latitude,
        position.longitude,
        hsys,
        (result: { cusps: number[]; ascmc: number[] } | null, error: string | null) => {
          if (error) {
            reject(new Error(error))
            return
          }

          if (!result) {
            reject(new Error('No result from Swiss Ephemeris'))
            return
          }

          const { cusps, ascmc } = result
          const housePositions: Record<number, HousePosition> = {}

          // Process house cusps
          for (let i = 1; i <= 12; i++) {
            const longitude = cusps[i]
            housePositions[i] = {
              cusp: longitude,
              sign: getZodiacSign(longitude)
            }
          }

          resolve({
            cusps: housePositions,
            ascendant: ascmc[0], // Ascendant is first element
            midheaven: ascmc[1]  // Midheaven is second element
          })
        }
      )
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Get the house that contains a specific degree
 */
export function getHousePosition(
  degree: number,
  cusps: Record<number, HousePosition>
): number {
  const cuspDegrees = Object.entries(cusps).map(([house, pos]) => ({
    house: parseInt(house),
    degree: pos.cusp
  }))

  // Sort cusps by degree
  cuspDegrees.sort((a, b) => a.degree - b.degree)

  // Find the house that contains the degree
  for (let i = 0; i < cuspDegrees.length; i++) {
    const nextIndex = (i + 1) % cuspDegrees.length
    const start = cuspDegrees[i].degree
    const end = cuspDegrees[nextIndex].degree

    if (end < start) { // Crosses 0°
      if (degree >= start || degree < end) {
        return cuspDegrees[i].house
      }
    } else {
      if (degree >= start && degree < end) {
        return cuspDegrees[i].house
      }
    }
  }

  return 1 // Default to first house if not found
}

/**
 * Get houses occupied by planets
 */
export function getOccupiedHouses(
  planetPositions: Record<string, number>,
  cusps: Record<number, HousePosition>
): Record<number, string[]> {
  const occupied: Record<number, string[]> = {}

  Object.entries(planetPositions).forEach(([planet, degree]) => {
    const house = getHousePosition(degree, cusps)
    if (!occupied[house]) {
      occupied[house] = []
    }
    occupied[house].push(planet)
  })

  return occupied
}

/**
 * Check if a house is angular (1, 4, 7, 10)
 */
export function isAngularHouse(house: number): boolean {
  return [1, 4, 7, 10].includes(house)
}

/**
 * Check if a house is succedent (2, 5, 8, 11)
 */
export function isSuccedentHouse(house: number): boolean {
  return [2, 5, 8, 11].includes(house)
}

/**
 * Check if a house is cadent (3, 6, 9, 12)
 */
export function isCadentHouse(house: number): boolean {
  return [3, 6, 9, 12].includes(house)
}

/**
 * Get the natural ruling sign of a house
 */
export function getNaturalHouseSign(house: number): string {
  const signs = [
    "Aries", "Taurus", "Gemini", "Cancer",
    "Leo", "Virgo", "Libra", "Scorpio",
    "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ]
  return signs[(house - 1) % 12]
}

/**
 * Get the natural ruling planet of a house
 */
export function getNaturalHouseRuler(house: number): string {
  const rulers = {
    1: "Mars",
    2: "Venus",
    3: "Mercury",
    4: "Moon",
    5: "Sun",
    6: "Mercury",
    7: "Venus",
    8: "Mars",
    9: "Jupiter",
    10: "Saturn",
    11: "Saturn",
    12: "Jupiter"
  }
  return rulers[house as keyof typeof rulers] || "Unknown"
}

/**
 * Get the element of a house
 */
export function getHouseElement(house: number): string {
  const elements = ["Fire", "Earth", "Air", "Water"]
  return elements[(house - 1) % 4]
}

/**
 * Get the quality/modality of a house
 */
export function getHouseQuality(house: number): string {
  if (isAngularHouse(house)) return "Cardinal"
  if (isSuccedentHouse(house)) return "Fixed"
  return "Mutable"
}
