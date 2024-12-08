import { NextResponse } from 'next/server'
import { calculateBirthChart } from '@/lib/services/astro/calculator'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { name, date, time, location, latitude, longitude } = data

    // Validate input
    const errors = []
    if (!name) errors.push('Name is required')
    if (!date) errors.push('Date is required')
    if (!time) errors.push('Time is required')
    if (!location) errors.push('Location is required')
    if (latitude === undefined) errors.push('Latitude is required')
    if (longitude === undefined) errors.push('Longitude is required')

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      )
    }

    // Validate date format (MM/DD/YYYY or YYYY-MM-DD)
    const dateRegex = /^(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})$/
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use MM/DD/YYYY or YYYY-MM-DD' },
        { status: 400 }
      )
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(time)) {
      return NextResponse.json(
        { error: 'Invalid time format. Use HH:MM (24-hour format)' },
        { status: 400 }
      )
    }

    // Validate coordinates
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json(
        { error: 'Coordinates must be numbers' },
        { status: 400 }
      )
    }

    if (latitude < -90 || latitude > 90) {
      return NextResponse.json(
        { error: 'Latitude must be between -90 and 90 degrees' },
        { status: 400 }
      )
    }

    if (longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Longitude must be between -180 and 180 degrees' },
        { status: 400 }
      )
    }

    // Calculate birth chart
    try {
      const birthChart = await calculateBirthChart({
        name,
        date,
        time,
        location,
        latitude,
        longitude
      })

      return NextResponse.json(birthChart)
    } catch (error) {
      console.error('Error in birth chart calculation:', error)
      return NextResponse.json(
        { 
          error: 'Birth chart calculation failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { 
        error: 'API request failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Add CORS headers for development
export async function OPTIONS(request: Request) {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  )
}
