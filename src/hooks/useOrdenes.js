import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from './useAuth'

export const useOrdenes = () => {
  const { usuario } = useAuth()
  const [ordenes, setOrdenes] = useState([])
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    if (usuario) {
      cargarOrdenes()
    }
  }, [usuario])

  const cargarOrdenes = async () => {
    setCargando(true)
    const { data } = await supabase
      .from('ordenes')
      .select('*')
      .eq('usuario_id', usuario.id)
      .order('created_at', { ascending: false })
    setOrdenes(data || [])
    setCargando(false)
  }

  return { ordenes, cargando, refetch: cargarOrdenes }
}
