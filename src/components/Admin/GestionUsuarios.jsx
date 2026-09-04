import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [error, setError] = useState('')


  useEffect(() => {
    cargarUsuarios()
  }, [])


  const cargarUsuarios = async () => {

    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
      return
    }

    setUsuarios(data || [])
  }


  const cambiarRol = async (id, nuevoRol) => {

    const confirmar = window.confirm(
      `¿Cambiar el rol de este usuario a ${nuevoRol}?`
    )

    if (!confirmar) return


    const { error } = await supabase
      .from('usuarios')
      .update({
        rol: nuevoRol,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)


    if (error) {
      setError(error.message)
      return
    }

    await cargarUsuarios()
  }


  return (
    <main className="pc-page">
      <div className="pc-container">

        <div className="pc-admin-header">

          <h1>Gestión de Usuarios</h1>

          <p>
            Consulta usuarios y administra sus roles.
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
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Ciudad</th>
                <th>Acción</th>
              </tr>
            </thead>


            <tbody>

              {usuarios.map((usuario) => (

                <tr key={usuario.id}>

                  <td>
                    {usuario.nombre || ''}
                    {' '}
                    {usuario.apellido || ''}
                  </td>

                  <td>{usuario.email}</td>

                  <td>{usuario.rol}</td>

                  <td>{usuario.ciudad || '-'}</td>


                  <td>

                    {usuario.rol === 'admin' ? (

                      <button
                        className="pc-btn pc-btn-light"
                        onClick={() =>
                          cambiarRol(usuario.id, 'user')
                        }
                      >
                        Convertir en usuario
                      </button>

                    ) : (

                      <button
                        className="pc-btn pc-btn-primary"
                        onClick={() =>
                          cambiarRol(usuario.id, 'admin')
                        }
                      >
                        Convertir en admin
                      </button>

                    )}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>
    </main>
  )
}