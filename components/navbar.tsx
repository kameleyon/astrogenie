"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ThemeToggle } from "./theme-toggle"
import { Menu, X } from "lucide-react"
import { Button } from "./ui/button"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full border-b border-[#D15200]/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="https://i.ibb.co/QXMF9kd/astrogenie-2.png"
              alt="AstroGenie Logo"
              width={40}
              height={40}
              
            />
            <span className="hidden font-bold sm:inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#D15200] to-[#FFA600]">
              AstroGenie
            </span>
          </Link>
        </div>

        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="h-10 w-10"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <nav className="flex items-center space-x-6">
            <Link
              href="/compatibility"
              className="text-sm font-medium transition-colors hover:text-[#D15200] dark:hover:text-[#FFA600]"
            >
              Compatibility
            </Link>
            <Link
              href="/birth-chart"
              className="text-sm font-medium transition-colors hover:text-[#D15200] dark:hover:text-[#FFA600]"
            >
              Birth Chart
            </Link>
            <Link
              href="/ask"
              className="text-sm font-medium transition-colors hover:text-[#D15200] dark:hover:text-[#FFA600]"
            >
              Ask AstroGenie
            </Link>
          </nav>
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden border-t border-[#D15200]/20"
        >
          <nav className="flex flex-col space-y-4 p-4">
            <Link
              href="/compatibility"
              className="text-sm font-medium transition-colors hover:text-[#D15200] dark:hover:text-[#FFA600]"
              onClick={() => setIsMenuOpen(false)}
            >
              Compatibility
            </Link>
            <Link
              href="/birth-chart"
              className="text-sm font-medium transition-colors hover:text-[#D15200] dark:hover:text-[#FFA600]"
              onClick={() => setIsMenuOpen(false)}
            >
              Birth Chart
            </Link>
            <Link
              href="/ask"
              className="text-sm font-medium transition-colors hover:text-[#D15200] dark:hover:text-[#FFA600]"
              onClick={() => setIsMenuOpen(false)}
            >
              Ask AstroGenie
            </Link>
            <div className="pt-2">
              <ThemeToggle />
            </div>
          </nav>
        </motion.div>
      )}
    </motion.header>
  )
}