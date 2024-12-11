import { PlanetPosition, PatternData } from '../../../types/birth-chart'
import { isSextile, isTrine, toPlanetData, getDistance } from './utils'

/**
 * Detect Cradle pattern
 * Requirements:
 * 1. Four planets connected by alternating sextiles (60°, orb 7°) and trines (120°, orb 9°)
 * 2. Forms a harmonious chain or "cradle" shape
 * 3. Planets must be in proper sequence to form the cradle
 * Using standard orbs from utils.ts:
 * - Sextile: 7° orb
 * - Trine: 9° orb
 */
export function detectCradle(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  console.debug('Checking for Cradle patterns...')

  for (let i = 0; i < planets.length - 3; i++) {
    for (let j = i + 1; j < planets.length - 2; j++) {
      for (let k = j + 1; k < planets.length - 1; k++) {
        for (let l = k + 1; l < planets.length; l++) {
          const [p1, p2, p3, p4] = [planets[i], planets[j], planets[k], planets[l]]

          // Check all possible configurations
          const configs = [
            // First configuration: Sextile-Trine-Sextile-Trine
            {
              valid: isSextile(p1, p2) && isTrine(p2, p3) &&
                     isSextile(p3, p4) && isTrine(p4, p1),
              sequence: [p1, p2, p3, p4],
              aspects: ['sextile', 'trine', 'sextile', 'trine']
            },
            // Alternative configuration: Trine-Sextile-Trine-Sextile
            {
              valid: isTrine(p1, p2) && isSextile(p2, p3) &&
                     isTrine(p3, p4) && isSextile(p4, p1),
              sequence: [p1, p2, p3, p4],
              aspects: ['trine', 'sextile', 'trine', 'sextile']
            }
          ]

          for (const config of configs) {
            if (config.valid) {
              // Calculate all aspect orbs
              const orbs = config.sequence.map((p, i) => {
                const nextP = config.sequence[(i + 1) % 4]
                const dist = getDistance(p.longitude, nextP.longitude)
                const targetAngle = config.aspects[i] === 'sextile' ? 60 : 120
                return Math.abs(targetAngle - dist)
              })

              // Log detailed pattern information
              console.debug(`Cradle pattern found:`)
              console.debug(`Points in sequence:`)
              config.sequence.forEach((p, i) => {
                console.debug(`- ${p.name} at ${p.formatted} ${p.sign}`)
                console.debug(`  ${config.aspects[i]} to ${config.sequence[(i + 1) % 4].name} (orb: ${orbs[i].toFixed(2)}°)`)
              })

              const patternPlanets = config.sequence.map(p => ({
                ...toPlanetData(p),
                position: `${p.formatted} ${p.sign}`
              }))

              patterns.push({
                name: 'Cradle',
                planets: patternPlanets,
                description: `Harmonious chain between ${config.sequence.map(p => p.name).join(', ')}, connected by alternating ${config.aspects.map((a, i) => `${a} (orb: ${orbs[i].toFixed(1)}°)`).join(' and ')}`
              })
            }
          }
        }
      }
    }
  }

  return patterns
}

/**
 * Check if a Cradle is exact
 * Returns true if:
 * - All sextiles are within 3° orb
 * - All trines are within 4° orb
 * These are tighter orbs for "exact" patterns
 */
export function isExactCradle(pattern: PatternData): boolean {
  const EXACT_SEXTILE_ORB = 3
  const EXACT_TRINE_ORB = 4
  const planets = pattern.planets

  // Check each aspect in the chain
  for (let i = 0; i < 4; i++) {
    const p1 = planets[i]
    const p2 = planets[(i + 1) % 4]
    const dist = getDistance(p1.longitude, p2.longitude)
    
    // Alternate between sextile and trine checks
    const targetAngle = i % 2 === 0 ? 60 : 120
    const maxOrb = i % 2 === 0 ? EXACT_SEXTILE_ORB : EXACT_TRINE_ORB
    const orb = Math.abs(targetAngle - dist)
    
    if (orb > maxOrb) return false
  }

  return true
}

/**
 * Get the element distribution in a Cradle
 * Returns an object with counts for each element
 */
export function getCradleElements(pattern: PatternData): Record<string, number> {
  const elements = {
    'Fire': ['Aries', 'Leo', 'Sagittarius'],
    'Earth': ['Taurus', 'Virgo', 'Capricorn'],
    'Air': ['Gemini', 'Libra', 'Aquarius'],
    'Water': ['Cancer', 'Scorpio', 'Pisces']
  }

  const distribution: Record<string, number> = {
    'Fire': 0,
    'Earth': 0,
    'Air': 0,
    'Water': 0
  }

  pattern.planets.forEach(planet => {
    for (const [element, signs] of Object.entries(elements)) {
      if (signs.includes(planet.sign)) {
        distribution[element]++
        break
      }
    }
  })

  return distribution
}
