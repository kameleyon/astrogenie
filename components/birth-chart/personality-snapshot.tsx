"use client"

import { Card } from "@/components/ui/card"

interface Trait {
  title: string
  description: string
  influence: string
  strength: "weak" | "moderate" | "strong"
  keywords: string[]
}

interface PersonalitySnapshotProps {
  traits: Trait[]
  summary: string
  dominantElements: {
    fire?: string
    earth?: string
    air?: string
    water?: string
  }
  dominantQualities: {
    cardinal?: string
    fixed?: string
    mutable?: string
  }
}

export function PersonalitySnapshot({
  traits,
  summary,
  dominantElements,
  dominantQualities
}: PersonalitySnapshotProps) {
  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Core Personality Traits</h3>
        <div className="space-y-4">
          {traits.map((trait, index) => (
            <div key={index} className="space-y-2">
              <h4 className="font-medium">{trait.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">{trait.description}</p>
              <div className="flex flex-wrap gap-2">
                {trait.keywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Element Balance</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(dominantElements).map(([element, value]) => (
            <div key={element} className="flex items-center gap-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${getElementColor(element)}`}
                  style={{ width: value }}
                ></div>
              </div>
              <span className="text-sm min-w-[60px]">{element}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Modality Distribution</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(dominantQualities).map(([quality, value]) => (
            <div key={quality} className="flex items-center gap-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${getQualityColor(quality)}`}
                  style={{ width: value }}
                ></div>
              </div>
              <span className="text-sm min-w-[60px]">{quality}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Summary</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">{summary}</p>
      </div>
    </Card>
  )
}

function getElementColor(element: string): string {
  switch (element.toLowerCase()) {
    case 'fire':
      return 'bg-red-500'
    case 'earth':
      return 'bg-green-500'
    case 'air':
      return 'bg-blue-500'
    case 'water':
      return 'bg-purple-500'
    default:
      return 'bg-gray-500'
  }
}

function getQualityColor(quality: string): string {
  switch (quality.toLowerCase()) {
    case 'cardinal':
      return 'bg-orange-500'
    case 'fixed':
      return 'bg-indigo-500'
    case 'mutable':
      return 'bg-teal-500'
    default:
      return 'bg-gray-500'
  }
}
