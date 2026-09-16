import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  UserRound,
  UserCheck,
  Search,
  X,
  CircleCheck,
  CircleX,
} from 'lucide-react'
import BotonAtras from '../../components/BotonAtras'
import { supabase } from '../../supabaseClient'

export default function GestionEmpleados() {
  const navigate = useNavigate()

  const [usuarios, setUsuarios] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)
  const [maxOrdenes, setMaxOrdenes] = useState(5)
  const [comision, setComision] = useState(5)
  const [guardandoConfig, setGuardandoConfig] = useState(false)

  useEffect(() => {
    cargarUsuarios()
    cargarConfig()
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
    } else {
      setUsuarios(data || [])
    }

    setCargando(false)
  }

  const cargarConfig = async () => {
    const { data, error } = await supabase
      .from('configuracion_empleados')
      .select(
        'max_ordenes_activas,comision_porcentaje',
      )
      .eq('id', true)
      .single()

    if (error) {
      setError(error.message)
    } else {
      setMaxOrdenes(
        Number(data.max_ordenes_activas) || 5,
      )
      setComision(
        Number(data.comision_porcentaje) || 5,
      )
    }
  }

  const guardarConfig = async () => {
    const limite = Math.min(
      100,
      Math.max(1, Number(maxOrdenes) || 5),
    )

    const porcentaje = Math.min(
      100,
      Math.max(0, Number(comision) || 0),
    )

    setGuardandoConfig(true)
    setError('')

    const { error } = await supabase
      .from('configuracion_empleados')
      .update({
        max_ordenes_activas: limite,
        comision_porcentaje: porcentaje,
        updated_at: new Date().toISOString(),
      })
      .eq('id', true)

    if (error) {
      setError(error.message)
    } else {
      setMaxOrdenes(limite)
      setComision(porcentaje)
    }

    setGuardandoConfig(false)
  }

  const quitarEmpleado = async (id) => {
    if (
      !window.confirm(
        '¿Quieres quitar el rol de empleado y devolver esta cuenta a cliente?',
      )
    ) {
      return
    }

    setError('')

    const { error } = await supabase
      .from('usuarios')
      .update({
        rol: 'user',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      setError(error.message)
    } else {
      await cargarUsuarios()
    }
  }

  const textoBusqueda = busqueda.trim().toLowerCase()

  const empleados = usuarios
    .filter((usuario) => usuario.rol === 'empleado')
    .filter((usuario) => {
      if (!textoBusqueda) return true

      return `${usuario.nombre || ''} ${
        usuario.apellido || ''
      } ${usuario.email || ''} ${
        usuario.ciudad || ''
      }`
        .toLowerCase()
        .includes(textoBusqueda)
    })

  const totalEmpleados = usuarios.filter(
    (usuario) => usuario.rol === 'empleado',
  ).length

  const totalEmpleadosActivos = usuarios.filter(
    (usuario) =>
      usuario.rol === 'empleado' &&
      usuario.activo === true &&
      usuario.bloqueado !== true,
  ).length

  const totalEmpleadosFueraServicio = usuarios.filter(
    (usuario) =>
      usuario.rol === 'empleado' &&
      (usuario.activo === false ||
        usuario.bloqueado === true),
  ).length

  return (
    <main className="pc-page">
      <div className="pc-container">
        <BotonAtras />

        <div className="pc-admin-header">
          <h1>Gestión de Empleados</h1>
          <p>
            Administra las cuentas y el sistema de
            asignación de entregas.
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
        </div>

        <section
          className="pc-card"
          style={{
            padding: 20,
            marginBottom: 30,
          }}
        >
          <h2
            style={{
              marginTop: 0,
              color: '#171717',
            }}
          >
            Reglas de entregas
          </h2>

          <p className="pc-muted">
            Estos valores se aplican globalmente. El límite
            se valida en el servidor al aceptar una orden.
          </p>

          <div className="pc-form-grid">
            <label>
              Máximo de órdenes activas por empleado

              <input
                className="pc-input"
                type="number"
                min="1"
                max="100"
                value={maxOrdenes}
                onChange={(e) =>
                  setMaxOrdenes(e.target.value)
                }
              />
            </label>

            <label>
              Comisión por entrega (%)

              <input
                className="pc-input"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={comision}
                onChange={(e) =>
                  setComision(e.target.value)
                }
              />
            </label>
          </div>

          <button
            type="button"
            className="pc-btn pc-btn-primary"
            onClick={guardarConfig}
            disabled={guardandoConfig}
          >
            {guardandoConfig
              ? 'Guardando...'
              : 'Guardar configuración'}
          </button>
        </section>

        {cargando ? (
          <div className="pc-loading">
            <div className="pc-loader" />
            <p>Cargando empleados...</p>
          </div>
        ) : (
          <>
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
                    onClick={() => setBusqueda('')}
                    title="Limpiar búsqueda"
                    aria-label="Limpiar búsqueda"
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
                  {empleados.length} resultado(s)
                  encontrado(s).
                </p>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                marginBottom: 12,
                flexWrap: 'wrap',
              }}
            >
              <h2
                className="pc-section-title"
                style={{
                  color: '#171717',
                  margin: 0,
                }}
              >
                Empleados actuales
              </h2>

              <button
                type="button"
                className="pc-btn pc-btn-primary"
                onClick={() =>
                  navigate('/admin/empleados/nuevo')
                }
                title="Crear cuenta de empleado"
                aria-label="Crear cuenta de empleado"
                style={{
                  width: 44,
                  height: 44,
                  padding: 0,
                  borderRadius: 12,
                }}
              >
                <Plus size={23} />
              </button>
            </div>

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
                    const activo =
                      empleado.activo === true &&
                      empleado.bloqueado !== true

                    return (
                      <tr key={empleado.id}>
                        <td>
                          <strong>{indice + 1}</strong>
                        </td>

                        <td>
                          {empleado.nombre || ''}{' '}
                          {empleado.apellido || ''}
                        </td>

                        <td>{empleado.email}</td>

                        <td>{empleado.ciudad || '-'}</td>

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
                          ) : activo ? (
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
                              quitarEmpleado(empleado.id)
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
          </>
        )}
      </div>
    </main>
  )
}