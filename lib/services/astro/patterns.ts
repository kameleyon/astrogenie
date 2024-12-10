import { BirthChartData, PatternData, PlanetPosition } from '../../../lib/types/birth-chart'
import { isUniquePattern } from './patterns/utils'
import { detectGrandTrines } from './patterns/grand-trine'
import { detectGrandCross } from './patterns/grand-cross'
import { detectTSquares } from './patterns/t-square'

/**
 * Analyze birth chart data to detect patterns
 */
export function analyzeBirthChart(data: BirthChartData): {
  patterns: PatternData[]
  features: []  // Empty array since we're not handling features here
} {
  console.debug('Starting pattern analysis...')

  // Include Midheaven and Ascendant in the planet list for pattern detection
  const planetsWithAngles = [
    ...data.planets,
    { ...data.midheaven, name: 'MC' },
    { ...data.ascendant, name: 'ASC' }
  ]

  console.debug('Available points:', planetsWithAngles.map(p => `${p.name} at ${p.formatted} ${p.sign}`))

  // Detect all patterns
  let allPatterns: PatternData[] = []
  
  // Helper function to add unique patterns
  const addUniquePatterns = (newPatterns: PatternData[]) => {
    newPatterns.forEach(pattern => {
      if (isUniquePattern(pattern, allPatterns)) {
        console.debug(`Adding unique pattern: ${pattern.name} with planets ${pattern.planets.map(p => p.name).join(', ')}`)
        allPatterns.push(pattern)
      } else {
        console.debug(`Skipping duplicate pattern: ${pattern.name} with planets ${pattern.planets.map(p => p.name).join(', ')}`)
      }
    })
  }

  // Detect patterns in order of priority
  const grandCrosses = detectGrandCross(planetsWithAngles)
  console.debug(`Found ${grandCrosses.length} Grand Cross patterns`)
  addUniquePatterns(grandCrosses)

  const tSquares = detectTSquares(planetsWithAngles)
  console.debug(`Found ${tSquares.length} T-Square patterns`)
  addUniquePatterns(tSquares)

  const grandTrines = detectGrandTrines(planetsWithAngles)
  console.debug(`Found ${grandTrines.length} Grand Trine patterns`)
  addUniquePatterns(grandTrines)

  // Sort patterns by type and size
  allPatterns.sort((a, b) => {
    // First sort by pattern type priority
    const patternPriority = {
      'Grand Cross': 1,
      'T-Square': 2,
      'Grand Trine': 3
    }
    const priorityDiff = (patternPriority[a.name as keyof typeof patternPriority] || 99) -
                        (patternPriority[b.name as keyof typeof patternPriority] || 99)
    if (priorityDiff !== 0) return priorityDiff

    // Then sort by number of planets involved (more planets first)
    return b.planets.length - a.planets.length
  })

  console.debug('Final patterns:', allPatterns.map(p => ({
    name: p.name,
    planets: p.planets.map(planet => `${planet.name} at ${planet.degree} ${planet.sign}`).join(', ')
  })))

  return {
    patterns: allPatterns,
    features: []  // Empty array since we're not handling features here
  }
}
