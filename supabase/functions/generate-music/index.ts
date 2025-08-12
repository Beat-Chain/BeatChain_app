import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, duration: requestedDuration = 30, genre, style, test, structure_id } = await req.json()

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get the Loudly API key from Supabase secrets
    const LOUDLY_API_KEY = Deno.env.get('LOUDLY_API_KEY')
    
    if (!LOUDLY_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Prepare form data for Loudly API
    // Enforce Loudly duration constraints (30-420 seconds)
    const safeDuration = Math.max(30, Math.min(Number(requestedDuration) || 30, 420));
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('duration', safeDuration.toString());
    if (test === true) formData.append('test', 'true');
    if (typeof structure_id === 'number') formData.append('structure_id', String(structure_id));
    // Call the correct Loudly API endpoint
    const loudlyResponse = await fetch('https://soundtracks.loudly.com/api/ai/prompt/songs', {
      method: 'POST',
      headers: {
        'API-KEY': LOUDLY_API_KEY,
        'Accept': 'application/json',
      },
      body: formData,
    })

    if (!loudlyResponse.ok) {
      const errorText = await loudlyResponse.text()
      console.error('Loudly API error:', errorText)
      return new Response(
        JSON.stringify({ 
          error: 'Music generation failed', 
          details: errorText 
        }),
        { 
          status: loudlyResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const result = await loudlyResponse.json()
    console.log('Loudly API response:', result)
    
    return new Response(
      JSON.stringify({
        success: true,
        audioUrl: result.music_file_path || result.audio_url || result.url || result.download_url || result.file_url,
        data: result,
        metadata: {
          prompt,
          duration: safeDuration,
          genre,
          generatedAt: new Date().toISOString(),
          provider: 'loudly'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in generate-music function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})