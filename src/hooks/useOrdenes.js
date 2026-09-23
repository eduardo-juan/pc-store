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
      .select('id,usuario_id,email,items,subtotal,impuestos,envío,total,estado,método_pago,dirección_envío,ciudad_envío,teléfono_contacto,notas,tracking_code,created_at,updated_at,nombre_cliente,apellido_cliente,referencia,moneda,numero_orden,empleado_id,motivo_cancelacion,cupon_codigo,descuento,tipo_orden')
      .eq('usuario_id', usuario.id)
      .order('created_at', { ascending: false })
    setOrdenes(data || [])
    setCargando(false)
  }

  return { ordenes, cargando, refetch: cargarOrdenes }
}