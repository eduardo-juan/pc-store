import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export const useProductos = (categoria = null) => {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    cargarProductos()
  }, [categoria])

  const cargarProductos = async () => {
    setCargando(true)
    let query = supabase.from('productos').select('*')
    if (categoria) query = query.eq('categoria_id', categoria)
    
    const { data } = await query
    setProductos(data || [])
    setCargando(false)
  }

  return { productos, cargando }
}