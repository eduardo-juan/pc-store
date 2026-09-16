import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import HomePublico from './HomePublico'
import HomeUsuario from './HomeUsuario'

export default function Inicio() {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const comprobarSesion = async () => {
      const { data } = await supabase.auth.getUser()

      setUsuario(data.user || null)
      setCargando(false)
    }

    comprobarSesion()

    const {
      data: listener,
    } = supabase.auth.onAuthStateChange(
      (_evento, sesion) => {
        setUsuario(sesion?.user || null)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  if (cargando) {
    return (
      <div style={{ padding: 40 }}>
        Cargando inicio...
      </div>
    )
  }

  return usuario ? (
    <HomeUsuario usuario={usuario} />
  ) : (
    <HomePublico />
  )
}