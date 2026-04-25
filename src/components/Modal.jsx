import { useEffect } from 'react'
import { useTheme } from '../utils/theme'

export function Modal({ title, onClose, children, width = 520 }) {
  const t = useTheme()

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: t.bgSurface, border: `0.5px solid ${t.border}`, borderRadius: 14,
          width: '100%', maxWidth: width, maxHeight: '90vh',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', borderBottom: `0.5px solid ${t.border}`,
        }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: t.text }}>{title}</span>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 6, border: 'none',
              background: t.bgSecondary, cursor: 'pointer',
              color: t.textSecondary, fontSize: 18, lineHeight: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >×</button>
        </div>
        <div style={{ overflowY: 'auto', padding: 18, flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  )
}
