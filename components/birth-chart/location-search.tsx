"use client"

import { useState } from 'react'
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

  const formatLocationName = (item: any): string => {
    try {
      // Extract city, state/region, and country from address parts
      const address = item.address || {}
      const city = address.city || address.town || address.village || address.municipality
      const state = address.state || address.region || address.county
      const country = address.country

      // Build location string with available parts
      const parts = []
      if (city) parts.push(city)
      if (state) parts.push(state)
      if (country) parts.push(country)

      // Return formatted string or fallback to a shorter version of display_name
      if (parts.length > 0) {
        return parts.join(', ')
      }

      // Fallback: take the first 3 parts of display_name
      return (item.display_name || '').split(',').slice(0, 3).join(',').trim()
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

    setLoading(true)
    setError(null)

    try {
      // Add delay parameter to avoid rate limiting
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` + 
        new URLSearchParams({
          format: 'json',
          q: searchQuery,
          addressdetails: '1',
          limit: '10',
          'accept-language': 'en'
        })
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const text = await response.text()
      let data
      try {
        data = JSON.parse(text)
      } catch (err) {
        console.error('Failed to parse response:', text)
        throw new Error('Invalid response from location service')
      }

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
        .filter(result => !isNaN(result.lat) && !isNaN(result.lng))

      setResults(formattedResults)
      if (formattedResults.length === 0) {
        setError('No locations found')
      }
    } catch (error) {
      console.error('Error searching location:', error)
      setError('Error searching location. Please try again.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setQuery(value)
    if (value.length >= 3) {
      // Debounce the search to avoid too many API calls
      const timeoutId = setTimeout(() => searchLocation(value), 800)
      return () => clearTimeout(timeoutId)
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

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Search for a location..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full"
      />
      
      {loading && (
        <div className="absolute right-3 top-3">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-gray-100"></div>
        </div>
      )}

      {error && (
        <div className="absolute z-10 w-full mt-1">
          <Card className="p-4 text-sm text-red-500 dark:text-red-400">
            {error}
          </Card>
        </div>
      )}

      {!error && results.length > 0 && (
        <Card className="absolute z-10 w-full mt-1 max-h-60 overflow-auto shadow-lg shadow-black/20">
          <ul className="py-1">
            {results.map((result, index) => (
              <li
                key={index}
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
