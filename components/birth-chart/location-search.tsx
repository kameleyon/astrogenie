"use client"

import { useState, useRef, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export interface LocationSearchProps {
  onSelect: (location: { name: string; lat: number; lng: number }) => void
}

export function LocationSearch({ onSelect }: LocationSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Array<{
    name: string
    lat: number
    lng: number
  }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const lastRequestRef = useRef<number>(0)

  const formatLocationName = (item: any): string => {
    try {
      const address = item.address || {}
      const parts = []

      // City/town/village
      const city = address.city || address.town || address.village || address.municipality
      if (city) parts.push(city)

      // State/region/county
      const state = address.state || address.region || address.county
      if (state && state !== city) parts.push(state)

      // Country
      const country = address.country
      if (country) parts.push(country)

      if (parts.length > 0) {
        return parts.join(', ')
      }

      // Fallback: clean up display_name
      return item.display_name
        .split(',')
        .map((part: string) => part.trim())
        .filter((part: string, index: number, array: string[]) => 
          array.indexOf(part) === index && part.length > 0
        )
        .slice(0, 3)
        .join(', ')
    } catch (err) {
      console.error('Error formatting location name:', err)
      return item.display_name || 'Unknown location'
    }
  }

  const searchLocation = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setError(null)
      return
    }

    // Rate limiting
    const now = Date.now()
    if (now - lastRequestRef.current < 1000) {
      return // Skip if less than 1 second since last request
    }
    lastRequestRef.current = now

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` + 
        new URLSearchParams({
          format: 'json',
          q: searchQuery,
          addressdetails: '1',
          limit: '5',
          'accept-language': 'en'
        }),
        {
          headers: {
            'User-Agent': 'AstroGenie/1.0'
          }
        }
      )

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Please wait a moment before searching again')
        }
        throw new Error('Location search failed')
      }

      const data = await response.json()
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format')
      }

      const formattedResults = data
        .filter(item => item && typeof item === 'object' && item.lat && item.lon)
        .map(item => ({
          name: formatLocationName(item),
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        }))
        .filter(result => 
          !isNaN(result.lat) && 
          !isNaN(result.lng) &&
          result.name.length > 0
        )

      // Remove duplicates
      const uniqueResults = formattedResults.filter((result, index, self) =>
        index === self.findIndex(r => r.name === result.name)
      )

      setResults(uniqueResults)
      if (uniqueResults.length === 0) {
        setError('No locations found. Please try a different search term.')
      }
    } catch (error: any) {
      console.error('Error searching location:', error)
      setError(error.message || 'Error searching location. Please try again.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setQuery(value)
    
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (value.length >= 3) {
      // Set new timeout for search
      searchTimeoutRef.current = setTimeout(() => {
        searchLocation(value)
      }, 500)
    } else {
      setResults([])
      setError(null)
    }
  }

  const handleSelect = (location: { name: string; lat: number; lng: number }) => {
    onSelect(location)
    setQuery(location.name)
    setResults([])
    setError(null)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setResults([])
        setError(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <Input
        type="text"
        placeholder="Search for a location..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full"
        autoComplete="off"
      />
      
      {loading && (
        <div className="absolute right-3 top-3">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-gray-100"></div>
        </div>
      )}

      {error && query.length > 0 && (
        <div className="absolute z-10 w-full mt-1">
          <Card className="p-4 text-sm text-red-500 dark:text-red-400">
            {error}
          </Card>
        </div>
      )}

      {!error && results.length > 0 && (
        <Card className="absolute z-10 w-full mt-1 shadow-lg shadow-black/20">
          <ul className="py-1">
            {results.map((result, index) => (
              <li
                key={`${result.name}-${index}`}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-sm"
                onClick={() => handleSelect(result)}
              >
                {result.name}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
