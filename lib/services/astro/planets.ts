const swe = require('swisseph-v2')
import { PlanetPosition as PlanetPos } from './types'
import { PlanetName, ZodiacSign } from '@/lib/types/birth-chart'

// Zodiac signs
const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer",
  "Leo", "Virgo", "Libra", "Scorpio",
  "Sagittarius", "Capricorn", "Aquarius", "Pisces"
] as const

/**
 * Get zodiac sign based on longitude
 * Direct port of Python's get_zodiac_sign function
 */
export function getZodiacSign(longitude: number): ZodiacSign {
  // Normalize longitude to 0-360 range
  const normalizedLongitude = ((longitude % 360) + 360) % 360
  const signIndex = Math.floor(normalizedLongitude / 30)
  return ZODIAC_SIGNS[signIndex]
}

/**
 * Calculate ascendant
 * Direct port of Python's calculate_ascendant function
 */
export function calculateAscendant(jd: number, lat: number, lon: number): Promise<ZodiacSign> {
  return new Promise((resolve, reject) => {
    swe.swe_houses(jd, lat, lon, 'P', (result: any) => {
      if ('error' in result) {
        console.error(`Error calculating ascendant: ${result.error}`)
        reject(new Error(`Failed to calculate ascendant: ${result.error}`))
        return
      }

      const ascendant = result.ascendant
      console.debug(`Ascendant: ${ascendant}`)
      resolve(getZodiacSign(ascendant))
    })
  })
}

// Initialize Swiss Ephemeris with ephemeris files path
try {
  swe.swe_set_ephe_path(process.cwd() + '/ephe')
} catch (error) {
  console.warn('Could not set ephemeris files path:', error)
}

export { calculatePlanetPositions, calculateAspects } from './planets.js'
