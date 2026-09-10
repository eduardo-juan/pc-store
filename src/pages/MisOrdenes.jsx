import { useEffect, useState } from 'react'
import { Package } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../hooks/useAuth'

export default function MisOrdenes() {
  const { usuario } = useAuth()

  const [ordenes, setOrdenes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [cancelandoId, setCancelandoId] = useState(null)

  const ESTADOS_CANCELABLES = [
    'pendiente',
    'pagada',
  ]

  useEffect(() => {
    if (usuario) {
      cargarOrdenes()
    } else {
      setCargando(false)
    }
  }, [usuario])

  const cargarOrdenes = async () => {
    if (!usuario) return

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

  const cancelarOrden = async (ordenId) => {
    const confirmar = window.confirm(
      '¿Seguro que deseas cancelar esta orden? Esta acción no se puede deshacer y el stock será restaurado.'
    )

    if (!confirmar) return

    setCancelandoId(ordenId)
    setError('')

    const { error } = await supabase.rpc(
      'cancelar_orden_pc_store',
      {
        p_orden_id: ordenId,
      }
    )

    setCancelandoId(null)

    if (error) {
      setError(error.message)
      return
    }

    await cargarOrdenes()
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

            <h1>
              Mis órdenes
            </h1>

            <p>
              Consulta tus compras, datos de entrega,
              costos y estado.
            </p>
          </div>
        </div>

        {error && (
          <div className="pc-alert pc-alert-error">
            {error}
          </div>
        )}

        <div className="pc-order-list">

          {ordenes.map((orden) => {
            const subtotal =
              Number(orden.subtotal || 0)

            const envio =
              Number(orden.envío || 0)

            const total =
              Number(orden.total || 0)

            return (
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
                      L {total.toFixed(2)}
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
                    {orden.created_at
                      ? new Date(
                          orden.created_at
                        ).toLocaleString()
                      : '-'}
                  </span>

                  <span>
                    Pago:{' '}
                    {orden.método_pago || '-'}
                  </span>
                </div>

                <div
                  className="pc-order-shipping"
                  style={{
                    marginTop: '14px',
                    padding: '14px',
                    borderRadius: '10px',
                    background:
                      'rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                    fontSize: '14px',
                  }}
                >
                  <strong>
                    Datos de entrega
                  </strong>

                  <span>
                    Receptor:{' '}
                    {orden.nombre_cliente || '-'}{' '}
                    {orden.apellido_cliente || ''}
                  </span>

                  <span>
                    Teléfono:{' '}
                    {orden.teléfono_contacto || '-'}
                  </span>

                  <span>
                    Dirección:{' '}
                    {orden.dirección_envío || '-'}
                  </span>

                  <span>
                    Ciudad:{' '}
                    {orden.ciudad_envío || '-'}
                  </span>

                  {orden.referencia && (
                    <span>
                      Referencia:{' '}
                      {orden.referencia}
                    </span>
                  )}

                  {orden.notas && (
                    <span>
                      Notas:{' '}
                      {orden.notas}
                    </span>
                  )}
                </div>

                <div className="pc-order-items">
                  {(orden.items || []).map(
                    (item, index) => (
                      <div
                        key={`${orden.id}-${item.producto_id || index}`}
                      >
                        <span>
                          {item.cantidad} ×{' '}
                          {item.nombre}
                        </span>

                        <strong>
                          L{' '}
                          {Number(
                            item.subtotal || 0
                          ).toFixed(2)}
                        </strong>
                      </div>
                    )
                  )}
                </div>

                <div
                  style={{
                    marginTop: '16px',
                    paddingTop: '14px',
                    borderTop:
                      '1px solid #e5e5e5',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '7px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      fontSize: '14px',
                      color: '#555',
                    }}
                  >
                    <span>
                      Subtotal
                    </span>

                    <strong>
                      L {subtotal.toFixed(2)}
                    </strong>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      fontSize: '14px',
                      color: '#555',
                    }}
                  >
                    <span>
                      Envío
                    </span>

                    <strong>
                      L {envio.toFixed(2)}
                    </strong>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      marginTop: '4px',
                      paddingTop: '9px',
                      borderTop:
                        '1px solid #e5e5e5',
                      fontSize: '17px',
                    }}
                  >
                    <strong>
                      Total
                    </strong>

                    <strong>
                      L {total.toFixed(2)}
                    </strong>
                  </div>
                </div>

                {ESTADOS_CANCELABLES.includes(
                  orden.estado
                ) && (
                  <div
                    style={{
                      marginTop: 16,
                    }}
                  >
                    <button
                      type="button"
                      className="pc-btn pc-btn-danger"
                      disabled={
                        cancelandoId ===
                        orden.id
                      }
                      onClick={() =>
                        cancelarOrden(
                          orden.id
                        )
                      }
                    >
                      {cancelandoId ===
                      orden.id
                        ? 'Cancelando...'
                        : 'Cancelar orden'}
                    </button>
                  </div>
                )}

              </article>
            )
          })}

          {ordenes.length === 0 && (
            <div className="pc-empty">

              <div className="pc-empty-icon">
                <Package
                  size={48}
                  strokeWidth={1.5}
                />
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