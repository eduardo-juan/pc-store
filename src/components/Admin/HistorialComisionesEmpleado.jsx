import { Fragment, useEffect, useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react'
import { supabase } from '../../supabaseClient'
import BotonAtras from '../../components/BotonAtras'

const NOMBRES_MES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

export default function HistorialComisionesEmpleado() {
  const hoy = new Date()
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [mes, setMes] = useState(hoy.getMonth())
  const [comisiones, setComisiones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [diaExpandido, setDiaExpandido] = useState(null)

  useEffect(() => {
    cargarComisiones()
  }, [anio, mes])

  const cargarComisiones = async () => {
    setCargando(true)
    setError('')
    setDiaExpandido(null)
    const inicioMes = new Date(anio, mes, 1)
    const inicioSiguienteMes = new Date(anio, mes + 1, 1)
    const { data, error: consultaError } = await supabase
      .from('empleado_comisiones')
      .select('id,orden_id,porcentaje,base,monto,created_at,ordenes(numero_orden,total)')
      .gte('created_at', inicioMes.toISOString())
      .lt('created_at', inicioSiguienteMes.toISOString())
      .order('created_at', { ascending: true })
    if (consultaError) {
      setError(consultaError.message)
      setComisiones([])
    } else setComisiones(data || [])
    setCargando(false)
  }

  const cambiarMes = (delta) => {
    setDiaExpandido(null)
    if (delta < 0) {
      if (mes === 0) {
        setMes(11)
        setAnio((a) => a - 1)
      } else setMes((m) => m - 1)
    } else {
      if (mes === 11) {
        setMes(0)
        setAnio((a) => a + 1)
      } else setMes((m) => m + 1)
    }
  }

  const volverMesActual = () => {
    setAnio(hoy.getFullYear())
    setMes(hoy.getMonth())
    setDiaExpandido(null)
  }

  const diasDelMes = useMemo(() => {
    const totalDias = new Date(anio, mes + 1, 0).getDate()
    const resumen = {}
    for (let dia = 1; dia <= totalDias; dia++)
      resumen[dia] = { total: 0, cantidad: 0, comisiones: [] }
    comisiones.forEach((comision) => {
      const fecha = new Date(comision.created_at)
      if (fecha.getFullYear() !== anio || fecha.getMonth() !== mes) return
      const dia = fecha.getDate()
      resumen[dia].total += Number(comision.monto || 0)
      resumen[dia].cantidad += 1
      resumen[dia].comisiones.push(comision)
    })
    return Array.from({ length: totalDias }, (_, i) => ({ dia: i + 1, ...resumen[i + 1] }))
  }, [comisiones, anio, mes])

  const totalMes = diasDelMes.reduce((s, d) => s + d.total, 0)
  const entregasMes = diasDelMes.reduce((s, d) => s + d.cantidad, 0)
  const esMesActual = anio === hoy.getFullYear() && mes === hoy.getMonth()

  return (
    <main className="pc-page">
      <div className="pc-container">
        <BotonAtras />
        <div className="pc-admin-header">
          <h1>Mis Comisiones</h1>
          <p>Historial de comisiones generadas por cada entrega completada.</p>
        </div>

        <div
          className="pc-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
            marginBottom: 20,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="pc-btn pc-btn-light"
              onClick={() => cambiarMes(-1)}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <ChevronLeft size={17} />
              Anterior
            </button>
            <h2
              style={{
                margin: 0,
                minWidth: 180,
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <CalendarDays size={20} />
              {NOMBRES_MES[mes]} {anio}
            </h2>
            <button
              type="button"
              className="pc-btn pc-btn-light"
              onClick={() => cambiarMes(1)}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              Siguiente
              <ChevronRight size={17} />
            </button>
          </div>
          {!esMesActual && (
            <button
              type="button"
              className="pc-btn pc-btn-primary"
              onClick={volverMesActual}
              style={{ display: 'flex', alignItems: 'center', gap: 7 }}
            >
              <RotateCcw size={17} />
              Volver al mes actual
            </button>
          )}
        </div>

        {error && (
          <div className="pc-card" style={{ padding: 16, marginBottom: 20, color: '#dc2626' }}>
            {error}
          </div>
        )}

        <div className="pc-metrics-grid" style={{ marginBottom: 24 }}>
          <article className="pc-card pc-metric">
            <span>Total ganado</span>
            <strong>L {totalMes.toFixed(2)}</strong>
          </article>
          <article className="pc-card pc-metric">
            <span>Entregas completadas</span>
            <strong>{entregasMes}</strong>
          </article>
        </div>

        {cargando ? (
          <div className="pc-card" style={{ padding: 20 }}>
            Cargando...
          </div>
        ) : (
          <div className="pc-card pc-table-wrapper">
            <table className="pc-table">
              <thead>
                <tr>
                  <th>Día</th>
                  <th>Entregas</th>
                  <th>Comisión ganada</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {diasDelMes.map((dia) => (
                  <Fragment key={dia.dia}>
                    <tr
                      style={{ cursor: dia.cantidad > 0 ? 'pointer' : 'default' }}
                      onClick={() =>
                        dia.cantidad > 0 &&
                        setDiaExpandido(diaExpandido === dia.dia ? null : dia.dia)
                      }
                    >
                      <td>
                        {String(dia.dia).padStart(2, '0')}/{String(mes + 1).padStart(2, '0')}/{anio}
                      </td>
                      <td>{dia.cantidad}</td>
                      <td>L {dia.total.toFixed(2)}</td>
                      <td>
                        {dia.cantidad > 0 && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            {diaExpandido === dia.dia ? (
                              <>
                                <ChevronUp size={16} />
                                Ocultar
                              </>
                            ) : (
                              <>
                                <ChevronDown size={16} />
                                Ver entregas
                              </>
                            )}
                          </span>
                        )}
                      </td>
                    </tr>
                    {diaExpandido === dia.dia && (
                      <tr>
                        <td colSpan={4} style={{ padding: 0 }}>
                          <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.03)' }}>
                            {dia.comisiones.map((comision) => (
                              <div
                                key={comision.id}
                                style={{
                                  marginBottom: 12,
                                  paddingBottom: 10,
                                  borderBottom: '1px solid rgba(0,0,0,0.08)',
                                }}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: 10,
                                  }}
                                >
                                  <strong style={{ fontSize: 13 }}>
                                    {comision.ordenes?.numero_orden ||
                                      `Orden #${comision.orden_id}`}
                                  </strong>
                                  <strong style={{ fontSize: 13 }}>
                                    L {Number(comision.monto || 0).toFixed(2)}
                                  </strong>
                                </div>
                                <div style={{ marginTop: 5, fontSize: 13 }}>
                                  Base de comisión: L {Number(comision.base || 0).toFixed(2)} ·{' '}
                                  {Number(comision.porcentaje || 0).toFixed(2)}%
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
