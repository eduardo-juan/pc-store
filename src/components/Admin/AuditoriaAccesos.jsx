import { useEffect, useState } from 'react'
import { ClipboardList, RefreshCw } from 'lucide-react'
import { supabase } from '../../supabaseClient'
import BotonAtras from '../../components/BotonAtras'

export default function AuditoriaAccesos() {
  const [registros, setRegistros] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargarRegistros = async () => {
    setCargando(true)
    setError('')

    const { data, error: consultaError } = await supabase
      .from('auditoria_accesos')
      .select('id, usuario_id, email, rol, fecha_acceso')
      .order('fecha_acceso', { ascending: false })
      .limit(200)

    if (consultaError) {
      setError(consultaError.message)
      setRegistros([])
    } else {
      setRegistros(data || [])
    }

    setCargando(false)
  }

  useEffect(() => {
    cargarRegistros()
  }, [])

  const formatearFecha = (fecha) =>
    new Date(fecha).toLocaleString('es-HN', {
      dateStyle: 'short',
      timeStyle: 'medium',
    })

  return (
    <main className="pc-page">
      <div className="pc-container">
        <BotonAtras />

        <div className="pc-page-heading">
          <div>
            <span className="pc-kicker" style={{ color: '#171717' }}>
              Seguridad
            </span>
            <h1 style={{ color: '#171717' }}>Auditoría de accesos</h1>
            <p style={{ color: '#171717' }}>
              Registro de los inicios de sesión exitosos realizados en PC Store.
            </p>
          </div>

          <button
            className="pc-btn pc-btn-light"
            onClick={cargarRegistros}
            disabled={cargando}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <RefreshCw size={17} />
            Actualizar
          </button>
        </div>

        {error && (
          <div className="pc-card" style={{ padding: 16, marginBottom: 20, color: '#dc2626' }}>
            {error}
          </div>
        )}

        {cargando ? (
          <div className="pc-loading">
            <div className="pc-loader" />
            <p>Cargando auditoría...</p>
          </div>
        ) : (
          <div className="pc-card pc-table-wrapper">
            <table className="pc-table">
              <thead>
                <tr>
                  <th>Fecha y hora</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>ID de usuario</th>
                </tr>
              </thead>
              <tbody>
                {registros.map((registro) => (
                  <tr key={registro.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatearFecha(registro.fecha_acceso)}</td>
                    <td>{registro.email || '-'}</td>
                    <td style={{ textTransform: 'capitalize' }}>{registro.rol}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{registro.usuario_id}</td>
                  </tr>
                ))}
                {registros.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: 35 }}>
                      <ClipboardList size={28} style={{ margin: '0 auto 8px' }} />
                      Todavía no hay accesos registrados.
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
