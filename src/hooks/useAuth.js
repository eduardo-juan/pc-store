// ============================================================
// HOOK DE AUTENTICACIÓN
// Complementa AuthContext cargando el perfil y determinando
// los permisos del usuario actual.
// ============================================================
import { useAuth as useAuthContext } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import { useState, useEffect } from 'react'

// Hook personalizado que combina la sesión global
// con el perfil y los permisos del usuario.
export const useAuth = () => {
  const auth = useAuthContext()

// Estado del perfil y roles obtenidos desde la tabla usuarios.  
  const [perfil, setPerfil] = useState(null)
  const [esAdmin, setEsAdmin] = useState(false)
  const [esEmpleado, setEsEmpleado] = useState(false)

// Cada vez que cambia el usuario autenticado, cargamos
// su perfil actualizado desde Supabase.  
  useEffect(() => {
    const cargarPerfil = async () => {

// Si no existe un usuario autenticado, limpiamos
// el perfil y los permisos asociados.      
      if (!auth.usuario) {
        setPerfil(null)
        setEsAdmin(false)
        setEsEmpleado(false)
        return
      }

// Obtiene los datos del perfil y su rol desde la tabla usuarios.      
      const { data, error } = await supabase
        .from('usuarios')
        .select('id,email,nombre,apellido,teléfono,dirección,ciudad,país,avatar_url,rol,activo,bloqueado,dni,created_at,updated_at')
        .eq('id', auth.usuario.id)
        .single()

      if (error) {
        console.error('Error cargando perfil/rol:', error)
        setPerfil(null)
        setEsAdmin(false)
        setEsEmpleado(false)
        return
      }

      setPerfil(data)
      setEsAdmin(data?.rol === 'admin')
      setEsEmpleado(data?.rol === 'empleado')
    }

    cargarPerfil()
  }, [auth.usuario])

// Staff identifica a usuarios con permisos de administrador
// o empleado y exponemos toda la información al componente.  
  const esStaff = esAdmin || esEmpleado

  return { ...auth, perfil, esAdmin, esEmpleado, esStaff }
}