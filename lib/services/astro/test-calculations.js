const {
    getTimezone,
    calculateJulianDay,
    calculatePlanetPositions,
    calculateHouses,
    calculateAspects
} = require('./calculations')

async function testCalculations() {
    try {
        // Test data: October 8, 1980, 5:20 AM in Les Cayes, Haiti
        const birthData = {
            year: 1980,
            month: 10,
            day: 8,
            hour: 5,
            minute: 20,
            second: 0,
            latitude: 18.2,  // 18.2° N
            longitude: -73.7 // 73.7° W
        }

        console.log('Birth Data:')
        console.log('Date: October 8, 1980')
        console.log('Time: 5:20 AM')
        console.log('Location: Les Cayes, Haiti')
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

        // Calculate Planet Positions
        console.log('\nCalculating planetary positions...')
        const positions = await calculatePlanetPositions(jd)
        console.log('\nPlanetary Positions:')
        Object.entries(positions)
            .sort(([a], [b]) => {
                const order = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'NorthNode']
                return order.indexOf(a) - order.indexOf(b)
            })
            .forEach(([planet, data]) => {
                console.log(`${planet} in ${data.formatted} ${data.sign}${data.longitude_speed < 0 ? ' (R)' : ''}`)
            })

        // Calculate Houses
        console.log('\nCalculating house data...')
        const houses = await calculateHouses(jd, birthData.latitude, birthData.longitude)
        
        console.log('\nMain Points:')
        console.log(`Ascendant in ${houses['Ascendant'].formatted} ${houses['Ascendant'].sign}`)
        console.log(`MC in ${houses['Midheaven'].formatted} ${houses['Midheaven'].sign}`)
        
        console.log('\nHouse Cusps:')
        Object.entries(houses)
            .filter(([key]) => key.startsWith('House_'))
            .sort((a, b) => {
                const numA = parseInt(a[0].split('_')[1])
                const numB = parseInt(b[0].split('_')[1])
                return numA - numB
            })
            .forEach(([house, data]) => {
                console.log(`${house} in ${data.formatted} ${data.sign}`)
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

    } catch (error) {
        console.error('Error in test calculations:', error)
    }
}

// Run the test
testCalculations()
