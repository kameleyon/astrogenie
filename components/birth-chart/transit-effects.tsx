"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { type ZodiacSign } from './zodiac-icon'

interface TransitPlanet {
  name: string
  sign: ZodiacSign
  degree: string
  retrograde?: boolean
  speed?: 'fast' | 'slow' | 'stationary'
}

interface TransitAspect {
  transitPlanet: string
  natalPlanet: string
  type: string
  degree: string
  orb: string
  applying: boolean
  exact?: boolean
}

interface TransitEffect {
  planet: TransitPlanet
  house: number
  aspects: TransitAspect[]
  influence: string
  duration: string
  peakDate?: string
  theme: 'opportunity' | 'challenge' | 'transformation' | 'neutral'
}

interface TransitEffectsProps {
  currentDate: string
  effects: TransitEffect[]
  summary: string
  significantPeriods?: Array<{
    startDate: string
    endDate: string
    description: string
    intensity: 'high' | 'medium' | 'low'
  }>
}

export function TransitEffects({
  currentDate,
  effects,
  summary,
  significantPeriods
}: TransitEffectsProps) {
  const getThemeColor = (theme: string) => {
    switch (theme) {
      case 'opportunity':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
      case 'challenge':
        return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
      case 'transformation':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
      default:
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
    }
  }

  const getAspectSymbol = (type: string) => {
    const symbols = {
      conjunction: '☌',
      opposition: '☍',
      trine: '△',
      square: '□',
      sextile: '⚹'
    }
    return symbols[type.toLowerCase() as keyof typeof symbols] || '•'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="bg-white/5 backdrop-blur-sm rounded-xl p-6 space-y-6"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-futura text-gray-900 dark:text-white">
            Current Transit Effects
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            As of {currentDate}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {summary}
        </p>
      </div>

      {/* Active Transits */}
      <div className="space-y-6">
        {effects.map((effect, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-[#D15200] dark:text-[#FFA600]">
                    {effect.planet.name}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    in {effect.planet.sign} {effect.planet.degree}
                  </span>
                  {effect.planet.retrograde && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      ℞
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  House {effect.house} • {effect.duration}
                  {effect.peakDate && ` • Peak: ${effect.peakDate}`}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getThemeColor(effect.theme)}`}>
                {effect.theme}
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 pl-4">
              {effect.influence}
            </p>

            {/* Transit Aspects */}
            <div className="pl-4 space-y-2">
              {effect.aspects.map((aspect, aspectIndex) => (
                <div
                  key={aspectIndex}
                  className="flex items-center space-x-2 text-sm"
                >
                  <span className="text-[#D15200] dark:text-[#FFA600]">
                    {aspect.transitPlanet}
                  </span>
                  <span className="text-xl leading-none">
                    {getAspectSymbol(aspect.type)}
                  </span>
                  <span className="text-[#D15200] dark:text-[#FFA600]">
                    {aspect.natalPlanet}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                    {aspect.degree} ({aspect.orb}° orb)
                    {aspect.applying ? ' applying' : ' separating'}
                    {aspect.exact && ' - exact'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Significant Periods */}
      {significantPeriods && significantPeriods.length > 0 && (
        <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
            Upcoming Significant Periods
          </h3>
          <div className="space-y-4">
            {significantPeriods.map((period, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-start justify-between"
              >
                <div className="space-y-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {period.startDate} - {period.endDate}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {period.description}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  period.intensity === 'high'
                    ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                    : period.intensity === 'medium'
                    ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                    : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                }`}>
                  {period.intensity}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Transit Types</h4>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-600 dark:text-gray-300">Opportunity</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-gray-600 dark:text-gray-300">Challenge</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-gray-600 dark:text-gray-300">Transformation</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Aspect Types</h4>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-lg">☌</span>
                <span className="text-gray-600 dark:text-gray-300">Conjunction</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg">△</span>
                <span className="text-gray-600 dark:text-gray-300">Trine</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg">□</span>
                <span className="text-gray-600 dark:text-gray-300">Square</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
