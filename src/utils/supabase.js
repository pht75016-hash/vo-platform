import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jiewpwfmohiaikbuvlbz.supabase.co'
const SUPABASE_KEY = 'sb_publishable_O2nlSbJgcQOgtu0nohSaaw_bS34lo9Y'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
