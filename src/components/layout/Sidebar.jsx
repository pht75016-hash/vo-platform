import { useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'

const BG       = '#1A1A2E'
const TEXT     = 'rgba(255,255,255,0.55)'
const TEXT_H   = 'rgba(255,255,255,0.90)'
const BORDER   = 'rgba(255,255,255,0.08)'
const SECTION  = 'rgba(255,255,255,0.30)'
const ACTIVE_BG  = 'rgba(37,99,235,0.30)'
const ACTIVE_TXT = '#FFFFFF'

// ── Icons ──────────────────────────────────────────────────────────────────

function Ico({ d, filled = false }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

const icons = {
  home:     () => <Ico d="M2 7.5L8 2l6 5.5V14H10.5V9.5h-5V14H2V7.5z" />,
  car:      () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 9.5L5 5.5h6l1.5 4v2.5h-10V9.5z" />
      <circle cx="5.5" cy="12" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="10.5" cy="12" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  ),
  people:   () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="5.5" r="2.5" />
      <path d="M1.5 14c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" />
      <path d="M11 3.5a2.5 2.5 0 010 5M13.5 14c0-2-1.2-3.2-2.5-3.6" />
    </svg>
  ),
  note:     () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="2" width="10" height="12" rx="1.5" />
      <path d="M6 6h4M6 9h4M6 12h2.5" />
    </svg>
  ),
  wrench:   () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2.5a3.5 3.5 0 00-3.4 4.3L2 11l1 2 4.2-4.1A3.5 3.5 0 0012 5l-1.5 1.5L9 5l1.5-1.5a3.5 3.5 0 00-1-.5z" />
    </svg>
  ),
  folder:   () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 5.5a1 1 0 011-1h3.5l1.5 2H13a1 1 0 011 1V12a1 1 0 01-1 1H3a1 1 0 01-1-1V5.5z" />
    </svg>
  ),
  key:      () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="7" r="3.5" />
      <path d="M9 8.5l5 5M12 11.5l-1.5 1.5" />
    </svg>
  ),
  settings: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="2.5" />
      <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" />
    </svg>
  ),
}

// ── Nav structure ──────────────────────────────────────────────────────────

const NAV = [
  {
    section: 'PRINCIPAL',
    items: [
      { key: 'home',  label: 'Accueil',   route: '/',        icon: icons.home   },
      { key: 'stock', label: 'Stock',     route: '/stock',   icon: icons.car,   badge: 'stockCount' },
      { key: 'crm',   label: 'CRM',       route: '/crm',     icon: icons.people },
      { key: 'notes', label: 'Notes',     route: '/notes',   icon: icons.note   },
    ],
  },
  {
    section: 'ATELIER',
    items: [
      { key: 'atelier',  label: 'Atelier',   route: '/atelier',  icon: icons.wrench },
      { key: 'ged',      label: 'Documents', route: '/ged',      icon: icons.folder },
      { key: 'location', label: 'Location',  route: '/location', icon: icons.key    },
    ],
  },
]

// ── NavItem ────────────────────────────────────────────────────────────────

function NavItem({ item, active, badge }) {
  const navigate = useNavigate()
  const [hover, setHover] = React.useState(false)
  const Icon = item.icon

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(item.route)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(item.route)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '7px 12px', borderRadius: 7, cursor: 'pointer',
        background: active ? ACTIVE_BG : hover ? 'rgba(255,255,255,0.06)' : 'transparent',
        color: active ? ACTIVE_TXT : hover ? TEXT_H : TEXT,
        transition: 'background 0.12s, color 0.12s',
        userSelect: 'none',
      }}
    >
      <span style={{ flexShrink: 0, opacity: active ? 1 : 0.8 }}><Icon /></span>
      <span style={{ flex: 1, fontSize: 13, fontWeight: active ? 600 : 400 }}>{item.label}</span>
      {badge != null && badge > 0 && (
        <span style={{
          fontSize: 10, fontWeight: 700, lineHeight: 1,
          padding: '2px 6px', borderRadius: 999,
          background: active ? '#2563EB' : 'rgba(255,255,255,0.15)',
          color: '#fff', minWidth: 18, textAlign: 'center',
        }}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </div>
  )
}

// ── Sidebar ────────────────────────────────────────────────────────────────

import React from 'react'
import { supabase } from '../../utils/supabase'

function IconLogout() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3" />
      <path d="M10.5 11L14 8l-3.5-3" />
      <path d="M14 8H6" />
    </svg>
  )
}

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const vehicles = useStore((s) => s.vehicles)
  const userProfile = useStore((s) => s.userProfile)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    // onAuthStateChange dans App.jsx bascule automatiquement vers Login
  }

  const stockCount = vehicles.filter((v) => v.status === 'stock').length
  const badges = { stockCount }

  const isActive = (route) => {
    if (route === '/') return location.pathname === '/'
    return location.pathname.startsWith(route)
  }

  const initials = [userProfile.prenom?.[0], userProfile.nom?.[0]]
    .filter(Boolean).join('').toUpperCase() || 'VO'

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, width: 220, height: '100vh',
      background: BG, display: 'flex', flexDirection: 'column',
      borderRight: `1px solid ${BORDER}`, zIndex: 100,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Logo */}
      <div style={{
        padding: '18px 16px 14px',
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>
          VO Platform
        </div>
        <div style={{ fontSize: 11, color: TEXT, marginTop: 2 }}>Négociant VO</div>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
        {NAV.map((group) => (
          <div key={group.section} style={{ marginBottom: 8 }}>
            <div style={{
              fontSize: 10, fontWeight: 600, letterSpacing: '0.8px',
              color: SECTION, padding: '6px 12px 4px', textTransform: 'uppercase',
            }}>
              {group.section}
            </div>
            {group.items.map((item) => (
              <NavItem
                key={item.key}
                item={item}
                active={isActive(item.route)}
                badge={item.badge ? badges[item.badge] : null}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Séparateur + Settings */}
      <div style={{ padding: '0 8px 4px', borderTop: `1px solid ${BORDER}` }}>
        <div style={{ height: 8 }} />
        <NavItem
          item={{ key: 'settings', label: 'Paramètres', route: '/settings', icon: icons.settings }}
          active={isActive('/settings')}
        />
      </div>

      {/* User */}
      <div style={{
        padding: '10px 14px 14px',
        borderTop: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div
          style={{
            width: 30, height: 30, borderRadius: '50%',
            background: '#2563EB', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, flexShrink: 0, cursor: 'pointer',
          }}
          onClick={() => navigate('/settings')}
        >
          {initials}
        </div>
        <div style={{ overflow: 'hidden', flex: 1, cursor: 'pointer' }} onClick={() => navigate('/settings')}>
          <div style={{ fontSize: 12, fontWeight: 600, color: TEXT_H, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {userProfile.prenom || userProfile.nom
              ? `${userProfile.prenom} ${userProfile.nom}`.trim()
              : 'Mon profil'}
          </div>
          <div style={{ fontSize: 11, color: TEXT }}>Négociant VO</div>
        </div>
        <button
          onClick={handleSignOut}
          title="Se déconnecter"
          style={{
            flexShrink: 0, width: 28, height: 28, borderRadius: 6,
            border: `1px solid ${BORDER}`, background: 'transparent',
            color: TEXT, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = TEXT; e.currentTarget.style.borderColor = BORDER }}
        >
          <IconLogout />
        </button>
      </div>
    </nav>
  )
}
