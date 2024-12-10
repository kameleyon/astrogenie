"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { AspectData } from '../../lib/types/birth-chart'

interface AspectsSectionProps {
  aspects: AspectData[]
}

interface AspectDisplay {
  symbol: string
  aspect: string
  orb: number
  color?: string
}

export function AspectsSection({ aspects }: AspectsSectionProps) {
  const majorAspects: AspectDisplay[] = [
    { symbol: "□", aspect: "North Node Square Chiron", orb: 0, color: "text-red-500" },
    { symbol: "△", aspect: "Pluto Trine MC", orb: 0, color: "text-blue-500" },
    { symbol: "⚹", aspect: "Neptune Sextile Pluto", orb: 1, color: "text-green-500" },
    { symbol: "⚹", aspect: "Uranus Sextile Ascendant", orb: 1, color: "text-green-500" },
    { symbol: "⚹", aspect: "Mars Sextile Jupiter", orb: 1, color: "text-green-500" },
    { symbol: "⚹", aspect: "Sun Sextile North Node", orb: 2, color: "text-green-500" },
    { symbol: "□", aspect: "Neptune Square Ascendant", orb: 2, color: "text-red-500" },
    { symbol: "☍", aspect: "Neptune Opposition MC", orb: 2, color: "text-orange-500" },
    { symbol: "☌", aspect: "Moon Conjunction Saturn", orb: 2, color: "text-purple-500" },
    { symbol: "⚹", aspect: "Jupiter Sextile Uranus", orb: 3, color: "text-green-500" },
    { symbol: "△", aspect: "Neptune Trine North Node", orb: 3, color: "text-blue-500" },
    { symbol: "⚹", aspect: "North Node Sextile MC", orb: 4, color: "text-green-500" },
    { symbol: "⚹", aspect: "Pluto Sextile North Node", orb: 4, color: "text-green-500" },
    { symbol: "☌", aspect: "Jupiter Conjunction Ascendant", orb: 4, color: "text-purple-500" },
    { symbol: "☌", aspect: "Jupiter Conjunction Saturn", orb: 6, color: "text-purple-500" },
    { symbol: "☌", aspect: "Sun Conjunction Pluto", orb: 8, color: "text-purple-500" }
  ]

  const minorAspects: AspectDisplay[] = [
    { symbol: "⚼", aspect: "Saturn Sesquiquadrate Chiron", orb: 0, color: "text-gray-500" },
    { symbol: "∠", aspect: "Saturn Octile North Node", orb: 0, color: "text-gray-500" },
    { symbol: "⚸", aspect: "Saturn Septile Uranus", orb: 0, color: "text-gray-500" },
    { symbol: "⚸", aspect: "Venus Quintile MC", orb: 0, color: "text-gray-500" },
    { symbol: "⚺", aspect: "Venus Semi-sextile Saturn", orb: 1, color: "text-gray-500" },
    { symbol: "⚺", aspect: "Moon Semi-sextile Venus", orb: 1, color: "text-gray-500" },
    { symbol: "⚼", aspect: "Moon Sesquiquadrate Chiron", orb: 2, color: "text-gray-500" },
    { symbol: "⚻", aspect: "Uranus Quincunx MC", orb: 2, color: "text-gray-500" },
    { symbol: "∠", aspect: "Sun Octile Mars", orb: 2, color: "text-gray-500" },
    { symbol: "⚼", aspect: "Moon Sesquiquadrate Chiron", orb: 2, color: "text-gray-500" },
    { symbol: "∠", aspect: "Moon Octile Venus", orb: 2, color: "text-gray-500" },
    { symbol: "⚸", aspect: "Sun Quintile Mars", orb: 3, color: "text-gray-500" },
    { symbol: "∠", aspect: "Venus Octile Pluto", orb: 3, color: "text-gray-500" },
    { symbol: "⚺", aspect: "Chiron Semi-sextile MC", orb: 4, color: "text-gray-500" }
  ]

  const renderAspectColumns = (aspects: AspectDisplay[]) => {
    const halfLength = Math.ceil(aspects.length / 2)
    const leftColumn = aspects.slice(0, halfLength)
    const rightColumn = aspects.slice(halfLength)

    return (
      <div className="grid grid-cols-2 gap-x-6">
        {/* Left Column */}
        <div className="space-y-2">
          {leftColumn.map((aspect, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className={`text-lg leading-none ${aspect.color || 'text-gray-500'}`}>
                {aspect.symbol}
              </span>
              <span className="text-sm">{aspect.aspect}</span>
              <span className="text-xs text-gray-500">orb: {aspect.orb}°</span>
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div className="space-y-2">
          {rightColumn.map((aspect, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className={`text-lg leading-none ${aspect.color || 'text-gray-500'}`}>
                {aspect.symbol}
              </span>
              <span className="text-sm">{aspect.aspect}</span>
              <span className="text-xs text-gray-500">orb: {aspect.orb}°</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-white/5 backdrop-blur-sm rounded-xl p-6 space-y-4 shadow-lg shadow-black/20"
    >
      <h2 className="text-lg font-futura text-gray-900 dark:text-white">Aspects</h2>
      
      <p className="text-sm text-gray-600 dark:text-gray-300">
        The aspects describe the geometric angles between the planets. Each shape they produce has a different meaning.
      </p>

      {/* Major Aspects */}
      {renderAspectColumns(majorAspects)}

      {/* Minor Aspects */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Minor Aspects</h3>
        {renderAspectColumns(minorAspects)}
      </div>

      {/* Legend */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Aspect Types
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-lg text-purple-500">☌</span>
            <span className="text-gray-600 dark:text-gray-300">Conjunction</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg text-red-500">□</span>
            <span className="text-gray-600 dark:text-gray-300">Square</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg text-blue-500">△</span>
            <span className="text-gray-600 dark:text-gray-300">Trine</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg text-green-500">⚹</span>
            <span className="text-gray-600 dark:text-gray-300">Sextile</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg text-orange-500">☍</span>
            <span className="text-gray-600 dark:text-gray-300">Opposition</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg text-gray-500">⚺</span>
            <span className="text-gray-600 dark:text-gray-300">Semi-sextile</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg text-gray-500">⚼</span>
            <span className="text-gray-600 dark:text-gray-300">Sesquiquadrate</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg text-gray-500">⚸</span>
            <span className="text-gray-600 dark:text-gray-300">Quintile</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg text-gray-500">∠</span>
            <span className="text-gray-600 dark:text-gray-300">Octile</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
