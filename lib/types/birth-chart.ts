export type ZodiacSign = 
  | "Aries" | "Taurus" | "Gemini" | "Cancer"
  | "Leo" | "Virgo" | "Libra" | "Scorpio"
  | "Sagittarius" | "Capricorn" | "Aquarius" | "Pisces"

export interface Planet {
  name: string
  sign: ZodiacSign
  degree: string
  house: number
  retrograde: boolean
}

export interface House {
  number: number
  sign: ZodiacSign
  degree: string
  startDegree: number
  containingPlanets: string[]
}

export interface Aspect {
  planet1: string
  planet2: string
  aspect: string
  angle: number
  orb: number
}

export interface AspectPattern {
  name: string
  type: 'major' | 'minor'
  description: string
  planets: Array<{
    name: string
    sign: ZodiacSign
    degree: string
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
}

export interface SignificantFeature {
  type: string
  description: string
}

export interface BirthChartData {
  name: string
  location: string
  date: string
  time: string
  planets: Planet[]
  houses: House[]
  aspects: Aspect[]
  patterns: AspectPattern[]
  ascendant: number
  midheaven: number
  significantFeatures: SignificantFeature[]
}

export interface PlanetPosition {
  longitude: number
  latitude: number
  distance: number
  longitudeSpeed: number
  sign: ZodiacSign
  retrograde: boolean
}

export type PlanetName = 
  | "Sun" | "Moon" | "Mercury" | "Venus" | "Mars"
  | "Jupiter" | "Saturn" | "Uranus" | "Neptune" | "Pluto"
