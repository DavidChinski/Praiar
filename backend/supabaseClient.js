import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const supabaseUrl = 'https://tjzjovruebzwfznkhvoo.supabase.co';
// Clave pública (anon) existente para operaciones de cliente
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqempvdnJ1ZWJ6d2Z6bmtodm9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NTc2NDEsImV4cCI6MjA2MzIzMzY0MX0.j-WEiERi5bVzCeQqztxWS3-hxVGWwkXLfzu8owzpM24';

// Cliente normal (anon)
export const supabase = createClient(supabaseUrl, supabaseKey);

// Cliente admin (service role). Usa la variable de entorno SUPABASE_SERVICE_ROLE_KEY.
// Si no está configurada, hace fallback al anon key para evitar romper el servidor,
// aunque ciertas operaciones podrían fallar por RLS.
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || null;
if (!serviceRoleKey) {
	console.warn('[Supabase] SUPABASE_SERVICE_ROLE_KEY no está configurada. Algunas operaciones (aprobación/rechazo) pueden fallar por RLS. Configure la variable en el backend.');
}
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey || supabaseKey);
