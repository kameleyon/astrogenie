"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { type ZodiacSign } from './zodiac-icon'

interface CompatibilityFactor {
  planet: string
  sign: ZodiacSign
  house: number
  influence: string
  strength: 'strong' | 'moderate' | 'weak'
}

interface CompatibilityMatch {
  sign: ZodiacSign
  score: number
  reason: string
  elements?: {
    fire?: number
    earth?: number
    air?: number
    water?: number
  }
}

interface CompatibilitySectionProps {
  bestMatches: CompatibilityMatch[]
  challengingMatches: CompatibilityMatch[]
  keyFactors: CompatibilityFactor[]
  generalAdvice: string
}

export function CompatibilitySection({
  bestMatches,
  challengingMatches,
  keyFactors,
  generalAdvice
}: CompatibilitySectionProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-500 dark:text-green-400'
    if (score >= 6) return 'text-yellow-500 dark:text-yellow-400'
    return 'text-red-500 dark:text-red-400'
  }

  const getStrengthColor = (strength: 'strong' | 'moderate' | 'weak') => {
    switch (strength) {
      case 'strong':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
      case 'moderate':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
      case 'weak':
        return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
    }
  }

  const renderMatchList = (matches: CompatibilityMatch[], title: string, good: boolean) => (
    <div>
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
        {title}
      </h3>
      <div className="space-y-4">
        {matches.map((match, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: good ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#D15200] dark:text-[#FFA600]">
                {match.sign}
              </span>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${getScoreColor(match.score)}`}>
                  {match.score}/10
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {match.reason}
            </p>
            {match.elements && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(match.elements).map(([element, value]) => value > 0 && (
                  <span
                    key={element}
                    className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                  >
                    {element}: {value}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="bg-white/5 backdrop-blur-sm rounded-xl p-6 space-y-6"
    >
      <div>
        <h2 className="text-lg font-futura text-gray-900 dark:text-white mb-3">
          Compatibility Overview
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {generalAdvice}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderMatchList(bestMatches, "Best Matches", true)}
        {renderMatchList(challengingMatches, "Challenging Matches", false)}
      </div>

      {/* Key Compatibility Factors */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
          Key Compatibility Factors
        </h3>
        <div className="space-y-4">
          {keyFactors.map((factor, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-start justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-[#D15200] dark:text-[#FFA600]">
                    {factor.planet}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    in {factor.sign} (House {factor.house})
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {factor.influence}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getStrengthColor(factor.strength)}`}>
                {factor.strength}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-600 dark:text-gray-300">High Compatibility</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-gray-600 dark:text-gray-300">Moderate Compatibility</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-600 dark:text-gray-300">Challenging Compatibility</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
