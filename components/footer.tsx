"use client"

import { motion } from "framer-motion"
import Link from "next/link"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="h-14 border-t border-[#D15200]/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container h-full flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Link href="/about" className="text-sm text-muted-foreground hover:text-[#D15200] dark:hover:text-[#FFA600]">
            About
          </Link>
          <span className="text-muted-foreground">|</span>
          <Link href="/terms" className="text-sm text-muted-foreground hover:text-[#D15200] dark:hover:text-[#FFA600]">
            Terms
          </Link>
          <span className="text-muted-foreground">|</span>
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-[#D15200] dark:hover:text-[#FFA600]">
            Privacy
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          © {currentYear} AstroGenie. All rights reserved.
        </p>
      </div>
    </motion.footer>
  )
}
