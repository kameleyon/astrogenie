"use client"

import React from 'react'
import { motion } from 'framer-motion'

interface Feature {
  title: string
  description: string
  influence?: string
  significance?: 'major' | 'minor' | 'moderate'
  relatedPlanets?: string[]
  details?: {
    type?: string
    degree?: string
    houses?: number[]
  }
}

interface SpecialFeaturesSectionProps {
  features: Feature[]
}

export function SpecialFeaturesSection({ features }: SpecialFeaturesSectionProps) {
  const getSignificanceColor = (significance?: 'major' | 'minor' | 'moderate') => {
    switch (significance) {
      case 'major':
        return 'bg-red-500/10 dark:bg-red-500/20'
      case 'moderate':
        return 'bg-yellow-500/10 dark:bg-yellow-500/20'
      case 'minor':
        return 'bg-blue-500/10 dark:bg-blue-500/20'
      default:
        return 'bg-gray-500/10 dark:bg-gray-500/20'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.7 }}
      className="bg-white/5 backdrop-blur-sm rounded-xl p-6 space-y-4"
    >
      <h2 className="text-lg font-futura text-gray-900 dark:text-white">Special Features</h2>
      
      <div className="space-y-4">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className={`rounded-lg p-4 ${getSignificanceColor(feature.significance)}`}
          >
            <div className="flex items-start justify-between">
              <h3 className="text-[#D15200] dark:text-[#FFA600] font-medium text-sm">
                {feature.title}
              </h3>
              {feature.significance && (
                <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-600 dark:text-gray-300">
                  {feature.significance.charAt(0).toUpperCase() + feature.significance.slice(1)}
                </span>
              )}
            </div>

            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {feature.description}
            </p>

            {feature.influence && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Influence: {feature.influence}
              </p>
            )}

            {feature.relatedPlanets && feature.relatedPlanets.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {feature.relatedPlanets.map((planet) => (
                  <span
                    key={planet}
                    className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-600 dark:text-gray-300"
                  >
                    {planet}
                  </span>
                ))}
              </div>
            )}

            {feature.details && (
              <div className="mt-2 space-y-1">
                {feature.details.type && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Type: {feature.details.type}
                  </p>
                )}
                {feature.details.degree && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Degree: {feature.details.degree}
                  </p>
                )}
                {feature.details.houses && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Houses: {feature.details.houses.join(', ')}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Significance Levels
        </h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-red-500/20" />
            <span className="text-gray-600 dark:text-gray-300">
              Major: Strong influence on life path
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
            <span className="text-gray-600 dark:text-gray-300">
              Moderate: Notable but not dominant influence
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-blue-500/20" />
            <span className="text-gray-600 dark:text-gray-300">
              Minor: Subtle background influence
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
