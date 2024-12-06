"use client"

import React from 'react'
import { motion } from 'framer-motion'

interface Aspect {
  planet1: string
  planet2: string
  type: string
  degree: string
  orb?: string
  nature?: 'harmonious' | 'challenging' | 'neutral'
  description?: string
}

interface AspectsSectionProps {
  aspects: Aspect[]
}

export function AspectsSection({ aspects }: AspectsSectionProps) {
  const getAspectSymbol = (type: string) => {
    const symbols = {
      conjunction: '☌',
      opposition: '☍',
      trine: '△',
      square: '□',
      sextile: '⚹',
      quincunx: '⚻',
      semisextile: '⚺'
    }
    return symbols[type.toLowerCase() as keyof typeof symbols] || '•'
  }

  const getAspectColor = (nature: 'harmonious' | 'challenging' | 'neutral' = 'neutral') => {
    switch (nature) {
      case 'harmonious':
        return 'text-emerald-500 dark:text-emerald-400'
      case 'challenging':
        return 'text-red-500 dark:text-red-400'
      default:
        return 'text-blue-500 dark:text-blue-400'
    }
  }

  const getAspectDescription = (type: string) => {
    const descriptions = {
      conjunction: 'Planets join forces, creating intensity and focus',
      opposition: 'Planets face off, creating tension and awareness',
      trine: 'Planets flow together harmoniously',
      square: 'Planets create dynamic tension and motivation',
      sextile: 'Planets cooperate and create opportunities',
      quincunx: 'Planets require adjustment and adaptation',
      semisextile: 'Planets create subtle connections'
    }
    return descriptions[type.toLowerCase() as keyof typeof descriptions] || ''
  }

  // Group aspects by type
  const groupedAspects = aspects.reduce((acc, aspect) => {
    const type = aspect.type.toLowerCase()
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(aspect)
    return acc
  }, {} as Record<string, Aspect[]>)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-white/5 backdrop-blur-sm rounded-xl p-6 space-y-4"
    >
      <h2 className="text-lg font-futura text-gray-900 dark:text-white">Planetary Aspects</h2>
      
      <div className="space-y-6">
        {Object.entries(groupedAspects).map(([type, typeAspects]) => (
          <div key={type} className="space-y-3">
            <h3 className="text-sm font-medium flex items-center space-x-2">
              <span className="text-[#D15200] dark:text-[#FFA600]">
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
              <span className="text-2xl leading-none">
                {getAspectSymbol(type)}
              </span>
            </h3>
            
            <div className="pl-4 space-y-2">
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {getAspectDescription(type)}
              </p>
              
              {typeAspects.map((aspect, index) => (
                <div 
                  key={`${aspect.planet1}-${aspect.planet2}-${index}`}
                  className="flex items-center space-x-3 text-sm"
                >
                  <span className={getAspectColor(aspect.nature)}>
                    {aspect.planet1}
                  </span>
                  <span className="text-xl leading-none">
                    {getAspectSymbol(type)}
                  </span>
                  <span className={getAspectColor(aspect.nature)}>
                    {aspect.planet2}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                    {aspect.degree}
                    {aspect.orb && ` (orb ${aspect.orb}°)`}
                  </span>
                </div>
              ))}
              
              {typeAspects.map((aspect, index) => (
                aspect.description && (
                  <p 
                    key={`desc-${aspect.planet1}-${aspect.planet2}-${index}`}
                    className="text-xs text-gray-500 dark:text-gray-400 pl-4"
                  >
                    {aspect.description}
                  </p>
                )
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Aspect Patterns */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Major Aspect Patterns
        </h3>
        <div className="space-y-2">
          {/* Grand Trine */}
          <div className="text-sm">
            <span className="text-[#D15200] dark:text-[#FFA600] font-medium">Grand Trine:</span>
            <span className="text-gray-600 dark:text-gray-300 ml-2">
              Three planets form an equilateral triangle (120° each)
            </span>
          </div>
          {/* T-Square */}
          <div className="text-sm">
            <span className="text-[#D15200] dark:text-[#FFA600] font-medium">T-Square:</span>
            <span className="text-gray-600 dark:text-gray-300 ml-2">
              Two planets in opposition, both square to a third
            </span>
          </div>
          {/* Yod */}
          <div className="text-sm">
            <span className="text-[#D15200] dark:text-[#FFA600] font-medium">Yod:</span>
            <span className="text-gray-600 dark:text-gray-300 ml-2">
              Two planets in sextile, both quincunx to a third
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
