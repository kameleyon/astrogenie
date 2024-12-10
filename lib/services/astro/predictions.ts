import moment from 'moment'
import { Prediction } from './types'
import { calculatePlanetPositions, calculateAspects } from './calculations'

// Direct port of Python's generate_daily_prediction function
export async function generateDailyPrediction(birth_jd: number, current_jd: number, lat: number, lon: number): Promise<Prediction> {
    try {
        const birth_positions = await calculatePlanetPositions(birth_jd)
        const current_positions = await calculatePlanetPositions(current_jd)
        const aspects = calculateAspects({ ...birth_positions, ...current_positions })

        const prediction: Prediction = {
            date: moment().format('YYYY-MM-DD'),
            general_mood: "Your day looks promising with potential for growth.",
            love: "Communication in relationships is highlighted today.",
            career: "You may encounter new opportunities for advancement.",
            health: "Pay attention to your physical well-being today."
        }

        // Modify predictions based on aspects
        for (const aspect of aspects) {
            if (aspect.planet1 === 'Sun' && aspect.planet2 === 'Moon') {
                prediction.general_mood += ` Your emotions and will are in ${aspect.aspect.toLowerCase()}.`
            } else if (
                (aspect.planet1 === 'Venus' && aspect.planet2 === 'Mars') ||
                (aspect.planet1 === 'Mars' && aspect.planet2 === 'Venus')
            ) {
                prediction.love += ` Passion and romance are ${aspect.aspect.toLowerCase()}.`
            } else if (aspect.planet1 === 'Jupiter' && aspect.planet2 === 'Saturn') {
                prediction.career += ` Balance optimism with practicality in your work (${aspect.aspect.toLowerCase()}).`
            }
        }

        return prediction
    } catch (error) {
        console.error('Error in generate_daily_prediction:', error)
        throw new Error('Failed to generate daily prediction')
    }
}

// Direct port of Python's generate_weekly_prediction function
export async function generateWeeklyPrediction(birth_jd: number, lat: number, lon: number): Promise<Prediction[]> {
    try {
        const predictions: Prediction[] = []
        const current_date = moment()

        // Generate predictions for each day of the week
        for (let i = 0; i < 7; i++) {
            const date = current_date.clone().add(i, 'days')
            const current_jd = date.unix() / 86400.0 + 2440587.5 // Convert Unix timestamp to Julian Day

            const daily_prediction = await generateDailyPrediction(birth_jd, current_jd, lat, lon)
            predictions.push(daily_prediction)
        }

        return predictions
    } catch (error) {
        console.error('Error in generate_weekly_prediction:', error)
        throw new Error('Failed to generate weekly predictions')
    }
}
