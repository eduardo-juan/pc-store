// ============================================================
// SERVICIO DE AUTENTICACIÓN
// Centraliza las operaciones básicas de autenticación
// realizadas mediante Supabase.
// ============================================================
import { supabase } from '../supabaseClient'

// Servicio utilizado para registrar usuarios,
// iniciar sesión, cerrar sesión y consultar el usuario actual.
export const authService = {

// Crea una nueva cuenta utilizando correo y contraseña.  
  async registro(email, password) {
    return await supabase.auth.signUp({ email, password })
  },

// Autentica al usuario y permite cerrar su sesión activa.  
  async login(email, password) {
    return await supabase.auth.signInWithPassword({ email, password })
  },

  async logout() {
    return await supabase.auth.signOut()
  },

// Obtiene desde Supabase el usuario asociado a la sesión actual.  
  async getCurrentUser() {
    const { data } = await supabase.auth.getUser()
    return data?.user
  }
}