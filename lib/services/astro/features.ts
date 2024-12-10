import { BirthChartData, SpecialFeature, PlanetPosition } from '../../../lib/types/birth-chart'

/**
 * Calculate the angular distance between two points on the ecliptic
 */
function getDistance(pos1: number, pos2: number): number {
  const diff = Math.abs(pos1 - pos2)
  return Math.min(diff, 360 - diff)
}

/**
 * Detect moon phase features
 */
function detectMoonFeatures(data: BirthChartData): SpecialFeature[] {
  const features: SpecialFeature[] = []
  const sun = data.planets.find(p => p.name === 'Sun')
  const moon = data.planets.find(p => p.name === 'Moon')

  if (sun && moon) {
    const moonPhaseAngle = getDistance(moon.longitude, sun.longitude)
    
    // New Moon
    if (moonPhaseAngle <= 10) {
      features.push({
        description: 'New Moon - indicating a time of new beginnings and fresh starts',
        category: 'moon'
      })
    }
    // Full Moon
    else if (Math.abs(moonPhaseAngle - 180) <= 10) {
      features.push({
        description: 'Full Moon - suggesting heightened awareness and culmination',
        category: 'moon'
      })
    }
    // First Quarter
    else if (Math.abs(moonPhaseAngle - 90) <= 10) {
      features.push({
        description: 'First Quarter Moon - representing a time of action and decision-making',
        category: 'moon'
      })
    }
    // Last Quarter
    else if (Math.abs(moonPhaseAngle - 270) <= 10) {
      features.push({
        description: 'Last Quarter Moon - indicating a time of release and reflection',
        category: 'moon'
      })
    }
  }

  return features
}

/**
 * Detect planetary features
 */
function detectPlanetaryFeatures(data: BirthChartData): SpecialFeature[] {
  const features: SpecialFeature[] = []

  // Check for retrograde planets
  const retrogradePlanets = data.planets.filter(p => p.retrograde).map(p => p.name)
  if (retrogradePlanets.length >= 3) {
    features.push({
      description: `Multiple planets retrograde: ${retrogradePlanets.join(', ')}`,
      category: 'planets'
    })
  }

  // Check for planets in domicile (in their ruling sign)
  const rulerships: Record<string, string[]> = {
    'Sun': ['Leo'],
    'Moon': ['Cancer'],
    'Mercury': ['Gemini', 'Virgo'],
    'Venus': ['Taurus', 'Libra'],
    'Mars': ['Aries', 'Scorpio'],
    'Jupiter': ['Sagittarius', 'Pisces'],
    'Saturn': ['Capricorn', 'Aquarius']
  }

  const planetsInDomicile = data.planets
    .filter(p => rulerships[p.name]?.includes(p.sign))
    .map(p => p.name)

  if (planetsInDomicile.length > 0) {
    features.push({
      description: `Planets in their ruling signs: ${planetsInDomicile.join(', ')}`,
      category: 'planets'
    })
  }

  // Check for planets near the Midheaven
  const planetsNearMC = data.planets
    .filter(p => Math.abs(p.longitude - data.midheaven.longitude) <= 10)
    .map(p => p.name)

  if (planetsNearMC.length > 0) {
    features.push({
      description: `Planets conjunct Midheaven: ${planetsNearMC.join(', ')}`,
      category: 'planets'
    })
  }

  return features
}

/**
 * Detect chart features
 */
function detectChartFeatures(data: BirthChartData): SpecialFeature[] {
  const features: SpecialFeature[] = []

  // Check for stelliums (3 or more planets in the same sign)
  const planetsBySign = data.planets.reduce((acc, planet) => {
    acc[planet.sign] = (acc[planet.sign] || []).concat(planet.name)
    return acc
  }, {} as Record<string, string[]>)

  Object.entries(planetsBySign).forEach(([sign, planets]) => {
    if (planets.length >= 3) {
      features.push({
        description: `Stellium in ${sign}: ${planets.join(', ')}`,
        category: 'chart'
      })
    }
  })

  // Check for planets in angular houses (1, 4, 7, 10)
  const angularHouses = ['House_1', 'House_4', 'House_7', 'House_10']
  const planetsInAngularHouses = data.planets.filter(planet => {
    return angularHouses.some(house => {
      const houseCusp = data.houses[house].cusp
      const nextHouse = `House_${(parseInt(house.split('_')[1]) % 12) + 1}`
      const nextHouseCusp = data.houses[nextHouse].cusp
      
      if (nextHouseCusp > houseCusp) {
        return planet.longitude >= houseCusp && planet.longitude < nextHouseCusp
      } else {
        return planet.longitude >= houseCusp || planet.longitude < nextHouseCusp
      }
    })
  })

  if (planetsInAngularHouses.length >= 3) {
    features.push({
      description: `Strong angular emphasis with ${planetsInAngularHouses.length} planets in angular houses`,
      category: 'chart'
    })
  }

  return features
}

/**
 * Analyze birth chart data to detect special features
 */
export function analyzeSpecialFeatures(data: BirthChartData): SpecialFeature[] {
  return [
    ...detectMoonFeatures(data),
    ...detectPlanetaryFeatures(data),
    ...detectChartFeatures(data)
  ]
}
