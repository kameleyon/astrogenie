 import { createServerClient } from '@supabase/ssr'
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

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
    await supabase.auth.exchangeCodeForSession(code)

    // Get the user
    const { data: { user } } = await supabase.auth.getUser()

      // After email verification, create Stripe checkout session
      try {
        console.log('Creating Stripe checkout session...');
        
        // Get session token
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.error('No session found');
          throw new Error('No session found');
        }

        // Create Stripe checkout session using Edge Function
        const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
          'create-checkout',
          {
            body: {
              successUrl: `${requestUrl.origin}/billing/success`,
              priceId: 'price_1QcWIaGTXKQOsgznnZmYCk1q', // Hardcoded Stripe price ID
            }
          }
        );

        if (checkoutError) {
          console.error('Checkout error:', checkoutError);
          throw checkoutError;
        }

        if (!checkoutData?.url) {
          console.error('No checkout URL in response:', checkoutData);
          throw new Error('No checkout URL in response');
        }

        return NextResponse.redirect(checkoutData.url);
      } catch (error) {
        console.error('Error in auth callback:', error);
        return NextResponse.redirect(`${requestUrl.origin}/auth/error`);
      }
  }

  // Something went wrong
  return NextResponse.redirect(`${requestUrl.origin}/auth/error`)
}
