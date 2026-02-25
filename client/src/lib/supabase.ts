// server/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Use your Supabase URL and Service Role Key from .env
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseServiceKey)
