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
 * Detect Grand Cross patterns (4 planets in square aspects)
 */
function detectGrandCross(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []

  for (let i = 0; i < planets.length - 3; i++) {
    for (let j = i + 1; j < planets.length - 2; j++) {
      for (let k = j + 1; k < planets.length - 1; k++) {
        for (let l = k + 1; l < planets.length; l++) {
          const p1 = planets[i]
          const p2 = planets[j]
          const p3 = planets[k]
          const p4 = planets[l]

          // Check for square aspects between all planets
          if (
            isInAspect(p1.longitude, p2.longitude, 90, 8) &&
            isInAspect(p2.longitude, p3.longitude, 90, 8) &&
            isInAspect(p3.longitude, p4.longitude, 90, 8) &&
            isInAspect(p4.longitude, p1.longitude, 90, 8)
          ) {
            patterns.push({
              name: 'Grand Cross',
              planets: [p1.name, p2.name, p3.name, p4.name],
              description: 'A powerful pattern of four planets forming a cross of squares'
            })
          }
        }
      }
    }
  }

  return patterns
}

/**
 * Detect T-Square patterns
 */
function detectTSquares(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []

  for (let i = 0; i < planets.length - 2; i++) {
    for (let j = i + 1; j < planets.length - 1; j++) {
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
          patterns.push({
            name: 'T-Square',
            planets: [p1.name, p2.name, p3.name],
            description: 'A dynamic configuration creating motivation and drive'
          })
        }
      }
    }
  }

  return patterns
}

/**
 * Detect Grand Trine patterns (3 planets in trine aspects)
 */
function detectGrandTrines(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []

  for (let i = 0; i < planets.length - 2; i++) {
    for (let j = i + 1; j < planets.length - 1; j++) {
      for (let k = j + 1; k < planets.length; k++) {
        const p1 = planets[i]
        const p2 = planets[j]
        const p3 = planets[k]

        // Check for trine aspects between all planets
        if (
          isInAspect(p1.longitude, p2.longitude, 120, 8) &&
          isInAspect(p2.longitude, p3.longitude, 120, 8) &&
          isInAspect(p3.longitude, p1.longitude, 120, 8)
        ) {
          patterns.push({
            name: 'Grand Trine',
            planets: [p1.name, p2.name, p3.name],
            description: 'A harmonious triangle of flowing energy'
          })
        }
      }
    }
  }

  return patterns
}

/**
 * Detect Yod patterns (two planets in sextile, both quincunx to a third)
 */
function detectYods(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []

  for (let i = 0; i < planets.length - 2; i++) {
    for (let j = i + 1; j < planets.length - 1; j++) {
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
          patterns.push({
            name: 'Yod',
            planets: [p1.name, p2.name, p3.name],
            description: 'A special configuration suggesting a spiritual mission or purpose'
          })
        }
      }
    }
  }

  return patterns
}

/**
 * Detect Bucket pattern (planets in one area with one planet opposite)
 */
function detectBucket(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  
  // Sort planets by longitude
  const sortedPlanets = [...planets].sort((a, b) => a.longitude - b.longitude)
  
  // Find the largest gap between consecutive planets
  let maxGap = 0
  let gapStart = 0
  
  for (let i = 0; i < sortedPlanets.length; i++) {
    const current = sortedPlanets[i].longitude
    const next = sortedPlanets[(i + 1) % sortedPlanets.length].longitude
    const gap = next > current ? next - current : (360 - current) + next
    
    if (gap > maxGap) {
      maxGap = gap
      gapStart = i
    }
  }
  
  // If the largest gap is around 180 degrees and one planet is isolated
  if (maxGap >= 150) {
    const handle = sortedPlanets[gapStart]
    const bowl = sortedPlanets.filter(p => p !== handle)
    
    patterns.push({
      name: 'Bucket',
      planets: [handle.name, ...bowl.map(p => p.name)],
      description: `A concentration of planets with ${handle.name} as the handle`
    })
  }
  
  return patterns
}

/**
 * Detect Seesaw pattern (planets split into two groups)
 */
function detectSeesaw(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  
  // Sort planets by longitude
  const sortedPlanets = [...planets].sort((a, b) => a.longitude - b.longitude)
  
  // Find two largest gaps
  let gaps: { start: number, size: number }[] = []
  
  for (let i = 0; i < sortedPlanets.length; i++) {
    const current = sortedPlanets[i].longitude
    const next = sortedPlanets[(i + 1) % sortedPlanets.length].longitude
    const gap = next > current ? next - current : (360 - current) + next
    
    gaps.push({ start: i, size: gap })
  }
  
  gaps.sort((a, b) => b.size - a.size)
  
  // If we have two large gaps roughly opposite each other
  if (gaps[0].size >= 60 && gaps[1].size >= 60) {
    const group1: string[] = []
    const group2: string[] = []
    let inGroup1 = true
    
    for (let i = 0; i < sortedPlanets.length; i++) {
      if (i === gaps[0].start || i === gaps[1].start) {
        inGroup1 = !inGroup1
      }
      
      if (inGroup1) {
        group1.push(sortedPlanets[i].name)
      } else {
        group2.push(sortedPlanets[i].name)
      }
    }
    
    patterns.push({
      name: 'Seesaw',
      planets: [...group1, ...group2],
      description: 'Planets divided into two distinct groups'
    })
  }
  
  return patterns
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
    ...detectGrandCross(data.planets),
    ...detectTSquares(data.planets),
    ...detectGrandTrines(data.planets),
    ...detectYods(data.planets),
    ...detectBucket(data.planets),
    ...detectSeesaw(data.planets)
  ]

  // Detect special features
  const features = detectSpecialFeatures(data)

  return { patterns, features }
}
