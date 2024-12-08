"use client"

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LocationSearch } from './location-search'

interface FormData {
  name: string
  date: string
  time: string
  location: string
  latitude: number
  longitude: number
}

interface BirthChartFormProps {
  onSubmit: (formData: FormData) => Promise<void>
}

export function BirthChartForm({ onSubmit }: BirthChartFormProps) {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [formData, setFormData] = useState<FormData>({
    name: '',
    date: '',
    time: '',
    location: '',
    latitude: 0,
    longitude: 0
  })

  const validateForm = (): string[] => {
    const errors: string[] = []

    if (!formData.name.trim()) {
      errors.push('Name is required')
    }

    if (!formData.date) {
      errors.push('Birth date is required')
    }

    if (!formData.time) {
      errors.push('Birth time is required')
    }

    if (!formData.location || (formData.latitude === 0 && formData.longitude === 0)) {
      errors.push('Birth location is required')
    }

    return errors
  }

  const handleLocationSelect = (location: { name: string; lat: number; lng: number }) => {
    setFormData(prev => ({
      ...prev,
      location: location.name,
      latitude: location.lat,
      longitude: location.lng
    }))
    setErrors([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors([])

    try {
      // Validate form data
      const validationErrors = validateForm()
      if (validationErrors.length > 0) {
        setErrors(validationErrors)
        setLoading(false)
        return
      }

      await onSubmit(formData)
    } catch (error) {
      console.error('Error submitting form:', error)
      if (error instanceof Error) {
        setErrors([error.message])
      } else {
        setErrors(['An unexpected error occurred'])
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6 shadow-lg shadow-black/20">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Input */}
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>

        {/* Date Input */}
        <div className="space-y-2">
          <Label htmlFor="date">Birth Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            required
          />
        </div>

        {/* Time Input */}
        <div className="space-y-2">
          <Label htmlFor="time">Birth Time (24-hour format)</Label>
          <Input
            id="time"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
            required
          />
        </div>

        {/* Location Search */}
        <div className="space-y-2">
          <Label>Birth Location</Label>
          <LocationSearch onSelect={handleLocationSelect} />
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="space-y-1">
            {errors.map((error, index) => (
              <div key={index} className="text-sm text-red-500 dark:text-red-400">
                • {error}
              </div>
            ))}
          </div>
        )}

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Calculating...' : 'Calculate Birth Chart'}
        </Button>
      </form>
    </Card>
  )
}
