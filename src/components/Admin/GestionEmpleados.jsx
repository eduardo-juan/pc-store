import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import {
  UserCog,
  UserRound,
  UserCheck,
  Search,
  X,
  CircleCheck,
  CircleX,
} from 'lucide-react'
import BotonAtras from '../../components/BotonAtras'

export default function GestionEmpleados() {
  const [usuarios, setUsuarios] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarUsuarios()
  }, [])

  const cargarUsuarios = async () => {
    setCargando(true)
    setError('')

    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
      setCargando(false)
      return
    }

    setUsuarios(data || [])
    setCargando(false)
  }

  const cambiarRol = async (id, nuevoRol) => {
    const mensaje =
      nuevoRol === 'empleado'
        ? '¿Quieres convertir este usuario en empleado?'
        : '¿Quieres quitar el rol de empleado y devolver este usuario a cliente?'

    const confirmar = window.confirm(mensaje)

    if (!confirmar) return

    setError('')

    const datosActualizacion = {
      rol: nuevoRol,
      updated_at: new Date().toISOString(),
    }

    if (nuevoRol === 'empleado') {
      datosActualizacion.activo = true
    }

    const { error } = await supabase
      .from('usuarios')
      .update(datosActualizacion)
      .eq('id', id)

    if (error) {
      setError(error.message)
      return
    }

    await cargarUsuarios()
  }

  const textoBusqueda = busqueda.trim().toLowerCase()

  const usuariosFiltrados = usuarios.filter((usuario) => {
    if (!textoBusqueda) return true

    const nombreCompleto = [
      usuario.nombre || '',
      usuario.apellido || '',
    ]
      .join(' ')
      .toLowerCase()

    const email = (usuario.email || '').toLowerCase()
    const ciudad = (usuario.ciudad || '').toLowerCase()

    return (
      nombreCompleto.includes(textoBusqueda) ||
      email.includes(textoBusqueda) ||
      ciudad.includes(textoBusqueda)
    )
  })

  const empleados = usuariosFiltrados.filter(
    (usuario) => usuario.rol === 'empleado'
  )

  const candidatos = usuariosFiltrados.filter(
    (usuario) => usuario.rol === 'user'
  )

  const totalEmpleados = usuarios.filter(
    (usuario) => usuario.rol === 'empleado'
  ).length

  const totalEmpleadosActivos = usuarios.filter(
    (usuario) =>
      usuario.rol === 'empleado' &&
      usuario.activo === true &&
      usuario.bloqueado !== true
  ).length

  const totalEmpleadosFueraServicio = usuarios.filter(
    (usuario) =>
      usuario.rol === 'empleado' &&
      (usuario.activo === false || usuario.bloqueado === true)
  ).length

  const totalCandidatos = usuarios.filter(
    (usuario) => usuario.rol === 'user'
  ).length

  const limpiarBusqueda = () => {
    setBusqueda('')
  }

  return (
    <main className="pc-page">
      <div className="pc-container">
        <BotonAtras />

        <div className="pc-admin-header">
          <h1>Gestión de Empleados</h1>

          <p>
            Administra los empleados que pueden gestionar productos,
            inventario, categorías y órdenes.
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

        {cargando ? (
          <div className="pc-loading">
            <div className="pc-loader" />
            <p>Cargando empleados...</p>
          </div>
        ) : (
          <>
            <div
              className="pc-metrics-grid"
              style={{ marginBottom: 30 }}
            >
              <article className="pc-card pc-metric">
                <span style={{ color: '#171717' }}>
                  Empleados
                </span>

                <strong style={{ color: '#171717' }}>
                  {totalEmpleados}
                </strong>
              </article>

              <article className="pc-card pc-metric">
                <span style={{ color: '#171717' }}>
                  Activos
                </span>

                <strong style={{ color: '#16a34a' }}>
                  {totalEmpleadosActivos}
                </strong>
              </article>

              <article className="pc-card pc-metric">
                <span style={{ color: '#171717' }}>
                  Fuera de servicio
                </span>

                <strong style={{ color: '#6b7280' }}>
                  {totalEmpleadosFueraServicio}
                </strong>
              </article>

              <article className="pc-card pc-metric">
                <span style={{ color: '#171717' }}>
                  Usuarios disponibles
                </span>

                <strong style={{ color: '#171717' }}>
                  {totalCandidatos}
                </strong>
              </article>
            </div>

            <div
              className="pc-card"
              style={{
                padding: 16,
                marginBottom: 30,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  position: 'relative',
                }}
              >
                <Search
                  size={20}
                  style={{
                    color: '#666',
                    flexShrink: 0,
                  }}
                />

                <input
                  type="text"
                  className="pc-input"
                  value={busqueda}
                  onChange={(e) =>
                    setBusqueda(e.target.value)
                  }
                  placeholder="Buscar por nombre, apellido, email o ciudad..."
                  style={{
                    width: '100%',
                    paddingRight: busqueda ? 42 : 12,
                  }}
                />

                {busqueda && (
                  <button
                    type="button"
                    onClick={limpiarBusqueda}
                    title="Limpiar búsqueda"
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'transparent',
                      color: '#666',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 4,
                    }}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {busqueda && (
                <p
                  style={{
                    margin: '10px 0 0',
                    color: '#666',
                    fontSize: '0.9rem',
                  }}
                >
                  {empleados.length + candidatos.length} resultado(s)
                  encontrado(s).
                </p>
              )}
            </div>

            <h2
              className="pc-section-title"
              style={{ color: '#171717' }}
            >
              Empleados actuales
            </h2>

            <div
              className="pc-card pc-table-wrapper"
              style={{ marginBottom: 40 }}
            >
              <table className="pc-table">
                <thead>
                  <tr>
                    <th>N.º</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Ciudad</th>
                    <th>Estado</th>
                    <th>Rol</th>
                    <th>Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {empleados.map((empleado, indice) => {
                    const estaActivo =
                      empleado.activo === true &&
                      empleado.bloqueado !== true

                    return (
                      <tr key={empleado.id}>
                        <td><strong>{indice + 1}</strong></td>

                        <td>
                          {empleado.nombre || ''}{' '}
                          {empleado.apellido || ''}
                        </td>

                        <td>{empleado.email}</td>

                        <td>
                          {empleado.ciudad || '-'}
                        </td>

                        <td>
                          {empleado.bloqueado === true ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                fontWeight: 700,
                                color: '#dc2626',
                              }}
                            >
                              <CircleX size={16} />
                              Bloqueado
                            </span>
                          ) : estaActivo ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                fontWeight: 700,
                                color: '#16a34a',
                              }}
                            >
                              <CircleCheck size={16} />
                              Activo
                            </span>
                          ) : (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                fontWeight: 700,
                                color: '#6b7280',
                              }}
                            >
                              <CircleX size={16} />
                              Fuera de servicio
                            </span>
                          )}
                        </td>

                        <td>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              fontWeight: 700,
                              color: '#171717',
                            }}
                          >
                            <UserCheck size={16} />
                            Empleado
                          </span>
                        </td>

                        <td>
                          <button
                            className="pc-btn pc-btn-light"
                            onClick={() =>
                              cambiarRol(
                                empleado.id,
                                'user'
                              )
                            }
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 7,
                            }}
                          >
                            <UserRound size={16} />
                            Quitar empleado
                          </button>
                        </td>
                      </tr>
                    )
                  })}

                  {empleados.length === 0 && (
                    <tr>
                      <td
                        colSpan="7"
                        style={{
                          textAlign: 'center',
                          padding: 30,
                        }}
                      >
                        {busqueda
                          ? 'No se encontraron empleados con esa búsqueda.'
                          : 'No hay empleados registrados.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <h2
              className="pc-section-title"
              style={{ color: '#171717' }}
            >
              Agregar empleado
            </h2>

            <div className="pc-card pc-table-wrapper">
              <table className="pc-table">
                <thead>
                  <tr>
                    <th>N.º</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Ciudad</th>
                    <th>Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {candidatos.map((usuario, indice) => (
                    <tr key={usuario.id}>
                      <td><strong>{indice + 1}</strong></td>

                      <td>
                        {usuario.nombre || ''}{' '}
                        {usuario.apellido || ''}
                      </td>

                      <td>{usuario.email}</td>

                      <td>
                        {usuario.ciudad || '-'}
                      </td>

                      <td>
                        <button
                          className="pc-btn pc-btn-primary"
                          onClick={() =>
                            cambiarRol(
                              usuario.id,
                              'empleado'
                            )
                          }
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 7,
                          }}
                        >
                          <UserCog size={16} />
                          Convertir en empleado
                        </button>
                      </td>
                    </tr>
                  ))}

                  {candidatos.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        style={{
                          textAlign: 'center',
                          padding: 30,
                        }}
                      >
                        {busqueda
                          ? 'No se encontraron usuarios con esa búsqueda.'
                          : 'No hay usuarios disponibles para convertir en empleado.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
