// ============================================================
// PÁGINA DE INICIO
// Decide qué portada mostrar según exista una sesión de Supabase.
// También escucha cambios de autenticación para actualizar la vista
// sin recargar la aplicación.
// ============================================================
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import HomePublico from './HomePublico'
import HomeUsuario from './HomeUsuario'
import CuponesPromocion from '../components/CuponesPromocion'

export default function Inicio() {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    // Consulta la sesión actual al entrar a la página.
    const comprobarSesion = async () => {
      const { data } = await supabase.auth.getUser()
      setUsuario(data.user || null)
      setCargando(false)
    }

    comprobarSesion()

    // Mantiene la portada sincronizada cuando el usuario inicia o cierra sesión.
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_evento, sesion) => setUsuario(sesion?.user || null)
    )

    // Libera el listener al desmontar la página para evitar suscripciones acumuladas.
    return () => listener.subscription.unsubscribe()
  }, [])

  if (cargando) {
    return <div style={{ padding: 40 }}>Cargando inicio...</div>
  }

  // Usuarios autenticados reciben la portada personalizada; visitantes reciben la pública.
  return usuario ? (
    <>
      <HomeUsuario usuario={usuario} />
      <CuponesPromocion />
    </>
  ) : (
    <>
      <HomePublico />
      <CuponesPromocion />
    </>
  )
}
