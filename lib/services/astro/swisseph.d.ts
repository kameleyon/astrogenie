declare module 'swisseph' {
  export function calc_ut(
    julianDay: number,
    planet: number,
    flags: number,
    callback: (data: number[] | null, err: string | null) => void
  ): void
  
  export function swe_houses(
    julianDay: number,
    latitude: number,
    longitude: number,
    hsys: string,
    callback: (result: { cusps: number[]; ascmc: number[] } | null, error: string | null) => void
  ): void

  // Flags
  export const SEFLG_SPEED: number
  export const SEFLG_SWIEPH: number

  // Planet indices
  export const SE_SUN: number
  export const SE_MOON: number
  export const SE_MERCURY: number
  export const SE_VENUS: number
  export const SE_MARS: number
  export const SE_JUPITER: number
  export const SE_SATURN: number
  export const SE_URANUS: number
  export const SE_NEPTUNE: number
  export const SE_PLUTO: number

  // House systems
  export const SE_HSYS_PLACIDUS: string
  export const SE_HSYS_KOCH: string
  export const SE_HSYS_PORPHYRIUS: string
  export const SE_HSYS_REGIOMONTANUS: string
  export const SE_HSYS_CAMPANUS: string
  export const SE_HSYS_EQUAL: string
  export const SE_HSYS_WHOLE_SIGN: string
  export const SE_HSYS_MERIDIAN: string
  export const SE_HSYS_MORINUS: string
  export const SE_HSYS_HORIZONTAL: string
  export const SE_HSYS_POLICH_PAGE: string
  export const SE_HSYS_ALCABITIUS: string
  export const SE_HSYS_GAUQUELIN: string

  // Calendar types
  export const GREG_CAL: number
  export const JUL_CAL: number

  // Additional functions
  export function swe_julday(
    year: number,
    month: number,
    day: number,
    hour: number,
    calendar: number
  ): number

  export function swe_revjul(
    julianDay: number,
    calendar: number,
    callback: (result: { year: number; month: number; day: number; hour: number } | null, error: string | null) => void
  ): void

  export function swe_set_ephe_path(path: string): void
}
