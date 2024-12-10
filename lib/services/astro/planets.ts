import moment from 'moment-timezone'
import tzlookup from 'tz-lookup'
import { ZodiacSign, PlanetPosition, HouseData } from '../../types/birth-chart'

// Zodiac signs
const ZODIAC_SIGNS: readonly ZodiacSign[] = [
    "Aries", "Taurus", "Gemini", "Cancer",
    "Leo", "Virgo", "Libra", "Scorpio",
    "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]

/**
 * Format degrees to sign-specific format (0-30° per sign)
 */
function formatDegreeMinute(longitude: number): string {
    // Normalize to 0-360 range
    longitude = ((longitude % 360) + 360) % 360
    
    // Convert to sign-specific degrees (0-30)
    const signDegrees = longitude % 30
    
    // Split into degrees and minutes
    const degrees = Math.floor(signDegrees)
    const minutes = Math.floor((signDegrees - degrees) * 60)
    
    // Ensure two digits for minutes
    const minutesStr = minutes.toString().padStart(2, '0')
    
    return `${degrees}° ${minutesStr}'`
}

/**
 * Get timezone based on coordinates
 */
export function getTimezone(latitude: number, longitude: number): string {
    try {
        const timezone = tzlookup(latitude, longitude)
        if (!timezone) {
            console.warn(`Couldn't determine timezone for lat:${latitude}, lon:${longitude}. Using UTC.`)
            return 'UTC'
        }
        return timezone
    } catch (error) {
        console.warn(`Error finding timezone for lat:${latitude}, lon:${longitude}:`, error)
        return 'UTC'
    }
}

/**
 * Get zodiac sign based on longitude
 */
export function getZodiacSign(longitude: number): ZodiacSign {
    const sign_index = Math.floor((longitude % 360) / 30)
    return ZODIAC_SIGNS[sign_index]
}

/**
 * Calculate planet positions
 */
export async function calculatePlanetPositions(jd: number): Promise<Record<string, PlanetPosition>> {
    const swe = await import('swisseph-v2')
    
    // Initialize Swiss Ephemeris with ephemeris files path
    try {
        swe.swe_set_ephe_path(process.cwd() + '/ephe')
    } catch (error) {
        console.warn('Could not set ephemeris files path:', error)
    }

    return new Promise((resolve, reject) => {
        const positions: Record<string, PlanetPosition> = {}
        const flags = swe.SEFLG_SWIEPH | swe.SEFLG_SPEED

        const calculatePlanet = (planet: string, index: number): Promise<void> => {
            return new Promise((resolveCalc, rejectCalc) => {
                swe.swe_calc_ut(jd, index, flags, (result: any) => {
                    try {
                        if ('error' in result) {
                            console.warn(`Warning calculating ${planet}: ${result.error}`)
                            resolveCalc() // Skip this planet but continue with others
                            return
                        }
                        if (result && 'longitude' in result) {
                            const longitude = result.longitude
                            const longitudeSpeed = result.longitudeSpeed || 0
                            positions[planet] = {
                                longitude,
                                latitude: result.latitude || 0,
                                distance: result.distance || 0,
                                longitudeSpeed,
                                sign: getZodiacSign(longitude),
                                retrograde: longitudeSpeed < 0,
                                formatted: formatDegreeMinute(longitude)
                            }
                        }
                        resolveCalc()
                    } catch (error) {
                        console.warn(`Warning for ${planet}:`, error)
                        resolveCalc() // Skip this planet but continue with others
                    }
                })
            })
        }

        // Core planets that should always be available
        const PLANET_INDICES = {
            Sun: swe.SE_SUN,
            Moon: swe.SE_MOON,
            Mercury: swe.SE_MERCURY,
            Venus: swe.SE_VENUS,
            Mars: swe.SE_MARS,
            Jupiter: swe.SE_JUPITER,
            Saturn: swe.SE_SATURN,
            Uranus: swe.SE_URANUS,
            Neptune: swe.SE_NEPTUNE,
            Pluto: swe.SE_PLUTO,
            NorthNode: swe.SE_TRUE_NODE
        }

        Promise.all(
            Object.entries(PLANET_INDICES).map(([planet, index]) => calculatePlanet(planet, index))
        )
            .then(() => resolve(positions))
            .catch(reject)
    })
}

/**
 * Calculate houses
 */
export async function calculateHouses(jd: number, lat: number, lon: number): Promise<Record<string, HouseData>> {
    const swe = await import('swisseph-v2')
    
    return new Promise((resolve, reject) => {
        const houses: Record<string, HouseData> = {}
        swe.swe_houses(jd, lat, lon, 'P', (result: any) => {
            try {
                if ('error' in result) {
                    throw new Error(`Error calculating houses: ${result.error}`)
                }
                result.house.forEach((cusp: number, i: number) => {
                    houses[`House_${i+1}`] = {
                        cusp,
                        sign: getZodiacSign(cusp),
                        formatted: formatDegreeMinute(cusp)
                    }
                })
                houses['Ascendant'] = { 
                    cusp: result.ascendant, 
                    sign: getZodiacSign(result.ascendant),
                    formatted: formatDegreeMinute(result.ascendant)
                }
                houses['Midheaven'] = { 
                    cusp: result.mc, 
                    sign: getZodiacSign(result.mc),
                    formatted: formatDegreeMinute(result.mc)
                }
                resolve(houses)
            } catch (error) {
                reject(error)
            }
        })
    })
}

export {
    formatDegreeMinute
}
