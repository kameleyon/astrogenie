import { NextResponse } from 'next/server'
import { calculateBirthChart } from '@/lib/services/astro/calculator'

export async function POST(request: Request) {
    try {
        // Parse request body
        let body;
        try {
            body = await request.json()
        } catch (error) {
            return NextResponse.json(
                { error: 'Invalid JSON in request body' },
                { status: 400 }
            )
        }
        
        // Validate required fields
        const requiredFields = ['name', 'date', 'time', 'location', 'latitude', 'longitude']
        const missingFields = requiredFields.filter(field => !(field in body))
        
        if (missingFields.length > 0) {
            return NextResponse.json(
                { error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            )
        }

        // Validate numeric fields
        const latitude = parseFloat(body.latitude)
        const longitude = parseFloat(body.longitude)

        if (isNaN(latitude) || isNaN(longitude)) {
            return NextResponse.json(
                { error: 'Latitude and longitude must be valid numbers' },
                { status: 400 }
            )
        }

        // Calculate birth chart
        const birthChart = await calculateBirthChart({
            name: body.name,
            date: body.date,
            time: body.time,
            location: body.location,
            latitude,
            longitude
        })

        // Return the calculated birth chart with proper headers
        return new NextResponse(JSON.stringify(birthChart, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        })

    } catch (error: any) {
        console.error('Error calculating birth chart:', error)
        
        // Handle specific error types
        if (error.message.includes('Invalid date format')) {
            return NextResponse.json(
                { error: 'Invalid date format. Use MM/DD/YYYY or YYYY-MM-DD' },
                { status: 400 }
            )
        }
        
        if (error.message.includes('Invalid time format')) {
            return NextResponse.json(
                { error: 'Invalid time format. Use HH:MM (24-hour format)' },
                { status: 400 }
            )
        }

        // Generic error response
        return NextResponse.json(
            { error: error.message || 'Error calculating birth chart' },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json(
        { error: 'POST method required' },
        { status: 405 }
    )
}
