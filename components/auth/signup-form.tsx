"use client"

import { useState, useRef } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { validateSignUpForm } from "./utils/validation"
import { motion } from "framer-motion"

export function SignUpForm({ onLoginClick }: { onLoginClick: () => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [retryAfter, setRetryAfter] = useState(0)
  const { toast } = useToast()
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const retryIntervalRef = useRef<NodeJS.Timeout>()

  const addDebugInfo = (info: string) => {
    console.log('Debug:', info)
    setDebugInfo(prev => [...prev, info])
    toast({
      title: "Debug Info",
      description: info,
      duration: 5000,
    })
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setDebugInfo([]) // Reset debug info
    
    const validationError = validateSignUpForm(email, password, confirmPassword, agreeToTerms)
    if (validationError) {
      toast({
        title: "Error",
        description: validationError,
        variant: "destructive"
      })
      return
    }

    if (retryAfter > 0) {
      toast({
        title: "Please wait",
        description: `You can try again in ${retryAfter} seconds.`,
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      addDebugInfo("Starting signup process...")

      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.trim())
        .maybeSingle()

      if (existingUser) {
        addDebugInfo("Email already registered")
        toast({
          title: "Email already registered",
          description: "This email is already registered. Please try logging in instead.",
          duration: 5000,
        })
        onLoginClick()
        return
      }

      // Sign up with Supabase
      addDebugInfo("Creating new user account...")
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            email: email.trim()
          }
        }
      })

      if (error) {
        // Handle rate limiting
        if (error.status === 429) {
          const waitTimeMatch = error.message.match(/\d+/)
          const waitTime = waitTimeMatch ? parseInt(waitTimeMatch[0]) : 60
          setRetryAfter(waitTime)
          
          // Clear any existing interval
          if (retryIntervalRef.current) {
            clearInterval(retryIntervalRef.current)
          }

          // Set up new interval
          retryIntervalRef.current = setInterval(() => {
            setRetryAfter((prev) => {
              if (prev <= 1) {
                if (retryIntervalRef.current) {
                  clearInterval(retryIntervalRef.current)
                }
                return 0
              }
              return prev - 1
            })
          }, 1000)

          addDebugInfo(`Rate limited: Wait ${waitTime} seconds`)
          toast({
            title: "Too many attempts",
            description: `Please wait ${waitTime} seconds before trying again.`,
            duration: waitTime * 1000,
          })
          return
        }

        addDebugInfo(`Error: ${error.message}`)
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        })
        return
      }

      addDebugInfo("Account created successfully")
      
      // Create Stripe checkout session
      addDebugInfo("Creating checkout session...")
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
        'create-checkout',
        {
          body: {
            successUrl: `${window.location.origin}/billing/success`,
            priceId: 'price_1QcWIaGTXKQOsgznnZmYCk1q',
          }
        }
      )

      if (checkoutError) {
        addDebugInfo(`Checkout error: ${checkoutError.message}`)
        throw checkoutError
      }

      if (!checkoutData?.url) {
        addDebugInfo("No checkout URL in response")
        throw new Error('No checkout URL in response')
      }

      addDebugInfo("Redirecting to checkout...")
      window.location.href = checkoutData.url

      toast({
        title: "Success",
        description: "Please check your email to verify your account.",
        duration: 5000,
      })

    } catch (error: any) {
      addDebugInfo(`Error: ${error.message}`)
      toast({
        title: "Error",
        description: error.message || "An error occurred during signup",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md space-y-6 p-6 bg-card rounded-lg border border-[#D15200]/20 bg-white/5 shadow-xl"
    >
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">JOIN FOR FREE!</h2>
        <p className="text-sm text-muted-foreground">
          Start your 3-days trial! Your card won&apos;t be charged for 3 days.
        </p>
      </div>
      <form onSubmit={handleSignUp} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading || retryAfter > 0}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || retryAfter > 0}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading || retryAfter > 0}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="terms" 
            checked={agreeToTerms}
            onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
          />
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I agree with the{" "}
            <Link
              href="/terms"
              className="text-[#D15200] hover:text-[#FFA600] dark:text-[#FFA600] dark:hover:text-[#D15200]"
            >
              terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-[#D15200] hover:text-[#FFA600] dark:text-[#FFA600] dark:hover:text-[#D15200]"
            >
              policy
            </Link>
          </label>
        </div>
        <Button 
          type="submit"
          className="w-full bg-gradient-to-r from-[#D15200] to-[#FFA600] text-white hover:opacity-90"
          disabled={loading || retryAfter > 0}
        >
          {loading ? "Creating account..." : retryAfter > 0 ? `Try again in ${retryAfter}s` : "Start your 3 days trial"}
        </Button>
        <div className="text-center text-sm">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onLoginClick}
            className="font-medium text-[#D15200] hover:text-[#FFA600] dark:text-[#FFA600] dark:hover:text-[#D15200]"
          >
            Login Now
          </button>
        </div>
      </form>

      {/* Debug Info */}
      {debugInfo.length > 0 && (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <ul className="space-y-1">
            {debugInfo.map((info, i) => (
              <li key={i} className="text-xs">{info}</li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  )
}
