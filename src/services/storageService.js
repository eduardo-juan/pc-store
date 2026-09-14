import { supabase } from '../supabaseClient'

// Convierte una imagen con fondo blanco/claro a PNG con transparencia.
// Se usa un umbral suave para conservar el producto y eliminar el fondo.
const convertirAPngTransparente = (archivo) => new Promise((resolve, reject) => {
  const lector = new FileReader()

  lector.onload = () => {
    const imagen = new Image()

    imagen.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = imagen.naturalWidth
      canvas.height = imagen.naturalHeight
      const contexto = canvas.getContext('2d', { willReadFrequently: true })
      contexto.drawImage(imagen, 0, 0)

      const datos = contexto.getImageData(0, 0, canvas.width, canvas.height)
      const pixeles = datos.data

      // Color de referencia tomado de las esquinas para detectar fondos claros.
      const esquinas = [
        0,
        (canvas.width - 1) * 4,
        (canvas.height - 1) * canvas.width * 4,
        ((canvas.height * canvas.width) - 1) * 4,
      ]
      const fondo = esquinas.reduce((acumulado, indice) => {
        acumulado.r += pixeles[indice]
        acumulado.g += pixeles[indice + 1]
        acumulado.b += pixeles[indice + 2]
        return acumulado
      }, { r: 0, g: 0, b: 0 })

      fondo.r /= esquinas.length
      fondo.g /= esquinas.length
      fondo.b /= esquinas.length

      const esFondoClaro = fondo.r > 210 && fondo.g > 210 && fondo.b > 210

      if (esFondoClaro) {
        for (let i = 0; i < pixeles.length; i += 4) {
          const diferencia = Math.sqrt(
            ((pixeles[i] - fondo.r) ** 2) +
            ((pixeles[i + 1] - fondo.g) ** 2) +
            ((pixeles[i + 2] - fondo.b) ** 2)
          )

          // Transparencia progresiva para bordes suaves.
          if (diferencia < 28) {
            pixeles[i + 3] = 0
          } else if (diferencia < 55) {
            pixeles[i + 3] = Math.round(((diferencia - 28) / 27) * pixeles[i + 3])
          }
        }
        contexto.putImageData(datos, 0, 0)
      }

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('No se pudo preparar la imagen.'))
          return
        }
        resolve(new File([blob], `${archivo.name.replace(/\.[^.]+$/, '')}.png`, {
          type: 'image/png',
          lastModified: Date.now(),
        }))
      }, 'image/png')
    }

    imagen.onerror = () => reject(new Error('La imagen no pudo procesarse.'))
    imagen.src = lector.result
  }

  lector.onerror = () => reject(new Error('No se pudo leer la imagen.'))
  lector.readAsDataURL(archivo)
})

const limpiarSegmento = (valor) => String(valor || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '') || 'sin-categoria'

// Subir imagen a Storage dentro de la carpeta de su categoría.
export const subirImagen = async (bucket, archivo, nombreArchivo, carpeta = 'productos') => {
  try {
    if (!archivo) throw new Error('Selecciona una imagen.')
    if (!archivo.type?.startsWith('image/')) throw new Error('El archivo debe ser una imagen.')
    if (archivo.size > 10 * 1024 * 1024) throw new Error('La imagen no puede superar 10 MB.')

    const imagenProcesada = await convertirAPngTransparente(archivo)
    const nombreSeguro = limpiarSegmento(nombreArchivo).slice(0, 80)
    const ruta = `${limpiarSegmento(carpeta)}/${crypto.randomUUID()}-${nombreSeguro}.png`

    const { data, error } = await supabase
      .storage
      .from(bucket)
      .upload(ruta, imagenProcesada, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false,
      })

    if (error) throw error

    const { data: publicData } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(data.path)

    return {
      success: true,
      url: publicData.publicUrl,
      ruta: data.path,
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'No se pudo subir la imagen.',
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