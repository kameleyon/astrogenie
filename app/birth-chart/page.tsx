"use client"

import { motion } from "framer-motion"
import { BirthChartForm } from "../../components/birth-chart/birth-chart-form"
import { AstrologicalSymbols } from "../../components/birth-chart/astrological-symbols"
import { BirthChartData } from "../../lib/types/birth-chart"
import { BirthChartResult } from "../../components/birth-chart/birth-chart-result"
import { useState } from "react"

interface FormData {
  name: string
  date: string
  time: string
  location: string
  latitude: number
  longitude: number
}

interface ErrorDetails {
  error: string
  details?: string | Record<string, any>
}

// Type guard to check if response is BirthChartData
function isBirthChartData(data: unknown): data is BirthChartData {
  if (!data || typeof data !== 'object') return false

  const requiredPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars']
  const chartData = data as any

  // Check required properties and their types
  if (!Array.isArray(chartData.planets) ||
      typeof chartData.houses !== 'object' ||
      !Array.isArray(chartData.aspects) ||
      typeof chartData.name !== 'string' ||
      typeof chartData.location !== 'string' ||
      typeof chartData.date !== 'string' ||
      typeof chartData.time !== 'string') {
    return false
  }

  // Check for required planet positions
  const missingPlanets = requiredPlanets.filter(planet => 
    !chartData.planets.some((p: any) => p.name === planet)
  )

  if (missingPlanets.length > 0) {
    console.error(`Missing essential planet positions: ${missingPlanets.join(', ')}`)
    return false
  }

  return true
}

// Type guard to check if response is ErrorDetails
function isErrorDetails(data: unknown): data is ErrorDetails {
  if (!data || typeof data !== 'object') return false
  const errorData = data as any
  return typeof errorData.error === 'string'
}

export default function BirthChart() {
  const [birthChartData, setBirthChartData] = useState<BirthChartData | null>(null)

  const handleFormSubmit = async (formData: FormData) => {
    try {
      // Call the API endpoint
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      // Parse response data
      let data: unknown
      try {
        data = await response.json()
      } catch (err) {
        console.error('Error parsing JSON response:', err)
        throw new Error('Failed to parse server response')
      }

      if (!response.ok) {
        // Handle API error response
        if (isErrorDetails(data)) {
          const errorMessage = data.details 
            ? `${data.error}: ${typeof data.details === 'string' ? data.details : JSON.stringify(data.details)}`
            : data.error

          throw new Error(errorMessage)
        } else {
          throw new Error('Failed to calculate birth chart')
        }
      }

      // Validate response data
      if (!isBirthChartData(data)) {
        throw new Error('Invalid birth chart data returned from server')
      }

      setBirthChartData(data)
    } catch (err) {
      const error = err as Error
      console.error('Error calculating birth chart:', error)

      // Format error message for display
      let errorMessage = error.message
      try {
        // Check if the error message is a JSON string containing details
        const parsed = JSON.parse(error.message)
        errorMessage = typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2)
      } catch {
        // If not JSON, use the error message as is
      }

      throw new Error(errorMessage)
    }
  }

  const handleBack = () => {
    setBirthChartData(null)
  }

  return (
    <>
      {!birthChartData ? (
        <div className="h-[calc(100vh-7.6rem)] flex items-center">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 h-full">
            {/* Left side with gradient and content */}
            <div className="gradient-primary relative h-full flex items-center">
              <AstrologicalSymbols />
              <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12 z-10">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1 }}
                  className="font-futura text-2xl md:text-3xl lg:text-4xl font-normal text-center text-white mb-4"
                >
                  Create Your Astrology Birth Chart
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 1 }}
                  className="font-lato text-white/70 text-center text-sm md:text-base max-w-2xl mx-auto"
                >
                  Create your personalized birth chart using precise astrological calculations. Discover your unique planetary positions, aspects, and cosmic patterns.
                </motion.p>
              </div>
            </div>

            {/* Right side with form */}
            <div className="h-full flex items-center justify-center bg-background">
              <div className="w-full max-w-md px-4">
                <h2 className="text-xl font-futura mb-4 text-center text-gray-900 dark:text-white">Fill out the form</h2>
                <div className="text-gray-900 dark:text-white">
                  <BirthChartForm onSubmit={handleFormSubmit} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <BirthChartResult data={birthChartData} onBack={handleBack} />
      )}
    </>
  )
}
