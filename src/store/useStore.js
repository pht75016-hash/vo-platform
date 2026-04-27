import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { upsertVehicle, removeVehicle } from '../utils/storage'

export const useStore = create(persist(
  (set, get) => ({
    // ── Auth ────────────────────────────────────────────────────────────────
    // undefined = session non encore vérifiée | null = déconnecté | objet = connecté
    user: undefined,
    setUser: (user) => set({ user }),

    // ── Sync status ─────────────────────────────────────────────────────────
    syncError: null,   // null = ok | string = message d'erreur
    setSyncError: (msg) => set({ syncError: msg }),

    // ── Véhicules ───────────────────────────────────────────────────────────
    vehicles: [],
    setVehicles: (vehicles) => set({ vehicles }),

    addVehicle: (v) => {
      set((s) => ({ vehicles: [v, ...s.vehicles] }))
      const uid = get().user?.id
      if (uid) upsertVehicle(v, uid)
        .then(() => set({ syncError: null }))
        .catch((err) => set({ syncError: err.message }))
    },

    updateVehicle: (id, data) => {
      set((s) => ({
        vehicles: s.vehicles.map((v) => v.id === id ? { ...v, ...data } : v),
      }))
      const uid = get().user?.id
      if (uid) {
        const updated = get().vehicles.find((v) => v.id === id)
        if (updated) upsertVehicle(updated, uid)
          .then(() => set({ syncError: null }))
          .catch((err) => set({ syncError: err.message }))
      }
    },

    deleteVehicle: (id) => {
      set((s) => ({ vehicles: s.vehicles.filter((v) => v.id !== id) }))
      const uid = get().user?.id
      if (uid) removeVehicle(id)
        .then(() => set({ syncError: null }))
        .catch((err) => set({ syncError: err.message }))
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
    stockListCols: ['priorite','marque','modele','carburant','km','jours','achat','vente','marge','tva'],
    setStockListCols: (cols) => set({ stockListCols: cols }),
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
      stockListCols: s.stockListCols,
    }),
  }
))
