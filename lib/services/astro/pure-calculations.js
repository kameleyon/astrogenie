const {
    getTimezone,
    calculateJulianDay,
    calculateSunSign,
    calculateMoonSign,
    calculateAscendant,
    calculatePlanetPositions,
    calculateHouses,
    calculateAspects
} = require('./calculations')

const { PlanetPosition, HouseData, AspectData } = require('./types')

async function testCalculations(year, month, day, hour, minute, second, latitude, longitude) {
    try {
       
        const birthData = {
            year,
            month,
            day,
            hour,
            minute,
            second,
            latitude,
            longitude
        }

        console.log('Birth Data:')
        console.log(`Date: ${month}/${day}/${year}`)
        console.log(`Time: ${hour}:${minute} ${hour < 12 ? 'AM' : 'PM'}`)
        console.log(`Coordinates: ${birthData.latitude}°N, ${Math.abs(birthData.longitude)}°W`)

        // Get timezone
        const timezone = getTimezone(birthData.latitude, birthData.longitude)
        console.log(`Timezone: ${timezone}`)

        // Calculate Julian Day
        const jd = calculateJulianDay(
            birthData.year,
            birthData.month,
            birthData.day,
            birthData.hour,
            birthData.minute,
            birthData.second,
            birthData.latitude,
            birthData.longitude
        )
        console.log('Julian Day:', jd)

        // Calculate Sun Sign
        console.log('\nCalculating Sun sign...')
        const sunSign = await calculateSunSign(jd)
        console.log('Sun Sign:', sunSign)

        // Calculate Moon Sign
        console.log('\nCalculating Moon sign...')
        const moonSign = await calculateMoonSign(jd)
        console.log('Moon Sign:', moonSign)

        // Calculate Ascendant
        console.log('\nCalculating Ascendant...')
        const ascendant = await calculateAscendant(jd, birthData.latitude, birthData.longitude)
        console.log('Ascendant:', ascendant)

        // Calculate Planet Positions
        console.log('\nCalculating planetary positions...')
        const positions = await calculatePlanetPositions(jd)
        console.log('\nPlanetary Positions:')
        Object.entries(positions).forEach(([planet, data]) => {
            console.log(`${planet}: ${data.longitude.toFixed(2)}° ${data.sign} ${data.longitude_speed < 0 ? '(R)' : ''}`)
        })

        // Calculate Houses
        console.log('\nCalculating house data...')
        const houses = await calculateHouses(jd, birthData.latitude, birthData.longitude)
        console.log('\nHouse Cusps:')
        Object.entries(houses)
            .filter(([key]) => key.startsWith('House_'))
            .sort((a, b) => {
                const numA = parseInt(a[0].split('_')[1])
                const numB = parseInt(b[0].split('_')[1])
                return numA - numB
            })
            .forEach(([house, data]) => {
                console.log(`${house}: ${data.cusp.toFixed(2)}° ${data.sign}`)
            })

        // Calculate Aspects
        console.log('\nCalculating aspects...')
        const aspects = calculateAspects(positions)
        console.log('\nMajor Aspects:')
        aspects
            .sort((a, b) => a.orb - b.orb)
            .forEach(aspect => {
                console.log(`${aspect.planet1} ${aspect.aspect} ${aspect.planet2} (orb: ${aspect.orb}°)`)
            })

        // Return all calculated data
        return {
            timezone,
            julianDay: jd,
            sunSign,
            moonSign,
            ascendant,
            positions,
            houses,
            aspects
        }

    } catch (error) {
        console.error('Error in test calculations:', error)
        throw error
    }
}

// Re-export the functions that calculator.ts needs
module.exports = {
    testCalculations,
    getTimezone,
    calculateJulianDay,
    calculatePlanetPositions,
    calculateHouses,
    calculateAspects
}
