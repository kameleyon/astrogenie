"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { type ZodiacSign } from './zodiac-icon'

interface House {
  number: number
  sign: ZodiacSign
  degree: string
  startDegree: number
  containingPlanets?: string[]
  ruler?: string
  description?: string
}

interface HousesSectionProps {
  houses: House[]
}

export function HousesSection({ houses }: HousesSectionProps) {
  const getHouseTitle = (number: number) => {
    const titles = {
      1: "Identity & Self-Image",
      2: "Values & Possessions",
      3: "Communication & Learning",
      4: "Home & Family",
      5: "Creativity & Pleasure",
      6: "Work & Health",
      7: "Relationships",
      8: "Transformation & Shared Resources",
      9: "Philosophy & Higher Learning",
      10: "Career & Public Image",
      11: "Friends & Groups",
      12: "Spirituality & Subconscious"
    }
    return titles[number as keyof typeof titles] || `House ${number}`
  }

  // Split houses into two columns
  const leftColumnHouses = houses.slice(0, 6)
  const rightColumnHouses = houses.slice(6)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white/5 backdrop-blur-sm rounded-xl p-6 space-y-4"
    >
      <h2 className="text-lg font-futura text-gray-900 dark:text-white">Houses</h2>
      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {leftColumnHouses.map((house) => (
            <div key={house.number} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-[#D15200] dark:text-[#FFA600] font-medium text-sm">
                    {house.number}° House
                  </span>
                </div>
              </div>
              <div className="pl-4 space-y-1">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {getHouseTitle(house.number)}
                </div>
                <div className="text-sm text-gray-900 dark:text-white">
                  {house.sign} {house.degree}
                </div>
                {house.ruler && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Ruled by {house.ruler}
                  </div>
                )}
                {house.containingPlanets && house.containingPlanets.length > 0 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Planets: {house.containingPlanets.join(", ")}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {rightColumnHouses.map((house) => (
            <div key={house.number} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-[#D15200] dark:text-[#FFA600] font-medium text-sm">
                    {house.number}° House
                  </span>
                </div>
              </div>
              <div className="pl-4 space-y-1">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {getHouseTitle(house.number)}
                </div>
                <div className="text-sm text-gray-900 dark:text-white">
                  {house.sign} {house.degree}
                </div>
                {house.ruler && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Ruled by {house.ruler}
                  </div>
                )}
                {house.containingPlanets && house.containingPlanets.length > 0 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Planets: {house.containingPlanets.join(", ")}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* House Patterns */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          House Patterns
        </h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          {/* Angular Houses (1, 4, 7, 10) */}
          <div>
            <span className="text-[#D15200] dark:text-[#FFA600] font-medium">Angular Houses:</span>
            {" "}Focus on action and initiative
          </div>
          {/* Succedent Houses (2, 5, 8, 11) */}
          <div>
            <span className="text-[#D15200] dark:text-[#FFA600] font-medium">Succedent Houses:</span>
            {" "}Stability and resources
          </div>
          {/* Cadent Houses (3, 6, 9, 12) */}
          <div>
            <span className="text-[#D15200] dark:text-[#FFA600] font-medium">Cadent Houses:</span>
            {" "}Adaptability and learning
          </div>
        </div>
      </div>
    </motion.div>
  )
}
