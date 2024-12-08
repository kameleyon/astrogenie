const moment = require('moment-timezone')
const tzlookup = require('tz-lookup')

// Zodiac signs
const ZODIAC_SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer",
    "Leo", "Virgo", "Libra", "Scorpio",
    "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]

/**
 * Format degrees to sign-specific format (0-30° per sign)
 */
function formatDegreeMinute(longitude) {
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
function getTimezone(latitude, longitude) {
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
 * Calculate Julian Day
 */
function calculateJulianDay(year, month, day, hour, minute, second, latitude, longitude) {
    const timezone_str = getTimezone(latitude, longitude)
    const local_time = moment.tz([year, month - 1, day, hour, minute, second], timezone_str)
    const utc_time = local_time.clone().utc()

    // Julian Day calculation
    const Y = utc_time.year()
    const M = utc_time.month() + 1
    const D = utc_time.date()
    const H = utc_time.hours() + utc_time.minutes()/60.0 + utc_time.seconds()/3600.0

    let jd = 367 * Y - Math.floor(7 * (Y + Math.floor((M + 9) / 12)) / 4)
    jd += Math.floor(275 * M / 9) + D + 1721013.5 + H/24
    
    return jd
}

/**
 * Get zodiac sign based on longitude
 */
function getZodiacSign(longitude) {
    // Normalize longitude to 0-360 range
    longitude = ((longitude % 360) + 360) % 360
    const sign_index = Math.floor(longitude / 30)
    return ZODIAC_SIGNS[sign_index]
}

/**
 * Calculate planet positions using simplified formulas
 */
function calculatePlanetPositions(jd) {
    return new Promise((resolve) => {
        // Calculate time in centuries since J2000.0
        const T = (jd - 2451545.0) / 36525.0

        // Mean elements for planets
        const positions = {
            Sun: calculateSunPosition(T),
            Moon: calculateMoonPosition(T),
            Mercury: calculateMercuryPosition(T),
            Venus: calculateVenusPosition(T),
            Mars: calculateMarsPosition(T),
            Jupiter: calculateJupiterPosition(T),
            Saturn: calculateSaturnPosition(T),
            Uranus: calculateUranusPosition(T),
            Neptune: calculateNeptunePosition(T),
            Pluto: calculatePlutoPosition(T)
        }

        resolve(positions)
    })
}

// Individual planet calculations using mean orbital elements
function calculateSunPosition(T) {
    // Mean longitude of the Sun
    let L = 280.46646 + 36000.76983 * T + 0.0003032 * T * T
    L = ((L % 360) + 360) % 360

    // Mean anomaly of the Sun
    let M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T
    M = ((M % 360) + 360) % 360

    // Sun's equation of center
    const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * Math.PI / 180)
            + (0.019993 - 0.000101 * T) * Math.sin(2 * M * Math.PI / 180)
            + 0.000289 * Math.sin(3 * M * Math.PI / 180)

    // Sun's true longitude
    const longitude = ((L + C) % 360 + 360) % 360
    
    return {
        longitude,
        latitude: 0,
        distance: 1.0,
        longitude_speed: 0.9856473,
        sign: getZodiacSign(longitude),
        formatted: formatDegreeMinute(longitude)
    }
}

function calculateMoonPosition(T) {
    // Mean elements of the Moon
    let L = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T
    let M = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T
    let F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T * T
    
    const longitude = ((L + 6.288 * Math.sin(M * Math.PI / 180)
                       + 1.274 * Math.sin((2 * F - M) * Math.PI / 180)
                       + 0.658 * Math.sin(2 * F * Math.PI / 180)) % 360 + 360) % 360
    
    return {
        longitude,
        latitude: 5.128 * Math.sin(F * Math.PI / 180),
        distance: 385000.56,
        longitude_speed: 13.1763581,
        sign: getZodiacSign(longitude),
        formatted: formatDegreeMinute(longitude)
    }
}

// Simplified calculations for other planets
function calculateMercuryPosition(T) {
    const longitude = ((48.3313 + 3.24587E5 * T) % 360 + 360) % 360
    return createPlanetPosition(longitude, 4.0923344)
}

function calculateVenusPosition(T) {
    const longitude = ((76.6799 + 1.24587E5 * T) % 360 + 360) % 360
    return createPlanetPosition(longitude, 1.6021303)
}

function calculateMarsPosition(T) {
    const longitude = ((49.5574 + 6.8998E4 * T) % 360 + 360) % 360
    return createPlanetPosition(longitude, 0.5240207)
}

function calculateJupiterPosition(T) {
    const longitude = ((100.4542 + 1.0987E4 * T) % 360 + 360) % 360
    return createPlanetPosition(longitude, 0.0830853)
}

function calculateSaturnPosition(T) {
    const longitude = ((113.6634 + 4.4502E3 * T) % 360 + 360) % 360
    return createPlanetPosition(longitude, 0.0334557)
}

function calculateUranusPosition(T) {
    const longitude = ((74.0005 + 1.5619E3 * T) % 360 + 360) % 360
    return createPlanetPosition(longitude, 0.011725)
}

function calculateNeptunePosition(T) {
    const longitude = ((131.7806 + 7.9625E2 * T) % 360 + 360) % 360
    return createPlanetPosition(longitude, 0.006019)
}

function calculatePlutoPosition(T) {
    const longitude = ((110.7309 + 5.3739E2 * T) % 360 + 360) % 360
    return createPlanetPosition(longitude, 0.003964)
}

function createPlanetPosition(longitude, speed) {
    const normalizedLongitude = ((longitude % 360) + 360) % 360
    return {
        longitude: normalizedLongitude,
        latitude: 0,
        distance: 1.0,
        longitude_speed: speed,
        sign: getZodiacSign(normalizedLongitude),
        formatted: formatDegreeMinute(normalizedLongitude)
    }
}

/**
 * Calculate house cusps using Placidus system
 */
function calculateHouses(jd, lat, lon) {
    return new Promise((resolve) => {
        // Calculate RAMC (Right Ascension of Midheaven)
        const T = (jd - 2451545.0) / 36525.0
        const GMST = 280.46061837 + 360.98564736629 * (jd - 2451545.0) +
                    0.000387933 * T * T - T * T * T / 38710000.0
        const RAMC = ((GMST + lon) % 360 + 360) % 360

        // Calculate Midheaven
        const obliquity = 23.43929111 - 0.013004167 * T
        const MC = RAMC

        // Calculate Ascendant
        const tanH = -Math.cos(RAMC * Math.PI / 180) /
                    (Math.sin(lat * Math.PI / 180) * Math.tan(obliquity * Math.PI / 180) +
                     Math.cos(lat * Math.PI / 180) * Math.sin(RAMC * Math.PI / 180))
        let ASC = Math.atan(tanH) * 180 / Math.PI
        if (Math.cos(RAMC * Math.PI / 180) > 0) {
            ASC += 180
        }
        ASC = ((ASC % 360) + 360) % 360

        // Calculate other house cusps
        const houses = {}
        for (let i = 1; i <= 12; i++) {
            const cusp = ((ASC + (i - 1) * 30) % 360 + 360) % 360
            houses[`House_${i}`] = {
                cusp,
                sign: getZodiacSign(cusp),
                formatted: formatDegreeMinute(cusp)
            }
        }

        // Add Ascendant and Midheaven
        const normalizedMC = ((MC % 360) + 360) % 360
        houses['Ascendant'] = {
            cusp: ASC,
            sign: getZodiacSign(ASC),
            formatted: formatDegreeMinute(ASC)
        }

        houses['Midheaven'] = {
            cusp: normalizedMC,
            sign: getZodiacSign(normalizedMC),
            formatted: formatDegreeMinute(normalizedMC)
        }

        resolve(houses)
    })
}

/**
 * Calculate aspects between planets
 */
function calculateAspects(planetPositions) {
    const aspects = []
    const aspectTypes = {
        0: ["Conjunction", 10],
        60: ["Sextile", 6],
        90: ["Square", 10],
        120: ["Trine", 10],
        180: ["Opposition", 10]
    }

    const planets = Object.keys(planetPositions)
    for (let i = 0; i < planets.length; i++) {
        for (let j = i + 1; j < planets.length; j++) {
            const planet1 = planets[i]
            const planet2 = planets[j]
            let angle = Math.abs(planetPositions[planet1].longitude - planetPositions[planet2].longitude)
            angle = Math.min(angle, 360 - angle)  // Consider the shorter arc

            for (const [aspectAngleStr, [aspectName, orb]] of Object.entries(aspectTypes)) {
                const aspectAngle = Number(aspectAngleStr)
                if (Math.abs(angle - aspectAngle) <= orb) {
                    aspects.push({
                        planet1,
                        planet2,
                        aspect: aspectName,
                        angle: Number(angle.toFixed(2)),
                        orb: Number(Math.abs(angle - aspectAngle).toFixed(2))
                    })
                    break
                }
            }
        }
    }
    return aspects
}

module.exports = {
    getTimezone,
    calculateJulianDay,
    calculatePlanetPositions,
    calculateHouses,
    calculateAspects,
    formatDegreeMinute
}
