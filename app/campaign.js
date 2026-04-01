'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const ATTITUDE_COLORS = { Alleato: '#1D9E75', Neutrale: '#888780', Nemico: '#D85A30', Sconosciuto: '#7F77DD' }
const EVENT_COLORS = { scoperta: '#7F77DD', incontro: '#1D9E75', combattimento: '#D85A30', mistero: '#378ADD', altro: '#888780' }
const STATUS_COLORS = { visitato: '#1D9E75', noto: '#378ADD', sconosciuto: '#888780', pericoloso: '#D85A30' }
const QUEST_STATUS_COLORS = { attiva: '#1D9E75', completata: '#888780', fallita: '#D85A30', in_sospeso: '#BA7517' }
const ITEM_TYPE_COLORS = { 'Arma magica': '#7F77DD', Consumabile: '#1D9E75', Armatura: '#378ADD', Vari: '#888780', Arma: '#D85A30' }
const SCHOOL_COLORS = { Evocazione: '#D85A30', Illusione: '#7F77DD', Necromanzia: '#5F5E5A', Trasformazione: '#1D9E75', Divinazione: '#378ADD', Ammaliamento: '#D4537E', Abiurazione: '#BA7517', Invocazione: '#0F6E56' }
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

// ─── Responsive hook ─────────────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

// ─── UI primitives ────────────────────────────────────────────────────────────

function Badge({ color, children }) {
  return <span style={{ background: color + '22', color, border: `1px solid ${color}44`, borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 500 }}>{children}</span>
}

function Card({ children, style, onClick }) {
  return <div onClick={onClick} style={{ background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: '1rem 1.25rem', cursor: onClick ? 'pointer' : 'default', ...style }}>{children}</div>
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 0 }}>
      <div style={{ background: '#fff', borderRadius: '16px 16px 0 0', padding: '1.5rem', width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', border: '0.5px solid #d1d5db' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontWeight: 600, fontSize: 18 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 26, cursor: 'pointer', color: '#6b7280', padding: '0 4px', lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function FormField({ label, children }) {
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

function BtnPrimary({ children, onClick, style, disabled }) {
  return <button onClick={onClick} disabled={disabled} style={{ background: disabled ? '#9ca3af' : '#1D9E75', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 18px', fontSize: 15, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', minHeight: 44, ...style }}>{children}</button>
}

function BtnSecondary({ children, onClick, style }) {
  return <button onClick={onClick} style={{ background: '#f9fafb', color: '#374151', border: '1px solid #d1d5db', borderRadius: 10, padding: '11px 18px', fontSize: 15, cursor: 'pointer', minHeight: 44, ...style }}>{children}</button>
}

function BtnDanger({ children, onClick, style }) {
  return <button onClick={onClick} style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', fontSize: 14, cursor: 'pointer', minHeight: 44, ...style }}>{children}</button>
}

function SectionHeader({ title, action }) {
  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', gap: 8, flexWrap: 'wrap' }}><h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>{title}</h2>{action}</div>
}

function SubTabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#f3f4f6', borderRadius: 10, padding: 4, overflowX: 'auto' }}>
      {tabs.map(t => <button key={t} onClick={() => onChange(t)} style={{ flex: '1 0 auto', padding: '8px 4px', borderRadius: 8, border: 'none', background: active === t ? '#fff' : 'transparent', fontWeight: active === t ? 600 : 400, fontSize: 13, cursor: 'pointer', color: '#374151', boxShadow: active === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', whiteSpace: 'nowrap' }}>{t}</button>)}
    </div>
  )
}

function ImageUpload({ bucket, folder, currentPath, onUploaded, label }) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef()
  const url = getPublicUrl(bucket, currentPath)
  const handle = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const path = await uploadImage(bucket, file, folder)
    setUploading(false)
    if (path) onUploaded(path)
  }
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{label || 'Immagine'}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {url && <img src={url} alt="" style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', border: '1px solid #e5e7eb' }} />}
        <button type="button" onClick={() => inputRef.current.click()} style={{ background: '#f9fafb', border: '1px solid #d1d5db', borderRadius: 10, padding: '10px 16px', fontSize: 14, cursor: 'pointer', color: '#374151', minHeight: 44 }}>
          {uploading ? 'Caricamento...' : url ? 'Cambia immagine' : 'Carica immagine'}
        </button>
        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handle} />
      </div>
    </div>
  )
}

function CoinsPanel({ values, onChange, editable }) {
  const COINS = [
    { key: 'gold', label: 'MO', color: '#B45309', bg: '#fffbeb', border: '#fde68a' },
    { key: 'silver', label: 'MA', color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
    { key: 'copper', label: 'MR', color: '#92400e', bg: '#fff7ed', border: '#fed7aa' },
    { key: 'platinum', label: 'MP', color: '#7F77DD', bg: '#f5f3ff', border: '#ddd6fe' },
  ]
  return (
    <Card style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 12px', color: '#374151' }}>Monete</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {COINS.map(({ key, label, color, bg, border }) => (
          <div key={key} style={{ textAlign: 'center', background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: '10px 4px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 6, letterSpacing: '0.05em' }}>{label}</div>
            {editable
              ? <input type="number" min="0" value={values[key] ?? 0}
                  onChange={e => onChange(key, parseInt(e.target.value) || 0)}
                  style={{ width: '100%', textAlign: 'center', padding: '5px 2px', border: `1px solid ${border}`, borderRadius: 7, fontSize: 16, fontWeight: 700, color, background: 'white', boxSizing: 'border-box' }} />
              : <div style={{ fontSize: 20, fontWeight: 700, color }}>{values[key] ?? 0}</div>
            }
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── Sezioni ──────────────────────────────────────────────────────────────────

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
  const openEdit = (e, s) => { e.stopPropagation(); setEditing(s); setForm({ number: s.number, title: s.title, date: s.date, summary: s.summary }); setShowModal(true) }

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

  const remove = async (e, id) => {
    e.stopPropagation()
    await supabase.from('sessions').delete().eq('id', id)
    setSessions(sessions.filter(s => s.id !== id))
  }

  if (loading) return <p style={{ color: '#6b7280' }}>Caricamento...</p>
  return (
    <div>
      <SectionHeader title="Riassunti Sessioni" action={isDM && <BtnPrimary onClick={openAdd}>+ Nuova sessione</BtnPrimary>} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sessions.length === 0 && <p style={{ color: '#6b7280' }}>Nessuna sessione ancora.</p>}
        {sessions.map(s => (
          <Card key={s.id} onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div><span style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 2 }}>Sessione {s.number} · {s.date}</span><span style={{ fontWeight: 600 }}>{s.title}</span></div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                {isDM && <><button onClick={e => openEdit(e, s)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '4px', color: '#9ca3af' }}>✏️</button><button onClick={e => remove(e, s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '4px', color: '#9ca3af' }}>🗑️</button></>}
                <span style={{ color: '#9ca3af', fontSize: 16 }}>{expanded === s.id ? '▲' : '▼'}</span>
              </div>
            </div>
            {expanded === s.id && <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.7, color: '#6b7280', borderTop: '1px solid #f3f4f6', paddingTop: 12 }}>{s.summary}</p>}
          </Card>
        ))}
      </div>
      {showModal && (
        <Modal title={editing ? 'Modifica Sessione' : 'Nuova Sessione'} onClose={() => setShowModal(false)}>
          <FormField label="Numero"><Input type="number" value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} /></FormField>
          <FormField label="Titolo"><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></FormField>
          <FormField label="Data"><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></FormField>
          <FormField label="Riassunto"><Textarea value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} /></FormField>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><BtnSecondary onClick={() => setShowModal(false)}>Annulla</BtnSecondary><BtnPrimary onClick={save}>Salva</BtnPrimary></div>
        </Modal>
      )}
    </div>
  )
}

function NPCSection({ isDM }) {
  const [npcs, setNpcs] = useState([])
  const [selected, setSelected] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', role: '', attitude: 'Neutrale', description: '', notes_dm: '', image_path: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('npcs').select('*').order('created_at').then(({ data }) => { setNpcs(data || []); setLoading(false) })
  }, [])

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

  const remove = async (id) => {
    await supabase.from('npcs').delete().eq('id', id)
    setNpcs(npcs.filter(n => n.id !== id)); setSelected(null)
  }

  if (loading) return <p style={{ color: '#6b7280' }}>Caricamento...</p>
  return (
    <div>
      <SectionHeader title="NPC Importanti" action={isDM && <BtnPrimary onClick={openAdd}>+ Aggiungi NPC</BtnPrimary>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))', gap: 12 }}>
        {npcs.length === 0 && <p style={{ color: '#6b7280' }}>Nessun NPC ancora.</p>}
        {npcs.map(npc => {
          const imgUrl = getPublicUrl('npc-images', npc.image_path)
          return (
            <Card key={npc.id} onClick={() => setSelected(npc)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                {imgUrl ? <img src={imgUrl} alt={npc.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e5e7eb', flexShrink: 0 }} />
                  : <div style={{ width: 44, height: 44, borderRadius: '50%', background: (ATTITUDE_COLORS[npc.attitude] || '#888') + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600, color: ATTITUDE_COLORS[npc.attitude] || '#888', flexShrink: 0 }}>{npc.name[0]}</div>}
                <div><div style={{ fontWeight: 600, fontSize: 15 }}>{npc.name}</div><div style={{ fontSize: 13, color: '#9ca3af' }}>{npc.role}</div></div>
              </div>
              <Badge color={ATTITUDE_COLORS[npc.attitude] || '#888'}>{npc.attitude}</Badge>
              <p style={{ fontSize: 14, color: '#6b7280', marginTop: 8, marginBottom: 0, lineHeight: 1.5 }}>{npc.description}</p>
            </Card>
          )
        })}
      </div>
      {selected && (() => {
        const imgUrl = getPublicUrl('npc-images', selected.image_path)
        return (
          <Modal title={selected.name} onClose={() => setSelected(null)}>
            {imgUrl && <img src={imgUrl} alt={selected.name} style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 10, marginBottom: 12 }} />}
            <div style={{ marginBottom: 8 }}><Badge color={ATTITUDE_COLORS[selected.attitude] || '#888'}>{selected.attitude}</Badge><span style={{ fontSize: 14, color: '#6b7280', marginLeft: 8 }}>{selected.role}</span></div>
            <p style={{ fontSize: 15, lineHeight: 1.7 }}>{selected.description}</p>
            {isDM && selected.notes_dm && <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '0.75rem 1rem', marginTop: 12 }}><span style={{ fontSize: 12, fontWeight: 600, color: '#92400e', display: 'block', marginBottom: 4 }}>Note DM</span><span style={{ fontSize: 14, color: '#6b7280' }}>{selected.notes_dm}</span></div>}
            {isDM && <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}><BtnSecondary onClick={() => openEdit(null, selected)}>✏️ Modifica</BtnSecondary><BtnDanger onClick={() => remove(selected.id)}>🗑️ Elimina</BtnDanger></div>}
          </Modal>
        )
      })()}
      {showModal && (
        <Modal title={editing ? 'Modifica NPC' : 'Nuovo NPC'} onClose={() => setShowModal(false)}>
          <ImageUpload bucket="npc-images" folder="npcs" currentPath={form.image_path} onUploaded={path => setForm({ ...form, image_path: path })} label="Foto NPC" />
          <FormField label="Nome"><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></FormField>
          <FormField label="Ruolo"><Input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} /></FormField>
          <FormField label="Attitudine"><Sel value={form.attitude} onChange={e => setForm({ ...form, attitude: e.target.value })}>{Object.keys(ATTITUDE_COLORS).map(a => <option key={a}>{a}</option>)}</Sel></FormField>
          <FormField label="Descrizione"><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></FormField>
          <FormField label="Note DM (private)"><Textarea value={form.notes_dm} onChange={e => setForm({ ...form, notes_dm: e.target.value })} /></FormField>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><BtnSecondary onClick={() => setShowModal(false)}>Annulla</BtnSecondary><BtnPrimary onClick={save}>Salva</BtnPrimary></div>
        </Modal>
      )}
    </div>
  )
}

function TimelineSection({ isDM }) {
  const [events, setEvents] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ date_ingame: '', title: '', description: '', type: 'altro' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('timeline_events').select('*').order('created_at').then(({ data }) => { setEvents(data || []); setLoading(false) })
  }, [])

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

  const remove = async (e, id) => {
    e.stopPropagation()
    await supabase.from('timeline_events').delete().eq('id', id)
    setEvents(events.filter(ev => ev.id !== id))
  }

  if (loading) return <p style={{ color: '#6b7280' }}>Caricamento...</p>
  return (
    <div>
      <SectionHeader title="Timeline Campagna" action={isDM && <BtnPrimary onClick={openAdd}>+ Evento</BtnPrimary>} />
      <div style={{ position: 'relative', paddingLeft: 24 }}>
        <div style={{ position: 'absolute', left: 8, top: 0, bottom: 0, width: 2, background: '#e5e7eb', borderRadius: 2 }} />
        {events.length === 0 && <p style={{ color: '#6b7280' }}>Nessun evento ancora.</p>}
        {events.map(ev => (
          <div key={ev.id} style={{ position: 'relative', marginBottom: 20 }}>
            <div style={{ position: 'absolute', left: -20, top: 8, width: 12, height: 12, borderRadius: '50%', background: EVENT_COLORS[ev.type] || '#888', border: '2px solid #fff' }} />
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><span style={{ fontSize: 12, color: '#9ca3af' }}>{ev.date_ingame}</span><div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2, flexWrap: 'wrap' }}><span style={{ fontWeight: 600 }}>{ev.title}</span><Badge color={EVENT_COLORS[ev.type] || '#888'}>{ev.type}</Badge></div></div>
                {isDM && <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}><button onClick={e => openEdit(e, ev)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '4px', color: '#9ca3af' }}>✏️</button><button onClick={e => remove(e, ev.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '4px', color: '#9ca3af' }}>🗑️</button></div>}
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>{ev.description}</p>
            </Card>
          </div>
        ))}
      </div>
      {showModal && (
        <Modal title={editing ? 'Modifica Evento' : 'Nuovo Evento'} onClose={() => setShowModal(false)}>
          <FormField label="Data in-game"><Input value={form.date_ingame} onChange={e => setForm({ ...form, date_ingame: e.target.value })} placeholder="Anno 412, Mese del Vento" /></FormField>
          <FormField label="Titolo"><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></FormField>
          <FormField label="Tipo"><Sel value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>{Object.keys(EVENT_COLORS).map(t => <option key={t}>{t}</option>)}</Sel></FormField>
          <FormField label="Descrizione"><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></FormField>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><BtnSecondary onClick={() => setShowModal(false)}>Annulla</BtnSecondary><BtnPrimary onClick={save}>Salva</BtnPrimary></div>
        </Modal>
      )}
    </div>
  )
}

function MapSection({ isDM }) {
  const [pins, setPins] = useState([])
  const [mapImageUrl, setMapImageUrl] = useState(null)
  const [selected, setSelected] = useState(null)
  const [showModal, setShowModal] = useState(false)
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
        setMapImageUrl(getPublicUrl('map-images', f.name) + '?t=' + Date.now())
      }
    })
  }, [])

  const uploadMap = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `map.${ext}`
    await supabase.storage.from('map-images').upload(path, file, { upsert: true })
    setMapImageUrl(getPublicUrl('map-images', path) + '?t=' + Date.now())
    setUploading(false); setShowUploadModal(false)
  }

  const handleMapClick = (e) => {
    if (!isDM) return
    const rect = e.currentTarget.getBoundingClientRect()
    setPendingPos({ x_percent: Math.round(((e.clientX - rect.left) / rect.width) * 100), y_percent: Math.round(((e.clientY - rect.top) / rect.height) * 100) })
    setEditingPin(null); setForm({ name: '', description: '', status: 'sconosciuto' }); setShowModal(true)
  }

  const openEditPin = (e, pin) => { e.stopPropagation(); setEditingPin(pin); setForm({ name: pin.name, description: pin.description || '', status: pin.status }); setPendingPos(null); setShowModal(true) }

  const savePin = async () => {
    if (!form.name) return
    if (editingPin) {
      const { data } = await supabase.from('map_pins').update(form).eq('id', editingPin.id).select()
      if (data) setPins(pins.map(p => p.id === editingPin.id ? data[0] : p))
    } else if (pendingPos) {
      const { data } = await supabase.from('map_pins').insert([{ ...form, ...pendingPos }]).select()
      if (data) setPins([...pins, data[0]])
    }
    setShowModal(false); setPendingPos(null); setEditingPin(null)
  }

  const removePin = async (e, id) => {
    e && e.stopPropagation()
    await supabase.from('map_pins').delete().eq('id', id)
    setPins(pins.filter(p => p.id !== id)); setSelected(null)
  }

  if (loading) return <p style={{ color: '#6b7280' }}>Caricamento...</p>
  return (
    <div>
      <SectionHeader title="Mappa del Mondo" action={isDM && <BtnSecondary onClick={() => setShowUploadModal(true)}>🗺️ Carica mappa</BtnSecondary>} />
      {isDM && <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>Clicca sulla mappa per aggiungere un luogo.</p>}
      <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb', cursor: isDM ? 'crosshair' : 'default', background: '#1a3a2a' }}>
        {mapImageUrl ? (
          <div style={{ position: 'relative', width: '100%' }} onClick={handleMapClick}>
            <img src={mapImageUrl} alt="Mappa" style={{ width: '100%', height: 'auto', display: 'block', userSelect: 'none', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', inset: 0 }}>
              {pins.map(pin => (
                <div key={pin.id} onClick={e => { e.stopPropagation(); setSelected(pin) }}
                  style={{ position: 'absolute', left: `${pin.x_percent}%`, top: `${pin.y_percent}%`, transform: 'translate(-50%, -100%)', cursor: 'pointer', zIndex: 10 }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: STATUS_COLORS[pin.status] || '#888', border: '2px solid white', margin: '0 auto', boxShadow: '0 1px 4px rgba(0,0,0,0.5)' }} />
                  <div style={{ background: 'rgba(0,0,0,0.78)', color: '#fff', fontSize: 10, borderRadius: 4, padding: '2px 6px', whiteSpace: 'nowrap', textAlign: 'center', marginTop: 2 }}>{pin.name}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div onClick={handleMapClick} style={{ width: '100%', paddingBottom: '50%', position: 'relative' }}>
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 100 50" preserveAspectRatio="none">
              <path d="M0,30 Q20,20 40,25 Q60,30 80,20 Q90,15 100,18 L100,50 L0,50 Z" fill="#0d4a2a" opacity="0.5" />
              <path d="M10,10 Q30,5 50,15 Q70,25 90,10 L100,0 L0,0 Z" fill="#0d2a4a" opacity="0.4" />
            </svg>
            {pins.map(pin => (
              <div key={pin.id} onClick={e => { e.stopPropagation(); setSelected(pin) }}
                style={{ position: 'absolute', left: `${pin.x_percent}%`, top: `${pin.y_percent}%`, transform: 'translate(-50%, -100%)', cursor: 'pointer', zIndex: 10 }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: STATUS_COLORS[pin.status] || '#888', border: '2px solid white', margin: '0 auto' }} />
                <div style={{ background: 'rgba(0,0,0,0.78)', color: '#fff', fontSize: 10, borderRadius: 4, padding: '2px 6px', whiteSpace: 'nowrap', textAlign: 'center', marginTop: 2 }}>{pin.name}</div>
              </div>
            ))}
            {isDM && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, textAlign: 'center', padding: '0 1rem' }}>Nessuna mappa — clicca "Carica mappa"</span></div>}
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
          {isDM && <div style={{ display: 'flex', gap: 8, marginTop: 12 }}><BtnSecondary onClick={e => openEditPin(e, selected)}>✏️ Modifica</BtnSecondary><BtnDanger onClick={e => removePin(e, selected.id)}>🗑️ Elimina</BtnDanger></div>}
        </Modal>
      )}
      {showModal && (
        <Modal title={editingPin ? 'Modifica Luogo' : 'Nuovo Luogo'} onClose={() => { setShowModal(false); setPendingPos(null) }}>
          <FormField label="Nome"><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></FormField>
          <FormField label="Stato"><Sel value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{Object.keys(STATUS_COLORS).map(s => <option key={s}>{s}</option>)}</Sel></FormField>
          <FormField label="Descrizione"><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></FormField>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><BtnSecondary onClick={() => { setShowModal(false); setPendingPos(null) }}>Annulla</BtnSecondary><BtnPrimary onClick={savePin}>Salva</BtnPrimary></div>
        </Modal>
      )}
      {showUploadModal && (
        <Modal title="Carica Mappa" onClose={() => setShowUploadModal(false)}>
          <p style={{ fontSize: 15, color: '#6b7280', marginTop: 0 }}>Il formato si adatterà automaticamente all'immagine.</p>
          <input type="file" accept="image/*" onChange={uploadMap} style={{ fontSize: 16 }} />
          {uploading && <p style={{ color: '#6b7280', marginTop: 8 }}>Caricamento in corso...</p>}
        </Modal>
      )}
    </div>
  )
}

function SpellsSection() {
  const [spells, setSpells] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('https://www.dnd5eapi.co/api/spells?limit=500').then(r => r.json()).then(data => { setSpells((data.results || []).map(s => ({ id: s.index, name: s.name, index: s.index }))); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const loadDetail = async (spell) => {
    if (spell.level !== undefined) { setSelected(spell); return }
    const res = await fetch(`https://www.dnd5eapi.co/api/spells/${spell.index}`)
    const data = await res.json()
    setSelected({ ...spell, level: data.level, school: data.school?.name || '', castingTime: data.casting_time, range: data.range, components: (data.components || []).join(', '), duration: data.duration, description: (data.desc || []).join(' ') })
  }

  const filtered = spells.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()))
  if (loading) return <p style={{ color: '#6b7280' }}>Caricamento incantesimi...</p>
  return (
    <div>
      <SectionHeader title="Compendio Incantesimi" />
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>{spells.length} incantesimi da D&D 5e SRD.</p>
      <div style={{ marginBottom: 16 }}><Input placeholder="Cerca incantesimo..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 180px), 1fr))', gap: 8 }}>
        {filtered.slice(0, 60).map(spell => <Card key={spell.id} onClick={() => loadDetail(spell)} style={{ padding: '0.75rem 1rem' }}><div style={{ fontWeight: 500, fontSize: 15 }}>{spell.name}</div></Card>)}
      </div>
      {filtered.length > 60 && <p style={{ fontSize: 14, color: '#9ca3af', marginTop: 12 }}>Mostrando 60 di {filtered.length}. Usa la ricerca.</p>}
      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          {selected.level !== undefined && <><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}><Badge color={SCHOOL_COLORS[selected.school] || '#888'}>{selected.school}</Badge><Badge color="#378ADD">{selected.level === 0 ? 'Trucchetto' : `Livello ${selected.level}`}</Badge></div><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>{[['Tempo di lancio', selected.castingTime], ['Gittata', selected.range], ['Componenti', selected.components], ['Durata', selected.duration]].map(([k, v]) => <div key={k} style={{ background: '#f9fafb', borderRadius: 8, padding: '8px 10px' }}><div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>{k}</div><div style={{ fontSize: 14, fontWeight: 500 }}>{v}</div></div>)}</div></>}
          <p style={{ fontSize: 15, lineHeight: 1.7, margin: 0 }}>{selected.description || 'Caricamento...'}</p>
        </Modal>
      )}
    </div>
  )
}

function DMNotesSection() {
  const [content, setContent] = useState('')
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [noteId, setNoteId] = useState(null)

  useEffect(() => {
    supabase.from('dm_notes').select('*').limit(1).maybeSingle().then(({ data }) => { if (data) { setContent(data.content || ''); setNoteId(data.id) } setLoading(false) })
  }, [])

  const save = async () => {
    if (noteId) { await supabase.from('dm_notes').update({ content, updated_at: new Date().toISOString() }).eq('id', noteId) }
    else { const { data } = await supabase.from('dm_notes').insert([{ content }]).select(); if (data) setNoteId(data[0].id) }
    setEditing(false)
  }

  if (loading) return <p style={{ color: '#6b7280' }}>Caricamento...</p>
  return (
    <div>
      <SectionHeader title="Note Private DM" action={editing ? <BtnPrimary onClick={save}>Salva</BtnPrimary> : <BtnSecondary onClick={() => setEditing(true)}>Modifica</BtnSecondary>} />
      <Card style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
        {editing
          ? <textarea value={content} onChange={e => setContent(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', minHeight: 200, background: 'transparent', border: 'none', outline: 'none', fontSize: 16, lineHeight: 1.8, resize: 'vertical' }} />
          : <pre style={{ margin: 0, fontFamily: 'inherit', fontSize: 15, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{content || 'Nessuna nota.'}</pre>
        }
      </Card>
    </div>
  )
}

function SheetScanner({ onParsed }) {
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef()

  const handle = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setScanning(true); setError('')
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const base64 = ev.target.result.split(',')[1]
      const mediaType = file.type
      try {
        const res = await fetch('/api/parse-sheet', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageBase64: base64, mediaType }) })
        const data = await res.json()
        if (data.success) { onParsed(data.data) } else { setError('Non sono riuscito a leggere la scheda. Compila manualmente.') }
      } catch { setError('Errore di connessione. Riprova.') }
      setScanning(false)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '1rem', marginBottom: '1rem' }}>
      <p style={{ fontSize: 14, fontWeight: 600, color: '#166534', margin: '0 0 6px' }}>📷 Scansiona scheda con AI</p>
      <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 10px' }}>Fai una foto alla scheda cartacea — Claude la legge e compila i campi automaticamente.</p>
      <button type="button" onClick={() => inputRef.current.click()} disabled={scanning}
        style={{ background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 18px', fontSize: 15, fontWeight: 600, cursor: scanning ? 'not-allowed' : 'pointer', minHeight: 44, opacity: scanning ? 0.7 : 1 }}>
        {scanning ? '⏳ Analisi...' : '📷 Carica foto scheda'}
      </button>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handle} />
      {error && <p style={{ color: '#dc2626', fontSize: 14, marginTop: 8, marginBottom: 0 }}>{error}</p>}
    </div>
  )
}

function PlayerTab({ player, currentUserId, isDM }) {
  const isOwner = isDM || currentUserId === player.id
  const [activeTab, setActiveTab] = useState('scheda')
  const [character, setCharacter] = useState(null)
  const [inventory, setInventory] = useState([])
  const [companions, setCompanions] = useState([])
  const [notes, setNotes] = useState('')
  const [notesId, setNotesId] = useState(null)
  const [editNotes, setEditNotes] = useState(false)
  const [editChar, setEditChar] = useState(false)
  const [showItemModal, setShowItemModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [showCompModal, setShowCompModal] = useState(false)
  const [editingComp, setEditingComp] = useState(null)

  const emptyChar = { name: '', class: '', race: '', level: 1, hp: 10, max_hp: 10, ac: 10, background: '', image_path: '', str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10, attacks: '', spell_slots_total: '', spell_slots_used: '', gold: 0, silver: 0, copper: 0, platinum: 0 }
  const [charForm, setCharForm] = useState(emptyChar)
  const emptyItem = { name: '', type: 'Vari', description: '', quantity: 1 }
  const [itemForm, setItemForm] = useState(emptyItem)
  const emptyComp = { name: '', type: '', hp: '', ac: '', notes: '', image_path: '' }
  const [compForm, setCompForm] = useState(emptyComp)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('characters').select('*').eq('player_id', player.id).maybeSingle(),
      supabase.from('inventory').select('*').eq('player_id', player.id),
      supabase.from('companions').select('*').eq('player_id', player.id),
      supabase.from('player_notes').select('*').eq('player_id', player.id).maybeSingle(),
    ]).then(([c, inv, comp, n]) => {
      if (c.data) { setCharacter(c.data); setCharForm({ ...emptyChar, ...c.data }) }
      setInventory(inv.data || [])
      setCompanions(comp.data || [])
      if (n.data) { setNotes(n.data.content || ''); setNotesId(n.data.id) }
      setLoading(false)
    })
  }, [player.id])

  const saveChar = async () => {
    if (character) { const { data } = await supabase.from('characters').update(charForm).eq('id', character.id).select(); if (data) setCharacter(data[0]) }
    else { const { data } = await supabase.from('characters').insert([{ ...charForm, player_id: player.id }]).select(); if (data) setCharacter(data[0]) }
    setEditChar(false)
  }

  const handleCoinChange = async (key, val) => {
    setCharForm(f => ({ ...f, [key]: val }))
    if (character) { await supabase.from('characters').update({ [key]: val }).eq('id', character.id); setCharacter(c => ({ ...c, [key]: val })) }
  }

  const openAddItem = () => { setEditingItem(null); setItemForm(emptyItem); setShowItemModal(true) }
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

  const openAddComp = () => { setEditingComp(null); setCompForm(emptyComp); setShowCompModal(true) }
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

  const saveNotes = async () => {
    if (notesId) { await supabase.from('player_notes').update({ content: notes, updated_at: new Date().toISOString() }).eq('id', notesId) }
    else { const { data } = await supabase.from('player_notes').insert([{ content: notes, player_id: player.id }]).select(); if (data) setNotesId(data[0].id) }
    setEditNotes(false)
  }

  if (loading) return <p style={{ color: '#6b7280' }}>Caricamento...</p>

  const hpPct = character ? Math.round((character.hp / character.max_hp) * 100) : 0
  const hpColor = hpPct > 60 ? '#1D9E75' : hpPct > 30 ? '#BA7517' : '#D85A30'
  const imgUrl = character ? getPublicUrl('character-images', character.image_path) : null
  const STATS = [['FOR', 'str'], ['DES', 'dex'], ['COS', 'con'], ['INT', 'int'], ['SAG', 'wis'], ['CAR', 'cha']]
  const modifier = (v) => { const m = Math.floor(((v || 10) - 10) / 2); return (m >= 0 ? '+' : '') + m }
  const spellSlotsTotal = character?.spell_slots_total ? character.spell_slots_total.split(',').map(s => parseInt(s.trim()) || 0) : []
  const spellSlotsUsed = character?.spell_slots_used ? character.spell_slots_used.split(',').map(s => parseInt(s.trim()) || 0) : []

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        {imgUrl ? <img src={imgUrl} alt={player.username} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${player.player_color || '#888'}`, flexShrink: 0 }} />
          : <div style={{ width: 56, height: 56, borderRadius: '50%', background: (player.player_color || '#888') + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 600, color: player.player_color || '#888', flexShrink: 0 }}>{player.username[0]}</div>}
        <div>
          <div style={{ fontWeight: 600, fontSize: 17 }}>{character ? character.name : player.username}</div>
          {character && <div style={{ fontSize: 14, color: '#6b7280' }}>{character.race} · {character.class} · Livello {character.level}</div>}
        </div>
      </div>

      <SubTabs tabs={['scheda', 'inventario', 'famigli', 'note']} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'scheda' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            {isOwner && (editChar
              ? <div style={{ display: 'flex', gap: 8 }}><BtnSecondary onClick={() => setEditChar(false)}>Annulla</BtnSecondary><BtnPrimary onClick={saveChar}>Salva</BtnPrimary></div>
              : <BtnSecondary onClick={() => { setCharForm({ ...emptyChar, ...(character || {}) }); setEditChar(true) }}>Modifica scheda</BtnSecondary>
            )}
          </div>

          {editChar ? (
            <Card>
              {isOwner && <SheetScanner onParsed={parsed => setCharForm(f => ({ ...f, ...parsed }))} />}
              <ImageUpload bucket="character-images" folder="characters" currentPath={charForm.image_path} onUploaded={path => setCharForm({ ...charForm, image_path: path })} label="Foto personaggio" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))', gap: '0 12px' }}>
                <FormField label="Nome"><Input value={charForm.name} onChange={e => setCharForm({ ...charForm, name: e.target.value })} /></FormField>
                <FormField label="Classe"><Input value={charForm.class} onChange={e => setCharForm({ ...charForm, class: e.target.value })} /></FormField>
                <FormField label="Razza"><Input value={charForm.race} onChange={e => setCharForm({ ...charForm, race: e.target.value })} /></FormField>
                <FormField label="Background"><Input value={charForm.background} onChange={e => setCharForm({ ...charForm, background: e.target.value })} /></FormField>
                <FormField label="Livello"><Input type="number" value={charForm.level} onChange={e => setCharForm({ ...charForm, level: e.target.value })} /></FormField>
                <FormField label="CA"><Input type="number" value={charForm.ac} onChange={e => setCharForm({ ...charForm, ac: e.target.value })} /></FormField>
                <FormField label="PF attuali"><Input type="number" value={charForm.hp} onChange={e => setCharForm({ ...charForm, hp: e.target.value })} /></FormField>
                <FormField label="PF massimi"><Input type="number" value={charForm.max_hp} onChange={e => setCharForm({ ...charForm, max_hp: e.target.value })} /></FormField>
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Caratteristiche</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, marginBottom: 16 }}>
                {STATS.map(([label, key]) => <FormField key={key} label={label}><Input type="number" value={charForm[key]} onChange={e => setCharForm({ ...charForm, [key]: e.target.value })} /></FormField>)}
              </div>
              <FormField label="Attacchi (Nome | Bonus | Danni, uno per riga)"><Textarea value={charForm.attacks} onChange={e => setCharForm({ ...charForm, attacks: e.target.value })} placeholder={"Spada lunga | +5 | 1d8+3\nDardo Incantato | auto | 3×1d4+1"} /></FormField>
              <FormField label="Slot incantesimo totali (es. 4,3,2)"><Input value={charForm.spell_slots_total} onChange={e => setCharForm({ ...charForm, spell_slots_total: e.target.value })} placeholder="4,3,2" /></FormField>
              <FormField label="Slot usati (es. 2,1,0)"><Input value={charForm.spell_slots_used} onChange={e => setCharForm({ ...charForm, spell_slots_used: e.target.value })} placeholder="2,1,0" /></FormField>
            </Card>
          ) : character ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
                {[['CA', character.ac], ['Livello', character.level], ['Background', character.background]].map(([k, v]) => <div key={k} style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 8px', textAlign: 'center' }}><div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{k}</div><div style={{ fontSize: 16, fontWeight: 600 }}>{v}</div></div>)}
              </div>
              <Card style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ fontSize: 14, color: '#6b7280' }}>Punti Ferita</span><span style={{ fontSize: 15, fontWeight: 600 }}>{character.hp} / {character.max_hp}</span></div>
                <div style={{ height: 10, background: '#f3f4f6', borderRadius: 5, overflow: 'hidden' }}><div style={{ height: '100%', width: `${hpPct}%`, background: hpColor, borderRadius: 5, transition: 'width 0.3s' }} /></div>
              </Card>
              <Card style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 10px' }}>Caratteristiche</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
                  {STATS.map(([label, key]) => (
                    <div key={key} style={{ textAlign: 'center', background: '#f9fafb', borderRadius: 8, padding: '8px 2px' }}>
                      <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{character[key] || 10}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{modifier(character[key])}</div>
                    </div>
                  ))}
                </div>
              </Card>
              {character.attacks && (
                <Card style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 8px' }}>Attacchi</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '6px 12px', fontSize: 14 }}>
                    <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>NOME</span>
                    <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>BONUS</span>
                    <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>DANNI</span>
                    {character.attacks.split('\n').filter(Boolean).map((atk, i) => {
                      const [nome, bonus, danni] = atk.split('|').map(s => s.trim())
                      return [<span key={`n${i}`} style={{ fontWeight: 500 }}>{nome}</span>, <span key={`b${i}`} style={{ color: '#1D9E75', fontWeight: 600 }}>{bonus}</span>, <span key={`d${i}`} style={{ color: '#D85A30' }}>{danni}</span>]
                    })}
                  </div>
                </Card>
              )}
              {spellSlotsTotal.length > 0 && (
                <Card style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 10px' }}>Slot Incantesimo</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {spellSlotsTotal.map((total, i) => {
                      const used = spellSlotsUsed[i] || 0
                      const remaining = total - used
                      return (
                        <div key={i} style={{ textAlign: 'center', background: '#f9fafb', borderRadius: 8, padding: '8px 12px', minWidth: 52 }}>
                          <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>Lv {i + 1}</div>
                          <div style={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                            {Array.from({ length: total }).map((_, j) => <div key={j} style={{ width: 10, height: 10, borderRadius: '50%', background: j < remaining ? '#7F77DD' : '#e5e7eb', border: '1px solid ' + (j < remaining ? '#7F77DD' : '#d1d5db') }} />)}
                          </div>
                          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{remaining}/{total}</div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              )}
            </div>
          ) : <p style={{ color: '#6b7280', fontSize: 15 }}>Nessuna scheda ancora. {isOwner && 'Clicca "Modifica scheda" per crearne una.'}</p>}
        </div>
      )}

      {activeTab === 'inventario' && (
        <div>
          <CoinsPanel values={character || charForm} onChange={handleCoinChange} editable={isOwner && !!character} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>{isOwner && <BtnPrimary onClick={openAddItem}>+ Aggiungi oggetto</BtnPrimary>}</div>
          {inventory.length === 0 && <p style={{ color: '#6b7280' }}>Inventario vuoto.</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {inventory.map(item => (
              <Card key={item.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1 }}><span style={{ fontWeight: 600, fontSize: 15 }}>{item.name}</span>{item.quantity > 1 && <span style={{ fontSize: 13, color: '#9ca3af', marginLeft: 6 }}>×{item.quantity}</span>}</div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                    <Badge color={ITEM_TYPE_COLORS[item.type] || '#888'}>{item.type}</Badge>
                    {isOwner && <><button onClick={() => openEditItem(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '4px', color: '#9ca3af' }}>✏️</button><button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '4px', color: '#9ca3af' }}>🗑️</button></>}
                  </div>
                </div>
                {item.description && <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6b7280' }}>{item.description}</p>}
              </Card>
            ))}
          </div>
          {showItemModal && (
            <Modal title={editingItem ? 'Modifica Oggetto' : 'Nuovo Oggetto'} onClose={() => setShowItemModal(false)}>
              <FormField label="Nome"><Input value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })} /></FormField>
              <FormField label="Tipo"><Sel value={itemForm.type} onChange={e => setItemForm({ ...itemForm, type: e.target.value })}>{Object.keys(ITEM_TYPE_COLORS).map(t => <option key={t}>{t}</option>)}</Sel></FormField>
              <FormField label="Quantità"><Input type="number" value={itemForm.quantity} onChange={e => setItemForm({ ...itemForm, quantity: e.target.value })} /></FormField>
              <FormField label="Descrizione"><Textarea value={itemForm.description} onChange={e => setItemForm({ ...itemForm, description: e.target.value })} /></FormField>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><BtnSecondary onClick={() => setShowItemModal(false)}>Annulla</BtnSecondary><BtnPrimary onClick={saveItem}>Salva</BtnPrimary></div>
            </Modal>
          )}
        </div>
      )}

      {activeTab === 'famigli' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>{isOwner && <BtnPrimary onClick={openAddComp}>+ Aggiungi famiglio</BtnPrimary>}</div>
          {companions.length === 0 && <p style={{ color: '#6b7280' }}>Nessun famiglio ancora.</p>}
          {companions.map(c => {
            const compImgUrl = getPublicUrl('character-images', c.image_path)
            return (
              <Card key={c.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {compImgUrl ? <img src={compImgUrl} alt={c.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e5e7eb', flexShrink: 0 }} />
                      : <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🐾</div>}
                    <div><div style={{ fontWeight: 600, fontSize: 15 }}>{c.name}</div><div style={{ fontSize: 13, color: '#9ca3af' }}>{c.type}</div></div>
                  </div>
                  {isOwner && <div style={{ display: 'flex', gap: 4 }}><button onClick={() => openEditComp(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '4px', color: '#9ca3af' }}>✏️</button><button onClick={() => removeComp(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '4px', color: '#9ca3af' }}>🗑️</button></div>}
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 10 }}><span style={{ fontSize: 14 }}><span style={{ color: '#9ca3af' }}>PF </span>{c.hp}</span><span style={{ fontSize: 14 }}><span style={{ color: '#9ca3af' }}>CA </span>{c.ac}</span></div>
                {c.notes && <p style={{ margin: '8px 0 0', fontSize: 14, color: '#6b7280' }}>{c.notes}</p>}
              </Card>
            )
          })}
          {showCompModal && (
            <Modal title={editingComp ? 'Modifica Famiglio' : 'Nuovo Famiglio'} onClose={() => setShowCompModal(false)}>
              <ImageUpload bucket="character-images" folder="companions" currentPath={compForm.image_path} onUploaded={path => setCompForm({ ...compForm, image_path: path })} label="Foto famiglio" />
              <FormField label="Nome"><Input value={compForm.name} onChange={e => setCompForm({ ...compForm, name: e.target.value })} /></FormField>
              <FormField label="Tipo"><Input value={compForm.type} onChange={e => setCompForm({ ...compForm, type: e.target.value })} placeholder="es. Famiglio (Gatto)" /></FormField>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
                <FormField label="PF"><Input type="number" value={compForm.hp} onChange={e => setCompForm({ ...compForm, hp: e.target.value })} /></FormField>
                <FormField label="CA"><Input type="number" value={compForm.ac} onChange={e => setCompForm({ ...compForm, ac: e.target.value })} /></FormField>
              </div>
              <FormField label="Note"><Textarea value={compForm.notes} onChange={e => setCompForm({ ...compForm, notes: e.target.value })} /></FormField>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><BtnSecondary onClick={() => setShowCompModal(false)}>Annulla</BtnSecondary><BtnPrimary onClick={saveComp}>Salva</BtnPrimary></div>
            </Modal>
          )}
        </div>
      )}

      {activeTab === 'note' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            {isOwner && (editNotes ? <BtnPrimary onClick={saveNotes}>Salva</BtnPrimary> : <BtnSecondary onClick={() => setEditNotes(true)}>Modifica</BtnSecondary>)}
          </div>
          <Card>
            <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 8 }}>Note personali · visibili solo a te e al DM</div>
            {editNotes
              ? <textarea value={notes} onChange={e => setNotes(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', minHeight: 180, background: 'transparent', border: 'none', outline: 'none', fontSize: 16, lineHeight: 1.8, resize: 'vertical' }} />
              : <pre style={{ margin: 0, fontFamily: 'inherit', fontSize: 15, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{notes || 'Nessuna nota.'}</pre>
            }
          </Card>
        </div>
      )}
    </div>
  )
}

function SharedSection({ isDM }) {
  const [loot, setLoot] = useState([])
  const [quests, setQuests] = useState([])
  const [partyCoins, setPartyCoins] = useState({ gold: 0, silver: 0, copper: 0, platinum: 0 })
  const [nextSession, setNextSession] = useState(null)
  const [nextSessionId, setNextSessionId] = useState(null)
  const [editSession, setEditSession] = useState(false)
  const [sessionForm, setSessionForm] = useState({ date: '', notes: '' })
  const [showLootModal, setShowLootModal] = useState(false)
  const [editingLoot, setEditingLoot] = useState(null)
  const [showQuestModal, setShowQuestModal] = useState(false)
  const [editingQuest, setEditingQuest] = useState(null)
  const [lootForm, setLootForm] = useState({ name: '', quantity: 1, notes: '' })
  const [questForm, setQuestForm] = useState({ title: '', description: '', status: 'attiva', reward: '' })
  const [activeTab, setActiveTab] = useState('loot')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('party_loot').select('*').order('created_at'),
      supabase.from('quests').select('*').order('created_at'),
      supabase.from('next_session').select('*').limit(1).maybeSingle(),
    ]).then(([l, q, ns]) => {
      const coins = { gold: 0, silver: 0, copper: 0, platinum: 0 }
      const items = []
      ;(l.data || []).forEach(item => {
        if (item.name === '__coins__') { try { Object.assign(coins, JSON.parse(item.notes || '{}')) } catch {} }
        else { items.push(item) }
      })
      setPartyCoins(coins); setLoot(items); setQuests(q.data || [])
      if (ns.data) { setNextSession(ns.data); setNextSessionId(ns.data.id); setSessionForm({ date: ns.data.date || '', notes: ns.data.notes || '' }) }
      setLoading(false)
    })
  }, [])

  const savePartyCoins = async (newCoins) => {
    setPartyCoins(newCoins)
    const existing = await supabase.from('party_loot').select('id').eq('name', '__coins__').maybeSingle()
    if (existing.data) { await supabase.from('party_loot').update({ notes: JSON.stringify(newCoins) }).eq('id', existing.data.id) }
    else { await supabase.from('party_loot').insert([{ name: '__coins__', quantity: 1, notes: JSON.stringify(newCoins) }]) }
  }

  const handlePartyCoin = (key, val) => savePartyCoins({ ...partyCoins, [key]: val })

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

  const saveSession = async () => {
    if (nextSessionId) { await supabase.from('next_session').update({ ...sessionForm, updated_at: new Date().toISOString() }).eq('id', nextSessionId) }
    else { const { data } = await supabase.from('next_session').insert([sessionForm]).select(); if (data) setNextSessionId(data[0].id) }
    setNextSession(sessionForm); setEditSession(false)
  }

  if (loading) return <p style={{ color: '#6b7280' }}>Caricamento...</p>
  return (
    <div>
      <SubTabs tabs={['loot', 'quest', 'prossima sessione']} active={activeTab} onChange={setActiveTab} />
      {activeTab === 'loot' && (
        <div>
          <CoinsPanel values={partyCoins} onChange={handlePartyCoin} editable={isDM} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}><span style={{ fontWeight: 600, fontSize: 18 }}>Oggetti del Gruppo</span>{isDM && <BtnPrimary onClick={openAddLoot}>+ Aggiungi</BtnPrimary>}</div>
          {loot.length === 0 && <p style={{ color: '#6b7280' }}>Nessun oggetto ancora.</p>}
          {loot.map(item => (
            <Card key={item.id} style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1 }}><span style={{ fontWeight: 600, fontSize: 15 }}>{item.name}</span>{item.notes && <span style={{ fontSize: 13, color: '#9ca3af', marginLeft: 8 }}>{item.notes}</span>}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <span style={{ fontWeight: 600, color: '#BA7517', fontSize: 15 }}>×{item.quantity}</span>
                {isDM && <><button onClick={() => openEditLoot(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '4px', color: '#9ca3af' }}>✏️</button><button onClick={() => removeLoot(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '4px', color: '#9ca3af' }}>🗑️</button></>}
              </div>
            </Card>
          ))}
          {showLootModal && (
            <Modal title={editingLoot ? 'Modifica' : 'Aggiungi Oggetto'} onClose={() => setShowLootModal(false)}>
              <FormField label="Nome"><Input value={lootForm.name} onChange={e => setLootForm({ ...lootForm, name: e.target.value })} /></FormField>
              <FormField label="Quantità"><Input type="number" value={lootForm.quantity} onChange={e => setLootForm({ ...lootForm, quantity: e.target.value })} /></FormField>
              <FormField label="Note"><Input value={lootForm.notes} onChange={e => setLootForm({ ...lootForm, notes: e.target.value })} /></FormField>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><BtnSecondary onClick={() => setShowLootModal(false)}>Annulla</BtnSecondary><BtnPrimary onClick={saveLoot}>Salva</BtnPrimary></div>
            </Modal>
          )}
        </div>
      )}
      {activeTab === 'quest' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}><span style={{ fontWeight: 600, fontSize: 18 }}>Quest</span>{isDM && <BtnPrimary onClick={openAddQuest}>+ Nuova Quest</BtnPrimary>}</div>
          {quests.length === 0 && <p style={{ color: '#6b7280' }}>Nessuna quest ancora.</p>}
          {quests.map(q => (
            <Card key={q.id} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, gap: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 15, flex: 1 }}>{q.title}</span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                  <Badge color={QUEST_STATUS_COLORS[q.status] || '#888'}>{q.status}</Badge>
                  {isDM && <><button onClick={() => openEditQuest(q)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '4px', color: '#9ca3af' }}>✏️</button><button onClick={() => removeQuest(q.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '4px', color: '#9ca3af' }}>🗑️</button></>}
                </div>
              </div>
              <p style={{ margin: '0 0 6px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>{q.description}</p>
              {q.reward && <div style={{ fontSize: 13, color: '#BA7517' }}>Ricompensa: {q.reward}</div>}
            </Card>
          ))}
          {showQuestModal && (
            <Modal title={editingQuest ? 'Modifica Quest' : 'Nuova Quest'} onClose={() => setShowQuestModal(false)}>
              <FormField label="Titolo"><Input value={questForm.title} onChange={e => setQuestForm({ ...questForm, title: e.target.value })} /></FormField>
              <FormField label="Stato"><Sel value={questForm.status} onChange={e => setQuestForm({ ...questForm, status: e.target.value })}>{Object.keys(QUEST_STATUS_COLORS).map(s => <option key={s}>{s}</option>)}</Sel></FormField>
              <FormField label="Descrizione"><Textarea value={questForm.description} onChange={e => setQuestForm({ ...questForm, description: e.target.value })} /></FormField>
              <FormField label="Ricompensa"><Input value={questForm.reward} onChange={e => setQuestForm({ ...questForm, reward: e.target.value })} /></FormField>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><BtnSecondary onClick={() => setShowQuestModal(false)}>Annulla</BtnSecondary><BtnPrimary onClick={saveQuest}>Salva</BtnPrimary></div>
            </Modal>
          )}
        </div>
      )}
      {activeTab === 'prossima sessione' && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}><span style={{ fontWeight: 600, fontSize: 18 }}>Prossima Sessione</span>{isDM && (editSession ? <BtnPrimary onClick={saveSession}>Salva</BtnPrimary> : <BtnSecondary onClick={() => setEditSession(true)}>Modifica</BtnSecondary>)}</div>
          {editSession
            ? <div><FormField label="Data"><Input type="date" value={sessionForm.date} onChange={e => setSessionForm({ ...sessionForm, date: e.target.value })} /></FormField><FormField label="Note"><Textarea value={sessionForm.notes} onChange={e => setSessionForm({ ...sessionForm, notes: e.target.value })} /></FormField></div>
            : <div><div style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>{nextSession?.date || '—'}</div><p style={{ margin: 0, fontSize: 15, color: '#6b7280', lineHeight: 1.7 }}>{nextSession?.notes || 'Nessuna nota.'}</p></div>
          }
        </Card>
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
  ]
  const DM_ONLY = [{ id: 'note_dm', label: 'Note DM', icon: '🔒' }]
  const playerSections = isDM ? players : players.filter(p => p.id === profile?.id)

  const handleNav = (id) => { setActiveSection(id); onClose() }

  const btnStyle = (id) => ({
    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
    padding: '10px 12px', borderRadius: 10, border: 'none',
    background: activeSection === id ? '#f3f4f6' : 'transparent',
    fontSize: 15, cursor: 'pointer', color: '#374151',
    fontWeight: activeSection === id ? 600 : 400, textAlign: 'left',
    minHeight: 44,
  })

  return (
    <>
      {isOpen && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200 }} />}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 260,
        background: '#fff', borderRight: '1px solid #e5e7eb',
        display: 'flex', flexDirection: 'column', zIndex: 300,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s ease', boxShadow: isOpen ? '4px 0 20px rgba(0,0,0,0.15)' : 'none',
        overflowY: 'auto',
      }}>
        <div style={{ padding: '1.25rem 1rem 0.75rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ fontSize: 22 }}>🐗</span> Campaign Hub</div>
            <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>{profile?.username} · {isDM ? 'DM' : 'Giocatore'}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#9ca3af', padding: '4px', lineHeight: 1 }}>×</button>
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
          <button onClick={onLogout} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: 'none', background: 'transparent', fontSize: 15, cursor: 'pointer', color: '#9ca3af', textAlign: 'left', minHeight: 44 }}>← Esci</button>
        </div>
      </div>
    </>
  )
}

// ─── App principale ────────────────────────────────────────────────────────────

export default function Campaign({ profile, onLogout }) {
  const [players, setPlayers] = useState([])
  const [activeSection, setActiveSection] = useState('sessioni')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isDM = profile?.role === 'dm'

  useEffect(() => {
    supabase.from('profiles').select('*').eq('role', 'player').order('username').then(({ data }) => setPlayers(data || []))
  }, [])

  const SECTION_LABELS = {
    sessioni: '📖 Sessioni', npc: '🧑‍🤝‍🧑 NPC', mappa: '🗺️ Mappa',
    timeline: '📅 Timeline', spells: '✨ Incantesimi', party: '⚔️ Party',
    note_dm: '🔒 Note DM',
  }

  const currentLabel = activeSection.startsWith('player_')
    ? players.find(p => p.id === activeSection.replace('player_', ''))?.username || 'Giocatore'
    : SECTION_LABELS[activeSection] || activeSection

  const renderSection = () => {
    if (activeSection === 'sessioni') return <SessionsSection isDM={isDM} />
    if (activeSection === 'npc') return <NPCSection isDM={isDM} />
    if (activeSection === 'mappa') return <MapSection isDM={isDM} />
    if (activeSection === 'timeline') return <TimelineSection isDM={isDM} />
    if (activeSection === 'spells') return <SpellsSection />
    if (activeSection === 'party') return <SharedSection isDM={isDM} />
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
      {/* Top bar sempre visibile */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 1rem', height: 56, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 40, minHeight: 40, justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ display: 'block', width: 22, height: 2, background: '#374151', borderRadius: 2 }} />
          <span style={{ display: 'block', width: 22, height: 2, background: '#374151', borderRadius: 2 }} />
          <span style={{ display: 'block', width: 22, height: 2, background: '#374151', borderRadius: 2 }} />
        </button>
        <span style={{ fontSize: 20 }}>🐗</span>
        <span style={{ fontWeight: 600, fontSize: 15, color: '#374151', flex: 1 }}>{currentLabel}</span>
        <span style={{ fontSize: 13, color: '#9ca3af' }}>{profile?.username}</span>
      </div>

      <Sidebar
        profile={profile}
        players={players}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isDM={isDM}
      />

      <div style={{ padding: '1.25rem 1rem', maxWidth: 900, margin: '0 auto' }}>
        {renderSection()}
      </div>
    </div>
  )
}
