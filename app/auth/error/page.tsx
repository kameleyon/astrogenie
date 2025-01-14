"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AuthErrorPage() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-6 p-6 bg-card rounded-lg border border-[#D15200]/20 bg-white/5 shadow-xl"
      >
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Authentication Error</h2>
          <p className="text-sm text-muted-foreground">
            There was a problem with your authentication request. This could be because:
          </p>
          <ul className="text-sm text-muted-foreground mt-4 space-y-2">
            <li>• The link you clicked has expired</li>
            <li>• You&apos;ve already used this link</li>
            <li>• There was a technical problem</li>
          </ul>
        </div>
        <div className="space-y-4">
          <Button 
            asChild
            className="w-full bg-gradient-to-r from-[#D15200] to-[#FFA600] text-white hover:opacity-90"
          >
            <Link href="/login">
              Back to Login
            </Link>
          </Button>
          <div className="text-center text-sm">
            Need help?{" "}
            <Link
              href="/support"
              className="font-medium text-[#D15200] hover:text-[#FFA600] dark:text-[#FFA600] dark:hover:text-[#D15200]"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
