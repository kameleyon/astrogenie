"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ZodiacIcon, type ZodiacSign } from './zodiac-icon'

interface InteractiveWheelProps {
  houses: Array<{
    number: number
    sign: ZodiacSign
    degree: string
    startDegree: number
    containingPlanets?: string[]
  }>
  planets: Array<{
    name: string
    sign: ZodiacSign
    degree: string
    house: number
  }>
}

interface TooltipProps {
  x: number
  y: number
  children: React.ReactNode
}

function Tooltip({ x, y, children }: TooltipProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="absolute z-50 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 rounded-lg shadow-lg text-sm"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -120%)'
      }}
    >
      {children}
      <div 
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-white dark:bg-gray-900"
      />
    </motion.div>
  )
}

export function InteractiveWheel({ houses, planets }: InteractiveWheelProps) {
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null)
  const [selectedHouse, setSelectedHouse] = useState<number | null>(null)
  const [tooltipInfo, setTooltipInfo] = useState<{ x: number, y: number, content: React.ReactNode } | null>(null)

  // Convert degrees to radians for SVG calculations
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180
  
  // Parse degree string to number for calculations
  const parseDegree = (degree: string) => {
    const match = degree.match(/(\d+)°\s*(\d+)?'?/)
    if (!match) return 0
    const degrees = parseInt(match[1])
    const minutes = match[2] ? parseInt(match[2]) / 60 : 0
    return degrees + minutes
  }
  
  // Calculate position on circle
  const getPointOnCircle = (centerX: number, centerY: number, radius: number, degrees: number) => {
    const radians = toRadians(degrees - 90) // Subtract 90 to start at top
    return {
      x: centerX + radius * Math.cos(radians),
      y: centerY + radius * Math.sin(radians)
    }
  }

  // SVG viewBox dimensions
  const size = 600 // Increased size
  const center = size / 2
  const outerRadius = size * 0.4 // Reduced to leave more space for labels
  const middleRadius = outerRadius * 0.85
  const innerRadius = outerRadius * 0.7
  const planetRadius = innerRadius * 0.75 // Adjusted for better positioning

  // Handle hover events
  const handlePlanetHover = (
    event: React.MouseEvent,
    planet: { name: string; sign: ZodiacSign; degree: string; house: number }
  ) => {
    const rect = (event.target as SVGElement).getBoundingClientRect()
    setTooltipInfo({
      x: rect.left + rect.width / 2,
      y: rect.top,
      content: (
        <div className="space-y-1">
          <div className="font-medium">{planet.name}</div>
          <div>{planet.degree} {planet.sign}</div>
          <div className="text-gray-500">House {planet.house}</div>
        </div>
      )
    })
  }

  const handleHouseHover = (
    event: React.MouseEvent,
    house: {
      number: number
      sign: ZodiacSign
      degree: string
      containingPlanets?: string[]
    }
  ) => {
    const rect = (event.target as SVGElement).getBoundingClientRect()
    setTooltipInfo({
      x: rect.left + rect.width / 2,
      y: rect.top,
      content: (
        <div className="space-y-1">
          <div className="font-medium">House {house.number}</div>
          <div>{house.degree} {house.sign}</div>
          {house.containingPlanets && (
            <div className="text-gray-500">
              Contains: {house.containingPlanets.join(", ")}
            </div>
          )}
        </div>
      )
    })
  }

  // Generate house lines with interaction
  const generateHouseLines = () => {
    return houses.map((house, index) => {
      const start = getPointOnCircle(center, center, innerRadius, house.startDegree)
      const end = getPointOnCircle(center, center, outerRadius, house.startDegree)
      const midPoint = {
        x: (start.x + end.x) / 2,
        y: (start.y + end.y) / 2
      }
      
      return (
        <motion.g 
          key={`house-${house.number}`}
          onMouseEnter={(e) => handleHouseHover(e, house)}
          onMouseLeave={() => setTooltipInfo(null)}
          onClick={() => setSelectedHouse(house.number)}
          className="cursor-pointer"
        >
          {/* Background for house number */}
          <circle
            cx={midPoint.x}
            cy={midPoint.y}
            r="10"
            fill="black"
            className="opacity-50"
          />
          <motion.line
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: index * 0.1 }}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke="white"
            strokeWidth={selectedHouse === house.number ? "2" : "1"}
            className={`opacity-30 transition-all ${selectedHouse === house.number ? 'opacity-100' : ''}`}
          />
          <motion.text
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.5 }}
            x={midPoint.x}
            y={midPoint.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className={`fill-white text-xs font-medium transition-all ${
              selectedHouse === house.number ? 'text-[#FFA600]' : ''
            }`}
          >
            {house.number}
          </motion.text>
        </motion.g>
      )
    })
  }

  // Generate zodiac signs with interaction
  const generateZodiacSigns = () => {
    return houses.map((house, index) => {
      const position = getPointOnCircle(
        center,
        center,
        middleRadius + 20, // Increased distance from center
        house.startDegree + 15
      )
      const rotationAngle = (house.startDegree + 15 + 90) % 360

      return (
        <motion.g
          key={`zodiac-${house.sign}`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          transform={`translate(${position.x}, ${position.y}) rotate(${rotationAngle})`}
          className="cursor-pointer hover:scale-110 transition-transform"
          onMouseEnter={(e) => {
            const rect = (e.target as SVGElement).getBoundingClientRect()
            setTooltipInfo({
              x: rect.left + rect.width / 2,
              y: rect.top,
              content: house.sign
            })
          }}
          onMouseLeave={() => setTooltipInfo(null)}
        >
          {/* Background for better visibility */}
          <circle
            r="16"
            fill="black"
            className="opacity-50"
            transform="translate(-12, -12)"
          />
          <g transform="translate(-12, -12)">
            <ZodiacIcon sign={house.sign} className="text-white" size={24} />
          </g>
        </motion.g>
      )
    })
  }

  // Generate planet markers with interaction
  const generatePlanets = () => {
    return planets.map((planet, index) => {
      const degree = parseDegree(planet.degree)
      const position = getPointOnCircle(
        center,
        center,
        planetRadius,
        degree
      )

      return (
        <motion.g
          key={`planet-${planet.name}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: index * 0.1 }}
          className="cursor-pointer"
          transform={`translate(${position.x}, ${position.y})`}
          onMouseEnter={(e) => handlePlanetHover(e, planet)}
          onMouseLeave={() => setTooltipInfo(null)}
          onClick={() => setSelectedPlanet(planet.name)}
        >
          {/* Background circle for better visibility */}
          <circle
            r="14"
            fill="black"
            className="opacity-50"
          />
          <motion.circle
            r="12"
            fill="#FFA600"
            className={`stroke-2 stroke-white transition-all ${
              selectedPlanet === planet.name ? 'stroke-[#FFA600]' : ''
            }`}
            whileHover={{ scale: 1.1 }}
          />
          <text
            className={`fill-current text-white text-xs font-bold transition-all ${
              selectedPlanet === planet.name ? 'text-[#FFA600]' : ''
            }`}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {planet.name.charAt(0)}
          </text>
          {/* Planet name label */}
          <text
            className="fill-white text-[10px] font-medium"
            x="16"
            y="0"
            textAnchor="start"
            dominantBaseline="middle"
          >
            {planet.name}
          </text>
        </motion.g>
      )
    })
  }

  // Generate aspect lines with interaction
  const generateAspectLines = () => {
    const aspectLines: JSX.Element[] = []
    
    planets.forEach((planet1, i) => {
      planets.slice(i + 1).forEach((planet2) => {
        const pos1 = getPointOnCircle(center, center, planetRadius, parseDegree(planet1.degree))
        const pos2 = getPointOnCircle(center, center, planetRadius, parseDegree(planet2.degree))

        aspectLines.push(
          <motion.line
            key={`aspect-${planet1.name}-${planet2.name}`}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.3 }}
            transition={{ duration: 1, delay: 1 }}
            x1={pos1.x}
            y1={pos1.y}
            x2={pos2.x}
            y2={pos2.y}
            stroke="#FFA600"
            strokeWidth="1"
            className={`opacity-30 transition-all ${
              selectedPlanet === planet1.name || selectedPlanet === planet2.name
                ? 'opacity-70 stroke-2'
                : ''
            }`}
            onMouseEnter={(e) => {
              const rect = (e.target as SVGElement).getBoundingClientRect()
              setTooltipInfo({
                x: (pos1.x + pos2.x) / 2,
                y: (pos1.y + pos2.y) / 2,
                content: `${planet1.name} - ${planet2.name} Aspect`
              })
            }}
            onMouseLeave={() => setTooltipInfo(null)}
          />
        )
      })
    })

    return aspectLines
  }

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full"
      >
        {/* Background */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius + 40} // Increased radius for more space
          className="fill-black/90"
        />

        {/* Outer circle */}
        <motion.circle
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2 }}
          cx={center}
          cy={center}
          r={outerRadius}
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          className="opacity-70"
        />

        {/* Middle circle (for zodiac signs) */}
        <motion.circle
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.3 }}
          cx={center}
          cy={center}
          r={middleRadius}
          fill="none"
          stroke="white"
          strokeWidth="1"
          className="opacity-50"
        />

        {/* Inner circle */}
        <motion.circle
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.6 }}
          cx={center}
          cy={center}
          r={innerRadius}
          fill="none"
          stroke="white"
          strokeWidth="1"
          className="opacity-30"
        />

        {/* Aspect lines */}
        {generateAspectLines()}

        {/* House lines */}
        {generateHouseLines()}

        {/* Zodiac signs */}
        {generateZodiacSigns()}

        {/* Planets */}
        {generatePlanets()}
      </svg>

      <AnimatePresence>
        {tooltipInfo && (
          <Tooltip x={tooltipInfo.x} y={tooltipInfo.y}>
            {tooltipInfo.content}
          </Tooltip>
        )}
      </AnimatePresence>
    </div>
  )
}
