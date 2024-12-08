import { HousePosition, GeoPosition } from './types'
import { getZodiacSign } from './planets'

/**
 * Calculate house cusps
 * Direct port of Python's calculate_houses function
 */
export async function calculateHouseCusps(
  julianDay: number,
  position: GeoPosition,
  houseSystem: string = 'P'
): Promise<{
  cusps: Record<number, HousePosition>,
  ascendant: number,
  midheaven: number
}> {
  try {
    // Since we don't have Swiss Ephemeris, we'll calculate approximate positions
    // This is a temporary implementation until we can properly integrate Swiss Ephemeris
    
    // Calculate RAMC (Right Ascension of Midheaven)
    const SIDEREAL_RATE = 360.985647 // degrees per sidereal day
    const RAMC = (SIDEREAL_RATE * (julianDay - 2451545.0) + position.longitude) % 360

    // Calculate obliquity of ecliptic
    const T = (julianDay - 2451545.0) / 36525.0
    const obliquity = 23.43929111 - 0.013004167 * T - 0.000000164 * T * T + 0.000000503 * T * T * T

    // Calculate Midheaven
    const tanRAMC = Math.tan(RAMC * Math.PI / 180)
    const cosObl = Math.cos(obliquity * Math.PI / 180)
    const MC = Math.atan2(tanRAMC, cosObl) * 180 / Math.PI
    const midheaven = ((MC % 360) + 360) % 360

    // Calculate Ascendant
    const sinObl = Math.sin(obliquity * Math.PI / 180)
    const tanLat = Math.tan(position.latitude * Math.PI / 180)
    const ascendant = Math.atan2(
      Math.cos(RAMC * Math.PI / 180),
      -(sinObl * tanLat + cosObl * Math.sin(RAMC * Math.PI / 180))
    ) * 180 / Math.PI
    const normalizedAsc = ((ascendant % 360) + 360) % 360

    // Calculate house cusps using Placidus system
    const cusps: Record<number, HousePosition> = {}
    
    // House 1 (Ascendant)
    cusps[1] = {
      cusp: normalizedAsc,
      sign: getZodiacSign(normalizedAsc)
    }

    // House 10 (Midheaven)
    cusps[10] = {
      cusp: midheaven,
      sign: getZodiacSign(midheaven)
    }

    // House 7 (Descendant)
    const descendant = (normalizedAsc + 180) % 360
    cusps[7] = {
      cusp: descendant,
      sign: getZodiacSign(descendant)
    }

    // House 4 (Imum Coeli)
    const ic = (midheaven + 180) % 360
    cusps[4] = {
      cusp: ic,
      sign: getZodiacSign(ic)
    }

    // Calculate intermediate houses
    // Houses 2-3
    for (let i = 2; i <= 3; i++) {
      const angle = normalizedAsc + (i - 1) * 30
      cusps[i] = {
        cusp: angle % 360,
        sign: getZodiacSign(angle)
      }
    }

    // Houses 5-6
    for (let i = 5; i <= 6; i++) {
      const angle = ic + (i - 4) * 30
      cusps[i] = {
        cusp: angle % 360,
        sign: getZodiacSign(angle)
      }
    }

    // Houses 8-9
    for (let i = 8; i <= 9; i++) {
      const angle = descendant + (i - 7) * 30
      cusps[i] = {
        cusp: angle % 360,
        sign: getZodiacSign(angle)
      }
    }

    // Houses 11-12
    for (let i = 11; i <= 12; i++) {
      const angle = midheaven + (i - 10) * 30
      cusps[i] = {
        cusp: angle % 360,
        sign: getZodiacSign(angle)
      }
    }

    return {
      cusps,
      ascendant: normalizedAsc,
      midheaven
    }
  } catch (error) {
    console.error('Error calculating houses:', error)
    throw error
  }
}

/**
 * Get the house that contains a specific degree
 */
export function getHousePosition(
  degree: number,
  cusps: Record<number, HousePosition>
): number {
  // Normalize degree to 0-360 range
  degree = ((degree % 360) + 360) % 360

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
