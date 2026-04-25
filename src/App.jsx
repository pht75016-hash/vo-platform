import { useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { Home } from './modules/home/Home'
import Stock from './modules/stock/Stock'
import { Crm } from './modules/crm/Crm'
import { Atelier } from './modules/atelier/Atelier'
import { Ged } from './modules/ged/Ged'
import { Notes } from './modules/notes/Notes'
import { Location } from './modules/location/Location'
import { Login } from './modules/auth/Login'
import { supabase } from './utils/supabase'
import { useStore } from './store/useStore'
import { fetchVehicles, upsertVehicle } from './utils/storage'

export default function App() {
  const user = useStore((s) => s.user)
  const setUser = useStore((s) => s.setUser)
  const setVehicles = useStore((s) => s.setVehicles)
  const realtimeChannel = useRef(null)

  async function loadFromSupabase(userId) {
    try {
      const remote = await fetchVehicles()

      if (remote.length > 0) {
        // Supabase a des données → source de vérité
        setVehicles(remote)
      } else {
        // Supabase vide → on remonte les données locales si elles existent
        const local = useStore.getState().vehicles
        if (local.length > 0 && userId) {
          await Promise.all(local.map(v => upsertVehicle(v, userId)))
          // Pas besoin de setVehicles : local est déjà correct
        }
      }
    } catch (err) {
      console.warn('Supabase unavailable, using local cache:', err.message)
    }
  }

  function subscribeRealtime() {
    if (realtimeChannel.current) supabase.removeChannel(realtimeChannel.current)
    realtimeChannel.current = supabase
      .channel('vehicles-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, () => {
        const uid = useStore.getState().user?.id
        if (uid) loadFromSupabase(uid)
      })
      .subscribe()
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) { loadFromSupabase(u.id); subscribeRealtime() }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) { loadFromSupabase(u.id); subscribeRealtime() }
      if (!u && realtimeChannel.current) {
        supabase.removeChannel(realtimeChannel.current)
        realtimeChannel.current = null
      }
    })

    return () => {
      subscription.unsubscribe()
      if (realtimeChannel.current) supabase.removeChannel(realtimeChannel.current)
    }
  }, [])

  if (user === undefined) return null
  if (user === null) return <Login />

  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/stock"     element={<Stock />} />
          <Route path="/stock/:id" element={<div style={{ padding: 8 }}>Fiche véhicule — à venir</div>} />
          <Route path="/crm"       element={<Crm />} />
          <Route path="/atelier"   element={<Atelier />} />
          <Route path="/ged"       element={<Ged />} />
          <Route path="/notes"     element={<Notes />} />
          <Route path="/location"  element={<Location />} />
          <Route path="/ventes"    element={<div style={{ padding: 8, color: '#888' }}>Module Ventes — à venir</div>} />
          <Route path="/settings"  element={<div style={{ padding: 8, color: '#888' }}>Paramètres — à venir</div>} />
          <Route path="*"          element={<div style={{ padding: 8, color: '#888' }}>Page introuvable.</div>} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}
