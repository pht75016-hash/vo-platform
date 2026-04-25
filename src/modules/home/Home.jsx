import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { useTheme } from '../../utils/theme'
import { useIsMobile } from '../../hooks/useIsMobile'
import { fmtP, daysInStock } from '../../utils/formatters'

// ── KPI Card ───────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub }) {
  const t = useTheme()
  return (
    <div style={{
      background: t.bgSurface,
      border: `0.5px solid ${t.border}`,
      borderRadius: 10,
      padding: '16px 18px',
      flex: 1,
      minWidth: 130,
    }}>
      <div style={{
        fontSize: 11, color: '#888', textTransform: 'uppercase',
        letterSpacing: '0.5px', marginBottom: 10, fontWeight: 500,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 26, fontWeight: 700, color: t.text,
        letterSpacing: '-0.5px', lineHeight: 1,
      }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: t.textMuted, marginTop: 5 }}>{sub}</div>
      )}
    </div>
  )
}

// ── Module Card (quick-access) ─────────────────────────────────────────────

const MODULE_CONFIG = {
  stock:     { label: 'Stock',      icon: '🚗', route: '/stock',    color: '#2563EB' },
  crm:       { label: 'CRM',        icon: '👥', route: '/crm',      color: '#8B5CF6' },
  notes:     { label: 'Notes',      icon: '📝', route: '/notes',    color: '#F59E0B' },
  atelier:   { label: 'Atelier',    icon: '🔧', route: '/atelier',  color: '#DC2626' },
  documents: { label: 'Documents',  icon: '📁', route: '/ged',      color: '#0EA5E9' },
  location:  { label: 'Location',   icon: '🔑', route: '/location', color: '#D97706' },
  ventes:    { label: 'Ventes',     icon: '💰', route: '/ventes',   color: '#16A34A' },
}

function ModuleCard({ moduleKey, subtitle, dragging, dragOver, onDragStart, onDragOver, onDrop, onDragEnd, onMoveUp, onMoveDown, canUp, canDown }) {
  const navigate = useNavigate()
  const t = useTheme()
  const m = MODULE_CONFIG[moduleKey]
  if (!m) return null

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => { e.preventDefault(); onDragOver() }}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      style={{
        background: t.bgSurface,
        border: `0.5px solid ${dragOver ? m.color : t.border}`,
        borderRadius: 10,
        padding: '14px 16px',
        opacity: dragging ? 0.4 : 1,
        transition: 'border-color 0.15s, opacity 0.15s, box-shadow 0.15s',
        cursor: 'pointer',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = m.color; e.currentTarget.style.boxShadow = `0 2px 10px ${m.color}18` }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = dragOver ? m.color : t.border; e.currentTarget.style.boxShadow = 'none' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <span style={{ fontSize: 26 }}>{m.icon}</span>
        <div style={{ display: 'flex', gap: 3 }}>
          {canUp && (
            <button onClick={(e) => { e.stopPropagation(); onMoveUp() }} style={arrowBtn(t)} title="Monter">↑</button>
          )}
          {canDown && (
            <button onClick={(e) => { e.stopPropagation(); onMoveDown() }} style={arrowBtn(t)} title="Descendre">↓</button>
          )}
        </div>
      </div>
      <div style={{ fontWeight: 600, fontSize: 13, color: t.text, marginBottom: 3 }}>{m.label}</div>
      {subtitle && <div style={{ fontSize: 12, color: t.textMuted }}>{subtitle}</div>}
      <button
        onClick={() => navigate(m.route)}
        style={{
          marginTop: 12, height: 28, padding: '0 12px', borderRadius: 6,
          border: `0.5px solid ${t.borderLight}`, background: 'transparent',
          color: t.textSecondary, fontSize: 12, cursor: 'pointer', fontWeight: 500,
        }}
      >
        Accéder →
      </button>
    </div>
  )
}

function arrowBtn(t) {
  return {
    width: 22, height: 22, border: `0.5px solid ${t.borderLight}`, borderRadius: 5,
    background: 'transparent', color: t.textMuted, fontSize: 11, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
  }
}

// ── Home ───────────────────────────────────────────────────────────────────

export function Home() {
  const t = useTheme()
  const isMobile = useIsMobile()
  const vehicles = useStore((s) => s.vehicles)
  const contacts = useStore((s) => s.contacts)
  const userProfile = useStore((s) => s.userProfile)
  const moduleOrder = useStore((s) => s.moduleOrder)
  const setModuleOrder = useStore((s) => s.setModuleOrder)

  const [dragging, setDragging] = useState(null)
  const [dragOver, setDragOver] = useState(null)

  // KPIs — statut is the canonical field name (storage.js normalises legacy .status → .statut)
  const enStock   = vehicles.filter((v) => (v.statut || v.status) === 'stock')
  const vendus30j = vehicles.filter((v) => (v.statut || v.status) === 'vendu')
  const valeurStock = enStock.reduce((sum, v) => sum + (Number(v.prixVenteTTC || v.prixVente || v.prixTTC) || 0), 0)
  const delaiMoyen = enStock.length
    ? Math.round(enStock.reduce((sum, v) => sum + (daysInStock(v.dateAchat || v.datePurchase) || 0), 0) / enStock.length)
    : null

  const prenom = userProfile.prenom || ''
  const dateStr = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  const move = (from, to) => {
    const order = [...moduleOrder]
    const [item] = order.splice(from, 1)
    order.splice(to, 0, item)
    setModuleOrder(order)
  }

  const moduleSubtitles = {
    stock:     enStock.length > 0 ? `${enStock.length} véhicule${enStock.length > 1 ? 's' : ''} en stock` : 'Aucun véhicule',
    crm:       contacts.length > 0 ? `${contacts.length} contact${contacts.length > 1 ? 's' : ''}` : 'Aucun contact',
    notes:     '',
    atelier:   '',
    documents: '',
    location:  '',
    ventes:    '',
  }

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", maxWidth: 1100 }}>
      {/* Greeting */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: t.text, letterSpacing: '-0.5px', marginBottom: 4 }}>
          {prenom ? `Bonjour, ${prenom} 👋` : 'Bonjour 👋'}
        </h1>
        <p style={{ fontSize: 13, color: t.textMuted, textTransform: 'capitalize' }}>{dateStr}</p>
      </div>

      {/* KPI Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: 12,
        marginBottom: 32,
      }}>
        <KpiCard label="En stock" value={enStock.length} sub="véhicules actifs" />
        <KpiCard label="Vendus" value={vendus30j.length} sub="total" />
        <KpiCard label="Valeur stock" value={valeurStock > 0 ? fmtP(valeurStock) : '—'} sub="prix de vente" />
        <KpiCard label="Délai moyen" value={delaiMoyen != null ? `${delaiMoyen}j` : '—'} sub="jours en stock" />
      </div>

      {/* Modules rapides */}
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Modules
        </h2>
        <span style={{ fontSize: 11, color: t.textMuted }}>— glissez pour réordonner</span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
        gap: 12,
      }}>
        {moduleOrder.map((key, idx) => (
          <ModuleCard
            key={key}
            moduleKey={key}
            subtitle={moduleSubtitles[key]}
            dragging={dragging === idx}
            dragOver={dragOver === idx}
            onDragStart={() => setDragging(idx)}
            onDragOver={() => setDragOver(idx)}
            onDrop={() => {
              if (dragging !== null && dragging !== idx) move(dragging, idx)
              setDragging(null); setDragOver(null)
            }}
            onDragEnd={() => { setDragging(null); setDragOver(null) }}
            onMoveUp={() => move(idx, idx - 1)}
            onMoveDown={() => move(idx, idx + 1)}
            canUp={idx > 0}
            canDown={idx < moduleOrder.length - 1}
          />
        ))}
      </div>
    </div>
  )
}
