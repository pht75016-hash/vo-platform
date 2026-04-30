import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { removeVehicle, deleteNote } from '../utils/storage'

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

    addVehicle: (v) => set((s) => ({ vehicles: [v, ...s.vehicles] })),

    updateVehicle: (id, data) => set((s) => ({
      vehicles: s.vehicles.map((v) => v.id === id ? { ...v, ...data } : v),
    })),

    deleteVehicle: (id) => {
      set((s) => ({ vehicles: s.vehicles.filter((v) => v.id !== id) }))
      const uid = get().user?.id
      if (uid) removeVehicle(id)
        .then(() => set({ syncError: null }))
        .catch((err) => set({ syncError: err.message }))
    },

    // ── Notes ───────────────────────────────────────────────────────────────
    notes: [],
    setNotes: (notes) => set({ notes }),
    addNote: (n) => set((s) => ({ notes: [n, ...s.notes] })),
    removeNote: (id) => {
      set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }))
      const uid = get().user?.id
      if (uid) deleteNote(id).catch(() => {})
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
    kanbanCols: [
      {id:'entree',     label:'Entrée stock'},
      {id:'preparation',label:'En préparation'},
      {id:'pret',       label:'Prêt à vendre'},
      {id:'vendu',      label:'Vendu'},
    ],
    setKanbanCols: (cols) => set({ kanbanCols: cols }),
  }),
  {
    name: 'vo_platform',
    version: 1,
    partialize: (s) => ({
      vehicles: s.vehicles,
      notes: s.notes,
      contacts: s.contacts,
      userProfile: s.userProfile,
      theme: s.theme,
      moduleOrder: s.moduleOrder,
      stockListCols: s.stockListCols,
      kanbanCols: s.kanbanCols,
    }),
  }
))
