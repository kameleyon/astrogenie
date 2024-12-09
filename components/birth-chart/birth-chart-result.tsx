"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { InteractiveWheel } from './interactive-wheel'
import { PlanetsSection } from './planets-section'
import { HousesSection } from './houses-section'
import { AspectsSection } from './aspects-section'
import { SpecialFeaturesSection } from './special-features-section'
import { PatternsSection } from './patterns-section'
import { PersonalitySnapshot } from './personality-snapshot'
import { CompatibilitySection } from './compatibility-section'
import { TransitEffects } from './transit-effects'
import { WelcomeMessage } from './welcome-message'
import type { BirthChartData } from '@/lib/types/birth-chart'
import type { ZodiacSign } from './zodiac-icon'

interface BirthChartResultProps {
  data: BirthChartData
  onBack: () => void
}

// Component interfaces
interface ComponentPlanet {
  name: string
  sign: ZodiacSign
  degree: string
  house: number
  retrograde?: boolean
  aspects?: Array<{
    planet: string
    type: string
    degree: string
  }>
}

interface ComponentPattern {
  name: string
  type: 'major' | 'minor'
  planets: Array<{
    name: string
    sign: ZodiacSign
    degree: string
    house?: number
  }>
  description: string
  interpretation?: string
  elements?: {
    fire?: number
    earth?: number
    air?: number
    water?: number
  }
  qualities?: {
    cardinal?: number
    fixed?: number
    mutable?: number
  }
  houses?: number[]
}

export function BirthChartResult({ data, onBack }: BirthChartResultProps) {
  // Convert numbers to percentage strings
  const toPercentage = (value: number) => `${(value * 10)}%`

  // Convert element values to percentage strings
  const convertElements = (elements: { [key: string]: number }) => {
    const result: { [key: string]: string } = {}
    for (const [key, value] of Object.entries(elements)) {
      result[key] = toPercentage(value)
    }
    return result
  }

  // Transform planets data into the format expected by components
  const transformPlanets = () => {
    const planetData = data.planets.map(planet => {
      // Find which house contains this planet
      const house = Object.entries(data.houses).find(([key, houseData]) => {
        if (!key.startsWith('House_')) return false
        
        const houseNumber = parseInt(key.split('_')[1])
        const nextHouseNumber = (houseNumber % 12) + 1
        const nextHouseKey = `House_${nextHouseNumber}`
        
        const houseCusp = houseData.cusp
        const nextHouseCusp = data.houses[nextHouseKey].cusp
        
        if (nextHouseCusp > houseCusp) {
          return planet.longitude >= houseCusp && planet.longitude < nextHouseCusp
        } else {
          // Handle case when house spans 0° Aries
          return planet.longitude >= houseCusp || planet.longitude < nextHouseCusp
        }
      })

      const houseNumber = house ? parseInt(house[0].split('_')[1]) : 1

      // Find aspects for this planet
      const planetAspects = data.aspects
        .filter(aspect => aspect.planet1 === planet.name || aspect.planet2 === planet.name)
        .map(aspect => ({
          planet: aspect.planet1 === planet.name ? aspect.planet2 : aspect.planet1,
          type: aspect.aspect.toLowerCase(),
          degree: aspect.angle.toString()
        }))

      return {
        name: planet.name,
        sign: planet.sign,
        degree: planet.formatted,
        house: houseNumber,
        retrograde: planet.retrograde,
        aspects: planetAspects
      }
    })

    // Add Ascendant and Midheaven
    const ascendant = {
      name: 'ASC',
      sign: data.ascendant.sign,
      degree: data.ascendant.formatted,
      house: 1,
      retrograde: false
    }

    const midheaven = {
      name: 'MC',
      sign: data.midheaven.sign,
      degree: data.midheaven.formatted,
      house: 10,
      retrograde: false
    }

    // Return all planets plus ASC and MC
    return [...planetData, ascendant, midheaven]
  }

  // Transform houses data into the format expected by components
  const transformHouses = () => {
    const houseNumbers = Array.from({ length: 12 }, (_, i) => i + 1)
    return houseNumbers.map(number => {
      const houseKey = `House_${number}`
      const houseData = data.houses[houseKey]
      return {
        number,
        sign: houseData.sign,
        degree: houseData.formatted,
        startDegree: houseData.cusp,
        // Find planets in this house
        containingPlanets: data.planets
          .filter(planet => {
            const planetDegree = planet.longitude
            const nextHouseKey = `House_${(number % 12) + 1}`
            const nextHouseCusp = data.houses[nextHouseKey].cusp
            const houseCusp = houseData.cusp
            
            if (nextHouseCusp > houseCusp) {
              return planetDegree >= houseCusp && planetDegree < nextHouseCusp
            } else {
              // Handle case when house spans 0° Aries
              return planetDegree >= houseCusp || planetDegree < nextHouseCusp
            }
          })
          .map(planet => planet.name)
      }
    })
  }

  // Transform patterns data into the format expected by PatternsSection
  const transformPatterns = (): ComponentPattern[] => {
    return data.patterns.map(pattern => ({
      name: pattern.name,
      type: pattern.planets.length > 3 ? 'major' : 'minor',
      planets: pattern.planets.map(planetName => {
        const planet = data.planets.find(p => p.name === planetName)!
        const house = transformPlanets().find(p => p.name === planetName)?.house
        return {
          name: planetName,
          sign: planet.sign,
          degree: planet.formatted,
          house
        }
      }),
      description: pattern.description
    }))
  }

  // Transform data for InteractiveWheel
  const wheelHouses = transformHouses()
  const wheelPlanets = transformPlanets()

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg md:text-xl font-futura mb-1"
            >
              {data.name}&apos;s Birth Chart
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-500 dark:text-gray-400 text-sm"
            >
              {data.location}
            </motion.p>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-500 dark:text-gray-400 text-sm"
            >
              {data.date} at {data.time}
            </motion.p>
          </div>
          <Button 
            onClick={onBack}
            variant="outline"
            className="text-sm"
          >
            Back to Form
          </Button>
        </div>

        {/* Welcome Message */}
        <div className="mb-8">
          <div className="shadow-lg shadow-black/20 rounded-xl">
            <WelcomeMessage name={data.name} data={data} />
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-3 space-y-6 order-3 lg:order-1">
            <div className="shadow-lg shadow-black/20 rounded-xl">
              <PlanetsSection planets={wheelPlanets} />
            </div>
            <div className="shadow-lg shadow-black/20 rounded-xl">
              <HousesSection houses={wheelHouses} />
            </div>
          </div>

          {/* Center Column */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="sticky top-4 space-y-6">
              <div className="shadow-lg shadow-black/20 rounded-xl">
                <InteractiveWheel
                  houses={wheelHouses}
                  planets={wheelPlanets}
                />
              </div>
              <div className="shadow-lg shadow-black/20 rounded-xl">
                <PersonalitySnapshot
                  traits={[
                    {
                      title: "Leadership Style",
                      description: "Diplomatic and balanced with a strong drive for justice",
                      influence: "Sun",
                      strength: "strong",
                      keywords: ["fair-minded", "harmonious", "idealistic"]
                    },
                    {
                      title: "Emotional Nature",
                      description: "Deep, intense, and transformative",
                      influence: "Moon",
                      strength: "strong",
                      keywords: ["passionate", "perceptive", "resourceful"]
                    }
                  ]}
                  summary="Your chart shows a fascinating blend of diplomatic Air energy and intense Water influence, creating a personality that combines social grace with emotional depth."
                  dominantElements={{
                    fire: toPercentage(3),
                    earth: toPercentage(2),
                    air: toPercentage(2),
                    water: toPercentage(3)
                  }}
                  dominantQualities={{
                    cardinal: toPercentage(3),
                    fixed: toPercentage(2),
                    mutable: toPercentage(5)
                  }}
                />
              </div>
              <div className="shadow-lg shadow-black/20 rounded-xl">
                <AspectsSection aspects={data.aspects} />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-3 space-y-6 order-2 lg:order-3">
            <div className="shadow-lg shadow-black/20 rounded-xl">
              <TransitEffects
                currentDate="January 15, 2024"
                effects={[
                  {
                    planet: {
                      name: "Jupiter",
                      sign: "Taurus",
                      degree: "5°",
                      retrograde: false
                    },
                    house: 8,
                    aspects: [
                      {
                        transitPlanet: "Jupiter",
                        natalPlanet: "Moon",
                        type: "trine",
                        degree: "120°",
                        orb: "2°",
                        applying: true
                      }
                    ],
                    influence: "Period of emotional growth and intuitive development",
                    duration: "2 months",
                    theme: "transformation"
                  }
                ]}
                summary="Current transits highlight themes of personal transformation and emotional growth."
                significantPeriods={[
                  {
                    startDate: "Feb 1, 2024",
                    endDate: "Mar 15, 2024",
                    description: "Jupiter trine Moon brings emotional expansion and spiritual growth",
                    intensity: "high"
                  }
                ]}
              />
            </div>
            <div className="shadow-lg shadow-black/20 rounded-xl">
              <CompatibilitySection
                bestMatches={[
                  {
                    sign: "Aquarius",
                    score: 9,
                    reason: "Intellectual connection and shared ideals",
                    elements: convertElements({ air: 3 })
                  },
                  {
                    sign: "Leo",
                    score: 8,
                    reason: "Balancing opposition creates dynamic attraction",
                    elements: convertElements({ fire: 3 })
                  }
                ]}
                challengingMatches={[
                  {
                    sign: "Cancer",
                    score: 5,
                    reason: "Different approaches to emotional expression",
                    elements: convertElements({ water: 3 })
                  },
                  {
                    sign: "Capricorn",
                    score: 6,
                    reason: "May need to balance practicality with harmony",
                    elements: convertElements({ earth: 3 })
                  }
                ]}
                keyFactors={[
                  {
                    planet: "Venus",
                    sign: "Leo",
                    house: 11,
                    influence: "Attracts through warmth and creativity",
                    strength: "strong"
                  }
                ]}
                generalAdvice="Your chart indicates a natural ability to create harmony in relationships, with a particular strength in balancing personal needs with those of others."
              />
            </div>
            <div className="shadow-lg shadow-black/20 rounded-xl">
              <PatternsSection patterns={transformPatterns()} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
