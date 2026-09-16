import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import { UserCog, UserCheck, UserX, Trash2, Search, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import BotonAtras from '../../components/BotonAtras'

export default function GestionUsuarios() {
  const { usuario } = useAuth()

  const [usuarios, setUsuarios] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [procesando, setProcesando] = useState(null)

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

  const cambiarBloqueo = async (usuarioSeleccionado) => {
    if (usuarioSeleccionado.id === usuario?.id) {
      setError('No puedes bloquear tu propio usuario.')
      return
    }

    const nuevoEstado = !usuarioSeleccionado.bloqueado

    const mensaje = nuevoEstado
      ? '¿Quieres bloquear este usuario? No podrá utilizar su cuenta.'
      : '¿Quieres desbloquear este usuario? Podrá volver a utilizar su cuenta.'

    if (!window.confirm(mensaje)) return

    setProcesando(usuarioSeleccionado.id)
    setError('')

    const { error } = await supabase
      .from('usuarios')
      .update({
        bloqueado: nuevoEstado,
        updated_at: new Date().toISOString(),
      })
      .eq('id', usuarioSeleccionado.id)

    if (error) {
      setError(error.message)
      setProcesando(null)
      return
    }

    await cargarUsuarios()
    setProcesando(null)
  }

  const eliminarUsuario = async (usuarioSeleccionado) => {
    if (usuarioSeleccionado.id === usuario?.id) {
      setError('No puedes eliminar tu propio usuario.')
      return
    }

    if (usuarioSeleccionado.rol === 'admin') {
      setError('No puedes eliminar un administrador desde este módulo.')
      return
    }

    const nombre =
      `${usuarioSeleccionado.nombre || ''} ${usuarioSeleccionado.apellido || ''}`.trim()

    const confirmar = window.confirm(
      `¿Estás seguro de que deseas eliminar a ${nombre || 'este usuario'}? Esta acción no se puede deshacer.`
    )

    if (!confirmar) return

    setProcesando(usuarioSeleccionado.id)
    setError('')

    const { error } = await supabase.rpc('eliminar_usuario_pc_store', {
      p_usuario_id: usuarioSeleccionado.id,
    })

    if (error) {
      setError(error.message)
      setProcesando(null)
      return
    }

    await cargarUsuarios()
    setProcesando(null)
  }

  const textoBusqueda = busqueda.trim().toLowerCase()

  const usuariosFiltrados = usuarios.filter((usuarioItem) => {
    if (!textoBusqueda) return true

    const nombreCompleto = [usuarioItem.nombre || '', usuarioItem.apellido || '']
      .join(' ')
      .toLowerCase()

    const email = (usuarioItem.email || '').toLowerCase()
    const ciudad = (usuarioItem.ciudad || '').toLowerCase()
    const rol = (usuarioItem.rol || '').toLowerCase()

    return (
      nombreCompleto.includes(textoBusqueda) ||
      email.includes(textoBusqueda) ||
      ciudad.includes(textoBusqueda) ||
      rol.includes(textoBusqueda)
    )
  })

  const limpiarBusqueda = () => {
    setBusqueda('')
  }

  const obtenerNombre = (usuarioItem) => {
    const nombre = [usuarioItem.nombre || '', usuarioItem.apellido || ''].join(' ').trim()

    return nombre || 'Sin nombre'
  }

  const obtenerRol = (rol) => {
    if (rol === 'admin') return 'Administrador'
    if (rol === 'empleado') return 'Empleado'
    return 'Cliente'
  }

  return (
    <main className="pc-page">
      <div className="pc-container">
        <BotonAtras />

        <div className="pc-admin-header">
          <h1>Gestión de Usuarios</h1>
          <p>Administra los usuarios registrados, su acceso y sus cuentas.</p>
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

        {!cargando && (
          <div className="pc-metrics-grid" style={{ marginBottom: 30 }}>
            <article className="pc-card pc-metric">
              <span style={{ color: '#171717' }}>Usuarios registrados</span>
              <strong style={{ color: '#171717' }}>{usuarios.length}</strong>
            </article>
          </div>
        )}

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
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, email, ciudad o rol..."
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
              {usuariosFiltrados.length} resultado(s) encontrado(s).
            </p>
          )}
        </div>

        {cargando ? (
          <div className="pc-loading">
            <div className="pc-loader" />
            <p>Cargando usuarios...</p>
          </div>
        ) : (
          <div className="pc-card pc-table-wrapper">
            <table className="pc-table">
              <thead>
                <tr>
                  <th>N.º</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Ciudad</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {usuariosFiltrados.map((usuarioItem, indice) => {
                  const esActual = usuarioItem.id === usuario?.id
                  const esAdmin = usuarioItem.rol === 'admin'
                  const estaBloqueado = usuarioItem.bloqueado === true
                  const estaProcesando = procesando === usuarioItem.id

                  return (
                    <tr key={usuarioItem.id}>
                      <td>
                        <strong>{indice + 1}</strong>
                      </td>

                      <td>
                        <strong>{obtenerNombre(usuarioItem)}</strong>

                        {esActual && (
                          <span
                            style={{
                              display: 'block',
                              fontSize: '0.8rem',
                              color: '#666',
                              marginTop: 3,
                            }}
                          >
                            Tu cuenta
                          </span>
                        )}
                      </td>

                      <td>{usuarioItem.email || '-'}</td>

                      <td>{usuarioItem.ciudad || '-'}</td>

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
                          <UserCog size={16} />
                          {obtenerRol(usuarioItem.rol)}
                        </span>
                      </td>

                      <td>
                        {estaBloqueado ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              fontWeight: 700,
                              color: '#dc2626',
                            }}
                          >
                            <UserX size={16} />
                            Bloqueado
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              fontWeight: 700,
                              color: '#15803d',
                            }}
                          >
                            <UserCheck size={16} />
                            Activo
                          </span>
                        )}
                      </td>

                      <td>
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 8,
                          }}
                        >
                          {!esActual && !esAdmin && (
                            <>
                              <button
                                className={
                                  estaBloqueado ? 'pc-btn pc-btn-primary' : 'pc-btn pc-btn-light'
                                }
                                onClick={() => cambiarBloqueo(usuarioItem)}
                                disabled={estaProcesando}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 7,
                                }}
                              >
                                {estaBloqueado ? (
                                  <>
                                    <UserCheck size={16} />
                                    Desbloquear
                                  </>
                                ) : (
                                  <>
                                    <UserX size={16} />
                                    Bloquear
                                  </>
                                )}
                              </button>

                              <button
                                className="pc-btn pc-btn-light"
                                onClick={() => eliminarUsuario(usuarioItem)}
                                disabled={estaProcesando}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 7,
                                  color: '#dc2626',
                                }}
                              >
                                <Trash2 size={16} />
                                Eliminar
                              </button>
                            </>
                          )}

                          {esActual && (
                            <span
                              style={{
                                color: '#666',
                                fontSize: '0.9rem',
                              }}
                            >
                              Cuenta actual
                            </span>
                          )}

                          {esAdmin && !esActual && (
                            <span
                              style={{
                                color: '#666',
                                fontSize: '0.9rem',
                              }}
                            >
                              Administrador protegido
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {usuariosFiltrados.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      style={{
                        textAlign: 'center',
                        padding: 30,
                      }}
                    >
                      {busqueda
                        ? 'No se encontraron usuarios con esa búsqueda.'
                        : 'No hay usuarios registrados.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
