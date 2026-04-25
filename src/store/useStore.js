import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { upsertVehicle, removeVehicle } from '../utils/storage'

export const useStore = create(persist(
  (set, get) => ({
    // ── Auth ────────────────────────────────────────────────────────────────
    // undefined = session non encore vérifiée | null = déconnecté | objet = connecté
    user: undefined,
    setUser: (user) => set({ user }),

    // ── Véhicules ───────────────────────────────────────────────────────────
    vehicles: [],
    setVehicles: (vehicles) => set({ vehicles }),

    addVehicle: (v) => {
      set((s) => ({ vehicles: [v, ...s.vehicles] }))
      if (get().user) upsertVehicle(v).catch(console.error)
    },

    updateVehicle: (id, data) => {
      set((s) => ({
        vehicles: s.vehicles.map((v) => v.id === id ? { ...v, ...data } : v),
      }))
      if (get().user) {
        const updated = get().vehicles.find((v) => v.id === id)
        if (updated) upsertVehicle(updated).catch(console.error)
      }
    },

    deleteVehicle: (id) => {
      set((s) => ({ vehicles: s.vehicles.filter((v) => v.id !== id) }))
      if (get().user) removeVehicle(id).catch(console.error)
    },

    // ── Contacts ────────────────────────────────────────────────────────────
    contacts: [],
    addContact: (c) => set((s) => ({ contacts: [...s.contacts, c] })),
    updateContact: (id, data) => set((s) => ({
      contacts: s.contacts.map((c) => c.id === id ? { ...c, ...data } : c),
    })),
    deleteContact: (id) => set((s) => ({
      contacts: s.contacts.filter((c) => c.id !== id),
    })),

    // ── Profil utilisateur ──────────────────────────────────────────────────
    userProfile: { nom: '', prenom: '', email: '', telephone: '' },
    updateProfile: (data) => set((s) => ({
      userProfile: { ...s.userProfile, ...data },
    })),

    // ── Préférences UI ──────────────────────────────────────────────────────
    theme: 'light',
    setTheme: (t) => set({ theme: t }),
    moduleOrder: ['notes', 'ventes', 'crm', 'documents', 'stock', 'atelier', 'location'],
    setModuleOrder: (order) => set({ moduleOrder: order }),
  }),
  {
    name: 'vo_platform',
    version: 1,
    // user n'est pas persisté localement (re-validé via supabase.auth.getSession)
    partialize: (s) => ({
      vehicles: s.vehicles,
      contacts: s.contacts,
      userProfile: s.userProfile,
      theme: s.theme,
      moduleOrder: s.moduleOrder,
    }),
  }
))
