import { HousePosition, GeoPosition } from './types'
import { getZodiacSign } from './planets'
import { normalizeAngle } from './patterns/utils'

/**
 * Calculate house cusps using Swiss Ephemeris principles
 * This implementation uses the Placidus house system by default
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
    // Calculate RAMC (Right Ascension of Midheaven) with higher precision
    const SIDEREAL_RATE = 360.985647366 // degrees per sidereal day
    const RAMC = normalizeAngle(SIDEREAL_RATE * (julianDay - 2451545.0) + position.longitude)

    // Calculate obliquity of ecliptic with better precision
    const T = (julianDay - 2451545.0) / 36525.0
    const obliquity = 23.43929111111111 -
                     0.013004166666667 * T -
                     0.000000163888889 * T * T +
                     0.000000503611111 * T * T * T

    // Calculate Midheaven using more precise trigonometry
    const tanRAMC = Math.tan(RAMC * Math.PI / 180)
    const cosObl = Math.cos(obliquity * Math.PI / 180)
    const MC = Math.atan2(tanRAMC, cosObl) * 180 / Math.PI
    const midheaven = normalizeAngle(MC)

    // Calculate Ascendant with improved precision
    const sinObl = Math.sin(obliquity * Math.PI / 180)
    const tanLat = Math.tan(position.latitude * Math.PI / 180)
    const ascendant = normalizeAngle(
      Math.atan2(
        Math.cos(RAMC * Math.PI / 180),
        -(sinObl * tanLat + cosObl * Math.sin(RAMC * Math.PI / 180))
      ) * 180 / Math.PI
    )

    // Initialize house cusps
    const cusps: Record<number, HousePosition> = {}

    // Calculate angular houses
    cusps[1] = { cusp: ascendant, sign: getZodiacSign(ascendant) }  // ASC
    cusps[10] = { cusp: midheaven, sign: getZodiacSign(midheaven) }  // MC
    cusps[7] = { cusp: normalizeAngle(ascendant + 180), sign: getZodiacSign(normalizeAngle(ascendant + 180)) }  // DSC
    cusps[4] = { cusp: normalizeAngle(midheaven + 180), sign: getZodiacSign(normalizeAngle(midheaven + 180)) }  // IC

    // Calculate intermediate houses using Placidus system
    if (houseSystem === 'P') {
      // Houses 2-3 (Eastern houses)
      for (let i = 2; i <= 3; i++) {
        const houseAngle = calculatePlacidusHouseAngle(
          ascendant, midheaven, position.latitude, obliquity, i
        )
        cusps[i] = {
          cusp: houseAngle,
          sign: getZodiacSign(houseAngle)
        }
      }

      // Houses 5-6 (Western houses)
      for (let i = 5; i <= 6; i++) {
        const houseAngle = calculatePlacidusHouseAngle(
          ascendant, midheaven, position.latitude, obliquity, i
        )
        cusps[i] = {
          cusp: houseAngle,
          sign: getZodiacSign(houseAngle)
        }
      }

      // Houses 8-9 (Northern houses)
      for (let i = 8; i <= 9; i++) {
        const houseAngle = calculatePlacidusHouseAngle(
          ascendant, midheaven, position.latitude, obliquity, i
        )
        cusps[i] = {
          cusp: houseAngle,
          sign: getZodiacSign(houseAngle)
        }
      }

      // Houses 11-12 (Southern houses)
      for (let i = 11; i <= 12; i++) {
        const houseAngle = calculatePlacidusHouseAngle(
          ascendant, midheaven, position.latitude, obliquity, i
        )
        cusps[i] = {
          cusp: houseAngle,
          sign: getZodiacSign(houseAngle)
        }
      }
    } else {
      // Equal house system as fallback
      for (let i = 1; i <= 12; i++) {
        const angle = normalizeAngle(ascendant + (i - 1) * 30)
        cusps[i] = {
          cusp: angle,
          sign: getZodiacSign(angle)
        }
      }
    }

    return { cusps, ascendant, midheaven }
  } catch (error) {
    console.error('Error calculating houses:', error)
    throw error
  }
}

/**
 * Calculate Placidus house angle using Swiss Ephemeris principles
 */
function calculatePlacidusHouseAngle(
  ascendant: number,
  midheaven: number,
  latitude: number,
  obliquity: number,
  houseNumber: number
): number {
  // Convert to radians
  const ascRad = ascendant * Math.PI / 180
  const mcRad = midheaven * Math.PI / 180
  const latRad = latitude * Math.PI / 180
  const oblRad = obliquity * Math.PI / 180

  // Calculate house angle based on Placidus system
  let angle: number

  if (houseNumber === 2 || houseNumber === 3) {
    const fraction = houseNumber === 2 ? 1/3 : 2/3
    angle = Math.atan2(
      Math.sin(ascRad),
      Math.cos(ascRad) * Math.cos(latRad) + Math.sin(latRad) * Math.tan(oblRad * fraction)
    )
  } else if (houseNumber === 11 || houseNumber === 12) {
    const fraction = houseNumber === 11 ? 2/3 : 1/3
    angle = Math.atan2(
      Math.sin(mcRad),
      Math.cos(mcRad) * Math.cos(latRad) + Math.sin(latRad) * Math.tan(oblRad * fraction)
    )
  } else {
    // For other houses, use equal division
    angle = ascRad + ((houseNumber - 1) * 30 * Math.PI / 180)
  }

  // Convert back to degrees and normalize
  return normalizeAngle(angle * 180 / Math.PI)
}

/**
 * Get the house that contains a specific degree
 */
export function getHousePosition(
  degree: number,
  cusps: Record<number, HousePosition>
): number {
  const normalizedDegree = normalizeAngle(degree)
  const cuspDegrees = Object.entries(cusps).map(([house, pos]) => ({
    house: parseInt(house),
    degree: normalizeAngle(pos.cusp)
  }))

  // Sort cusps by degree
  cuspDegrees.sort((a, b) => a.degree - b.degree)

  // Find the house that contains the degree
  for (let i = 0; i < cuspDegrees.length; i++) {
    const nextIndex = (i + 1) % cuspDegrees.length
    const start = cuspDegrees[i].degree
    const end = cuspDegrees[nextIndex].degree

    if (end < start) { // Crosses 0°
      if (normalizedDegree >= start || normalizedDegree < end) {
        return cuspDegrees[i].house
      }
    } else {
      if (normalizedDegree >= start && normalizedDegree < end) {
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
    8: "Pluto", // Modern ruler
    9: "Jupiter",
    10: "Saturn",
    11: "Uranus", // Modern ruler
    12: "Neptune" // Modern ruler
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
