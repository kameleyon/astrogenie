"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { InteractiveWheel } from './interactive-wheel'
import { PlanetsSection } from './planets-section'
import { HousesSection } from './houses-section'
import { AspectsSection } from './aspects-section'
import { SpecialFeaturesSection } from './special-features-section'
import { PatternsSection } from './patterns-section'
import { PersonalitySnapshot } from './personality-snapshot'
import { CompatibilitySection } from './compatibility-section'
import { TransitEffects } from './transit-effects'
import type { BirthChartData, Planet, House, Pattern } from '@/lib/types/birth-chart'

// Sample data for testing
const sampleData: BirthChartData = {
  name: "Jo",
  location: "Les Salines, Parròquia d'Ordino, Andorra",
  date: "Oct. 8, 1980",
  time: "5:10 AM",
  planets: [
    { name: "Sun", sign: "Libra", degree: "15° 2'", house: 1 },
    { name: "Moon", sign: "Libra", degree: "4° 46'", house: 1 },
    { name: "Mercury", sign: "Scorpio", degree: "9° 53'", house: 2 },
    { name: "Venus", sign: "Virgo", degree: "3° 41'", house: 12 },
    { name: "Mars", sign: "Scorpio", degree: "27° 5'", house: 2 },
    { name: "Jupiter", sign: "Virgo", degree: "26° 4'", house: 12 },
    { name: "Saturn", sign: "Libra", degree: "2° 3'", house: 1 },
    { name: "Uranus", sign: "Scorpio", degree: "23° 27'", house: 2 },
    { name: "Neptune", sign: "Sagittarius", degree: "20° 16'", house: 3 },
    { name: "Pluto", sign: "Libra", degree: "21° 25'", house: 1 }
  ] as Planet[],
  houses: [
    { number: 1, sign: "Virgo", degree: "22°", startDegree: 0, containingPlanets: ["Sun", "Moon", "Jupiter", "Saturn"] },
    { number: 2, sign: "Libra", degree: "18°", startDegree: 30, containingPlanets: ["Mercury", "Pluto"] },
    { number: 3, sign: "Scorpio", degree: "17°", startDegree: 60, containingPlanets: ["Mars", "Uranus", "Neptune"] },
    { number: 4, sign: "Sagittarius", degree: "21°", startDegree: 90 },
    { number: 5, sign: "Capricorn", degree: "25°", startDegree: 120 },
    { number: 6, sign: "Aquarius", degree: "28°", startDegree: 150 },
    { number: 7, sign: "Pisces", degree: "22°", startDegree: 180 },
    { number: 8, sign: "Aries", degree: "18°", startDegree: 210 },
    { number: 9, sign: "Taurus", degree: "17°", startDegree: 240, containingPlanets: ["Chiron"] },
    { number: 10, sign: "Gemini", degree: "21°", startDegree: 270 },
    { number: 11, sign: "Cancer", degree: "25°", startDegree: 300, containingPlanets: ["North Node"] },
    { number: 12, sign: "Leo", degree: "26°", startDegree: 330, containingPlanets: ["Venus"] }
  ] as House[],
  aspects: [],
  patterns: [
    {
      name: "Stellium",
      type: "major",
      description: "A powerful concentration of planetary energy in Libra",
      planets: [
        { name: "Jupiter", sign: "Virgo", degree: "26° 4'" },
        { name: "Ascendant", sign: "Virgo", degree: "22°" },
        { name: "Saturn", sign: "Libra", degree: "2° 3'" },
        { name: "Moon", sign: "Libra", degree: "4° 46'" }
      ],
      elements: {
        air: 2,
        earth: 2
      },
      qualities: {
        cardinal: 2,
        mutable: 2
      },
      interpretation: "This Stellium indicates a strong focus on relationships and harmony in your life"
    },
    {
      name: "T-Square",
      type: "major",
      description: "A dynamic configuration creating motivation and drive",
      planets: [
        { name: "Mars", sign: "Scorpio", degree: "27° 5'" },
        { name: "Venus", sign: "Virgo", degree: "3° 41'" },
        { name: "Neptune", sign: "Sagittarius", degree: "20° 16'" }
      ],
      elements: {
        water: 1,
        earth: 1,
        fire: 1
      },
      qualities: {
        fixed: 1,
        mutable: 2
      },
      interpretation: "This T-Square suggests a need to balance personal desires with spiritual aspirations"
    }
  ] as Pattern[]
}

export function BirthChartResult() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="mb-4">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg md:text-xl font-futura mb-1"
          >
            {sampleData.name}&apos;s Birth Chart
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 dark:text-gray-400 text-sm"
          >
            {sampleData.location}
          </motion.p>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-500 dark:text-gray-400 text-sm"
          >
            {sampleData.date} at {sampleData.time}
          </motion.p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-3 space-y-6 order-3 lg:order-1">
            <PlanetsSection planets={sampleData.planets} />
            <HousesSection houses={sampleData.houses} />
          </div>

          {/* Center Column */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="sticky top-4 space-y-6">
              <InteractiveWheel
                houses={sampleData.houses}
                planets={sampleData.planets}
              />
              <PersonalitySnapshot
                traits={[
                  {
                    title: "Leadership Style",
                    description: "Natural diplomat with strong sense of justice",
                    influence: "Sun",
                    strength: "strong",
                    keywords: ["balanced", "harmonious", "fair-minded"]
                  },
                  {
                    title: "Emotional Nature",
                    description: "Deeply sensitive to harmony in relationships",
                    influence: "Moon",
                    strength: "moderate",
                    keywords: ["empathetic", "peace-loving", "diplomatic"]
                  }
                ]}
                summary="Your chart shows a strong emphasis on harmony and balance, with a particular focus on relationships and social interactions."
                dominantElements={{
                  air: 4,
                  earth: 3,
                  fire: 2,
                  water: 1
                }}
                dominantQualities={{
                  cardinal: 5,
                  fixed: 2,
                  mutable: 3
                }}
              />
              <AspectsSection aspects={sampleData.aspects} />
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-3 space-y-6 order-2 lg:order-3">
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
                  house: 9,
                  aspects: [
                    {
                      transitPlanet: "Jupiter",
                      natalPlanet: "Venus",
                      type: "trine",
                      degree: "120°",
                      orb: "2",
                      applying: true
                    }
                  ],
                  influence: "Period of expansion in education or travel",
                  duration: "2 months",
                  theme: "opportunity"
                }
              ]}
              summary="Current transits suggest a period of growth and expansion, particularly in areas of personal development and learning."
              significantPeriods={[
                {
                  startDate: "Feb 1, 2024",
                  endDate: "Mar 15, 2024",
                  description: "Jupiter trine Venus brings opportunities for growth",
                  intensity: "high"
                }
              ]}
            />
            <CompatibilitySection
              bestMatches={[
                {
                  sign: "Gemini",
                  score: 9,
                  reason: "Strong air sign compatibility enhances communication",
                  elements: { air: 3 }
                },
                {
                  sign: "Aquarius",
                  score: 8,
                  reason: "Intellectual connection and shared ideals",
                  elements: { air: 3 }
                }
              ]}
              challengingMatches={[
                {
                  sign: "Cancer",
                  score: 5,
                  reason: "Different approaches to emotional expression",
                  elements: { water: 3 }
                },
                {
                  sign: "Capricorn",
                  score: 6,
                  reason: "May need to balance practicality with harmony",
                  elements: { earth: 3 }
                }
              ]}
              keyFactors={[
                {
                  planet: "Venus",
                  sign: "Virgo",
                  house: 12,
                  influence: "Seeks perfection in relationships",
                  strength: "strong"
                }
              ]}
              generalAdvice="Your chart indicates a natural ability to create harmony in relationships, with a particular strength in diplomatic communication."
            />
            <PatternsSection patterns={sampleData.patterns} />
          </div>
        </div>
      </div>
    </div>
  )
}
