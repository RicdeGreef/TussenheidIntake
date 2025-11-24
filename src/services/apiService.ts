// src/services/apiService.ts

// Dit is de URL van jouw live Supabase Edge Function
const API_ENDPOINT = "https://eixutpznmpctdwsxymvd.supabase.co/functions/v1/process-intake";

// De structuur van de data die we verzamelen (komt overeen met je backend)
export interface ExtractedData {
  naam?: string;
  postcode?: string;
  type_werk?: string; // Bestuurlijk vs Praktisch
  beschikbaarheid?: string;
  contact?: string;
}

// De structuur van het antwoord dat we van Supabase terugkrijgen
export interface IntakeResponse {
  userText: string;
  botText: string;
  audioBase64: string; // De audio van de stem
  extractedData: ExtractedData; // De geüpdatete kennis over de gebruiker
  isFinished: boolean; // Is het gesprek klaar?
}

/**
 * Stuurt de audio opname naar de backend en krijgt tekst + audio terug.
 */
export async function processAudioIntake(
  audioBlob: Blob, 
  currentData: ExtractedData
): Promise<IntakeResponse> {
  
  const formData = new FormData();
  
  // We sturen de audio mee
  formData.append('audio', audioBlob, 'recording.webm');
  
  // We sturen de context/data mee die we al weten, zodat de AI dit kan aanvullen
  formData.append('extractedData', JSON.stringify(currentData));
  
  // We sturen een simpele context mee (optioneel, afhankelijk van je backend logica)
  formData.append('context', JSON.stringify({ stage: 'interview' }));

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server Error (${response.status}): ${errorText}`);
    }

    const data: IntakeResponse = await response.json();
    return data;

  } catch (error) {
    console.error("Fout tijdens verwerken intake:", error);
    throw error;
  }
}

/**
 * Hulpfunctie om de Base64 audio string (van OpenAI) direct in de browser af te spelen.
 * Geeft een Promise terug die resolved als de audio klaar is met spelen.
 */
export async function playAudioResponse(base64Audio: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Converteer base64 naar een afspeelbare source string
      const audioStr = `data:audio/mp3;base64,${base64Audio}`;
      const audio = new Audio(audioStr);
      
      // Event listeners voor wanneer audio klaar is of faalt
      audio.onended = () => resolve();
      audio.onerror = (e) => reject(e);
      
      // Start met afspelen
      audio.play().catch((e) => {
        console.error("Kon audio niet afspelen (mogelijk browser autoplay beleid):", e);
        reject(e);
      });
    } catch (e) {
      reject(e);
    }
  });
}