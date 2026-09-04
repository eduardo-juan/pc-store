import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../hooks/useAuth'

export default function MisOrdenes() {

  const { usuario } = useAuth()

  const [ordenes, setOrdenes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (usuario) {
      cargarOrdenes()
    }
  }, [usuario])

  const cargarOrdenes = async () => {

    setCargando(true)
    setError('')

    const { data, error } = await supabase
      .from('ordenes')
      .select('*')
      .eq('usuario_id', usuario.id)
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      setError(error.message)
      setCargando(false)
      return
    }

    setOrdenes(data || [])
    setCargando(false)
  }

  if (cargando) {
    return (
      <main className="pc-page">
        <div className="pc-container">
          <div className="pc-loader" />
        </div>
      </main>
    )
  }

  return (
    <main className="pc-page">

      <div className="pc-container">

        <div className="pc-page-heading">
          <div>
            <span className="pc-kicker">
              Mi cuenta
            </span>

            <h1>Mis órdenes</h1>

            <p>
              Consulta tus compras y su estado.
            </p>
          </div>
        </div>

        {error && (
          <div className="pc-alert pc-alert-error">
            {error}
          </div>
        )}

        <div className="pc-order-list">

          {ordenes.map((orden) => (

            <article
              className="pc-card pc-order-card"
              key={orden.id}
            >

              <div className="pc-order-head">

                <div>
                  <span className="pc-kicker">
                    {orden.numero_orden ||
                      `Orden #${orden.id}`}
                  </span>

                  <h3>
                    L {Number(orden.total).toFixed(2)}
                  </h3>
                </div>

                <span
                  className={`pc-status pc-status-${orden.estado}`}
                >
                  {orden.estado}
                </span>

              </div>

              <div className="pc-order-meta">

                <span>
                  {new Date(
                    orden.created_at
                  ).toLocaleString()}
                </span>

                <span>
                  Pago: {orden.método_pago}
                </span>

              </div>

              <div className="pc-order-items">

                {(orden.items || []).map(
                  (item, index) => (

                    <div key={index}>

                      <span>
                        {item.cantidad} × {item.nombre}
                      </span>

                      <strong>
                        L {Number(item.subtotal).toFixed(2)}
                      </strong>

                    </div>

                  )
                )}

              </div>

            </article>

          ))}

          {ordenes.length === 0 && (
            <div className="pc-empty">

              <div className="pc-empty-icon">
                📦
              </div>

              <h2>
                Todavía no tienes órdenes
              </h2>

            </div>
          )}

        </div>

      </div>

    </main>
  )
}