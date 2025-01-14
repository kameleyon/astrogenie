"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { validateSignUpForm } from "./utils/validation"

interface SignUpFormProps {
  onLoginClick: () => void
}

export function SignUpForm({ onLoginClick }: SignUpFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [retryAfter, setRetryAfter] = useState(0)
  const { toast } = useToast()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
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

      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.trim())
        .maybeSingle()

      if (existingUser) {
        toast({
          title: "Email already registered",
          description: "This email is already registered. Please try logging in instead.",
          duration: 5000,
        })
        onLoginClick()
        return
      }

      // Sign up with Supabase
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
          
          const interval = setInterval(() => {
            setRetryAfter((prev) => {
              if (prev <= 1) {
                clearInterval(interval)
                return 0
              }
              return prev - 1
            })
          }, 1000)

          toast({
            title: "Too many attempts",
            description: `Please wait ${waitTime} seconds before trying again.`,
            duration: waitTime * 1000,
          })
          return
        }

        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Success",
        description: "Please check your email to verify your account.",
        duration: 5000,
      })

    } catch (error: any) {
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
    <div className="w-full max-w-md space-y-6 p-6 bg-card rounded-lg border border-[#D15200]/20 bg-white/5 shadow-xl">
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
    </div>
  )
}
