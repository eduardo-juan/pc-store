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
    let query = supabase.from('productos').select('id,nombre,categoria_id,descripción,especificaciones,precio,precio_descuento,stock,imagen_principal,imágenes_adicionales,modelo,marca,garantía_meses,activo,destacado,created_at,updated_at')
    if (categoria) query = query.eq('categoria_id', categoria)
    
    const { data } = await query
    setProductos(data || [])
    setCargando(false)
  }

  return { productos, cargando }
}