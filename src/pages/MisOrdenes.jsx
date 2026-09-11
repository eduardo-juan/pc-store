import { useEffect, useState } from 'react'
import { Package } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../hooks/useAuth'
import BotonAtras from '../components/BotonAtras'

const ORDENES_POR_PAGINA = 10

export default function MisOrdenes() {
  const { usuario } = useAuth()

  const [ordenes, setOrdenes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [cancelandoId, setCancelandoId] = useState(null)
  const [filtro, setFiltro] = useState('todas')
  const [pagina, setPagina] = useState(1)

  const ESTADOS_CANCELABLES = ['pendiente']

  useEffect(() => {
    if (usuario) {
      cargarOrdenes()
    } else {
      setCargando(false)
    }
  }, [usuario])

  useEffect(() => {
    setPagina(1)
  }, [filtro])

  const cargarOrdenes = async () => {
    if (!usuario) return

    setCargando(true)
    setError('')

    try {
      const { data: ordenesData, error: ordenesError } =
        await supabase
          .from('ordenes')
          .select('*')
          .eq('usuario_id', usuario.id)
          .order('created_at', {
            ascending: false,
          })

      if (ordenesError) {
        throw ordenesError
      }

      const listaOrdenes = ordenesData || []

      const empleadosIds = [
        ...new Set(
          listaOrdenes
            .map((orden) => orden.empleado_id)
            .filter(Boolean)
        ),
      ]

      let empleados = []

      if (empleadosIds.length > 0) {
        const {
          data: empleadosData,
          error: empleadosError,
        } = await supabase
          .from('usuarios')
          .select('id, nombre, apellido, teléfono')
          .in('id', empleadosIds)

        if (empleadosError) {
          console.warn(
            '[MIS ORDENES] No se pudieron cargar los empleados:',
            empleadosError
          )
        } else {
          empleados = empleadosData || []
        }
      }

      const empleadosMap = new Map(
        empleados.map((empleado) => [
          empleado.id,
          empleado,
        ])
      )

      const ordenesConEmpleado = listaOrdenes.map((orden) => ({
        ...orden,
        empleado: orden.empleado_id
          ? empleadosMap.get(orden.empleado_id) || null
          : null,
      }))

      setOrdenes(ordenesConEmpleado)
    } catch (err) {
      console.error('[MIS ORDENES] Error:', err)

      setError(
        err?.message ||
          'No se pudieron cargar tus órdenes.'
      )

      setOrdenes([])
    } finally {
      setCargando(false)
    }
  }

  const cancelarOrden = async (ordenId) => {
    const orden = ordenes.find(
      (item) => item.id === ordenId
    )

    if (!orden || orden.estado !== 'pendiente') {
      setError('Esta orden ya no puede ser cancelada.')
      return
    }

    const confirmar = window.confirm(
      '¿Seguro que deseas cancelar esta orden? Esta acción no se puede deshacer y el stock será restaurado.'
    )

    if (!confirmar) return

    setCancelandoId(ordenId)
    setError('')

    const { error: cancelacionError } =
      await supabase.rpc(
        'cancelar_orden_pc_store',
        {
          p_orden_id: ordenId,
        }
      )

    setCancelandoId(null)

    if (cancelacionError) {
      setError(cancelacionError.message)
      return
    }

    await cargarOrdenes()
  }

  const ordenesFiltradas = ordenes.filter((orden) => {
    if (filtro === 'todas') {
      return true
    }

    if (filtro === 'activas') {
      return ['pendiente', 'enviada'].includes(
        orden.estado
      )
    }

    if (filtro === 'completadas') {
      return ['pagada', 'entregada'].includes(
        orden.estado
      )
    }

    if (filtro === 'canceladas') {
      return orden.estado === 'cancelada'
    }

    return true
  })

  const totalPaginas = Math.max(
    1,
    Math.ceil(
      ordenesFiltradas.length /
        ORDENES_POR_PAGINA
    )
  )

  const paginaActual = Math.min(
    pagina,
    totalPaginas
  )

  const inicio =
    (paginaActual - 1) *
    ORDENES_POR_PAGINA

  const ordenesPagina = ordenesFiltradas.slice(
    inicio,
    inicio + ORDENES_POR_PAGINA
  )

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

        <BotonAtras />

        <div className="pc-page-heading">
          <div>
            <span className="pc-kicker">
              Mi cuenta
            </span>

            <h1>Mis órdenes</h1>

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

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '20px',
          }}
        >
          <button
            type="button"
            className={
              filtro === 'todas'
                ? 'pc-btn pc-btn-primary'
                : 'pc-btn pc-btn-light'
            }
            onClick={() => setFiltro('todas')}
          >
            Todas
          </button>

          <button
            type="button"
            className={
              filtro === 'activas'
                ? 'pc-btn pc-btn-primary'
                : 'pc-btn pc-btn-light'
            }
            onClick={() => setFiltro('activas')}
          >
            Activas
          </button>

          <button
            type="button"
            className={
              filtro === 'completadas'
                ? 'pc-btn pc-btn-primary'
                : 'pc-btn pc-btn-light'
            }
            onClick={() => setFiltro('completadas')}
          >
            Completadas
          </button>

          <button
            type="button"
            className={
              filtro === 'canceladas'
                ? 'pc-btn pc-btn-primary'
                : 'pc-btn pc-btn-light'
            }
            onClick={() => setFiltro('canceladas')}
          >
            Canceladas
          </button>
        </div>

        <div className="pc-order-list">

          {ordenesPagina.map((orden) => {
            const subtotal = Number(
              orden.subtotal || 0
            )

            const envio = Number(
              orden.envío || 0
            )

            const total = Number(
              orden.total || 0
            )

            const puedeCancelar =
              ESTADOS_CANCELABLES.includes(
                orden.estado
              )

            const empleado = orden.empleado

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

                  {empleado ? (
                    <>
                      <span
                        style={{
                          marginTop: '3px',
                          fontWeight: 600,
                        }}
                      >
                        Empleado encargado:{' '}
                        {empleado.nombre || ''}{' '}
                        {empleado.apellido || ''}
                      </span>

                      {empleado.teléfono && (
                        <span>
                          Teléfono del empleado:{' '}
                          {empleado.teléfono}
                        </span>
                      )}
                    </>
                  ) : (
                    <span
                      style={{
                        color: '#777',
                      }}
                    >
                      Empleado encargado: Pendiente de
                      asignación
                    </span>
                  )}

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
                    <span>Subtotal</span>

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
                    <span>Envío</span>

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
                    <strong>Total</strong>

                    <strong>
                      L {total.toFixed(2)}
                    </strong>
                  </div>
                </div>

                {puedeCancelar && (
                  <div
                    style={{
                      marginTop: 16,
                    }}
                  >
                    <button
                      type="button"
                      className="pc-btn pc-btn-danger"
                      disabled={
                        cancelandoId === orden.id
                      }
                      onClick={() =>
                        cancelarOrden(orden.id)
                      }
                    >
                      {cancelandoId === orden.id
                        ? 'Cancelando...'
                        : 'Cancelar orden'}
                    </button>
                  </div>
                )}

              </article>
            )
          })}

          {ordenesFiltradas.length === 0 && (
            <div className="pc-empty">
              <div className="pc-empty-icon">
                <Package
                  size={48}
                  strokeWidth={1.5}
                />
              </div>

              <h2>
                {filtro === 'todas'
                  ? 'Todavía no tienes órdenes'
                  : 'No hay órdenes en esta categoría'}
              </h2>
            </div>
          )}

        </div>

        {ordenesFiltradas.length > 0 &&
          totalPaginas > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '12px',
                marginTop: '28px',
              }}
            >
              <button
                type="button"
                className="pc-btn pc-btn-light"
                disabled={paginaActual === 1}
                onClick={() =>
                  setPagina((valor) =>
                    Math.max(1, valor - 1)
                  )
                }
              >
                Anterior
              </button>

              <span
                style={{
                  fontWeight: 600,
                }}
              >
                Página {paginaActual} de{' '}
                {totalPaginas}
              </span>

              <button
                type="button"
                className="pc-btn pc-btn-light"
                disabled={
                  paginaActual === totalPaginas
                }
                onClick={() =>
                  setPagina((valor) =>
                    Math.min(
                      totalPaginas,
                      valor + 1
                    )
                  )
                }
              >
                Siguiente
              </button>
            </div>
          )}

      </div>
    </main>
  )
}