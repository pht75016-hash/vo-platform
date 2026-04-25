import { useTheme } from '../../utils/theme'

export function Atelier() {
  const t = useTheme()
  return (
    <div style={{
      textAlign: 'center', padding: 48, color: t.textMuted, fontSize: 14,
      background: t.bgSurface, border: `0.5px solid ${t.border}`, borderRadius: 10,
    }}>
      Module Atelier — ordres de travaux à venir.
    </div>
  )
}
