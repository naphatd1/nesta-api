export const supabaseConfig = {
  url: process.env.SUPABASE_URL,
  anonKey: process.env.SUPABASE_ANON_KEY,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  
  isEnabled: () => !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
};