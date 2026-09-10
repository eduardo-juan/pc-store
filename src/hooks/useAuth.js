import { useAuth as useAuthContext } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import { useState, useEffect } from 'react'

export const useAuth = () => {
  const auth = useAuthContext()
  const [perfil, setPerfil] = useState(null)
  const [esAdmin, setEsAdmin] = useState(false)

  useEffect(() => {
    const cargarPerfil = async () => {

      if (!auth.usuario) {
        setPerfil(null)
        setEsAdmin(false)
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
        return
      }

      setPerfil(data)
      setEsAdmin(data?.rol === 'admin')
    }

    cargarPerfil()
  }, [auth.usuario])

  return { ...auth, perfil, esAdmin }
}