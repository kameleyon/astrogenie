"use client"

import { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import { generateWelcomeMessage } from '@/lib/services/openrouter'
import { BirthChartData } from '@/lib/types/birth-chart'

interface WelcomeMessageProps {
  name: string
  data: BirthChartData
}

export function WelcomeMessage({ name, data }: WelcomeMessageProps) {
  const [message, setMessage] = useState<string>('')
  const [loading, setLoading] = useState(true)

  // Get Sun, Moon, and Ascendant signs
  const sunPlanet = data.planets.find(p => p.name === 'Sun')
  const moonPlanet = data.planets.find(p => p.name === 'Moon')
  const ascSign = data.houses[0]?.sign // First house cusp is the Ascendant

  useEffect(() => {
    async function generateMessage() {
      try {
        // Get significant features from patterns and other chart features
        const significantFeatures = [
          // Include any patterns from the data
          ...data.patterns.map(pattern => ({
            type: pattern.name,
            description: pattern.description
          })),
          // Add any stelliums (3+ planets in one sign)
          ...findStelliums(data.planets)
        ]

        // Generate the welcome message
        const welcomeMessage = await generateWelcomeMessage(
          name,
          sunPlanet?.sign || 'Unknown',
          moonPlanet?.sign || 'Unknown',
          ascSign || 'Unknown',
          significantFeatures
        )

        setMessage(welcomeMessage)
      } catch (error) {
        console.error('Error generating welcome message:', error)
        setMessage('Error generating welcome message. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    generateMessage()
  }, [name, data, sunPlanet, moonPlanet, ascSign])

  return (
    <Card className="p-6 space-y-4 shadow-lg shadow-black/20">
      {loading ? (
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-5/6 mb-4"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-2xl font-futura">
            Hello, {name}! 👋
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-base leading-relaxed">
              Welcome to your personalized birth chart! Your chart shows a fascinating blend of energies, with your {sunPlanet?.sign} Sun, {moonPlanet?.sign} Moon, and {ascSign} Ascendant creating a unique cosmic signature.
            </p>
            <p className="text-base leading-relaxed">
              {message}
            </p>
          </div>
        </div>
      )}
    </Card>
  )
}

/**
 * Find stelliums (3 or more planets in the same sign)
 */
function findStelliums(planets: BirthChartData['planets']) {
  const planetsBySign = planets.reduce((acc, planet) => {
    acc[planet.sign] = (acc[planet.sign] || []).concat(planet.name)
    return acc
  }, {} as Record<string, string[]>)

  const stelliums = []
  for (const [sign, planets] of Object.entries(planetsBySign)) {
    if (planets.length >= 3) {
      stelliums.push({
        type: 'Stellium',
        description: `${planets.length} planets in ${sign}: ${planets.join(', ')}`
      })
    }
  }

  return stelliums
}
