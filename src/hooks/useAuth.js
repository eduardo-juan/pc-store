import { useAuth as useAuthContext } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import { useState, useEffect } from 'react'

export const useAuth = () => {
  const auth = useAuthContext()
  const [perfil, setPerfil] = useState(null)
  const [esAdmin, setEsAdmin] = useState(false)
  const [esEmpleado, setEsEmpleado] = useState(false)

  useEffect(() => {
    const cargarPerfil = async () => {

      if (!auth.usuario) {
        setPerfil(null)
        setEsAdmin(false)
        setEsEmpleado(false)
        return
      }

      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
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

  const esStaff = esAdmin || esEmpleado

  return { ...auth, perfil, esAdmin, esEmpleado, esStaff }
}