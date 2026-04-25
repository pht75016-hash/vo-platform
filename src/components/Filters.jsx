import { useTheme } from '../utils/theme'
import { STATUTS_VEHICULE } from '../utils/constants'
import { useIsMobile } from '../hooks/useIsMobile'

export function Filters({ filters, onChange, vehicles }) {
  const t = useTheme()
  const isMobile = useIsMobile()

  const makes = [...new Set(vehicles.map((v) => v.make).filter(Boolean))].sort()
  const fuels = [...new Set(vehicles.map((v) => v.fuel).filter(Boolean))].sort()

  const input = {
    height: 32, boxSizing: 'border-box', padding: '0 10px',
    border: `0.5px solid ${t.borderLight}`, borderRadius: 7,
    background: t.bgSurface, color: t.text,
    fontSize: isMobile ? 16 : 13, width: '100%',
    outline: 'none',
  }
  const label = { fontSize: 11, color: t.textMuted, marginBottom: 5, display: 'block', fontWeight: 500 }

  const field = (lbl, key, element) => (
    <div key={key} style={{ marginBottom: 14 }}>
      <label style={label}>{lbl}</label>
      {element}
    </div>
  )

  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Filtres
        </span>
        {hasFilters && (
          <button onClick={() => onChange({})} style={{
            fontSize: 11, color: t.accent, background: 'none', border: 'none',
            cursor: 'pointer', fontWeight: 500, padding: 0,
          }}>
            Tout effacer
          </button>
        )}
      </div>

      {field('Statut', 'status',
        <select style={input} value={filters.status || ''} onChange={(e) => onChange({ ...filters, status: e.target.value })}>
          <option value="">Tous</option>
          {STATUTS_VEHICULE.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      )}
      {field('Marque', 'make',
        <select style={input} value={filters.make || ''} onChange={(e) => onChange({ ...filters, make: e.target.value })}>
          <option value="">Toutes</option>
          {makes.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      )}
      {field('Carburant', 'fuel',
        <select style={input} value={filters.fuel || ''} onChange={(e) => onChange({ ...filters, fuel: e.target.value })}>
          <option value="">Tous</option>
          {fuels.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      )}
      {field('Prix max', 'prixMax',
        <input type="number" style={input} placeholder="€" value={filters.prixMax || ''} onChange={(e) => onChange({ ...filters, prixMax: e.target.value })} />
      )}
      {field('Km max', 'kmMax',
        <input type="number" style={input} placeholder="km" value={filters.kmMax || ''} onChange={(e) => onChange({ ...filters, kmMax: e.target.value })} />
      )}
    </div>
  )
}
