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

export type PlanetName = 
  | "Sun"
  | "Moon"
  | "Mercury"
  | "Venus"
  | "Mars"
  | "Jupiter"
  | "Saturn"
  | "Uranus"
  | "Neptune"
  | "Pluto"

export type AspectType =
  | "conjunction"
  | "opposition"
  | "trine"
  | "square"
  | "sextile"
  | "quintile"
  | "semisextile"
  | "quincunx"
  | "sesquiquadrate"
  | "semisquare"

export type AspectNature = "harmonious" | "challenging" | "neutral"

export interface PlanetPosition {
  longitude: number
  latitude: number
  distance: number
  longitudeSpeed: number
  sign: ZodiacSign
  retrograde?: boolean
  dignityScore?: number
  essential?: {
    domicile?: boolean
    exaltation?: boolean
    detriment?: boolean
    fall?: boolean
  }
}

export interface HousePosition {
  cusp: number
  sign: ZodiacSign
  strength?: number
  dignity?: number
}

export interface AspectData {
  planet1: PlanetName
  planet2: PlanetName
  aspect: AspectType
  angle: number
  orb: number
  nature: AspectNature
  strength?: number
  applying?: boolean
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

export type HouseSystem =
  | "P" // Placidus
  | "K" // Koch
  | "O" // Porphyry
  | "R" // Regiomontanus
  | "C" // Campanus
  | "E" // Equal
  | "W" // Whole Sign
  | "X" // Meridian
  | "M" // Morinus
  | "H" // Horizontal
  | "T" // Topocentric
  | "B" // Alcabitius
  | "A" // Equal MC

export interface AspectPattern {
  name: string
  type: "major" | "minor"
  description: string
  planets: Array<{
    name: PlanetName
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

export interface BirthChartCalculation {
  planets: Record<PlanetName, PlanetPosition>
  houses: Record<number, HousePosition>
  aspects: AspectData[]
  patterns: AspectPattern[]
  ascendant: number
  midheaven: number
  midpoints?: Record<string, number>
  significantFeatures?: Array<{
    type: string
    description: string
  }>
}

export interface ElementalBalance {
  fire: number
  earth: number
  air: number
  water: number
}

export interface ModalityBalance {
  cardinal: number
  fixed: number
  mutable: number
}

export interface PlanetaryDignity {
  planet: PlanetName
  sign: ZodiacSign
  type: "domicile" | "exaltation" | "detriment" | "fall"
  description: string
  score: number
}

export interface ChartPattern {
  type: string
  planets: PlanetName[]
  description: string
  interpretation?: string
}
