"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { type ZodiacSign } from './zodiac-icon'

interface Pattern {
  type: 'major' | 'minor'
  planets: Array<{
    name: string
    sign: ZodiacSign
    degree: string
  }>
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
  description: string
}

interface ChartPatternsProps {
  patterns: Pattern[]
}

export function ChartPatterns({ patterns }: ChartPatternsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-white/5 backdrop-blur-sm rounded-xl p-6 space-y-6"
    >
      <h2 className="text-lg font-futura text-gray-900 dark:text-white">Chart Patterns</h2>
      
      {/* Stellium Section */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <span className="text-[#D15200] dark:text-[#FFA600] text-sm">⊕ Stellium</span>
          <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 px-2 py-0.5 rounded text-xs">
            Major
          </span>
        </div>
        <div className="pl-4 space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            A powerful concentration of planetary energy in Libra
          </p>
          <div className="space-y-1 text-sm text-[#D15200] dark:text-[#FFA600]">
            <div>Jupiter in Virgo 26° 4'</div>
            <div>Ascendant in Virgo 22°</div>
            <div>Saturn in Libra 2° 3'</div>
            <div>Moon in Libra 4° 46'</div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800">Air-2</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800">Earth-2</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800">Cardinal-2</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800">Mutable-2</span>
          </div>
        </div>
      </div>

      {/* T-Square Section */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <span className="text-[#D15200] dark:text-[#FFA600] text-sm">⊡ T-Square</span>
          <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 px-2 py-0.5 rounded text-xs">
            Major
          </span>
        </div>
        <div className="pl-4 space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            A dynamic configuration creating motivation and drive
          </p>
          <div className="space-y-1 text-sm text-[#D15200] dark:text-[#FFA600]">
            <div>Mars in Scorpio 27° 5'</div>
            <div>Venus in Virgo 3° 41'</div>
            <div>Neptune in Sagittarius 20° 16'</div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800">Water-1</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800">Earth-1</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800">Fire-1</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800">Fixed-1</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800">Mutable-2</span>
          </div>
        </div>
      </div>

      {/* Yod Section */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <span className="text-[#D15200] dark:text-[#FFA600] text-sm">⚹ Yod</span>
          <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 px-2 py-0.5 rounded text-xs">
            Major
          </span>
        </div>
        <div className="pl-4 space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Special purpose or spiritual mission configuration
          </p>
          <div className="space-y-1 text-sm text-[#D15200] dark:text-[#FFA600]">
            <div>Chiron in 17° Taurus</div>
            <div>Neptune in 20° Sagittarius</div>
            <div>Sun in 15° Libra</div>
          </div>
        </div>
      </div>

      {/* Pattern Types */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-[#D15200] dark:text-[#FFA600] text-sm font-medium mb-1">Major Patterns</h4>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <li>• Grand Trine</li>
              <li>• Grand Cross</li>
              <li>• Stellium</li>
            </ul>
          </div>
          <div>
            <h4 className="text-[#D15200] dark:text-[#FFA600] text-sm font-medium mb-1">Minor Patterns</h4>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <li>• Mystic Rectangle</li>
              <li>• Stellium</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Special Features */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Special Features</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-300">• The moon was a new moon</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">• The inner planets do not fall in a Fire sign</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">• The bottom right quadrant is empty</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">• Moon, Jupiter, Saturn are rising</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">• Moon is in 10 aspects</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-300">• The chart is a Bundle shape</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">• The Cardinal mode is dominant among the inner planets</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">• Most of the inner planets are located in the left hemisphere, left of the MC-IC axis</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">• The Conjunction aspect occurs the most, a total of 8 times</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
