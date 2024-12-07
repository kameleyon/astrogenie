export interface GeoPosition {
  latitude: number
  longitude: number
}

export interface DateTime {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

export interface PlanetPosition {
  longitude: number
  latitude: number
  distance: number
  longitudeSpeed: number
  sign: string
}

export interface HousePosition {
  cusp: number
  sign: string
}

export interface AspectData {
  planet1: string
  planet2: string
  aspect: string
  angle: number
  orb: number
}

export type ZodiacSign = 
  | "Aries" 
  | "Taurus" 
  | "Gemini" 
  | "Cancer" 
  | "Leo" 
  | "Virgo" 
  | "Libra" 
  | "Scorpio" 
  | "Sagittarius" 
  | "Capricorn" 
  | "Aquarius" 
  | "Pisces"

export interface BirthChartCalculation {
  planets: Record<string, PlanetPosition>
  houses: Record<string, HousePosition>
  aspects: AspectData[]
  ascendant: number
  midheaven: number
  midpoints?: Record<string, number>  // Make midpoints optional
}
