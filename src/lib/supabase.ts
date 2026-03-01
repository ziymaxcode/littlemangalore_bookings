/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = (envUrl && envUrl.startsWith('http')) ? envUrl : 'https://xviikengjcczzoxizaxn.supabase.co';
const supabaseAnonKey = (envKey && envKey !== 'YOUR_SUPABASE_ANON_KEY') ? envKey : 'sb_publishable_5FX2PQv9jABOZ3L2lyCWgw_KiweJj11';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
