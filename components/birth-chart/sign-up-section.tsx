"use client"

import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Calendar, 
  Users, 
  MessageSquare, 
  Sparkles 
} from 'lucide-react'

interface SignUpSectionProps {
  birthChartData: {
    name: string
    date: string
    time: string
    location: string
  }
}

export function SignUpSection({ birthChartData }: SignUpSectionProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const features = [
    {
      title: "Your Life Report",
      description: "Get a detailed analysis of your life path and potential",
      icon: BookOpen
    },
    {
      title: "The Year Ahead",
      description: "Discover what the stars have planned for your future",
      icon: Calendar
    },
    {
      title: "Compatibility Check",
      description: "Find out how your chart connects with others",
      icon: Users
    },
    {
      title: "Chat with Astrogenie",
      description: "Get personalized astrological guidance anytime",
      icon: MessageSquare
    },
    {
      title: "Understand My Chart",
      description: "Deep dive into your unique astrological blueprint",
      icon: Sparkles
    }
  ]

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement sign up logic and save birth chart details
    console.log('Sign up with:', { email, password, birthChartData })
  }

  return (
    <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-orange-400 to-orange-600 shadow-2xl">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h2 className="text-2xl font-futura text-white mb-2">
            Join for Free
          </h2>
          <p className="text-white/80">
            Unlock your complete astrological journey
          </p>
        </motion.div>

        <div className="grid md:grid-cols-1 gap-8">
          {/* Sign Up Form */}
          <motion.form
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSignUp}
            className="space-y-4"
          >
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
            <Button
              type="submit"
              className="w-full bg-white text-orange-600 hover:bg-white/90"
            >
              Sign Up Now
            </Button>
            <p className="text-xs text-white/60 text-center">
              Your birth chart details will be automatically saved
            </p>
          </motion.form>

          {/* Features List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-start space-x-3"
              >
                <feature.icon className="w-5 h-5 text-white" />
                <div>
                  <h3 className="text-white font-medium">
                    {feature.title}
                  </h3>
                  <p className="text-white/70 text-sm">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
