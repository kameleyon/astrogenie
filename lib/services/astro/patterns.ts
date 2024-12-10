import { BirthChartData, PatternData, PlanetPosition } from '@/lib/types/birth-chart'
import { isInAspect } from './aspects'

interface SpecialFeature {
  description: string
  category: 'moon' | 'planets' | 'chart' | 'aspects'
}

/**
 * Detect Splay patterns (planets spread out evenly)
 */
function detectSplay(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  
  // Sort planets by longitude
  const sortedPlanets = [...planets].sort((a, b) => a.longitude - b.longitude)
  
  // Calculate gaps between consecutive planets
  const gaps: number[] = []
  for (let i = 0; i < sortedPlanets.length; i++) {
    const current = sortedPlanets[i].longitude
    const next = sortedPlanets[(i + 1) % sortedPlanets.length].longitude
    const gap = next > current ? next - current : (360 - current) + next
    gaps.push(gap)
  }
  
  // Calculate mean and standard deviation of gaps
  const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length
  const stdDev = Math.sqrt(gaps.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / gaps.length)
  
  // If standard deviation is low (gaps are relatively even) and planets span most of the chart
  if (stdDev < 20 && gaps.length >= 5) {
    patterns.push({
      name: 'Splay',
      planets: sortedPlanets.map(p => p.name),
      description: 'Planets spread evenly around the chart'
    })
  }
  
  return patterns
}

/**
 * Detect Bucket patterns (planets in one area with one planet opposite)
 */
function detectBucket(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  
  // Sort planets by longitude
  const sortedPlanets = [...planets].sort((a, b) => a.longitude - b.longitude)
  
  // Find the largest gap between consecutive planets
  let maxGap = 0
  let gapStartIndex = 0
  
  for (let i = 0; i < sortedPlanets.length; i++) {
    const current = sortedPlanets[i].longitude
    const next = sortedPlanets[(i + 1) % sortedPlanets.length].longitude
    const gap = next > current ? next - current : (360 - current) + next
    
    if (gap > maxGap) {
      maxGap = gap
      gapStartIndex = i
    }
  }
  
  // If the largest gap is around 180 degrees
  if (maxGap >= 150) {
    const handle = sortedPlanets[gapStartIndex]
    const bowl = sortedPlanets.filter(p => p !== handle)
    
    // Check if remaining planets are within 180 degrees
    const bowlSpread = Math.abs(bowl[bowl.length - 1].longitude - bowl[0].longitude)
    if (bowlSpread <= 180) {
      patterns.push({
        name: 'Bucket',
        planets: [handle.name, ...bowl.map(p => p.name)],
        description: `A concentration of planets with ${handle.name} as the handle`
      })
    }
  }
  
  return patterns
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

          // Check for square aspects between all planets forming a cross
          if (
            isInAspect(p1.longitude, p2.longitude, 90, 8) &&
            isInAspect(p2.longitude, p3.longitude, 90, 8) &&
            isInAspect(p3.longitude, p4.longitude, 90, 8) &&
            isInAspect(p4.longitude, p1.longitude, 90, 8) &&
            isInAspect(p1.longitude, p3.longitude, 180, 8) && // Opposition across the cross
            isInAspect(p2.longitude, p4.longitude, 180, 8)    // Opposition across the cross
          ) {
            patterns.push({
              name: 'Grand Cross',
              planets: [p1.name, p2.name, p3.name, p4.name],
              description: 'A powerful configuration of four planets forming a cross of squares and oppositions'
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
 * Detect Rectangle patterns (two pairs of planets in opposition, connected by sextiles)
 */
function detectRectangles(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []

  for (let i = 0; i < planets.length - 3; i++) {
    for (let j = i + 1; j < planets.length - 2; j++) {
      for (let k = j + 1; k < planets.length - 1; k++) {
        for (let l = k + 1; l < planets.length; l++) {
          const p1 = planets[i]
          const p2 = planets[j]
          const p3 = planets[k]
          const p4 = planets[l]

          // Check for oppositions and sextiles/trines
          if (
            // First opposition
            isInAspect(p1.longitude, p2.longitude, 180, 8) &&
            // Second opposition
            isInAspect(p3.longitude, p4.longitude, 180, 8) &&
            // Sextiles or trines connecting the oppositions
            ((isInAspect(p1.longitude, p3.longitude, 60, 6) && isInAspect(p2.longitude, p4.longitude, 60, 6)) ||
             (isInAspect(p1.longitude, p3.longitude, 120, 8) && isInAspect(p2.longitude, p4.longitude, 120, 8)))
          ) {
            patterns.push({
              name: 'Rectangle',
              planets: [p1.name, p2.name, p3.name, p4.name],
              description: 'A balanced configuration of oppositions connected by harmonious aspects'
            })
          }
        }
      }
    }
  }

  return patterns
}

/**
 * Detect Castle patterns (grand trine with additional aspects)
 */
function detectCastles(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []

  // First find grand trines
  const grandTrines = detectGrandTrines(planets)

  for (const trine of grandTrines) {
    // For each grand trine, look for additional planets making aspects
    const trinePlanets = trine.planets.map(name => planets.find(p => p.name === name)!)
    
    for (const planet of planets) {
      if (!trine.planets.includes(planet.name)) {
        // Check if this planet makes aspects to at least two planets in the grand trine
        let aspectCount = 0
        for (const trinePlanet of trinePlanets) {
          if (isInAspect(planet.longitude, trinePlanet.longitude, 60, 6) ||  // Sextile
              isInAspect(planet.longitude, trinePlanet.longitude, 90, 8) ||  // Square
              isInAspect(planet.longitude, trinePlanet.longitude, 120, 8)) { // Trine
            aspectCount++
          }
        }
        
        if (aspectCount >= 2) {
          patterns.push({
            name: 'Castle',
            planets: [...trine.planets, planet.name],
            description: 'A grand trine with additional harmonious aspects'
          })
        }
      }
    }
  }

  return patterns
}

/**
 * Detect Cradle patterns (4+ planets forming a bowl with sextiles and trines)
 */
function detectCradles(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []

  // Sort planets by longitude
  const sortedPlanets = [...planets].sort((a, b) => a.longitude - b.longitude)
  
  // Look for groups of 4+ planets spanning less than 180 degrees
  for (let i = 0; i < planets.length - 3; i++) {
    for (let j = i + 3; j < planets.length; j++) {
      const group = sortedPlanets.slice(i, j + 1)
      const span = Math.abs(group[group.length - 1].longitude - group[0].longitude)
      
      if (span <= 180) {
        // Check for harmonious aspects (sextiles and trines) between consecutive planets
        let hasHarmoniousChain = true
        for (let k = 0; k < group.length - 1; k++) {
          const isHarmonious = 
            isInAspect(group[k].longitude, group[k + 1].longitude, 60, 6) || // Sextile
            isInAspect(group[k].longitude, group[k + 1].longitude, 120, 8)   // Trine
          
          if (!isHarmonious) {
            hasHarmoniousChain = false
            break
          }
        }
        
        if (hasHarmoniousChain) {
          patterns.push({
            name: 'Cradle',
            planets: group.map(p => p.name),
            description: 'A harmonious chain of planets forming a cradle shape'
          })
        }
      }
    }
  }

  return patterns
}

/**
 * Detect Easy Opposition patterns (planets in opposition with harmonious aspects)
 */
function detectEasyOpposition(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []

  for (let i = 0; i < planets.length - 1; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i]
      const p2 = planets[j]

      // Check for opposition
      if (isInAspect(p1.longitude, p2.longitude, 180, 8)) {
        // Look for planets making harmonious aspects (trine/sextile) to both opposed planets
        const harmonicPlanets = planets.filter(p3 => {
          if (p3 === p1 || p3 === p2) return false
          
          const hasHarmonicAspectToP1 = 
            isInAspect(p3.longitude, p1.longitude, 60, 6) ||  // Sextile
            isInAspect(p3.longitude, p1.longitude, 120, 8)    // Trine
          
          const hasHarmonicAspectToP2 = 
            isInAspect(p3.longitude, p2.longitude, 60, 6) ||  // Sextile
            isInAspect(p3.longitude, p2.longitude, 120, 8)    // Trine
          
          return hasHarmonicAspectToP1 && hasHarmonicAspectToP2
        })

        if (harmonicPlanets.length > 0) {
          patterns.push({
            name: 'Easy Opposition',
            planets: [p1.name, p2.name, ...harmonicPlanets.map(p => p.name)],
            description: 'An opposition softened by harmonious aspects'
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
 * Detect Bundle patterns (planets grouped together)
 */
function detectBundle(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  
  // Sort planets by longitude
  const sortedPlanets = [...planets].sort((a, b) => a.longitude - b.longitude)
  
  // Calculate total spread
  const spread = Math.abs(sortedPlanets[sortedPlanets.length - 1].longitude - sortedPlanets[0].longitude)
  
  // If all planets are within 120 degrees
  if (spread <= 120) {
    patterns.push({
      name: 'Bundle',
      planets: sortedPlanets.map(p => p.name),
      description: 'All planets concentrated within a third of the chart'
    })
  }
  
  return patterns
}

/**
 * Detect Splash patterns (planets spread throughout chart)
 */
function detectSplash(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  
  // Divide the chart into 12 houses of 30 degrees each
  const houses = Array(12).fill(0)
  
  // Count planets in each house
  planets.forEach(planet => {
    const house = Math.floor(planet.longitude / 30)
    houses[house]++
  })
  
  // Count occupied houses
  const occupiedHouses = houses.filter(count => count > 0).length
  
  // If planets occupy 10 or more houses
  if (occupiedHouses >= 10) {
    patterns.push({
      name: 'Splash',
      planets: planets.map(p => p.name),
      description: 'Planets widely distributed throughout the chart'
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
  // Helper function to check if a pattern is unique
  function isUniquePattern(newPattern: PatternData, existingPatterns: PatternData[]): boolean {
    return !existingPatterns.some(existing => {
      // If same pattern type, check if planets are mostly the same
      if (existing.name === newPattern.name) {
        const commonPlanets = existing.planets.filter(p => newPattern.planets.includes(p))
        return commonPlanets.length >= Math.min(existing.planets.length, newPattern.planets.length) - 1
      }
      return false
    })
  }

  // Detect all patterns
  let allPatterns: PatternData[] = []
  
  // Detect each type of pattern and only add if unique
  const addUniquePatterns = (newPatterns: PatternData[]) => {
    newPatterns.forEach(pattern => {
      if (isUniquePattern(pattern, allPatterns)) {
        allPatterns.push(pattern)
      }
    })
  }

  // Detect patterns in order of priority
  addUniquePatterns(detectGrandCross(data.planets))
  addUniquePatterns(detectTSquares(data.planets))
  addUniquePatterns(detectGrandTrines(data.planets))
  addUniquePatterns(detectRectangles(data.planets))
  addUniquePatterns(detectCastles(data.planets))
  addUniquePatterns(detectCradles(data.planets))
  addUniquePatterns(detectEasyOpposition(data.planets))
  addUniquePatterns(detectYods(data.planets))
  addUniquePatterns(detectBundle(data.planets))
  addUniquePatterns(detectSplay(data.planets))
  addUniquePatterns(detectBucket(data.planets))
  addUniquePatterns(detectSplash(data.planets))

  // Sort patterns by type and size
  allPatterns.sort((a, b) => {
    // First sort by pattern type priority
    const patternPriority = {
      'Grand Cross': 1,
      'T-Square': 2,
      'Grand Trine': 3,
      'Rectangle': 4,
      'Castle': 5,
      'Cradle': 6,
      'Easy Opposition': 7,
      'Yod': 8,
      'Bundle': 9,
      'Splay': 10,
      'Bucket': 11,
      'Splash': 12
    }
    const priorityDiff = (patternPriority[a.name as keyof typeof patternPriority] || 99) -
                        (patternPriority[b.name as keyof typeof patternPriority] || 99)
    if (priorityDiff !== 0) return priorityDiff

    // Then sort by number of planets involved (more planets first)
    return b.planets.length - a.planets.length
  })

  // Detect special features
  const features = detectSpecialFeatures(data)

  return { patterns: allPatterns, features }
}
