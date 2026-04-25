import { useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../../utils/theme'

const ITEMS = [
  {
    key: 'home', label: 'Accueil', route: '/',
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 7.5L8 2l6 5.5V14H10.5V9.5h-5V14H2V7.5z" />
      </svg>
    ),
  },
  {
    key: 'stock', label: 'Stock', route: '/stock',
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.5 9.5L5 5.5h6l1.5 4v2.5h-10V9.5z" />
        <circle cx="5.5" cy="12" r="0.75" fill="currentColor" stroke="none" />
        <circle cx="10.5" cy="12" r="0.75" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    key: 'crm', label: 'CRM', route: '/crm',
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="5.5" r="2.5" />
        <path d="M1.5 14c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" />
        <path d="M11 3.5a2.5 2.5 0 010 5M13.5 14c0-2-1.2-3.2-2.5-3.6" />
      </svg>
    ),
  },
  {
    key: 'notes', label: 'Notes', route: '/notes',
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="2" width="10" height="12" rx="1.5" />
        <path d="M6 6h4M6 9h4M6 12h2.5" />
      </svg>
    ),
  },
  {
    key: 'atelier', label: 'Atelier', route: '/atelier',
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2.5a3.5 3.5 0 00-3.4 4.3L2 11l1 2 4.2-4.1A3.5 3.5 0 0012 5l-1.5 1.5L9 5l1.5-1.5a3.5 3.5 0 00-1-.5z" />
      </svg>
    ),
  },
]

export function BottomNav() {
  const t = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (route) => {
    if (route === '/') return location.pathname === '/'
    return location.pathname.startsWith(route)
  }

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, height: 56,
      background: t.topbarBg, borderTop: `0.5px solid ${t.topbarBorder}`,
      display: 'flex', alignItems: 'stretch', zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {ITEMS.map((item) => {
        const active = isActive(item.route)
        return (
          <button
            key={item.key}
            onClick={() => navigate(item.route)}
            style={{
              flex: 1, border: 'none', background: 'transparent', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 3,
              color: active ? t.accent : t.textMuted,
            }}
          >
            {item.icon}
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, letterSpacing: '0.1px' }}>
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
