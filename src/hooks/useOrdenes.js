// ============================================================
// HOOK DE ÓRDENES
// Obtiene las órdenes del usuario autenticado desde Supabase
// y permite volver a cargar la información cuando sea necesario.
// ============================================================
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from './useAuth'

// Hook encargado de consultar y administrar las órdenes
// pertenecientes al usuario autenticado.
export const useOrdenes = () => {

// Obtiene el usuario actual y mantiene el estado de sus órdenes
// junto con el indicador de carga.  
  const { usuario } = useAuth()
  const [ordenes, setOrdenes] = useState([])
  const [cargando, setCargando] = useState(false)

// Carga las órdenes cuando existe un usuario autenticado
// o cuando cambia el usuario actual.  
  useEffect(() => {
    if (usuario) {
      cargarOrdenes()
    }
  }, [usuario])

// Consulta las órdenes del usuario actual y las ordena
// desde la más reciente hasta la más antigua.  
  const cargarOrdenes = async () => {
    setCargando(true)
    const { data } = await supabase
      .from('ordenes')
      .select('id,usuario_id,email,items,subtotal,impuestos,envío,total,estado,método_pago,dirección_envío,ciudad_envío,teléfono_contacto,notas,tracking_code,created_at,updated_at,nombre_cliente,apellido_cliente,referencia,moneda,numero_orden,empleado_id,motivo_cancelacion,cupon_codigo,descuento,tipo_orden')
      .eq('usuario_id', usuario.id)
      .order('created_at', { ascending: false })
 
// Guardamos las órdenes obtenidas y exponemos la función
// para volver a consultar los datos cuando sea necesario.      
    setOrdenes(data || [])
    setCargando(false)
  }

  return { ordenes, cargando, refetch: cargarOrdenes }
}