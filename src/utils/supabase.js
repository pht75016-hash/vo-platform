import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jiewpwfmohiaikbuvlbz.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppZXdwd2Ztb2hpYWlrYnV2bGJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNDE0MDAsImV4cCI6MjA5MjcxNzQwMH0.10OBEtVViU-bYGGTJ6zYpRx97BrwImq3kYJ3y2CV-QM'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
