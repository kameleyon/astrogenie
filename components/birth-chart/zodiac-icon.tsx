"use client"

import React from 'react'

export const zodiacSigns = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces'
] as const

export type ZodiacSign = typeof zodiacSigns[number]

interface ZodiacIconProps {
  sign: ZodiacSign
  className?: string
  size?: number
}

export function ZodiacIcon({ sign, className = "", size = 24 }: ZodiacIconProps) {
  const getPath = (sign: string) => {
    switch (sign.toLowerCase()) {
      case 'aries':
        return "M7 18C7 12 12 7 12 7C12 7 17 12 17 18M12 7V21" // Ram horns
      case 'taurus':
        return "M6 12C6 8 9 5 12 5C15 5 18 8 18 12C18 16 15 19 12 19M6 12C6 16 9 19 12 19M12 19V21" // Bull head
      case 'gemini':
        return "M8 5V19M16 5V19M8 12H16M6 7H10M14 7H18M6 17H10M14 17H18" // Twins
      case 'cancer':
        return "M12 4C16 4 19 7 19 11C19 15 16 18 12 18C8 18 5 15 5 11M8 20C10 18 14 18 16 20M5 11C5 7 8 4 12 4" // Crab claws
      case 'leo':
        return "M12 5C15 5 18 8 18 11C15 11 12 8 12 5C12 8 9 11 6 11C9 11 12 14 12 17M12 17C12 19 10 21 8 21" // Lion's mane
      case 'virgo':
        return "M12 5V19M8 9L12 13L16 9M8 13H16M10 17L14 17" // Maiden
      case 'libra':
        return "M5 12H19M5 16H19M12 5V19M8 8L16 8M8 20L16 20" // Scales
      case 'scorpio':
        return "M5 12H19M19 12L16 9M19 12L16 15M19 12H21M21 12L19 14" // Scorpion tail
      case 'sagittarius':
        return "M5 19L19 5M19 5H13M19 5V11M9 15L15 9" // Archer's arrow
      case 'capricorn':
        return "M5 12C8 12 11 9 11 6C11 9 14 12 17 12M5 12C8 12 11 15 11 18C11 15 14 12 17 12M17 12V18" // Sea-goat
      case 'aquarius':
        return "M5 9H19M5 15H19M7 12L17 12M9 18L15 18" // Water bearer waves
      case 'pisces':
        return "M7 5V19M17 5V19M7 12H17M5 8C8 8 10 12 12 12M12 12C14 12 16 16 19 16M12 12C10 12 8 16 5 16M12 12C14 12 16 8 19 8" // Fish
      default:
        return ""
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={getPath(sign)} />
    </svg>
  )
}
