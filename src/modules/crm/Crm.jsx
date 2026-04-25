import { useTheme } from '../../utils/theme'
import { useStore } from '../../store/useStore'

export function Crm() {
  const t = useTheme()
  const contacts = useStore((s) => s.contacts)

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button style={{
          height: 32, padding: '0 14px', borderRadius: 7,
          background: t.accent, color: '#fff', fontSize: 13, fontWeight: 500,
          border: 'none', cursor: 'pointer',
        }}>
          + Contact
        </button>
      </div>

      {contacts.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 48, color: t.textMuted, fontSize: 14,
          background: t.bgSurface, border: `0.5px solid ${t.border}`, borderRadius: 10,
        }}>
          Aucun contact. Commencez par en ajouter un.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {contacts.map((c) => (
            <div key={c.id} style={{
              padding: '12px 16px', background: t.bgSurface,
              border: `0.5px solid ${t.border}`, borderRadius: 8,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              cursor: 'pointer', transition: 'border-color 0.12s',
            }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = t.accent}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = t.border}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: t.text }}>{c.prenom} {c.nom}</div>
                <div style={{ fontSize: 12, color: t.textMuted }}>{c.email}{c.telephone ? ` · ${c.telephone}` : ''}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
