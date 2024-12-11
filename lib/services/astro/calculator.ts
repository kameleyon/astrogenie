import { BirthChartData, PlanetPosition, Position, PatternData, ZodiacSign, HouseData, PlanetName } from '../../../lib/types/birth-chart'
import { analyzeBirthChart } from './patterns'
import { analyzeSpecialFeatures } from './features'
import { calculateAspects } from './aspects'
import { 
    getTimezone, 
    calculatePlanetPositions, 
    calculateHouses,
    HOUSE_SYSTEMS
} from './planets'

interface BirthChartInput {
    name: string
    date: string
    time: string
    location: string
    latitude: number
    longitude: number
    houseSystem?: keyof typeof HOUSE_SYSTEMS
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
            if (isNaN(month) || isNaN(day) || isNaN(year) || 
                month < 1 || month > 12 || day < 1 || day > 31 || year < 1) {
                throw new Error('Invalid date values')
            }
            return { year, month, day }
        } else {
            // YYYY-MM-DD format
            const [year, month, day] = parts
            if (isNaN(month) || isNaN(day) || isNaN(year) || 
                month < 1 || month > 12 || day < 1 || day > 31 || year < 1) {
                throw new Error('Invalid date values')
            }
            return { year, month, day }
        }
    } catch (err) {
        const error = err as Error
        throw new Error(`Invalid date format (${error.message || 'Unknown error'}). Use MM/DD/YYYY or YYYY-MM-DD`)
    }
}

/**
 * Parse time string to hour and minute
 */
function parseTime(timeStr: string): { hour: number; minute: number } {
    try {
        const [hour, minute] = timeStr.split(':').map(Number)
        if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
            throw new Error('Invalid time values')
        }
        return { hour, minute }
    } catch (err) {
        const error = err as Error
        throw new Error(`Invalid time format (${error.message || 'Unknown error'}). Use HH:MM (24-hour format)`)
    }
}

/**
 * Calculate Julian Day
 */
async function calculateJulianDay(
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    second: number,
    latitude: number,
    longitude: number
): Promise<number> {
    try {
        const timezone = await getTimezone(latitude, longitude)
        const moment = (await import('moment-timezone')).default

        const local_time = moment.tz([year, month - 1, day, hour, minute, second], timezone)
        if (!local_time.isValid()) {
            throw new Error('Invalid date/time combination')
        }

        const swe = await import('swisseph-v2')
        const utc_time = local_time.clone().utc()
        const jd = swe.swe_julday(
            utc_time.year(),
            utc_time.month() + 1,
            utc_time.date(),
            utc_time.hours() + utc_time.minutes()/60.0 + utc_time.seconds()/3600.0,
            swe.SE_GREG_CAL
        )

        if (isNaN(jd)) {
            throw new Error('Julian Day calculation failed')
        }

        return jd
    } catch (err) {
        const error = err as Error
        throw new Error(`Julian Day calculation failed: ${error.message || 'Unknown error'}`)
    }
}

/**
 * Calculate complete birth chart data
 */
export async function calculateBirthChart(input: BirthChartInput): Promise<BirthChartData> {
    try {
        // Validate input coordinates
        if (isNaN(input.latitude) || isNaN(input.longitude) ||
            input.latitude < -90 || input.latitude > 90 ||
            input.longitude < -180 || input.longitude > 180) {
            throw new Error('Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180')
        }

        // Parse date and time
        const { year, month, day } = parseDate(input.date)
        const { hour, minute } = parseTime(input.time)
        
        // Calculate Julian Day with timezone handling
        const jd = await calculateJulianDay(
            year,
            month,
            day,
            hour,
            minute,
            0, // seconds
            input.latitude,
            input.longitude
        )

        // Calculate planet positions with Swiss Ephemeris
        const positions = await calculatePlanetPositions(jd)

        // Calculate house data with specified or default house system
        const houseData = await calculateHouses(
            jd, 
            input.latitude, 
            input.longitude,
            input.houseSystem || 'PLACIDUS'
        )

        // Transform planet positions into array format with required properties
        const planets: Array<PlanetPosition & { name: string }> = Object.entries(positions).map(([name, data]) => ({
            name,
            longitude: data.longitude,
            latitude: data.latitude,
            distance: data.distance,
            longitudeSpeed: data.longitudeSpeed,
            sign: data.sign as ZodiacSign,
            retrograde: data.retrograde,
            formatted: data.formatted
        }))

        // Transform planets array into record for aspect calculation
        const planetRecord: Record<PlanetName, PlanetPosition> = planets.reduce((acc, planet) => ({
            ...acc,
            [planet.name as PlanetName]: {
                longitude: planet.longitude,
                latitude: planet.latitude,
                distance: planet.distance,
                longitudeSpeed: planet.longitudeSpeed,
                sign: planet.sign,
                retrograde: planet.retrograde,
                formatted: planet.formatted
            }
        }), {} as Record<PlanetName, PlanetPosition>)

        // Calculate aspects between planets
        const aspects = calculateAspects(planetRecord)

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

        // Create the birth chart data
        const birthChartData: BirthChartData = {
            name: input.name,
            location: input.location,
            date: input.date,
            time: input.time,
            planets,
            houses: typedHouseData,
            aspects,
            patterns: [],
            features: [],
            ascendant,
            midheaven
        }

        // Analyze the chart for patterns
        const { patterns } = analyzeBirthChart(birthChartData)
        birthChartData.patterns = patterns

        // Analyze the chart for special features
        birthChartData.features = analyzeSpecialFeatures(birthChartData)

        return birthChartData
    } catch (err) {
        const error = err as Error
        console.error('Birth chart calculation error:', error)
        throw new Error(`Birth chart calculation failed: ${error.message || 'Unknown error'}`)
    }
}
