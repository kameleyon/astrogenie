import { createServerClient } from '@supabase/ssr'
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

function logDebug(message: string, data?: any) {
  const logMessage = data ? `[Auth Callback] ${message}: ${JSON.stringify(data)}` : `[Auth Callback] ${message}`
  console.log(logMessage)
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  logDebug('Starting auth callback', { code: !!code })

  if (code) {
    const cookieStore = cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: Partial<ResponseCookie>) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: Partial<ResponseCookie>) {
            cookieStore.set({ name, value: '', ...options })
          }
        }
      }
    )
    
    // Exchange the code for a session
    logDebug('Exchanging code for session')
    await supabase.auth.exchangeCodeForSession(code)

    // Get the user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      logDebug('Error getting user', userError)
      return NextResponse.redirect(`${requestUrl.origin}/auth/error`)
    }
    if (!user) {
      logDebug('No user found')
      return NextResponse.redirect(`${requestUrl.origin}/auth/error`)
    }
    logDebug('User found', { userId: user.id })

    // Check if user already has a subscription
    logDebug('Checking subscription status')
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (subError && subError.code !== 'PGRST116') {
      logDebug('Error checking subscription', subError)
      return NextResponse.redirect(`${requestUrl.origin}/auth/error`)
    }

    // If user has a subscription, redirect to chat
    if (subscription) {
      logDebug('Subscription found, redirecting to chat')
      return NextResponse.redirect(`${requestUrl.origin}/chat`)
    }

    // If no subscription, create Stripe checkout session
    try {
      logDebug('Creating Stripe checkout session')
      
      // Get session token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session) {
        logDebug('No session found', sessionError)
        throw new Error('No session found')
      }

      // Create Stripe checkout session using Edge Function
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
        'create-checkout',
        {
          body: {
            successUrl: `${requestUrl.origin}/billing/success`,
            priceId: 'price_1QcWIaGTXKQOsgznnZmYCk1q',
          }
        }
      )

      if (checkoutError) {
        logDebug('Checkout error', checkoutError)
        throw checkoutError
      }

      if (!checkoutData?.url) {
        logDebug('No checkout URL in response', checkoutData)
        throw new Error('No checkout URL in response')
      }

      logDebug('Redirecting to checkout', { url: checkoutData.url })
      return NextResponse.redirect(checkoutData.url)
    } catch (error: any) {
      logDebug('Error in checkout process', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/error`)
    }
  }

  // Something went wrong
  logDebug('No code provided')
  return NextResponse.redirect(`${requestUrl.origin}/auth/error`)
}
