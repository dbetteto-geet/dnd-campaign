import Anthropic from '@anthropic-ai/sdk'

export async function POST(request) {
  const { imageBase64, mediaType } = await request.json()
  
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  
  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
        { type: 'text', text: `Analizza questa scheda personaggio D&D 5e e restituisci SOLO un oggetto JSON con questi campi esatti, senza testo aggiuntivo:
{"name":"","class":"","race":"","level":0,"hp":0,"max_hp":0,"ac":0,"background":"","str":0,"dex":0,"con":0,"int":0,"wis":0,"cha":0,"attacks":"","gold":0,"silver":0,"copper":0,"platinum":0}
Per attacks usa il formato "Nome | Bonus | Danni" separato da newline. Se un campo non è leggibile usa 0 o stringa vuota.` }
      ]
    }]
  })
  
  const text = response.content[0].text
  try {
    const json = JSON.parse(text.replace(/```json|```/g, '').trim())
    return Response.json({ success: true, data: json })
  } catch {
    return Response.json({ success: false, error: 'Parsing fallito' })
  }
}
```

Salva e chiudi. Poi installa il SDK di Anthropic:
```
npm install @anthropic-ai/sdk