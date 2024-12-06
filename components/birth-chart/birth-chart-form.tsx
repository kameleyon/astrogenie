"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { MapPin, Clock, CircleUserRound, Sparkles, CalendarDays } from "lucide-react"
import { type BirthChartData } from "@/lib/types/birth-chart"
import { LocationSearch } from "./location-search"

interface BirthChartFormProps {
  onSubmit: (data: BirthChartData) => void
}

interface Location {
  name: string
  coordinates: [number, number] // [longitude, latitude]
}

export function BirthChartForm({ onSubmit }: BirthChartFormProps) {
  const [date, setDate] = useState<string | undefined>(undefined)
  const [location, setLocation] = useState<Location | undefined>()
  const [timeKnown, setTimeKnown] = useState("yes")
  const [name, setName] = useState("")
  const [time, setTime] = useState("")
  const [isFormComplete, setIsFormComplete] = useState(false)

  const handleLocationSelect = (loc: Location) => {
    setLocation(loc)
  }

  const validateForm = () => {
    if (!name || !date || !location) return false
    if (timeKnown === "yes" && !time) return false
    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setIsFormComplete(false)
      return
    }

    // Create mock data for testing
    const mockData: BirthChartData = {
      name,
      location: location?.name || "",
      date: format(new Date(date || ""), "MMM d, yyyy"),
      time: time || "Unknown",
      planets: [
        { name: "Sun", sign: "Leo", degree: "15° 30'", house: 11 },
        { name: "Moon", sign: "Pisces", degree: "4° 20'", house: 6 },
        { name: "Mercury", sign: "Virgo", degree: "9° 15'", house: 12 }
      ],
      houses: [
        { number: 1, sign: "Virgo", degree: "22°", startDegree: 0 },
        { number: 2, sign: "Libra", degree: "18°", startDegree: 30 },
        { number: 3, sign: "Scorpio", degree: "17°", startDegree: 60 },
        { number: 4, sign: "Sagittarius", degree: "21°", startDegree: 90 },
        { number: 5, sign: "Capricorn", degree: "25°", startDegree: 120 },
        { number: 6, sign: "Aquarius", degree: "28°", startDegree: 150 },
        { number: 7, sign: "Pisces", degree: "22°", startDegree: 180 },
        { number: 8, sign: "Aries", degree: "18°", startDegree: 210 },
        { number: 9, sign: "Taurus", degree: "17°", startDegree: 240 },
        { number: 10, sign: "Gemini", degree: "21°", startDegree: 270 },
        { number: 11, sign: "Cancer", degree: "25°", startDegree: 300 },
        { number: 12, sign: "Leo", degree: "26°", startDegree: 330 }
      ],
      aspects: [],
      patterns: [
        {
          name: "Stellium",
          type: "major",
          description: "A powerful concentration of planetary energy",
          planets: [
            { name: "Sun", sign: "Leo", degree: "15° 30'" },
            { name: "Mercury", sign: "Virgo", degree: "9° 15'" },
            { name: "Venus", sign: "Leo", degree: "20° 45'" }
          ]
        }
      ]
    }

    setIsFormComplete(true)
    onSubmit(mockData)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="backdrop-blur-sm rounded-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 flex-col justify-center items-center">
        <div className="relative w-full">
          <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none ${name ? 'hidden' : 'block'}`}>
            <CircleUserRound className="w-4 h-4 text-gray-400 dark:text-white/40" />
          </div>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="border border-gray-200 dark:border-white/10 h-11 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/30 text-sm rounded-xl focus-visible:ring-1 focus-visible:ring-[#FFA600]/50 pl-10"
          />
        </div>

        <div className="relative w-full">
          <div className="flex items-center border border-gray-200 dark:border-white/10 h-11 rounded-xl focus-within:ring-1 focus-within:ring-[#FFA600]/50">
            <div className="pl-3">
              <CalendarDays className="w-4 h-4 text-gray-400 dark:text-white/40" />
            </div>
            <input
              type="date"
              value={date || ""}
              onChange={(e) => setDate(e.target.value)}
              max={format(new Date(), "yyyy-MM-dd")}
              placeholder="mm/dd/yyyy"
              className="bg-transparent border-0 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/40 text-sm rounded-xl focus:outline-none focus:ring-0 pl-4 pr-4 w-full h-11"
            />
          </div>
        </div>

        <div className="relative w-full">
          <LocationSearch onLocationSelect={handleLocationSelect} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-4 text-sm text-gray-900 dark:text-white/70">
            <span className="text-sm font-light">Birth Time</span>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="timeKnown"
                value="yes"
                checked={timeKnown === "yes"}
                onChange={(e) => setTimeKnown(e.target.value)}
                className="text-[#FFA600] focus:ring-[#FFA600]/50"
              />
              <span>Known</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="timeKnown"
                value="no"
                checked={timeKnown === "no"}
                onChange={(e) => setTimeKnown(e.target.value)}
                className="text-[#FFA600] focus:ring-[#FFA600]/50"
              />
              <span>Unknown</span>
            </label>
          </div>
          <div className="relative w-full">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <Clock className="w-4 h-4 text-gray-400 dark:text-white/40" />
            </div>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={timeKnown === "no"}
              placeholder="--:-- --"
              className="border border-gray-200 dark:border-white/10 h-11 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/40 text-sm rounded-xl focus-visible:ring-1 focus-visible:ring-[#FFA600]/50 pl-10"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={!validateForm()}
          className="w-full h-11 bg-gradient-to-r from-[#D15200] to-[#FFA600] hover:opacity-90 text-white font-medium mt-2 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Birth Chart
        </Button>
      </form>
    </motion.div>
  )
}
