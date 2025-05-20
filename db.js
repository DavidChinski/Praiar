import supabase from './src/supabaseClient.js'

export async function getUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')

  if (error) throw error
  return data
}
