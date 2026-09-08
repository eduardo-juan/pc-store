import { supabase } from '../supabaseClient'

export const authService = {
  async registro(email, password) {
    return await supabase.auth.signUp({ email, password })
  },

  async login(email, password) {
    return await supabase.auth.signInWithPassword({ email, password })
  },

  async logout() {
    return await supabase.auth.signOut()
  },

  async getCurrentUser() {
    const { data } = await supabase.auth.getUser()
    return data?.user
  }
}