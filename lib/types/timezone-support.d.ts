declare module 'timezone-support' {
  export interface ZonedTime {
    year: number
    month: number
    day: number
    hours: number
    minutes: number
    seconds: number
    milliseconds?: number
    zone?: {
      abbreviation: string
      offset: number
    }
  }

  export interface TimeZone {
    name: string
    abbreviation: string
    offset: number
  }

  export function findTimeZone(name: string): TimeZone
  export function getZonedTime(date: Date, timeZone: TimeZone | string): ZonedTime
  export function listTimeZones(): string[]
}
