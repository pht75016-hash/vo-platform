import { useState } from 'react'
import Anthropic from '@anthropic-ai/sdk'
import { useTheme } from '../../utils/theme'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useStore } from '../../store/useStore'

const SYSTEM_PROMPT =
  "Tu es un assistant pour négociant automobile. Analyse cette note et extrais une liste de tâches structurées. " +
  "Pour chaque tâche, détecte si un véhicule est mentionné et retourne son immatriculation si elle apparaît. " +
  "Réponds uniquement en JSON : {\"tasks\": [{\"id\", \"label\", \"done\", \"vehicle_immat\"}]}"

export function Notes() {
  const t        = useTheme()
  const isMobile = useIsMobile()
  const notes      = useStore(s => s.notes)
  const addNote    = useStore(s => s.addNote)
  const updateNote = useStore(s => s.updateNote)
  const removeNote = useStore(s => s.removeNote)

  const [text, setText]         = useState('')
  const [loadingAI, setLoadingAI] = useState(null)   // note id en cours de traitement
  const [aiError, setAiError]   = useState({})      // { [noteId]: message }

  // ── Ajout ──────────────────────────────────────────────────────────────────
  const add = () => {
    if (!text.trim()) return
    addNote({ id: crypto.randomUUID(), content: text.trim(), createdAt: new Date().toISOString(), tasks: [] })
    setText('')
  }

  // ── Appel IA ───────────────────────────────────────────────────────────────
  const setErr = (id, msg) => {
    setAiError(prev => ({ ...prev, [id]: msg }))
    setTimeout(() => setAiError(prev => { const n={...prev}; delete n[id]; return n }), 5000)
  }

  const organizeWithAI = async (note) => {
    const apiKey = import.meta.env.VITE_ANTHROPIC_KEY
    if (!apiKey) {
      setErr(note.id, 'Clé VITE_ANTHROPIC_KEY manquante — configure-la dans Vercel ou .env.local')
      return
    }
    setLoadingAI(note.id)
    try {
      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
      const response = await client.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: note.content }],
      })
      const raw  = response.content[0]?.text || '{}'
      const json = JSON.parse(raw.replace(/^```json\s*/i, '').replace(/```$/, '').trim())
      const tasks = (json.tasks || []).map(t => ({
        id:            t.id || crypto.randomUUID(),
        label:         t.label || '',
        done:          Boolean(t.done),
        vehicle_immat: t.vehicle_immat || null,
      }))
      updateNote(note.id, { tasks })
    } catch (err) {
      console.error('AI error:', err)
      const status = err?.status || err?.error?.status
      if (status === 401) setErr(note.id, 'Clé API invalide (401) — vérifie VITE_ANTHROPIC_KEY')
      else if (status === 429) setErr(note.id, 'Quota Anthropic dépassé (429)')
      else setErr(note.id, `Erreur API : ${err?.message || 'inconnue'}`)
    } finally {
      setLoadingAI(null)
    }
  }

  // ── Toggle tâche ───────────────────────────────────────────────────────────
  const toggleTask = (note, taskId) => {
    const tasks = (note.tasks || []).map(tk =>
      tk.id === taskId ? { ...tk, done: !tk.done } : tk
    )
    updateNote(note.id, { tasks })
  }

  // ── Styles partagés ────────────────────────────────────────────────────────
  const card = {
    padding: '12px 14px', background: t.bgSurface,
    border: `0.5px solid ${t.border}`, borderRadius: 8,
  }

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", maxWidth: 640 }}>

      {/* Zone de saisie */}
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

      {/* Liste des notes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {notes.map((n) => {
          const tasks   = n.tasks || []
          const done    = tasks.filter(t => t.done).length
          const isLoading = loadingAI === n.id
          const errorMsg  = aiError[n.id]

          return (
            <div key={n.id} style={card}>
              {/* Contenu + bouton supprimer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: tasks.length ? 10 : 0 }}>
                <span style={{ fontSize: 14, whiteSpace: 'pre-wrap', flex: 1, color: t.text, lineHeight: 1.5 }}>
                  {n.content}
                </span>
                <button onClick={() => removeNote(n.id)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: t.textMuted, fontSize: 18, padding: 0, flexShrink: 0, lineHeight: 1,
                }}>×</button>
              </div>

              {/* Checklist IA */}
              {tasks.length > 0 && (
                <div style={{
                  borderTop: `0.5px solid ${t.border}`,
                  paddingTop: 10, marginBottom: 10,
                }}>
                  <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    Tâches · {done}/{tasks.length}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {tasks.map(task => (
                      <label key={task.id} style={{
                        display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                      }}>
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={() => toggleTask(n, task.id)}
                          style={{ accentColor: '#2563EB', width: 14, height: 14, cursor: 'pointer', flexShrink: 0 }}
                        />
                        <span style={{
                          fontSize: 13, color: task.done ? t.textMuted : t.text,
                          textDecoration: task.done ? 'line-through' : 'none',
                          flex: 1,
                        }}>
                          {task.label}
                        </span>
                        {task.vehicle_immat && (
                          <span style={{
                            fontSize: 11, background: '#DBEAFE', color: '#1E40AF',
                            borderRadius: 4, padding: '1px 6px', fontWeight: 600,
                            letterSpacing: '0.3px', flexShrink: 0,
                          }}>
                            {task.vehicle_immat}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Barre d'action IA */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => organizeWithAI(n)}
                  disabled={isLoading}
                  style={{
                    height: 26, padding: '0 10px', borderRadius: 6,
                    border: `0.5px solid ${t.borderLight}`, background: 'transparent',
                    color: isLoading ? t.textMuted : '#8B5CF6',
                    fontSize: 12, cursor: isLoading ? 'default' : 'pointer',
                    fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5,
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => { if (!isLoading) e.currentTarget.style.borderColor = '#8B5CF6' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '' }}
                >
                  {isLoading
                    ? <><SpinnerIcon />Analyse en cours…</>
                    : <>✨ Organiser avec l'IA</>
                  }
                </button>
                {errorMsg && (
                  <span style={{ fontSize: 11, color: '#DC2626' }}>{errorMsg}</span>
                )}
                {tasks.length > 0 && !isLoading && (
                  <button
                    onClick={() => updateNote(n.id, { tasks: [] })}
                    style={{
                      height: 26, padding: '0 8px', borderRadius: 6,
                      border: `0.5px solid ${t.borderLight}`, background: 'transparent',
                      color: t.textMuted, fontSize: 11, cursor: 'pointer',
                    }}
                  >
                    Effacer
                  </button>
                )}
              </div>
            </div>
          )
        })}

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

function SpinnerIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
      style={{ animation: 'spin 0.8s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"
        strokeDasharray="14 6" strokeLinecap="round" />
    </svg>
  )
}
