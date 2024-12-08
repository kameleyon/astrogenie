import { ZodiacSign } from '@/lib/types/birth-chart'

export interface DateTime {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

export interface GeoPosition {
  latitude: number
  longitude: number
}

export interface HousePosition {
  cusp: number
  sign: ZodiacSign
}

export interface PlanetPosition {
  longitude: number
  latitude: number
  distance: number
  longitudeSpeed: number
  sign: ZodiacSign
  retrograde: boolean
}
