import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  BarChart3,
  Tags,
  FileText,
  Users,
  TrendingUp,
} from 'lucide-react'
import { supabase } from '../../supabaseClient'
import { useAuth } from '../../hooks/useAuth'

export default function AdminDashboard() {
  const { perfil } = useAuth()

  const [metricas, setMetricas] = useState({
    productos: 0,
    usuarios: 0,
    ordenes: 0,
    ventas: 0,
    bajoStock: 0,
  })

  useEffect(() => {
    cargarMetricas()
  }, [])

  const cargarMetricas = async () => {
    const [
      productosResult,
      usuariosResult,
      ordenesResult,
      bajoStockResult,
    ] = await Promise.all([
      supabase
        .from('productos')
        .select('id', {
          count: 'exact',
          head: true,
        }),

      supabase
        .from('usuarios')
        .select('id', {
          count: 'exact',
          head: true,
        }),

      supabase
        .from('ordenes')
        .select('id, total, estado, created_at'),

      supabase
        .from('productos')
        .select('id', {
          count: 'exact',
          head: true,
        })
        .lte('stock', 3)
        .eq('activo', true),
    ])

    const hoy = new Date()

    const inicioHoy = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate()
    )

    const ordenes = ordenesResult.data || []

    const ventasHoy = ordenes
      .filter((orden) => {
        const esPagada = orden.estado === 'pagada'

        const fechaOrden = orden.created_at
          ? new Date(orden.created_at)
          : null

        const esDeHoy =
          fechaOrden && fechaOrden >= inicioHoy

        return esPagada && esDeHoy
      })
      .reduce(
        (total, orden) =>
          total + Number(orden.total || 0),
        0
      )

    setMetricas({
      productos: productosResult.count || 0,
      usuarios: usuariosResult.count || 0,
      ordenes: ordenes.length,
      ventas: ventasHoy,
      bajoStock: bajoStockResult.count || 0,
    })
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
    {
      icono: Users,
      titulo: 'Usuarios',
      ruta: '/admin/usuarios',
    },
    {
      icono: TrendingUp,
      titulo: 'Historial de ventas',
      ruta: '/admin/ventas',
    },
  ]

  return (
    <main className="pc-page">
      <div className="pc-container">

        <div className="pc-page-heading">
          <div>
            <span
              className="pc-kicker"
              style={{ color: '#171717' }}
            >
              Administración
            </span>

            <h1 style={{ color: '#171717' }}>
              Hola, {perfil?.nombre || 'Administrador'}
            </h1>

            <p style={{ color: '#171717' }}>
              Resumen general de PC Store.
            </p>
          </div>
        </div>

        <div className="pc-metrics-grid">

          <article className="pc-card pc-metric">
            <span style={{ color: '#171717' }}>
              Productos
            </span>

            <strong style={{ color: '#171717' }}>
              {metricas.productos}
            </strong>
          </article>

          <article className="pc-card pc-metric">
            <span style={{ color: '#171717' }}>
              Usuarios
            </span>

            <strong style={{ color: '#171717' }}>
              {metricas.usuarios}
            </strong>
          </article>

          <article className="pc-card pc-metric">
            <span style={{ color: '#171717' }}>
              Órdenes
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
              Stock bajo
            </span>

            <strong style={{ color: '#171717' }}>
              {metricas.bajoStock}
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
            ({ icono: Icono, titulo, ruta }) => (
              <Link
                key={ruta}
                to={ruta}
                className="pc-card pc-admin-option"
              >
                <div className="pc-admin-option-icon">
                  <Icono size={30} strokeWidth={2} />
                </div>

                <h3 style={{ color: '#171717' }}>
                  {titulo}
                </h3>

                <p style={{ color: '#171717' }}>
                  Abrir módulo de {titulo.toLowerCase()}.
                </p>
              </Link>
            )
          )}

        </div>

      </div>
    </main>
  )
}
