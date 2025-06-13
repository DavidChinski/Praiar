import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tjzjovruebzwfznkhvoo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqempvdnJ1ZWJ6d2Z6bmtodm9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NTc2NDEsImV4cCI6MjA2MzIzMzY0MX0.j-WEiERi5bVzCeQqztxWS3-hxVGWwkXLfzu8owzpM24'

export const supabase = createClient(supabaseUrl, supabaseKey)