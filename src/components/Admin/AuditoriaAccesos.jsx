import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, ClipboardList, RefreshCw } from 'lucide-react'
import { supabase } from '../../supabaseClient'
import BotonAtras from '../../components/BotonAtras'

const obtenerFechaLocal = (fecha = new Date()) => {
  const year = fecha.getFullYear()
  const month = String(fecha.getMonth() + 1).padStart(2, '0')
  const day = String(fecha.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const cambiarDia = (fecha, cantidad) => {
  const [year, month, day] = fecha.split('-').map(Number)
  const nuevaFecha = new Date(year, month - 1, day)
  nuevaFecha.setDate(nuevaFecha.getDate() + cantidad)
  return obtenerFechaLocal(nuevaFecha)
}

const formatearDia = (fecha) => {
  const [year, month, day] = fecha.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('es-HN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const obtenerRangoUTC = (fecha) => {
  const [year, month, day] = fecha.split('-').map(Number)
  const inicio = new Date(year, month - 1, day)
  const fin = new Date(year, month - 1, day + 1)
  return { inicio: inicio.toISOString(), fin: fin.toISOString() }
}

export default function AuditoriaAccesos() {
  const hoy = obtenerFechaLocal()
  const [fechaSeleccionada, setFechaSeleccionada] = useState(hoy)
  const [registros, setRegistros] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargarRegistros = async (fecha = fechaSeleccionada) => {
    setCargando(true)
    setError('')

    const { inicio, fin } = obtenerRangoUTC(fecha)
    const { data, error: consultaError } = await supabase
      .from('auditoria_accesos')
      .select('id, usuario_id, email, nombre, rol, fecha_acceso')
      .gte('fecha_acceso', inicio)
      .lt('fecha_acceso', fin)
      .order('fecha_acceso', { ascending: false })

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
  }, [fechaSeleccionada])

  const registrosOrdenados = useMemo(
    () => [...registros].sort((a, b) => new Date(b.fecha_acceso) - new Date(a.fecha_acceso)),
    [registros]
  )

  const irAlDia = (cantidad) => {
    const nuevaFecha = cambiarDia(fechaSeleccionada, cantidad)
    setFechaSeleccionada(nuevaFecha)
  }

  const formatearHora = (fecha) =>
    new Date(fecha).toLocaleTimeString('es-HN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
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
            <h1 style={{ color: '#171717' }}>Historial diario de accesos</h1>
            <p style={{ color: '#171717' }}>
              Consulta los inicios de sesión exitosos registrados por día.
            </p>
          </div>

          <button
            className="pc-btn pc-btn-light"
            onClick={() => cargarRegistros()}
            disabled={cargando}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <RefreshCw size={17} />
            Actualizar
          </button>
        </div>

        <div className="pc-card" style={{ padding: 18, marginBottom: 20 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <button
              className="pc-btn pc-btn-light"
              onClick={() => irAlDia(-1)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <ChevronLeft size={18} />
              Día anterior
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CalendarDays size={19} />
              <input
                type="date"
                value={fechaSeleccionada}
                max={hoy}
                onChange={(e) => setFechaSeleccionada(e.target.value)}
                style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #d4d4d4' }}
              />
            </div>

            <button
              className="pc-btn pc-btn-light"
              onClick={() => irAlDia(1)}
              disabled={fechaSeleccionada >= hoy}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              Día siguiente
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {error && (
          <div className="pc-card" style={{ padding: 16, marginBottom: 20, color: '#dc2626' }}>
            {error}
          </div>
        )}

        {cargando ? (
          <div className="pc-loading">
            <div className="pc-loader" />
            <p>Cargando historial del día...</p>
          </div>
        ) : (
          <div className="pc-card pc-table-wrapper">
            <div style={{ padding: '20px 20px 10px' }}>
              <h2 style={{ margin: 0, color: '#171717', textTransform: 'capitalize' }}>
                {formatearDia(fechaSeleccionada)}
              </h2>
              <p style={{ margin: '6px 0 0', color: '#666' }}>
                {registrosOrdenados.length}{' '}
                {registrosOrdenados.length === 1 ? 'acceso registrado' : 'accesos registrados'}
              </p>
            </div>

            <table className="pc-table">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>ID de usuario</th>
                </tr>
              </thead>
              <tbody>
                {registrosOrdenados.map((registro) => (
                  <tr key={registro.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatearHora(registro.fecha_acceso)}</td>
                    <td>{registro.nombre || '-'}</td>
                    <td>{registro.email || '-'}</td>
                    <td style={{ textTransform: 'capitalize' }}>{registro.rol}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>
                      {registro.usuario_id}
                    </td>
                  </tr>
                ))}
                {registrosOrdenados.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: 35 }}>
                      <ClipboardList size={28} style={{ margin: '0 auto 8px' }} />
                      No hay accesos registrados en este día.
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
