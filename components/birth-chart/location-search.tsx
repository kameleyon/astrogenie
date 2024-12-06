"use client"

import { useEffect, useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { MapPin } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Location {
  place_name: string
  center: [number, number]
}

interface LocationSearchProps {
  onLocationSelect: (location: { name: string; coordinates: [number, number] }) => void
}

export function LocationSearch({ onLocationSelect }: LocationSearchProps) {
  const [value, setValue] = useState("")
  const [locations, setLocations] = useState<Location[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const searchLocations = async () => {
      if (value.length < 3) {
        setLocations([])
        return
      }
      
      const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        value
      )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&types=place`
      
      try {
        const response = await fetch(endpoint)
        const data = await response.json()
        setLocations(data.features)
        setIsOpen(true)
      } catch (error) {
        console.error("Error fetching locations:", error)
      }
    }

    const debounce = setTimeout(searchLocations, 300)
    return () => clearTimeout(debounce)
  }, [value])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <MapPin className="w-4 h-4 text-gray-400 dark:text-white/40" />
        </div>
        <Input
          placeholder="Start typing your birth place..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-0 h-10 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/30 text-sm rounded-xl focus-visible:ring-1 focus-visible:ring-[#FFA600]/50 pl-10"
        />
      </div>
      
      <AnimatePresence>
        {isOpen && locations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-white dark:bg-black/90 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-lg shadow-lg overflow-hidden max-h-64"
          >
            {locations.map((location) => (
              <button
                key={location.place_name}
                onClick={() => {
                  onLocationSelect({
                    name: location.place_name,
                    coordinates: location.center,
                  })
                  setValue(location.place_name)
                  setIsOpen(false)
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-white/5 flex items-center space-x-3 text-gray-900 dark:text-white"
              >
                <MapPin className="h-4 w-4 text-[#FFA600]" />
                <span className="text-sm truncate">{location.place_name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
