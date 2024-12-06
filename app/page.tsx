"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Stars } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-9rem)] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container px-4 md:px-6"
      >
        <div className="flex flex-col items-center space-y-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Image
              src="/astrogenie.png"
              alt="AstroGenie Logo"
              width={200}
              height={200}
              priority
              className="mb-2"
            />
          </motion.div>
          <div className="space-y-4">
            <h1 className="font-futura text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-gray-900 dark:text-white">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-[#D15200] to-[#FFA600] bg-clip-text text-transparent">
                AstroGenie
              </span>
            </h1>
            <p className="font-lato mx-auto max-w-[700px] text-gray-600 dark:text-gray-400 md:text-xl">
              Your personal AI-powered astrological companion. Discover your cosmic path and unlock the secrets written in the stars.
            </p>
          </div>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <Link href="/ask">
              <Button className="font-lato w-full sm:w-auto bg-gradient-to-r from-[#D15200] to-[#FFA600] text-white hover:opacity-90">
                Ask AstroGenie
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/birth-chart">
              <Button 
                variant="outline" 
                className="font-lato w-full sm:w-auto border-[#D15200] text-[#D15200] hover:bg-[#D15200] hover:text-white dark:border-[#FFA600] dark:text-[#FFA600] dark:hover:text-white hover:bg-[#FFA600]"
              >
                View Birth Chart
                <Stars className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
