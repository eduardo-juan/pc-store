// ============================================================
// DOCUMENTACIÓN AMPLIADA
// Archivo: src/hooks/useProductos.js
// Responsabilidad: Encapsula lógica reutilizable de estado.
// Criterio: mantener aquí solo la responsabilidad de este módulo y delegar operaciones compartidas a la capa correspondiente.
// ============================================================

// ============================================================
// HOOK DE PRODUCTOS
// Obtiene los productos desde Supabase y permite filtrarlos
// por categoría.
// ============================================================
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

// Hook encargado de consultar y administrar los productos
// utilizados por la aplicación.
export const useProductos = (categoria = null) => {

// Estado de los productos obtenidos y del indicador de carga.  
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(false)

// Recarga los productos cuando cambia la categoría seleccionada.  
  useEffect(() => {
    cargarProductos()
  }, [categoria])

// Consulta los productos activos disponibles en Supabase
// y aplica el filtro de categoría cuando corresponde.  
  const cargarProductos = async () => {
    setCargando(true)
    let query = supabase.from('productos').select('id,nombre,categoria_id,descripción,especificaciones,precio,precio_descuento,stock,imagen_principal,imágenes_adicionales,modelo,marca,garantía_meses,activo,destacado,created_at,updated_at')

// Si existe una categoría, limita la consulta a sus productos.
// Si no hay resultados, se utiliza un arreglo vacío.    
    if (categoria) query = query.eq('categoria_id', categoria)
    
    const { data } = await query
    setProductos(data || [])
    setCargando(false)
  }

  return { productos, cargando }
}