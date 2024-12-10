import { BirthChartData, PatternData, PlanetPosition } from '@/lib/types/birth-chart'
import { isInAspect } from './aspects'

interface SpecialFeature {
  description: string
  category: 'moon' | 'planets' | 'chart' | 'aspects'
}

/**
 * Detect stellium patterns (3 or more planets in the same sign)
 */
function detectStelliums(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const planetsBySign: Record<string, string[]> = {}
  
  // Group planets by sign
  planets.forEach(planet => {
    if (!planetsBySign[planet.sign]) {
      planetsBySign[planet.sign] = []
    }
    planetsBySign[planet.sign].push(planet.name)
  })

  // Find groups of 3 or more planets
  return Object.entries(planetsBySign)
    .filter(([_, planets]) => planets.length >= 3)
    .map(([sign, planets]) => ({
      name: 'Stellium',
      planets,
      description: `A powerful concentration of planetary energy in ${sign}`
    }))
}

/**
 * Detect T-Square patterns
 */
function detectTSquares(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const tSquares: PatternData[] = []

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      for (let k = j + 1; k < planets.length; k++) {
        const p1 = planets[i]
        const p2 = planets[j]
        const p3 = planets[k]

        // Check for opposition between p1 and p2, and squares to p3
        if (
          isInAspect(p1.longitude, p2.longitude, 180, 8) && // Opposition
          isInAspect(p1.longitude, p3.longitude, 90, 8) &&  // Square
          isInAspect(p2.longitude, p3.longitude, 90, 8)     // Square
        ) {
          tSquares.push({
            name: 'T-Square',
            planets: [p1.name, p2.name, p3.name],
            description: 'A dynamic configuration creating motivation and drive'
          })
        }
      }
    }
  }

  return tSquares
}

/**
 * Detect Yod patterns (two planets in sextile, both quincunx to a third)
 */
function detectYods(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const yods: PatternData[] = []

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      for (let k = j + 1; k < planets.length; k++) {
        const p1 = planets[i]
        const p2 = planets[j]
        const p3 = planets[k]

        // Check for sextile between p1 and p2, and quincunxes to p3
        if (
          isInAspect(p1.longitude, p2.longitude, 60, 6) &&   // Sextile
          isInAspect(p1.longitude, p3.longitude, 150, 6) &&  // Quincunx
          isInAspect(p2.longitude, p3.longitude, 150, 6)     // Quincunx
        ) {
          yods.push({
            name: 'Yod',
            planets: [p1.name, p2.name, p3.name],
            description: 'A special configuration suggesting a spiritual mission or purpose'
          })
        }
      }
    }
  }

  return yods
}

/**
 * Detect special features in the birth chart
 */
function detectSpecialFeatures(data: BirthChartData): SpecialFeature[] {
  const features: SpecialFeature[] = []

  // Moon phase features
  const sun = data.planets.find(p => p.name === 'Sun')
  const moon = data.planets.find(p => p.name === 'Moon')
  if (sun && moon) {
    const moonPhaseAngle = Math.abs(moon.longitude - sun.longitude)
    if (moonPhaseAngle < 10) {
      features.push({
        description: 'The moon was a new moon',
        category: 'moon'
      })
    }
  }

  // Inner planets in fire signs
  const innerPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars']
  const fireInnerPlanets = data.planets
    .filter(p => innerPlanets.includes(p.name) && ['Aries', 'Leo', 'Sagittarius'].includes(p.sign))
  if (fireInnerPlanets.length === 0) {
    features.push({
      description: 'The inner planets do not fall in a Fire sign',
      category: 'planets'
    })
  }

  // Check quadrants
  const bottomRightQuadrant = data.planets.filter(p => {
    return p.longitude >= 270 && p.longitude < 360
  })
  if (bottomRightQuadrant.length === 0) {
    features.push({
      description: 'The bottom right quadrant is empty',
      category: 'chart'
    })
  }

  // Rising planets
  const risingPlanets = data.planets.filter(p => {
    const ascLong = data.ascendant.longitude
    return Math.abs(p.longitude - ascLong) <= 10
  }).map(p => p.name)
  if (risingPlanets.length > 0) {
    features.push({
      description: `${risingPlanets.join(', ')} ${risingPlanets.length === 1 ? 'is' : 'are'} rising`,
      category: 'planets'
    })
  }

  // Count aspects per planet
  const moonAspects = data.aspects.filter(a => 
    a.planet1 === 'Moon' || a.planet2 === 'Moon'
  )
  if (moonAspects.length >= 10) {
    features.push({
      description: `Moon is in ${moonAspects.length} aspects`,
      category: 'aspects'
    })
  }

  // Chart shape
  const bundleSpread = Math.max(...data.planets.map(p => p.longitude)) - 
                      Math.min(...data.planets.map(p => p.longitude))
  if (bundleSpread <= 120) {
    features.push({
      description: 'The chart is a Bundle shape',
      category: 'chart'
    })
  }

  // Dominant mode
  const cardinalSigns = ['Aries', 'Cancer', 'Libra', 'Capricorn']
  const cardinalPlanets = data.planets.filter(p => 
    innerPlanets.includes(p.name) && cardinalSigns.includes(p.sign)
  )
  if (cardinalPlanets.length >= 3) {
    features.push({
      description: 'The Cardinal mode is dominant among the inner planets',
      category: 'planets'
    })
  }

  // Hemisphere analysis
  const leftHemispherePlanets = data.planets.filter(p => {
    const mcLong = data.midheaven.longitude
    const icLong = (mcLong + 180) % 360
    return p.longitude >= icLong && p.longitude < mcLong
  })
  if (leftHemispherePlanets.length > data.planets.length / 2) {
    features.push({
      description: 'Most of the inner planets are located in the left hemisphere, left of the MC-IC axis',
      category: 'chart'
    })
  }

  // Most frequent aspect
  const aspectCounts: Record<string, number> = {}
  data.aspects.forEach(a => {
    aspectCounts[a.aspect] = (aspectCounts[a.aspect] || 0) + 1
  })
  const mostFrequentAspect = Object.entries(aspectCounts)
    .sort(([,a], [,b]) => b - a)[0]
  if (mostFrequentAspect && mostFrequentAspect[1] >= 5) {
    features.push({
      description: `The ${mostFrequentAspect[0]} aspect occurs the most, a total of ${mostFrequentAspect[1]} times`,
      category: 'aspects'
    })
  }

  return features
}

/**
 * Analyze birth chart data to detect patterns and special features
 */
export function analyzeBirthChart(data: BirthChartData): {
  patterns: PatternData[]
  features: SpecialFeature[]
} {
  // Detect all patterns
  const patterns = [
    ...detectStelliums(data.planets),
    ...detectTSquares(data.planets),
    ...detectYods(data.planets)
  ]

  // Detect special features
  const features = detectSpecialFeatures(data)

  return { patterns, features }
}
