import { useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { useTheme } from '../../utils/theme'

const ROUTE_TITLES = {
  '/':         'Accueil',
  '/stock':    'Stock véhicules',
  '/crm':      'CRM',
  '/atelier':  'Atelier',
  '/ged':      'Documents',
  '/notes':    'Notes',
  '/location': 'Location',
  '/ventes':   'Ventes',
  '/settings': 'Paramètres',
}

function getTitle(pathname) {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname]
  // Sub-routes like /stock/:id
  const parent = '/' + pathname.split('/').filter(Boolean)[0]
  const parentTitle = ROUTE_TITLES[parent]
  return parentTitle ? parentTitle : 'VO Platform'
}

function isSubRoute(pathname) {
  return pathname.split('/').filter(Boolean).length > 1
}

function IconSun() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.5 3.5l1.5 1.5M11 11l1.5 1.5M3.5 12.5L5 11M11 5l1.5-1.5" />
    </svg>
  )
}

function IconMoon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M13.5 10A6 6 0 016 2.5a6 6 0 100 11 6 6 0 007.5-3.5z" />
    </svg>
  )
}

export function Topbar({ actions }) {
  const t = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)

  const title = getTitle(location.pathname)
  const showBack = isSubRoute(location.pathname)
  const parentPath = '/' + location.pathname.split('/').filter(Boolean).slice(0, -1).join('/')

  return (
    <div style={{
      height: 52, display: 'flex', alignItems: 'center',
      padding: '0 20px', gap: 12, flexShrink: 0,
      background: t.topbarBg, borderBottom: `0.5px solid ${t.topbarBorder}`,
      position: 'sticky', top: 0, zIndex: 90,
    }}>
      {showBack && (
        <button
          onClick={() => navigate(parentPath)}
          style={{
            height: 28, padding: '0 10px', borderRadius: 7, cursor: 'pointer',
            border: `0.5px solid ${t.borderLight}`, background: 'transparent',
            color: t.textSecondary, fontSize: 13, display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M10 3L5 8l5 5" />
          </svg>
          Retour
        </button>
      )}

      <span style={{
        flex: 1, fontSize: 15, fontWeight: 600, color: t.text, letterSpacing: '-0.2px',
      }}>
        {title}
      </span>

      {/* Slot d'actions contextuelles */}
      {actions && <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{actions}</div>}

      {/* Theme toggle */}
      <button
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        title={theme === 'light' ? 'Passer en mode sombre' : 'Passer en mode clair'}
        style={{
          width: 32, height: 32, borderRadius: 7, cursor: 'pointer',
          border: `0.5px solid ${t.borderLight}`, background: 'transparent',
          color: t.textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {theme === 'light' ? <IconMoon /> : <IconSun />}
      </button>
    </div>
  )
}
