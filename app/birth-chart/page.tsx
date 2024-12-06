"use client"
import './../globals.css'
import { motion } from "framer-motion"
import { BirthChartForm } from "@/components/birth-chart/birth-chart-form"
import { AstrologicalSymbols } from "@/components/birth-chart/astrological-symbols"
import { BirthChartData } from "@/lib/types/birth-chart"
import { BirthChartWheel } from "@/components/birth-chart/birth-chart-wheel"
import { useState } from "react"

export default function BirthChart() {
  const [birthChartData, setBirthChartData] = useState<BirthChartData | null>(null)

  return (
    <div className="min-h-screen flex items-center">
      <div className="w-full grid grid-cols-1 md:grid-cols-2">
        {/* Left side with gradient and content */}
        <div className="gradient-primary relative min-h-screen flex items-center">
          <AstrologicalSymbols />
          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12 z-10">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="font-futura text-3xl md:text-4xl font-normal text-center text-white mb-6"
            >
              Create Your Astrology Birth Chart
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 1 }}
              className="font-lato text-white/70 text-center max-w-md mx-auto"
            >
              Create your personalized birth chart for free by filling out the form. Discover our tools for interactive planets, asteroids, house systems, orbs, declinations, and more to suit your preferences.
            </motion.p>
          </div>
        </div>

        {/* Right side with form */}
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-full max-w-md font-lato">
            <h2 className="text-2xl font-futura mb-6 text-center text-gray-900 dark:text-white">Fill out the form</h2>
            <div className="text-gray-900 dark:text-white">
              <BirthChartForm onSubmit={setBirthChartData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
