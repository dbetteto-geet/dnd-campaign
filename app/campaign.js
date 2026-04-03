'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const T = {
  parchment: '#f4e4c1', parchmentDark: '#e8d5a3', parchmentDarker: '#d4b896',
  ink: '#2c1810', inkLight: '#5c3d2e', inkFaint: '#8b6355',
  red: '#8b1a1a', gold: '#8b6914', goldLight: '#c9a84c', border: '#8b6914',
  green: '#1a5c2e', blue: '#1a3c5c', purple: '#3c1a5c',
}
const ATTITUDE_COLORS = { Alleato: T.green, Neutrale: T.inkFaint, Nemico: T.red, Sconosciuto: T.purple }
const EVENT_COLORS = { scoperta: T.purple, incontro: T.green, combattimento: T.red, mistero: T.blue, altro: T.inkFaint }
const STATUS_COLORS = { visitato: T.green, noto: T.blue, sconosciuto: T.inkFaint, pericoloso: T.red }
const QUEST_STATUS_COLORS = { attiva: T.green, completata: T.inkFaint, fallita: T.red, in_sospeso: T.gold }
const ITEM_TYPE_COLORS = { 'Arma magica': T.purple, Consumabile: T.green, Armatura: T.blue, Vari: T.inkFaint, Arma: T.red }
const SCHOOL_COLORS = { Evocazione: T.red, Illusione: T.purple, Necromanzia: T.inkFaint, Trasformazione: T.green, Divinazione: T.blue, Ammaliamento: '#7a1a4a', Abiurazione: T.gold, Invocazione: '#1a4a3c' }
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

function getPublicUrl(bucket, path) {
  if (!path) return null
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
}
async function uploadImage(bucket, file, folder) {
  const ext = file.name.split('.').pop()
  const path = `${folder}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from(bucket).upload(path, file)
  if (error) return null
  return path
}
function feetToMeters(str) {
  if (!str) return str
  return str.replace(/(\d+)\s*feet?/gi, (_, n) => `${Math.round(parseInt(n) * 0.3)} m`)
            .replace(/(\d+)\s*ft\.?/gi, (_, n) => `${Math.round(parseInt(n) * 0.3)} m`)
            .replace(/(\d+)\s*mile[s]?/gi, (_, n) => `${Math.round(parseInt(n) * 1.6)} km`)
}
function formatDate(dateStr) {
  if (!dateStr) return ''
  try { return new Date(dateStr).toLocaleDateString('it-IT') } catch { return dateStr }
}

const parchmentBg = {
  background: `radial-gradient(ellipse at 20% 10%, rgba(180,140,80,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 90%, rgba(160,120,60,0.15) 0%, transparent 50%), linear-gradient(135deg, #f8edd8 0%, #f4e4c1 30%, #ede0b8 60%, #f4e4c1 100%)`,
}
const cardStyle = { ...parchmentBg, border: `1.5px solid ${T.parchmentDarker}`, borderRadius: 6, padding: '1rem 1.25rem', boxShadow: `inset 0 1px 3px rgba(255,255,255,0.5), 0 2px 8px rgba(44,24,16,0.12)`, color: T.ink, position: 'relative' }
const headerFont = { fontFamily: "'Cinzel', Georgia, serif", letterSpacing: '0.02em' }
const bodyFont = { fontFamily: "'Crimson Text', Georgia, serif" }

function Badge({ color, children }) {
  return <span style={{ background: color + '22', color, border: `1px solid ${color}66`, borderRadius: 3, padding: '1px 8px', fontSize: 12, fontWeight: 600, ...headerFont, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{children}</span>
}
function Card({ children, style, onClick }) {
  return <div onClick={onClick} style={{ ...cardStyle, cursor: onClick ? 'pointer' : 'default', ...style }}>{children}</div>
}
function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0' }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${T.gold}, transparent)` }} />
      <span style={{ color: T.gold, fontSize: 14 }}>✦</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${T.gold}, transparent)` }} />
    </div>
  )
}
function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,5,2,0.7)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ ...parchmentBg, borderRadius: '12px 12px 0 0', padding: '1.5rem', width: '100%', maxWidth: wide ? 780 : 640, maxHeight: '90vh', overflowY: 'auto', border: `2px solid ${T.gold}`, borderBottom: 'none', boxShadow: `0 -8px 32px rgba(44,24,16,0.4)` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontWeight: 700, fontSize: 20, color: T.red, ...headerFont }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: T.inkFaint, padding: 4 }}>✕</button>
        </div>
        <Divider />
        {children}
      </div>
    </div>
  )
}
function FF({ label, children }) {
  return <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', fontSize: 13, color: T.gold, marginBottom: 4, fontWeight: 600, ...headerFont, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</label>{children}</div>
}
function Input(props) {
  return <input style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: T.parchment, border: `1.5px solid ${T.parchmentDarker}`, borderRadius: 4, fontSize: 16, color: T.ink, fontFamily: "'Crimson Text', Georgia, serif" }} {...props} />
}
function Textarea(props) {
  return <textarea style={{ width: '100%', boxSizing: 'border-box', minHeight: 90, padding: '8px 12px', background: T.parchment, border: `1.5px solid ${T.parchmentDarker}`, borderRadius: 4, fontSize: 16, resize: 'vertical', color: T.ink, fontFamily: "'Crimson Text', Georgia, serif" }} {...props} />
}
function Sel({ children, ...props }) {
  return <select style={{ width: '100%', padding: '8px 12px', background: T.parchment, border: `1.5px solid ${T.parchmentDarker}`, borderRadius: 4, fontSize: 16, color: T.ink, fontFamily: "'Crimson Text', Georgia, serif" }} {...props}>{children}</select>
}
function BtnP({ children, onClick, style, disabled }) {
  return <button onClick={onClick} disabled={disabled} style={{ background: disabled ? T.inkFaint : `linear-gradient(135deg, ${T.red} 0%, #6b1414 100%)`, color: '#f8edd8', border: `1px solid ${disabled ? T.inkFaint : '#6b1414'}`, borderRadius: 4, padding: '9px 18px', fontSize: 15, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', minHeight: 44, boxShadow: disabled ? 'none' : '0 2px 6px rgba(139,26,26,0.3)', textShadow: '0 1px 2px rgba(0,0,0,0.3)', ...headerFont, letterSpacing: '0.03em', ...style }}>{children}</button>
}
function BtnS({ children, onClick, style }) {
  return <button onClick={onClick} style={{ background: T.parchmentDark, color: T.inkLight, border: `1.5px solid ${T.parchmentDarker}`, borderRadius: 4, padding: '9px 18px', fontSize: 15, cursor: 'pointer', minHeight: 44, boxShadow: '0 1px 4px rgba(44,24,16,0.1)', ...bodyFont, ...style }}>{children}</button>
}
function BtnD({ children, onClick, style }) {
  return <button onClick={onClick} style={{ background: '#f8e8e8', color: T.red, border: `1.5px solid ${T.red}44`, borderRadius: 4, padding: '9px 14px', fontSize: 14, cursor: 'pointer', minHeight: 44, ...bodyFont, ...style }}>{children}</button>
}
function BtnGold({ children, onClick, style, disabled }) {
  return <button onClick={onClick} disabled={disabled} style={{ background: disabled ? T.inkFaint : `linear-gradient(135deg, ${T.gold} 0%, #6b5010 100%)`, color: '#f8edd8', border: 'none', borderRadius: 4, padding: '9px 18px', fontSize: 15, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', minHeight: 44, ...headerFont, ...style }}>{children}</button>
}
function SH({ title, action }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: T.red, ...headerFont }}>{title}</h2>
        {action}
      </div>
      <div style={{ marginTop: 8, height: 2, background: `linear-gradient(to right, ${T.gold}, ${T.goldLight}, transparent)`, borderRadius: 1 }} />
    </div>
  )
}
function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: T.parchmentDark, borderRadius: 6, padding: 4, overflowX: 'auto', border: `1px solid ${T.parchmentDarker}` }}>
      {tabs.map(t => <button key={t} onClick={() => onChange(t)} style={{ flex: '1 0 auto', padding: '7px 6px', borderRadius: 4, border: active === t ? `1px solid ${T.gold}` : '1px solid transparent', background: active === t ? T.parchment : 'transparent', fontWeight: active === t ? 600 : 400, fontSize: 13, cursor: 'pointer', color: active === t ? T.red : T.inkLight, boxShadow: active === t ? '0 1px 4px rgba(44,24,16,0.1)' : 'none', whiteSpace: 'nowrap', ...bodyFont }}>{t}</button>)}
    </div>
  )
}
function ImgUpload({ bucket, folder, currentPath, onUploaded, label }) {
  const [uploading, setUploading] = useState(false)
  const ref = useRef()
  const url = getPublicUrl(bucket, currentPath)
  const handle = async (e) => {
    const file = e.target.files[0]; if (!file) return
    setUploading(true); const path = await uploadImage(bucket, file, folder); setUploading(false); if (path) onUploaded(path)
  }
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: 13, color: T.gold, marginBottom: 4, fontWeight: 600, ...headerFont, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label || 'Immagine'}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {url && <img src={url} alt="" style={{ width: 52, height: 52, borderRadius: 4, objectFit: 'cover', border: `2px solid ${T.gold}` }} />}
        <button type="button" onClick={() => ref.current.click()} style={{ background: T.parchmentDark, border: `1.5px solid ${T.parchmentDarker}`, borderRadius: 4, padding: '9px 16px', fontSize: 14, cursor: 'pointer', minHeight: 44, color: T.inkLight, ...bodyFont }}>
          {uploading ? 'Caricamento...' : url ? 'Cambia' : 'Carica immagine'}
        </button>
        <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={handle} />
      </div>
    </div>
  )
}
function NotePhotoScanner({ onTranscribed }) {
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const ref = useRef()
  const handle = async (e) => {
    const file = e.target.files[0]; if (!file) return
    setScanning(true); setError('')
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const res = await fetch('/api/transcribe-note', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageBase64: ev.target.result.split(',')[1], mediaType: file.type }) })
        const data = await res.json()
        if (data.success) { onTranscribed(data.text) } else { setError('Trascrizione fallita.') }
      } catch { setError('Errore di connessione.') }
      setScanning(false)
    }
    reader.readAsDataURL(file)
  }
  return (
    <div style={{ background: `linear-gradient(135deg, #e8f0e8, #d8e8d8)`, border: `1.5px solid ${T.green}44`, borderRadius: 6, padding: '1rem', marginBottom: '1rem' }}>
      <p style={{ fontSize: 14, fontWeight: 600, color: T.green, margin: '0 0 6px', ...headerFont }}>📜 Trascrivi appunti con AI</p>
      <p style={{ fontSize: 14, color: T.inkLight, margin: '0 0 10px' }}>Fotografa i tuoi appunti — Claude li trascriverà automaticamente.</p>
      <button type="button" onClick={() => ref.current.click()} disabled={scanning} style={{ background: T.green, color: '#f8edd8', border: 'none', borderRadius: 4, padding: '9px 16px', fontSize: 14, fontWeight: 600, cursor: scanning ? 'not-allowed' : 'pointer', minHeight: 44, opacity: scanning ? 0.7 : 1, ...headerFont }}>
        {scanning ? '⏳ Trascrizione...' : '📷 Fotografa appunti'}
      </button>
      <input ref={ref} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handle} />
      {error && <p style={{ color: T.red, fontSize: 13, marginTop: 8, marginBottom: 0 }}>{error}</p>}
    </div>
  )
}
function CoinsPanel({ values, onChange, editable }) {
  const COINS = [{ key: 'gold', label: 'MO', color: T.gold, icon: '🪙' }, { key: 'silver', label: 'MA', color: T.inkFaint, icon: '🥈' }, { key: 'copper', label: 'MR', color: '#7a4a2e', icon: '🟫' }, { key: 'platinum', label: 'MP', color: T.blue, icon: '💎' }]
  return (
    <Card style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px', color: T.red, ...headerFont, letterSpacing: '0.05em' }}>⚖️ MONETE</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {COINS.map(({ key, label, color, icon }) => (
          <div key={key} style={{ textAlign: 'center', background: T.parchmentDark, border: `1.5px solid ${T.parchmentDarker}`, borderRadius: 4, padding: '10px 4px' }}>
            <div style={{ fontSize: 16, marginBottom: 2 }}>{icon}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 6, ...headerFont }}>{label}</div>
            {editable
              ? <input type="number" min="0" value={values[key] ?? 0} onChange={e => onChange(key, parseInt(e.target.value) || 0)} style={{ width: '100%', textAlign: 'center', padding: '4px 2px', border: `1px solid ${T.parchmentDarker}`, borderRadius: 3, fontSize: 16, fontWeight: 700, color, background: T.parchment, boxSizing: 'border-box', fontFamily: "'Crimson Text', Georgia, serif" }} />
              : <div style={{ fontSize: 20, fontWeight: 700, color }}>{values[key] ?? 0}</div>
            }
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── Analisi NPC da sessione ──────────────────────────────────────────────────
function NPCAnalysisModal({ sessionText, existingNpcs, onClose, onSaved }) {
  const [analyzing, setAnalyzing] = useState(false)
  const [suggestions, setSuggestions] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const analyze = async () => {
    setAnalyzing(true); setError(''); setSuggestions(null)
    try {
      const res = await fetch('/api/analyze-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionText, existingNpcs })
      })
      const data = await res.json()
      if (data.success) {
        // Filtra gli skip e aggiunge stato di approvazione
        const filtered = data.npcs
          .filter(n => n.action !== 'skip')
          .map(n => ({ ...n, approved: true, editing: false }))
        setSuggestions(filtered)
      } else { setError('Analisi fallita. Riprova.') }
    } catch { setError('Errore di connessione.') }
    setAnalyzing(false)
  }

  const toggle = (i, field, val) => {
    setSuggestions(s => s.map((n, idx) => idx === i ? { ...n, [field]: val ?? !n[field] } : n))
  }

  const saveAll = async () => {
    if (!suggestions) return
    setSaving(true)
    const approved = suggestions.filter(n => n.approved)
    for (const npc of approved) {
      const payload = { name: npc.name, role: npc.role, attitude: npc.attitude, description: npc.description, notes_dm: npc.notes_dm || '' }
      if (npc.action === 'update' && npc.existing_id) {
        await supabase.from('npcs').update(payload).eq('id', npc.existing_id)
      } else {
        await supabase.from('npcs').insert([payload])
      }
    }
    setSaving(false)
    onSaved(approved.length)
    onClose()
  }

  const approvedCount = suggestions ? suggestions.filter(n => n.approved).length : 0

  return (
    <Modal title="🔮 Analisi NPC della Sessione" onClose={onClose} wide>
      {!suggestions && !analyzing && (
        <div>
          <p style={{ fontSize: 15, color: T.inkLight, lineHeight: 1.7 }}>
            Claude leggerà il riassunto di questa sessione ed estrarrà automaticamente tutti i personaggi non giocanti menzionati, confrontandoli con gli NPC già presenti nel database.
          </p>
          <p style={{ fontSize: 14, color: T.inkFaint, fontStyle: 'italic', marginBottom: 20 }}>
            Potrai approvare, modificare o scartare ogni suggerimento prima del salvataggio.
          </p>
          <BtnGold onClick={analyze}>🔮 Avvia Analisi</BtnGold>
        </div>
      )}

      {analyzing && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
          <p style={{ color: T.inkLight, fontStyle: 'italic', fontSize: 16 }}>Claude sta leggendo la sessione e identificando i personaggi...</p>
        </div>
      )}

      {error && <p style={{ color: T.red, fontSize: 15 }}>{error} <button onClick={analyze} style={{ background: 'none', border: 'none', color: T.gold, cursor: 'pointer', textDecoration: 'underline', fontSize: 14 }}>Riprova</button></p>}

      {suggestions && (
        <div>
          <p style={{ fontSize: 14, color: T.inkFaint, marginBottom: 16, fontStyle: 'italic' }}>
            Trovati {suggestions.length} personaggi. Approva, modifica o deseleziona prima di salvare.
          </p>

          {suggestions.length === 0 && <p style={{ color: T.inkFaint, fontStyle: 'italic' }}>Nessun NPC nuovo rilevato in questa sessione.</p>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {suggestions.map((npc, i) => (
              <div key={i} style={{ ...cardStyle, opacity: npc.approved ? 1 : 0.5, border: npc.approved ? `1.5px solid ${npc.action === 'update' ? T.gold : T.green}` : `1.5px solid ${T.parchmentDarker}` }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 16, color: T.ink, ...headerFont }}>{npc.name}</span>
                    <Badge color={npc.action === 'update' ? T.gold : T.green}>{npc.action === 'update' ? '↻ Aggiornamento' : '✦ Nuovo'}</Badge>
                    <Badge color={ATTITUDE_COLORS[npc.attitude] || T.inkFaint}>{npc.attitude}</Badge>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                    <button onClick={() => toggle(i, 'editing')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4, color: T.inkFaint }}>✏️</button>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" checked={npc.approved} onChange={() => toggle(i, 'approved')} style={{ width: 18, height: 18, accentColor: T.green }} />
                      <span style={{ fontSize: 13, color: npc.approved ? T.green : T.inkFaint, fontWeight: 600 }}>{npc.approved ? 'Approva' : 'Scarta'}</span>
                    </label>
                  </div>
                </div>

                {!npc.editing ? (
                  <div>
                    <div style={{ fontSize: 13, color: T.inkFaint, fontStyle: 'italic', marginBottom: 4 }}>{npc.role}</div>
                    <p style={{ fontSize: 14, color: T.inkLight, margin: '0 0 6px', lineHeight: 1.5 }}>{npc.description}</p>
                    {npc.notes_dm && <div style={{ background: '#fff8e8', border: `1px solid ${T.goldLight}`, borderRadius: 4, padding: '6px 10px', fontSize: 13, color: T.inkLight, fontStyle: 'italic' }}><span style={{ fontWeight: 600, color: T.gold }}>DM: </span>{npc.notes_dm}</div>}
                  </div>
                ) : (
                  <div>
                    <FF label="Nome"><Input value={npc.name} onChange={e => toggle(i, 'name', e.target.value)} /></FF>
                    <FF label="Ruolo"><Input value={npc.role} onChange={e => toggle(i, 'role', e.target.value)} /></FF>
                    <FF label="Attitudine"><Sel value={npc.attitude} onChange={e => toggle(i, 'attitude', e.target.value)}>{Object.keys(ATTITUDE_COLORS).map(a => <option key={a}>{a}</option>)}</Sel></FF>
                    <FF label="Descrizione"><Textarea value={npc.description} onChange={e => toggle(i, 'description', e.target.value)} /></FF>
                    <FF label="Note DM (segrete)"><Textarea value={npc.notes_dm || ''} onChange={e => toggle(i, 'notes_dm', e.target.value)} /></FF>
                    <BtnS onClick={() => toggle(i, 'editing')} style={{ marginTop: 4 }}>✓ Chiudi</BtnS>
                  </div>
                )}
              </div>
            ))}
          </div>

          <Divider />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 14, color: T.inkFaint, fontStyle: 'italic' }}>{approvedCount} personaggi verranno salvati.</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <BtnS onClick={onClose}>Annulla</BtnS>
              <BtnGold onClick={saveAll} disabled={saving || approvedCount === 0}>{saving ? 'Salvataggio...' : `✦ Salva ${approvedCount} NPC`}</BtnGold>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}

// ─── Sessioni ─────────────────────────────────────────────────────────────────
function SessionsSection({ isDM }) {
  const [sessions, setSessions] = useState([])
  const [expanded, setExpanded] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ number: '', title: '', date: '', summary: '' })
  const [loading, setLoading] = useState(true)
  const [existingNpcs, setExistingNpcs] = useState([])
  const [analyzingSession, setAnalyzingSession] = useState(null)
  const [analysisSaved, setAnalysisSaved] = useState(null)

  useEffect(() => {
    supabase.from('sessions').select('*').order('number', { ascending: false }).then(({ data }) => { setSessions(data || []); setLoading(false) })
    supabase.from('npcs').select('id, name, role, attitude, description').then(({ data }) => setExistingNpcs(data || []))
  }, [])

  const openAdd = () => { setEditing(null); setForm({ number: '', title: '', date: '', summary: '' }); setShowModal(true) }
  const openEdit = (e, s) => { e.stopPropagation(); setEditing(s); setForm({ number: s.number, title: s.title, date: s.date || '', summary: s.summary || '' }); setShowModal(true) }
  const save = async () => {
    if (!form.title) return
    if (editing) { const { data } = await supabase.from('sessions').update(form).eq('id', editing.id).select(); if (data) setSessions(sessions.map(s => s.id === editing.id ? data[0] : s)) }
    else { const { data } = await supabase.from('sessions').insert([form]).select(); if (data) setSessions([data[0], ...sessions]) }
    setShowModal(false)
  }
  const remove = async (e, id) => { e.stopPropagation(); await supabase.from('sessions').delete().eq('id', id); setSessions(sessions.filter(s => s.id !== id)) }

  const handleAnalysisSaved = (count) => {
    setAnalysisSaved(count)
    setTimeout(() => setAnalysisSaved(null), 4000)
    // Ricarica NPC
    supabase.from('npcs').select('id, name, role, attitude, description').then(({ data }) => setExistingNpcs(data || []))
  }

  if (loading) return <p style={{ color: T.inkFaint }}>Caricamento...</p>
  return (
    <div>
      <SH title="📜 Riassunti Sessioni" action={isDM && <BtnP onClick={openAdd}>+ Nuova</BtnP>} />
      {analysisSaved !== null && (
        <div style={{ background: `linear-gradient(135deg, #e8f0e8, #d8e8d8)`, border: `1.5px solid ${T.green}`, borderRadius: 6, padding: '0.75rem 1rem', marginBottom: 16, fontSize: 15, color: T.green, fontWeight: 600 }}>
          ✦ {analysisSaved} NPC salvati con successo!
        </div>
      )}
      {sessions.length === 0 && <p style={{ color: T.inkFaint, fontStyle: 'italic' }}>Nessuna sessione ancora scritta nei libri...</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sessions.map(s => (
          <Card key={s.id} onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: 12, color: T.gold, display: 'block', marginBottom: 2, ...headerFont, letterSpacing: '0.05em' }}>SESSIONE {s.number} · {formatDate(s.date)}</span>
                <span style={{ fontWeight: 600, color: T.ink, fontSize: 17, ...headerFont }}>{s.title}</span>
              </div>
              <div style={{ display: 'flex', gap: 4, flexShrink: 0, alignItems: 'center' }}>
                {isDM && (
                  <>
                    <button onClick={e => { e.stopPropagation(); setAnalyzingSession(s) }} title="Analizza NPC con AI" style={{ background: T.gold + '22', border: `1px solid ${T.gold}44`, borderRadius: 4, cursor: 'pointer', fontSize: 14, padding: '4px 8px', color: T.gold, fontWeight: 600 }}>🔮</button>
                    <button onClick={e => openEdit(e, s)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4, color: T.inkFaint }}>✏️</button>
                    <button onClick={e => remove(e, s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4, color: T.inkFaint }}>🗑️</button>
                  </>
                )}
                <span style={{ color: T.gold, fontSize: 14, padding: 4 }}>{expanded === s.id ? '▲' : '▼'}</span>
              </div>
            </div>
            {expanded === s.id && (
              <>
                <Divider />
                <p style={{ fontSize: 16, lineHeight: 1.8, color: T.inkLight, margin: 0, fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>{s.summary}</p>
                {isDM && s.summary && (
                  <div style={{ marginTop: 12 }}>
                    <button onClick={e => { e.stopPropagation(); setAnalyzingSession(s) }} style={{ background: T.gold + '22', border: `1px solid ${T.gold}`, borderRadius: 4, cursor: 'pointer', fontSize: 14, padding: '8px 14px', color: T.gold, fontWeight: 600, ...headerFont }}>
                      🔮 Analizza NPC con AI
                    </button>
                  </div>
                )}
              </>
            )}
          </Card>
        ))}
      </div>

      {showModal && (
        <Modal title={editing ? 'Modifica Sessione' : 'Nuova Sessione'} onClose={() => setShowModal(false)}>
          <FF label="Numero"><Input type="number" value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} /></FF>
          <FF label="Titolo"><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></FF>
          <FF label="Data"><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></FF>
          <FF label="Riassunto"><Textarea value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} style={{ minHeight: 200 }} /></FF>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}><BtnS onClick={() => setShowModal(false)}>Annulla</BtnS><BtnP onClick={save}>Salva</BtnP></div>
        </Modal>
      )}

      {analyzingSession && (
        <NPCAnalysisModal
          sessionText={analyzingSession.summary}
          existingNpcs={existingNpcs}
          onClose={() => setAnalyzingSession(null)}
          onSaved={handleAnalysisSaved}
        />
      )}
    </div>
  )
}

// ─── NPC ──────────────────────────────────────────────────────────────────────
function NPCSection({ isDM }) {
  const [npcs, setNpcs] = useState([])
  const [selected, setSelected] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [filterAttitude, setFilterAttitude] = useState('')
  const [form, setForm] = useState({ name: '', role: '', attitude: 'Neutrale', description: '', notes_dm: '', image_path: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => { supabase.from('npcs').select('*').order('name').then(({ data }) => { setNpcs(data || []); setLoading(false) }) }, [])

  const openAdd = () => { setEditing(null); setForm({ name: '', role: '', attitude: 'Neutrale', description: '', notes_dm: '', image_path: '' }); setShowModal(true) }
  const openEdit = (e, npc) => { e && e.stopPropagation(); setEditing(npc); setForm({ name: npc.name, role: npc.role || '', attitude: npc.attitude, description: npc.description || '', notes_dm: npc.notes_dm || '', image_path: npc.image_path || '' }); setShowModal(true) }
  const save = async () => {
    if (!form.name) return
    if (editing) { const { data } = await supabase.from('npcs').update(form).eq('id', editing.id).select(); if (data) { setNpcs(npcs.map(n => n.id === editing.id ? data[0] : n)); if (selected?.id === editing.id) setSelected(data[0]) } }
    else { const { data } = await supabase.from('npcs').insert([form]).select(); if (data) setNpcs([...npcs, data[0]].sort((a, b) => a.name.localeCompare(b.name))) }
    setShowModal(false)
  }
  const remove = async (id) => { await supabase.from('npcs').delete().eq('id', id); setNpcs(npcs.filter(n => n.id !== id)); setSelected(null) }

  const filtered = npcs.filter(n => {
    const matchSearch = !search || n.name.toLowerCase().includes(search.toLowerCase()) || (n.role || '').toLowerCase().includes(search.toLowerCase())
    const matchAttitude = !filterAttitude || n.attitude === filterAttitude
    return matchSearch && matchAttitude
  })

  if (loading) return <p style={{ color: T.inkFaint }}>Caricamento...</p>
  return (
    <div>
      <SH title="🧑‍🤝‍🧑 Personaggi" action={isDM && <BtnP onClick={openAdd}>+ Aggiungi</BtnP>} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 160 }}><Input placeholder="Cerca personaggio..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <Sel value={filterAttitude} onChange={e => setFilterAttitude(e.target.value)} style={{ width: 'auto', minWidth: 140 }}>
          <option value="">Tutti</option>
          {Object.keys(ATTITUDE_COLORS).map(a => <option key={a}>{a}</option>)}
        </Sel>
      </div>
      <p style={{ fontSize: 13, color: T.inkFaint, marginBottom: 12, fontStyle: 'italic' }}>{filtered.length} personaggi{filterAttitude ? ` (${filterAttitude})` : ''}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%,240px),1fr))', gap: 12 }}>
        {filtered.length === 0 && <p style={{ color: T.inkFaint, fontStyle: 'italic' }}>Nessun personaggio trovato.</p>}
        {filtered.map(npc => {
          const img = getPublicUrl('npc-images', npc.image_path)
          return (
            <Card key={npc.id} onClick={() => setSelected(npc)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                {img ? <img src={img} alt={npc.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${T.gold}`, flexShrink: 0 }} />
                  : <div style={{ width: 48, height: 48, borderRadius: '50%', background: (ATTITUDE_COLORS[npc.attitude] || T.inkFaint) + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 600, color: ATTITUDE_COLORS[npc.attitude] || T.inkFaint, border: `2px solid ${T.parchmentDarker}`, flexShrink: 0, ...headerFont }}>{npc.name[0]}</div>}
                <div><div style={{ fontWeight: 600, color: T.ink, fontSize: 16, ...headerFont }}>{npc.name}</div><div style={{ fontSize: 13, color: T.inkFaint, fontStyle: 'italic' }}>{npc.role}</div></div>
              </div>
              <Badge color={ATTITUDE_COLORS[npc.attitude] || T.inkFaint}>{npc.attitude}</Badge>
              <p style={{ fontSize: 14, color: T.inkLight, marginTop: 8, marginBottom: 0, lineHeight: 1.5 }}>{npc.description?.substring(0, 120)}{npc.description?.length > 120 ? '...' : ''}</p>
            </Card>
          )
        })}
      </div>
      {selected && (() => {
        const img = getPublicUrl('npc-images', selected.image_path)
        return (
          <Modal title={selected.name} onClose={() => setSelected(null)}>
            {img && <img src={img} alt={selected.name} style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 6, marginBottom: 12, border: `2px solid ${T.gold}` }} />}
            <div style={{ marginBottom: 8 }}><Badge color={ATTITUDE_COLORS[selected.attitude] || T.inkFaint}>{selected.attitude}</Badge><span style={{ fontSize: 14, color: T.inkFaint, marginLeft: 8, fontStyle: 'italic' }}>{selected.role}</span></div>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: T.inkLight }}>{selected.description}</p>
            {isDM && selected.notes_dm && <><Divider /><div style={{ background: '#fff8e8', border: `1px solid ${T.goldLight}`, borderRadius: 4, padding: '0.75rem 1rem' }}><span style={{ fontSize: 12, fontWeight: 600, color: T.gold, display: 'block', marginBottom: 4, ...headerFont, letterSpacing: '0.05em' }}>NOTE DM</span><span style={{ fontSize: 14, color: T.inkLight }}>{selected.notes_dm}</span></div></>}
            {isDM && <div style={{ display: 'flex', gap: 8, marginTop: 16 }}><BtnS onClick={() => openEdit(null, selected)}>✏️ Modifica</BtnS><BtnD onClick={() => remove(selected.id)}>🗑️ Elimina</BtnD></div>}
          </Modal>
        )
      })()}
      {showModal && (
        <Modal title={editing ? 'Modifica Personaggio' : 'Nuovo Personaggio'} onClose={() => setShowModal(false)}>
          <ImgUpload bucket="npc-images" folder="npcs" currentPath={form.image_path} onUploaded={p => setForm({ ...form, image_path: p })} label="Ritratto" />
          <FF label="Nome"><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></FF>
          <FF label="Ruolo"><Input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} /></FF>
          <FF label="Attitudine"><Sel value={form.attitude} onChange={e => setForm({ ...form, attitude: e.target.value })}>{Object.keys(ATTITUDE_COLORS).map(a => <option key={a}>{a}</option>)}</Sel></FF>
          <FF label="Descrizione"><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></FF>
          <FF label="Note DM (segrete)"><Textarea value={form.notes_dm} onChange={e => setForm({ ...form, notes_dm: e.target.value })} /></FF>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}><BtnS onClick={() => setShowModal(false)}>Annulla</BtnS><BtnP onClick={save}>Salva</BtnP></div>
        </Modal>
      )}
    </div>
  )
}

// ─── Timeline ─────────────────────────────────────────────────────────────────
function TimelineSection({ isDM }) {
  const [events, setEvents] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ date_ingame: '', title: '', description: '', type: 'altro' })
  const [loading, setLoading] = useState(true)

  useEffect(() => { supabase.from('timeline_events').select('*').order('created_at').then(({ data }) => { setEvents(data || []); setLoading(false) }) }, [])

  const openAdd = () => { setEditing(null); setForm({ date_ingame: '', title: '', description: '', type: 'altro' }); setShowModal(true) }
  const openEdit = (e, ev) => { e.stopPropagation(); setEditing(ev); setForm({ date_ingame: ev.date_ingame || '', title: ev.title, description: ev.description || '', type: ev.type }); setShowModal(true) }
  const save = async () => {
    if (!form.title) return
    if (editing) { const { data } = await supabase.from('timeline_events').update(form).eq('id', editing.id).select(); if (data) setEvents(events.map(e => e.id === editing.id ? data[0] : e)) }
    else { const { data } = await supabase.from('timeline_events').insert([form]).select(); if (data) setEvents([...events, data[0]]) }
    setShowModal(false)
  }
  const remove = async (e, id) => { e.stopPropagation(); await supabase.from('timeline_events').delete().eq('id', id); setEvents(events.filter(ev => ev.id !== id)) }

  if (loading) return <p style={{ color: T.inkFaint }}>Caricamento...</p>
  return (
    <div>
      <SH title="📅 Cronaca della Campagna" action={isDM && <BtnP onClick={openAdd}>+ Evento</BtnP>} />
      <div style={{ position: 'relative', paddingLeft: 28 }}>
        <div style={{ position: 'absolute', left: 10, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, ${T.gold}, ${T.goldLight}, ${T.gold})` }} />
        {events.length === 0 && <p style={{ color: T.inkFaint, fontStyle: 'italic' }}>La storia non è ancora stata scritta...</p>}
        {events.map(ev => (
          <div key={ev.id} style={{ position: 'relative', marginBottom: 20 }}>
            <div style={{ position: 'absolute', left: -22, top: 8, width: 14, height: 14, borderRadius: '50%', background: EVENT_COLORS[ev.type] || T.inkFaint, border: `2px solid ${T.parchment}`, boxShadow: `0 0 0 2px ${EVENT_COLORS[ev.type] || T.inkFaint}44` }} />
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><span style={{ fontSize: 11, color: T.gold, ...headerFont, letterSpacing: '0.05em' }}>{ev.date_ingame}</span><div style={{ display: 'flex', gap: 8, marginTop: 2, flexWrap: 'wrap', alignItems: 'center' }}><span style={{ fontWeight: 600, color: T.ink, fontSize: 16, ...headerFont }}>{ev.title}</span><Badge color={EVENT_COLORS[ev.type] || T.inkFaint}>{ev.type}</Badge></div></div>
                {isDM && <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}><button onClick={e => openEdit(e, ev)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4, color: T.inkFaint }}>✏️</button><button onClick={e => remove(e, ev.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4, color: T.inkFaint }}>🗑️</button></div>}
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 15, color: T.inkLight, lineHeight: 1.6 }}>{ev.description}</p>
            </Card>
          </div>
        ))}
      </div>
      {showModal && (
        <Modal title={editing ? 'Modifica Evento' : 'Nuovo Evento'} onClose={() => setShowModal(false)}>
          <FF label="Data in-game"><Input value={form.date_ingame} onChange={e => setForm({ ...form, date_ingame: e.target.value })} placeholder="Anno 412, Mese del Vento" /></FF>
          <FF label="Titolo"><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></FF>
          <FF label="Tipo"><Sel value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>{Object.keys(EVENT_COLORS).map(t => <option key={t}>{t}</option>)}</Sel></FF>
          <FF label="Descrizione"><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></FF>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}><BtnS onClick={() => setShowModal(false)}>Annulla</BtnS><BtnP onClick={save}>Salva</BtnP></div>
        </Modal>
      )}
    </div>
  )
}

// ─── Mappa ────────────────────────────────────────────────────────────────────
function MapSection({ isDM }) {
  const [pins, setPins] = useState([])
  const [mapUrl, setMapUrl] = useState(null)
  const [selected, setSelected] = useState(null)
  const [showPinModal, setShowPinModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [editingPin, setEditingPin] = useState(null)
  const [pendingPos, setPendingPos] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', status: 'sconosciuto' })
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    supabase.from('map_pins').select('*').then(({ data }) => { setPins(data || []); setLoading(false) })
    supabase.storage.from('map-images').list('').then(({ data }) => {
      if (data && data.length > 0) { const f = data.find(f => f.name.startsWith('map.')) || data[data.length - 1]; setMapUrl(getPublicUrl('map-images', f.name) + '?t=' + Date.now()) }
    })
  }, [])

  const uploadMap = async (e) => {
    const file = e.target.files[0]; if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    await supabase.storage.from('map-images').upload(`map.${ext}`, file, { upsert: true })
    setMapUrl(getPublicUrl('map-images', `map.${ext}`) + '?t=' + Date.now())
    setUploading(false); setShowUploadModal(false)
  }
  const handleClick = (e) => {
    if (!isDM) return
    const rect = e.currentTarget.getBoundingClientRect()
    setPendingPos({ x_percent: Math.round(((e.clientX - rect.left) / rect.width) * 100), y_percent: Math.round(((e.clientY - rect.top) / rect.height) * 100) })
    setEditingPin(null); setForm({ name: '', description: '', status: 'sconosciuto' }); setShowPinModal(true)
  }
  const openEditPin = (e, pin) => { e.stopPropagation(); setEditingPin(pin); setForm({ name: pin.name, description: pin.description || '', status: pin.status }); setPendingPos(null); setShowPinModal(true) }
  const savePin = async () => {
    if (!form.name) return
    if (editingPin) { const { data } = await supabase.from('map_pins').update(form).eq('id', editingPin.id).select(); if (data) setPins(pins.map(p => p.id === editingPin.id ? data[0] : p)) }
    else if (pendingPos) { const { data } = await supabase.from('map_pins').insert([{ ...form, ...pendingPos }]).select(); if (data) setPins([...pins, data[0]]) }
    setShowPinModal(false); setPendingPos(null); setEditingPin(null)
  }
  const removePin = async (id) => { await supabase.from('map_pins').delete().eq('id', id); setPins(pins.filter(p => p.id !== id)); setSelected(null) }

  const renderPins = () => pins.map(pin => (
    <div key={pin.id} onClick={e => { e.stopPropagation(); setSelected(pin) }} style={{ position: 'absolute', left: `${pin.x_percent}%`, top: `${pin.y_percent}%`, transform: 'translate(-50%, -50%)', cursor: 'pointer', zIndex: 10 }}>
      <div style={{ width: 16, height: 16, borderRadius: '50%', background: STATUS_COLORS[pin.status] || T.inkFaint, border: '2.5px solid #f4e4c1', boxShadow: '0 2px 6px rgba(0,0,0,0.6)' }} />
    </div>
  ))

  if (loading) return <p style={{ color: T.inkFaint }}>Caricamento...</p>
  return (
    <div>
      <SH title="🗺️ Mappa del Mondo" action={isDM && <BtnS onClick={() => setShowUploadModal(true)}>Carica mappa</BtnS>} />
      {isDM && <p style={{ fontSize: 14, color: T.inkFaint, marginBottom: 12, fontStyle: 'italic' }}>Clicca sulla mappa per segnare un luogo.</p>}
      <div style={{ position: 'relative', borderRadius: 6, overflow: 'hidden', border: `3px solid ${T.gold}`, boxShadow: `0 4px 16px rgba(44,24,16,0.3)` }}>
        {mapUrl ? (
          <div style={{ position: 'relative', width: '100%', cursor: isDM ? 'crosshair' : 'default' }} onClick={handleClick}>
            <img src={mapUrl} alt="Mappa" style={{ width: '100%', height: 'auto', display: 'block', userSelect: 'none', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', inset: 0 }}>{renderPins()}</div>
          </div>
        ) : (
          <div style={{ width: '100%', paddingBottom: '50%', position: 'relative', cursor: isDM ? 'crosshair' : 'default', background: '#2a1a0a' }} onClick={handleClick}>
            <div style={{ position: 'absolute', inset: 0 }}>{renderPins()}</div>
            {isDM && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}><span style={{ color: 'rgba(244,228,193,0.4)', fontSize: 14, fontStyle: 'italic' }}>Terra inesplorata — carica una mappa</span></div>}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
        {Object.entries(STATUS_COLORS).map(([k, v]) => <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: T.inkFaint }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: v, display: 'inline-block' }} />{k}</span>)}
      </div>
      {selected && <Modal title={selected.name} onClose={() => setSelected(null)}><Badge color={STATUS_COLORS[selected.status] || T.inkFaint}>{selected.status}</Badge><p style={{ marginTop: 12, fontSize: 16, lineHeight: 1.7, color: T.inkLight }}>{selected.description}</p>{isDM && <div style={{ display: 'flex', gap: 8, marginTop: 12 }}><BtnS onClick={e => openEditPin(e, selected)}>✏️ Modifica</BtnS><BtnD onClick={() => removePin(selected.id)}>🗑️ Elimina</BtnD></div>}</Modal>}
      {showPinModal && <Modal title={editingPin ? 'Modifica Luogo' : 'Segna Luogo'} onClose={() => { setShowPinModal(false); setPendingPos(null) }}><FF label="Nome"><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></FF><FF label="Stato"><Sel value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{Object.keys(STATUS_COLORS).map(s => <option key={s}>{s}</option>)}</Sel></FF><FF label="Descrizione"><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></FF><div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}><BtnS onClick={() => { setShowPinModal(false); setPendingPos(null) }}>Annulla</BtnS><BtnP onClick={savePin}>Segna</BtnP></div></Modal>}
      {showUploadModal && <Modal title="Carica Mappa" onClose={() => setShowUploadModal(false)}><p style={{ fontSize: 15, color: T.inkLight, marginTop: 0 }}>Il formato si adatterà automaticamente.</p><input type="file" accept="image/*" onChange={uploadMap} style={{ fontSize: 16, color: T.ink }} />{uploading && <p style={{ color: T.inkFaint, marginTop: 8 }}>Caricamento...</p>}</Modal>}
    </div>
  )
}

// ─── Incantesimi ──────────────────────────────────────────────────────────────
function SpellsSection() {
  const [spells, setSpells] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetch('https://www.dnd5eapi.co/api/spells?limit=500').then(r => r.json()).then(d => { setSpells((d.results || []).map(s => ({ id: s.index, name: s.name, index: s.index }))); setLoading(false) }).catch(() => setLoading(false)) }, [])

  const loadDetail = async (spell) => {
    if (spell.level !== undefined) { setSelected(spell); return }
    const res = await fetch(`https://www.dnd5eapi.co/api/spells/${spell.index}`)
    const d = await res.json()
    setSelected({ ...spell, level: d.level, school: d.school?.name || '', castingTime: d.casting_time, range: d.range, components: (d.components || []).join(', '), duration: d.duration, description: (d.desc || []).join(' '), concentration: d.concentration, ritual: d.ritual })
  }

  const filtered = spells.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()))
  if (loading) return <p style={{ color: T.inkFaint }}>Consultazione dei tomi arcani...</p>
  return (
    <div>
      <SH title="✨ Compendio Incantesimi" />
      <p style={{ fontSize: 14, color: T.inkFaint, marginBottom: 12, fontStyle: 'italic' }}>{spells.length} incantesimi dai Tomi Fondamentali.</p>
      <div style={{ marginBottom: 16 }}><Input placeholder="Cerca incantesimo..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%,180px),1fr))', gap: 8 }}>
        {filtered.slice(0, 60).map(s => <Card key={s.id} onClick={() => loadDetail(s)} style={{ padding: '0.75rem 1rem' }}><div style={{ fontWeight: 600, fontSize: 15, color: T.ink, ...headerFont }}>{s.name}</div></Card>)}
      </div>
      {filtered.length > 60 && <p style={{ fontSize: 14, color: T.inkFaint, marginTop: 12, fontStyle: 'italic' }}>Mostrando 60 di {filtered.length}. Affina la ricerca.</p>}
      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          {selected.level !== undefined && <>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              <Badge color={SCHOOL_COLORS[selected.school] || T.inkFaint}>{selected.school}</Badge>
              <Badge color={T.blue}>{selected.level === 0 ? 'Trucchetto' : `Lv ${selected.level}`}</Badge>
              {selected.concentration && <Badge color={T.red}>Concentrazione</Badge>}
              {selected.ritual && <Badge color={T.gold}>Rituale</Badge>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              {[['Tempo', selected.castingTime], ['Gittata', feetToMeters(selected.range)], ['Componenti', selected.components], ['Durata', feetToMeters(selected.duration)]].map(([k, v]) => <div key={k} style={{ background: T.parchmentDark, borderRadius: 4, padding: '8px 10px', border: `1px solid ${T.parchmentDarker}` }}><div style={{ fontSize: 11, color: T.gold, marginBottom: 2, ...headerFont, letterSpacing: '0.05em' }}>{k.toUpperCase()}</div><div style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{v}</div></div>)}
            </div>
            <Divider />
          </>}
          <p style={{ fontSize: 15, lineHeight: 1.8, margin: 0, color: T.inkLight }}>{selected.description || 'Caricamento...'}</p>
        </Modal>
      )}
    </div>
  )
}

// ─── Note DM ──────────────────────────────────────────────────────────────────
function DMNotesSection() {
  const [content, setContent] = useState('')
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [noteId, setNoteId] = useState(null)

  useEffect(() => { supabase.from('dm_notes').select('*').limit(1).maybeSingle().then(({ data }) => { if (data) { setContent(data.content || ''); setNoteId(data.id) } setLoading(false) }) }, [])

  const save = async () => {
    if (noteId) { await supabase.from('dm_notes').update({ content, updated_at: new Date().toISOString() }).eq('id', noteId) }
    else { const { data } = await supabase.from('dm_notes').insert([{ content }]).select(); if (data) setNoteId(data[0].id) }
    setEditing(false)
  }

  if (loading) return <p style={{ color: T.inkFaint }}>Caricamento...</p>
  return (
    <div>
      <SH title="🔒 Pergamene Segrete del DM" action={editing ? <BtnP onClick={save}>Sigilla</BtnP> : <BtnS onClick={() => setEditing(true)}>Scrivi</BtnS>} />
      <Card style={{ background: `linear-gradient(135deg, #fff8e8, #f8edd8)`, border: `1.5px solid ${T.goldLight}` }}>
        {editing ? <div><NotePhotoScanner onTranscribed={text => setContent(c => c ? c + '\n\n' + text : text)} /><textarea value={content} onChange={e => setContent(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', minHeight: 200, background: 'transparent', border: 'none', outline: 'none', fontSize: 16, lineHeight: 1.8, resize: 'vertical', color: T.ink, fontFamily: "'Crimson Text', Georgia, serif" }} /></div>
          : <pre style={{ margin: 0, fontFamily: "'Crimson Text', Georgia, serif", fontSize: 16, lineHeight: 1.8, whiteSpace: 'pre-wrap', color: T.inkLight, fontStyle: 'italic' }}>{content || 'Nessuna pergamena segreta...'}</pre>}
      </Card>
    </div>
  )
}

// ─── SheetScanner ─────────────────────────────────────────────────────────────
function SheetScanner({ onParsed }) {
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const ref = useRef()
  const handle = async (e) => {
    const file = e.target.files[0]; if (!file) return
    setScanning(true); setError('')
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const res = await fetch('/api/parse-sheet', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageBase64: ev.target.result.split(',')[1], mediaType: file.type }) })
        const data = await res.json()
        if (data.success) { onParsed(data.data) } else { setError('Trascrizione fallita.') }
      } catch { setError('Errore di connessione.') }
      setScanning(false)
    }
    reader.readAsDataURL(file)
  }
  return (
    <div style={{ background: `linear-gradient(135deg, #e8f0e8, #d8e8d8)`, border: `1.5px solid ${T.green}44`, borderRadius: 6, padding: '1rem', marginBottom: '1rem' }}>
      <p style={{ fontSize: 14, fontWeight: 600, color: T.green, margin: '0 0 6px', ...headerFont }}>📜 Scansiona Scheda con AI</p>
      <p style={{ fontSize: 14, color: T.inkLight, margin: '0 0 10px' }}>Fotografa la tua scheda — Claude la legge e compila i campi.</p>
      <button type="button" onClick={() => ref.current.click()} disabled={scanning} style={{ background: T.green, color: '#f8edd8', border: 'none', borderRadius: 4, padding: '9px 16px', fontSize: 14, fontWeight: 600, cursor: scanning ? 'not-allowed' : 'pointer', minHeight: 44, opacity: scanning ? 0.7 : 1, ...headerFont }}>
        {scanning ? '⏳ Analisi...' : '📷 Fotografa scheda'}
      </button>
      <input ref={ref} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handle} />
      {error && <p style={{ color: T.red, fontSize: 13, marginTop: 8, marginBottom: 0 }}>{error}</p>}
    </div>
  )
}

// ─── Libro incantesimi PG ─────────────────────────────────────────────────────
function SpellbookTab({ playerId, isOwner }) {
  const [spells, setSpells] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [srdSpells, setSrdSpells] = useState([])
  const [srdSearch, setSrdSearch] = useState('')
  const [srdLoading, setSrdLoading] = useState(false)
  const [selectedSrd, setSelectedSrd] = useState(null)
  const [customForm, setCustomForm] = useState({ spell_name: '', spell_level: 0, school: '', casting_time: '1 azione', is_concentration: false, is_bonus_action: false, is_ritual: false, description: '' })

  useEffect(() => { supabase.from('character_spells').select('*').eq('player_id', playerId).order('spell_level').then(({ data }) => { setSpells(data || []); setLoading(false) }) }, [playerId])

  const searchSrd = async (q) => {
    if (!q || q.length < 2) { setSrdSpells([]); return }
    setSrdLoading(true)
    try { const res = await fetch(`https://www.dnd5eapi.co/api/spells?limit=500`); const data = await res.json(); setSrdSpells((data.results || []).filter(s => s.name.toLowerCase().includes(q.toLowerCase())).slice(0, 20)) } catch {}
    setSrdLoading(false)
  }
  const loadSrdDetail = async (spell) => {
    const res = await fetch(`https://www.dnd5eapi.co/api/spells/${spell.index}`); const d = await res.json()
    setSelectedSrd({ name: spell.name, level: d.level, school: d.school?.name || '', castingTime: d.casting_time, concentration: d.concentration, ritual: d.ritual, description: (d.desc || []).join(' '), isBonus: d.casting_time?.toLowerCase().includes('bonus') })
  }
  const addFromSrd = async () => {
    if (!selectedSrd) return
    const { data } = await supabase.from('character_spells').insert([{ player_id: playerId, spell_name: selectedSrd.name, spell_level: selectedSrd.level, school: selectedSrd.school, casting_time: selectedSrd.castingTime, is_concentration: selectedSrd.concentration || false, is_bonus_action: selectedSrd.isBonus || false, is_ritual: selectedSrd.ritual || false, description: selectedSrd.description, is_custom: false }]).select()
    if (data) setSpells([...spells, data[0]])
    setShowAddModal(false); setSelectedSrd(null); setSrdSearch(''); setSrdSpells([])
  }
  const addCustom = async () => {
    if (!customForm.spell_name) return
    const { data } = await supabase.from('character_spells').insert([{ ...customForm, player_id: playerId, is_custom: true }]).select()
    if (data) setSpells([...spells, data[0]])
    setShowCustomModal(false); setCustomForm({ spell_name: '', spell_level: 0, school: '', casting_time: '1 azione', is_concentration: false, is_bonus_action: false, is_ritual: false, description: '' })
  }
  const toggleField = async (spell, field) => {
    const newVal = !spell[field]
    await supabase.from('character_spells').update({ [field]: newVal }).eq('id', spell.id)
    setSpells(spells.map(s => s.id === spell.id ? { ...s, [field]: newVal } : s))
  }
  const removeSpell = async (id) => { await supabase.from('character_spells').delete().eq('id', id); setSpells(spells.filter(s => s.id !== id)) }

  const byLevel = spells.reduce((acc, s) => { const l = s.spell_level; if (!acc[l]) acc[l] = []; acc[l].push(s); return acc }, {})

  if (loading) return <p style={{ color: T.inkFaint }}>Consultazione del libro...</p>
  return (
    <div>
      {isOwner && <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}><BtnP onClick={() => setShowAddModal(true)}>+ Dal compendio</BtnP><BtnS onClick={() => setShowCustomModal(true)}>+ Personalizzato</BtnS></div>}
      {spells.length === 0 && <p style={{ color: T.inkFaint, fontStyle: 'italic' }}>Il libro è ancora vuoto...</p>}
      {Object.keys(byLevel).sort((a, b) => parseInt(a) - parseInt(b)).map(level => (
        <div key={level} style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: T.gold, letterSpacing: '0.08em', ...headerFont }}>{parseInt(level) === 0 ? '✦ TRUCCHETTI' : `✦ LIVELLO ${level}`}</span>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${T.gold}44, transparent)` }} />
          </div>
          {byLevel[level].map(spell => (
            <Card key={spell.id} style={{ padding: '0.75rem 1rem', marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 16, color: T.ink, ...headerFont }}>{spell.spell_name}</span>
                    {spell.is_concentration && <Badge color={T.red}>Conc.</Badge>}
                    {spell.is_bonus_action && <Badge color={T.gold}>Azione bonus</Badge>}
                    {spell.is_ritual && <Badge color={T.purple}>Rituale</Badge>}
                    {spell.is_custom && <Badge color={T.inkFaint}>Custom</Badge>}
                  </div>
                  {spell.casting_time && <div style={{ fontSize: 13, color: T.inkFaint, fontStyle: 'italic' }}>{spell.casting_time}</div>}
                </div>
                {isOwner && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                    {[['is_prepared', 'Preparato', T.green], ['is_used', 'Usato', T.red]].map(([field, label, color]) => (
                      <div key={field} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <button onClick={() => toggleField(spell, field)} style={{ width: 26, height: 26, borderRadius: '50%', border: `2px solid ${spell[field] ? color : T.parchmentDarker}`, background: spell[field] ? color : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {spell[field] && <span style={{ color: '#f8edd8', fontSize: 13, lineHeight: 1 }}>✓</span>}
                        </button>
                        <span style={{ fontSize: 12, color: spell[field] ? color : T.inkFaint }}>{label}</span>
                      </div>
                    ))}
                    <button onClick={() => removeSpell(spell.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: 2, color: T.inkFaint, textAlign: 'right' }}>🗑️</button>
                  </div>
                )}
                {!isOwner && <div style={{ display: 'flex', gap: 4 }}>{spell.is_prepared && <Badge color={T.green}>Preparato</Badge>}{spell.is_used && <Badge color={T.red}>Usato</Badge>}</div>}
              </div>
            </Card>
          ))}
        </div>
      ))}
      {showAddModal && (
        <Modal title="Aggiungi dal Compendio" onClose={() => { setShowAddModal(false); setSelectedSrd(null); setSrdSearch(''); setSrdSpells([]) }}>
          <FF label="Cerca incantesimo"><Input value={srdSearch} onChange={e => { setSrdSearch(e.target.value); searchSrd(e.target.value) }} placeholder="Digita il nome..." /></FF>
          {srdLoading && <p style={{ color: T.inkFaint, fontSize: 14, fontStyle: 'italic' }}>Consultando i tomi...</p>}
          {srdSpells.length > 0 && !selectedSrd && <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16, maxHeight: 300, overflowY: 'auto' }}>{srdSpells.map(s => <button key={s.index} onClick={() => loadSrdDetail(s)} style={{ textAlign: 'left', padding: '10px 12px', border: `1px solid ${T.parchmentDarker}`, borderRadius: 4, background: T.parchmentDark, cursor: 'pointer', fontSize: 15, color: T.ink, ...bodyFont }}>{s.name}</button>)}</div>}
          {selectedSrd && <Card style={{ marginBottom: 16, border: `1.5px solid ${T.green}66` }}><div style={{ fontWeight: 600, fontSize: 16, color: T.ink, marginBottom: 8, ...headerFont }}>{selectedSrd.name}</div><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}><Badge color={T.blue}>{selectedSrd.level === 0 ? 'Trucchetto' : `Lv ${selectedSrd.level}`}</Badge>{selectedSrd.school && <Badge color={SCHOOL_COLORS[selectedSrd.school] || T.inkFaint}>{selectedSrd.school}</Badge>}{selectedSrd.concentration && <Badge color={T.red}>Concentrazione</Badge>}{selectedSrd.ritual && <Badge color={T.gold}>Rituale</Badge>}{selectedSrd.isBonus && <Badge color={T.gold}>Azione bonus</Badge>}</div><p style={{ fontSize: 13, color: T.inkFaint, margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>{selectedSrd.description?.substring(0, 150)}...</p><button onClick={() => { setSelectedSrd(null); setSrdSpells([]) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: T.inkFaint, marginTop: 8 }}>← Cambia</button></Card>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}><BtnS onClick={() => { setShowAddModal(false); setSelectedSrd(null) }}>Annulla</BtnS><BtnP onClick={addFromSrd} disabled={!selectedSrd}>Aggiungi</BtnP></div>
        </Modal>
      )}
      {showCustomModal && (
        <Modal title="Incantesimo Personale" onClose={() => setShowCustomModal(false)}>
          <FF label="Nome"><Input value={customForm.spell_name} onChange={e => setCustomForm({ ...customForm, spell_name: e.target.value })} /></FF>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
            <FF label="Livello (0=trucchetto)"><Input type="number" min="0" max="9" value={customForm.spell_level} onChange={e => setCustomForm({ ...customForm, spell_level: parseInt(e.target.value) || 0 })} /></FF>
            <FF label="Scuola"><Input value={customForm.school} onChange={e => setCustomForm({ ...customForm, school: e.target.value })} /></FF>
          </div>
          <FF label="Tempo di lancio"><Input value={customForm.casting_time} onChange={e => setCustomForm({ ...customForm, casting_time: e.target.value })} /></FF>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            {[['is_concentration', 'Concentrazione'], ['is_bonus_action', 'Azione bonus'], ['is_ritual', 'Rituale']].map(([field, label]) => (
              <label key={field} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, cursor: 'pointer', color: T.inkLight }}>
                <input type="checkbox" checked={customForm[field]} onChange={e => setCustomForm({ ...customForm, [field]: e.target.checked })} style={{ width: 18, height: 18 }} />
                {label}
              </label>
            ))}
          </div>
          <FF label="Descrizione"><Textarea value={customForm.description} onChange={e => setCustomForm({ ...customForm, description: e.target.value })} /></FF>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}><BtnS onClick={() => setShowCustomModal(false)}>Annulla</BtnS><BtnP onClick={addCustom}>Trascrivi</BtnP></div>
        </Modal>
      )}
    </div>
  )
}

// ─── Scheda giocatore ─────────────────────────────────────────────────────────
function PlayerTab({ player, currentUserId, isDM }) {
  const isOwner = isDM || currentUserId === player.id
  const [activeTab, setActiveTab] = useState('scheda')
  const [character, setCharacter] = useState(null)
  const [inventory, setInventory] = useState([])
  const [companions, setCompanions] = useState([])
  const [sessionNotes, setSessionNotes] = useState([])
  const [editChar, setEditChar] = useState(false)
  const [showItemModal, setShowItemModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [showCompModal, setShowCompModal] = useState(false)
  const [editingComp, setEditingComp] = useState(null)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [expandedNote, setExpandedNote] = useState(null)
  const EC = { name: '', class: '', race: '', level: 1, hp: 10, max_hp: 10, ac: 10, background: '', image_path: '', str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10, attacks: '', spell_slots_total: '', spell_slots_used: '', gold: 0, silver: 0, copper: 0, platinum: 0 }
  const [charForm, setCharForm] = useState(EC)
  const EI = { name: '', type: 'Vari', description: '', quantity: 1 }
  const [itemForm, setItemForm] = useState(EI)
  const ECP = { name: '', type: '', hp: '', ac: '', notes: '', image_path: '' }
  const [compForm, setCompForm] = useState(ECP)
  const EN = { session_title: '', date: '', content: '' }
  const [noteForm, setNoteForm] = useState(EN)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('characters').select('*').eq('player_id', player.id).maybeSingle(),
      supabase.from('inventory').select('*').eq('player_id', player.id),
      supabase.from('companions').select('*').eq('player_id', player.id),
      supabase.from('player_session_notes').select('*').eq('player_id', player.id).order('created_at', { ascending: false }),
    ]).then(([c, inv, comp, n]) => {
      if (c.data) { setCharacter(c.data); setCharForm({ ...EC, ...c.data }) }
      setInventory(inv.data || []); setCompanions(comp.data || []); setSessionNotes(n.data || []); setLoading(false)
    })
  }, [player.id])

  const saveChar = async () => {
    if (character) { const { data } = await supabase.from('characters').update(charForm).eq('id', character.id).select(); if (data) setCharacter(data[0]) }
    else { const { data } = await supabase.from('characters').insert([{ ...charForm, player_id: player.id }]).select(); if (data) setCharacter(data[0]) }
    setEditChar(false)
  }
  const handleCoin = async (key, val) => { setCharForm(f => ({ ...f, [key]: val })); if (character) { await supabase.from('characters').update({ [key]: val }).eq('id', character.id); setCharacter(c => ({ ...c, [key]: val })) } }
  const openAddItem = () => { setEditingItem(null); setItemForm(EI); setShowItemModal(true) }
  const openEditItem = (item) => { setEditingItem(item); setItemForm({ name: item.name, type: item.type, description: item.description || '', quantity: item.quantity }); setShowItemModal(true) }
  const saveItem = async () => {
    if (!itemForm.name) return
    if (editingItem) { const { data } = await supabase.from('inventory').update(itemForm).eq('id', editingItem.id).select(); if (data) setInventory(inventory.map(i => i.id === editingItem.id ? data[0] : i)) }
    else { const { data } = await supabase.from('inventory').insert([{ ...itemForm, player_id: player.id }]).select(); if (data) setInventory([...inventory, data[0]]) }
    setShowItemModal(false)
  }
  const removeItem = async (id) => { await supabase.from('inventory').delete().eq('id', id); setInventory(inventory.filter(i => i.id !== id)) }
  const openAddComp = () => { setEditingComp(null); setCompForm(ECP); setShowCompModal(true) }
  const openEditComp = (c) => { setEditingComp(c); setCompForm({ name: c.name, type: c.type || '', hp: c.hp || '', ac: c.ac || '', notes: c.notes || '', image_path: c.image_path || '' }); setShowCompModal(true) }
  const saveComp = async () => {
    if (!compForm.name) return
    if (editingComp) { const { data } = await supabase.from('companions').update(compForm).eq('id', editingComp.id).select(); if (data) setCompanions(companions.map(c => c.id === editingComp.id ? data[0] : c)) }
    else { const { data } = await supabase.from('companions').insert([{ ...compForm, player_id: player.id }]).select(); if (data) setCompanions([...companions, data[0]]) }
    setShowCompModal(false)
  }
  const removeComp = async (id) => { await supabase.from('companions').delete().eq('id', id); setCompanions(companions.filter(c => c.id !== id)) }
  const openAddNote = () => { setEditingNote(null); setNoteForm(EN); setShowNoteModal(true) }
  const openEditNote = (n) => { setEditingNote(n); setNoteForm({ session_title: n.session_title, date: n.date || '', content: n.content || '' }); setShowNoteModal(true) }
  const saveNote = async () => {
    if (!noteForm.session_title) return
    if (editingNote) { const { data } = await supabase.from('player_session_notes').update(noteForm).eq('id', editingNote.id).select(); if (data) setSessionNotes(sessionNotes.map(n => n.id === editingNote.id ? data[0] : n)) }
    else { const { data } = await supabase.from('player_session_notes').insert([{ ...noteForm, player_id: player.id }]).select(); if (data) setSessionNotes([data[0], ...sessionNotes]) }
    setShowNoteModal(false)
  }
  const removeNote = async (id) => { await supabase.from('player_session_notes').delete().eq('id', id); setSessionNotes(sessionNotes.filter(n => n.id !== id)) }

  if (loading) return <p style={{ color: T.inkFaint }}>Consultazione degli archivi...</p>

  const hpPct = character ? Math.round((character.hp / character.max_hp) * 100) : 0
  const hpColor = hpPct > 60 ? T.green : hpPct > 30 ? T.gold : T.red
  const imgUrl = character ? getPublicUrl('character-images', character.image_path) : null
  const STATS = [['FOR', 'str'], ['DES', 'dex'], ['COS', 'con'], ['INT', 'int'], ['SAG', 'wis'], ['CAR', 'cha']]
  const mod = (v) => { const m = Math.floor(((v || 10) - 10) / 2); return (m >= 0 ? '+' : '') + m }
  const slotsT = character?.spell_slots_total ? character.spell_slots_total.split(',').map(s => parseInt(s.trim()) || 0) : []
  const slotsU = character?.spell_slots_used ? character.spell_slots_used.split(',').map(s => parseInt(s.trim()) || 0) : []

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        {imgUrl ? <img src={imgUrl} alt="" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${player.player_color || T.gold}`, flexShrink: 0, boxShadow: '0 2px 8px rgba(44,24,16,0.3)' }} />
          : <div style={{ width: 60, height: 60, borderRadius: '50%', background: (player.player_color || T.gold) + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 600, color: player.player_color || T.gold, border: `3px solid ${player.player_color || T.gold}`, flexShrink: 0, ...headerFont }}>{player.username[0]}</div>}
        <div>
          <div style={{ fontWeight: 700, fontSize: 19, color: T.ink, ...headerFont }}>{character?.name || player.username}</div>
          {character && <div style={{ fontSize: 15, color: T.inkFaint, fontStyle: 'italic' }}>{character.race} · {character.class} · Livello {character.level}</div>}
        </div>
      </div>
      <Tabs tabs={['scheda', 'incantesimi', 'inventario', 'famigli', 'note sessione']} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'scheda' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            {isOwner && (editChar ? <div style={{ display: 'flex', gap: 8 }}><BtnS onClick={() => setEditChar(false)}>Annulla</BtnS><BtnP onClick={saveChar}>Sigilla</BtnP></div> : <BtnS onClick={() => { setCharForm({ ...EC, ...(character || {}) }); setEditChar(true) }}>Modifica Scheda</BtnS>)}
          </div>
          {editChar ? (
            <Card>
              {isOwner && <SheetScanner onParsed={p => setCharForm(f => ({ ...f, ...p }))} />}
              <ImgUpload bucket="character-images" folder="characters" currentPath={charForm.image_path} onUploaded={p => setCharForm({ ...charForm, image_path: p })} label="Ritratto" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%,200px),1fr))', gap: '0 12px' }}>
                <FF label="Nome"><Input value={charForm.name} onChange={e => setCharForm({ ...charForm, name: e.target.value })} /></FF>
                <FF label="Classe"><Input value={charForm.class} onChange={e => setCharForm({ ...charForm, class: e.target.value })} /></FF>
                <FF label="Razza"><Input value={charForm.race} onChange={e => setCharForm({ ...charForm, race: e.target.value })} /></FF>
                <FF label="Background"><Input value={charForm.background} onChange={e => setCharForm({ ...charForm, background: e.target.value })} /></FF>
                <FF label="Livello"><Input type="number" value={charForm.level} onChange={e => setCharForm({ ...charForm, level: e.target.value })} /></FF>
                <FF label="CA"><Input type="number" value={charForm.ac} onChange={e => setCharForm({ ...charForm, ac: e.target.value })} /></FF>
                <FF label="PF attuali"><Input type="number" value={charForm.hp} onChange={e => setCharForm({ ...charForm, hp: e.target.value })} /></FF>
                <FF label="PF massimi"><Input type="number" value={charForm.max_hp} onChange={e => setCharForm({ ...charForm, max_hp: e.target.value })} /></FF>
              </div>
              <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: T.gold, ...headerFont, letterSpacing: '0.05em' }}>CARATTERISTICHE</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, marginBottom: 16 }}>
                {STATS.map(([l, k]) => <FF key={k} label={l}><Input type="number" value={charForm[k]} onChange={e => setCharForm({ ...charForm, [k]: e.target.value })} /></FF>)}
              </div>
              <FF label="Attacchi (Nome | Bonus | Danni, uno per riga)"><Textarea value={charForm.attacks} onChange={e => setCharForm({ ...charForm, attacks: e.target.value })} placeholder="Spada lunga | +5 | 1d8+3" /></FF>
              <FF label="Slot totali (es. 4,3,2)"><Input value={charForm.spell_slots_total} onChange={e => setCharForm({ ...charForm, spell_slots_total: e.target.value })} placeholder="4,3,2" /></FF>
              <FF label="Slot usati (es. 2,1,0)"><Input value={charForm.spell_slots_used} onChange={e => setCharForm({ ...charForm, spell_slots_used: e.target.value })} placeholder="2,1,0" /></FF>
            </Card>
          ) : character ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 12 }}>
                {[['Classe Armatura', character.ac], ['Livello', character.level], ['Background', character.background]].map(([k, v]) => <div key={k} style={{ ...cardStyle, textAlign: 'center' }}><div style={{ fontSize: 11, color: T.gold, marginBottom: 4, ...headerFont, letterSpacing: '0.05em' }}>{k.toUpperCase()}</div><div style={{ fontSize: 18, fontWeight: 700, color: T.ink, ...headerFont }}>{v}</div></div>)}
              </div>
              <Card style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontSize: 14, color: T.inkFaint, fontStyle: 'italic' }}>Punti Ferita</span><span style={{ fontSize: 16, fontWeight: 700, color: T.ink, ...headerFont }}>{character.hp} / {character.max_hp}</span></div>
                <div style={{ height: 12, background: T.parchmentDarker, borderRadius: 6, overflow: 'hidden' }}><div style={{ height: '100%', width: `${hpPct}%`, background: `linear-gradient(to right, ${hpColor}, ${hpColor}cc)`, borderRadius: 6, transition: 'width 0.4s' }} /></div>
              </Card>
              <Card style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 12, fontWeight: 700, margin: '0 0 10px', color: T.gold, ...headerFont, letterSpacing: '0.06em' }}>CARATTERISTICHE</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 6 }}>
                  {STATS.map(([l, k]) => <div key={k} style={{ textAlign: 'center', background: T.parchmentDark, borderRadius: 4, padding: '8px 2px', border: `1px solid ${T.parchmentDarker}` }}><div style={{ fontSize: 10, color: T.gold, marginBottom: 2, ...headerFont }}>{l}</div><div style={{ fontSize: 16, fontWeight: 700, color: T.ink }}>{character[k] || 10}</div><div style={{ fontSize: 12, color: T.inkFaint }}>{mod(character[k])}</div></div>)}
                </div>
              </Card>
              {character.attacks && (
                <Card style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, margin: '0 0 10px', color: T.gold, ...headerFont, letterSpacing: '0.06em' }}>ATTACCHI</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '6px 14px' }}>
                    {['NOME', 'BONUS', 'DANNI'].map(h => <span key={h} style={{ fontSize: 11, color: T.gold, fontWeight: 700, ...headerFont }}>{h}</span>)}
                    {character.attacks.split('\n').filter(Boolean).map((atk, i) => { const [nome, bonus, danni] = atk.split('|').map(s => s.trim()); return [<span key={`n${i}`} style={{ fontWeight: 600, color: T.ink, fontSize: 15 }}>{nome}</span>, <span key={`b${i}`} style={{ color: T.green, fontWeight: 700, fontSize: 15 }}>{bonus}</span>, <span key={`d${i}`} style={{ color: T.red, fontSize: 15 }}>{danni}</span>] })}
                  </div>
                </Card>
              )}
              {slotsT.length > 0 && (
                <Card style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, margin: '0 0 12px', color: T.gold, ...headerFont, letterSpacing: '0.06em' }}>SLOT INCANTESIMO</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {slotsT.map((total, i) => { const rem = total - (slotsU[i] || 0); return <div key={i} style={{ textAlign: 'center', background: T.parchmentDark, borderRadius: 4, padding: '8px 12px', minWidth: 52, border: `1px solid ${T.parchmentDarker}` }}><div style={{ fontSize: 11, color: T.gold, marginBottom: 6, ...headerFont }}>Lv {i + 1}</div><div style={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>{Array.from({ length: total }).map((_, j) => <div key={j} style={{ width: 10, height: 10, borderRadius: '50%', background: j < rem ? T.purple : T.parchmentDarker, border: `1px solid ${j < rem ? T.purple : T.parchmentDarker}` }} />)}</div><div style={{ fontSize: 12, color: T.inkFaint, marginTop: 6 }}>{rem}/{total}</div></div> })}
                  </div>
                </Card>
              )}
            </div>
          ) : <p style={{ color: T.inkFaint, fontStyle: 'italic' }}>Nessuna scheda. {isOwner && 'Clicca "Modifica Scheda" per iniziare.'}</p>}
        </div>
      )}

      {activeTab === 'incantesimi' && <SpellbookTab playerId={player.id} isOwner={isOwner} />}

      {activeTab === 'inventario' && (
        <div>
          <CoinsPanel values={character || charForm} onChange={handleCoin} editable={isOwner} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>{isOwner && <BtnP onClick={openAddItem}>+ Aggiungi Oggetto</BtnP>}</div>
          {inventory.length === 0 && <p style={{ color: T.inkFaint, fontStyle: 'italic' }}>Le borse sono vuote...</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {inventory.map(item => (
              <Card key={item.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1 }}><span style={{ fontWeight: 600, fontSize: 16, color: T.ink, ...headerFont }}>{item.name}</span>{item.quantity > 1 && <span style={{ fontSize: 13, color: T.inkFaint, marginLeft: 8 }}>×{item.quantity}</span>}</div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                    <Badge color={ITEM_TYPE_COLORS[item.type] || T.inkFaint}>{item.type}</Badge>
                    {isOwner && <><button onClick={() => openEditItem(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4, color: T.inkFaint }}>✏️</button><button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4, color: T.inkFaint }}>🗑️</button></>}
                  </div>
                </div>
                {item.description && <p style={{ margin: '6px 0 0', fontSize: 14, color: T.inkLight, fontStyle: 'italic' }}>{item.description}</p>}
              </Card>
            ))}
          </div>
          {showItemModal && <Modal title={editingItem ? 'Modifica Oggetto' : 'Nuovo Oggetto'} onClose={() => setShowItemModal(false)}><FF label="Nome"><Input value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })} /></FF><FF label="Tipo"><Sel value={itemForm.type} onChange={e => setItemForm({ ...itemForm, type: e.target.value })}>{Object.keys(ITEM_TYPE_COLORS).map(t => <option key={t}>{t}</option>)}</Sel></FF><FF label="Quantità"><Input type="number" value={itemForm.quantity} onChange={e => setItemForm({ ...itemForm, quantity: e.target.value })} /></FF><FF label="Descrizione"><Textarea value={itemForm.description} onChange={e => setItemForm({ ...itemForm, description: e.target.value })} /></FF><div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}><BtnS onClick={() => setShowItemModal(false)}>Annulla</BtnS><BtnP onClick={saveItem}>Salva</BtnP></div></Modal>}
        </div>
      )}

      {activeTab === 'famigli' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>{isOwner && <BtnP onClick={openAddComp}>+ Aggiungi</BtnP>}</div>
          {companions.length === 0 && <p style={{ color: T.inkFaint, fontStyle: 'italic' }}>Nessun compagno fedele...</p>}
          {companions.map(c => {
            const cImg = getPublicUrl('character-images', c.image_path)
            return (
              <Card key={c.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {cImg ? <img src={cImg} alt={c.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${T.gold}`, flexShrink: 0 }} /> : <div style={{ width: 48, height: 48, borderRadius: '50%', background: T.parchmentDark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, border: `2px solid ${T.parchmentDarker}` }}>🐾</div>}
                    <div><div style={{ fontWeight: 600, fontSize: 16, color: T.ink, ...headerFont }}>{c.name}</div><div style={{ fontSize: 13, color: T.inkFaint, fontStyle: 'italic' }}>{c.type}</div></div>
                  </div>
                  {isOwner && <div style={{ display: 'flex', gap: 4 }}><button onClick={() => openEditComp(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4, color: T.inkFaint }}>✏️</button><button onClick={() => removeComp(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4, color: T.inkFaint }}>🗑️</button></div>}
                </div>
                <div style={{ display: 'flex', gap: 20, marginTop: 10 }}><span style={{ fontSize: 14, color: T.inkLight }}><span style={{ color: T.inkFaint }}>PF </span><strong>{c.hp}</strong></span><span style={{ fontSize: 14, color: T.inkLight }}><span style={{ color: T.inkFaint }}>CA </span><strong>{c.ac}</strong></span></div>
                {c.notes && <p style={{ margin: '8px 0 0', fontSize: 14, color: T.inkLight, fontStyle: 'italic' }}>{c.notes}</p>}
              </Card>
            )
          })}
          {showCompModal && <Modal title={editingComp ? 'Modifica Compagno' : 'Nuovo Compagno'} onClose={() => setShowCompModal(false)}><ImgUpload bucket="character-images" folder="companions" currentPath={compForm.image_path} onUploaded={p => setCompForm({ ...compForm, image_path: p })} label="Ritratto" /><FF label="Nome"><Input value={compForm.name} onChange={e => setCompForm({ ...compForm, name: e.target.value })} /></FF><FF label="Tipo"><Input value={compForm.type} onChange={e => setCompForm({ ...compForm, type: e.target.value })} placeholder="es. Famiglio (Gatto)" /></FF><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}><FF label="PF"><Input type="number" value={compForm.hp} onChange={e => setCompForm({ ...compForm, hp: e.target.value })} /></FF><FF label="CA"><Input type="number" value={compForm.ac} onChange={e => setCompForm({ ...compForm, ac: e.target.value })} /></FF></div><FF label="Note"><Textarea value={compForm.notes} onChange={e => setCompForm({ ...compForm, notes: e.target.value })} /></FF><div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}><BtnS onClick={() => setShowCompModal(false)}>Annulla</BtnS><BtnP onClick={saveComp}>Salva</BtnP></div></Modal>}
        </div>
      )}

      {activeTab === 'note sessione' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontWeight: 700, fontSize: 17, color: T.red, ...headerFont }}>Diario di Sessione</span>
            {isOwner && <BtnP onClick={openAddNote}>+ Nuova Nota</BtnP>}
          </div>
          <p style={{ fontSize: 13, color: T.inkFaint, marginBottom: 16, fontStyle: 'italic' }}>Visibili solo a te e al DM.</p>
          {sessionNotes.length === 0 && <p style={{ color: T.inkFaint, fontStyle: 'italic' }}>Le pagine del diario sono ancora vuote...</p>}
          {sessionNotes.map(n => (
            <Card key={n.id} style={{ marginBottom: 10, cursor: 'pointer' }} onClick={() => setExpandedNote(expandedNote === n.id ? null : n.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><span style={{ fontWeight: 600, fontSize: 16, color: T.ink, ...headerFont }}>{n.session_title}</span>{n.date && <span style={{ fontSize: 12, color: T.gold, marginLeft: 8, ...headerFont }}>{formatDate(n.date)}</span>}</div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {isOwner && <><button onClick={e => { e.stopPropagation(); openEditNote(n) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4, color: T.inkFaint }}>✏️</button><button onClick={e => { e.stopPropagation(); removeNote(n.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4, color: T.inkFaint }}>🗑️</button></>}
                  <span style={{ color: T.gold, padding: 4 }}>{expandedNote === n.id ? '▲' : '▼'}</span>
                </div>
              </div>
              {expandedNote === n.id && <><Divider /><pre style={{ margin: 0, fontFamily: "'Crimson Text', Georgia, serif", fontSize: 15, lineHeight: 1.8, color: T.inkLight, whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>{n.content}</pre></>}
            </Card>
          ))}
          {showNoteModal && (
            <Modal title={editingNote ? 'Modifica Nota' : 'Nuova Nota di Sessione'} onClose={() => setShowNoteModal(false)}>
              <NotePhotoScanner onTranscribed={text => setNoteForm(f => ({ ...f, content: f.content ? f.content + '\n\n' + text : text }))} />
              <FF label="Titolo / Sessione"><Input value={noteForm.session_title} onChange={e => setNoteForm({ ...noteForm, session_title: e.target.value })} placeholder="es. Sessione 3 — La cripta" /></FF>
              <FF label="Data"><Input type="date" value={noteForm.date} onChange={e => setNoteForm({ ...noteForm, date: e.target.value })} /></FF>
              <FF label="Note"><Textarea value={noteForm.content} onChange={e => setNoteForm({ ...noteForm, content: e.target.value })} style={{ minHeight: 160 }} /></FF>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}><BtnS onClick={() => setShowNoteModal(false)}>Annulla</BtnS><BtnP onClick={saveNote}>Sigilla</BtnP></div>
            </Modal>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Party ────────────────────────────────────────────────────────────────────
function SharedSection() {
  const [loot, setLoot] = useState([])
  const [quests, setQuests] = useState([])
  const [groupNotes, setGroupNotes] = useState([])
  const [partyCoins, setPartyCoins] = useState({ gold: 0, silver: 0, copper: 0, platinum: 0 })
  const [showLootModal, setShowLootModal] = useState(false)
  const [editingLoot, setEditingLoot] = useState(null)
  const [showQuestModal, setShowQuestModal] = useState(false)
  const [editingQuest, setEditingQuest] = useState(null)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [editingGNote, setEditingGNote] = useState(null)
  const [expandedNote, setExpandedNote] = useState(null)
  const [lootForm, setLootForm] = useState({ name: '', quantity: 1, notes: '' })
  const [questForm, setQuestForm] = useState({ title: '', description: '', status: 'attiva', reward: '' })
  const [gnoteForm, setGnoteForm] = useState({ session_title: '', date: '', content: '' })
  const [activeTab, setActiveTab] = useState('loot')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('party_loot').select('*').order('created_at'),
      supabase.from('quests').select('*').order('created_at'),
      supabase.from('group_notes').select('*').order('created_at', { ascending: false }),
    ]).then(([l, q, gn]) => {
      const coins = { gold: 0, silver: 0, copper: 0, platinum: 0 }
      const items = []
      ;(l.data || []).forEach(item => { if (item.name === '__coins__') { try { Object.assign(coins, JSON.parse(item.notes || '{}')) } catch {} } else { items.push(item) } })
      setPartyCoins(coins); setLoot(items); setQuests(q.data || []); setGroupNotes(gn.data || []); setLoading(false)
    })
  }, [])

  const savePartyCoins = async (newCoins) => {
    setPartyCoins(newCoins)
    const existing = await supabase.from('party_loot').select('id').eq('name', '__coins__').maybeSingle()
    if (existing.data) { await supabase.from('party_loot').update({ notes: JSON.stringify(newCoins) }).eq('id', existing.data.id) }
    else { await supabase.from('party_loot').insert([{ name: '__coins__', quantity: 1, notes: JSON.stringify(newCoins) }]) }
  }
  const openAddLoot = () => { setEditingLoot(null); setLootForm({ name: '', quantity: 1, notes: '' }); setShowLootModal(true) }
  const openEditLoot = (item) => { setEditingLoot(item); setLootForm({ name: item.name, quantity: item.quantity, notes: item.notes || '' }); setShowLootModal(true) }
  const saveLoot = async () => {
    if (!lootForm.name) return
    if (editingLoot) { const { data } = await supabase.from('party_loot').update(lootForm).eq('id', editingLoot.id).select(); if (data) setLoot(loot.map(l => l.id === editingLoot.id ? data[0] : l)) }
    else { const { data } = await supabase.from('party_loot').insert([lootForm]).select(); if (data) setLoot([...loot, data[0]]) }
    setShowLootModal(false)
  }
  const removeLoot = async (id) => { await supabase.from('party_loot').delete().eq('id', id); setLoot(loot.filter(l => l.id !== id)) }
  const openAddQuest = () => { setEditingQuest(null); setQuestForm({ title: '', description: '', status: 'attiva', reward: '' }); setShowQuestModal(true) }
  const openEditQuest = (q) => { setEditingQuest(q); setQuestForm({ title: q.title, description: q.description || '', status: q.status, reward: q.reward || '' }); setShowQuestModal(true) }
  const saveQuest = async () => {
    if (!questForm.title) return
    if (editingQuest) { const { data } = await supabase.from('quests').update(questForm).eq('id', editingQuest.id).select(); if (data) setQuests(quests.map(q => q.id === editingQuest.id ? data[0] : q)) }
    else { const { data } = await supabase.from('quests').insert([questForm]).select(); if (data) setQuests([...quests, data[0]]) }
    setShowQuestModal(false)
  }
  const removeQuest = async (id) => { await supabase.from('quests').delete().eq('id', id); setQuests(quests.filter(q => q.id !== id)) }
  const openAddGNote = () => { setEditingGNote(null); setGnoteForm({ session_title: '', date: '', content: '' }); setShowNoteModal(true) }
  const openEditGNote = (n) => { setEditingGNote(n); setGnoteForm({ session_title: n.session_title, date: n.date || '', content: n.content || '' }); setShowNoteModal(true) }
  const saveGNote = async () => {
    if (!gnoteForm.session_title) return
    if (editingGNote) { const { data } = await supabase.from('group_notes').update(gnoteForm).eq('id', editingGNote.id).select(); if (data) setGroupNotes(groupNotes.map(n => n.id === editingGNote.id ? data[0] : n)) }
    else { const { data } = await supabase.from('group_notes').insert([gnoteForm]).select(); if (data) setGroupNotes([data[0], ...groupNotes]) }
    setShowNoteModal(false)
  }
  const removeGNote = async (id) => { await supabase.from('group_notes').delete().eq('id', id); setGroupNotes(groupNotes.filter(n => n.id !== id)) }

  if (loading) return <p style={{ color: T.inkFaint }}>Caricamento...</p>
  return (
    <div>
      <Tabs tabs={['loot', 'quest', 'note gruppo']} active={activeTab} onChange={setActiveTab} />
      {activeTab === 'loot' && (
        <div>
          <CoinsPanel values={partyCoins} onChange={(k, v) => savePartyCoins({ ...partyCoins, [k]: v })} editable={true} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}><span style={{ fontWeight: 700, fontSize: 18, color: T.red, ...headerFont }}>⚔️ Bottino del Gruppo</span><BtnP onClick={openAddLoot}>+ Aggiungi</BtnP></div>
          {loot.length === 0 && <p style={{ color: T.inkFaint, fontStyle: 'italic' }}>Le casse del gruppo sono vuote...</p>}
          {loot.map(item => <Card key={item.id} style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}><div style={{ flex: 1 }}><span style={{ fontWeight: 600, color: T.ink, fontSize: 16, ...headerFont }}>{item.name}</span>{item.notes && <span style={{ fontSize: 13, color: T.inkFaint, marginLeft: 8, fontStyle: 'italic' }}>{item.notes}</span>}</div><div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}><span style={{ fontWeight: 700, color: T.gold, fontSize: 16 }}>×{item.quantity}</span><button onClick={() => openEditLoot(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4, color: T.inkFaint }}>✏️</button><button onClick={() => removeLoot(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4, color: T.inkFaint }}>🗑️</button></div></Card>)}
          {showLootModal && <Modal title={editingLoot ? 'Modifica' : 'Aggiungi al Bottino'} onClose={() => setShowLootModal(false)}><FF label="Nome"><Input value={lootForm.name} onChange={e => setLootForm({ ...lootForm, name: e.target.value })} /></FF><FF label="Quantità"><Input type="number" value={lootForm.quantity} onChange={e => setLootForm({ ...lootForm, quantity: e.target.value })} /></FF><FF label="Note"><Input value={lootForm.notes} onChange={e => setLootForm({ ...lootForm, notes: e.target.value })} /></FF><div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}><BtnS onClick={() => setShowLootModal(false)}>Annulla</BtnS><BtnP onClick={saveLoot}>Aggiungi</BtnP></div></Modal>}
        </div>
      )}
      {activeTab === 'quest' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}><span style={{ fontWeight: 700, fontSize: 18, color: T.red, ...headerFont }}>📋 Missioni</span><BtnP onClick={openAddQuest}>+ Nuova</BtnP></div>
          {quests.length === 0 && <p style={{ color: T.inkFaint, fontStyle: 'italic' }}>Nessuna missione in corso...</p>}
          {quests.map(q => <Card key={q.id} style={{ marginBottom: 10 }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}><span style={{ fontWeight: 600, flex: 1, color: T.ink, fontSize: 16, ...headerFont }}>{q.title}</span><div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}><Badge color={QUEST_STATUS_COLORS[q.status] || T.inkFaint}>{q.status}</Badge><button onClick={() => openEditQuest(q)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4, color: T.inkFaint }}>✏️</button><button onClick={() => removeQuest(q.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4, color: T.inkFaint }}>🗑️</button></div></div><p style={{ margin: '6px 0', fontSize: 15, color: T.inkLight, lineHeight: 1.6 }}>{q.description}</p>{q.reward && <div style={{ fontSize: 13, color: T.gold, fontStyle: 'italic' }}>⚜️ Ricompensa: {q.reward}</div>}</Card>)}
          {showQuestModal && <Modal title={editingQuest ? 'Modifica Missione' : 'Nuova Missione'} onClose={() => setShowQuestModal(false)}><FF label="Titolo"><Input value={questForm.title} onChange={e => setQuestForm({ ...questForm, title: e.target.value })} /></FF><FF label="Stato"><Sel value={questForm.status} onChange={e => setQuestForm({ ...questForm, status: e.target.value })}>{Object.keys(QUEST_STATUS_COLORS).map(s => <option key={s}>{s}</option>)}</Sel></FF><FF label="Descrizione"><Textarea value={questForm.description} onChange={e => setQuestForm({ ...questForm, description: e.target.value })} /></FF><FF label="Ricompensa"><Input value={questForm.reward} onChange={e => setQuestForm({ ...questForm, reward: e.target.value })} /></FF><div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}><BtnS onClick={() => setShowQuestModal(false)}>Annulla</BtnS><BtnP onClick={saveQuest}>Salva</BtnP></div></Modal>}
        </div>
      )}
      {activeTab === 'note gruppo' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}><span style={{ fontWeight: 700, fontSize: 18, color: T.red, ...headerFont }}>📜 Cronache del Gruppo</span><BtnP onClick={openAddGNote}>+ Nuova nota</BtnP></div>
          <p style={{ fontSize: 13, color: T.inkFaint, marginBottom: 16, fontStyle: 'italic' }}>Visibili e modificabili da tutta la compagnia.</p>
          {groupNotes.length === 0 && <p style={{ color: T.inkFaint, fontStyle: 'italic' }}>Le cronache sono ancora vergini...</p>}
          {groupNotes.map(n => (
            <Card key={n.id} style={{ marginBottom: 10, cursor: 'pointer' }} onClick={() => setExpandedNote(expandedNote === n.id ? null : n.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><span style={{ fontWeight: 600, fontSize: 16, color: T.ink, ...headerFont }}>{n.session_title}</span>{n.date && <span style={{ fontSize: 12, color: T.gold, marginLeft: 8, ...headerFont }}>{formatDate(n.date)}</span>}</div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}><button onClick={e => { e.stopPropagation(); openEditGNote(n) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4, color: T.inkFaint }}>✏️</button><button onClick={e => { e.stopPropagation(); removeGNote(n.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4, color: T.inkFaint }}>🗑️</button><span style={{ color: T.gold, padding: 4 }}>{expandedNote === n.id ? '▲' : '▼'}</span></div>
              </div>
              {expandedNote === n.id && <><Divider /><pre style={{ margin: 0, fontFamily: "'Crimson Text', Georgia, serif", fontSize: 15, lineHeight: 1.8, color: T.inkLight, whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>{n.content}</pre></>}
            </Card>
          ))}
          {showNoteModal && <Modal title={editingGNote ? 'Modifica Cronaca' : 'Nuova Cronaca di Gruppo'} onClose={() => setShowNoteModal(false)}><NotePhotoScanner onTranscribed={text => setGnoteForm(f => ({ ...f, content: f.content ? f.content + '\n\n' + text : text }))} /><FF label="Titolo / Sessione"><Input value={gnoteForm.session_title} onChange={e => setGnoteForm({ ...gnoteForm, session_title: e.target.value })} placeholder="es. Sessione 3 — La cripta" /></FF><FF label="Data"><Input type="date" value={gnoteForm.date} onChange={e => setGnoteForm({ ...gnoteForm, date: e.target.value })} /></FF><FF label="Cronaca"><Textarea value={gnoteForm.content} onChange={e => setGnoteForm({ ...gnoteForm, content: e.target.value })} style={{ minHeight: 160 }} /></FF><div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}><BtnS onClick={() => setShowNoteModal(false)}>Annulla</BtnS><BtnP onClick={saveGNote}>Trascrivi</BtnP></div></Modal>}
        </div>
      )}
    </div>
  )
}

// ─── Tira Dadi ────────────────────────────────────────────────────────────────
function DiceSection() {
  const DICE = [4, 6, 8, 10, 12, 20, 100]
  const DC = { 4: T.purple, 6: T.green, 8: T.red, 10: T.blue, 12: '#7a1a4a', 20: T.gold, 100: T.inkFaint }
  const [counts, setCounts] = useState({ 4: 0, 6: 0, 8: 0, 10: 0, 12: 0, 20: 1, 100: 0 })
  const [mod, setMod] = useState(0)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [rolling, setRolling] = useState(false)
  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  const roll = () => {
    if (total === 0) return; setRolling(true)
    setTimeout(() => {
      const rolled = []; let sum = mod
      Object.entries(counts).forEach(([f, n]) => { for (let i = 0; i < n; i++) { const v = Math.floor(Math.random() * parseInt(f)) + 1; rolled.push({ f: parseInt(f), v }); sum += v } })
      rolled.sort((a, b) => b.f - a.f)
      const label = Object.entries(counts).filter(([, n]) => n > 0).map(([f, n]) => `${n}d${f === '100' ? '%' : f}`).join('+') + (mod !== 0 ? (mod > 0 ? `+${mod}` : `${mod}`) : '')
      const r = { rolled, sum, mod, label, time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) }
      setResult(r); setHistory(h => [r, ...h].slice(0, 10)); setRolling(false)
    }, 350)
  }
  const reset = () => { setCounts({ 4: 0, 6: 0, 8: 0, 10: 0, 12: 0, 20: 1, 100: 0 }); setMod(0); setResult(null) }

  return (
    <div>
      <SH title="🎲 Tira Dadi" />
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: 10, marginBottom: 16 }}>
          {DICE.map(f => { const c = DC[f]; const n = counts[f]; return <div key={f} style={{ textAlign: 'center' }}><div style={{ fontSize: 13, fontWeight: 700, color: c, marginBottom: 6, ...headerFont }}>{f === 100 ? 'd%' : `d${f}`}</div><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><button onClick={() => setCounts(p => ({ ...p, [f]: Math.max(0, p[f] - 1) }))} style={{ width: 30, height: 30, borderRadius: '50%', border: `1.5px solid ${c}66`, background: c + '11', color: c, fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>−</button><span style={{ fontSize: 18, fontWeight: 700, minWidth: 22, color: n > 0 ? c : T.parchmentDarker }}>{n}</span><button onClick={() => setCounts(p => ({ ...p, [f]: p[f] + 1 }))} style={{ width: 30, height: 30, borderRadius: '50%', border: `1.5px solid ${c}66`, background: c + '11', color: c, fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>+</button></div></div> })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 14, borderTop: `1px solid ${T.parchmentDarker}`, marginBottom: 16 }}>
          <span style={{ fontSize: 14, color: T.inkLight }}>Modificatore:</span>
          <button onClick={() => setMod(m => m - 1)} style={{ width: 34, height: 34, borderRadius: '50%', border: `1.5px solid ${T.parchmentDarker}`, background: T.parchmentDark, fontSize: 18, cursor: 'pointer', color: T.inkLight }}>−</button>
          <span style={{ fontSize: 18, fontWeight: 700, minWidth: 34, textAlign: 'center', color: mod > 0 ? T.green : mod < 0 ? T.red : T.inkFaint }}>{mod > 0 ? '+' + mod : mod}</span>
          <button onClick={() => setMod(m => m + 1)} style={{ width: 34, height: 34, borderRadius: '50%', border: `1.5px solid ${T.parchmentDarker}`, background: T.parchmentDark, fontSize: 18, cursor: 'pointer', color: T.inkLight }}>+</button>
        </div>
        <div style={{ display: 'flex', gap: 10 }}><BtnP onClick={roll} disabled={total === 0 || rolling} style={{ flex: 1, fontSize: 17 }}>{rolling ? '🎲 ...' : `🎲 Tira${total > 0 ? ` (${total})` : ''}`}</BtnP><BtnS onClick={reset} style={{ minWidth: 80 }}>Reset</BtnS></div>
      </Card>
      {result && <Card style={{ marginBottom: 16, border: `2px solid ${T.gold}`, background: `linear-gradient(135deg, #f8f0d8, #f4e4c1)` }}><div style={{ fontSize: 13, color: T.inkFaint, marginBottom: 8 }}>{result.label}</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>{result.rolled.map((r, i) => <div key={i} style={{ width: 46, height: 46, borderRadius: 6, background: DC[r.f] + '22', border: `2px solid ${DC[r.f]}66`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 17, fontWeight: 700, color: DC[r.f], lineHeight: 1 }}>{r.v}</span><span style={{ fontSize: 9, color: DC[r.f] + 'aa' }}>d{r.f}</span></div>)}{result.mod !== 0 && <div style={{ width: 46, height: 46, borderRadius: 6, background: T.parchmentDark, border: `2px solid ${T.parchmentDarker}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 14, fontWeight: 700, color: result.mod > 0 ? T.green : T.red, lineHeight: 1 }}>{result.mod > 0 ? '+' : ''}{result.mod}</span><span style={{ fontSize: 9, color: T.inkFaint }}>mod</span></div>}</div><Divider /><div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}><span style={{ fontSize: 14, color: T.inkFaint }}>Totale:</span><span style={{ fontSize: 44, fontWeight: 700, color: T.red, lineHeight: 1, ...headerFont }}>{result.sum}</span></div></Card>}
      {history.length > 1 && <div><p style={{ fontSize: 13, fontWeight: 600, color: T.inkFaint, marginBottom: 8, ...headerFont, letterSpacing: '0.05em' }}>TIRI PRECEDENTI</p>{history.slice(1).map((h, i) => <Card key={i} style={{ padding: '0.6rem 1rem', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: 14, color: T.inkLight }}>{h.label}</span><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ fontSize: 20, fontWeight: 700, color: T.red }}>{h.sum}</span><span style={{ fontSize: 11, color: T.inkFaint }}>{h.time}</span></div></Card>)}</div>}
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ profile, players, activeSection, setActiveSection, onLogout, isOpen, onClose, isDM }) {
  const DM_SECTIONS = [
    { id: 'sessioni', label: 'Sessioni', icon: '📜' },
    { id: 'npc', label: 'Personaggi', icon: '🧑‍🤝‍🧑' },
    { id: 'mappa', label: 'Mappa', icon: '🗺️' },
    { id: 'timeline', label: 'Cronaca', icon: '📅' },
    { id: 'spells', label: 'Incantesimi', icon: '✨' },
    { id: 'party', label: 'Compagnia', icon: '⚔️' },
    { id: 'dadi', label: 'Tira Dadi', icon: '🎲' },
  ]
  const DM_ONLY = [{ id: 'note_dm', label: 'Pergamene Segrete', icon: '🔒' }]
  const playerSections = isDM ? players : players.filter(p => p.id === profile?.id)
  const handleNav = (id) => { setActiveSection(id); onClose() }
  const isActive = (id) => activeSection === id
  const btnStyle = (id) => ({
    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
    padding: '10px 12px', borderRadius: 4,
    border: isActive(id) ? `1px solid ${T.goldLight}44` : '1px solid transparent',
    background: isActive(id) ? 'rgba(244,228,193,0.1)' : 'transparent',
    fontSize: 15, cursor: 'pointer', color: isActive(id) ? T.goldLight : T.parchmentDarker,
    fontWeight: isActive(id) ? 600 : 400, textAlign: 'left', minHeight: 44,
    fontFamily: isActive(id) ? "'Cinzel', Georgia, serif" : "'Crimson Text', Georgia, serif",
  })

  return (
    <>
      {isOpen && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(10,5,2,0.6)', zIndex: 200 }} />}
      <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 270, background: `linear-gradient(180deg, #2a1508 0%, #1a0f05 100%)`, borderRight: `2px solid ${T.gold}44`, display: 'flex', flexDirection: 'column', zIndex: 300, transform: isOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.25s ease', boxShadow: isOpen ? `6px 0 24px rgba(0,0,0,0.5)` : 'none', overflowY: 'auto' }}>
        <div style={{ padding: '1.5rem 1rem 1rem', borderBottom: `1px solid ${T.gold}33`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, display: 'flex', alignItems: 'center', gap: 8, color: T.parchment, fontFamily: "'Cinzel', Georgia, serif", letterSpacing: '0.03em' }}><span style={{ fontSize: 24 }}>🐗</span> D&Cinghiali</div>
            <div style={{ fontSize: 13, color: T.goldLight, marginTop: 4, fontStyle: 'italic', fontFamily: "'Crimson Text', Georgia, serif" }}>{profile?.username} · {isDM ? 'Dungeon Master' : 'Avventuriero'}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: T.goldLight, padding: 4 }}>×</button>
        </div>
        <div style={{ flex: 1, padding: '1rem 0.5rem' }}>
          <div style={{ fontSize: 10, color: T.goldLight, padding: '0 0.75rem', marginBottom: 6, letterSpacing: '0.1em', fontFamily: "'Cinzel', Georgia, serif" }}>LA CAMPAGNA</div>
          {DM_SECTIONS.map(s => <button key={s.id} onClick={() => handleNav(s.id)} style={btnStyle(s.id)}><span style={{ fontSize: 16 }}>{s.icon}</span>{s.label}</button>)}
          {isDM && <>
            <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${T.gold}44, transparent)`, margin: '12px 8px' }} />
            <div style={{ fontSize: 10, color: T.goldLight, padding: '0 0.75rem', marginBottom: 6, letterSpacing: '0.1em', fontFamily: "'Cinzel', Georgia, serif" }}>SEGRETI</div>
            {DM_ONLY.map(s => <button key={s.id} onClick={() => handleNav(s.id)} style={btnStyle(s.id)}><span style={{ fontSize: 16 }}>{s.icon}</span>{s.label}</button>)}
          </>}
          <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${T.gold}44, transparent)`, margin: '12px 8px' }} />
          <div style={{ fontSize: 10, color: T.goldLight, padding: '0 0.75rem', marginBottom: 6, letterSpacing: '0.1em', fontFamily: "'Cinzel', Georgia, serif" }}>LA COMPAGNIA</div>
          {playerSections.map(p => <button key={p.id} onClick={() => handleNav('player_' + p.id)} style={btnStyle('player_' + p.id)}><span style={{ width: 10, height: 10, borderRadius: '50%', background: p.player_color || T.gold, flexShrink: 0, display: 'inline-block', boxShadow: `0 0 4px ${p.player_color || T.gold}88` }} />{p.username}</button>)}
        </div>
        <div style={{ padding: '0.75rem', borderTop: `1px solid ${T.gold}33` }}>
          <button onClick={() => { onClose(); onLogout() }} style={{ width: '100%', padding: '10px 12px', borderRadius: 4, border: `1px solid ${T.red}44`, background: `${T.red}22`, fontSize: 14, cursor: 'pointer', color: T.parchmentDarker, textAlign: 'left', minHeight: 44, fontFamily: "'Crimson Text', Georgia, serif" }}>← Abbandona l'avventura</button>
        </div>
      </div>
    </>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function Campaign({ profile, onLogout }) {
  const [players, setPlayers] = useState([])
  const [activeSection, setActiveSection] = useState('sessioni')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isDM = profile?.role === 'dm'

  useEffect(() => { supabase.from('profiles').select('*').eq('role', 'player').order('username').then(({ data }) => setPlayers(data || [])) }, [])

  const LABELS = { sessioni: '📜 Sessioni', npc: '🧑‍🤝‍🧑 Personaggi', mappa: '🗺️ Mappa', timeline: '📅 Cronaca', spells: '✨ Incantesimi', party: '⚔️ Compagnia', dadi: '🎲 Tira Dadi', note_dm: '🔒 Pergamene Segrete' }
  const currentLabel = activeSection.startsWith('player_') ? (players.find(p => p.id === activeSection.replace('player_', ''))?.username || 'Avventuriero') : (LABELS[activeSection] || activeSection)

  const renderSection = () => {
    if (activeSection === 'sessioni') return <SessionsSection isDM={isDM} />
    if (activeSection === 'npc') return <NPCSection isDM={isDM} />
    if (activeSection === 'mappa') return <MapSection isDM={isDM} />
    if (activeSection === 'timeline') return <TimelineSection isDM={isDM} />
    if (activeSection === 'spells') return <SpellsSection />
    if (activeSection === 'party') return <SharedSection />
    if (activeSection === 'dadi') return <DiceSection />
    if (activeSection === 'note_dm' && isDM) return <DMNotesSection />
    if (activeSection.startsWith('player_')) {
      const pid = activeSection.replace('player_', '')
      const player = players.find(p => p.id === pid)
      if (player) return <PlayerTab player={player} currentUserId={profile?.id} isDM={isDM} />
    }
    return null
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1a0f08', fontFamily: "'Crimson Text', Georgia, serif", color: T.ink }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: `linear-gradient(180deg, #2a1508, #1a0f05)`, borderBottom: `1px solid ${T.gold}44`, padding: '0 1rem', height: 54, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
        <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 6, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 40, minHeight: 40, justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ display: 'block', width: 20, height: 2, background: T.goldLight, borderRadius: 2 }} />
          <span style={{ display: 'block', width: 20, height: 2, background: T.goldLight, borderRadius: 2 }} />
          <span style={{ display: 'block', width: 20, height: 2, background: T.goldLight, borderRadius: 2 }} />
        </button>
        <span style={{ fontSize: 20 }}>🐗</span>
        <span style={{ fontWeight: 600, fontSize: 15, flex: 1, color: T.parchment, fontFamily: "'Cinzel', Georgia, serif", letterSpacing: '0.03em' }}>{currentLabel}</span>
        <span style={{ fontSize: 13, color: T.goldLight, fontStyle: 'italic' }}>{profile?.username}</span>
      </div>
      <Sidebar profile={profile} players={players} activeSection={activeSection} setActiveSection={setActiveSection} onLogout={onLogout} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isDM={isDM} />
      <div style={{ padding: '1.25rem 1rem', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ ...parchmentBg, borderRadius: 8, padding: '1.5rem', minHeight: 'calc(100vh - 80px)', boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)', border: `1px solid ${T.parchmentDarker}` }}>
          {renderSection()}
        </div>
      </div>
    </div>
  )
}
