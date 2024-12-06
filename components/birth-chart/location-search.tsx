"use client"

import { useEffect, useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { MapPin, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Location {
  place_name: string
  center: [number, number] // [longitude, latitude]
}

interface LocationSearchProps {
  onLocationSelect: (location: { name: string; coordinates: [number, number] }) => void
}

export function LocationSearch({ onLocationSelect }: LocationSearchProps) {
  const [value, setValue] = useState("")
  const [locations, setLocations] = useState<Location[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const searchLocations = async () => {
      if (value.length < 3) {
        setLocations([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)
      
      try {
        const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          value
        )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&types=place`
        
        const response = await fetch(endpoint)
        if (!response.ok) throw new Error('Failed to fetch locations')
        
        const data = await response.json()
        if (data.features) {
          setLocations(data.features)
          setIsOpen(true)
        } else {
          setLocations([])
        }
      } catch (error) {
        console.error("Error fetching locations:", error)
        setError("Failed to load locations. Please try again.")
        setLocations([])
      } finally {
        setIsLoading(false)
      }
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Set new timeout
    searchTimeoutRef.current = setTimeout(searchLocations, 300)

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
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

  const handleLocationSelect = (location: Location) => {
    setValue(location.place_name)
    setIsOpen(false)
    setLocations([]) // Clear locations after selection
    onLocationSelect({
      name: location.place_name,
      coordinates: location.center
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    if (newValue.length >= 3) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
      setLocations([])
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <MapPin className="w-4 h-4 text-gray-400 dark:text-white/40" />
        </div>
        <Input
          placeholder="Start typing your birth place..."
          value={value}
          onChange={handleInputChange}
          onFocus={() => value.length >= 3 && setIsOpen(true)}
          className="border border-gray-200 dark:border-white/10 h-11 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/30 text-sm rounded-xl focus-visible:ring-1 focus-visible:ring-[#FFA600]/50 pl-10"
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          </div>
        )}
      </div>
      
      <AnimatePresence>
        {isOpen && (locations.length > 0 || error) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-white dark:bg-black/90 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-lg shadow-lg overflow-hidden max-h-64 overflow-y-auto"
          >
            {error ? (
              <div className="px-4 py-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            ) : locations.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                No locations found
              </div>
            ) : (
              locations.map((location) => (
                <button
                  key={location.place_name}
                  onClick={() => handleLocationSelect(location)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-white/5 flex items-center space-x-3 text-gray-900 dark:text-white"
                >
                  <MapPin className="h-4 w-4 text-[#FFA600]" />
                  <span className="text-sm truncate">{location.place_name}</span>
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
