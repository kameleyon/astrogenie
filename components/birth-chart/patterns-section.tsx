"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { type ZodiacSign } from './zodiac-icon'

interface Pattern {
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

interface PatternsSectionProps {
  patterns: Pattern[]
}

export function PatternsSection({ patterns }: PatternsSectionProps) {
  const getPatternIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'grand trine':
        return '△'
      case 'grand cross':
        return '✚'
      case 't-square':
        return '⊥'
      case 'yod':
        return '⚸'
      case 'stellium':
        return '☍'
      case 'mystic rectangle':
        return '⬚'
      default:
        return '◇'
    }
  }

  const getElementColor = (element: string) => {
    switch (element.toLowerCase()) {
      case 'fire':
        return 'text-red-500 dark:text-red-400'
      case 'earth':
        return 'text-green-500 dark:text-green-400'
      case 'air':
        return 'text-yellow-500 dark:text-yellow-400'
      case 'water':
        return 'text-blue-500 dark:text-blue-400'
      default:
        return 'text-gray-500 dark:text-gray-400'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8 }}
      className="bg-white/5 backdrop-blur-sm rounded-xl p-6 space-y-4"
    >
      <h2 className="text-lg font-futura text-gray-900 dark:text-white">Chart Patterns</h2>
      
      <div className="space-y-6">
        {patterns.map((pattern, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl text-[#D15200] dark:text-[#FFA600]">
                  {getPatternIcon(pattern.name)}
                </span>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {pattern.name}
                </h3>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                pattern.type === 'major' 
                  ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                  : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
              }`}>
                {pattern.type.charAt(0).toUpperCase() + pattern.type.slice(1)}
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300">
              {pattern.description}
            </p>

            <div className="pl-4 space-y-2">
              {/* Involved Planets */}
              <div className="space-y-1">
                {pattern.planets.map((planet, planetIndex) => (
                  <div 
                    key={planetIndex}
                    className="text-sm flex items-center space-x-2"
                  >
                    <span className="text-[#D15200] dark:text-[#FFA600]">
                      {planet.name}
                    </span>
                    <span className="text-gray-400">in</span>
                    <span>{planet.sign}</span>
                    <span className="text-gray-500">{planet.degree}</span>
                    {planet.house && (
                      <>
                        <span className="text-gray-400">House</span>
                        <span>{planet.house}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Elements Distribution */}
              {pattern.elements && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(pattern.elements).map(([element, count]) => count > 0 && (
                    <span
                      key={element}
                      className={`text-xs px-2 py-1 rounded-full bg-white/10 ${getElementColor(element)}`}
                    >
                      {element.charAt(0).toUpperCase() + element.slice(1)}: {count}
                    </span>
                  ))}
                </div>
              )}

              {/* Qualities Distribution */}
              {pattern.qualities && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(pattern.qualities).map(([quality, count]) => count > 0 && (
                    <span
                      key={quality}
                      className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-600 dark:text-gray-300"
                    >
                      {quality.charAt(0).toUpperCase() + quality.slice(1)}: {count}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {pattern.interpretation && (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                {pattern.interpretation}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Pattern Types Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Pattern Types
        </h3>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <h4 className="font-medium text-[#D15200] dark:text-[#FFA600]">Major Patterns</h4>
            <ul className="mt-1 space-y-1 text-gray-600 dark:text-gray-300">
              <li>• Grand Trine</li>
              <li>• Grand Cross</li>
              <li>• T-Square</li>
              <li>• Yod</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-[#D15200] dark:text-[#FFA600]">Minor Patterns</h4>
            <ul className="mt-1 space-y-1 text-gray-600 dark:text-gray-300">
              <li>• Stellium</li>
              <li>• Mystic Rectangle</li>
              <li>• Kite</li>
              <li>• Cradle</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
