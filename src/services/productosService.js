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

    // Filtrar por categoría
    if (filtros.categoria_id) {
      query = query.eq('categoria_id', filtros.categoria_id)
    }

    // Filtrar por marca
    if (filtros.marca) {
      query = query.eq('marca', filtros.marca)
    }

    // Buscar por nombre
    if (filtros.busqueda) {
      query = query.ilike(
        'nombre',
        `%${filtros.busqueda}%`
      )
    }

    const { data, error } = await query

    if (error) throw error

    return {
      success: true,
      data: data || []
    }

  } catch (error) {
    return {
      success: false,
      error: error.message
    }
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

    return {
      success: true,
      data
    }

  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}


// ==========================================
// CREAR PRODUCTO - SOLO ADMIN
// ==========================================
export const crearProducto = async (producto) => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .insert([producto])
      .select()

    if (error) throw error

    return {
      success: true,
      data: data?.[0] || null
    }

  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}


// ==========================================
// ACTUALIZAR PRODUCTO - SOLO ADMIN
// ==========================================
export const actualizarProducto = async (id, cambios) => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .update(cambios)
      .eq('id', id)
      .select()

    if (error) throw error

    return {
      success: true,
      data: data?.[0] || null
    }

  } catch (error) {
    return {
      success: false,
      error: error.message
    }
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

    return {
      success: true
    }

  } catch (error) {
    return {
      success: false,
      error: error.message
    }
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

    return {
      success: true,
      data: data || []
    }

  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}