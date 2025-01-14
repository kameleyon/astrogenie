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
      className="sticky top-0 z-50 w-full bg-background/1 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          
        </div>
        <ThemeToggle />
      </div>
    </motion.header>
  )
}
