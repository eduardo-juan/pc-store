import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'

export default function GestionOrdenes() {
  const [ordenes, setOrdenes] = useState([])
  const [error, setError] = useState('')


  useEffect(() => {
    cargarOrdenes()
  }, [])


  const cargarOrdenes = async () => {

    const { data, error } = await supabase
      .from('ordenes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
      return
    }

    setOrdenes(data || [])
  }


  const cambiarEstado = async (id, estado) => {

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
          <h1>Gestión de Órdenes</h1>
          <p>
            Aquí aparecerán las compras realizadas por clientes.
          </p>
        </div>


        {error && (
          <div
            className="pc-card"
            style={{ padding: 16, marginBottom: 20 }}
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
                <th>Dirección</th>
                <th>Teléfono</th>
                <th>Productos</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>


            <tbody>

              {ordenes.map((orden) => (

                <tr key={orden.id}>

                  <td>#{orden.id}</td>

                  <td>
                    <div>
                      <strong>
                        {orden.nombre_cliente} {orden.apellido_cliente}
                      </strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {orden.email}
                      </div>
                    </div>
                  </td>

                  <td>
                    {orden.dirección_envío}
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {orden.ciudad_envío}
                    </div>
                  </td>

                  <td>
                    {orden.teléfono_contacto}
                  </td>

                  <td>
                    <div style={{ fontSize: '12px' }}>
                      {(orden.items || []).map((item, idx) => (
                        <div key={idx}>
                          {item.cantidad}× {item.nombre}
                        </div>
                      ))}
                    </div>
                  </td>

                  <td>
                    L {Number(orden.total || 0).toFixed(2)}
                  </td>

                  <td>

                    <select
                      className="pc-select"
                      value={orden.estado || 'pendiente'}
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

              ))}


              {ordenes.length === 0 && (
                <tr>
                  <td colSpan="8">
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