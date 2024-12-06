"use client"

import { motion } from "framer-motion"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="h-14 border-t border-[#D15200]/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container h-full flex items-center justify-center px-4">
        <p className="text-center text-sm text-muted-foreground">
          © {currentYear} AstroGenie. All rights reserved.
        </p>
      </div>
    </motion.footer>
  )
}