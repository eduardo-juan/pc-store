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
  Trash2,
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
  const [empleadoEliminar, setEmpleadoEliminar] = useState(null)
  const [passwordEliminar, setPasswordEliminar] = useState('')
  const [eliminando, setEliminando] = useState(false)

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

    if (error) setError(error.message)
    else setUsuarios(data || [])

    setCargando(false)
  }

  const cargarConfig = async () => {
    const { data, error } = await supabase
      .from('configuracion_empleados')
      .select('max_ordenes_activas,comision_porcentaje')
      .eq('id', true)
      .single()

    if (error) {
      setError(error.message)
      return
    }

    setMaxOrdenes(Number(data.max_ordenes_activas) || 5)
    setComision(Number(data.comision_porcentaje) || 5)
  }

  const guardarConfig = async () => {
    const limite = Math.min(100, Math.max(1, Number(maxOrdenes) || 5))
    const porcentaje = Math.min(100, Math.max(0, Number(comision) || 0))

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

    if (error) setError(error.message)
    else {
      setMaxOrdenes(limite)
      setComision(porcentaje)
    }

    setGuardandoConfig(false)
  }

  const quitarEmpleado = async (id) => {
    if (!window.confirm('¿Quitar el rol de empleado y devolver esta cuenta a cliente?')) {
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

    if (error) setError(error.message)
    else await cargarUsuarios()
  }

  const eliminarEmpleado = async () => {
    if (!empleadoEliminar || !passwordEliminar.trim() || eliminando) {
      setError('Introduce la contraseña del administrador.')
      return
    }

    if (!window.confirm(
      `Esta acción eliminará permanentemente a ${empleadoEliminar.email}. ¿Continuar?`,
    )) {
      return
    }

    setEliminando(true)
    setError('')

    try {
      const { data, error } = await supabase.functions.invoke(
        'eliminar_cuenta_pc_store',
        {
          body: {
            password: passwordEliminar,
            target_user_id: empleadoEliminar.id,
          },
        },
      )

      if (error) throw error
      if (data?.error) throw new Error(data.error)

      setEmpleadoEliminar(null)
      setPasswordEliminar('')
      await cargarUsuarios()
    } catch (err) {
      setError(err.message || 'No se pudo eliminar el empleado.')
    } finally {
      setEliminando(false)
    }
  }

  const empleados = usuarios
    .filter((usuario) => usuario.rol === 'empleado')
    .filter((usuario) => {
      const texto = busqueda.trim().toLowerCase()
      if (!texto) return true

      return `${usuario.nombre || ''} ${usuario.apellido || ''} ${usuario.email || ''} ${usuario.ciudad || ''}`
        .toLowerCase()
        .includes(texto)
    })

  const totalEmpleados = usuarios.filter((u) => u.rol === 'empleado').length
  const totalActivos = usuarios.filter(
    (u) => u.rol === 'empleado' && u.activo === true && u.bloqueado !== true,
  ).length
  const totalFuera = usuarios.filter(
    (u) => u.rol === 'empleado' && (u.activo === false || u.bloqueado === true),
  ).length

  return (
    <main className="pc-page">
      <div className="pc-container">
        <BotonAtras />

        <div className="pc-admin-header">
          <h1>Gestión de Empleados</h1>
          <p>Administra las cuentas y el sistema de asignación de entregas.</p>
        </div>

        {error && (
          <div className="pc-card" style={{ padding: 16, marginBottom: 20, color: '#dc2626' }}>
            {error}
          </div>
        )}

        <div className="pc-metrics-grid" style={{ marginBottom: 30 }}>
          <article className="pc-card pc-metric">
            <span>Empleados</span>
            <strong>{totalEmpleados}</strong>
          </article>
          <article className="pc-card pc-metric">
            <span>Activos</span>
            <strong style={{ color: '#16a34a' }}>{totalActivos}</strong>
          </article>
          <article className="pc-card pc-metric">
            <span>Fuera de servicio</span>
            <strong style={{ color: '#6b7280' }}>{totalFuera}</strong>
          </article>
        </div>

        <section className="pc-card" style={{ padding: 20, marginBottom: 30 }}>
          <h2 style={{ marginTop: 0 }}>Reglas de entregas</h2>
          <p className="pc-muted">
            Estos valores se aplican globalmente y se validan en el servidor.
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
                onChange={(e) => setMaxOrdenes(e.target.value)}
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
                onChange={(e) => setComision(e.target.value)}
              />
            </label>
          </div>

          <button
            type="button"
            className="pc-btn pc-btn-primary"
            onClick={guardarConfig}
            disabled={guardandoConfig}
          >
            {guardandoConfig ? 'Guardando...' : 'Guardar configuración'}
          </button>
        </section>

        {cargando ? (
          <div className="pc-loading">
            <div className="pc-loader" />
            <p>Cargando empleados...</p>
          </div>
        ) : (
          <>
            <div className="pc-card" style={{ padding: 16, marginBottom: 30 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
                <Search size={20} style={{ color: '#666' }} />
                <input
                  type="text"
                  className="pc-input"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre, apellido, email o ciudad..."
                  style={{ width: '100%', paddingRight: busqueda ? 42 : 12 }}
                />

                {busqueda && (
                  <button
                    type="button"
                    onClick={() => setBusqueda('')}
                    aria-label="Limpiar búsqueda"
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {busqueda && <p>{empleados.length} resultado(s) encontrado(s).</p>}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              marginBottom: 12,
              flexWrap: 'wrap',
            }}>
              <h2 className="pc-section-title" style={{ margin: 0 }}>
                Empleados actuales
              </h2>

              <button
                type="button"
                className="pc-btn pc-btn-primary"
                onClick={() => navigate('/admin/empleados/nuevo')}
                title="Crear cuenta de empleado"
                style={{ width: 44, height: 44, padding: 0, borderRadius: 12 }}
              >
                <Plus size={23} />
              </button>
            </div>

            <div className="pc-card pc-table-wrapper" style={{ marginBottom: 40 }}>
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
                    const activo = empleado.activo === true && empleado.bloqueado !== true

                    return (
                      <tr key={empleado.id}>
                        <td><strong>{indice + 1}</strong></td>
                        <td>{empleado.nombre || ''} {empleado.apellido || ''}</td>
                        <td>{empleado.email}</td>
                        <td>{empleado.ciudad || '-'}</td>
                        <td>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            fontWeight: 700,
                            color: empleado.bloqueado ? '#dc2626' : activo ? '#16a34a' : '#6b7280',
                          }}>
                            {activo ? <CircleCheck size={16} /> : <CircleX size={16} />}
                            {empleado.bloqueado ? 'Bloqueado' : activo ? 'Activo' : 'Fuera de servicio'}
                          </span>
                        </td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                            <UserCheck size={16} />
                            Empleado
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button
                              className="pc-btn pc-btn-light"
                              onClick={() => quitarEmpleado(empleado.id)}
                            >
                              <UserRound size={16} />
                              Quitar rol
                            </button>

                            <button
                              className="pc-btn pc-btn-danger"
                              onClick={() => setEmpleadoEliminar(empleado)}
                            >
                              <Trash2 size={16} />
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}

                  {empleados.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: 30 }}>
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

        {empleadoEliminar && (
          <div className="pc-modal-backdrop">
            <div className="pc-card pc-modal" style={{ padding: 24 }}>
              <h2>Eliminar empleado</h2>
              <p>
                Vas a eliminar permanentemente la cuenta de{' '}
                <strong>{empleadoEliminar.email}</strong>.
              </p>

              <label>
                Contraseña del administrador
                <input
                  className="pc-input"
                  type="password"
                  autoComplete="current-password"
                  value={passwordEliminar}
                  onChange={(e) => setPasswordEliminar(e.target.value)}
                  placeholder="Contraseña actual"
                />
              </label>

              <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="pc-btn pc-btn-danger"
                  onClick={eliminarEmpleado}
                  disabled={eliminando}
                >
                  <Trash2 size={17} />
                  {eliminando ? 'Eliminando...' : 'Confirmar eliminación'}
                </button>

                <button
                  type="button"
                  className="pc-btn pc-btn-light"
                  onClick={() => {
                    setEmpleadoEliminar(null)
                    setPasswordEliminar('')
                  }}
                  disabled={eliminando}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
