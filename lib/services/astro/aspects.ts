import { PlanetPosition, PlanetName } from '../../types/birth-chart'

interface Aspect {
  planet1: string
  planet2: string
  aspect: string
  angle: number
  orb: number
}

/**
 * Calculate aspects between planets
 * Direct port of Python's calculate_aspects function
 */
export function calculateAspects(planetPositions: Record<PlanetName, PlanetPosition>): Aspect[] {
  const aspects: Aspect[] = []
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
      
      // Calculate angular separation
      let angle = Math.abs(planetPositions[planet1].longitude - planetPositions[planet2].longitude)
      angle = Math.min(angle, 360 - angle) // Consider the shorter arc

      // Check each aspect type
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
          break // Only one aspect type per planet pair
        }
      }
    }
  }

  return aspects
}

/**
 * Check if two planets are in a specific aspect
 */
export function isInAspect(
  planet1Long: number,
  planet2Long: number,
  aspectAngle: number,
  orb: number = 10
): boolean {
  let angle = Math.abs(planet1Long - planet2Long)
  angle = Math.min(angle, 360 - angle)
  return Math.abs(angle - aspectAngle) <= orb
}

/**
 * Get the nature of an aspect
 */
export function getAspectNature(aspectAngle: number): 'harmonious' | 'challenging' | 'neutral' {
  if (aspectAngle === 0) return 'neutral' // Conjunction
  if (aspectAngle === 60 || aspectAngle === 120) return 'harmonious' // Sextile and Trine
  if (aspectAngle === 90 || aspectAngle === 180) return 'challenging' // Square and Opposition
  return 'neutral'
}

/**
 * Calculate the exact orb between two planets for a given aspect
 */
export function calculateOrb(
  planet1Long: number,
  planet2Long: number,
  aspectAngle: number
): number {
  let angle = Math.abs(planet1Long - planet2Long)
  angle = Math.min(angle, 360 - angle)
  return Math.abs(angle - aspectAngle)
}

/**
 * Check if a planet is applying to or separating from an aspect
 */
export function getAspectMotion(
  planet1Long: number,
  planet2Long: number,
  planet1Speed: number,
  planet2Speed: number,
  aspectAngle: number
): 'applying' | 'separating' | null {
  // If planets aren't in aspect, return null
  if (!isInAspect(planet1Long, planet2Long, aspectAngle)) {
    return null
  }

  // Calculate relative motion
  const relativeSpeed = planet1Speed - planet2Speed

  // Calculate current angular separation
  let separation = planet2Long - planet1Long
  if (separation < 0) separation += 360
  if (separation > 180) separation = 360 - separation

  // Determine if applying or separating
  if (separation < aspectAngle) {
    return relativeSpeed > 0 ? 'applying' : 'separating'
  } else {
    return relativeSpeed < 0 ? 'applying' : 'separating'
  }
}
