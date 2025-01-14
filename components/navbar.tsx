"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ThemeToggle } from "./theme-toggle"

export function Navbar() {
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
              src="/astrogenieorange.png"
              alt="AstroGenie Logo"
              width={40}
              height={40}
              priority
            />
            <span className="hidden font-bold sm:inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#D15200] to-[#FFA600]">
              AstroGenie
            </span>
          </Link>
        </div>
        <ThemeToggle />
      </div>
    </motion.header>
  )
}
