import { BirthChartData, PatternData, PlanetPosition } from '../../../lib/types/birth-chart'
import { isUniquePattern } from './patterns/utils'

// Import existing pattern detectors
import { detectBucket } from './patterns/bucket'
import { detectBowl } from './patterns/bowl'
import { detectBundle } from './patterns/bundle'
import { detectLocomotive } from './patterns/locomotive'
import { detectGrandCross } from './patterns/grand-cross'
import { detectGrandTrines } from './patterns/grand-trine'
import { detectTSquares } from './patterns/t-square'

// Future pattern detectors (commented out until implemented)

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

  const buckets = detectBucket(planetsWithAngles)
  console.debug(`Found ${buckets.length} Bucket patterns`)
  addUniquePatterns(buckets)

  const bundles = detectBundle(planetsWithAngles)
  console.debug(`Found ${bundles.length} Bundle patterns`)
  addUniquePatterns(bundles)

  const locomotives = detectLocomotive(planetsWithAngles)
  console.debug(`Found ${locomotives.length} Locomotive patterns`)
  addUniquePatterns(locomotives)

  const bowls = detectBowl(planetsWithAngles)
  console.debug(`Found ${bowls.length} Bowl patterns`)
  addUniquePatterns(bowls)

  // Future pattern detections (commented out until implemented)
  
  const splashes = detectSplash(planetsWithAngles)
  addUniquePatterns(splashes)

  const seesaws = detectSeesaw(planetsWithAngles)
  addUniquePatterns(seesaws)

  const cradles = detectCradle(planetsWithAngles)
  addUniquePatterns(cradles)

  const kites = detectKite(planetsWithAngles)
  addUniquePatterns(kites)

  const mysticRectangles = detectMysticRectangle(planetsWithAngles)
  addUniquePatterns(mysticRectangles)

  const rectangles = detectRectangle(planetsWithAngles)
  addUniquePatterns(rectangles)

  const yods = detectYod(planetsWithAngles)
  addUniquePatterns(yods)

  const stelliums = detectStellium(planetsWithAngles)
  addUniquePatterns(stelliums)

  const hammersOfThor = detectHammerOfThor(planetsWithAngles)
  addUniquePatterns(hammersOfThor)

  const starsOfDavid = detectStarOfDavid(planetsWithAngles)
  addUniquePatterns(starsOfDavid)

  const doubleTSquares = detectDoubleTSquare(planetsWithAngles)
  addUniquePatterns(doubleTSquares)

  const grandSextiles = detectGrandSextile(planetsWithAngles)
  addUniquePatterns(grandSextiles)

  const wedges = detectWedge(planetsWithAngles)
  addUniquePatterns(wedges)

  const castles = detectCastle(planetsWithAngles)
  addUniquePatterns(castles)

  const trapezoids = detectTrapezoid(planetsWithAngles)
  addUniquePatterns(trapezoids)

  const pentagrams = detectPentagram(planetsWithAngles)
  addUniquePatterns(pentagrams)

  const grandQuintiles = detectGrandQuintile(planetsWithAngles)
  addUniquePatterns(grandQuintiles)

  const rosettas = detectRosetta(planetsWithAngles)
  addUniquePatterns(rosettas)

  const boomerangYods = detectBoomerangYod(planetsWithAngles)
  addUniquePatterns(boomerangYods)

  const arrowheads = detectArrowhead(planetsWithAngles)
  addUniquePatterns(arrowheads)

  const stars = detectStar(planetsWithAngles)
  addUniquePatterns(stars)

  const crossbows = detectCrossbow(planetsWithAngles)
  addUniquePatterns(crossbows)

  const butterflies = detectButterfly(planetsWithAngles)
  addUniquePatterns(butterflies)

  const baskets = detectBasket(planetsWithAngles)
  addUniquePatterns(baskets)

  const diamonds = detectDiamond(planetsWithAngles)
  addUniquePatterns(diamonds)

  const hexagons = detectHexagon(planetsWithAngles)
  addUniquePatterns(hexagons)

  const shields = detectShield(planetsWithAngles)
  addUniquePatterns(shields)

  const arrows = detectArrow(planetsWithAngles)
  addUniquePatterns(arrows)

  const hourglasses = detectHourglass(planetsWithAngles)
  addUniquePatterns(hourglasses)
  

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
      'Yod': 14,  // Also known as Finger of God
      'Stellium': 15,
      'Hammer of Thor': 16,  // Also known as Thor's Hammer
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
}
