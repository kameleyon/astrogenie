"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { LoginForm } from "@/components/auth/login-form"
import { SignUpForm } from "@/components/auth/signup-form"

export default function Home() {
  const [showSignUp, setShowSignUp] = useState(false)

  return (
    <div className="min-h-[calc(100vh-9rem)] flex items-center">
      <div className="container px-4 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center px-8">
          {/* Left side - Hero */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Image
                src="/astrogenieorange.png"
                alt="AstroGenie Logo"
                width={300}
                height={300}
                priority
                className="mb-2"
              />
            </motion.div>
            <div className="space-y-4 text-center">
              <h1 className="font-futura text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-gray-900 dark:text-white whitespace-nowrap min-w-max">
                Welcome to <span className="bg-gradient-to-r from-[#D15200] to-[#FFA600] bg-clip-text text-transparent">AstroGenie</span>
              </h1>
              <p className="font-lato max-w-[700px] text-gray-600 dark:text-gray-400 md:text-2xl">
                Your AI-powered personalized companion and guide.
              </p>
            </div>
            <Button 
              onClick={() => setShowSignUp(true)}
              className="w-full md:w-auto bg-gradient-to-r from-[#D15200] to-[#FFA600] text-white hover:opacity-90 text-lg px-8"
            >
              Join for FREE!
            </Button>
          </motion.div>

          {/* Right side - Auth Forms */}
          <div className="flex justify-center md:justify-end">
            {showSignUp ? (
              <SignUpForm onLoginClick={() => setShowSignUp(false)} />
            ) : (
              <LoginForm onSignUpClick={() => setShowSignUp(true)} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
