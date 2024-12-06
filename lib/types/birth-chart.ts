export interface Planet {
  name: string
  sign: string
  house: number
}

export interface BirthChartData {
  sunSign: string
  moonSign: string
  ascendant: string
  planets: Planet[]
}