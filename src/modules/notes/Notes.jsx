import { useState } from 'react'
import { useTheme } from '../../utils/theme'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useStore } from '../../store/useStore'

export function Notes() {
  const t = useTheme()
  const isMobile = useIsMobile()
  const notes     = useStore(s => s.notes)
  const addNote   = useStore(s => s.addNote)
  const removeNote = useStore(s => s.removeNote)

  const [text, setText] = useState('')

  const add = () => {
    if (!text.trim()) return
    addNote({ id: crypto.randomUUID(), content: text.trim(), createdAt: new Date().toISOString() })
    setText('')
  }

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", maxWidth: 640 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'flex-start' }}>
        <textarea
          rows={2}
          style={{
            flex: 1, boxSizing: 'border-box', padding: '8px 10px',
            border: `0.5px solid ${t.borderLight}`, borderRadius: 7,
            background: t.bgSurface, color: t.text,
            fontSize: isMobile ? 16 : 13, resize: 'vertical',
            fontFamily: "'DM Sans', system-ui, sans-serif", outline: 'none',
          }}
          placeholder="Nouvelle note… (⌘↵ pour valider)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey) add() }}
        />
        <button onClick={add} style={{
          height: 32, padding: '0 16px', borderRadius: 7,
          background: t.accent, color: '#fff', fontSize: 13, fontWeight: 500,
          border: 'none', cursor: 'pointer', flexShrink: 0,
        }}>
          Ajouter
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {notes.map((n) => (
          <div key={n.id} style={{
            padding: '12px 14px', background: t.bgSurface,
            border: `0.5px solid ${t.border}`, borderRadius: 8,
            display: 'flex', justifyContent: 'space-between', gap: 10,
          }}>
            <span style={{ fontSize: 14, whiteSpace: 'pre-wrap', flex: 1, color: t.text, lineHeight: 1.5 }}>{n.content}</span>
            <button onClick={() => removeNote(n.id)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: t.textMuted, fontSize: 18, padding: 0, flexShrink: 0, lineHeight: 1,
            }}>×</button>
          </div>
        ))}
        {notes.length === 0 && (
          <div style={{
            textAlign: 'center', color: t.textMuted, fontSize: 14, padding: 40,
            background: t.bgSurface, border: `0.5px solid ${t.border}`, borderRadius: 10,
          }}>
            Aucune note.
          </div>
        )}
      </div>
    </div>
  )
}
