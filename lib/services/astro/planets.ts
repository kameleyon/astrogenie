import { ZodiacSign, PlanetPosition, HouseData } from '../../types/birth-chart'

// Zodiac signs
const ZODIAC_SIGNS: readonly ZodiacSign[] = [
    "Aries", "Taurus", "Gemini", "Cancer",
    "Leo", "Virgo", "Libra", "Scorpio",
    "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]

// House systems supported by Swiss Ephemeris
export const HOUSE_SYSTEMS = {
    PLACIDUS: 'P',
    KOCH: 'K',
    PORPHYRIUS: 'O',
    REGIOMONTANUS: 'R',
    CAMPANUS: 'C',
    EQUAL: 'E',
    WHOLE_SIGN: 'W',
    MERIDIAN: 'X',
    MORINUS: 'M',
    HORIZONTAL: 'H',
    POLICH_PAGE: 'T',
    ALCABITIUS: 'B',
    GAUQUELIN: 'G'
} as const

/**
 * Format degrees to sign-specific format (0-30° per sign)
 */
function formatDegreeMinute(longitude: number): string {
    if (typeof longitude !== 'number' || isNaN(longitude)) {
        throw new Error('Invalid longitude value for formatting')
    }
    
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
export async function getTimezone(latitude: number, longitude: number): Promise<string> {
    if (typeof latitude !== 'number' || typeof longitude !== 'number' ||
        isNaN(latitude) || isNaN(longitude)) {
        throw new Error('Invalid coordinates for timezone lookup')
    }

    try {
        const tzlookup = (await import('tz-lookup')).default
        const timezone = tzlookup(latitude, longitude)
        if (!timezone) {
            throw new Error(`Invalid coordinates: lat:${latitude}, lon:${longitude}`)
        }
        return timezone
    } catch (err) {
        const error = err as Error
        throw new Error(`Failed to determine timezone: ${error.message || 'Unknown error'}`)
    }
}

/**
 * Get zodiac sign based on longitude
 */
export function getZodiacSign(longitude: number): ZodiacSign {
    if (typeof longitude !== 'number' || isNaN(longitude)) {
        throw new Error('Invalid longitude value for zodiac sign calculation')
    }
    const sign_index = Math.floor((longitude % 360) / 30)
    return ZODIAC_SIGNS[sign_index]
}

/**
 * Initialize Swiss Ephemeris with proper error handling
 */
async function initializeSwissEph() {
    try {
        const [swe, { default: fs }, { default: path }] = await Promise.all([
            import('swisseph-v2'),
            import('fs'),
            import('path')
        ])

        const ephePath = path.join(process.cwd(), 'ephe')
        
        // Check if ephemeris directory exists
        if (!fs.existsSync(ephePath)) {
            fs.mkdirSync(ephePath, { recursive: true })
        }

        // Check if required files exist
        const requiredFiles = ['seas_18.se1', 'semo_18.se1', 'sepl_18.se1']
        const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join(ephePath, file)))
        
        if (missingFiles.length > 0) {
            throw new Error(`Missing required ephemeris files: ${missingFiles.join(', ')}. Please run download-ephe.js to download these files.`)
        }

        swe.swe_set_ephe_path(ephePath)
        return swe
    } catch (err) {
        const error = err as Error
        throw new Error(`Swiss Ephemeris initialization failed: ${error.message || 'Unknown error'}`)
    }
}

/**
 * Calculate planet positions with extended options
 */
export async function calculatePlanetPositions(
    jd: number,
    flags: number = 0
): Promise<Record<string, PlanetPosition>> {
    if (typeof jd !== 'number' || isNaN(jd)) {
        throw new Error('Invalid Julian Day value')
    }

    let swe: any
    try {
        swe = await initializeSwissEph()
    } catch (err) {
        const error = err as Error
        throw new Error(`Failed to initialize Swiss Ephemeris: ${error.message || 'Unknown error'}`)
    }
    
    return new Promise((resolve, reject) => {
        const positions: Record<string, PlanetPosition> = {}
        const calcFlags = (flags || swe.SEFLG_SWIEPH) | swe.SEFLG_SPEED
        const errors: string[] = []

        const calculatePlanet = (planet: string, index: number): Promise<void> => {
            return new Promise((resolveCalc, rejectCalc) => {
                swe.swe_calc_ut(jd, index, calcFlags, (result: any) => {
                    if (!result) {
                        errors.push(`${planet}: Calculation failed - no result`)
                        resolveCalc()
                        return
                    }

                    if ('error' in result) {
                        errors.push(`${planet}: ${result.error}`)
                        resolveCalc()
                        return
                    }

                    if (!('longitude' in result) || typeof result.longitude !== 'number' || isNaN(result.longitude)) {
                        errors.push(`${planet}: Invalid longitude value`)
                        resolveCalc()
                        return
                    }

                    try {
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
                        resolveCalc()
                    } catch (err) {
                        const error = err as Error
                        errors.push(`${planet}: ${error.message || 'Unknown error'}`)
                        resolveCalc()
                    }
                })
            })
        }

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
            NorthNode: swe.SE_TRUE_NODE,
            Chiron: swe.SE_CHIRON
        }

        Promise.all(
            Object.entries(PLANET_INDICES).map(([planet, index]) => calculatePlanet(planet, index))
        )
            .then(() => {
                // Check if we have at least the essential planets
                const essentialPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars']
                const missingEssentials = essentialPlanets.filter(p => !positions[p])
                
                if (missingEssentials.length > 0) {
                    reject(new Error(
                        `Failed to calculate essential planets: ${missingEssentials.join(', ')}. ` +
                        `Errors: ${errors.join('; ')}`
                    ))
                    return
                }

                // Verify all calculated positions have valid longitudes
                for (const [planet, position] of Object.entries(positions)) {
                    if (typeof position.longitude !== 'number' || isNaN(position.longitude)) {
                        reject(new Error(`Invalid longitude value for ${planet}`))
                        return
                    }
                }

                // If we have essential planets but some others failed, continue with warning
                if (errors.length > 0) {
                    console.warn('Some planet calculations had issues:', errors)
                }

                resolve(positions)
            })
            .catch(err => {
                const error = err as Error
                reject(new Error(`Planet calculation failed: ${error.message || 'Unknown error'}`))
            })
    })
}

/**
 * Calculate houses with configurable house system
 */
export async function calculateHouses(
    jd: number,
    lat: number,
    lon: number,
    houseSystem: keyof typeof HOUSE_SYSTEMS = 'PLACIDUS'
): Promise<Record<string, HouseData>> {
    if (typeof jd !== 'number' || isNaN(jd)) {
        throw new Error('Invalid Julian Day value for house calculation')
    }

    if (typeof lat !== 'number' || isNaN(lat) || typeof lon !== 'number' || isNaN(lon)) {
        throw new Error('Invalid coordinates for house calculation')
    }

    let swe: any
    try {
        swe = await initializeSwissEph()
    } catch (err) {
        const error = err as Error
        throw new Error(`Failed to initialize Swiss Ephemeris for house calculation: ${error.message || 'Unknown error'}`)
    }
    
    return new Promise((resolve, reject) => {
        const houses: Record<string, HouseData> = {}
        const hsys = HOUSE_SYSTEMS[houseSystem]

        swe.swe_houses(jd, lat, lon, hsys, (result: any) => {
            try {
                if (!result) {
                    throw new Error('House calculation failed - no result')
                }

                if ('error' in result) {
                    throw new Error(`House calculation error: ${result.error}`)
                }

                if (!result.house || !Array.isArray(result.house)) {
                    throw new Error('Invalid house calculation result')
                }

                result.house.forEach((cusp: number, i: number) => {
                    if (typeof cusp !== 'number' || isNaN(cusp)) {
                        throw new Error(`Invalid cusp value for house ${i + 1}`)
                    }

                    houses[`House_${i+1}`] = {
                        cusp,
                        sign: getZodiacSign(cusp),
                        formatted: formatDegreeMinute(cusp)
                    }
                })

                if (!('ascendant' in result) || !('mc' in result)) {
                    throw new Error('Missing Ascendant or Midheaven in house calculation')
                }

                if (typeof result.ascendant !== 'number' || isNaN(result.ascendant) ||
                    typeof result.mc !== 'number' || isNaN(result.mc)) {
                    throw new Error('Invalid Ascendant or Midheaven values')
                }

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
            } catch (err) {
                const error = err as Error
                reject(new Error(`House calculation failed: ${error.message || 'Unknown error'}`))
            }
        })
    })
}

export {
    formatDegreeMinute
}
