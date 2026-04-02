import Anthropic from '@anthropic-ai/sdk'

export async function POST(request) {
  const { imageBase64, mediaType } = await request.json()
  
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
        { type: 'text', text: 'Trascrivi il testo scritto a mano in questa foto di appunti di gioco di ruolo. Mantieni la struttura e la formattazione originale il più possibile. Restituisci solo il testo trascritto, senza commenti aggiuntivi.' }
      ]
    }]
  })
  
  return Response.json({ success: true, text: response.content[0].text })
}