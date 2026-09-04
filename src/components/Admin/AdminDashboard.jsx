import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
        .select('id, total, estado'),

      supabase
        .from('productos')
        .select('id', {
          count: 'exact',
          head: true,
        })
        .lte('stock', 3)
        .eq('activo', true),

    ])


    const ordenes = ordenesResult.data || []

    const ventas = ordenes
      .filter(
        (orden) =>
          orden.estado !== 'cancelada'
      )
      .reduce(
        (total, orden) =>
          total + Number(orden.total || 0),
        0
      )


    setMetricas({
      productos: productosResult.count || 0,
      usuarios: usuariosResult.count || 0,
      ordenes: ordenes.length,
      ventas,
      bajoStock: bajoStockResult.count || 0,
    })
  }


  const opciones = [
    ['📦', 'Productos', '/admin/productos'],
    ['📊', 'Inventario', '/admin/inventario'],
    ['🏷️', 'Categorías', '/admin/categorias'],
    ['🧾', 'Órdenes', '/admin/ordenes'],
    ['👥', 'Usuarios', '/admin/usuarios'],
  ]


  return (
    <main className="pc-page">

      <div className="pc-container">

        <div className="pc-page-heading">
          <div>
            <span className="pc-kicker">
              Administración
            </span>

            <h1>
              Hola, {perfil?.nombre || 'Administrador'}
            </h1>

            <p>
              Resumen general de PC Store.
            </p>
          </div>
        </div>


        <div className="pc-metrics-grid">

          <article className="pc-card pc-metric">
            <span>Productos</span>
            <strong>{metricas.productos}</strong>
          </article>

          <article className="pc-card pc-metric">
            <span>Usuarios</span>
            <strong>{metricas.usuarios}</strong>
          </article>

          <article className="pc-card pc-metric">
            <span>Órdenes</span>
            <strong>{metricas.ordenes}</strong>
          </article>

          <article className="pc-card pc-metric">
            <span>Ventas registradas</span>
            <strong>
              L {metricas.ventas.toFixed(2)}
            </strong>
          </article>

          <article className="pc-card pc-metric">
            <span>Stock bajo</span>
            <strong>{metricas.bajoStock}</strong>
          </article>

        </div>


        <h2 className="pc-section-title">
          Gestión
        </h2>


        <div className="pc-admin-grid">

          {opciones.map(
            ([icono, titulo, ruta]) => (
              <Link
                key={ruta}
                to={ruta}
                className="pc-card pc-admin-option"
              >
                <div className="pc-admin-option-icon">
                  {icono}
                </div>

                <h3>{titulo}</h3>

                <p>
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