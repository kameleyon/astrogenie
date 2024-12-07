export * from './types'
export * from './julian-date'
export * from './planets'
export * from './aspects'
export * from './houses'
export { AstroCalculator } from './calculator'

// Re-export commonly used types and constants
export type {
  DateTime,
  GeoPosition,
  PlanetPosition,
  HousePosition,
  AspectData,
  ZodiacSign,
  BirthChartCalculation
} from './types'

export {
  PLANET_INDICES,
  MAJOR_ASPECTS,
  MINOR_ASPECTS,
  HOUSE_SYSTEMS
} from './planets'

// Example usage:
/*
import { AstroCalculator, DateTime, GeoPosition } from '@/lib/services/astro'

const birthData: DateTime = {
  year: 1990,
  month: 6,
  day: 15,
  hour: 14,
  minute: 30,
  second: 0
}

const location: GeoPosition = {
  latitude: 40.7128,
  longitude: -74.0060
}

const calculator = AstroCalculator.create(birthData, location, {
  houseSystem: 'P',
  includeMinorAspects: true,
  calculateMidpoints: true
})

const birthChart = await calculator.calculateBirthChart()
*/
