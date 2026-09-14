import { supabase } from '../supabaseClient'

// ==========================================
// OBTENER TODOS LOS PRODUCTOS
// ==========================================
export const obtenerProductos = async (filtros = {}) => {
  try {
    let query = supabase
      .from('productos')
      .select('*, categorias(nombre)')
      .eq('activo', true)

    if (filtros.categoria_id) {
      query = query.eq('categoria_id', filtros.categoria_id)
    }

    if (filtros.marca) {
      query = query.eq('marca', filtros.marca)
    }

    if (filtros.busqueda) {
      query = query.ilike('nombre', `%${filtros.busqueda}%`)
    }

    const { data, error } = await query
    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ==========================================
// OBTENER UN PRODUCTO
// ==========================================
export const obtenerProducto = async (id) => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*, categorias(nombre), reseñas(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ==========================================
// PROVEEDOR DROPSHIPPING - SOLO ADMIN
// ==========================================
export const obtenerProveedorProducto = async (productoId) => {
  try {
    const { data, error } = await supabase
      .from('producto_proveedores')
      .select('*')
      .eq('producto_id', productoId)
      .maybeSingle()

    if (error) throw error
    return { success: true, data: data || null }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const guardarProveedorProducto = async (productoId, proveedor) => {
  try {
    const { data, error } = await supabase
      .from('producto_proveedores')
      .upsert(
        [{ producto_id: productoId, ...proveedor }],
        { onConflict: 'producto_id' }
      )
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const eliminarProveedorProducto = async (productoId) => {
  try {
    const { error } = await supabase
      .from('producto_proveedores')
      .delete()
      .eq('producto_id', productoId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ==========================================
// CREAR PRODUCTO - SOLO STAFF
// ==========================================
export const crearProducto = async (producto) => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .insert([producto])
      .select()

    if (error) throw error
    return { success: true, data: data?.[0] || null }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ==========================================
// ACTUALIZAR PRODUCTO - SOLO STAFF
// ==========================================
export const actualizarProducto = async (id, cambios) => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .update(cambios)
      .eq('id', id)
      .select()

    if (error) throw error
    return { success: true, data: data?.[0] || null }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ==========================================
// ELIMINAR PRODUCTO - SOLO ADMIN
// ==========================================
export const eliminarProducto = async (id) => {
  try {
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ==========================================
// OBTENER CATEGORÍAS
// ==========================================
export const obtenerCategorias = async () => {
  try {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('nombre')

    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error.message }
  }
}