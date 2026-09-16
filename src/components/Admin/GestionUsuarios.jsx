import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import { UserCog, UserCheck, UserX, Search, X } from 'lucide-react'
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

    if (error) setError(error.message)
    setUsuarios(data || [])
    setCargando(false)
  }

  const cambiarBloqueo = async (seleccionado) => {
    if (seleccionado.id === usuario?.id) {
      setError('No puedes bloquear tu propia cuenta.')
      return
    }

    if (seleccionado.rol === 'empleado' || seleccionado.rol === 'admin') {
      setError('Las cuentas de empleados y administradores se gestionan desde sus módulos correspondientes.')
      return
    }

    if (!window.confirm(seleccionado.bloqueado
      ? '¿Desbloquear este cliente?'
      : '¿Bloquear este cliente?')) return

    setProcesando(seleccionado.id)
    const { error } = await supabase
      .from('usuarios')
      .update({
        bloqueado: !seleccionado.bloqueado,
        updated_at: new Date().toISOString(),
      })
      .eq('id', seleccionado.id)

    if (error) setError(error.message)
    await cargarUsuarios()
    setProcesando(null)
  }

  const texto = busqueda.trim().toLowerCase()
  const filtrados = usuarios.filter((item) => {
    if (!texto) return true
    return [
      item.nombre,
      item.apellido,
      item.email,
      item.ciudad,
      item.rol,
    ].filter(Boolean).join(' ').toLowerCase().includes(texto)
  })

  const nombre = (item) =>
    [item.nombre, item.apellido].filter(Boolean).join(' ') || 'Sin nombre'

  const rol = (valor) =>
    valor === 'admin' ? 'Administrador' :
    valor === 'empleado' ? 'Empleado' : 'Cliente'

  return (
    <main className="pc-page">
      <div className="pc-container">
        <BotonAtras />

        <div className="pc-admin-header">
          <h1>Gestión de Usuarios</h1>
          <p>Administra el acceso de los clientes registrados.</p>
        </div>

        {error && <div className="pc-card" style={{ padding: 16, marginBottom: 20, color: '#dc2626' }}>{error}</div>}

        <div className="pc-card" style={{ padding: 16, marginBottom: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Search size={20} />
            <input
              className="pc-input"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, email, ciudad o rol..."
              style={{ width: '100%' }}
            />
            {busqueda && <button type="button" onClick={() => setBusqueda('')}><X size={18} /></button>}
          </div>
        </div>

        {cargando ? (
          <div className="pc-loading"><div className="pc-loader" /><p>Cargando usuarios...</p></div>
        ) : (
          <div className="pc-card pc-table-wrapper">
            <table className="pc-table">
              <thead>
                <tr>
                  <th>N.º</th><th>Nombre</th><th>Email</th><th>Ciudad</th>
                  <th>Rol</th><th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((item, index) => {
                  const actual = item.id === usuario?.id
                  const protegido = item.rol === 'admin' || item.rol === 'empleado'
                  const bloqueado = item.bloqueado === true
                  const ocupado = procesando === item.id

                  return (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td><strong>{nombre(item)}</strong>{actual && <small> Tu cuenta</small>}</td>
                      <td>{item.email || '-'}</td>
                      <td>{item.ciudad || '-'}</td>
                      <td><UserCog size={16} /> {rol(item.rol)}</td>
                      <td>
                        {bloqueado
                          ? <span style={{ color: '#dc2626' }}><UserX size={16} /> Bloqueado</span>
                          : <span style={{ color: '#15803d' }}><UserCheck size={16} /> Activo</span>}
                      </td>
                      <td>
                        {actual
                          ? 'Cuenta actual'
                          : protegido
                            ? 'Gestionar desde su módulo'
                            : (
                              <button
                                className="pc-btn pc-btn-light"
                                disabled={ocupado}
                                onClick={() => cambiarBloqueo(item)}
                              >
                                {bloqueado ? 'Desbloquear' : 'Bloquear'}
                              </button>
                            )}
                      </td>
                    </tr>
                  )
                })}
                {!filtrados.length && <tr><td colSpan="7">No se encontraron usuarios.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
