const swe = require('swisseph-v2')
const moment = require('moment-timezone')
const tzlookup = require('tz-lookup')

// Zodiac signs
const ZODIAC_SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer",
    "Leo", "Virgo", "Libra", "Scorpio",
    "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]

// Direct port of Python's get_timezone function
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

// Direct port of Python's calculate_julian_day function
function calculateJulianDay(year, month, day, hour, minute, second, latitude, longitude) {
    const timezone_str = getTimezone(latitude, longitude)
    const local_time = moment.tz([year, month - 1, day, hour, minute, second], timezone_str)
    const utc_time = local_time.clone().utc()

    const jd = swe.swe_julday(
        utc_time.year(),
        utc_time.month() + 1,
        utc_time.date(),
        utc_time.hours() + utc_time.minutes()/60.0 + utc_time.seconds()/3600.0,
        swe.SE_GREG_CAL
    )
    console.debug(`Julian Day: ${jd}`)
    return jd
}

// Direct port of Python's get_zodiac_sign function
function getZodiacSign(longitude) {
    const sign_index = Math.floor(longitude / 30)
    console.debug(`Longitude: ${longitude}, Sign: ${ZODIAC_SIGNS[sign_index]}`)
    return ZODIAC_SIGNS[sign_index]
}

// Direct port of Python's calculate_sun_sign function
function calculateSunSign(jd) {
    return new Promise((resolve, reject) => {
        const flags = swe.SEFLG_SWIEPH | swe.SEFLG_SPEED
        swe.swe_calc_ut(jd, swe.SE_SUN, flags, (result) => {
            if ('error' in result) {
                reject(new Error(`Error calculating sun sign: ${result.error}`))
                return
            }
            console.debug(`Sun position:`, result)
            resolve(getZodiacSign(result.longitude))
        })
    })
}

// Direct port of Python's calculate_moon_sign function
function calculateMoonSign(jd) {
    return new Promise((resolve, reject) => {
        const flags = swe.SEFLG_SWIEPH | swe.SEFLG_SPEED
        swe.swe_calc_ut(jd, swe.SE_MOON, flags, (result) => {
            if ('error' in result) {
                reject(new Error(`Error calculating moon sign: ${result.error}`))
                return
            }
            console.debug(`Moon position:`, result)
            resolve(getZodiacSign(result.longitude))
        })
    })
}

// Direct port of Python's calculate_ascendant function
function calculateAscendant(jd, lat, lon) {
    return new Promise((resolve, reject) => {
        swe.swe_houses(jd, lat, lon, 'P', (result) => {
            if ('error' in result) {
                reject(new Error(`Error calculating ascendant: ${result.error}`))
                return
            }
            console.debug(`Ascendant: ${result.ascendant}`)
            resolve(getZodiacSign(result.ascendant))
        })
    })
}

// Direct port of Python's calculate_planet_positions function
function calculatePlanetPositions(jd) {
    return new Promise((resolve, reject) => {
        const positions = {}
        const flags = swe.SEFLG_SWIEPH | swe.SEFLG_SPEED

        const calculatePlanet = (planet, index) => {
            return new Promise((resolveCalc, rejectCalc) => {
                swe.swe_calc_ut(jd, index, flags, (result) => {
                    if ('error' in result) {
                        rejectCalc(new Error(`Error calculating ${planet}: ${result.error}`))
                        return
                    }
                    if (result && 'longitude' in result) {
                        positions[planet] = {
                            longitude: result.longitude,
                            latitude: result.latitude,
                            distance: result.distance,
                            longitude_speed: result.longitudeSpeed,
                            sign: getZodiacSign(result.longitude)
                        }
                    } else {
                        console.warn(`Unexpected result for planet ${planet}:`, result)
                    }
                    resolveCalc()
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
            Pluto: swe.SE_PLUTO
        }

        Promise.all(
            Object.entries(PLANET_INDICES).map(([planet, index]) => calculatePlanet(planet, index))
        )
            .then(() => resolve(positions))
            .catch(reject)
    })
}

// Direct port of Python's calculate_houses function
function calculateHouses(jd, lat, lon) {
    return new Promise((resolve, reject) => {
        const houses = {}
        swe.swe_houses(jd, lat, lon, 'P', (result) => {
            try {
                if ('error' in result) {
                    throw new Error(`Error calculating houses: ${result.error}`)
                }
                result.house.forEach((cusp, i) => {
                    houses[`House_${i+1}`] = {
                        cusp,
                        sign: getZodiacSign(cusp)
                    }
                })
                houses['Ascendant'] = { cusp: result.ascendant, sign: getZodiacSign(result.ascendant) }
                houses['Midheaven'] = { cusp: result.mc, sign: getZodiacSign(result.mc) }
                resolve(houses)
            } catch (error) {
                reject(error)
            }
        })
    })
}

// Direct port of Python's calculate_aspects function
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

// Initialize Swiss Ephemeris with ephemeris files path
try {
    swe.swe_set_ephe_path(process.cwd() + '/ephe')
} catch (error) {
    console.warn('Could not set ephemeris files path:', error)
}

module.exports = {
    getTimezone,
    calculateJulianDay,
    calculateSunSign,
    calculateMoonSign,
    calculateAscendant,
    calculatePlanetPositions,
    calculateHouses,
    calculateAspects
}
