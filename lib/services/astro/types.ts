import { ZodiacSign } from '../../types/birth-chart'

export type { ZodiacSign }

export interface DateTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export interface PlanetPosition {
  longitude: number
  latitude: number
  distance: number
  longitude_speed: number
  sign: ZodiacSign
}

export interface HousePosition {
  cusp: number
  sign: ZodiacSign
}

export interface GeoPosition {
  latitude: number
  longitude: number
}

export interface HouseData {
  cusp: number
  sign: ZodiacSign
}

export interface AspectData {
  planet1: string
  planet2: string
  aspect: string
  angle: number
  orb: number
}

export interface Prediction {
  date: string
  general_mood: string
  love: string
  career: string
  health: string
}

// Direct port of Python's planet_indices
export const PLANET_INDICES = {
  Sun: 0,      // SE_SUN
  Moon: 1,     // SE_MOON
  Mercury: 2,  // SE_MERCURY
  Venus: 3,    // SE_VENUS
  Mars: 4,     // SE_MARS
  Jupiter: 5,  // SE_JUPITER
  Saturn: 6,   // SE_SATURN
  Uranus: 7,   // SE_URANUS
  Neptune: 8,  // SE_NEPTUNE
  Pluto: 9     // SE_PLUTO
} as const
