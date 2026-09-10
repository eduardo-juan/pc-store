import {
  Fragment,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { supabase } from '../../supabaseClient'
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react'

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

export default function HistorialVentas() {
  const hoy = new Date()

  const [anio, setAnio] = useState(hoy.getFullYear())
  const [mes, setMes] = useState(hoy.getMonth())

  const [ordenes, setOrdenes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [diaExpandido, setDiaExpandido] = useState(null)

  useEffect(() => {
    cargarVentasDelMes()
  }, [anio, mes])

  const cargarVentasDelMes = async () => {
    setCargando(true)
    setError('')

    const inicioMes = new Date(anio, mes, 1)
    const inicioSiguienteMes = new Date(
      anio,
      mes + 1,
      1
    )

    const { data, error } = await supabase
      .from('ordenes')
      .select(
        'id, numero_orden, total, items, created_at'
      )
      .eq('estado', 'pagada')
      .gte(
        'created_at',
        inicioMes.toISOString()
      )
      .lt(
        'created_at',
        inicioSiguienteMes.toISOString()
      )
      .order('created_at')

    if (error) {
      setError(error.message)
      setCargando(false)
      return
    }

    setOrdenes(data || [])
    setCargando(false)
  }

  const irMesAnterior = () => {
    setDiaExpandido(null)

    if (mes === 0) {
      setMes(11)
      setAnio((a) => a - 1)
    } else {
      setMes((m) => m - 1)
    }
  }

  const irMesSiguiente = () => {
    setDiaExpandido(null)

    if (mes === 11) {
      setMes(0)
      setAnio((a) => a + 1)
    } else {
      setMes((m) => m + 1)
    }
  }

  const volverMesActual = () => {
    setAnio(hoy.getFullYear())
    setMes(hoy.getMonth())
    setDiaExpandido(null)
  }

  const diasDelMes = useMemo(() => {
    const totalDias = new Date(
      anio,
      mes + 1,
      0
    ).getDate()

    const resumenPorDia = {}

    for (
      let dia = 1;
      dia <= totalDias;
      dia++
    ) {
      resumenPorDia[dia] = {
        total: 0,
        cantidad: 0,
        ordenes: [],
      }
    }

    ordenes.forEach((orden) => {
      const fecha = new Date(orden.created_at)
      const dia = fecha.getDate()

      if (resumenPorDia[dia]) {
        resumenPorDia[dia].total += Number(
          orden.total || 0
        )

        resumenPorDia[dia].cantidad += 1
        resumenPorDia[dia].ordenes.push(orden)
      }
    })

    return Array.from(
      { length: totalDias },
      (_, i) => ({
        dia: i + 1,
        ...resumenPorDia[i + 1],
      })
    )
  }, [ordenes, anio, mes])

  const totalMes = diasDelMes.reduce(
    (acumulado, d) =>
      acumulado + d.total,
    0
  )

  const ordenesDelMes = diasDelMes.reduce(
    (acumulado, d) =>
      acumulado + d.cantidad,
    0
  )

  const esMesActual =
    anio === hoy.getFullYear() &&
    mes === hoy.getMonth()

  return (
    <main className="pc-page">
      <div className="pc-container">

        <div className="pc-admin-header">
          <h1>Historial de Ventas</h1>

          <p>
            Ventas confirmadas (pagadas) por día, mes a mes.
          </p>
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <button
              type="button"
              className="pc-btn pc-btn-light"
              onClick={irMesAnterior}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
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
              onClick={irMesSiguiente}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
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
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
              }}
            >
              <RotateCcw size={17} />
              Volver al mes actual
            </button>
          )}
        </div>

        {error && (
          <div
            className="pc-card"
            style={{
              padding: 16,
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        <div
          className="pc-metrics-grid"
          style={{ marginBottom: 24 }}
        >
          <article className="pc-card pc-metric">
            <span>Total del mes</span>

            <strong>
              L {totalMes.toFixed(2)}
            </strong>
          </article>

          <article className="pc-card pc-metric">
            <span>Órdenes pagadas</span>

            <strong>
              {ordenesDelMes}
            </strong>
          </article>
        </div>

        {cargando ? (
          <div
            className="pc-card"
            style={{ padding: 20 }}
          >
            Cargando...
          </div>
        ) : (
          <div className="pc-card pc-table-wrapper">
            <table className="pc-table">
              <thead>
                <tr>
                  <th>Día</th>
                  <th>Órdenes pagadas</th>
                  <th>Total vendido</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {diasDelMes.map((d) => (
                  <Fragment key={d.dia}>

                    <tr
                      style={{
                        cursor:
                          d.cantidad > 0
                            ? 'pointer'
                            : 'default',
                      }}
                      onClick={() => {
                        if (d.cantidad === 0) return

                        setDiaExpandido(
                          diaExpandido === d.dia
                            ? null
                            : d.dia
                        )
                      }}
                    >
                      <td>
                        {String(d.dia).padStart(2, '0')}/
                        {String(mes + 1).padStart(2, '0')}/
                        {anio}
                      </td>

                      <td>{d.cantidad}</td>

                      <td>
                        L {d.total.toFixed(2)}
                      </td>

                      <td>
                        {d.cantidad > 0 &&
                          (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                              }}
                            >
                              {diaExpandido === d.dia ? (
                                <>
                                  <ChevronUp size={16} />
                                  Ocultar
                                </>
                              ) : (
                                <>
                                  <ChevronDown size={16} />
                                  Ver productos
                                </>
                              )}
                            </span>
                          )}
                      </td>
                    </tr>

                    {diaExpandido === d.dia && (
                      <tr>
                        <td
                          colSpan={4}
                          style={{ padding: 0 }}
                        >
                          <div
                            style={{
                              padding: '12px 16px',
                              background:
                                'rgba(0,0,0,0.03)',
                            }}
                          >
                            {d.ordenes.map((orden) => (
                              <div
                                key={orden.id}
                                style={{
                                  marginBottom: 12,
                                }}
                              >
                                <strong
                                  style={{
                                    fontSize: 13,
                                  }}
                                >
                                  {orden.numero_orden ||
                                    `Orden #${orden.id}`}
                                </strong>

                                <div
                                  style={{
                                    marginTop: 4,
                                  }}
                                >
                                  {(orden.items || []).map(
                                    (item, idx) => (
                                      <div
                                        key={`${orden.id}-${idx}`}
                                        style={{
                                          display: 'flex',
                                          justifyContent:
                                            'space-between',
                                          fontSize: 13,
                                          padding: '2px 0',
                                        }}
                                      >
                                        <span>
                                          {item.cantidad}×{' '}
                                          {item.nombre}
                                        </span>

                                        <span>
                                          L{' '}
                                          {Number(
                                            item.subtotal || 0
                                          ).toFixed(2)}
                                        </span>
                                      </div>
                                    )
                                  )}
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