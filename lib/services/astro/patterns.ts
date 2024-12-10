import { BirthChartData, PatternData, PlanetPosition } from '@/lib/types/birth-chart'

interface SpecialFeature {
  description: string
  category: 'moon' | 'planets' | 'chart' | 'aspects'
}

/**
 * Calculate the angular distance between two points on the ecliptic
 */
function getDistance(pos1: number, pos2: number): number {
  const diff = Math.abs(pos1 - pos2)
  return Math.min(diff, 360 - diff)
}

/**
 * Check if two points are in aspect with a specific orb
 */
function isAspect(long1: number, long2: number, aspectAngle: number, orb: number): boolean {
  const diff = getDistance(long1, long2)
  return Math.abs(diff - aspectAngle) <= orb
}

/**
 * Check if two planets are in conjunction
 */
function isConjunction(planet1: PlanetPosition, planet2: PlanetPosition, orb: number = 10): boolean {
  return getDistance(planet1.longitude, planet2.longitude) <= orb
}

/**
 * Check if two planets are in opposition
 */
function isOpposition(planet1: PlanetPosition, planet2: PlanetPosition, orb: number = 8): boolean {
  const diff = getDistance(planet1.longitude, planet2.longitude)
  return Math.abs(diff - 180) <= orb
}

/**
 * Check if two planets are in square aspect
 */
function isSquare(planet1: PlanetPosition, planet2: PlanetPosition, orb: number = 8): boolean {
  const diff = getDistance(planet1.longitude, planet2.longitude)
  return Math.abs(diff - 90) <= orb
}

/**
 * Check if two planets are in trine aspect
 */
function isTrine(planet1: PlanetPosition, planet2: PlanetPosition, orb: number = 8): boolean {
  const diff = getDistance(planet1.longitude, planet2.longitude)
  return Math.abs(diff - 120) <= orb
}

/**
 * Check if two planets are in sextile aspect
 */
function isSextile(planet1: PlanetPosition, planet2: PlanetPosition, orb: number = 6): boolean {
  const diff = getDistance(planet1.longitude, planet2.longitude)
  return Math.abs(diff - 60) <= orb
}

/**
 * Check if two planets are in quincunx aspect
 */
function isQuincunx(planet1: PlanetPosition, planet2: PlanetPosition, orb: number = 3): boolean {
  const diff = getDistance(planet1.longitude, planet2.longitude)
  return Math.abs(diff - 150) <= orb
}

/**
 * Detect Grand Cross pattern (4 planets in square aspects)
 */
export function detectGrandCross(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []

  for (let i = 0; i < planets.length - 3; i++) {
    for (let j = i + 1; j < planets.length - 2; j++) {
      for (let k = j + 1; k < planets.length - 1; k++) {
        for (let l = k + 1; l < planets.length; l++) {
          const p1 = planets[i]
          const p2 = planets[j]
          const p3 = planets[k]
          const p4 = planets[l]

          if (
            isSquare(p1, p2) && isSquare(p2, p3) &&
            isSquare(p3, p4) && isSquare(p4, p1) &&
            isOpposition(p1, p3) && isOpposition(p2, p4)
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
 * Detect T-Square pattern (two planets in opposition, both square to a third)
 */
export function detectTSquares(data: BirthChartData): PatternData[] {
  const patterns: PatternData[] = []
  const planets = [...data.planets, { name: 'MC', longitude: data.midheaven.longitude }]

  for (let i = 0; i < planets.length - 2; i++) {
    for (let j = i + 1; j < planets.length - 1; j++) {
      for (let k = j + 1; k < planets.length; k++) {
        const p1 = planets[i]
        const p2 = planets[j]
        const p3 = planets[k]

        // Check for opposition between p1 and p2, and squares to p3
        if (
          isAspect(p1.longitude, p2.longitude, 180, 8) && // Opposition
          isAspect(p1.longitude, p3.longitude, 90, 8) &&  // Square
          isAspect(p2.longitude, p3.longitude, 90, 8)     // Square
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
 * Detect Grand Trine pattern (3 planets in trine aspects)
 */
export function detectGrandTrines(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []

  for (let i = 0; i < planets.length - 2; i++) {
    for (let j = i + 1; j < planets.length - 1; j++) {
      for (let k = j + 1; k < planets.length; k++) {
        const p1 = planets[i]
        const p2 = planets[j]
        const p3 = planets[k]

        if (
          isTrine(p1, p2) &&
          isTrine(p2, p3) &&
          isTrine(p3, p1)
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
 * Detect Rectangle pattern (two pairs of planets in opposition, connected by sextiles/trines)
 */
export function detectRectangles(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
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
          const hasOppositions = (
            isAspect(p1.longitude, p2.longitude, 180, 8) &&
            isAspect(p3.longitude, p4.longitude, 180, 8)
          )

          const hasHarmonicAspects = (
            (isAspect(p1.longitude, p3.longitude, 60, 6) && isAspect(p2.longitude, p4.longitude, 60, 6)) ||
            (isAspect(p1.longitude, p3.longitude, 120, 8) && isAspect(p2.longitude, p4.longitude, 120, 8))
          )

          if (hasOppositions && hasHarmonicAspects) {
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
 * Detect Yod pattern (two planets in sextile, both quincunx to a third)
 */
export function detectYods(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []

  for (let i = 0; i < planets.length - 2; i++) {
    for (let j = i + 1; j < planets.length - 1; j++) {
      for (let k = j + 1; k < planets.length; k++) {
        const p1 = planets[i]
        const p2 = planets[j]
        const p3 = planets[k]

        // Check for sextile between p1 and p2, and quincunxes to p3
        if (
          isSextile(p1, p2) &&
          isQuincunx(p1, p3) &&
          isQuincunx(p2, p3)
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
 * Detect Castle pattern (Grand Trine with additional aspects)
 */
export function detectCastles(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []

  // First, find all Grand Trines
  const grandTrines = detectGrandTrines(planets)

  for (const trine of grandTrines) {
    const trinePlanets = trine.planets.map(planetName => 
      planets.find(p => p.name === planetName) as PlanetPosition & { name: string }
    )

    // Check for additional sextiles or trines to other planets
    for (const planet of planets) {
      if (!trine.planets.includes(planet.name)) {
        if (
          isSextile(planet, trinePlanets[0]) || 
          isTrine(planet, trinePlanets[0]) ||
          isSextile(planet, trinePlanets[1]) || 
          isTrine(planet, trinePlanets[1]) ||
          isSextile(planet, trinePlanets[2]) || 
          isTrine(planet, trinePlanets[2])
        ) {
          patterns.push({
            name: 'Castle',
            planets: [...trine.planets, planet.name],
            description: 'A Grand Trine with extra support and stability from additional harmonious aspects'
          })
        }
      }
    }
  }

  return patterns
}

/**
 * Detect Cradle pattern (harmonious chain of planets)
 */
export function detectCradles(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  const maxChainSpan = 180 // Maximum angular span for a Cradle

  // Sort planets by longitude
  const sortedPlanets = [...planets].sort((a, b) => a.longitude - b.longitude)

  // Look for groups of 4+ planets spanning less than maxChainSpan degrees
  for (let i = 0; i < planets.length - 3; i++) {
    for (let j = i + 3; j < planets.length; j++) {
      const group = sortedPlanets.slice(i, j + 1)
      const span = getDistance(group[0].longitude, group[group.length - 1].longitude)

      if (span <= maxChainSpan) {
        // Check for harmonious aspects between consecutive planets
        let hasHarmoniousChain = true
        const aspectCount: { [planetName: string]: number } = {} // Track aspects per planet

        for (let k = 0; k < group.length - 1; k++) {
          const p1 = group[k]
          const p2 = group[k + 1]

          if (isSextile(p1, p2) || isTrine(p1, p2)) {
            aspectCount[p1.name] = (aspectCount[p1.name] || 0) + 1
            aspectCount[p2.name] = (aspectCount[p2.name] || 0) + 1
          } else {
            hasHarmoniousChain = false
            break
          }
        }

        // Ensure each planet has exactly two aspects within the Cradle
        const validAspectCounts = Object.values(aspectCount).every(count => count === 2)

        if (hasHarmoniousChain && validAspectCounts) {
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
 * Detect Easy Opposition pattern (two planets in opposition with harmonious aspects)
 */
export function detectEasyOppositions(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []

  for (let i = 0; i < planets.length - 1; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i]
      const p2 = planets[j]

      if (isOpposition(p1, p2)) {
        // Find planets making harmonious aspects to BOTH opposed planets
        const harmonicPlanets = planets.filter(p3 => {
          if (p3 === p1 || p3 === p2) return false

          const hasHarmonicAspectToP1 = isSextile(p3, p1) || isTrine(p3, p1)
          const hasHarmonicAspectToP2 = isSextile(p3, p2) || isTrine(p3, p2)

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
 * Detect Bundle pattern (planets grouped together)
 */
export function detectBundles(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  const orb = 60 // Maximum span for a bundle (60°)
  const minPlanets = 4 // Minimum number of planets to form a bundle

  // Sort planets by longitude
  const sortedPlanets = [...planets].sort((a, b) => a.longitude - b.longitude)
  
  // Find groups of planets within orb
  for (let i = 0; i < planets.length - (minPlanets - 1); i++) {
    const bundlePlanets = [sortedPlanets[i]]
    let maxLong = sortedPlanets[i].longitude
    let minLong = sortedPlanets[i].longitude
    
    for (let j = i + 1; j < planets.length; j++) {
      const span = getDistance(sortedPlanets[i].longitude, sortedPlanets[j].longitude)
      if (span <= orb) {
        bundlePlanets.push(sortedPlanets[j])
        maxLong = Math.max(maxLong, sortedPlanets[j].longitude)
        minLong = Math.min(minLong, sortedPlanets[j].longitude)
      }
    }

    // Only add bundle if it has enough planets and doesn't overlap with previous bundles
    if (bundlePlanets.length >= minPlanets && 
        !patterns.some(p => p.planets.some(name => 
          bundlePlanets.some(bp => bp.name === name)))) {
      patterns.push({
        name: 'Bundle',
        planets: bundlePlanets.map(p => p.name),
        description: 'A concentration of planetary energy in a specific area of the chart'
      })
    }
  }

  return patterns
}

/**
 * Detect Splay pattern (planets spread evenly)
 */
export function detectSplays(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
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
 * Detect Bucket pattern (planets with one opposite)
 */
export function detectBuckets(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  const minBowlPlanets = 3 // Minimum planets in the "bowl"
  
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
    const opposingPlanet = sortedPlanets[(gapStartIndex + 1) % sortedPlanets.length]
    const midpoint = (handle.longitude + opposingPlanet.longitude) / 2 % 360

    // Find planets within 90 degrees of the midpoint
    const bowl = sortedPlanets.filter(p => {
      return p !== handle && p !== opposingPlanet && getDistance(p.longitude, midpoint) <= 90
    })

    if (bowl.length >= minBowlPlanets) {
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
 * Detect Splash pattern (planets widely distributed)
 */
export function detectSplashes(planets: Array<PlanetPosition & { name: string }>): PatternData[] {
  const patterns: PatternData[] = []
  const numHouses = 12 // Number of houses to divide the chart into
  const minOccupiedHouses = 10 // Minimum number of houses that must contain planets
  
  // Divide the chart into houses of 30 degrees each
  const houses = Array(numHouses).fill(0)
  
  // Count planets in each house
  planets.forEach(planet => {
    const house = Math.floor(planet.longitude / (360 / numHouses))
    houses[house]++
  })
  
  // Count occupied houses
  const occupiedHouses = houses.filter(count => count > 0).length
  
  // If planets occupy minimum required houses
  if (occupiedHouses >= minOccupiedHouses) {
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
export function detectSpecialFeatures(data: BirthChartData): SpecialFeature[] {
  const features: SpecialFeature[] = []

  // Moon phase features
  const sun = data.planets.find(p => p.name === 'Sun')
  const moon = data.planets.find(p => p.name === 'Moon')
  if (sun && moon) {
    const moonPhaseAngle = getDistance(moon.longitude, sun.longitude)
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

  // Rising planets
  const risingPlanets = data.planets.filter(p => {
    const ascLong = data.ascendant.longitude
    return getDistance(p.longitude, ascLong) <= 10
  }).map(p => p.name)
  if (risingPlanets.length > 0) {
    features.push({
      description: `${risingPlanets.join(', ')} ${risingPlanets.length === 1 ? 'is' : 'are'} rising`,
      category: 'planets'
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
  addUniquePatterns(detectTSquares(data)) // Pass full data object for MC access
  addUniquePatterns(detectGrandTrines(data.planets))
  addUniquePatterns(detectRectangles(data.planets))
  addUniquePatterns(detectYods(data.planets))
  addUniquePatterns(detectCastles(data.planets))
  addUniquePatterns(detectCradles(data.planets))
  addUniquePatterns(detectEasyOppositions(data.planets))
  addUniquePatterns(detectBundles(data.planets))
  addUniquePatterns(detectSplays(data.planets))
  addUniquePatterns(detectBuckets(data.planets))
  addUniquePatterns(detectSplashes(data.planets))

  // Sort patterns by type and size
  allPatterns.sort((a, b) => {
    // First sort by pattern type priority
    const patternPriority = {
      'Grand Cross': 1,
      'T-Square': 2,
      'Grand Trine': 3,
      'Rectangle': 4,
      'Yod': 5,
      'Castle': 6,
      'Cradle': 7,
      'Easy Opposition': 8,
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
