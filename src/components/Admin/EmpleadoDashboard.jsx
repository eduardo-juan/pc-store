import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  BarChart3,
  Tags,
  FileText,
} from 'lucide-react'
import { supabase } from '../../supabaseClient'
import { useAuth } from '../../hooks/useAuth'
import BotonAtras from '../../components/BotonAtras'

export default function EmpleadoDashboard() {
  const { usuario, perfil } = useAuth()

  const [metricas, setMetricas] = useState({
    ordenes: 0,
    ventas: 0,
    pendientes: 0,
    pagadas: 0,
    enviadas: 0,
    entregadas: 0,
  })

  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (usuario?.id) {
      cargarMetricas()
    }
  }, [usuario?.id])

  const cargarMetricas = async () => {
    setCargando(true)
    setError('')

    if (!usuario?.id) {
      setCargando(false)
      return
    }

    const hoy = new Date()

    const inicioHoy = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate()
    )

    const finHoy = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate() + 1
    )

    const { data, error } = await supabase
      .from('ordenes')
      .select(
        'id, total, estado, empleado_id, created_at'
      )
      .eq('empleado_id', usuario.id)
      .gte(
        'created_at',
        inicioHoy.toISOString()
      )
      .lt(
        'created_at',
        finHoy.toISOString()
      )
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      setError(error.message)
      setCargando(false)
      return
    }

    const ordenes = data || []

    const ventasHoy = ordenes
      .filter(
        (orden) =>
          orden.estado === 'pagada'
      )
      .reduce(
        (total, orden) =>
          total + Number(orden.total || 0),
        0
      )

    setMetricas({
      ordenes: ordenes.length,
      ventas: ventasHoy,

      pendientes: ordenes.filter(
        (orden) =>
          orden.estado === 'pendiente'
      ).length,

      pagadas: ordenes.filter(
        (orden) =>
          orden.estado === 'pagada'
      ).length,

      enviadas: ordenes.filter(
        (orden) =>
          orden.estado === 'enviada'
      ).length,

      entregadas: ordenes.filter(
        (orden) =>
          orden.estado === 'entregada'
      ).length,
    })

    setCargando(false)
  }

  const opciones = [
    {
      icono: Package,
      titulo: 'Productos',
      ruta: '/admin/productos',
    },
    {
      icono: BarChart3,
      titulo: 'Inventario',
      ruta: '/admin/inventario',
    },
    {
      icono: Tags,
      titulo: 'Categorías',
      ruta: '/admin/categorias',
    },
    {
      icono: FileText,
      titulo: 'Órdenes',
      ruta: '/admin/ordenes',
    },
  ]

  if (cargando) {
    return (
      <main className="pc-page">
        <div className="pc-container">
          <BotonAtras />

          <div className="pc-loading">
            <div className="pc-loader" />
            <p>Cargando información...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="pc-page">
      <div className="pc-container">
        <BotonAtras />

        <div className="pc-page-heading">
          <div>
            <span
              className="pc-kicker"
              style={{ color: '#171717' }}
            >
              Panel de empleado
            </span>

            <h1 style={{ color: '#171717' }}>
              Hola,{' '}
              {perfil?.nombre || 'Empleado'}
            </h1>

            <p style={{ color: '#171717' }}>
              Resumen de tu actividad de hoy.
            </p>
          </div>
        </div>

        {error && (
          <div
            className="pc-card"
            style={{
              padding: 16,
              marginBottom: 20,
              color: '#dc2626',
            }}
          >
            {error}
          </div>
        )}

        <div className="pc-metrics-grid">
          <article className="pc-card pc-metric">
            <span style={{ color: '#171717' }}>
              Órdenes gestionadas
            </span>

            <strong style={{ color: '#171717' }}>
              {metricas.ordenes}
            </strong>
          </article>

          <article className="pc-card pc-metric">
            <span style={{ color: '#171717' }}>
              Ventas de hoy
            </span>

            <strong style={{ color: '#171717' }}>
              L {metricas.ventas.toFixed(2)}
            </strong>
          </article>

          <article className="pc-card pc-metric">
            <span style={{ color: '#171717' }}>
              Pendientes
            </span>

            <strong style={{ color: '#171717' }}>
              {metricas.pendientes}
            </strong>
          </article>

          <article className="pc-card pc-metric">
            <span style={{ color: '#171717' }}>
              Pagadas
            </span>

            <strong style={{ color: '#171717' }}>
              {metricas.pagadas}
            </strong>
          </article>

          <article className="pc-card pc-metric">
            <span style={{ color: '#171717' }}>
              Entregadas
            </span>

            <strong style={{ color: '#171717' }}>
              {metricas.entregadas}
            </strong>
          </article>
        </div>

        <h2
          className="pc-section-title"
          style={{ color: '#171717' }}
        >
          Gestión
        </h2>

        <div className="pc-admin-grid">
          {opciones.map(
            ({
              icono: Icono,
              titulo,
              ruta,
            }) => (
              <Link
                key={ruta}
                to={ruta}
                className="pc-card pc-admin-option"
              >
                <div className="pc-admin-option-icon">
                  <Icono
                    size={30}
                    strokeWidth={2}
                  />
                </div>

                <h3 style={{ color: '#171717' }}>
                  {titulo}
                </h3>

                <p style={{ color: '#171717' }}>
                  Abrir módulo de{' '}
                  {titulo.toLowerCase()}.
                </p>
              </Link>
            )
          )}
        </div>
      </div>
    </main>
  )
}