import { BirthChartData, PatternData, PlanetPosition } from '../../../lib/types/birth-chart'
import { isUniquePattern } from './patterns/utils'

// Import all pattern detectors
import { detectBucket } from './patterns/bucket'
import { detectBowl } from './patterns/bowl'
import { detectBundle } from './patterns/bundle'
import { detectLocomotive } from './patterns/locomotive'
import { detectGrandCross } from './patterns/grand-cross'
import { detectGrandTrines } from './patterns/grand-trine'
import { detectTSquares } from './patterns/t-square'
import { detectSplash } from './patterns/splash'
import { detectSeesaw } from './patterns/seesaw'
import { detectCradle } from './patterns/cradle'
import { detectKite } from './patterns/kite'
import { detectMysticRectangle } from './patterns/mystic-rectangle'
import { detectRectangle } from './patterns/rectangle'
import { detectYod } from './patterns/yod'
import { detectStellium } from './patterns/stellium'
import { detectHammerOfThor } from './patterns/hammer-of-thor'
import { detectStarOfDavid } from './patterns/star-of-david'
import { detectDoubleTSquare } from './patterns/double-t-square'
import { detectGrandSextile } from './patterns/grand-sextile'
import { detectWedge } from './patterns/wedge'
import { detectCastle } from './patterns/castle'
import { detectTrapezoid } from './patterns/trapezoid'
import { detectPentagram } from './patterns/pentagram'
import { detectGrandQuintile } from './patterns/grand-quintile'
import { detectRosetta } from './patterns/rosetta'
import { detectBoomerangYod } from './patterns/boomerang-yod'
import { detectArrowhead } from './patterns/arrowhead'
import { detectStar } from './patterns/star'
import { detectCrossbow } from './patterns/crossbow'
import { detectButterfly } from './patterns/butterfly'
import { detectBasket } from './patterns/basket'
import { detectDiamond } from './patterns/diamond'
import { detectHexagon } from './patterns/hexagon'
import { detectShield } from './patterns/shield'
import { detectArrow } from './patterns/arrow'
import { detectHourglass } from './patterns/hourglass'

/**
 * Validate planet position data
 */
function validatePlanetPosition(planet: PlanetPosition & { name: string }): void {
  if (!planet) {
    throw new Error('Invalid planet data: planet is undefined')
  }
  if (!planet.name) {
    throw new Error('Invalid planet data: missing name')
  }
  if (typeof planet.longitude !== 'number' || isNaN(planet.longitude)) {
    throw new Error(`Invalid planet data: invalid longitude for ${planet.name}`)
  }
  if (typeof planet.latitude !== 'number' || isNaN(planet.latitude)) {
    throw new Error(`Invalid planet data: invalid latitude for ${planet.name}`)
  }
  if (!planet.sign) {
    throw new Error(`Invalid planet data: missing sign for ${planet.name}`)
  }
}

/**
 * Validate birth chart data
 */
function validateBirthChartData(data: BirthChartData): void {
  if (!data) {
    throw new Error('Birth chart data is undefined')
  }

  if (!Array.isArray(data.planets)) {
    throw new Error('Invalid birth chart data: planets array is missing')
  }

  if (!data.ascendant || !data.midheaven) {
    throw new Error('Invalid birth chart data: missing ascendant or midheaven')
  }

  // Validate each planet position
  data.planets.forEach(validatePlanetPosition)
  validatePlanetPosition({ ...data.ascendant, name: 'ASC' })
  validatePlanetPosition({ ...data.midheaven, name: 'MC' })
}

/**
 * Analyze birth chart data to detect patterns
 */
export function analyzeBirthChart(data: BirthChartData): {
  patterns: PatternData[]
  features: []  // Empty array since we're not handling features here
} {
  try {
    console.debug('Starting pattern analysis...')

    // Validate input data
    validateBirthChartData(data)

    // Include all points in pattern detection
    const planetsWithAngles = [
      ...data.planets,
      { ...data.midheaven, name: 'MC' },
      { ...data.ascendant, name: 'ASC' }
    ]

    console.debug('Available points:', planetsWithAngles.map(p => `${p.name} at ${p.formatted} ${p.sign}`))

    // Detect all patterns
    let allPatterns: PatternData[] = []
    
    // Helper function to safely detect patterns
    const safeDetectPatterns = (
      detector: (planets: Array<PlanetPosition & { name: string }>) => PatternData[],
      patternName: string
    ) => {
      try {
        const patterns = detector(planetsWithAngles)
        console.debug(`Found ${patterns.length} ${patternName} patterns`)
        return patterns
      } catch (err) {
        const error = err as Error
        console.warn(`Error detecting ${patternName} patterns:`, error.message)
        return []
      }
    }

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
    addUniquePatterns(safeDetectPatterns(detectGrandCross, 'Grand Cross'))
    addUniquePatterns(safeDetectPatterns(detectTSquares, 'T-Square'))
    addUniquePatterns(safeDetectPatterns(detectGrandTrines, 'Grand Trine'))
    addUniquePatterns(safeDetectPatterns(detectBucket, 'Bucket'))
    addUniquePatterns(safeDetectPatterns(detectBundle, 'Bundle'))
    addUniquePatterns(safeDetectPatterns(detectLocomotive, 'Locomotive'))
    addUniquePatterns(safeDetectPatterns(detectBowl, 'Bowl'))
    addUniquePatterns(safeDetectPatterns(detectSplash, 'Splash'))
    addUniquePatterns(safeDetectPatterns(detectSeesaw, 'Seesaw'))
    addUniquePatterns(safeDetectPatterns(detectCradle, 'Cradle'))
    addUniquePatterns(safeDetectPatterns(detectKite, 'Kite'))
    addUniquePatterns(safeDetectPatterns(detectMysticRectangle, 'Mystic Rectangle'))
    addUniquePatterns(safeDetectPatterns(detectRectangle, 'Rectangle'))
    addUniquePatterns(safeDetectPatterns(detectYod, 'Yod'))
    addUniquePatterns(safeDetectPatterns(detectStellium, 'Stellium'))
    addUniquePatterns(safeDetectPatterns(detectHammerOfThor, 'Hammer of Thor'))
    addUniquePatterns(safeDetectPatterns(detectStarOfDavid, 'Star of David'))
    addUniquePatterns(safeDetectPatterns(detectDoubleTSquare, 'Double T-Square'))
    addUniquePatterns(safeDetectPatterns(detectGrandSextile, 'Grand Sextile'))
    addUniquePatterns(safeDetectPatterns(detectWedge, 'Wedge'))
    addUniquePatterns(safeDetectPatterns(detectCastle, 'Castle'))
    addUniquePatterns(safeDetectPatterns(detectTrapezoid, 'Trapezoid'))
    addUniquePatterns(safeDetectPatterns(detectPentagram, 'Pentagram'))
    addUniquePatterns(safeDetectPatterns(detectGrandQuintile, 'Grand Quintile'))
    addUniquePatterns(safeDetectPatterns(detectRosetta, 'Rosetta'))
    addUniquePatterns(safeDetectPatterns(detectBoomerangYod, 'Boomerang Yod'))
    addUniquePatterns(safeDetectPatterns(detectArrowhead, 'Arrowhead'))
    addUniquePatterns(safeDetectPatterns(detectStar, 'Star'))
    addUniquePatterns(safeDetectPatterns(detectCrossbow, 'Crossbow'))
    addUniquePatterns(safeDetectPatterns(detectButterfly, 'Butterfly'))
    addUniquePatterns(safeDetectPatterns(detectBasket, 'Basket'))
    addUniquePatterns(safeDetectPatterns(detectDiamond, 'Diamond'))
    addUniquePatterns(safeDetectPatterns(detectHexagon, 'Hexagon'))
    addUniquePatterns(safeDetectPatterns(detectShield, 'Shield'))
    addUniquePatterns(safeDetectPatterns(detectArrow, 'Arrow'))
    addUniquePatterns(safeDetectPatterns(detectHourglass, 'Hourglass'))

    // Sort patterns by type and size
    allPatterns.sort((a, b) => {
      // First sort by pattern type priority
      const patternPriority = {
        'Grand Cross': 1,
        'T-Square': 2,
        'Grand Trine': 3,
        'Bucket': 4,
        'Bundle': 5,
        'Locomotive': 6,
        'Bowl': 7,
        'Splash': 8,
        'Seesaw': 9,
        'Cradle': 10,
        'Kite': 11,
        'Mystic Rectangle': 12,
        'Rectangle': 13,
        'Yod': 14,
        'Stellium': 15,
        'Hammer of Thor': 16,
        'Star of David': 17,
        'Double T-Square': 18,
        'Grand Sextile': 19,
        'Wedge': 20,
        'Castle': 21,
        'Trapezoid': 22,
        'Pentagram': 23,
        'Grand Quintile': 24,
        'Rosetta': 25,
        'Boomerang Yod': 26,
        'Arrowhead': 27,
        'Star': 28,
        'Crossbow': 29,
        'Butterfly': 30,
        'Basket': 31,
        'Diamond': 32,
        'Hexagon': 33,
        'Shield': 34,
        'Arrow': 35,
        'Hourglass': 36
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
  } catch (err) {
    const error = err as Error
    console.error('Error analyzing birth chart patterns:', error)
    throw new Error(`Pattern analysis failed: ${error.message}`)
  }
}
