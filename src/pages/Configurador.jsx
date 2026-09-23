import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import BotonAtras from '../components/BotonAtras'
import '../styles/configurador.css'
import { useCarrito } from '../context/CarritoContext'
import {
  obtenerTodosLosComponentes,
} from '../services/configuradorService'
import {
  esCompatible,
} from '../utils/compatibilidad'

const TIPOS = [
  { key: 'cpu', label: 'Procesador' },
  { key: 'motherboard', label: 'Placa madre' },
  { key: 'ram', label: 'Memoria RAM' },
  { key: 'gpu', label: 'Tarjeta gráfica' },
  { key: 'storage', label: 'Almacenamiento' },
  { key: 'psu', label: 'Fuente de poder' },
  { key: 'case', label: 'Gabinete' },
  { key: 'cooler', label: 'Refrigeración' },
]

function obtenerPrecio(componente) {
  const producto = componente?.producto || {}

  return Number(
    producto.precio_descuento ??
      producto.precio ??
      componente?.precio ??
      0
  )
}

function formatearPrecio(valor) {
  return new Intl.NumberFormat('es-HN', {
    style: 'currency',
    currency: 'HNL',
    minimumFractionDigits: 2,
  }).format(Number(valor) || 0)
}

function obtenerNombre(componente) {
  const producto = componente?.producto || {}

  return (
    producto.nombre ||
    [producto.marca, producto.modelo]
      .filter(Boolean)
      .join(' ') ||
    componente?.nombre ||
    'Componente'
  )
}

function obtenerStock(componente) {
  return Number(componente?.producto?.stock ?? componente?.stock ?? 0)
}

function obtenerImagen(componente) {
  return (
    componente?.producto?.imagen_principal ||
    componente?.imagen_principal ||
    null
  )
}

function crearConfiguracionParaCompatibilidad(seleccionados) {
  return Object.fromEntries(
    Object.entries(seleccionados).filter(
      ([, componente]) => Boolean(componente)
    )
  )
}

function obtenerDetallesPorTipo(detalles, tipo) {
  return (detalles || []).filter(
    (detalle) => detalle.componente === tipo
  )
}

function obtenerEstadoComponente(detalles, tipo) {
  const detallesComponente = obtenerDetallesPorTipo(detalles, tipo)

  if (
    detallesComponente.some(
      (detalle) => detalle.estado === 'incompatible'
    )
  ) {
    return 'incompatible'
  }

  if (
    detallesComponente.some(
      (detalle) => detalle.estado === 'advertencia'
    )
  ) {
    return 'advertencia'
  }

  if (
    detallesComponente.some(
      (detalle) => detalle.estado === 'compatible'
    )
  ) {
    return 'compatible'
  }

  return 'pendiente'
}

function obtenerEstiloEstado(estado) {
  switch (estado) {
    case 'compatible':
      return {
        color: '#166534',
        background: '#dcfce7',
        border: '#86efac',
        texto: 'Compatible',
      }

    case 'advertencia':
      return {
        color: '#92400e',
        background: '#fef3c7',
        border: '#fcd34d',
        texto: 'Advertencia',
      }

    case 'incompatible':
      return {
        color: '#991b1b',
        background: '#fee2e2',
        border: '#fca5a5',
        texto: 'Incompatible',
      }

    default:
      return {
        color: '#475569',
        background: '#f1f5f9',
        border: '#cbd5e1',
        texto: 'Pendiente',
      }
  }
}

function obtenerEstadoOpcion(tipo, componente, seleccionados) {
  const configuracion = {
    ...seleccionados,
    [tipo]: componente,
  }

  const resultado = esCompatible(
    crearConfiguracionParaCompatibilidad(configuracion)
  )

  return resultado
}

export default function Configurador() {
  const navigate = useNavigate()
  const { agregarConfiguracion } = useCarrito()

  const [componentes, setComponentes] = useState([])
  const [seleccionados, setSeleccionados] = useState({})
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [agregando, setAgregando] = useState(false)

  useEffect(() => {
    let activo = true

    async function cargarComponentes() {
      try {
        setCargando(true)
        setError(null)

        const datos = await obtenerTodosLosComponentes()

        if (!activo) return

        setComponentes(Array.isArray(datos) ? datos : [])
      } catch (err) {
        console.error('Error cargando configurador:', err)

        if (!activo) return

        setError(
          err?.message ||
            'No se pudieron cargar los componentes del configurador.'
        )
      } finally {
        if (activo) {
          setCargando(false)
        }
      }
    }

    cargarComponentes()

    return () => {
      activo = false
    }
  }, [])

  const componentesPorTipo = useMemo(() => {
    const resultado = {}

    TIPOS.forEach(({ key }) => {
      resultado[key] = componentes.filter(
        (componente) => componente.tipo === key
      )
    })

    return resultado
  }, [componentes])

  const configuracion = useMemo(
    () => crearConfiguracionParaCompatibilidad(seleccionados),
    [seleccionados]
  )

  const resultadoCompatibilidad = useMemo(() => {
    return esCompatible(configuracion)
  }, [configuracion])

  const detalles = resultadoCompatibilidad?.detalles || []
  const errores = resultadoCompatibilidad?.errores || []
  const advertencias = resultadoCompatibilidad?.advertencias || []

  const cantidadSeleccionada = Object.keys(seleccionados).length

  const configuracionCompleta =
    TIPOS.every(({ key }) => Boolean(seleccionados[key]))

  const total = useMemo(() => {
    return Object.values(seleccionados).reduce(
      (suma, componente) => suma + obtenerPrecio(componente),
      0
    )
  }, [seleccionados])

  const consumoEstimado = useMemo(() => {
    return Object.values(seleccionados).reduce((suma, componente) => {
      const valor =
        componente?.consumo_w ??
        componente?.producto?.especificaciones?.consumo_w ??
        0

      return suma + (Number(valor) || 0)
    }, 0)
  }, [seleccionados])

  const capacidadFuente = useMemo(() => {
    const fuente = seleccionados.psu

    if (!fuente) return 0

    return Number(
      fuente.capacidad_w ??
        fuente.producto?.especificaciones?.capacidad_w ??
        0
    )
  }, [seleccionados])

  const margenFuente =
    capacidadFuente > 0
      ? capacidadFuente - consumoEstimado
      : null

  function seleccionar(tipo, componenteId) {
    const componente = componentesPorTipo[tipo]?.find(
      (item) => String(item.id) === String(componenteId)
    )

    setSeleccionados((actual) => {
      const siguiente = { ...actual }

      if (!componente) {
        delete siguiente[tipo]
      } else {
        siguiente[tipo] = componente
      }

      return siguiente
    })
  }

  function limpiarSeleccion(tipo) {
    setSeleccionados((actual) => {
      const siguiente = { ...actual }
      delete siguiente[tipo]
      return siguiente
    })
  }

  async function agregarConfiguracionAlCarrito() {
    if (!configuracionCompleta) {
      window.alert(
        'Debes seleccionar todos los componentes antes de agregar la configuración al carrito.'
      )
      return
    }

    if (errores.length > 0) {
      window.alert(
        'La configuración contiene incompatibilidades. Corrígelas antes de continuar.'
      )
      return
    }

    const sinStock = Object.values(seleccionados).some(
      (componente) => obtenerStock(componente) <= 0
    )

    if (sinStock) {
      window.alert(
        'Uno o más componentes seleccionados no tienen stock disponible.'
      )
      return
    }

    try {
      setAgregando(true)

      const resultado = await agregarConfiguracion(
        Object.values(seleccionados)
      )

      if (!resultado?.success) {
        throw new Error(
          resultado?.message ||
            'No se pudo agregar la configuración al carrito.'
        )
      }

      navigate('/carrito')
    } catch (err) {
      console.error(
        'Error agregando configuración al carrito:',
        err
      )

      window.alert(
        err?.message ||
          'No se pudo agregar la configuración al carrito.'
      )
    } finally {
      setAgregando(false)
    }
  }

  if (cargando) {
    return (
      <main className="pc-page">
        <BotonAtras />

        <div className="pc-card">
          <h1>Configurador de PC</h1>
          <p>Cargando componentes...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="pc-page">
        <BotonAtras />

        <div className="pc-card">
          <h1>Error en el configurador</h1>

          <p style={{ color: '#b91c1c' }}>
            {error}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="pc-btn pc-btn-primary"
          >
            Reintentar
          </button>
        </div>
      </main>
    )
  }

  return (
    <main
      className="pc-page configurador-page"
      style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '24px',
      }}
    >
      <BotonAtras />

      <section
        className="pc-card configurador-hero"
        style={{
          marginBottom: '24px',
        }}
      >
        <h1
          style={{
            marginBottom: '8px',
            fontSize: '32px',
          }}
        >
          Configurador de PC
        </h1>

        <p style={{ margin: 0 }}>
          Selecciona los componentes y el sistema analizará
          automáticamente sus relaciones de compatibilidad.
        </p>

        <div
          style={{
            marginTop: '16px',
            padding: '12px 16px',
            borderRadius: '8px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            color: '#1e40af',
          }}
        >
          <strong>Modo piloto:</strong>{' '}
          la ausencia de información técnica no se considera
          automáticamente una incompatibilidad.
        </div>
      </section>

      {errores.length > 0 && (
        <section
          className="pc-card"
          style={{
            marginBottom: '24px',
            border: '1px solid #fca5a5',
            background: '#fef2f2',
          }}
        >
          <h2
            style={{
              color: '#991b1b',
              marginTop: 0,
            }}
          >
            Incompatibilidades detectadas
          </h2>

          <ul style={{ marginBottom: 0 }}>
            {errores.map((errorItem, index) => (
              <li key={index}>
                {typeof errorItem === 'string'
                  ? errorItem
                  : errorItem?.mensaje ||
                    errorItem?.message ||
                    'Incompatibilidad detectada.'}
              </li>
            ))}
          </ul>
        </section>
      )}

      {advertencias.length > 0 && (
        <section
          className="pc-card"
          style={{
            marginBottom: '24px',
            border: '1px solid #fcd34d',
            background: '#fffbeb',
          }}
        >
          <h2
            style={{
              color: '#92400e',
              marginTop: 0,
            }}
          >
            Advertencias
          </h2>

          <ul style={{ marginBottom: 0 }}>
            {advertencias.map((advertencia, index) => (
              <li key={index}>
                {typeof advertencia === 'string'
                  ? advertencia
                  : advertencia?.mensaje ||
                    advertencia?.message ||
                    'Advertencia.'}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section
        className="pc-card configurador-analysis"
        style={{
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '20px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>
              Análisis de compatibilidad
            </h2>

            <p
              style={{
                margin: '6px 0 0',
                color: '#64748b',
              }}
            >
              {cantidadSeleccionada} de {TIPOS.length}{' '}
              componentes seleccionados.
            </p>
          </div>

          {cantidadSeleccionada > 0 && (
            <button
              type="button"
              onClick={() => setSeleccionados({})}
              className="pc-btn"
            >
              Limpiar configuración
            </button>
          )}
        </div>

        {cantidadSeleccionada === 0 ? (
          <div
            style={{
              padding: '24px',
              borderRadius: '10px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              textAlign: 'center',
              color: '#64748b',
            }}
          >
            Selecciona componentes para comenzar el análisis.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {TIPOS.map(({ key, label }) => {
              const componente = seleccionados[key]
              const estado = obtenerEstadoComponente(
                detalles,
                key
              )
              const estilo = obtenerEstiloEstado(estado)
              const detallesComponente =
                obtenerDetallesPorTipo(detalles, key)

              return (
                <article
                  key={key}
                  style={{
                    border: `1px solid ${estilo.border}`,
                    borderRadius: '10px',
                    padding: '16px',
                    background: estilo.background,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '10px',
                      alignItems: 'flex-start',
                      marginBottom: '12px',
                    }}
                  >
                    <div>
                      <strong>{label}</strong>

                      <div
                        style={{
                          marginTop: '4px',
                          fontSize: '14px',
                          color: '#475569',
                        }}
                      >
                        {componente
                          ? obtenerNombre(componente)
                          : 'Sin seleccionar'}
                      </div>
                    </div>

                    <span
                      style={{
                        whiteSpace: 'nowrap',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: estilo.color,
                      }}
                    >
                      {estilo.texto}
                    </span>
                  </div>

                  {detallesComponente.length > 0 ? (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      {detallesComponente.map(
                        (detalle, index) => {
                          const estiloDetalle =
                            obtenerEstiloEstado(
                              detalle.estado
                            )

                          return (
                            <div
                              key={`${key}-${index}`}
                              style={{
                                padding: '10px',
                                borderRadius: '8px',
                                background: '#fff',
                                border: `1px solid ${estiloDetalle.border}`,
                              }}
                            >
                              <div
                                style={{
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  color:
                                    estiloDetalle.color,
                                  marginBottom: '4px',
                                }}
                              >
                                {detalle.relacion}
                              </div>

                              <div
                                style={{
                                  fontSize: '13px',
                                  color: '#334155',
                                }}
                              >
                                {detalle.mensaje}
                              </div>
                            </div>
                          )
                        }
                      )}
                    </div>
                  ) : (
                    <div
                      style={{
                        fontSize: '13px',
                        color: '#64748b',
                      }}
                    >
                      Aún no hay suficiente información para
                      analizar este componente.
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section
        className="configurador-workspace"
        style={{
          display: 'grid',
          gridTemplateColumns:
            'minmax(0, 1fr) 340px',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        <div
          className="configurador-componentes"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {TIPOS.map(({ key, label }) => {
            const lista = componentesPorTipo[key] || []
            const seleccionado = seleccionados[key]

            return (
              <section
                className="pc-card configurador-component-card"
                key={key}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    alignItems: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <div>
                    <h2 style={{ margin: 0 }}>
                      {label}
                    </h2>

                    {seleccionado && (
                      <small
                        style={{
                          color: '#64748b',
                        }}
                      >
                        {obtenerNombre(seleccionado)}
                      </small>
                    )}
                  </div>

                  {seleccionado && (
                    <button
                      type="button"
                      className="pc-btn"
                      onClick={() =>
                        limpiarSeleccion(key)
                      }
                    >
                      Quitar
                    </button>
                  )}
                </div>

                <select
                  value={seleccionado?.id ?? ''}
                  onChange={(event) =>
                    seleccionar(
                      key,
                      event.target.value
                    )
                  }
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                  }}
                >
                  <option value="">
                    Seleccionar {label.toLowerCase()}
                  </option>

                  {lista.map((componente) => {
                    const stock =
                      obtenerStock(componente)

                    const resultadoOpcion =
                      obtenerEstadoOpcion(
                        key,
                        componente,
                        seleccionados
                      )

                    const incompatible =
                      resultadoOpcion.errores?.length > 0

                    const sinStock = stock <= 0

                    const deshabilitado =
                      sinStock || incompatible

                    return (
                      <option
                        key={componente.id}
                        value={componente.id}
                        disabled={
                          deshabilitado &&
                          componente.id !==
                            seleccionado?.id
                        }
                      >
                        {obtenerNombre(componente)} —{' '}
                        {formatearPrecio(
                          obtenerPrecio(componente)
                        )}
                        {sinStock
                          ? ' — Sin stock'
                          : incompatible
                            ? ' — Incompatible'
                            : ''}
                      </option>
                    )
                  })}
                </select>

                {seleccionado && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '16px',
                      marginTop: '12px',
                      alignItems: 'center',
                    }}
                  >
                    {obtenerImagen(seleccionado) && (
                      <img
                        src={obtenerImagen(
                          seleccionado
                        )}
                        alt={obtenerNombre(
                          seleccionado
                        )}
                        style={{
                          width: '72px',
                          height: '72px',
                          objectFit: 'contain',
                          borderRadius: '8px',
                          background: '#f8fafc',
                        }}
                      />
                    )}

                    <div>
                      <strong>
                        {formatearPrecio(
                          obtenerPrecio(
                            seleccionado
                          )
                        )}
                      </strong>

                      <div
                        style={{
                          fontSize: '13px',
                          color:
                            obtenerStock(
                              seleccionado
                            ) > 0
                              ? '#166534'
                              : '#991b1b',
                          marginTop: '4px',
                        }}
                      >
                        Stock:{' '}
                        {obtenerStock(
                          seleccionado
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )
          })}
        </div>

        <aside
          className="pc-card configurador-summary"
          style={{
            position: 'sticky',
            top: '20px',
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            Resumen
          </h2>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>Componentes</span>
              <strong>
                {cantidadSeleccionada}/{TIPOS.length}
              </strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>Consumo estimado</span>
              <strong>
                {consumoEstimado} W
              </strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>Fuente seleccionada</span>
              <strong>
                {capacidadFuente
                  ? `${capacidadFuente} W`
                  : '—'}
              </strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>Margen de fuente</span>
              <strong
                style={{
                  color:
                    margenFuente !== null &&
                    margenFuente < 0
                      ? '#991b1b'
                      : undefined,
                }}
              >
                {margenFuente !== null
                  ? `${margenFuente} W`
                  : '—'}
              </strong>
            </div>

            <hr />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <strong>Total</strong>

              <strong
                style={{
                  fontSize: '22px',
                }}
              >
                {formatearPrecio(total)}
              </strong>
            </div>

            <button
              type="button"
              className="pc-btn pc-btn-primary"
              disabled={
                !configuracionCompleta ||
                errores.length > 0 ||
                agregando
              }
              onClick={agregarConfiguracionAlCarrito}
              style={{
                width: '100%',
                marginTop: '8px',
              }}
            >
              {agregando
                ? 'Agregando...'
                : errores.length > 0
                  ? 'Corregir incompatibilidades'
                  : !configuracionCompleta
                    ? 'Completar configuración'
                    : 'Agregar configuración al carrito'}
            </button>

            {configuracionCompleta &&
              errores.length === 0 &&
              advertencias.length > 0 && (
                <p
                  style={{
                    margin: 0,
                    fontSize: '12px',
                    color: '#92400e',
                  }}
                >
                  La configuración puede continuar,
                  pero contiene advertencias que debes
                  revisar.
                </p>
              )}
          </div>
        </aside>
      </section>
    </main>
  )
}