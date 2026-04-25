import { useTheme } from '../utils/theme'
import { formatPrix, formatKm, joursEnStock } from '../utils/formatters'
import { StatusBadge } from './StatusBadge'
import { StepTracker } from './StepTracker'

function DaysBadge({ days }) {
  if (days == null) return null
  const s = days < 30
    ? { bg: '#DCFCE7', text: '#16A34A' }
    : days < 60
    ? { bg: '#FEF3C7', text: '#D97706' }
    : { bg: '#FEE2E2', text: '#DC2626' }
  return (
    <span style={{
      padding: '2px 7px', borderRadius: 999, fontSize: 11, fontWeight: 600,
      background: s.bg, color: s.text,
    }}>
      {days}j
    </span>
  )
}

function MargeBadge({ marge }) {
  if (marge == null) return null
  const s = marge > 1500
    ? { bg: '#DCFCE7', text: '#16A34A' }
    : marge > 500
    ? { bg: '#FEF3C7', text: '#D97706' }
    : { bg: '#FEE2E2', text: '#DC2626' }
  return (
    <span style={{
      padding: '2px 7px', borderRadius: 999, fontSize: 11, fontWeight: 600,
      background: s.bg, color: s.text,
    }}>
      {marge >= 0 ? '+' : ''}{formatPrix(marge)}
    </span>
  )
}

export function VehicleCard({ vehicle, onClick }) {
  const t = useTheme()
  const photo = vehicle.photos?.[0]
  const days = joursEnStock(vehicle.datePurchase)

  return (
    <div
      onClick={onClick}
      style={{
        background: t.bgSurface, border: `0.5px solid ${t.border}`, borderRadius: 10,
        overflow: 'hidden', cursor: 'pointer',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.boxShadow = `0 2px 12px ${t.accent}18` }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.boxShadow = 'none' }}
    >
      {/* Photo */}
      <div style={{
        height: 140, background: t.bgSecondary, overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {photo
          ? <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: 32, opacity: 0.3 }}>🚗</span>
        }
      </div>

      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 7 }}>
        {/* Ligne 1: titre + badges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: t.text, lineHeight: 1.2 }}>
              {vehicle.make} {vehicle.model}
            </div>
            <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2, fontFamily: "'Space Mono', monospace" }}>
              {vehicle.immat}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
            <DaysBadge days={days} />
            <StatusBadge status={vehicle.status} />
          </div>
        </div>

        {/* Ligne 2: caractéristiques */}
        <div style={{ display: 'flex', gap: 6, fontSize: 12, color: t.textSecondary, flexWrap: 'wrap' }}>
          {vehicle.mileage != null && <span>{formatKm(vehicle.mileage)}</span>}
          {vehicle.fuel && <><span style={{ color: t.borderLight }}>·</span><span>{vehicle.fuel}</span></>}
          {vehicle.fiscalHP && <><span style={{ color: t.borderLight }}>·</span><span>{vehicle.fiscalHP} CV</span></>}
        </div>

        {/* Ligne 3: prix + marge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: t.text, fontFamily: "'Space Mono', monospace" }}>
            {formatPrix(vehicle.prixVente || vehicle.prixTTC)}
          </span>
          <MargeBadge marge={vehicle.margeNette} />
        </div>

        {/* Étapes */}
        <StepTracker steps={vehicle.steps} compact />
      </div>
    </div>
  )
}
