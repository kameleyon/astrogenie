import { DateTime, GeoPosition, BirthChartCalculation } from './types'
import { calculateJulianDay } from './julian-date'
import { calculatePlanetPositions, PlanetName, PLANET_INDICES } from './planets'
import { calculateHouseCusps, HouseSystem } from './houses'
import { calculateAspects } from './aspects'

interface CalculationOptions {
  houseSystem?: HouseSystem
  includeMinorAspects?: boolean
  calculateMidpoints?: boolean
}

const DEFAULT_OPTIONS: CalculationOptions = {
  houseSystem: 'P',
  includeMinorAspects: false,
  calculateMidpoints: false
}

/**
 * Main calculator class for birth chart calculations
 */
export class AstroCalculator {
  private julianDay: number
  private geoPosition: GeoPosition
  private options: CalculationOptions

  constructor(
    dateTime: DateTime,
    geoPosition: GeoPosition,
    options: Partial<CalculationOptions> = {}
  ) {
    this.julianDay = calculateJulianDay(dateTime, geoPosition)
    this.geoPosition = geoPosition
    this.options = { ...DEFAULT_OPTIONS, ...options }
  }

  /**
   * Calculate the complete birth chart
   */
  async calculateBirthChart(): Promise<BirthChartCalculation> {
    try {
      // Calculate planet positions
      const planets = await calculatePlanetPositions(this.julianDay)

      // Calculate house cusps
      const { cusps, ascendant, midheaven } = await calculateHouseCusps(
        this.julianDay,
        this.geoPosition,
        this.options.houseSystem
      )

      // Calculate aspects
      const aspects = calculateAspects(planets, this.options.includeMinorAspects)

      // Calculate midpoints if requested
      const midpoints = this.options.calculateMidpoints 
        ? this.calculateMidpoints(planets)
        : undefined

      return {
        planets,
        houses: cusps,
        aspects,
        ascendant,
        midheaven,
        midpoints
      }
    } catch (error) {
      console.error('Error calculating birth chart:', error)
      throw new Error('Failed to calculate birth chart')
    }
  }

  /**
   * Calculate midpoints between planets
   */
  private calculateMidpoints(
    planets: Record<PlanetName, { longitude: number }>
  ): Record<string, number> {
    const midpoints: Record<string, number> = {}
    const planetNames = Object.keys(planets) as PlanetName[]

    for (let i = 0; i < planetNames.length; i++) {
      for (let j = i + 1; j < planetNames.length; j++) {
        const planet1 = planetNames[i]
        const planet2 = planetNames[j]
        
        let long1 = planets[planet1].longitude
        let long2 = planets[planet2].longitude

        // Ensure proper calculation across 0°/360° boundary
        if (Math.abs(long1 - long2) > 180) {
          if (long1 < long2) long1 += 360
          else long2 += 360
        }

        let midpoint = (long1 + long2) / 2
        if (midpoint >= 360) midpoint -= 360

        midpoints[`${planet1}_${planet2}`] = midpoint
      }
    }

    return midpoints
  }

  /**
   * Get Julian Day for the chart
   */
  getJulianDay(): number {
    return this.julianDay
  }

  /**
   * Update calculation options
   */
  updateOptions(newOptions: Partial<CalculationOptions>): void {
    this.options = { ...this.options, ...newOptions }
  }

  /**
   * Static method to create calculator instance
   */
  static create(
    dateTime: DateTime,
    geoPosition: GeoPosition,
    options?: Partial<CalculationOptions>
  ): AstroCalculator {
    return new AstroCalculator(dateTime, geoPosition, options)
  }

  /**
   * Calculate current transits
   */
  async calculateTransits(): Promise<Record<PlanetName, { longitude: number; aspectsToNatal: any[] }>> {
    const currentJd = new Date().getTime() / 86400000 + 2440587.5 // Current Julian Day
    const transitPositions = await calculatePlanetPositions(currentJd)
    const natalPositions = await calculatePlanetPositions(this.julianDay)

    const transits: Record<PlanetName, { longitude: number; aspectsToNatal: any[] }> = {} as any

    for (const transitPlanet of Object.keys(PLANET_INDICES) as PlanetName[]) {
      const transitPos = transitPositions[transitPlanet]
      const aspectsToNatal = []

      for (const natalPlanet of Object.keys(PLANET_INDICES) as PlanetName[]) {
        const natalPos = natalPositions[natalPlanet]
        // Calculate aspects between transit and natal positions
        const diff = Math.abs(transitPos.longitude - natalPos.longitude)
        if (diff <= 10 || Math.abs(diff - 180) <= 10) { // Example: only conjunction and opposition
          aspectsToNatal.push({
            planet: natalPlanet,
            aspect: diff <= 10 ? 'conjunction' : 'opposition',
            orb: diff <= 10 ? diff : Math.abs(diff - 180)
          })
        }
      }

      transits[transitPlanet] = {
        longitude: transitPos.longitude,
        aspectsToNatal
      }
    }

    return transits
  }

  /**
   * Calculate solar return
   */
  async calculateSolarReturn(year: number): Promise<number> {
    const natalSun = (await calculatePlanetPositions(this.julianDay)).Sun.longitude
    let jd = calculateJulianDay({
      year,
      month: 1,
      day: 1,
      hour: 0,
      minute: 0,
      second: 0
    }, this.geoPosition)

    // Iterate through the year to find when Sun returns to natal position
    while (true) {
      const sunPos = (await calculatePlanetPositions(jd)).Sun.longitude
      const diff = Math.abs(sunPos - natalSun)
      
      if (diff < 0.0001) break // Found the return
      
      // Adjust JD based on difference
      jd += (diff / 360) * 365.25
      
      if (jd > calculateJulianDay({
        year: year + 1,
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0
      }, this.geoPosition)) {
        throw new Error('Solar return not found')
      }
    }

    return jd
  }
}
