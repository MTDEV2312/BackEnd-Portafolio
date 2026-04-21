import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv';
dotenv.config();

// Create a single supabase client for interacting with your database
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(process.env.SUPABASE_URL, supabaseKey)

export default supabase;
