import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, systemPrompt } from './config';
import { generateAiResponse } from './aiService';
import { handleCredits } from './creditsService';

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

interface ChatRequest {
  message: string;
  userId: string;
  context: Array<{ isUser: boolean; text: string; }>;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not configured');
    }

    const { message, userId, context } = await req.json() as ChatRequest;
    console.log('Received request:', { message, userId, context });

    if (!message) {
      throw new Error('Message is required');
    }

    // Check subscription status with better error handling
    try {
      const subscriptionResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/subscriptions?user_id=eq.${userId}&select=credits_remaining`,
        {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY || '',
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
        }
      );

      if (!subscriptionResponse.ok) {
        console.error('Subscription fetch failed:', subscriptionResponse.status, await subscriptionResponse.text());
        throw new Error(`Failed to fetch subscription: ${subscriptionResponse.status}`);
      }

      const subscription = await subscriptionResponse.json();
      console.log('Subscription data:', subscription);

      if (!subscription || subscription.length === 0) {
        throw new Error('No active subscription found');
      }

      if (subscription[0].credits_remaining <= 0) {
        throw new Error('No credits remaining');
      }
    } catch (error: unknown) {
      console.error('Subscription check error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Subscription check failed', 
          details: error instanceof Error ? error.message : 'Unknown error'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate AI response
    const aiResponse = await generateAiResponse(
      message,
      context,
      OPENROUTER_API_KEY,
      systemPrompt
    );

    if (!aiResponse.success || !aiResponse.data?.choices?.[0]?.message?.content) {
      throw new Error(aiResponse.error || 'Invalid AI response format');
    }

    // Handle credits
    const creditsResult = await handleCredits(
      userId,
      message,
      aiResponse.data.choices[0].message.content,
      SUPABASE_URL || '',
      SUPABASE_SERVICE_ROLE_KEY || ''
    );

    if (!creditsResult.success) {
      throw new Error(creditsResult.error || 'Failed to handle credits');
    }

    return new Response(
      JSON.stringify({
        ...aiResponse.data,
        credits_used: creditsResult.totalTokens
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  } catch (error: unknown) {
    console.error('Error in chat function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorStack 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
});