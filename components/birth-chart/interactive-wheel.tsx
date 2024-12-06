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

export function InteractiveWheel({ houses, planets }: InteractiveWheelProps) {
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null)
  const [selectedHouse, setSelectedHouse] = useState<number | null>(null)
  const [tooltipInfo, setTooltipInfo] = useState<{ x: number, y: number, content: React.ReactNode } | null>(null)

  // SVG viewBox dimensions
  const size = 600
  const center = size / 2
  const outerRadius = size * 0.45 // Increased for outer zodiac ring
  const zodiacRadius = outerRadius * 0.9
  const middleRadius = zodiacRadius * 0.85
  const innerRadius = middleRadius * 0.7
  const planetRadius = innerRadius * 0.75

  // Helper functions
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180
  const toDegrees = (radians: number) => (radians * 180) / Math.PI

  const getPointOnCircle = (centerX: number, centerY: number, radius: number, degrees: number) => {
    const radians = toRadians(degrees - 90)
    return {
      x: centerX + radius * Math.cos(radians),
      y: centerY + radius * Math.sin(radians)
    }
  }

  // Generate zodiac ring segments
  const generateZodiacRing = () => {
    const zodiacSigns = [
      "Aries", "Taurus", "Gemini", "Cancer",
      "Leo", "Virgo", "Libra", "Scorpio",
      "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ]
    
    return zodiacSigns.map((sign, index) => {
      const startAngle = index * 30
      const endAngle = (index + 1) * 30
      
      const start = getPointOnCircle(center, center, outerRadius, startAngle)
      const end = getPointOnCircle(center, center, outerRadius, endAngle)
      const midAngle = startAngle + 15
      const labelPos = getPointOnCircle(center, center, outerRadius + 20, midAngle)
      
      const path = [
        `M ${center} ${center}`,
        `L ${start.x} ${start.y}`,
        `A ${outerRadius} ${outerRadius} 0 0 1 ${end.x} ${end.y}`,
        'Z'
      ].join(' ')

      return (
        <g key={sign} className="cursor-pointer">
          <path
            d={path}
            fill="#1a1a1a"
            stroke="white"
            strokeWidth="1"
            className="opacity-80"
          />
          <text
            x={labelPos.x}
            y={labelPos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="12"
            transform={`rotate(${midAngle}, ${labelPos.x}, ${labelPos.y})`}
          >
            {sign}
          </text>
        </g>
      )
    })
  }

  // Generate house lines
  const generateHouseLines = () => {
    return houses.map((house, index) => {
      const start = getPointOnCircle(center, center, innerRadius, house.startDegree)
      const end = getPointOnCircle(center, center, zodiacRadius, house.startDegree)
      
      return (
        <g key={`house-${house.number}`}>
          <line
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke="white"
            strokeWidth="1"
            strokeDasharray="4,4"
            className="opacity-30"
          />
        </g>
      )
    })
  }

  // Generate aspect lines with updated colors
  const generateAspectLines = () => {
    const aspectTypes = {
      trine: { angle: 120, color: "#4CAF50", pattern: "none" },    // Green
      square: { angle: 90, color: "#FF4D4D", pattern: "none" },    // Red
      sextile: { angle: 60, color: "#2196F3", pattern: "4,4" },    // Blue
      opposition: { angle: 180, color: "#FF4D4D", pattern: "none" } // Red
    }

    const aspectLines: JSX.Element[] = []
    
    planets.forEach((planet1, i) => {
      planets.slice(i + 1).forEach((planet2) => {
        const angle = Math.abs(planet1.house - planet2.house) * 30
        const aspectType = Object.entries(aspectTypes).find(([_, config]) => 
          Math.abs(angle - config.angle) <= 6
        )

        if (aspectType) {
          const [_, config] = aspectType
          const pos1 = getPointOnCircle(center, center, planetRadius, planet1.house * 30)
          const pos2 = getPointOnCircle(center, center, planetRadius, planet2.house * 30)

          aspectLines.push(
            <line
              key={`aspect-${planet1.name}-${planet2.name}`}
              x1={pos1.x}
              y1={pos1.y}
              x2={pos2.x}
              y2={pos2.y}
              stroke={config.color}
              strokeWidth="1"
              strokeDasharray={config.pattern}
              className="opacity-50"
            />
          )
        }
      })
    })

    return aspectLines
  }

  // Generate planets
  const generatePlanets = () => {
    const planetSymbols: { [key: string]: string } = {
      Sun: "☉",
      Moon: "☽",
      Mercury: "☿",
      Venus: "♀",
      Mars: "♂",
      Jupiter: "♃",
      Saturn: "♄",
      Uranus: "⛢",
      Neptune: "♆",
      Pluto: "♇"
    }

    return planets.map((planet) => {
      const position = getPointOnCircle(
        center,
        center,
        planetRadius,
        planet.house * 30
      )

      return (
        <g
          key={planet.name}
          transform={`translate(${position.x}, ${position.y})`}
          className="cursor-pointer"
        >
          <circle
            r="10"
            fill="black"
            stroke="white"
            strokeWidth="1"
            className="opacity-80"
          />
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="12"
          >
            {planetSymbols[planet.name] || planet.name.charAt(0)}
          </text>
        </g>
      )
    })
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
          r={outerRadius + 40}
          fill="black"
          className="opacity-90"
        />

        {/* Zodiac ring */}
        {generateZodiacRing()}

        {/* Circles */}
        <circle
          cx={center}
          cy={center}
          r={zodiacRadius}
          fill="none"
          stroke="white"
          strokeWidth="1"
          className="opacity-70"
        />
        <circle
          cx={center}
          cy={center}
          r={middleRadius}
          fill="none"
          stroke="white"
          strokeWidth="1"
          className="opacity-50"
        />
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="none"
          stroke="white"
          strokeWidth="1"
          className="opacity-30"
        />

        {/* House lines */}
        {generateHouseLines()}

        {/* Aspect lines */}
        {generateAspectLines()}

        {/* Planets */}
        {generatePlanets()}
      </svg>
    </div>
  )
}
