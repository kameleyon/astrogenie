import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, year } = await req.json();
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } }
      }
    );

    // Verify user exists
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('User not found');

    // Get user's birth chart data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('birth_date, birth_time, birth_location')
      .eq('id', userId)
      .single();

    if (profileError) throw new Error('Birth chart data not found');
    if (!profile.birth_date || !profile.birth_time || !profile.birth_location) {
      throw new Error('Incomplete birth chart data');
    }

    // TODO: Generate annual report using birth chart data and specified year
    const report = {
      year,
      overview: "Your annual astrological report...",
      sections: [
        {
          title: "Career & Finance",
          content: "This year brings opportunities..."
        },
        {
          title: "Relationships",
          content: "Your relationships will..."
        }
      ]
    };

    return new Response(
      JSON.stringify(report),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error generating report:', error);
    const err = error as Error;
    return new Response(
      JSON.stringify({ 
        error: err.message || 'Failed to generate annual report',
        details: err.stack || ''
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
