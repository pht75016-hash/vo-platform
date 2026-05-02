import { createClient } from '@supabase/supabase-js'

// Env vars en priorité (Vercel Dashboard) — fallback sur les valeurs hardcodées
// pour éviter toute régression si les vars ne sont pas encore configurées.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
  || 'https://jiewpwfmohiaikbuvlbz.supabase.co'
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppZXdwd2Ztb2hpYWlrYnV2bGJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNDE0MDAsImV4cCI6MjA5MjcxNzQwMH0.10OBEtVViU-bYGGTJ6zYpRx97BrwImq3kYJ3y2CV-QM'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
