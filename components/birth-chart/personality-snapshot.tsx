"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { type ZodiacSign } from './zodiac-icon'

interface PersonalityTrait {
  title: string
  description: string
  influence: 'Sun' | 'Moon' | 'Ascendant' | 'Other'
  sign?: ZodiacSign
  house?: number
  strength?: 'strong' | 'moderate' | 'weak'
  keywords?: string[]
}

interface PersonalitySnapshotProps {
  traits: PersonalityTrait[]
  summary: string
  dominantElements?: {
    fire?: number
    earth?: number
    air?: number
    water?: number
  }
  dominantQualities?: {
    cardinal?: number
    fixed?: number
    mutable?: number
  }
}

export function PersonalitySnapshot({ 
  traits, 
  summary, 
  dominantElements,
  dominantQualities 
}: PersonalitySnapshotProps) {
  const getInfluenceColor = (influence: string) => {
    switch (influence) {
      case 'Sun':
        return 'text-yellow-500 dark:text-yellow-400'
      case 'Moon':
        return 'text-blue-500 dark:text-blue-400'
      case 'Ascendant':
        return 'text-purple-500 dark:text-purple-400'
      default:
        return 'text-gray-500 dark:text-gray-400'
    }
  }

  const getStrengthBadge = (strength?: 'strong' | 'moderate' | 'weak') => {
    switch (strength) {
      case 'strong':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
      case 'moderate':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
      case 'weak':
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300'
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-white/5 backdrop-blur-sm rounded-xl p-6 space-y-6"
    >
      <div>
        <h2 className="text-lg font-futura text-gray-900 dark:text-white mb-3">
          Personality Snapshot
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {summary}
        </p>
      </div>

      {/* Core Traits */}
      <div className="space-y-4">
        {traits.map((trait, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-[#D15200] dark:text-[#FFA600]">
                {trait.title}
              </h3>
              <div className="flex items-center space-x-2">
                <span className={`text-xs ${getInfluenceColor(trait.influence)}`}>
                  {trait.influence}
                </span>
                {trait.strength && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStrengthBadge(trait.strength)}`}>
                    {trait.strength}
                  </span>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300">
              {trait.description}
            </p>

            {trait.keywords && (
              <div className="flex flex-wrap gap-2">
                {trait.keywords.map((keyword, keywordIndex) => (
                  <span
                    key={keywordIndex}
                    className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Element & Quality Distribution */}
      <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-200 dark:border-gray-800">
        {/* Elements */}
        {dominantElements && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Dominant Elements
            </h3>
            <div className="space-y-2">
              {Object.entries(dominantElements).map(([element, value]) => value > 0 && (
                <div key={element} className="flex items-center justify-between">
                  <span className="text-sm capitalize text-gray-600 dark:text-gray-300">
                    {element}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(value / 10) * 100}%` }}
                        className="h-full bg-[#FFA600]"
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Qualities */}
        {dominantQualities && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Dominant Qualities
            </h3>
            <div className="space-y-2">
              {Object.entries(dominantQualities).map(([quality, value]) => value > 0 && (
                <div key={quality} className="flex items-center justify-between">
                  <span className="text-sm capitalize text-gray-600 dark:text-gray-300">
                    {quality}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(value / 10) * 100}%` }}
                        className="h-full bg-[#FFA600]"
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
