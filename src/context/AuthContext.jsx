import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  // Usuario autenticado actualmente. Si no hay sesión, su valor es null.
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Verificar si hay usuario autenticado
    const verificarUsuario = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUsuario(session?.user || null)
      setCargando(false)
    }

    verificarUsuario()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUsuario(session?.user || null)
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  const registro = async (email, password, nombre, apellido) => {
    try {
      setError(null)
      
      // 1. Crear usuario en autenticación
      const { data: { user }, error: authError } = 
        await supabase.auth.signUp({
          email,
          password,
        })

      if (authError) throw authError

      // 2. Crear perfil en tabla usuarios
      const { error: perfilError } = await supabase
        .from('usuarios')
        .insert([{
          id: user.id,
          email,
          nombre,
          apellido,
          rol: 'user',
        }])

      if (perfilError) throw perfilError

      return { success: true, user }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  const login = async (email, password) => {
    try {
      setError(null)
      const { data: { user }, error } = 
        await supabase.auth.signInWithPassword({
          email,
          password,
        })

      if (error) throw error
      return { success: true, user }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUsuario(null)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <AuthContext.Provider value={{
      usuario,
      cargando,
      error,
      registro,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}