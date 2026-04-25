import { useEffect } from 'react'
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
import { fetchVehicles } from './utils/storage'

export default function App() {
  const user = useStore((s) => s.user)
  const setUser = useStore((s) => s.setUser)
  const setVehicles = useStore((s) => s.setVehicles)

  useEffect(() => {
    // Vérifie la session existante au démarrage
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) loadFromSupabase()
    })

    // Synchronise les changements d'état d'auth en temps réel
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) loadFromSupabase()
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadFromSupabase() {
    try {
      const vehicles = await fetchVehicles()
      if (vehicles.length > 0) setVehicles(vehicles)
    } catch (err) {
      // Supabase indisponible → on garde le cache localStorage (Zustand persist)
      console.warn('Supabase unavailable, using local cache:', err.message)
    }
  }

  // Session en cours de vérification → écran vide (évite le flash Login sur refresh)
  if (user === undefined) return null

  // Non connecté → écran de login
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
