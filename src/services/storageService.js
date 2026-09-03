import { supabase } from '../supabaseClient'

// Subir imagen a Storage
export const subirImagen = async (bucket, archivo, nombreArchivo) => {
  try {
    // Generar nombre único
    const timestamp = new Date().getTime()
    const nombreUnico = `${timestamp}-${nombreArchivo}`

    // Subir archivo
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .upload(nombreUnico, archivo)

    if (error) throw error

    // Obtener URL pública
    const { data: publicData } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(nombreUnico)

    return {
      success: true,
      url: publicData.publicUrl,
      ruta: data.path
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

// Eliminar imagen
export const eliminarImagen = async (bucket, ruta) => {
  try {
    const { error } = await supabase
      .storage
      .from(bucket)
      .remove([ruta])

    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}