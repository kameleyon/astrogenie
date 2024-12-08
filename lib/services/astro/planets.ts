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
 * Calculate planet positions
 * Direct port of Python's calculate_planet_positions function
 */
export function calculatePlanetPositions(jd: number): Record<PlanetName, PlanetPos> {
  // Since we don't have Swiss Ephemeris, we'll calculate approximate positions
  // This is a temporary implementation until we can properly integrate Swiss Ephemeris
  const positions: Record<PlanetName, PlanetPos> = {} as Record<PlanetName, PlanetPos>

  // Calculate mean orbital elements at J2000.0
  const T = (jd - 2451545.0) / 36525.0 // Julian centuries since J2000.0

  // Sun's mean longitude
  let L = 280.46646 + 36000.76983 * T + 0.0003032 * T * T
  L = ((L % 360) + 360) % 360

  // Sun's mean anomaly
  let M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T
  M = ((M % 360) + 360) % 360

  // Sun's equation of center
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * Math.PI / 180)
            + (0.019993 - 0.000101 * T) * Math.sin(2 * M * Math.PI / 180)
            + 0.000289 * Math.sin(3 * M * Math.PI / 180)

  // Sun's true longitude
  const sunLong = L + C
  positions.Sun = {
    longitude: sunLong,
    latitude: 0,
    distance: 1.0,
    longitudeSpeed: 0.9856473 * (1 + 0.0334 * Math.cos(M * Math.PI / 180)),
    sign: getZodiacSign(sunLong),
    retrograde: false
  }

  // Moon's mean elements
  const Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T
  const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T
  const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T
  const F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T * T

  // Moon's position
  const moonLong = Lp + 6.288 * Math.sin(Mp * Math.PI / 180)
                     + 1.274 * Math.sin((2 * D - Mp) * Math.PI / 180)
                     + 0.658 * Math.sin(2 * D * Math.PI / 180)
  positions.Moon = {
    longitude: ((moonLong % 360) + 360) % 360,
    latitude: 5.128 * Math.sin(F * Math.PI / 180),
    distance: 385000.56,
    longitudeSpeed: 13.1763581,
    sign: getZodiacSign(moonLong),
    retrograde: false
  }

  // Approximate other planets
  type OtherPlanet = Exclude<PlanetName, 'Sun' | 'Moon'>
  const meanDailyMotions: Record<OtherPlanet, number> = {
    Mercury: 4.09233445,
    Venus: 1.60213034,
    Mars: 0.52402068,
    Jupiter: 0.08308529,
    Saturn: 0.03337848,
    Uranus: 0.01176904,
    Neptune: 0.00601902,
    Pluto: 0.00396286
  }

  Object.entries(meanDailyMotions).forEach(([planet, motion]) => {
    const angle = (motion * (jd - 2451545.0)) % 360
    positions[planet as OtherPlanet] = {
      longitude: ((angle % 360) + 360) % 360,
      latitude: 0,
      distance: 1.0,
      longitudeSpeed: motion,
      sign: getZodiacSign(angle),
      retrograde: false
    }
  })

  return positions
}

/**
 * Calculate aspects between planets
 * Direct port of Python's calculate_aspects function
 */
export function calculateAspects(planetPositions: Record<PlanetName, PlanetPos>) {
  const aspects = []
  const aspectTypes: Record<number, [string, number]> = {
    0: ["Conjunction", 10],
    60: ["Sextile", 6],
    90: ["Square", 10],
    120: ["Trine", 10],
    180: ["Opposition", 10]
  }

  const planets = Object.keys(planetPositions) as PlanetName[]
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planet1 = planets[i]
      const planet2 = planets[j]
      let angle = Math.abs(planetPositions[planet1].longitude - planetPositions[planet2].longitude)
      angle = Math.min(angle, 360 - angle) // Consider the shorter arc

      for (const [aspectAngleStr, [aspectName, orb]] of Object.entries(aspectTypes)) {
        const aspectAngle = Number(aspectAngleStr)
        if (Math.abs(angle - aspectAngle) <= orb) {
          aspects.push({
            planet1,
            planet2,
            aspect: aspectName,
            angle: Number(angle.toFixed(2)),
            orb: Number(Math.abs(angle - aspectAngle).toFixed(2))
          })
          break
        }
      }
    }
  }

  return aspects
}
