import { DEFAULT_STEPS } from './constants'
import { supabase } from './supabase'

// ── Legacy migration (one-shot at startup) ─────────────────────────────────

const LEGACY_KEY = 'vs8'
const LEGACY_KEYS = ['vs7','vs6','vs5','vs4','vs3','vs2']

export function loadVehicles() {
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      if (Array.isArray(data) && data.length > 0) return migrateVehicles(data)
      if (data?.state?.vehicles?.length > 0) return migrateVehicles(data.state.vehicles)
    }
  } catch(e) {}

  for (const key of LEGACY_KEYS) {
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const data = JSON.parse(raw)
        if (Array.isArray(data) && data.length > 0) return migrateVehicles(data)
        if (data?.vehicles?.length > 0) return migrateVehicles(data.vehicles)
      }
    } catch(e) {}
  }
  return []
}

function migrateVehicles(data) {
  return data.map(v => {
    const s = (v.steps && v.steps.achat) ? v.steps : JSON.parse(JSON.stringify(DEFAULT_STEPS))
    if (s.achat?.prepa && typeof s.achat.prepa.annonce !== 'object') {
      s.achat.prepa.annonce = {
        status: s.achat.prepa.annonce || 0,
        leboncoin: false, lacentrale: false, autoscout24: false,
      }
    }
    return { ...v, steps: s, statut: v.statut || v.status || 'stock' }
  })
}

// ── Supabase CRUD ──────────────────────────────────────────────────────────
// Schéma minimal requis : vehicles(id text PK, data jsonb)

export async function fetchVehicles() {
  const { data, error } = await supabase
    .from('vehicles')
    .select('data')
  if (error) throw error
  return data.map(row => row.data)
}

export async function upsertVehicle(vehicle) {
  const { error } = await supabase
    .from('vehicles')
    .upsert({ id: vehicle.id, data: vehicle })
  if (error) throw error
}

export async function removeVehicle(id) {
  const { error } = await supabase.from('vehicles').delete().eq('id', id)
  if (error) throw error
}
