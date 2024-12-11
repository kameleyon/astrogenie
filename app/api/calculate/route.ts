import { NextResponse } from 'next/server'
import { calculateBirthChart } from '../../../lib/services/astro/calculator'

// Mark this route as dynamic and use Node.js runtime
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
    try {
        // Parse request body
        let body: {
            name: string;
            date: string;
            time: string;
            location: string;
            latitude: number;
            longitude: number;
        };

        try {
            body = await request.json()
        } catch (err) {
            const error = err as Error
            return NextResponse.json({
                error: 'Invalid request body format',
                details: error.message
            }, { status: 400 })
        }

        // Validate required fields
        const requiredFields = ['name', 'date', 'time', 'location', 'latitude', 'longitude']
        for (const field of requiredFields) {
            if (!(field in body)) {
                return NextResponse.json({
                    error: 'Missing required field',
                    details: `The field "${field}" is required`
                }, { status: 400 })
            }
        }

        // Validate field values
        if (typeof body.latitude !== 'number' || typeof body.longitude !== 'number') {
            return NextResponse.json({
                error: 'Invalid coordinates',
                details: 'Latitude and longitude must be numbers'
            }, { status: 400 })
        }

        if (body.latitude < -90 || body.latitude > 90) {
            return NextResponse.json({
                error: 'Invalid latitude',
                details: 'Latitude must be between -90 and 90 degrees'
            }, { status: 400 })
        }

        if (body.longitude < -180 || body.longitude > 180) {
            return NextResponse.json({
                error: 'Invalid longitude',
                details: 'Longitude must be between -180 and 180 degrees'
            }, { status: 400 })
        }

        // Validate date format (YYYY-MM-DD or MM/DD/YYYY)
        const dateRegex = /^(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})$/
        if (!dateRegex.test(body.date)) {
            return NextResponse.json({
                error: 'Invalid date format',
                details: 'Date must be in YYYY-MM-DD or MM/DD/YYYY format'
            }, { status: 400 })
        }

        // Validate time format (HH:MM)
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/
        if (!timeRegex.test(body.time)) {
            return NextResponse.json({
                error: 'Invalid time format',
                details: 'Time must be in 24-hour format (HH:MM)'
            }, { status: 400 })
        }

        // Calculate birth chart
        try {
            const birthChartData = await calculateBirthChart(body)
            return NextResponse.json(birthChartData, { status: 200 })
        } catch (err) {
            const error = err as Error
            console.error('Birth chart calculation error:', error)

            // Check for specific error types
            if (error.message.includes('ephemeris')) {
                return NextResponse.json({
                    error: 'Ephemeris data error',
                    details: error.message
                }, { status: 500 })
            }

            if (error.message.includes('timezone')) {
                return NextResponse.json({
                    error: 'Timezone determination error',
                    details: error.message
                }, { status: 500 })
            }

            if (error.message.includes('Julian')) {
                return NextResponse.json({
                    error: 'Date/time conversion error',
                    details: error.message
                }, { status: 500 })
            }

            if (error.message.includes('calculate')) {
                return NextResponse.json({
                    error: 'Planetary calculation error',
                    details: error.message
                }, { status: 500 })
            }

            // Generic error with details
            return NextResponse.json({
                error: 'Birth chart calculation failed',
                details: error.message || 'Unknown error occurred'
            }, { status: 500 })
        }
    } catch (err) {
        // Handle any unexpected errors
        const error = err as Error
        console.error('Unexpected error:', error)
        
        return NextResponse.json({
            error: 'Internal server error',
            details: error.message || 'An unexpected error occurred'
        }, { status: 500 })
    }
}
