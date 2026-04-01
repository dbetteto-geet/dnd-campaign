'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const ATTITUDE_COLORS = { Alleato: '#1D9E75', Neutrale: '#888780', Nemico: '#D85A30', Sconosciuto: '#7F77DD' }
const EVENT_COLORS = { scoperta: '#7F77DD', incontro: '#1D9E75', combattimento: '#D85A30', mistero: '#378ADD', altro: '#888780' }
const STATUS_COLORS = { visitato: '#1D9E75', noto: '#378ADD', sconosciuto: '#888780', pericoloso: '#D85A30' }
const QUEST_STATUS_COLORS = { attiva: '#1D9E75', completata: '#888780', fallita: '#D85A30', in_sospeso: '#BA7517' }
const ITEM_TYPE_COLORS = { 'Arma magica': '#7F77DD', Consumabile: '#1D9E75', Armatura: '#378ADD', Vari: '#888780', Arma: '#D85A30' }
function feetToMeters(str) {
  if (!str) return str
  return str.replace(/(\d+)\s*feet?/gi, (_, n) => `${Math.round(parseInt(n) * 0.3)} m`)
            .replace(/(\d+)\s*ft\.?/gi, (_, n) => `${Math.round(parseInt(n) * 0.3)} m`)
            .replace(/(\d+)\s*mile[s]?/gi, (_, n) => `${Math.round(parseInt(n) * 1.6)} km`)
}

const SCHOOL_COLORS= { Evocazione: '#D85A30', Illusione: '#7F77DD', Necromanzia: '#5F5E5A', Trasformazione: '#1D9E75', Divinazione: '#378ADD', Ammaliamento: '#D4537E', Abiurazione: '#BA7517', Invocazione: '#0F6E56' }
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

// ─── UI ───────────────────────────────────────────────────────────────────────

function Badge({ color, children }) {
  return <span style={{ background: color + '22', color, border: `1px solid ${color}44`, borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 500 }}>{children}</span>
}
function Card({ children, style, onClick }) {
  return <div onClick={onClick} style={{ background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: '1rem 1.25rem', cursor: onClick ? 'pointer' : 'default', ...style }}>{children}</div>
}
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: '16px 16px 0 0', padding: '1.5rem', width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontWeight: 600, fontSize: 18 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 26, cursor: 'pointer', color: '#6b7280', padding: '0 4px' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}
function FF({ label, children }) {
  return <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{label}</label>{children}</div>
}
function Input(props) {
  return <input style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 16 }} {...props} />
}
function Textarea(props) {
  return <textarea style={{ width: '100%', boxSizing: 'border-box', minHeight: 90, padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 16, resize: 'vertical' }} {...props} />
}
function Sel({ children, ...props }) {
  return <select style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 16, background: '#fff' }} {...props}>{children}</select>
}
function BtnP({ children, onClick, style, disabled }) {
  return <button onClick={onClick} disabled={disabled} style={{ background: disabled ? '#9ca3af' : '#1D9E75', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 18px', fontSize: 15, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', minHeight: 44, ...style }}>{children}</button>
}
function BtnS({ children, onClick, style }) {
  return <button onClick={onClick} style={{ background: '#f9fafb', color: '#374151', border: '1px solid #d1d5db', borderRadius: 10, padding: '11px 18px', fontSize: 15, cursor: 'pointer', minHeight: 44, ...style }}>{children}</button>
}
function BtnD({ children, onClick }) {
  return <button onClick={onClick} style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', fontSize: 14, cursor: 'pointer', minHeight: 44 }}>{children}</button>
}
function SH({ title, action }) {
  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', gap: 8, flexWrap: 'wrap' }}><h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>{title}</h2>{action}</div>
}
function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#f3f4f6', borderRadius: 10, padding: 4, overflowX: 'auto' }}>
      {tabs.map(t => <button key={t} onClick={() => onChange(t)} style={{ flex: '1 0 auto', padding: '8px 6px', borderRadius: 8, border: 'none', background: active === t ? '#fff' : 'transparent', fontWeight: active === t ? 600 : 400, fontSize: 13, cursor: 'pointer', color: '#374151', boxShadow: active === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', whiteSpace: 'nowrap' }}>{t}</button>)}
    </div>
  )
}
function ImgUpload({ bucket, folder, currentPath, onUploaded, label }) {
  const [uploading, setUploading] = useState(false)
  const ref = useRef()
  const url = getPublicUrl(bucket, currentPath)
  const handle = async (e) => {
    const file = e.target.files[0]; if (!file) return
    setUploading(true)
    const path = await uploadImage(bucket, file, folder)
    setUploading(false); if (path) onUploaded(path)
  }
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{label || 'Immagine'}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {url && <img src={url} alt="" style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover', border: '1px solid #e5e7eb' }} />}
        <button type="button" onClick={() => ref.current.click()} style={{ background: '#f9fafb', border: '1px solid #d1d5db', borderRadius: 10, padding: '10px 16px', fontSize: 14, cursor: 'pointer', minHeight: 44 }}>
          {uploading ? 'Caricamento...' : url ? 'Cambia' : 'Carica immagine'}
        </button>
        <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={handle} />
      </div>
    </div>
  )
}

// ─── Monete ───────────────────────────────────────────────────────────────────

function CoinsPanel({ values, onChange, editable }) {
  const COINS = [
    { key: 'gold', label: 'MO', color: '#B45309', bg: '#fffbeb', border: '#fde68a' },
    { key: 'silver', label: 'MA', color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
    { key: 'copper', label: 'MR', color: '#92400e', bg: '#fff7ed', border: '#fed7aa' },
    { key: 'platinum', label: 'MP', color: '#7F77DD', bg: '#f5f3ff', border: '#ddd6fe' },
  ]
  return (
    <Card style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 12px' }}>Monete</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {COINS.map(({ key, label, color, bg, border }) => (
          <div key={key} style={{ textAlign: 'center', background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: '10px 4px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 6 }}>{label}</div>
            {editable
              ? <input type="number" min="0" value={values[key] ?? 0} onChange={e => onChange(key, parseInt(e.target.value) || 0)}
                  style={{ width: '100%', textAlign: 'center', padding: '5px 2px', border: `1px solid ${border}`, borderRadius: 7, fontSize: 16, fontWeight: 700, color, background: 'white', boxSizing: 'border-box' }} />
              : <div style={{ fontSize: 20, fontWeight: 700, color }}>{values[key] ?? 0}</div>
            }
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── Tira Dadi ────────────────────────────────────────────────────────────────

function DiceSection() {
  const DICE = [4, 6, 8, 10, 12, 20, 100]
  const DC = { 4: '#7F77DD', 6: '#1D9E75', 8: '#D85A30', 10: '#378ADD', 12: '#D4537E', 20: '#BA7517', 100: '#5F5E5A' }
  const [counts, setCounts] = useState({ 4: 0, 6: 0, 8: 0, 10: 0, 12: 0, 20: 1, 100: 0 })
  const [mod, setMod] = useState(0)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [rolling, setRolling] = useState(false)
  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  const roll = () => {
    if (total === 0) return
    setRolling(true)
    setTimeout(() => {
      const rolled = []
      let sum = mod
      Object.entries(counts).forEach(([f, n]) => {
        for (let i = 0; i < n; i++) {
          const v = Math.floor(Math.random() * parseInt(f)) + 1
          rolled.push({ f: parseInt(f), v }); sum += v
        }
      })
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
          {DICE.map(f => {
            const c = DC[f]; const n = counts[f]
            return (
              <div key={f} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: c, marginBottom: 6 }}>{f === 100 ? 'd%' : `d${f}`}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <button onClick={() => setCounts(p => ({ ...p, [f]: Math.max(0, p[f] - 1) }))} style={{ width: 30, height: 30, borderRadius: '50%', border: `1px solid ${c}44`, background: c + '11', color: c, fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>−</button>
                  <span style={{ fontSize: 18, fontWeight: 700, minWidth: 22, color: n > 0 ? c : '#d1d5db' }}>{n}</span>
                  <button onClick={() => setCounts(p => ({ ...p, [f]: p[f] + 1 }))} style={{ width: 30, height: 30, borderRadius: '50%', border: `1px solid ${c}44`, background: c + '11', color: c, fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>+</button>
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 14, borderTop: '1px solid #f3f4f6', marginBottom: 16 }}>
          <span style={{ fontSize: 14, color: '#6b7280' }}>Modificatore:</span>
          <button onClick={() => setMod(m => m - 1)} style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 18, cursor: 'pointer' }}>−</button>
          <span style={{ fontSize: 18, fontWeight: 700, minWidth: 34, textAlign: 'center', color: mod > 0 ? '#1D9E75' : mod < 0 ? '#D85A30' : '#9ca3af' }}>{mod > 0 ? '+' + mod : mod}</span>
          <button onClick={() => setMod(m => m + 1)} style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 18, cursor: 'pointer' }}>+</button>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <BtnP onClick={roll} disabled={total === 0 || rolling} style={{ flex: 1, fontSize: 17 }}>
            {rolling ? '🎲 ...' : `🎲 Tira${total > 0 ? ` (${total})` : ''}`}
          </BtnP>
          <BtnS onClick={reset} style={{ minWidth: 80 }}>Reset</BtnS>
        </div>
      </Card>

      {result && (
        <Card style={{ marginBottom: 16, border: '2px solid #1D9E75', background: '#f0fdf4' }}>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>{result.label}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {result.rolled.map((r, i) => (
              <div key={i} style={{ width: 46, height: 46, borderRadius: 10, background: DC[r.f] + '22', border: `2px solid ${DC[r.f]}44`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 17, fontWeight: 700, color: DC[r.f], lineHeight: 1 }}>{r.v}</span>
                <span style={{ fontSize: 9, color: DC[r.f] + 'aa' }}>d{r.f}</span>
              </div>
            ))}
            {result.mod !== 0 && (
              <div style={{ width: 46, height: 46, borderRadius: 10, background: '#f3f4f6', border: '2px solid #e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: result.mod > 0 ? '#1D9E75' : '#D85A30', lineHeight: 1 }}>{result.mod > 0 ? '+' : ''}{result.mod}</span>
                <span style={{ fontSize: 9, color: '#9ca3af' }}>mod</span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 14, color: '#6b7280' }}>Totale:</span>
            <span style={{ fontSize: 40, fontWeight: 800, color: '#1D9E75', lineHeight: 1 }}>{result.sum}</span>
          </div>
        </Card>
      )}

      {history.length > 1 && (
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#9ca3af', marginBottom: 8 }}>Tiri precedenti</p>
          {history.slice(1).map((h, i) => (
            <Card key={i} style={{ padding: '0.6rem 1rem', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>{h.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20, fontWeight: 700 }}>{h.sum}</span>
                <span style={{ fontSize: 11, color: '#9ca3af' }}>{h.time}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
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

  useEffect(() => {
    supabase.from('sessions').select('*').order('number').then(({ data }) => { setSessions(data || []); setLoading(false) })
  }, [])

  const openAdd = () => { setEditing(null); setForm({ number: '', title: '', date: '', summary: '' }); setShowModal(true) }
  const openEdit = (e, s) => { e.stopPropagation(); setEditing(s); setForm({ number: s.number, title: s.title, date: s.date || '', summary: s.summary || '' }); setShowModal(true) }
  const save = async () => {
    if (!form.title) return
    if (editing) {
      const { data } = await supabase.from('sessions').update(form).eq('id', editing.id).select()
      if (data) setSessions(sessions.map(s => s.id === editing.id ? data[0] : s))
    } else {
      const { data } = await supabase.from('sessions').insert([form]).select()
      if (data) setSessions([...sessions, data[0]])
    }
    setShowModal(false)
  }
  const remove = async (e, id) => { e.stopPropagation(); await supabase.from('sessions').delete().eq('id', id); setSessions(sessions.filter(s => s.id !== id)) }

  if (loading) return <p style={{ color: '#6b7280' }}>Caricamento...</p>
  return (
    <div>
      <SH title="Riassunti Sessioni" action={isDM && <BtnP onClick={openAdd}>+ Nuova</BtnP>} />
      {sessions.length === 0 && <p style={{ color: '#6b7280' }}>Nessuna sessione ancora.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sessions.map(s => (
          <Card key={s.id} onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div><span style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 2 }}>Sessione {s.number} · {s.date}</span><span style={{ fontWeight: 600 }}>{s.title}</span></div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {isDM && <><button onClick={e => openEdit(e, s)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 4 }}>✏️</button><button onClick={e => remove(e, s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 4 }}>🗑️</button></>}
                <span style={{ color: '#9ca3af' }}>{expanded === s.id ? '▲' : '▼'}</span>
              </div>
            </div>
            {expanded === s.id && <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.7, color: '#6b7280', borderTop: '1px solid #f3f4f6', paddingTop: 12 }}>{s.summary}</p>}
          </Card>
        ))}
      </div>
      {showModal && (
        <Modal title={editing ? 'Modifica Sessione' : 'Nuova Sessione'} onClose={() => setShowModal(false)}>
          <FF label="Numero"><Input type="number" value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} /></FF>
          <FF label="Titolo"><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></FF>
          <FF label="Data"><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></FF>
          <FF label="Riassunto"><Textarea value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} /></FF>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><BtnS onClick={() => setShowModal(false)}>Annulla</BtnS><BtnP onClick={save}>Salva</BtnP></div>
        </Modal>
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
  const [form, setForm] = useState({ name: '', role: '', attitude: 'Neutrale', description: '', notes_dm: '', image_path: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => { supabase.from('npcs').select('*').order('created_at').then(({ data }) => { setNpcs(data || []); setLoading(false) }) }, [])

  const openAdd = () => { setEditing(null); setForm({ name: '', role: '', attitude: 'Neutrale', description: '', notes_dm: '', image_path: '' }); setShowModal(true) }
  const openEdit = (e, npc) => { e && e.stopPropagation(); setEditing(npc); setForm({ name: npc.name, role: npc.role || '', attitude: npc.attitude, description: npc.description || '', notes_dm: npc.notes_dm || '', image_path: npc.image_path || '' }); setShowModal(true) }
  const save = async () => {
    if (!form.name) return
    if (editing) {
      const { data } = await supabase.from('npcs').update(form).eq('id', editing.id).select()
      if (data) { setNpcs(npcs.map(n => n.id === editing.id ? data[0] : n)); if (selected?.id === editing.id) setSelected(data[0]) }
    } else {
      const { data } = await supabase.from('npcs').insert([form]).select()
      if (data) setNpcs([...npcs, data[0]])
    }
    setShowModal(false)
  }
  const remove = async (id) => { await supabase.from('npcs').delete().eq('id', id); setNpcs(npcs.filter(n => n.id !== id)); setSelected(null) }

  if (loading) return <p style={{ color: '#6b7280' }}>Caricamento...</p>
  return (
    <div>
      <SH title="NPC Importanti" action={isDM && <BtnP onClick={openAdd}>+ Aggiungi</BtnP>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%,240px),1fr))', gap: 12 }}>
        {npcs.length === 0 && <p style={{ color: '#6b7280' }}>Nessun NPC ancora.</p>}
        {npcs.map(npc => {
          const img = getPublicUrl('npc-images', npc.image_path)
          return (
            <Card key={npc.id} onClick={() => setSelected(npc)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                {img ? <img src={img} alt={npc.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: 44, height: 44, borderRadius: '50%', background: (ATTITUDE_COLORS[npc.attitude] || '#888') + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600, color: ATTITUDE_COLORS[npc.attitude] || '#888', flexShrink: 0 }}>{npc.name[0]}</div>}
                <div><div style={{ fontWeight: 600 }}>{npc.name}</div><div style={{ fontSize: 13, color: '#9ca3af' }}>{npc.role}</div></div>
              </div>
              <Badge color={ATTITUDE_COLORS[npc.attitude] || '#888'}>{npc.attitude}</Badge>
              <p style={{ fontSize: 14, color: '#6b7280', marginTop: 8, marginBottom: 0, lineHeight: 1.5 }}>{npc.description}</p>
            </Card>
          )
        })}
      </div>
      {selected && (() => {
        const img = getPublicUrl('npc-images', selected.image_path)
        return (
          <Modal title={selected.name} onClose={() => setSelected(null)}>
            {img && <img src={img} alt={selected.name} style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 10, marginBottom: 12 }} />}
            <div style={{ marginBottom: 8 }}><Badge color={ATTITUDE_COLORS[selected.attitude] || '#888'}>{selected.attitude}</Badge><span style={{ fontSize: 14, color: '#6b7280', marginLeft: 8 }}>{selected.role}</span></div>
            <p style={{ fontSize: 15, lineHeight: 1.7 }}>{selected.description}</p>
            {isDM && selected.notes_dm && <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '0.75rem 1rem', marginTop: 12 }}><span style={{ fontSize: 12, fontWeight: 600, color: '#92400e', display: 'block', marginBottom: 4 }}>Note DM</span><span style={{ fontSize: 14, color: '#6b7280' }}>{selected.notes_dm}</span></div>}
            {isDM && <div style={{ display: 'flex', gap: 8, marginTop: 16 }}><BtnS onClick={() => openEdit(null, selected)}>✏️ Modifica</BtnS><BtnD onClick={() => remove(selected.id)}>🗑️ Elimina</BtnD></div>}
          </Modal>
        )
      })()}
      {showModal && (
        <Modal title={editing ? 'Modifica NPC' : 'Nuovo NPC'} onClose={() => setShowModal(false)}>
          <ImgUpload bucket="npc-images" folder="npcs" currentPath={form.image_path} onUploaded={p => setForm({ ...form, image_path: p })} label="Foto NPC" />
          <FF label="Nome"><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></FF>
          <FF label="Ruolo"><Input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} /></FF>
          <FF label="Attitudine"><Sel value={form.attitude} onChange={e => setForm({ ...form, attitude: e.target.value })}>{Object.keys(ATTITUDE_COLORS).map(a => <option key={a}>{a}</option>)}</Sel></FF>
          <FF label="Descrizione"><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></FF>
          <FF label="Note DM (private)"><Textarea value={form.notes_dm} onChange={e => setForm({ ...form, notes_dm: e.target.value })} /></FF>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><BtnS onClick={() => setShowModal(false)}>Annulla</BtnS><BtnP onClick={save}>Salva</BtnP></div>
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
    if (editing) {
      const { data } = await supabase.from('timeline_events').update(form).eq('id', editing.id).select()
      if (data) setEvents(events.map(e => e.id === editing.id ? data[0] : e))
    } else {
      const { data } = await supabase.from('timeline_events').insert([form]).select()
      if (data) setEvents([...events, data[0]])
    }
    setShowModal(false)
  }
  const remove = async (e, id) => { e.stopPropagation(); await supabase.from('timeline_events').delete().eq('id', id); setEvents(events.filter(ev => ev.id !== id)) }

  if (loading) return <p style={{ color: '#6b7280' }}>Caricamento...</p>
  return (
    <div>
      <SH title="Timeline Campagna" action={isDM && <BtnP onClick={openAdd}>+ Evento</BtnP>} />
      <div style={{ position: 'relative', paddingLeft: 24 }}>
        <div style={{ position: 'absolute', left: 8, top: 0, bottom: 0, width: 2, background: '#e5e7eb', borderRadius: 2 }} />
        {events.length === 0 && <p style={{ color: '#6b7280' }}>Nessun evento ancora.</p>}
        {events.map(ev => (
          <div key={ev.id} style={{ position: 'relative', marginBottom: 20 }}>
            <div style={{ position: 'absolute', left: -20, top: 8, width: 12, height: 12, borderRadius: '50%', background: EVENT_COLORS[ev.type] || '#888', border: '2px solid #fff' }} />
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><span style={{ fontSize: 12, color: '#9ca3af' }}>{ev.date_ingame}</span><div style={{ display: 'flex', gap: 8, marginTop: 2, flexWrap: 'wrap', alignItems: 'center' }}><span style={{ fontWeight: 600 }}>{ev.title}</span><Badge color={EVENT_COLORS[ev.type] || '#888'}>{ev.type}</Badge></div></div>
                {isDM && <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}><button onClick={e => openEdit(e, ev)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 4 }}>✏️</button><button onClick={e => remove(e, ev.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 4 }}>🗑️</button></div>}
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>{ev.description}</p>
            </Card>
          </div>
        ))}
      </div>
      {showModal && (
        <Modal title={editing ? 'Modifica' : 'Nuovo Evento'} onClose={() => setShowModal(false)}>
          <FF label="Data in-game"><Input value={form.date_ingame} onChange={e => setForm({ ...form, date_ingame: e.target.value })} placeholder="Anno 412, Mese del Vento" /></FF>
          <FF label="Titolo"><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></FF>
          <FF label="Tipo"><Sel value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>{Object.keys(EVENT_COLORS).map(t => <option key={t}>{t}</option>)}</Sel></FF>
          <FF label="Descrizione"><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></FF>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><BtnS onClick={() => setShowModal(false)}>Annulla</BtnS><BtnP onClick={save}>Salva</BtnP></div>
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
      if (data && data.length > 0) {
        const f = data.find(f => f.name.startsWith('map.')) || data[data.length - 1]
        setMapUrl(getPublicUrl('map-images', f.name) + '?t=' + Date.now())
      }
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
    if (editingPin) {
      const { data } = await supabase.from('map_pins').update(form).eq('id', editingPin.id).select()
      if (data) setPins(pins.map(p => p.id === editingPin.id ? data[0] : p))
    } else if (pendingPos) {
      const { data } = await supabase.from('map_pins').insert([{ ...form, ...pendingPos }]).select()
      if (data) setPins([...pins, data[0]])
    }
    setShowPinModal(false); setPendingPos(null); setEditingPin(null)
  }

  const removePin = async (id) => { await supabase.from('map_pins').delete().eq('id', id); setPins(pins.filter(p => p.id !== id)); setSelected(null) }

  const renderPins = () => pins.map(pin => (
    <div key={pin.id} onClick={e => { e.stopPropagation(); setSelected(pin) }}
      style={{ position: 'absolute', left: `${pin.x_percent}%`, top: `${pin.y_percent}%`, transform: 'translate(-50%, -50%)', cursor: 'pointer', zIndex: 10 }}>
      <div style={{ width: 16, height: 16, borderRadius: '50%', background: STATUS_COLORS[pin.status] || '#888', border: '2.5px solid white', boxShadow: '0 1px 5px rgba(0,0,0,0.5)', margin: '0 auto' }} />
          </div>
  ))

  if (loading) return <p style={{ color: '#6b7280' }}>Caricamento...</p>
  return (
    <div>
      <SH title="Mappa del Mondo" action={isDM && <BtnS onClick={() => setShowUploadModal(true)}>🗺️ Carica mappa</BtnS>} />
      {isDM && <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>Clicca sulla mappa per aggiungere un luogo.</p>}
      <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb', background: '#1a3a2a' }}>
        {mapUrl ? (
          <div style={{ position: 'relative', width: '100%', cursor: isDM ? 'crosshair' : 'default' }} onClick={handleClick}>
            <img src={mapUrl} alt="Mappa" style={{ width: '100%', height: 'auto', display: 'block', userSelect: 'none', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', inset: 0 }}>{renderPins()}</div>
          </div>
        ) : (
          <div style={{ width: '100%', paddingBottom: '50%', position: 'relative', cursor: isDM ? 'crosshair' : 'default' }} onClick={handleClick}>
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 100 50" preserveAspectRatio="none">
              <path d="M0,30 Q20,20 40,25 Q60,30 80,20 Q90,15 100,18 L100,50 L0,50 Z" fill="#0d4a2a" opacity="0.5" />
              <path d="M10,10 Q30,5 50,15 Q70,25 90,10 L100,0 L0,0 Z" fill="#0d2a4a" opacity="0.4" />
            </svg>
            <div style={{ position: 'absolute', inset: 0 }}>{renderPins()}</div>
            {isDM && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}><span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Nessuna mappa — clicca "Carica mappa"</span></div>}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
        {Object.entries(STATUS_COLORS).map(([k, v]) => <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280' }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: v, display: 'inline-block' }} />{k}</span>)}
      </div>
      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          <Badge color={STATUS_COLORS[selected.status] || '#888'}>{selected.status}</Badge>
          <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.7 }}>{selected.description}</p>
          {isDM && <div style={{ display: 'flex', gap: 8, marginTop: 12 }}><BtnS onClick={e => openEditPin(e, selected)}>✏️ Modifica</BtnS><BtnD onClick={() => removePin(selected.id)}>🗑️ Elimina</BtnD></div>}
        </Modal>
      )}
      {showPinModal && (
        <Modal title={editingPin ? 'Modifica Luogo' : 'Nuovo Luogo'} onClose={() => { setShowPinModal(false); setPendingPos(null) }}>
          <FF label="Nome"><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></FF>
          <FF label="Stato"><Sel value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{Object.keys(STATUS_COLORS).map(s => <option key={s}>{s}</option>)}</Sel></FF>
          <FF label="Descrizione"><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></FF>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><BtnS onClick={() => { setShowPinModal(false); setPendingPos(null) }}>Annulla</BtnS><BtnP onClick={savePin}>Salva</BtnP></div>
        </Modal>
      )}
      {showUploadModal && (
        <Modal title="Carica Mappa" onClose={() => setShowUploadModal(false)}>
          <p style={{ fontSize: 15, color: '#6b7280', marginTop: 0 }}>Il formato si adatterà automaticamente.</p>
          <input type="file" accept="image/*" onChange={uploadMap} style={{ fontSize: 16 }} />
          {uploading && <p style={{ color: '#6b7280', marginTop: 8 }}>Caricamento...</p>}
        </Modal>
      )}
    </div>
  )
}

// ─── Incantesimi ──────────────────────────────────────────────────────────────

function SpellsSection() {
  const [spells, setSpells] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('https://www.dnd5eapi.co/api/spells?limit=500').then(r => r.json()).then(d => { setSpells((d.results || []).map(s => ({ id: s.index, name: s.name, index: s.index }))); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const loadDetail = async (spell) => {
    if (spell.level !== undefined) { setSelected(spell); return }
    const res = await fetch(`https://www.dnd5eapi.co/api/spells/${spell.index}`)
    const d = await res.json()
    setSelected({ ...spell, level: d.level, school: d.school?.name || '', castingTime: d.casting_time, range: d.range, components: (d.components || []).join(', '), duration: d.duration, description: (d.desc || []).join(' ') })
  }

  const filtered = spells.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()))
  if (loading) return <p style={{ color: '#6b7280' }}>Caricamento incantesimi...</p>
  return (
    <div>
      <SH title="Compendio Incantesimi" />
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>{spells.length} incantesimi da D&D 5e SRD.</p>
      <div style={{ marginBottom: 16 }}><Input placeholder="Cerca..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%,180px),1fr))', gap: 8 }}>
        {filtered.slice(0, 60).map(s => <Card key={s.id} onClick={() => loadDetail(s)} style={{ padding: '0.75rem 1rem' }}><div style={{ fontWeight: 500, fontSize: 15, color: '#374151' }}>{s.name}</div></Card>)}
      </div>
      {filtered.length > 60 && <p style={{ fontSize: 14, color: '#9ca3af', marginTop: 12 }}>Mostrando 60 di {filtered.length}. Usa la ricerca.</p>}
      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          {selected.level !== undefined && <>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}><Badge color={SCHOOL_COLORS[selected.school] || '#888'}>{selected.school}</Badge><Badge color="#378ADD">{selected.level === 0 ? 'Trucchetto' : `Lv ${selected.level}`}</Badge></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              {[['Tempo', selected.castingTime], ['Gittata', feetToMeters(selected.range)], ['Componenti', selected.components], ['Durata', feetToMeters(selected.duration)]]].map(([k, v]) => <div key={k} style={{ background: '#f9fafb', borderRadius: 8, padding: '8px 10px' }}><div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>{k}</div><div style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>{v}</div></div>)}
            </div>
          </>}
          <p style={{ fontSize: 15, lineHeight: 1.7, margin: 0, color: '#374151' }}>{selected.description || 'Caricamento...'}</p>
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

  if (loading) return <p style={{ color: '#6b7280' }}>Caricamento...</p>
  return (
    <div>
      <SH title="Note Private DM" action={editing ? <BtnP onClick={save}>Salva</BtnP> : <BtnS onClick={() => setEditing(true)}>Modifica</BtnS>} />
      <Card style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
        {editing
          ? <textarea value={content} onChange={e => setContent(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', minHeight: 200, background: 'transparent', border: 'none', outline: 'none', fontSize: 16, lineHeight: 1.8, resize: 'vertical' }} />
          : <pre style={{ margin: 0, fontFamily: 'inherit', fontSize: 15, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{content || 'Nessuna nota.'}</pre>
        }
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
        if (data.success) { onParsed(data.data) } else { setError('Non riuscito. Compila manualmente.') }
      } catch { setError('Errore di connessione.') }
      setScanning(false)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '1rem', marginBottom: '1rem' }}>
      <p style={{ fontSize: 14, fontWeight: 600, color: '#166534', margin: '0 0 6px' }}>📷 Scansiona scheda con AI</p>
      <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 10px' }}>Fai una foto alla scheda — Claude la legge e compila i campi.</p>
      <button type="button" onClick={() => ref.current.click()} disabled={scanning}
        style={{ background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 18px', fontSize: 15, fontWeight: 600, cursor: scanning ? 'not-allowed' : 'pointer', minHeight: 44, opacity: scanning ? 0.7 : 1 }}>
        {scanning ? '⏳ Analisi...' : '📷 Carica foto'}
      </button>
      <input ref={ref} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handle} />
      {error && <p style={{ color: '#dc2626', fontSize: 14, marginTop: 8, marginBottom: 0 }}>{error}</p>}
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
      setInventory(inv.data || [])
      setCompanions(comp.data || [])
      setSessionNotes(n.data || [])
      setLoading(false)
    })
  }, [player.id])

  const saveChar = async () => {
    if (character) { const { data } = await supabase.from('characters').update(charForm).eq('id', character.id).select(); if (data) setCharacter(data[0]) }
    else { const { data } = await supabase.from('characters').insert([{ ...charForm, player_id: player.id }]).select(); if (data) setCharacter(data[0]) }
    setEditChar(false)
  }

  const handleCoin = async (key, val) => {
    setCharForm(f => ({ ...f, [key]: val }))
    if (character) { await supabase.from('characters').update({ [key]: val }).eq('id', character.id); setCharacter(c => ({ ...c, [key]: val })) }
  }

  const openAddItem = () => { setEditingItem(null); setItemForm(EI); setShowItemModal(true) }
  const openEditItem = (item) => { setEditingItem(item); setItemForm({ name: item.name, type: item.type, description: item.description || '', quantity: item.quantity }); setShowItemModal(true) }
  const saveItem = async () => {
    if (!itemForm.name) return
    if (editingItem) {
      const { data } = await supabase.from('inventory').update(itemForm).eq('id', editingItem.id).select()
      if (data) setInventory(inventory.map(i => i.id === editingItem.id ? data[0] : i))
    } else {
      const { data } = await supabase.from('inventory').insert([{ ...itemForm, player_id: player.id }]).select()
      if (data) setInventory([...inventory, data[0]])
    }
    setShowItemModal(false)
  }
  const removeItem = async (id) => { await supabase.from('inventory').delete().eq('id', id); setInventory(inventory.filter(i => i.id !== id)) }

  const openAddComp = () => { setEditingComp(null); setCompForm(ECP); setShowCompModal(true) }
  const openEditComp = (c) => { setEditingComp(c); setCompForm({ name: c.name, type: c.type || '', hp: c.hp || '', ac: c.ac || '', notes: c.notes || '', image_path: c.image_path || '' }); setShowCompModal(true) }
  const saveComp = async () => {
    if (!compForm.name) return
    if (editingComp) {
      const { data } = await supabase.from('companions').update(compForm).eq('id', editingComp.id).select()
      if (data) setCompanions(companions.map(c => c.id === editingComp.id ? data[0] : c))
    } else {
      const { data } = await supabase.from('companions').insert([{ ...compForm, player_id: player.id }]).select()
      if (data) setCompanions([...companions, data[0]])
    }
    setShowCompModal(false)
  }
  const removeComp = async (id) => { await supabase.from('companions').delete().eq('id', id); setCompanions(companions.filter(c => c.id !== id)) }

  const openAddNote = () => { setEditingNote(null); setNoteForm(EN); setShowNoteModal(true) }
  const openEditNote = (n) => { setEditingNote(n); setNoteForm({ session_title: n.session_title, date: n.date || '', content: n.content || '' }); setShowNoteModal(true) }
  const saveNote = async () => {
    if (!noteForm.session_title) return
    if (editingNote) {
      const { data } = await supabase.from('player_session_notes').update(noteForm).eq('id', editingNote.id).select()
      if (data) setSessionNotes(sessionNotes.map(n => n.id === editingNote.id ? data[0] : n))
    } else {
      const { data } = await supabase.from('player_session_notes').insert([{ ...noteForm, player_id: player.id }]).select()
      if (data) setSessionNotes([data[0], ...sessionNotes])
    }
    setShowNoteModal(false)
  }
  const removeNote = async (id) => { await supabase.from('player_session_notes').delete().eq('id', id); setSessionNotes(sessionNotes.filter(n => n.id !== id)) }

  if (loading) return <p style={{ color: '#6b7280' }}>Caricamento...</p>

  const hpPct = character ? Math.round((character.hp / character.max_hp) * 100) : 0
  const hpColor = hpPct > 60 ? '#1D9E75' : hpPct > 30 ? '#BA7517' : '#D85A30'
  const imgUrl = character ? getPublicUrl('character-images', character.image_path) : null
  const STATS = [['FOR', 'str'], ['DES', 'dex'], ['COS', 'con'], ['INT', 'int'], ['SAG', 'wis'], ['CAR', 'cha']]
  const mod = (v) => { const m = Math.floor(((v || 10) - 10) / 2); return (m >= 0 ? '+' : '') + m }
  const slotsT = character?.spell_slots_total ? character.spell_slots_total.split(',').map(s => parseInt(s.trim()) || 0) : []
  const slotsU = character?.spell_slots_used ? character.spell_slots_used.split(',').map(s => parseInt(s.trim()) || 0) : []

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        {imgUrl ? <img src={imgUrl} alt="" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${player.player_color || '#888'}`, flexShrink: 0 }} />
          : <div style={{ width: 56, height: 56, borderRadius: '50%', background: (player.player_color || '#888') + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 600, color: player.player_color || '#888', flexShrink: 0 }}>{player.username[0]}</div>}
        <div>
          <div style={{ fontWeight: 600, fontSize: 17 }}>{character?.name || player.username}</div>
          {character && <div style={{ fontSize: 14, color: '#6b7280' }}>{character.race} · {character.class} · Lv {character.level}</div>}
        </div>
      </div>

      <Tabs tabs={['scheda', 'inventario', 'famigli', 'note sessione']} active={activeTab} onChange={setActiveTab} />

      {/* SCHEDA */}
      {activeTab === 'scheda' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            {isOwner && (editChar
              ? <div style={{ display: 'flex', gap: 8 }}><BtnS onClick={() => setEditChar(false)}>Annulla</BtnS><BtnP onClick={saveChar}>Salva</BtnP></div>
              : <BtnS onClick={() => { setCharForm({ ...EC, ...(character || {}) }); setEditChar(true) }}>Modifica scheda</BtnS>
            )}
          </div>
          {editChar ? (
            <Card>
              {isOwner && <SheetScanner onParsed={p => setCharForm(f => ({ ...f, ...p }))} />}
              <ImgUpload bucket="character-images" folder="characters" currentPath={charForm.image_path} onUploaded={p => setCharForm({ ...charForm, image_path: p })} label="Foto personaggio" />
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
              <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Caratteristiche</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, marginBottom: 16 }}>
                {STATS.map(([l, k]) => <FF key={k} label={l}><Input type="number" value={charForm[k]} onChange={e => setCharForm({ ...charForm, [k]: e.target.value })} /></FF>)}
              </div>
              <FF label="Attacchi (Nome | Bonus | Danni, uno per riga)"><Textarea value={charForm.attacks} onChange={e => setCharForm({ ...charForm, attacks: e.target.value })} placeholder={"Spada lunga | +5 | 1d8+3"} /></FF>
              <FF label="Slot totali (es. 4,3,2)"><Input value={charForm.spell_slots_total} onChange={e => setCharForm({ ...charForm, spell_slots_total: e.target.value })} placeholder="4,3,2" /></FF>
              <FF label="Slot usati (es. 2,1,0)"><Input value={charForm.spell_slots_used} onChange={e => setCharForm({ ...charForm, spell_slots_used: e.target.value })} placeholder="2,1,0" /></FF>
            </Card>
          ) : character ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 12 }}>
                {[['CA', character.ac], ['Livello', character.level], ['Background', character.background]].map(([k, v]) => <div key={k} style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 8px', textAlign: 'center' }}><div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{k}</div><div style={{ fontSize: 16, fontWeight: 600 }}>{v}</div></div>)}
              </div>
              <Card style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ fontSize: 14, color: '#6b7280' }}>Punti Ferita</span><span style={{ fontSize: 15, fontWeight: 600 }}>{character.hp} / {character.max_hp}</span></div>
                <div style={{ height: 10, background: '#f3f4f6', borderRadius: 5, overflow: 'hidden' }}><div style={{ height: '100%', width: `${hpPct}%`, background: hpColor, borderRadius: 5, transition: 'width 0.3s' }} /></div>
              </Card>
              <Card style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 10px' }}>Caratteristiche</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 6 }}>
                  {STATS.map(([l, k]) => <div key={k} style={{ textAlign: 'center', background: '#f9fafb', borderRadius: 8, padding: '8px 2px' }}><div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>{l}</div><div style={{ fontSize: 16, fontWeight: 700 }}>{character[k] || 10}</div><div style={{ fontSize: 12, color: '#6b7280' }}>{mod(character[k])}</div></div>)}
                </div>
              </Card>
              {character.attacks && (
                <Card style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 8px' }}>Attacchi</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '6px 12px', fontSize: 14 }}>
                    {['NOME', 'BONUS', 'DANNI'].map(h => <span key={h} style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>{h}</span>)}
                    {character.attacks.split('\n').filter(Boolean).map((atk, i) => {
                      const [nome, bonus, danni] = atk.split('|').map(s => s.trim())
                      return [<span key={`n${i}`} style={{ fontWeight: 500 }}>{nome}</span>, <span key={`b${i}`} style={{ color: '#1D9E75', fontWeight: 600 }}>{bonus}</span>, <span key={`d${i}`} style={{ color: '#D85A30' }}>{danni}</span>]
                    })}
                  </div>
                </Card>
              )}
              {slotsT.length > 0 && (
                <Card style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 10px' }}>Slot Incantesimo</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {slotsT.map((total, i) => {
                      const rem = total - (slotsU[i] || 0)
                      return (
                        <div key={i} style={{ textAlign: 'center', background: '#f9fafb', borderRadius: 8, padding: '8px 12px', minWidth: 52 }}>
                          <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>Lv {i + 1}</div>
                          <div style={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                            {Array.from({ length: total }).map((_, j) => <div key={j} style={{ width: 10, height: 10, borderRadius: '50%', background: j < rem ? '#7F77DD' : '#e5e7eb', border: `1px solid ${j < rem ? '#7F77DD' : '#d1d5db'}` }} />)}
                          </div>
                          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{rem}/{total}</div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              )}
            </div>
          ) : <p style={{ color: '#6b7280', fontSize: 15 }}>Nessuna scheda. {isOwner && 'Clicca "Modifica scheda".'}</p>}
        </div>
      )}

      {/* INVENTARIO */}
      {activeTab === 'inventario' && (
        <div>
          <CoinsPanel values={character || charForm} onChange={handleCoin} editable={isOwner} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>{isOwner && <BtnP onClick={openAddItem}>+ Aggiungi oggetto</BtnP>}</div>
          {inventory.length === 0 && <p style={{ color: '#6b7280' }}>Inventario vuoto.</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {inventory.map(item => (
              <Card key={item.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1 }}><span style={{ fontWeight: 600, fontSize: 15 }}>{item.name}</span>{item.quantity > 1 && <span style={{ fontSize: 13, color: '#9ca3af', marginLeft: 6 }}>×{item.quantity}</span>}</div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                    <Badge color={ITEM_TYPE_COLORS[item.type] || '#888'}>{item.type}</Badge>
                    {isOwner && <><button onClick={() => openEditItem(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 4 }}>✏️</button><button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 4 }}>🗑️</button></>}
                  </div>
                </div>
                {item.description && <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6b7280' }}>{item.description}</p>}
              </Card>
            ))}
          </div>
          {showItemModal && (
            <Modal title={editingItem ? 'Modifica' : 'Nuovo Oggetto'} onClose={() => setShowItemModal(false)}>
              <FF label="Nome"><Input value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })} /></FF>
              <FF label="Tipo"><Sel value={itemForm.type} onChange={e => setItemForm({ ...itemForm, type: e.target.value })}>{Object.keys(ITEM_TYPE_COLORS).map(t => <option key={t}>{t}</option>)}</Sel></FF>
              <FF label="Quantità"><Input type="number" value={itemForm.quantity} onChange={e => setItemForm({ ...itemForm, quantity: e.target.value })} /></FF>
              <FF label="Descrizione"><Textarea value={itemForm.description} onChange={e => setItemForm({ ...itemForm, description: e.target.value })} /></FF>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><BtnS onClick={() => setShowItemModal(false)}>Annulla</BtnS><BtnP onClick={saveItem}>Salva</BtnP></div>
            </Modal>
          )}
        </div>
      )}

      {/* FAMIGLI */}
      {activeTab === 'famigli' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>{isOwner && <BtnP onClick={openAddComp}>+ Aggiungi</BtnP>}</div>
          {companions.length === 0 && <p style={{ color: '#6b7280' }}>Nessun famiglio ancora.</p>}
          {companions.map(c => {
            const cImg = getPublicUrl('character-images', c.image_path)
            return (
              <Card key={c.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {cImg ? <img src={cImg} alt={c.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      : <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🐾</div>}
                    <div><div style={{ fontWeight: 600 }}>{c.name}</div><div style={{ fontSize: 13, color: '#9ca3af' }}>{c.type}</div></div>
                  </div>
                  {isOwner && <div style={{ display: 'flex', gap: 4 }}><button onClick={() => openEditComp(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 4 }}>✏️</button><button onClick={() => removeComp(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 4 }}>🗑️</button></div>}
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 10 }}><span style={{ fontSize: 14 }}><span style={{ color: '#9ca3af' }}>PF </span>{c.hp}</span><span style={{ fontSize: 14 }}><span style={{ color: '#9ca3af' }}>CA </span>{c.ac}</span></div>
                {c.notes && <p style={{ margin: '8px 0 0', fontSize: 14, color: '#6b7280' }}>{c.notes}</p>}
              </Card>
            )
          })}
          {showCompModal && (
            <Modal title={editingComp ? 'Modifica Famiglio' : 'Nuovo Famiglio'} onClose={() => setShowCompModal(false)}>
              <ImgUpload bucket="character-images" folder="companions" currentPath={compForm.image_path} onUploaded={p => setCompForm({ ...compForm, image_path: p })} label="Foto" />
              <FF label="Nome"><Input value={compForm.name} onChange={e => setCompForm({ ...compForm, name: e.target.value })} /></FF>
              <FF label="Tipo"><Input value={compForm.type} onChange={e => setCompForm({ ...compForm, type: e.target.value })} placeholder="es. Famiglio (Gatto)" /></FF>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
                <FF label="PF"><Input type="number" value={compForm.hp} onChange={e => setCompForm({ ...compForm, hp: e.target.value })} /></FF>
                <FF label="CA"><Input type="number" value={compForm.ac} onChange={e => setCompForm({ ...compForm, ac: e.target.value })} /></FF>
              </div>
              <FF label="Note"><Textarea value={compForm.notes} onChange={e => setCompForm({ ...compForm, notes: e.target.value })} /></FF>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><BtnS onClick={() => setShowCompModal(false)}>Annulla</BtnS><BtnP onClick={saveComp}>Salva</BtnP></div>
            </Modal>
          )}
        </div>
      )}

      {/* NOTE SESSIONE */}
      {activeTab === 'note sessione' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontWeight: 600, fontSize: 16 }}>Note di sessione</span>
            {isOwner && <BtnP onClick={openAddNote}>+ Nuova nota</BtnP>}
          </div>
          <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 16 }}>Visibili solo a te e al DM.</p>
          {sessionNotes.length === 0 && <p style={{ color: '#6b7280' }}>Nessuna nota ancora.</p>}
          {sessionNotes.map(n => (
            <Card key={n.id} style={{ marginBottom: 10, cursor: 'pointer' }} onClick={() => setExpandedNote(expandedNote === n.id ? null : n.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{n.session_title}</span>
                  {n.date && <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 8 }}>{n.date}</span>}
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {isOwner && <><button onClick={e => { e.stopPropagation(); openEditNote(n) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 4 }}>✏️</button><button onClick={e => { e.stopPropagation(); removeNote(n.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 4 }}>🗑️</button></>}
                  <span style={{ color: '#9ca3af' }}>{expandedNote === n.id ? '▲' : '▼'}</span>
                </div>
              </div>
              {expandedNote === n.id && <pre style={{ margin: '12px 0 0', fontFamily: 'inherit', fontSize: 14, lineHeight: 1.7, color: '#6b7280', whiteSpace: 'pre-wrap', borderTop: '1px solid #f3f4f6', paddingTop: 12 }}>{n.content}</pre>}
            </Card>
          ))}
          {showNoteModal && (
            <Modal title={editingNote ? 'Modifica Nota' : 'Nuova Nota di Sessione'} onClose={() => setShowNoteModal(false)}>
              <FF label="Titolo / Sessione"><Input value={noteForm.session_title} onChange={e => setNoteForm({ ...noteForm, session_title: e.target.value })} placeholder="es. Sessione 3 — La cripta" /></FF>
              <FF label="Data"><Input type="date" value={noteForm.date} onChange={e => setNoteForm({ ...noteForm, date: e.target.value })} /></FF>
              <FF label="Note"><Textarea value={noteForm.content} onChange={e => setNoteForm({ ...noteForm, content: e.target.value })} style={{ minHeight: 160 }} /></FF>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><BtnS onClick={() => setShowNoteModal(false)}>Annulla</BtnS><BtnP onClick={saveNote}>Salva</BtnP></div>
            </Modal>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Party (loot + quest + note gruppo) ───────────────────────────────────────

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
      ;(l.data || []).forEach(item => {
        if (item.name === '__coins__') { try { Object.assign(coins, JSON.parse(item.notes || '{}')) } catch {} }
        else { items.push(item) }
      })
      setPartyCoins(coins); setLoot(items); setQuests(q.data || []); setGroupNotes(gn.data || [])
      setLoading(false)
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
    if (editingLoot) {
      const { data } = await supabase.from('party_loot').update(lootForm).eq('id', editingLoot.id).select()
      if (data) setLoot(loot.map(l => l.id === editingLoot.id ? data[0] : l))
    } else {
      const { data } = await supabase.from('party_loot').insert([lootForm]).select()
      if (data) setLoot([...loot, data[0]])
    }
    setShowLootModal(false)
  }
  const removeLoot = async (id) => { await supabase.from('party_loot').delete().eq('id', id); setLoot(loot.filter(l => l.id !== id)) }

  const openAddQuest = () => { setEditingQuest(null); setQuestForm({ title: '', description: '', status: 'attiva', reward: '' }); setShowQuestModal(true) }
  const openEditQuest = (q) => { setEditingQuest(q); setQuestForm({ title: q.title, description: q.description || '', status: q.status, reward: q.reward || '' }); setShowQuestModal(true) }
  const saveQuest = async () => {
    if (!questForm.title) return
    if (editingQuest) {
      const { data } = await supabase.from('quests').update(questForm).eq('id', editingQuest.id).select()
      if (data) setQuests(quests.map(q => q.id === editingQuest.id ? data[0] : q))
    } else {
      const { data } = await supabase.from('quests').insert([questForm]).select()
      if (data) setQuests([...quests, data[0]])
    }
    setShowQuestModal(false)
  }
  const removeQuest = async (id) => { await supabase.from('quests').delete().eq('id', id); setQuests(quests.filter(q => q.id !== id)) }

  const openAddGNote = () => { setEditingGNote(null); setGnoteForm({ session_title: '', date: '', content: '' }); setShowNoteModal(true) }
  const openEditGNote = (n) => { setEditingGNote(n); setGnoteForm({ session_title: n.session_title, date: n.date || '', content: n.content || '' }); setShowNoteModal(true) }
  const saveGNote = async () => {
    if (!gnoteForm.session_title) return
    if (editingGNote) {
      const { data } = await supabase.from('group_notes').update(gnoteForm).eq('id', editingGNote.id).select()
      if (data) setGroupNotes(groupNotes.map(n => n.id === editingGNote.id ? data[0] : n))
    } else {
      const { data } = await supabase.from('group_notes').insert([gnoteForm]).select()
      if (data) setGroupNotes([data[0], ...groupNotes])
    }
    setShowNoteModal(false)
  }
  const removeGNote = async (id) => { await supabase.from('group_notes').delete().eq('id', id); setGroupNotes(groupNotes.filter(n => n.id !== id)) }

  if (loading) return <p style={{ color: '#6b7280' }}>Caricamento...</p>
  return (
    <div>
      <Tabs tabs={['loot', 'quest', 'note gruppo']} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'loot' && (
        <div>
          <CoinsPanel values={partyCoins} onChange={(k, v) => savePartyCoins({ ...partyCoins, [k]: v })} editable={true} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}><span style={{ fontWeight: 600, fontSize: 18 }}>Oggetti del Gruppo</span><BtnP onClick={openAddLoot}>+ Aggiungi</BtnP></div>
          {loot.length === 0 && <p style={{ color: '#6b7280' }}>Nessun oggetto ancora.</p>}
          {loot.map(item => (
            <Card key={item.id} style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1 }}><span style={{ fontWeight: 600 }}>{item.name}</span>{item.notes && <span style={{ fontSize: 13, color: '#9ca3af', marginLeft: 8 }}>{item.notes}</span>}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <span style={{ fontWeight: 600, color: '#BA7517' }}>×{item.quantity}</span>
                <button onClick={() => openEditLoot(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 4 }}>✏️</button>
                <button onClick={() => removeLoot(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 4 }}>🗑️</button>
              </div>
            </Card>
          ))}
          {showLootModal && (
            <Modal title={editingLoot ? 'Modifica' : 'Aggiungi Oggetto'} onClose={() => setShowLootModal(false)}>
              <FF label="Nome"><Input value={lootForm.name} onChange={e => setLootForm({ ...lootForm, name: e.target.value })} /></FF>
              <FF label="Quantità"><Input type="number" value={lootForm.quantity} onChange={e => setLootForm({ ...lootForm, quantity: e.target.value })} /></FF>
              <FF label="Note"><Input value={lootForm.notes} onChange={e => setLootForm({ ...lootForm, notes: e.target.value })} /></FF>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><BtnS onClick={() => setShowLootModal(false)}>Annulla</BtnS><BtnP onClick={saveLoot}>Salva</BtnP></div>
            </Modal>
          )}
        </div>
      )}

      {activeTab === 'quest' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}><span style={{ fontWeight: 600, fontSize: 18 }}>Quest</span><BtnP onClick={openAddQuest}>+ Nuova</BtnP></div>
          {quests.length === 0 && <p style={{ color: '#6b7280' }}>Nessuna quest ancora.</p>}
          {quests.map(q => (
            <Card key={q.id} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ fontWeight: 600, flex: 1 }}>{q.title}</span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                  <Badge color={QUEST_STATUS_COLORS[q.status] || '#888'}>{q.status}</Badge>
                  <button onClick={() => openEditQuest(q)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 4 }}>✏️</button>
                  <button onClick={() => removeQuest(q.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 4 }}>🗑️</button>
                </div>
              </div>
              <p style={{ margin: '6px 0', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>{q.description}</p>
              {q.reward && <div style={{ fontSize: 13, color: '#BA7517' }}>Ricompensa: {q.reward}</div>}
            </Card>
          ))}
          {showQuestModal && (
            <Modal title={editingQuest ? 'Modifica Quest' : 'Nuova Quest'} onClose={() => setShowQuestModal(false)}>
              <FF label="Titolo"><Input value={questForm.title} onChange={e => setQuestForm({ ...questForm, title: e.target.value })} /></FF>
              <FF label="Stato"><Sel value={questForm.status} onChange={e => setQuestForm({ ...questForm, status: e.target.value })}>{Object.keys(QUEST_STATUS_COLORS).map(s => <option key={s}>{s}</option>)}</Sel></FF>
              <FF label="Descrizione"><Textarea value={questForm.description} onChange={e => setQuestForm({ ...questForm, description: e.target.value })} /></FF>
              <FF label="Ricompensa"><Input value={questForm.reward} onChange={e => setQuestForm({ ...questForm, reward: e.target.value })} /></FF>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><BtnS onClick={() => setShowQuestModal(false)}>Annulla</BtnS><BtnP onClick={saveQuest}>Salva</BtnP></div>
            </Modal>
          )}
        </div>
      )}

      {activeTab === 'note gruppo' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontWeight: 600, fontSize: 18 }}>Note di Gruppo</span>
            <BtnP onClick={openAddGNote}>+ Nuova nota</BtnP>
          </div>
          <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 16 }}>Visibili e modificabili da tutti.</p>
          {groupNotes.length === 0 && <p style={{ color: '#6b7280' }}>Nessuna nota ancora.</p>}
          {groupNotes.map(n => (
            <Card key={n.id} style={{ marginBottom: 10, cursor: 'pointer' }} onClick={() => setExpandedNote(expandedNote === n.id ? null : n.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{n.session_title}</span>
                  {n.date && <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 8 }}>{n.date}</span>}
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={e => { e.stopPropagation(); openEditGNote(n) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 4 }}>✏️</button>
                  <button onClick={e => { e.stopPropagation(); removeGNote(n.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 4 }}>🗑️</button>
                  <span style={{ color: '#9ca3af' }}>{expandedNote === n.id ? '▲' : '▼'}</span>
                </div>
              </div>
              {expandedNote === n.id && <pre style={{ margin: '12px 0 0', fontFamily: 'inherit', fontSize: 14, lineHeight: 1.7, color: '#6b7280', whiteSpace: 'pre-wrap', borderTop: '1px solid #f3f4f6', paddingTop: 12 }}>{n.content}</pre>}
            </Card>
          ))}
          {showNoteModal && (
            <Modal title={editingGNote ? 'Modifica Nota' : 'Nuova Nota di Gruppo'} onClose={() => setShowNoteModal(false)}>
              <FF label="Titolo / Sessione"><Input value={gnoteForm.session_title} onChange={e => setGnoteForm({ ...gnoteForm, session_title: e.target.value })} placeholder="es. Sessione 3 — La cripta" /></FF>
              <FF label="Data"><Input type="date" value={gnoteForm.date} onChange={e => setGnoteForm({ ...gnoteForm, date: e.target.value })} /></FF>
              <FF label="Note"><Textarea value={gnoteForm.content} onChange={e => setGnoteForm({ ...gnoteForm, content: e.target.value })} style={{ minHeight: 160 }} /></FF>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><BtnS onClick={() => setShowNoteModal(false)}>Annulla</BtnS><BtnP onClick={saveGNote}>Salva</BtnP></div>
            </Modal>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ profile, players, activeSection, setActiveSection, onLogout, isOpen, onClose, isDM }) {
  const DM_SECTIONS = [
    { id: 'sessioni', label: 'Sessioni', icon: '📖' },
    { id: 'npc', label: 'NPC', icon: '🧑‍🤝‍🧑' },
    { id: 'mappa', label: 'Mappa', icon: '🗺️' },
    { id: 'timeline', label: 'Timeline', icon: '📅' },
    { id: 'spells', label: 'Incantesimi', icon: '✨' },
    { id: 'party', label: 'Party', icon: '⚔️' },
    { id: 'dadi', label: 'Tira Dadi', icon: '🎲' },
  ]
  const DM_ONLY = [{ id: 'note_dm', label: 'Note DM', icon: '🔒' }]
  const playerSections = isDM ? players : players.filter(p => p.id === profile?.id)

  const handleNav = (id) => { setActiveSection(id); onClose() }

  const btnStyle = (id) => ({
    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
    padding: '10px 12px', borderRadius: 10, border: 'none',
    background: activeSection === id ? '#f3f4f6' : 'transparent',
    fontSize: 15, cursor: 'pointer', color: '#374151',
    fontWeight: activeSection === id ? 600 : 400, textAlign: 'left', minHeight: 44,
  })

  return (
    <>
      {isOpen && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200 }} />}
      <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 260, background: '#fff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', zIndex: 300, transform: isOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.25s ease', boxShadow: isOpen ? '4px 0 20px rgba(0,0,0,0.15)' : 'none', overflowY: 'auto' }}>
        <div style={{ padding: '1.25rem 1rem 0.75rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ fontSize: 22 }}>🐗</span> Campaign Hub</div>
            <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>{profile?.username} · {isDM ? 'DM' : 'Giocatore'}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#9ca3af', padding: 4 }}>×</button>
        </div>
        <div style={{ flex: 1, padding: '0.75rem 0.5rem' }}>
          <div style={{ fontSize: 11, color: '#9ca3af', padding: '0 0.75rem', marginBottom: 4, letterSpacing: '0.06em', fontWeight: 700 }}>CAMPAGNA</div>
          {DM_SECTIONS.map(s => <button key={s.id} onClick={() => handleNav(s.id)} style={btnStyle(s.id)}><span style={{ fontSize: 18 }}>{s.icon}</span>{s.label}</button>)}
          {isDM && <>
            <div style={{ fontSize: 11, color: '#9ca3af', padding: '12px 0.75rem 4px', letterSpacing: '0.06em', fontWeight: 700 }}>SOLO DM</div>
            {DM_ONLY.map(s => <button key={s.id} onClick={() => handleNav(s.id)} style={btnStyle(s.id)}><span style={{ fontSize: 18 }}>{s.icon}</span>{s.label}</button>)}
          </>}
          <div style={{ fontSize: 11, color: '#9ca3af', padding: '12px 0.75rem 4px', letterSpacing: '0.06em', fontWeight: 700 }}>GIOCATORI</div>
          {playerSections.map(p => <button key={p.id} onClick={() => handleNav('player_' + p.id)} style={btnStyle('player_' + p.id)}><span style={{ width: 10, height: 10, borderRadius: '50%', background: p.player_color || '#888', flexShrink: 0, display: 'inline-block' }} />{p.username}</button>)}
        </div>
        <div style={{ padding: '0.75rem', borderTop: '1px solid #e5e7eb' }}>
          <button onClick={() => { onClose(); onLogout() }} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: 'none', background: '#fee2e2', fontSize: 15, cursor: 'pointer', color: '#dc2626', textAlign: 'left', minHeight: 44, fontWeight: 500 }}>← Esci</button>
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

  useEffect(() => {
    supabase.from('profiles').select('*').eq('role', 'player').order('username').then(({ data }) => setPlayers(data || []))
  }, [])

  const LABELS = { sessioni: '📖 Sessioni', npc: '🧑‍🤝‍🧑 NPC', mappa: '🗺️ Mappa', timeline: '📅 Timeline', spells: '✨ Incantesimi', party: '⚔️ Party', dadi: '🎲 Tira Dadi', note_dm: '🔒 Note DM' }
  const currentLabel = activeSection.startsWith('player_') ? (players.find(p => p.id === activeSection.replace('player_', ''))?.username || 'Giocatore') : (LABELS[activeSection] || activeSection)

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
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 1rem', height: 56, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 40, minHeight: 40, justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ display: 'block', width: 22, height: 2, background: '#374151', borderRadius: 2 }} />
          <span style={{ display: 'block', width: 22, height: 2, background: '#374151', borderRadius: 2 }} />
          <span style={{ display: 'block', width: 22, height: 2, background: '#374151', borderRadius: 2 }} />
        </button>
        <span style={{ fontSize: 20 }}>🐗</span>
        <span style={{ fontWeight: 600, fontSize: 15, flex: 1 }}>{currentLabel}</span>
        <span style={{ fontSize: 13, color: '#9ca3af' }}>{profile?.username}</span>
      </div>
      <Sidebar profile={profile} players={players} activeSection={activeSection} setActiveSection={setActiveSection} onLogout={onLogout} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isDM={isDM} />
      <div style={{ padding: '1.25rem 1rem', maxWidth: 900, margin: '0 auto' }}>
        {renderSection()}
      </div>
    </div>
  )
}
