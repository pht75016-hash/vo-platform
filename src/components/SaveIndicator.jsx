import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/useStore'
import { upsertVehicle } from '../utils/storage'

export function SaveIndicator() {
  const [status, setStatus] = useState(null)
  const timerRef = useRef(null)
  const hideRef  = useRef(null)

  useEffect(() => {
    // subscribe runs outside React's render cycle — immune to Strict Mode
    // double-invocation. Fires only when vehicles reference actually changes.
    const unsub = useStore.subscribe((state, prev) => {
      if (state.vehicles === prev.vehicles) return
      const uid = state.user?.id
      if (!uid) return

      setStatus('saving')
      clearTimeout(timerRef.current)
      clearTimeout(hideRef.current)

      timerRef.current = setTimeout(async () => {
        // Re-read latest state at fire time (debounce may have batched edits)
        const { vehicles, user } = useStore.getState()
        if (!user?.id) return
        try {
          await Promise.all(vehicles.map(v => upsertVehicle(v, user.id)))
          setStatus('saved')
          hideRef.current = setTimeout(() => setStatus(null), 3000)
        } catch {
          setStatus(null)
        }
      }, 2000)
    })

    return () => {
      unsub()
      clearTimeout(timerRef.current)
      clearTimeout(hideRef.current)
    }
  }, [])

  if (!status) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      zIndex: 9999,
      background: status === 'saved' ? '#16A34A' : '#374151',
      color: '#fff',
      borderRadius: 100,
      padding: '6px 14px',
      fontSize: 12,
      fontWeight: 500,
      fontFamily: "'DM Sans', system-ui, sans-serif",
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      transition: 'background 0.3s ease',
      userSelect: 'none',
      letterSpacing: '0.1px',
      pointerEvents: 'none',
    }}>
      {status === 'saving' ? 'Sauvegarde...' : 'Enregistré ✓'}
    </div>
  )
}
