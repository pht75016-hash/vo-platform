import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { loadVehicles } from './utils/storage'
import { useStore } from './store/useStore'
import App from './App'

// Migration one-shot : si Zustand (vo_platform) est vide, tente de lire
// les données legacy (vs8, vs7…) et les injecte dans le store.
const state = useStore.getState()
if (state.vehicles.length === 0) {
  const migrated = loadVehicles()
  if (migrated.length > 0) {
    useStore.getState().setVehicles(migrated)
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
