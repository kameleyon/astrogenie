"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

export function LoginForm({ onSignUpClick }: { onSignUpClick: () => void }) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  const addDebugInfo = (info: string) => {
    console.log('Debug:', info)
    setDebugInfo(prev => [...prev, info])
    toast({
      title: "Debug Info",
      description: info,
      duration: 5000,
    })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setDebugInfo([]) // Reset debug info
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      addDebugInfo("Starting login process...")

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      })

      if (error) throw error
      addDebugInfo(`Login successful for user: ${data.user.id}`)

      // Check subscription status
      addDebugInfo("Checking subscription status...")
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', data.user.id)
        .single()

      if (subError && subError.code !== 'PGRST116') {
        throw subError
      }

      toast({
        title: "Success",
        description: "Successfully logged in",
      })

      // Wait for toast to show before redirecting
      await new Promise(resolve => setTimeout(resolve, 500))

      // If user has subscription, redirect to chat
      // Otherwise, redirect to checkout
      if (subscription) {
        addDebugInfo("Subscription found, redirecting to chat...")
        // Force a hard navigation to /chat
        window.location.href = '/chat'
        // Fallback in case the above doesn't work
        setTimeout(() => {
          router.push('/chat')
        }, 100)
      } else {
        addDebugInfo("No subscription, creating checkout session...")
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
      }

    } catch (error: any) {
      addDebugInfo(`Error: ${error.message}`)
      toast({
        title: "Error",
        description: error.message || "An error occurred during login",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6 p-6 bg-card rounded-lg border border-[#D15200]/20 bg-white/5 shadow-xl">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
        <p className="text-sm text-muted-foreground">
          Sign in to your account to continue
        </p>
      </div>
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            placeholder="user@example.com"
            type="email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="remember" 
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <label
              htmlFor="remember"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Remember me
            </label>
          </div>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-[#D15200] hover:text-[#FFA600] dark:text-[#FFA600] dark:hover:text-[#D15200]"
          >
            Forgot password?
          </Link>
        </div>
        <Button 
          type="submit"
          className="w-full bg-gradient-to-r from-[#D15200] to-[#FFA600] text-white hover:opacity-90"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Continue"}
        </Button>
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={onSignUpClick}
            className="font-medium text-[#D15200] hover:text-[#FFA600] dark:text-[#FFA600] dark:hover:text-[#D15200]"
          >
            Sign up
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
    </div>
  )
}
