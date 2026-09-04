import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const verificarUsuario = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        const { data: perfil } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', session.user.id)
          .single()

        setUsuario({ ...session.user, ...perfil })
      } else {
        setUsuario(null)
      }

      setCargando(false)
    }

    verificarUsuario()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: perfil } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', session.user.id)
            .single()

          setUsuario({ ...session.user, ...perfil })
        } else {
          setUsuario(null)
        }
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  const registro = async (email, password, nombre, apellido) => {
    try {
      setError(null)

      const { data: { user }, error: authError } =
        await supabase.auth.signUp({
          email,
          password,
        })

      if (authError) throw authError

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