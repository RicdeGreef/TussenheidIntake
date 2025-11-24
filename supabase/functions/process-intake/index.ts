import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Haal keys uit Supabase Secrets
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const GEMINI_API_KEY = Deno.env.get('GOOGLE_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Handle CORS (nodig voor aanroepen vanuit je browser)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Lees de data van de frontend
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    
    // Context en data ophalen (of lege objecten als het de start is)
    const contextStr = formData.get('context') as string
    const currentDataStr = formData.get('extractedData') as string
    
    const context = contextStr ? JSON.parse(contextStr) : { stage: 'greeting' }
    const currentData = currentDataStr ? JSON.parse(currentDataStr) : {}

    if (!audioFile) throw new Error('Geen audio bestand ontvangen')

    // ----------------------------------------------------------------
    // STAP A: Spraak naar Tekst (OpenAI Whisper)
    // ----------------------------------------------------------------
    console.log("Stap 1: Audio transcriberen...")
    const transcriptionBody = new FormData()
    transcriptionBody.append('file', audioFile)
    transcriptionBody.append('model', 'whisper-1')
    transcriptionBody.append('language', 'nl')

    const sttResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: transcriptionBody,
    })
    
    if (!sttResponse.ok) {
      const err = await sttResponse.text()
      throw new Error(`Whisper API Error: ${err}`)
    }
    
    const sttData = await sttResponse.json()
    const userText = sttData.text
    console.log("Gebruiker zei:", userText)

    // ----------------------------------------------------------------
    // STAP B: Het Brein (Google Gemini)
    // ----------------------------------------------------------------
    console.log("Stap 2: Antwoord genereren met Gemini...")
    
    const systemPrompt = `
      Je bent de vriendelijke, professionele AI-intakecoördinator van vrijwilligersplatform 'Tussenheid'. 
      Jouw doel is om via een kort gesprek de benodigde gegevens van de vrijwilliger te verzamelen.
      
      Jouw Gespreksstijl:
      - Luister naar de toon van de gebruiker:
        * Formeel/Oud (zoals Els): Wees respectvol, duidelijk, gebruik 'u'.
        * Vlot/Jong (zoals Sarah): Wees enthousiast en efficiënt.
        * Praktisch/Kort (zoals Peter): Wees direct en laagdrempelig ("geen gedoe").
      - Houd je antwoorden KORT (maximaal 2-3 zinnen). Dit is een spraakgesprek.

      De data die je moet verzamelen (vraag dit stap voor stap, niet alles tegelijk!):
      1. Naam
      2. Postcode of Woonplaats (voor afstandsbepaling)
      3. Voorkeur type werk (Bestuurlijk/Denkwerk vs Praktisch/Handen)
      4. Beschikbaarheid
      5. Contactvoorkeur (Telefoon of E-mail)

      Huidige status: ${context.stage || 'start'}
      Wat we al weten (JSON): ${JSON.stringify(currentData)}
      De gebruiker zei zojuist: "${userText}"

      Jouw taak:
      1. Update de JSON-data met nieuwe informatie uit de tekst van de gebruiker.
      2. Formuleer een passend, gesproken antwoord om het gesprek voort te zetten of af te ronden.
      
      Geef je antwoord ALTIJD in dit strikte JSON format (geen markdown blokken eromheen!):
      {
        "bot_response": "De tekst die je uitspreekt",
        "extracted_data": { ...alle velden die je nu weet... },
        "is_finished": boolean
      }
    `

    const geminiBody = {
      contents: [{ parts: [{ text: systemPrompt }] }],
      generationConfig: { response_mime_type: "application/json" }
    }

    const llmResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody)
    })

    if (!llmResponse.ok) {
      const err = await llmResponse.text()
      throw new Error(`Gemini API Error: ${err}`)
    }
    
    const llmData = await llmResponse.json()
    const rawContent = llmData.candidates?.[0]?.content?.parts?.[0]?.text
    let aiResult
    try {
        aiResult = JSON.parse(rawContent)
    } catch (e) {
        // Fallback als JSON parse faalt (zou niet moeten gebeuren met response_mime_type)
        console.error("JSON Parse error", rawContent)
        aiResult = { 
            bot_response: "Sorry, ik begreep dat even niet. Kunt u het herhalen?", 
            extracted_data: currentData, 
            is_finished: false 
        }
    }

    // ----------------------------------------------------------------
    // STAP C: Tekst naar Spraak (OpenAI TTS)
    // ----------------------------------------------------------------
    console.log("Stap 3: Audio genereren...")
    const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "tts-1",
        input: aiResult.bot_response,
        voice: "nova", // 'Nova' is een prettige, neutrale stem
        response_format: "mp3",
      }),
    })

    if (!ttsResponse.ok) {
       const err = await ttsResponse.text()
       throw new Error(`TTS API Error: ${err}`)
    }

    const audioArrayBuffer = await ttsResponse.arrayBuffer()
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioArrayBuffer)))

    // ----------------------------------------------------------------
    // Response naar Frontend
    // ----------------------------------------------------------------
    return new Response(
      JSON.stringify({
        userText,
        botText: aiResult.bot_response,
        audioBase64,
        extractedData: aiResult.extracted_data,
        isFinished: aiResult.is_finished
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )

  } catch (error: any) {
    console.error("Server Error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})