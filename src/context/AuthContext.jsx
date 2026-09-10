import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null)
  const [session, setSession] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  // =========================================================
  // CARGAR PERFIL DESDE LA TABLA usuarios
  // =========================================================
  const cargarPerfil = async (authUser) => {
    if (!authUser) {
      setUsuario(null)
      return
    }

    try {
      const { data: perfil, error: perfilError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle()

      if (perfilError) {
        console.error('Error al cargar perfil:', perfilError)

        // IMPORTANTE:
        // Un error en usuarios NO debe cerrar la sesión.
        setUsuario(authUser)
        return
      }

      setUsuario({
        ...authUser,
        ...(perfil || {}),
      })
    } catch (err) {
      console.error('Error cargando perfil:', err)

      // Mantener la sesión aunque falle la consulta del perfil.
      setUsuario(authUser)
    }
  }

  // =========================================================
  // INICIALIZAR AUTENTICACIÓN
  // =========================================================
  useEffect(() => {
    let activo = true

    const iniciarAuth = async () => {
      try {
        const {
          data: { session: sesionActual },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error(
            'Error obteniendo sesión:',
            sessionError
          )
        }

        if (!activo) return

        if (sesionActual?.user) {
          setSession(sesionActual)

          await cargarPerfil(sesionActual.user)
        } else {
          setSession(null)
          setUsuario(null)
        }
      } catch (err) {
        console.error(
          'Error inicializando autenticación:',
          err
        )

        if (activo) {
          setSession(null)
          setUsuario(null)
        }
      } finally {
        if (activo) {
          setCargando(false)
        }
      }
    }

    iniciarAuth()

    // =======================================================
    // ESCUCHAR CAMBIOS DE AUTENTICACIÓN
    // =======================================================
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, nuevaSesion) => {
        if (!activo) return

        console.log(
          '[AUTH]',
          event,
          'sesión:',
          !!nuevaSesion
        )

        // ---------------------------------------------------
        // SESIÓN DISPONIBLE
        // ---------------------------------------------------
        if (nuevaSesion?.user) {
          setSession(nuevaSesion)

          // NO hacemos una consulta a Supabase directamente
          // dentro del callback de onAuthStateChange.
          //
          // El perfil se cargará mediante el useEffect
          // que observa "session".
          return
        }

        // ---------------------------------------------------
        // SESIÓN CERRADA
        // ---------------------------------------------------
        if (
          event === 'SIGNED_OUT' ||
          event === 'USER_DELETED'
        ) {
          setSession(null)
          setUsuario(null)
        }
      }
    )

    return () => {
      activo = false
      subscription?.unsubscribe()
    }
  }, [])

  // =========================================================
  // CARGAR PERFIL CUANDO CAMBIA LA SESIÓN
  // =========================================================
  useEffect(() => {
    let activo = true

    const cargar = async () => {
      if (!session?.user) {
        if (activo) {
          setUsuario(null)
        }

        return
      }

      // Esperamos un momento para no ejecutar una consulta
      // dentro del callback de onAuthStateChange.
      await new Promise((resolve) =>
        setTimeout(resolve, 0)
      )

      if (!activo) return

      await cargarPerfil(session.user)
    }

    cargar()

    return () => {
      activo = false
    }
  }, [session])

  // =========================================================
  // REGISTRO
  // =========================================================
  const registro = async (
    email,
    password,
    nombre,
    apellido
  ) => {
    try {
      setError(null)

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        throw authError
      }

      if (!user) {
        throw new Error(
          'No se pudo crear el usuario'
        )
      }

      // Crear perfil en usuarios
      const { error: perfilError } = await supabase
        .from('usuarios')
        .insert([
          {
            id: user.id,
            email,
            nombre,
            apellido,
            rol: 'user',
          },
        ])

      if (perfilError) {
        throw perfilError
      }

      // Si Supabase creó una sesión inmediatamente
      // cargamos el perfil.
      await cargarPerfil(user)

      return {
        success: true,
        user,
      }
    } catch (err) {
      console.error('Error en registro:', err)

      setError(err.message)

      return {
        success: false,
        error: err.message,
      }
    }
  }

  // =========================================================
  // LOGIN
  // =========================================================
  const login = async (email, password) => {
    try {
      setError(null)

      const {
        data: { session: nuevaSesion, user },
        error: loginError,
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginError) {
        throw loginError
      }

      if (!user) {
        throw new Error(
          'No se pudo iniciar sesión'
        )
      }

      // Actualizamos inmediatamente el estado local.
      if (nuevaSesion) {
        setSession(nuevaSesion)
      }

      await cargarPerfil(user)

      return {
        success: true,
        user,
      }
    } catch (err) {
      console.error('Error en login:', err)

      setError(err.message)

      return {
        success: false,
        error: err.message,
      }
    }
  }

  // =========================================================
  // LOGOUT
  // =========================================================
  const logout = async () => {
    try {
      setError(null)

      const { error: logoutError } =
        await supabase.auth.signOut()

      if (logoutError) {
        throw logoutError
      }

      setSession(null)
      setUsuario(null)
    } catch (err) {
      console.error(
        'Error cerrando sesión:',
        err
      )

      setError(err.message)
    }
  }

  // =========================================================
  // CONTEXTO
  // =========================================================
  return (
    <AuthContext.Provider
      value={{
        usuario,
        cargando,
        error,
        registro,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ===========================================================
// HOOK useAuth
// ===========================================================
export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth debe usarse dentro de AuthProvider'
    )
  }

  return context
}