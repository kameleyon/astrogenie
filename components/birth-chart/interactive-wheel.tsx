"use client"

import React, { useState, useRef } from 'react'
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
  const isRightOverflow = x > window.innerWidth - 200
  const isTopOverflow = y < 100

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-gray-900 dark:text-white px-3 py-2 rounded-lg shadow-lg text-sm"
      style={{
        left: isRightOverflow ? 'auto' : x,
        right: isRightOverflow ? window.innerWidth - x : 'auto',
        top: isTopOverflow ? y + 20 : y - 60,
        transform: isRightOverflow ? 'translateX(-100%)' : 'translateX(-50%)',
        maxWidth: '200px'
      }}
    >
      {children}
      <div 
        className="absolute w-2 h-2 bg-white/90 dark:bg-gray-900/90 rotate-45"
        style={{
          [isTopOverflow ? 'top' : 'bottom']: isTopOverflow ? '-8px' : '-4px',
          left: isRightOverflow ? 'auto' : '50%',
          right: isRightOverflow ? '20px' : 'auto',
          transform: isRightOverflow ? 'none' : 'translateX(-50%)'
        }}
      />
    </motion.div>
  )
}

export function InteractiveWheel({ houses, planets }: InteractiveWheelProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null)
  const [tooltipInfo, setTooltipInfo] = useState<{ x: number, y: number, content: React.ReactNode } | null>(null)

  // SVG viewBox dimensions
  const size = 600
  const center = size / 2
  const outerRadius = size * 0.4
  const zodiacRadius = outerRadius * 0.95
  const middleRadius = zodiacRadius * 0.85
  const innerRadius = middleRadius * 0.75
  const planetRadius = innerRadius * 0.8

  // Helper function to get screen coordinates
  const getScreenCoordinates = (svgX: number, svgY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 }

    const point = svgRef.current.createSVGPoint()
    point.x = svgX
    point.y = svgY

    const screenCTM = svgRef.current.getScreenCTM()
    if (!screenCTM) return { x: 0, y: 0 }

    const screenPoint = point.matrixTransform(screenCTM)
    return {
      x: screenPoint.x,
      y: screenPoint.y
    }
  }

  // Helper functions
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180

  const getPointOnCircle = (centerX: number, centerY: number, radius: number, degrees: number) => {
    const radians = toRadians(degrees - 90)
    return {
      x: centerX + radius * Math.cos(radians),
      y: centerY + radius * Math.sin(radians)
    }
  }

  // Calculate actual degree for a planet
  const calculatePlanetDegree = (planet: typeof planets[0]) => {
    const signDegree: Record<ZodiacSign, number> = {
      Aries: 0, Taurus: 30, Gemini: 60, Cancer: 90,
      Leo: 120, Virgo: 150, Libra: 180, Scorpio: 210,
      Sagittarius: 240, Capricorn: 270, Aquarius: 300, Pisces: 330
    }
    const degree = parseInt(planet.degree.split('°')[0])
    return signDegree[planet.sign] + degree
  }

  // Calculate aspect between two planets
  const calculateAspect = (planet1: typeof planets[0], planet2: typeof planets[0]) => {
    const degree1 = calculatePlanetDegree(planet1)
    const degree2 = calculatePlanetDegree(planet2)
    let diff = Math.abs(degree1 - degree2)
    if (diff > 180) diff = 360 - diff

    // Define aspect types with their orbs and colors
    const aspects = {
      conjunction: { angle: 0, orb: 10, color: "#FFA600", pattern: "none" },     // Orange
      opposition: { angle: 180, orb: 10, color: "#FF4D4D", pattern: "none" },    // Red
      trine: { angle: 120, orb: 8, color: "#4CAF50", pattern: "none" },         // Green
      square: { angle: 90, orb: 8, color: "#FF4D4D", pattern: "none" },         // Red
      sextile: { angle: 60, orb: 6, color: "#2196F3", pattern: "4,4" }         // Blue
    } as const

    // Find matching aspect
    for (const [type, config] of Object.entries(aspects)) {
      if (Math.abs(diff - config.angle) <= config.orb) {
        return { type, ...config }
      }
    }
    return null
  }

  // Generate zodiac ring segments
  const generateZodiacRing = () => {
    const zodiacSigns = [
      { name: "Aries", element: "fire" },
      { name: "Taurus", element: "earth" },
      { name: "Gemini", element: "air" },
      { name: "Cancer", element: "water" },
      { name: "Leo", element: "fire" },
      { name: "Virgo", element: "earth" },
      { name: "Libra", element: "air" },
      { name: "Scorpio", element: "water" },
      { name: "Sagittarius", element: "fire" },
      { name: "Capricorn", element: "earth" },
      { name: "Aquarius", element: "air" },
      { name: "Pisces", element: "water" }
    ] as const

    const elementColors = {
      fire: "from-red-500/20 to-orange-500/20",
      earth: "from-green-500/20 to-yellow-500/20",
      air: "from-blue-500/20 to-indigo-500/20",
      water: "from-blue-400/20 to-purple-500/20"
    } as const
    
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
        <g key={sign.name} className="cursor-pointer">
          <defs>
            <radialGradient id={`gradient-${sign.name}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" className={`bg-gradient-to-r ${elementColors[sign.element]}`} />
              <stop offset="100%" className="stop-black/90" />
            </radialGradient>
          </defs>
          <path
            d={path}
            fill={`url(#gradient-${sign.name})`}
            className="stroke-white/10"
            strokeWidth="1"
            onMouseEnter={(e) => {
              const point = getPointOnCircle(center, center, outerRadius + 10, startAngle + 15)
              const screenPoint = getScreenCoordinates(point.x, point.y)
              
              setTooltipInfo({
                x: screenPoint.x,
                y: screenPoint.y,
                content: (
                  <div className="space-y-1">
                    <div className="font-medium">{sign.name}</div>
                    <div className="text-sm text-gray-500">{sign.element} sign</div>
                  </div>
                )
              })
            }}
            onMouseLeave={() => setTooltipInfo(null)}
          />
          <text
            x={labelPos.x}
            y={labelPos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-gray-400 text-[10px] font-medium"
            transform={`rotate(${midAngle}, ${labelPos.x}, ${labelPos.y})`}
          >
            {sign.name}
          </text>
        </g>
      )
    })
  }

  // Generate house lines
  const generateHouseLines = () => {
    return houses.map((house) => {
      const start = getPointOnCircle(center, center, innerRadius, house.startDegree)
      const end = getPointOnCircle(center, center, zodiacRadius, house.startDegree)
      
      return (
        <line
          key={`house-${house.number}`}
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          className="stroke-white/20 dark:stroke-white/30"
          strokeWidth="1"
          strokeDasharray="4,4"
        />
      )
    })
  }

  // Generate aspect lines
  const generateAspectLines = () => {
    const aspectLines: JSX.Element[] = []
    
    planets.forEach((planet1, i) => {
      planets.slice(i + 1).forEach((planet2) => {
        const aspect = calculateAspect(planet1, planet2)
        if (!aspect) return

        const degree1 = calculatePlanetDegree(planet1)
        const degree2 = calculatePlanetDegree(planet2)
        
        const pos1 = getPointOnCircle(center, center, planetRadius, degree1)
        const pos2 = getPointOnCircle(center, center, planetRadius, degree2)

        // For opposition and square, draw through center
        const drawThroughCenter = ['opposition', 'square'].includes(aspect.type)
        const path = drawThroughCenter
          ? `M ${pos1.x} ${pos1.y} L ${center} ${center} L ${pos2.x} ${pos2.y}`
          : `M ${pos1.x} ${pos1.y} L ${pos2.x} ${pos2.y}`

        aspectLines.push(
          <motion.path
            key={`aspect-${planet1.name}-${planet2.name}`}
            d={path}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ duration: 1, delay: 0.5 }}
            stroke={aspect.color}
            strokeWidth="1"
            strokeDasharray={aspect.pattern === "none" ? undefined : aspect.pattern}
            fill="none"
            className={`transition-opacity ${
              selectedPlanet && (selectedPlanet === planet1.name || selectedPlanet === planet2.name)
                ? 'opacity-100'
                : 'opacity-40'
            }`}
          />
        )
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
      const degree = calculatePlanetDegree(planet)
      const position = getPointOnCircle(center, center, planetRadius, degree)

      // Find aspects for this planet
      const planetAspects = planets
        .filter(p => p.name !== planet.name)
        .map(p2 => {
          const aspect = calculateAspect(planet, p2)
          if (aspect) {
            return {
              planet: p2.name,
              type: aspect.type,
              orb: Math.abs(calculatePlanetDegree(planet) - calculatePlanetDegree(p2))
            }
          }
          return null
        })
        .filter((aspect): aspect is NonNullable<typeof aspect> => aspect !== null)

      return (
        <g
          key={planet.name}
          transform={`translate(${position.x}, ${position.y})`}
          className="cursor-pointer"
          onMouseEnter={(e) => {
            const screenPoint = getScreenCoordinates(position.x, position.y)
            
            setTooltipInfo({
              x: screenPoint.x,
              y: screenPoint.y,
              content: (
                <div className="space-y-2">
                  <div className="font-medium">{planet.name}</div>
                  <div>{planet.degree} {planet.sign}</div>
                  <div className="text-gray-500">House {planet.house}</div>
                  {planetAspects.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                      <div className="text-xs font-medium mb-1">Aspects:</div>
                      {planetAspects.map((aspect, i) => (
                        <div key={i} className="text-xs text-gray-500">
                          {aspect.type} with {aspect.planet}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          }}
          onMouseLeave={() => setTooltipInfo(null)}
          onClick={() => setSelectedPlanet(planet.name)}
        >
          <circle
            r="12"
            className="fill-black/80 stroke-white/40"
            strokeWidth="1"
          />
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-white text-sm font-medium"
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
        ref={svgRef}
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full"
      >
        {/* Background */}
        <defs>
          <radialGradient id="wheelBackground" cx="50%" cy="50%" r="50%">
            <stop offset="0%" className="stop-black/80" />
            <stop offset="100%" className="stop-black/95" />
          </radialGradient>
        </defs>

        <circle
          cx={center}
          cy={center}
          r={outerRadius + 30}
          fill="url(#wheelBackground)"
          className="stroke-white/10"
          strokeWidth="1"
        />

        {/* Zodiac ring */}
        {generateZodiacRing()}

        {/* Circles */}
        <circle
          cx={center}
          cy={center}
          r={zodiacRadius}
          fill="none"
          className="stroke-white/20"
          strokeWidth="1"
        />
        <circle
          cx={center}
          cy={center}
          r={middleRadius}
          fill="none"
          className="stroke-white/15"
          strokeWidth="1"
        />
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="none"
          className="stroke-white/10"
          strokeWidth="1"
        />

        {/* House lines */}
        {generateHouseLines()}

        {/* Aspect lines */}
        {generateAspectLines()}

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
