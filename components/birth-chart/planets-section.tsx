"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { type ZodiacSign } from './zodiac-icon'

interface Planet {
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

interface PlanetsSectionProps {
  planets: Planet[]
}

export function PlanetsSection({ planets }: PlanetsSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white/5 backdrop-blur-sm rounded-xl p-6 space-y-4"
    >
      <h2 className="text-lg font-futura text-gray-900 dark:text-white">Planetary Positions</h2>
      <div className="space-y-3">
        {planets.map((planet) => (
          <div key={planet.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-[#D15200] dark:text-[#FFA600] font-medium text-sm">
                  {planet.name}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">in</span>
                <span className="text-gray-900 dark:text-white text-sm">
                  {planet.sign} {planet.degree}
                </span>
              </div>
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                House {planet.house}
              </span>
            </div>
            {planet.retrograde && (
              <div className="text-xs text-gray-500 dark:text-gray-400 pl-4">
                Retrograde
              </div>
            )}
            {planet.aspects && planet.aspects.length > 0 && (
              <div className="pl-4 space-y-1">
                {planet.aspects.map((aspect, index) => (
                  <div 
                    key={`${planet.name}-${aspect.planet}-${index}`}
                    className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-2"
                  >
                    <span>{aspect.type}</span>
                    <span>{aspect.planet}</span>
                    <span>({aspect.degree}°)</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  )
}
