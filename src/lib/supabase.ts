import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ugdvtmtwdymogeemwuwr.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ILWPKZ2Pobx7UHV5pEmtnA_BJyTdg4w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
