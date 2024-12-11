import { PlanetPosition, PlanetName } from '../../types/birth-chart'
import { normalizeAngle, getDistance } from './patterns/utils'

interface Aspect {
  planet1: string
  planet2: string
  aspect: string
  angle: number
  orb: number
  nature: 'harmonious' | 'challenging' | 'neutral'
  motion?: 'applying' | 'separating'
}

// Standard aspect configurations based on Swiss Ephemeris approach
const aspectTypes: Record<number, [string, number, 'harmonious' | 'challenging' | 'neutral']> = {
  0: ["Conjunction", 12, "neutral"],
  60: ["Sextile", 7, "harmonious"],
  90: ["Square", 9, "challenging"],
  120: ["Trine", 9, "harmonious"],
  150: ["Quincunx", 3, "challenging"],
  180: ["Opposition", 10, "challenging"]
}

/**
 * Validate planet position data
 */
function validatePlanetPosition(planet: string, position: PlanetPosition): void {
  if (!position) {
    throw new Error(`Missing position data for planet: ${planet}`)
  }
  if (typeof position.longitude !== 'number' || isNaN(position.longitude)) {
    throw new Error(`Invalid longitude value for planet: ${planet}`)
  }
}

/**
 * Calculate aspects between planets using Swiss Ephemeris principles
 */
export function calculateAspects(planetPositions: Record<PlanetName, PlanetPosition>): Aspect[] {
  // Validate input
  if (!planetPositions || typeof planetPositions !== 'object') {
    throw new Error('Invalid planet positions data')
  }

  const aspects: Aspect[] = []
  const planets = Object.keys(planetPositions) as PlanetName[]

  // Validate all planet positions before calculation
  planets.forEach(planet => {
    validatePlanetPosition(planet, planetPositions[planet])
  })

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planet1 = planets[i]
      const planet2 = planets[j]
      const pos1 = planetPositions[planet1]
      const pos2 = planetPositions[planet2]

      try {
        // Calculate precise angular separation
        const angle = getDistance(pos1.longitude, pos2.longitude)

        // Check each aspect type
        for (const [aspectAngleStr, [aspectName, orb, nature]] of Object.entries(aspectTypes)) {
          const aspectAngle = Number(aspectAngleStr)
          const currentOrb = Math.abs(angle - aspectAngle)

          if (currentOrb <= orb) {
            // Calculate aspect motion if speed data is available
            let motion: 'applying' | 'separating' | undefined
            if ('longitudeSpeed' in pos1 && 'longitudeSpeed' in pos2 &&
                typeof pos1.longitudeSpeed === 'number' && typeof pos2.longitudeSpeed === 'number') {
              motion = getAspectMotion(
                pos1.longitude,
                pos2.longitude,
                pos1.longitudeSpeed,
                pos2.longitudeSpeed,
                aspectAngle
              )
            }

            aspects.push({
              planet1,
              planet2,
              aspect: aspectName,
              angle: Number(angle.toFixed(2)),
              orb: Number(currentOrb.toFixed(2)),
              nature,
              ...(motion && { motion })
            })
            break // Only one aspect type per planet pair
          }
        }
      } catch (err) {
        const error = err as Error
        console.warn(`Error calculating aspect between ${planet1} and ${planet2}: ${error.message}`)
        // Continue with other aspects
      }
    }
  }

  return aspects
}

/**
 * Check if two planets are in a specific aspect
 * Using Swiss Ephemeris precision standards
 */
export function isInAspect(
  planet1Long: number,
  planet2Long: number,
  aspectAngle: number,
  orb: number = aspectTypes[aspectAngle]?.[1] || 10
): boolean {
  if (typeof planet1Long !== 'number' || isNaN(planet1Long) ||
      typeof planet2Long !== 'number' || isNaN(planet2Long)) {
    return false
  }

  const angle = getDistance(planet1Long, planet2Long)
  return Math.abs(angle - aspectAngle) <= orb
}

/**
 * Get the nature of an aspect
 */
export function getAspectNature(aspectAngle: number): 'harmonious' | 'challenging' | 'neutral' {
  return aspectTypes[aspectAngle]?.[2] || 'neutral'
}

/**
 * Calculate the exact orb between two planets for a given aspect
 * Using Swiss Ephemeris precision
 */
export function calculateOrb(
  planet1Long: number,
  planet2Long: number,
  aspectAngle: number
): number {
  if (typeof planet1Long !== 'number' || isNaN(planet1Long) ||
      typeof planet2Long !== 'number' || isNaN(planet2Long)) {
    throw new Error('Invalid longitude values for orb calculation')
  }

  const angle = getDistance(planet1Long, planet2Long)
  return Math.abs(angle - aspectAngle)
}

/**
 * Check if a planet is applying to or separating from an aspect
 * Using Swiss Ephemeris motion calculations
 */
export function getAspectMotion(
  planet1Long: number,
  planet2Long: number,
  planet1Speed: number,
  planet2Speed: number,
  aspectAngle: number
): 'applying' | 'separating' | undefined {
  if (typeof planet1Long !== 'number' || isNaN(planet1Long) ||
      typeof planet2Long !== 'number' || isNaN(planet2Long) ||
      typeof planet1Speed !== 'number' || isNaN(planet1Speed) ||
      typeof planet2Speed !== 'number' || isNaN(planet2Speed)) {
    return undefined
  }

  // If planets aren't in aspect, return undefined
  if (!isInAspect(planet1Long, planet2Long, aspectAngle)) {
    return undefined
  }

  // Calculate relative motion
  const relativeSpeed = planet1Speed - planet2Speed

  // Calculate current angular separation with proper normalization
  const separation = getDistance(planet1Long, planet2Long)

  // Determine if applying or separating based on relative motion
  if (separation < aspectAngle) {
    return relativeSpeed > 0 ? 'applying' : 'separating'
  } else {
    return relativeSpeed < 0 ? 'applying' : 'separating'
  }
}
