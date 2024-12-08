import { DateTime, GeoPosition } from './types'
import tzlookup from 'tz-lookup'
import moment from 'moment-timezone'

/**
 * Get timezone based on coordinates
 * Direct port of Python's get_timezone function
 */
function getTimezone(latitude: number, longitude: number): string {
  try {
    const timezone = tzlookup(latitude, longitude)
    if (!timezone) {
      console.warn(`Couldn't determine timezone for lat:${latitude}, lon:${longitude}. Using UTC.`)
      return 'UTC'
    }
    return timezone
  } catch (error) {
    console.warn(`Error finding timezone for lat:${latitude}, lon:${longitude}:`, error)
    return 'UTC'
  }
}

/**
 * Calculate Julian Day Number for a given date and time
 * Direct port of Python implementation
 */
export function calculateJulianDay(dateTime: DateTime, position: GeoPosition): number {
  try {
    // Get timezone for the location (equivalent to get_timezone in Python)
    const timezone = getTimezone(position.latitude, position.longitude)

    // Create local time (equivalent to datetime() in Python)
    const localTime = moment.tz([
      dateTime.year,
      dateTime.month - 1, // Moment months are 0-based
      dateTime.day,
      dateTime.hour,
      dateTime.minute,
      dateTime.second
    ], timezone)

    // Convert to UTC (equivalent to astimezone(pytz.UTC) in Python)
    const utcTime = localTime.clone().tz('UTC')

    // Calculate decimal hours (equivalent to hour + minute/60.0 + second/3600.0 in Python)
    const decimalHours = utcTime.hours() + 
                        utcTime.minutes() / 60.0 + 
                        utcTime.seconds() / 3600.0

    // Calculate Julian Day using Meeus algorithm since we don't have swe.julday
    let y = utcTime.year()
    let m = utcTime.month() + 1 // Convert back to 1-based month

    // Adjust year and month for January and February
    if (m <= 2) {
      y -= 1
      m += 12
    }

    // Calculate A and B terms
    const a = Math.floor(y / 100)
    const b = 2 - a + Math.floor(a / 4)

    // Calculate Julian Day Number
    const jd = Math.floor(365.25 * (y + 4716)) +
              Math.floor(30.6001 * (m + 1)) +
              utcTime.date() + decimalHours / 24 + b - 1524.5

    console.debug(`Julian Day: ${jd}`)
    return jd
  } catch (error) {
    console.error('Error calculating Julian Day:', error)
    throw error
  }
}

/**
 * Convert Julian Day Number back to calendar date and time
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
 * Get current Julian Day Number in UTC
 */
export function getCurrentJulianDay(): number {
  const now = moment.utc()
  return calculateJulianDay(
    {
      year: now.year(),
      month: now.month() + 1, // Convert to 1-based month
      day: now.date(),
      hour: now.hours(),
      minute: now.minutes(),
      second: now.seconds()
    },
    { latitude: 0, longitude: 0 } // UTC coordinates
  )
}
