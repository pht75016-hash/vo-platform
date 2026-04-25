import { useTheme } from '../../utils/theme'
import { useIsMobile } from '../../hooks/useIsMobile'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { BottomNav } from './BottomNav'

const SIDEBAR_W = 220

export function AppShell({ children, topbarActions }) {
  const t = useTheme()
  const isMobile = useIsMobile()

  return (
    <div style={{
      minHeight: '100vh',
      background: t.bg,
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      {/* Sidebar — desktop uniquement */}
      {!isMobile && <Sidebar />}

      {/* Zone principale */}
      <div style={{
        marginLeft: isMobile ? 0 : SIDEBAR_W,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: isMobile ? 56 : 0,
      }}>
        <Topbar actions={topbarActions} />
        <main style={{ flex: 1, padding: isMobile ? 16 : 24, overflowX: 'hidden' }}>
          {children}
        </main>
      </div>

      {/* Bottom nav — mobile uniquement */}
      {isMobile && <BottomNav />}
    </div>
  )
}
