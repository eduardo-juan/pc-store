import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'

export default function GestionOrdenes() {
  const [ordenes, setOrdenes] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    cargarOrdenes()
  }, [])

  const cargarOrdenes = async () => {
    setError('')

    const { data, error } = await supabase
      .from('ordenes')
      .select('*')
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      setError(error.message)
      return
    }

    setOrdenes(data || [])
  }

  const cambiarEstado = async (id, estado) => {
    setError('')

    if (estado === 'cancelada') {
      const confirmar = window.confirm(
        '¿Estás seguro de que deseas cancelar esta orden? El stock de los productos será restaurado.'
      )

      if (!confirmar) {
        return
      }

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

    const { error } = await supabase
      .from('ordenes')
      .update({ estado })
      .eq('id', id)

    if (error) {
      setError(error.message)
      return
    }

    await cargarOrdenes()
  }

  return (
    <main className="pc-page">

      <div className="pc-container">

        <div className="pc-admin-header">

          <h1>
            Gestión de Órdenes
          </h1>

          <p>
            Administra las compras y consulta
            los datos de entrega.
          </p>

        </div>

        {error && (
          <div
            className="pc-card"
            style={{
              padding: 16,
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

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

              {ordenes.map((orden) => {

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
                          {orden.email}
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
                          (item, idx) => (

                            <div
                              key={`${orden.id}-${item.producto_id || idx}`}
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
                        L {subtotal.toFixed(2)}
                      </strong>
                    </td>

                    <td>
                      <strong>
                        L {envio.toFixed(2)}
                      </strong>
                    </td>

                    <td>
                      <strong>
                        L {total.toFixed(2)}
                      </strong>
                    </td>

                    <td>

                      <select
                        className="pc-select"
                        value={
                          orden.estado ||
                          'pendiente'
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

                        <option value="cancelada">
                          Cancelada
                        </option>

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
              })}

              {ordenes.length === 0 && (

                <tr>

                  <td colSpan="9">
                    Todavía no existen órdenes.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </main>
  )
}