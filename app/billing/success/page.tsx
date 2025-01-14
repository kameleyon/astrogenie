"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"

export default function BillingSuccessPage() {
  const router = useRouter()

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto space-y-8 text-center"
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Welcome to AstroGenie!</h1>
          <p className="text-muted-foreground">
            Your 3-day trial has started. What would you like to do first?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 hover:border-[#D15200] transition-colors">
            <h2 className="text-xl font-semibold mb-2">Ask AstroGenie</h2>
            <p className="text-muted-foreground mb-4">
              Get personalized astrological guidance and answers to your questions.
            </p>
            <Button
              onClick={() => router.push("/chat")}
              className="w-full bg-gradient-to-r from-[#D15200] to-[#FFA600] text-white hover:opacity-90"
            >
              Start Chat
            </Button>
          </Card>

          <Card className="p-6 hover:border-[#D15200] transition-colors">
            <h2 className="text-xl font-semibold mb-2">View My Profile</h2>
            <p className="text-muted-foreground mb-4">
              Explore your birth chart and discover your astrological insights.
            </p>
            <Button
              onClick={() => router.push("/birth-chart")}
              className="w-full bg-gradient-to-r from-[#D15200] to-[#FFA600] text-white hover:opacity-90"
            >
              View Birth Chart
            </Button>
          </Card>
        </div>

        <p className="text-sm text-muted-foreground mt-8">
          Your card will be charged $7.99 after the 3-day trial period.
        </p>
      </motion.div>
    </div>
  )
}
