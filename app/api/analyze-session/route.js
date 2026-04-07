import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 60

export async function POST(request) {
  try {
    const { sessionText, existingNpcs } = await request.json()

    if (!sessionText || sessionText.trim().length < 10) {
      return Response.json({ success: false, error: 'Testo sessione troppo breve' })
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const existingList = existingNpcs?.length > 0
      ? `NPC esistenti:\n${existingNpcs.map(n => `ID:${n.id} | "${n.name}" | ${n.role} | ${n.attitude}`).join('\n')}`
      : 'Nessun NPC esistente.'

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Estrai tutti gli NPC dal riassunto di questa sessione D&D. Confronta con gli NPC esistenti.

${existingList}

Per ogni NPC rispondi SOLO con JSON array. Schema:
{"action":"create"|"update"|"skip","name":"...","role":"...","attitude":"Alleato"|"Nemico"|"Neutrale"|"Sconosciuto","description":"...","notes_dm":"...","existing_id":"uuid o null"}

Regole:
- action "update" se il nome corrisponde a un NPC esistente (usa existing_id)
- action "create" se è nuovo
- action "skip" solo se non c'è nulla di utile
- description: 2-3 frasi su aspetto, personalità, ruolo
- notes_dm: segreti/motivazioni nascoste (vuoto se nulla)

SOLO JSON, niente testo extra.

SESSIONE:
${sessionText.substring(0, 3000)}`
      }]
    })

    const text = response.content[0].text.trim()
    const clean = text.replace(/```json|```/g, '').trim()
    const json = JSON.parse(clean)

    return Response.json({ success: true, npcs: Array.isArray(json) ? json : [] })
  } catch (err) {
    console.error('analyze-session error:', err)
    return Response.json({ success: false, error: err.message || 'Errore analisi' })
  }
}
