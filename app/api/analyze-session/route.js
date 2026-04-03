import Anthropic from '@anthropic-ai/sdk'

export async function POST(request) {
  const { sessionText, existingNpcs } = await request.json()
  
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  
  const existingList = existingNpcs.length > 0 
    ? `NPC GIÀ NEL DATABASE (confronta attentamente con questi prima di creare nuovi):\n${existingNpcs.map(n => `- ID:${n.id} | Nome: "${n.name}" | Ruolo: ${n.role} | Attitudine: ${n.attitude} | Descrizione: ${n.description}`).join('\n')}`
    : 'Nessun NPC ancora nel database — tutti saranno nuovi.'

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Sei un assistente esperto di campagne D&D 5e con il compito di estrarre e catalogare i personaggi non giocanti (NPC) da riassunti di sessione.

COMPITO PRINCIPALE:
Analizza il riassunto di sessione fornito ed estrai TUTTI i personaggi non giocanti menzionati, anche quelli citati brevemente. Non saltare nessuno — meglio estrarre troppi che troppo pochi.

${existingList}

REGOLE FONDAMENTALI PER L'ESTRAZIONE:

1. IDENTIFICA ogni personaggio che non sia chiaramente un giocatore (PG). Includi: mercanti, guardie, nobili, mostri senzienti, figure misteriose, voci, lettere firmate, ecc.

2. CONFRONTA ogni NPC trovato con il database esistente:
   - Se il nome corrisponde (anche parzialmente, considera soprannomi e titoli) → action: "update"
   - Se è nuovo → action: "create"
   - Se è menzionato ma non c'è nulla di utile da aggiungere a quello che già sappiamo → action: "skip"

3. PER OGNI NPC determina:
   - "name": nome completo con titoli se presenti (es. "Lord Aldric Vane", "La Strega del Pantano")
   - "role": ruolo narrativo specifico, non generico (es. "Signore delle Acque di Brasswater" non solo "Nobile"; "Informatore della Gilda dei Ladri" non solo "Ladro")
   - "attitude": valuta dal contesto come si relaziona col gruppo:
     * "Alleato" = attivamente aiuta il gruppo
     * "Neutrale" = non ostile ma non di aiuto, o posizione ambigua
     * "Nemico" = ostile, antagonista, in conflitto col gruppo
     * "Sconosciuto" = le intenzioni non sono ancora chiare
   - "description": sintesi completa di tutto ciò che sappiamo: aspetto fisico se descritto, personalità, ruolo nella trama, cosa ha fatto in questa sessione, come ha interagito col gruppo. Almeno 2-3 frasi ricche di dettaglio.
   - "notes_dm": INFORMAZIONI RISERVATE — segreti che i giocatori non sanno, motivazioni nascoste, doppi giochi, identità segrete, profezie che lo riguardano, connessioni con altri NPC o fazioni che non sono state rivelate. Lascia vuoto solo se il testo non suggerisce nulla di nascosto.
   - "existing_id": l'ID esatto dell'NPC nel database se action è "update", altrimenti null

4. PER GLI UPDATE: non perdere le informazioni già presenti. La nuova descrizione deve INTEGRARE quelle vecchie, aggiungendo ciò che emerge dalla nuova sessione, non sostituirle ciecamente.

5. CASI SPECIALI:
   - Personaggi menzionati di sfuggita (es. "il capitano della guardia") → crea comunque con le info disponibili
   - Gruppi con un leader identificato → estrai il leader come NPC
   - Personaggi già morti o assenti ma rilevanti narrativamente → includi con nota nella descrizione
   - Entità soprannaturali, divinità, demoni → includili se interagiscono con la trama

FORMATO RISPOSTA:
Rispondi ESCLUSIVAMENTE con un array JSON valido. Zero testo aggiuntivo, zero spiegazioni, zero markdown. Solo il JSON grezzo.

Schema obbligatorio per ogni elemento:
{
  "action": "create" | "update" | "skip",
  "name": "string",
  "role": "string",
  "attitude": "Alleato" | "Nemico" | "Neutrale" | "Sconosciuto",
  "description": "string",
  "notes_dm": "string",
  "existing_id": "uuid-string" | null
}

RIASSUNTO SESSIONE DA ANALIZZARE:
${sessionText}`
    }]
  })
  
  try {
    const text = response.content[0].text
    const json = JSON.parse(text.replace(/```json|```/g, '').trim())
    return Response.json({ success: true, npcs: json })
  } catch {
    return Response.json({ success: false, error: 'Parsing fallito' })
  }
}