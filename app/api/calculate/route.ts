import { NextResponse } from 'next/server'
import { calculateBirthChart } from '../../../lib/services/astro/calculator'

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
        } catch (error) {
            return NextResponse.json(
                { error: 'Invalid request body' },
                { status: 400 }
            )
        }

        // Validate required fields
        const requiredFields = ['name', 'date', 'time', 'location', 'latitude', 'longitude']
        for (const field of requiredFields) {
            if (!(field in body)) {
                return NextResponse.json(
                    { error: `Missing required field: ${field}` },
                    { status: 400 }
                )
            }
        }

        // Calculate birth chart
        const birthChartData = await calculateBirthChart(body)

        return NextResponse.json(birthChartData)
    } catch (error) {
        console.error('Error calculating birth chart:', error)

        // If error has details property, pass it along
        if (error instanceof Error && 'details' in error) {
            return NextResponse.json(
                { error: error.message, details: (error as any).details },
                { status: 500 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to calculate birth chart' },
            { status: 500 }
        )
    }
}
