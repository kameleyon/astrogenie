import { DateTime, GeoPosition } from './types'
import { findTimeZone, getZonedTime } from 'timezone-support'

/**
 * Calculates the Julian Day Number for a given date and time
 * Algorithm based on Jean Meeus' Astronomical Algorithms
 */
export function calculateJulianDay(dateTime: DateTime, position: GeoPosition): number {
  const { year, month, day, hour, minute, second } = convertToUTC(dateTime, position)
  
  // Convert time to decimal hours
  const decimalHours = hour + minute / 60 + second / 3600

  let y = year
  let m = month
  
  // Adjust year and month for January and February
  if (m <= 2) {
    y -= 1
    m += 12
  }

  // Calculate A and B terms for Julian Day calculation
  const a = Math.floor(y / 100)
  const b = 2 - a + Math.floor(a / 4)

  // Calculate Julian Day Number
  const jd = Math.floor(365.25 * (y + 4716)) +
            Math.floor(30.6001 * (m + 1)) +
            day + decimalHours / 24 + b - 1524.5

  return jd
}

/**
 * Converts local time to UTC based on geographic position
 */
function convertToUTC(dateTime: DateTime, position: GeoPosition): DateTime {
  try {
    // Find timezone based on coordinates
    const timezone = findTimeZoneByPosition(position)
    if (!timezone) {
      console.warn('Could not determine timezone, using UTC')
      return dateTime
    }

    // Create Date object in local time
    const localDate = new Date(
      dateTime.year,
      dateTime.month - 1, // JavaScript months are 0-based
      dateTime.day,
      dateTime.hour,
      dateTime.minute,
      dateTime.second
    )

    // Convert to timezone-aware date
    const zonedTime = getZonedTime(localDate, timezone)

    return {
      year: zonedTime.year,
      month: zonedTime.month,
      day: zonedTime.day,
      hour: zonedTime.hours,
      minute: zonedTime.minutes,
      second: zonedTime.seconds
    }
  } catch (error) {
    console.error('Error converting to UTC:', error)
    return dateTime // Return original time if conversion fails
  }
}

/**
 * Finds timezone based on geographic coordinates
 */
function findTimeZoneByPosition(position: GeoPosition): string | null {
  try {
    // Use a timezone finder library or API here
    // For now, we'll use a simple approximation based on longitude
    const hourOffset = Math.round(position.longitude / 15)
    return `Etc/GMT${hourOffset >= 0 ? '-' : '+'}${Math.abs(hourOffset)}`
  } catch (error) {
    console.error('Error finding timezone:', error)
    return null
  }
}

/**
 * Converts Julian Day Number back to calendar date and time
 */
export function julianDayToDateTime(jd: number): DateTime {
  // Add 0.5 to shift from noon to midnight
  jd += 0.5

  // Extract the integer and fractional parts
  const z = Math.floor(jd)
  const f = jd - z

  let a = z
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25)
    a = z + 1 + alpha - Math.floor(alpha / 4)
  }

  const b = a + 1524
  const c = Math.floor((b - 122.1) / 365.25)
  const d = Math.floor(365.25 * c)
  const e = Math.floor((b - d) / 30.6001)

  // Calculate day with decimal time
  const dayDecimal = b - d - Math.floor(30.6001 * e) + f

  // Extract day and time
  const day = Math.floor(dayDecimal)
  const timeDecimal = (dayDecimal - day) * 24
  const hour = Math.floor(timeDecimal)
  const minuteDecimal = (timeDecimal - hour) * 60
  const minute = Math.floor(minuteDecimal)
  const second = Math.floor((minuteDecimal - minute) * 60)

  // Calculate month and year
  let month = e - 1
  let year = c - 4716
  if (month > 12) {
    month -= 12
    year += 1
  }

  return {
    year,
    month,
    day,
    hour,
    minute,
    second
  }
}

/**
 * Calculates the Julian Day Number for the current UTC time
 */
export function getCurrentJulianDay(): number {
  const now = new Date()
  return calculateJulianDay(
    {
      year: now.getUTCFullYear(),
      month: now.getUTCMonth() + 1,
      day: now.getUTCDate(),
      hour: now.getUTCHours(),
      minute: now.getUTCMinutes(),
      second: now.getUTCSeconds()
    },
    { latitude: 0, longitude: 0 } // UTC coordinates
  )
}
