"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { BirthChartData } from "@/lib/types/birth-chart"
import { Sun, Moon, ArrowUp } from "lucide-react"

interface AstrologicalProfileProps {
  data: BirthChartData
}

export function AstrologicalProfile({ data }: AstrologicalProfileProps) {
  // Extract sun, moon signs from planets array
  const sunSign = data.planets.find(p => p.name === "Sun")?.sign
  const moonSign = data.planets.find(p => p.name === "Moon")?.sign
  // Get ascendant from first house
  const ascendant = data.houses[0]?.sign

  const profiles = [
    {
      title: "Sun Sign",
      sign: sunSign,
      icon: Sun,
      description: "Your core essence and personality",
      gradient: "from-orange-500 to-yellow-500",
    },
    {
      title: "Moon Sign",
      sign: moonSign,
      icon: Moon,
      description: "Your emotional nature and inner self",
      gradient: "from-blue-500 to-purple-500",
    },
    {
      title: "Ascendant",
      sign: ascendant,
      icon: ArrowUp,
      description: "Your social personality and approach to life",
      gradient: "from-green-500 to-teal-500",
    },
  ]

  return (
    <div className="space-y-4">
      {profiles.map((profile, index) => (
        <motion.div
          key={profile.title}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.2 }}
        >
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-full bg-gradient-to-r ${profile.gradient}`}>
                <profile.icon className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">{profile.title}</h3>
                <p className="text-2xl font-bold">{profile.sign}</p>
                <p className="text-sm text-muted-foreground">
                  {profile.description}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
