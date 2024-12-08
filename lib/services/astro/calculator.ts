import { BirthChartData, Planet, House, Aspect, ZodiacSign } from '@/lib/types/birth-chart'
import { calculateJulianDay } from './julian-date'
import { calculatePlanetPositions, getZodiacSign } from './planets'
import { calculateHouseCusps, getHousePosition } from './houses'
import { calculateAspects } from './aspects'
import { DateTime, GeoPosition } from './types'

interface BirthChartInput {
  name: string
  date: string
  time: string
  location: string
  latitude: number
  longitude: number
}

/**
 * Parse date string to year, month, day
 */
function parseDate(dateStr: string): { year: number; month: number; day: number } {
  try {
    // Handle both MM/DD/YYYY and YYYY-MM-DD formats
    const parts = dateStr.includes('/') 
      ? dateStr.split('/').map(Number)  // MM/DD/YYYY
      : dateStr.split('-').map(Number)  // YYYY-MM-DD

    if (dateStr.includes('/')) {
      // MM/DD/YYYY format
      const [month, day, year] = parts
      if (!isValidDate(year, month, day)) {
        throw new Error('Invalid date')
      }
      return { year, month, day }
    } else {
      // YYYY-MM-DD format
      const [year, month, day] = parts
      if (!isValidDate(year, month, day)) {
        throw new Error('Invalid date')
      }
      return { year, month, day }
    }
  } catch (error) {
    throw new Error('Invalid date format. Use MM/DD/YYYY or YYYY-MM-DD')
  }
}

/**
 * Validate date components
 */
function isValidDate(year: number, month: number, day: number): boolean {
  if (isNaN(year) || isNaN(month) || isNaN(day)) return false
  if (month < 1 || month > 12) return false
  if (day < 1 || day > 31) return false
  
  // Check days in month
  const daysInMonth = new Date(year, month, 0).getDate()
  if (day > daysInMonth) return false

  return true
}

/**
 * Parse time string to hour and minute
 */
function parseTime(timeStr: string): { hour: number; minute: number } {
  try {
    const [hour, minute] = timeStr.split(':').map(Number)
    if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      throw new Error('Invalid time')
    }
    return { hour, minute }
  } catch (error) {
    throw new Error('Invalid time format. Use HH:MM (24-hour format)')
  }
}

/**
 * Format degree with minutes
 */
function formatDegree(decimal: number): string {
  const degrees = Math.floor(decimal)
  const minutes = Math.floor((decimal - degrees) * 60)
  return `${degrees}° ${minutes}'`
}

/**
 * Calculate complete birth chart data
 * Direct port of Python implementation
 */
export async function calculateBirthChart(input: BirthChartInput): Promise<BirthChartData> {
  try {
    // Validate input
    if (!input.name?.trim()) throw new Error('Name is required')
    if (!input.date) throw new Error('Birth date is required')
    if (!input.time) throw new Error('Birth time is required')
    if (!input.location) throw new Error('Birth location is required')
    if (typeof input.latitude !== 'number' || typeof input.longitude !== 'number') {
      throw new Error('Invalid coordinates')
    }
    if (input.latitude < -90 || input.latitude > 90) {
      throw new Error('Latitude must be between -90 and 90 degrees')
    }
    if (input.longitude < -180 || input.longitude > 180) {
      throw new Error('Longitude must be between -180 and 180 degrees')
    }

    // Parse date and time
    const { year, month, day } = parseDate(input.date)
    const { hour, minute } = parseTime(input.time)
    
    const dateTime: DateTime = {
      year,
      month,
      day,
      hour,
      minute,
      second: 0
    }

    const position: GeoPosition = {
      latitude: input.latitude,
      longitude: input.longitude
    }

    // Calculate Julian Date for the birth time
    const julianDay = calculateJulianDay(dateTime, position)
    console.debug(`Julian Day: ${julianDay}`)

    // Calculate planet positions
    const planetPositions = calculatePlanetPositions(julianDay)

    // Calculate house cusps
    const houseData = await calculateHouseCusps(julianDay, position)

    // Convert planet positions to array format
    const planets: Planet[] = Object.entries(planetPositions).map(([name, pos]) => ({
      name: name as keyof typeof planetPositions,
      sign: pos.sign as ZodiacSign,
      degree: formatDegree(pos.longitude),
      house: getHousePosition(pos.longitude, houseData.cusps),
      retrograde: pos.retrograde || false
    }))

    // Convert house cusps to array format
    const houses: House[] = Object.entries(houseData.cusps).map(([number, data]) => ({
      number: parseInt(number),
      sign: data.sign as ZodiacSign,
      degree: formatDegree(data.cusp),
      startDegree: data.cusp,
      containingPlanets: planets
        .filter(planet => planet.house === parseInt(number))
        .map(planet => planet.name)
    }))

    // Calculate aspects between planets
    const aspects = calculateAspects(planetPositions)

    return {
      name: input.name,
      location: input.location,
      date: input.date,
      time: input.time,
      planets,
      houses,
      aspects,
      patterns: [], // Aspect patterns will be calculated separately
      ascendant: houseData.ascendant,
      midheaven: houseData.midheaven,
      significantFeatures: [] // Features will be calculated separately
    }
  } catch (error) {
    console.error('Error calculating birth chart:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to calculate birth chart')
  }
}
