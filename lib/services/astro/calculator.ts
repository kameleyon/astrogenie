import { BirthChartData, PlanetPosition, Position, PatternData, ZodiacSign, HouseData } from '@/lib/types/birth-chart'

// Import the pure JavaScript calculations
const { 
    getTimezone,
    calculateJulianDay,
    calculatePlanetPositions,
    calculateHouses,
    calculateAspects
} = require('./pure-calculations.js')

interface BirthChartInput {
    name: string
    date: string
    time: string
    location: string
    latitude: number
    longitude: number
}

// Define types for the JavaScript module's return values
interface JSPlanetData {
    longitude: number
    latitude: number
    distance: number
    longitude_speed: number
    sign: string
    formatted: string
}

interface JSHouseData {
    cusp: number
    sign: string
    formatted: string
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
            return { year, month, day }
        } else {
            // YYYY-MM-DD format
            const [year, month, day] = parts
            return { year, month, day }
        }
    } catch (error) {
        throw new Error('Invalid date format. Use MM/DD/YYYY or YYYY-MM-DD')
    }
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
 * Calculate complete birth chart data
 */
export async function calculateBirthChart(input: BirthChartInput): Promise<BirthChartData> {
    try {
        // Parse date and time
        const { year, month, day } = parseDate(input.date)
        const { hour, minute } = parseTime(input.time)
        
        // Calculate Julian Day with timezone handling
        const jd = calculateJulianDay(
            year,
            month,
            day,
            hour,
            minute,
            0, // seconds
            input.latitude,
            input.longitude
        )

        // Calculate planet positions
        const positions = await calculatePlanetPositions(jd) as Record<string, JSPlanetData>

        // Calculate house data
        const houseData = await calculateHouses(jd, input.latitude, input.longitude) as Record<string, JSHouseData>

        // Calculate aspects between planets
        const aspects = calculateAspects(positions)

        // Transform planet positions into array format with required properties
        const planets: Array<PlanetPosition & { name: string }> = Object.entries(positions).map(([name, data]) => ({
            name,
            longitude: data.longitude,
            latitude: data.latitude,
            distance: data.distance,
            longitudeSpeed: data.longitude_speed,
            sign: data.sign as ZodiacSign,
            retrograde: data.longitude_speed < 0,
            formatted: data.formatted
        }))

        // Create position objects for ascendant and midheaven
        const ascendant: Position = {
            longitude: houseData.Ascendant.cusp,
            latitude: 0,
            distance: 0,
            longitudeSpeed: 0,
            sign: houseData.Ascendant.sign as ZodiacSign,
            retrograde: false,
            formatted: houseData.Ascendant.formatted
        }

        const midheaven: Position = {
            longitude: houseData.Midheaven.cusp,
            latitude: 0,
            distance: 0,
            longitudeSpeed: 0,
            sign: houseData.Midheaven.sign as ZodiacSign,
            retrograde: false,
            formatted: houseData.Midheaven.formatted
        }

        // Transform house data to ensure correct types
        const typedHouseData = Object.entries(houseData).reduce<Record<string, HouseData>>((acc, [key, data]) => ({
            ...acc,
            [key]: {
                cusp: data.cusp,
                sign: data.sign as ZodiacSign,
                formatted: data.formatted
            }
        }), {})

        // Return complete birth chart data
        return {
            name: input.name,
            location: input.location,
            date: input.date,
            time: input.time,
            planets,
            houses: typedHouseData,
            aspects,
            patterns: [], // Aspect patterns will be calculated separately
            ascendant,
            midheaven
        }
    } catch (error) {
        console.error('Error calculating birth chart:', error)
        throw error
    }
}
