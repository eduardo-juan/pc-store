import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import { useAuth } from '../../hooks/useAuth'
import BotonAtras from '../../components/BotonAtras'

const ORDENES_POR_PAGINA = 10

export default function GestionOrdenes() {
  const { usuario, esAdmin, esEmpleado } = useAuth()

  const [ordenes, setOrdenes] = useState([])
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState('todas')
  const [pagina, setPagina] = useState(1)

  useEffect(() => {
    cargarOrdenes()
  }, [usuario, esAdmin, esEmpleado])

  useEffect(() => {
    setPagina(1)
  }, [filtro])

  const cargarOrdenes = async () => {
    setError('')

    if (esEmpleado && !usuario?.id) {
      setError('No se pudo identificar al empleado actual.')
      setCargando(false)
      return
    }

    setCargando(true)

    let consulta = supabase
      .from('ordenes')
      .select('*')
      .order('created_at', {
        ascending: false,
      })

    if (esEmpleado && !esAdmin) {
      consulta = consulta.eq('empleado_id', usuario.id)
    }

    const { data, error } = await consulta

    if (error) {
      setError(error.message)
      setCargando(false)
      return
    }

    setOrdenes(data || [])
    setCargando(false)
  }

  const cambiarEstado = async (id, nuevoEstado) => {
    setError('')

    const orden = ordenes.find(
      (item) => item.id === id
    )

    if (!orden) {
      setError('No se encontró la orden.')
      return
    }

    const estadoActual =
      orden.estado || 'pendiente'

    if (estadoActual === 'cancelada') {
      setError(
        'Una orden cancelada no puede modificarse.'
      )
      return
    }

    if (nuevoEstado === 'cancelada') {
      if (!esAdmin) {
        setError(
          'Solo el administrador puede cancelar órdenes.'
        )
        return
      }

      const confirmar = window.confirm(
        '¿Estás seguro de que deseas cancelar esta orden? El stock será restaurado.'
      )

      if (!confirmar) return

      const { error } = await supabase.rpc(
        'cancelar_orden_pc_store',
        {
          p_orden_id: id,
        }
      )

      if (error) {
        setError(error.message)
        return
      }

      await cargarOrdenes()
      return
    }

    if (esEmpleado && !usuario?.id) {
      setError(
        'No se pudo identificar al empleado actual.'
      )
      return
    }

    const datosActualizacion = {
      estado: nuevoEstado,
    }

    if (esEmpleado) {
      datosActualizacion.empleado_id =
        usuario.id
    }

    const { error } = await supabase
      .from('ordenes')
      .update(datosActualizacion)
      .eq('id', id)

    if (error) {
      setError(error.message)
      return
    }

    await cargarOrdenes()
  }

  const ordenesFiltradas = ordenes.filter(
    (orden) => {
      if (filtro === 'todas') {
        return true
      }

      if (filtro === 'activas') {
        return [
          'pendiente',
          'pagada',
          'enviada',
        ].includes(orden.estado)
      }

      if (filtro === 'pendientes') {
        return orden.estado === 'pendiente'
      }

      if (filtro === 'pagadas') {
        return orden.estado === 'pagada'
      }

      if (filtro === 'enviadas') {
        return orden.estado === 'enviada'
      }

      if (filtro === 'entregadas') {
        return orden.estado === 'entregada'
      }

      if (filtro === 'canceladas') {
        return orden.estado === 'cancelada'
      }

      return true
    }
  )

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

  const ordenesPagina =
    ordenesFiltradas.slice(
      inicio,
      inicio + ORDENES_POR_PAGINA
    )

  return (
    <main className="pc-page">
      <div className="pc-container">
        <BotonAtras />

        <div className="pc-admin-header">
          <h1>
            Gestión de Órdenes
          </h1>

          <p>
            {esEmpleado
              ? 'Gestiona las órdenes asignadas a ti.'
              : 'Administra todas las compras y consulta los datos de entrega.'}
          </p>
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

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '20px',
          }}
        >
          {[
            ['todas', 'Todas'],
            ['activas', 'Activas'],
            ['pendientes', 'Pendientes'],
            ['pagadas', 'Pagadas'],
            ['enviadas', 'Enviadas'],
            ['entregadas', 'Entregadas'],
            ['canceladas', 'Canceladas'],
          ].map(([valor, texto]) => (
            <button
              key={valor}
              type="button"
              className={
                filtro === valor
                  ? 'pc-btn pc-btn-primary'
                  : 'pc-btn pc-btn-light'
              }
              onClick={() =>
                setFiltro(valor)
              }
            >
              {texto}
            </button>
          ))}
        </div>

        <div className="pc-card pc-table-wrapper">
          <table className="pc-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Datos de entrega</th>
                <th>Productos</th>
                <th>Subtotal</th>
                <th>Envío</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>

            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="9">
                    Cargando órdenes...
                  </td>
                </tr>
              ) : ordenesPagina.length === 0 ? (
                <tr>
                  <td colSpan="9">
                    No hay órdenes para mostrar.
                  </td>
                </tr>
              ) : (
                ordenesPagina.map((orden) => {
                  const subtotal =
                    Number(
                      orden.subtotal || 0
                    )

                  const envio =
                    Number(
                      orden.envío || 0
                    )

                  const total =
                    Number(
                      orden.total || 0
                    )

                  const estadoActual =
                    orden.estado ||
                    'pendiente'

                  const ordenCancelada =
                    estadoActual ===
                    'cancelada'

                  return (
                    <tr key={orden.id}>
                      <td>
                        #{orden.id}
                      </td>

                      <td>
                        <div>
                          <strong>
                            {orden.nombre_cliente}{' '}
                            {orden.apellido_cliente}
                          </strong>

                          <div
                            style={{
                              fontSize: '12px',
                              color: '#666',
                            }}
                          >
                            {orden.email || '-'}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div
                          style={{
                            minWidth: '220px',
                            fontSize: '13px',
                          }}
                        >
                          <strong>
                            Receptor:
                          </strong>{' '}
                          {orden.nombre_cliente}{' '}
                          {orden.apellido_cliente}

                          <br />

                          <strong>
                            Tel:
                          </strong>{' '}
                          {orden.teléfono_contacto ||
                            '-'}

                          <br />

                          <strong>
                            Dirección:
                          </strong>{' '}
                          {orden.dirección_envío ||
                            '-'}

                          <br />

                          <strong>
                            Ciudad:
                          </strong>{' '}
                          {orden.ciudad_envío ||
                            '-'}

                          {orden.referencia && (
                            <>
                              <br />

                              <strong>
                                Referencia:
                              </strong>{' '}
                              {orden.referencia}
                            </>
                          )}

                          {orden.notas && (
                            <>
                              <br />

                              <strong>
                                Notas:
                              </strong>{' '}
                              {orden.notas}
                            </>
                          )}
                        </div>
                      </td>

                      <td>
                        <div
                          style={{
                            fontSize: '12px',
                          }}
                        >
                          {(orden.items || []).map(
                            (item, index) => (
                              <div
                                key={`${orden.id}-${item.producto_id || index}`}
                              >
                                {item.cantidad}×{' '}
                                {item.nombre}
                              </div>
                            )
                          )}
                        </div>
                      </td>

                      <td>
                        <strong>
                          L{' '}
                          {subtotal.toFixed(2)}
                        </strong>
                      </td>

                      <td>
                        <strong>
                          L{' '}
                          {envio.toFixed(2)}
                        </strong>
                      </td>

                      <td>
                        <strong>
                          L{' '}
                          {total.toFixed(2)}
                        </strong>
                      </td>

                      <td>
                        <select
                          className="pc-select"
                          value={
                            estadoActual
                          }
                          disabled={
                            ordenCancelada
                          }
                          onChange={(e) =>
                            cambiarEstado(
                              orden.id,
                              e.target.value
                            )
                          }
                        >
                          <option value="pendiente">
                            Pendiente
                          </option>

                          <option value="pagada">
                            Pagada
                          </option>

                          <option value="enviada">
                            Enviada
                          </option>

                          <option value="entregada">
                            Entregada
                          </option>

                          {esAdmin && (
                            <option value="cancelada">
                              Cancelada
                            </option>
                          )}
                        </select>
                      </td>

                      <td>
                        {orden.created_at
                          ? new Date(
                              orden.created_at
                            ).toLocaleString()
                          : '-'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {!cargando &&
          ordenesFiltradas.length > 0 &&
          totalPaginas > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '12px',
                marginTop: '24px',
              }}
            >
              <button
                type="button"
                className="pc-btn pc-btn-light"
                disabled={
                  paginaActual === 1
                }
                onClick={() =>
                  setPagina(
                    (valor) =>
                      Math.max(
                        1,
                        valor - 1
                      )
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
                  paginaActual ===
                  totalPaginas
                }
                onClick={() =>
                  setPagina(
                    (valor) =>
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