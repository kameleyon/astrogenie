"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
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

interface BirthChartResultProps {
  data: BirthChartData
  onBack: () => void
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
              <PlanetsSection planets={data.planets} />
            </div>
            <div className="shadow-lg shadow-black/20 rounded-xl">
              <HousesSection houses={data.houses} />
            </div>
          </div>

          {/* Center Column */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="sticky top-4 space-y-6">
              <div className="shadow-lg shadow-black/20 rounded-xl">
                <InteractiveWheel
                  houses={data.houses}
                  planets={data.planets}
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
              <PatternsSection patterns={data.patterns} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
