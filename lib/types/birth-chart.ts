import { type ZodiacSign } from "@/components/birth-chart/zodiac-icon"

export interface Planet {
  name: string
  sign: ZodiacSign
  degree: string
  house: number
  retrograde?: boolean
}

export interface House {
  number: number
  sign: ZodiacSign
  degree: string
  startDegree: number
  containingPlanets?: string[]
}

export interface Aspect {
  planet1: string
  planet2: string
  type: string
  degree: string
  orb?: string
  nature?: 'harmonious' | 'challenging' | 'neutral'
}

export interface Pattern {
  name: string
  type: 'major' | 'minor'
  description: string
  planets: Array<{
    name: string
    sign: ZodiacSign
    degree: string
    house?: number
  }>
  elements?: {
    fire?: number
    earth?: number
    air?: number
    water?: number
  }
  qualities?: {
    cardinal?: number
    fixed?: number
    mutable?: number
  }
  interpretation?: string
  houses?: number[]
}

export interface BirthChartData {
  name: string
  location: string
  date: string
  time: string
  planets: Planet[]
  houses: House[]
  aspects: Aspect[]
  patterns: Pattern[]
}
