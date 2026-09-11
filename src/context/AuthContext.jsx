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
  // REGISTRAR ACCESO
  // =========================================================
  const registrarAcceso = async (authUser, perfil) => {
    if (!authUser) return

    try {
      const { error } = await supabase
        .from('auditoria_accesos')
        .insert({
          usuario_id: authUser.id,
          email: authUser.email || perfil?.email || null,
          rol: perfil?.rol || 'user',
        })

      if (error) {
        console.error(
          '[AUDITORIA] Error registrando acceso:',
          error
        )
      }
    } catch (err) {
      console.error(
        '[AUDITORIA] Error inesperado:',
        err
      )
    }
  }

  // =========================================================
  // CARGAR PERFIL
  // =========================================================
  const cargarPerfil = async (authUser) => {
    if (!authUser) {
      setUsuario(null)
      return null
    }

    try {
      const { data: perfil, error: perfilError } =
        await supabase
          .from('usuarios')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle()

      if (perfilError) {
        console.error(
          '[AUTH] Error cargando perfil:',
          perfilError
        )

        setUsuario({
          ...authUser,
        })

        return authUser
      }

      // =====================================================
      // USUARIO BLOQUEADO
      // =====================================================
      if (perfil?.bloqueado === true) {
        const mensaje =
          'Tu cuenta está bloqueada. Contacta con el administrador.'

        console.warn('[AUTH]', mensaje)

        setError(mensaje)
        setUsuario(null)
        setSession(null)

        await supabase.auth.signOut()

        return null
      }

      const usuarioCompleto = {
        ...authUser,
        ...(perfil || {}),
      }

      setUsuario(usuarioCompleto)

      return usuarioCompleto
    } catch (err) {
      console.error(
        '[AUTH] Error inesperado cargando perfil:',
        err
      )

      setUsuario({
        ...authUser,
      })

      return authUser
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

        if (!activo) return

        if (sessionError) {
          console.error(
            '[AUTH] Error obteniendo sesión:',
            sessionError
          )

          setError(sessionError.message)
        }

        if (sesionActual?.user) {
          setSession(sesionActual)

          await cargarPerfil(sesionActual.user)
        } else {
          setSession(null)
          setUsuario(null)
        }
      } catch (err) {
        console.error(
          '[AUTH] Error inicializando autenticación:',
          err
        )

        if (activo) {
          setError(err.message)
        }
      } finally {
        if (activo) {
          setCargando(false)
        }
      }
    }

    iniciarAuth()

    // =======================================================
    // CAMBIOS DE AUTH
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

        if (
          event === 'SIGNED_OUT' ||
          event === 'USER_DELETED'
        ) {
          setSession(null)
          setUsuario(null)
          return
        }

        if (nuevaSesion?.user) {
          setSession(nuevaSesion)
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
      if (!session?.user) return

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

      const { error: perfilError } =
        await supabase
          .from('usuarios')
          .insert([
            {
              id: user.id,
              email,
              nombre,
              apellido,
              rol: 'user',
              bloqueado: false,
              activo: true,
            },
          ])

      if (perfilError) {
        throw perfilError
      }

      const {
        data: { session: nuevaSesion },
      } = await supabase.auth.getSession()

      if (nuevaSesion) {
        setSession(nuevaSesion)
        await cargarPerfil(user)
      }

      return {
        success: true,
        user,
      }
    } catch (err) {
      console.error(
        '[AUTH] Error en registro:',
        err
      )

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
        data: {
          session: nuevaSesion,
          user,
        },
        error: loginError,
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginError) {
        throw loginError
      }

      if (!user || !nuevaSesion) {
        throw new Error(
          'No se pudo iniciar sesión'
        )
      }

      // =====================================================
      // CARGAR PERFIL
      // =====================================================
      const { data: perfil, error: perfilError } =
        await supabase
          .from('usuarios')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

      if (perfilError) {
        console.error(
          '[AUTH] Error cargando perfil después del login:',
          perfilError
        )

        setSession(nuevaSesion)
        setUsuario(user)

        return {
          success: true,
          user,
        }
      }

      // =====================================================
      // BLOQUEADO
      // =====================================================
      if (perfil?.bloqueado === true) {
        const mensaje =
          'Tu cuenta está bloqueada. Contacta con el administrador.'

        await supabase.auth.signOut()

        setSession(null)
        setUsuario(null)
        setError(mensaje)

        return {
          success: false,
          error: mensaje,
        }
      }

      // =====================================================
      // SESIÓN CORRECTA
      // =====================================================
      setSession(nuevaSesion)

      setUsuario({
        ...user,
        ...(perfil || {}),
      })

      // Registrar solamente el acceso exitoso.
      await registrarAcceso(user, perfil)

      return {
        success: true,
        user,
      }
    } catch (err) {
      console.error(
        '[AUTH] Error en login:',
        err
      )

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
        '[AUTH] Error cerrando sesión:',
        err
      )

      setError(err.message)
    }
  }

  // =========================================================
  // ROLES
  // =========================================================
  const esAdmin = usuario?.rol === 'admin'
  const esEmpleado = usuario?.rol === 'empleado'
  const esStaff = esAdmin || esEmpleado

  // =========================================================
  // CONTEXTO
  // =========================================================
  return (
    <AuthContext.Provider
      value={{
        usuario,
        session,
        cargando,
        error,
        registro,
        login,
        logout,
        esAdmin,
        esEmpleado,
        esStaff,
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