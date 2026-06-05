import { createClient } from "@supabase/supabase-js";

// Clé PUBLIQUE (publishable) — conçue pour être visible côté site.
// La sécurité des données est assurée par les règles RLS côté base.
// On lit d'abord les variables d'env (Vercel) si présentes, sinon repli sur les valeurs publiques.
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dntohsnhtqeomllfjood.supabase.co";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_XKwCktlkfXz6YBTH3S92nA_R2D9W7UN";

export const supabase = URL && KEY ? createClient(URL, KEY, { auth: { persistSession: false } }) : null;
