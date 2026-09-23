import { useEffect, useMemo, useState } from 'react'

import { supabase } from '../../supabaseClient'
import { useAuth } from '../../hooks/useAuth'
import BotonAtras from '../../components/BotonAtras'

const ORDENES_POR_PAGINA = 8

const ESTADOS = [
  ['pendiente', 'Pendiente'],
  ['pagada', 'Pagada'],
  ['enviada', 'Enviada'],
  ['entregada', 'Entregada'],
  ['cancelada', 'Cancelada'],
]

const ESTADOS_ACTIVOS = ['pendiente', 'pagada', 'enviada']

const estiloEstado = {
  pendiente: {
    background: '#fff7ed',
    border: '#fed7aa',
    color: '#c2410c',
  },
  pagada: {
    background: '#eff6ff',
    border: '#bfdbfe',
    color: '#1d4ed8',
  },
  enviada: {
    background: '#f5f3ff',
    border: '#ddd6fe',
    color: '#6d28d9',
  },
  entregada: {
    background: '#f0fdf4',
    border: '#bbf7d0',
    color: '#15803d',
  },
  cancelada: {
    background: '#fef2f2',
    border: '#fecaca',
    color: '#b91c1c',
  },
}

const limpiarBusqueda = (valor = '') =>
  String(valor)
    .replace(/[^\p{L}\p{N}\s@._-]/gu, '')
    .slice(0, 100)

export default function GestionOrdenes() {
  const { usuario, esAdmin, esEmpleado } = useAuth()

  const [ordenes, setOrdenes] = useState([])
  const [proveedores, setProveedores] = useState({})
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)

  const [filtro, setFiltro] = useState('todas')
  const [fecha, setFecha] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)

  const [cancelacion, setCancelacion] = useState(null)
  const [motivo, setMotivo] = useState('')
  const [procesando, setProcesando] = useState(false)

  useEffect(() => {
    cargarOrdenes()
  }, [usuario, esAdmin, esEmpleado])

  useEffect(() => {
    setPagina(1)
  }, [filtro, fecha, busqueda])

  const cargarOrdenes = async () => {
    setError('')

    if (esEmpleado && !usuario?.id) {
      setError('No se pudo identificar al empleado actual.')
      setCargando(false)
      return
    }

    setCargando(true)

    let consulta = supabase
      .from('ordenes')
      .select('*')
      .order('created_at', { ascending: false })

    if (esEmpleado && !esAdmin) {
      consulta = consulta.eq('empleado_id', usuario.id)
    }

    const { data, error: consultaError } = await consulta

    if (consultaError) {
      setError(consultaError.message)
      setCargando(false)
      return
    }

    const cargadas = data || []

    setOrdenes(cargadas)

    /*
     * Reunir todos los productos que aparecen en las órdenes.
     *
     * En una orden normal:
     *   item.producto_id
     *
     * En una PC configurada:
     *   item.componentes[].producto_id
     */
    if (esAdmin) {
      const ids = [
        ...new Set(
          cargadas.flatMap((orden) =>
            (orden.items || []).flatMap((item) => {
              if (item.tipo === 'configurador') {
                return (item.componentes || [])
                  .map((componente) => componente.producto_id)
                  .filter(Boolean)
              }

              return item.producto_id ? [item.producto_id] : []
            }),
          ),
        ),
      ]

      if (ids.length) {
        const {
          data: productos,
          error: proveedoresError,
        } = await supabase
          .from('producto_proveedores')
          .select('producto_id, proveedor, url_compra, activo')
          .in('producto_id', ids)
          .eq('activo', true)

        if (proveedoresError) {
          setError(proveedoresError.message)
        }

        const mapa = {}

        ;(productos || []).forEach((producto) => {
          if (!mapa[producto.producto_id]) {
            mapa[producto.producto_id] = producto
          }
        })

        setProveedores(mapa)
      } else {
        setProveedores({})
      }
    } else {
      setProveedores({})
    }

    setCargando(false)
  }

  const cambiarEstado = async (id, nuevoEstado) => {
    setError('')

    const orden = ordenes.find((item) => item.id === id)

    if (!orden) {
      setError('No se encontró la orden.')
      return
    }

    const actual = orden.estado || 'pendiente'

    if (actual === 'cancelada') {
      setError('Una orden cancelada no puede modificarse.')
      return
    }

    if (nuevoEstado === 'cancelada') {
      if (!esAdmin) {
        setError('Solo el administrador puede cancelar órdenes.')
        return
      }

      setMotivo('')
      setCancelacion(orden)
      return
    }

    const datos = {
      estado: nuevoEstado,
    }

    if (esEmpleado) {
      datos.empleado_id = usuario.id
    }

    const { error: updateError } = await supabase
      .from('ordenes')
      .update(datos)
      .eq('id', id)

    if (updateError) {
      setError(updateError.message)
      return
    }

    await cargarOrdenes()
  }

  const confirmarCancelacion = async () => {
    if (!cancelacion) return

    const texto = motivo.trim()

    if (!texto) {
      setError('Debes indicar al cliente el motivo de la cancelación.')
      return
    }

    setProcesando(true)
    setError('')

    const { error: rpcError } = await supabase.rpc(
      'cancelar_orden_pc_store',
      {
        p_orden_id: cancelacion.id,
        p_motivo: texto,
      },
    )

    if (rpcError) {
      setError(rpcError.message)
      setProcesando(false)
      return
    }

    setCancelacion(null)
    setMotivo('')
    setProcesando(false)

    await cargarOrdenes()
  }

  const ordenesFiltradas = useMemo(() => {
    const q = busqueda.trim().toLocaleLowerCase()

    return ordenes.filter((orden) => {
      const estado = orden.estado || 'pendiente'

      if (
        filtro === 'activas' &&
        !ESTADOS_ACTIVOS.includes(estado)
      ) {
        return false
      }

      if (
        filtro !== 'todas' &&
        filtro !== 'activas' &&
        estado !== filtro
      ) {
        return false
      }

      if (
        fecha &&
        orden.created_at &&
        new Date(orden.created_at).toLocaleDateString('en-CA') !== fecha
      ) {
        return false
      }

      if (q) {
        const nombresProductos = (orden.items || []).flatMap((item) => {
          if (item.tipo === 'configurador') {
            return [
              item.nombre,
              ...(item.componentes || []).map(
                (componente) => componente.nombre,
              ),
            ]
          }

          return [item.nombre]
        })

        const texto = [
          orden.id,
          orden.numero_orden,
          orden.nombre_cliente,
          orden.apellido_cliente,
          orden.email,
          orden.teléfono_contacto,
          orden.dirección_envío,
          orden.ciudad_envío,
          orden.referencia,
          orden.tipo_orden,
          ...nombresProductos,
        ]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase()

        if (!texto.includes(q)) {
          return false
        }
      }

      return true
    })
  }, [ordenes, filtro, fecha, busqueda])

  const totalPaginas = Math.max(
    1,
    Math.ceil(
      ordenesFiltradas.length / ORDENES_POR_PAGINA,
    ),
  )

  const paginaActual = Math.min(pagina, totalPaginas)

  const ordenesPagina = ordenesFiltradas.slice(
    (paginaActual - 1) * ORDENES_POR_PAGINA,
    paginaActual * ORDENES_POR_PAGINA,
  )

  const obtenerTipoOrden = (orden) => {
    if (orden.tipo_orden === 'configurador') {
      return 'PC configurada'
    }

    if (orden.tipo_orden === 'mixta') {
      return 'Compra mixta'
    }

    return 'Productos'
  }

  return (
    <main className="pc-page">
      <div className="pc-container">
        <BotonAtras />

        <div className="pc-admin-header">
          <h1>Gestión de Órdenes</h1>

          <p>
            {esEmpleado
              ? 'Gestiona las órdenes asignadas a ti.'
              : 'Administra pedidos, entregas, estados y cancelaciones.'}
          </p>
        </div>

        {error && (
          <div
            className="pc-card"
            style={{
              padding: 14,
              marginBottom: 18,
              color: '#dc2626',
            }}
          >
            {error}
          </div>
        )}

        <div
          className="pc-card"
          style={{
            padding: 14,
            marginBottom: 20,
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <input
            className="pc-input"
            value={busqueda}
            onChange={(e) =>
              setBusqueda(limpiarBusqueda(e.target.value))
            }
            placeholder="Buscar orden, cliente, correo, teléfono o producto..."
            aria-label="Buscar órdenes"
            style={{
              minWidth: 280,
              flex: '1 1 280px',
            }}
          />

          <select
            className="pc-select"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            style={{ minWidth: 190 }}
          >
            <option value="todas">Todas las órdenes</option>
            <option value="activas">Activas</option>
            <option value="pendiente">Pendientes</option>
            <option value="pagada">Pagadas</option>
            <option value="enviada">Enviadas</option>
            <option value="entregada">Entregadas</option>
            <option value="cancelada">Canceladas</option>
          </select>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Día:

            <input
              type="date"
              className="pc-input"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </label>

          {(fecha || filtro !== 'todas' || busqueda) && (
            <button
              type="button"
              className="pc-btn pc-btn-light"
              onClick={() => {
                setFecha('')
                setFiltro('todas')
                setBusqueda('')
              }}
            >
              Limpiar
            </button>
          )}

          <span
            style={{
              marginLeft: 'auto',
              fontWeight: 600,
            }}
          >
            {ordenesFiltradas.length} órdenes
          </span>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          {cargando ? (
            <div
              className="pc-card"
              style={{
                padding: 30,
                textAlign: 'center',
              }}
            >
              Cargando órdenes...
            </div>
          ) : ordenesPagina.length === 0 ? (
            <div
              className="pc-card"
              style={{
                padding: 30,
                textAlign: 'center',
              }}
            >
              No hay órdenes para mostrar.
            </div>
          ) : (
            ordenesPagina.map((orden) => {
              const estado = orden.estado || 'pendiente'

              const estilo =
                estiloEstado[estado] ||
                estiloEstado.pendiente

              const subtotal = Number(
                orden.subtotal || 0,
              )

              const envio = Number(
                orden.envío || 0,
              )

              const descuento = Number(
                orden.descuento || 0,
              )

              const total = Number(
                orden.total || 0,
              )

              return (
                <article
                  key={orden.id}
                  className="pc-card"
                  style={{
                    padding: 20,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 16,
                      flexWrap: 'wrap',
                      marginBottom: 18,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          color: '#666',
                          marginBottom: 4,
                        }}
                      >
                        Orden #{orden.id} ·{' '}
                        {orden.numero_orden ||
                          'Sin número'}
                      </div>

                      <h2
                        style={{
                          margin: 0,
                          fontSize: 20,
                        }}
                      >
                        {orden.nombre_cliente}{' '}
                        {orden.apellido_cliente}
                      </h2>

                      <div
                        style={{
                          marginTop: 5,
                          color: '#666',
                          fontSize: 13,
                        }}
                      >
                        {orden.email ||
                          'Sin correo'}{' '}
                        ·{' '}
                        {orden.created_at
                          ? new Date(
                              orden.created_at,
                            ).toLocaleString()
                          : '-'}
                      </div>

                      <div
                        style={{
                          marginTop: 8,
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '5px 9px',
                          borderRadius: 8,
                          background: '#f3f4f6',
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {obtenerTipoOrden(orden)}
                      </div>
                    </div>

                    <div
                      style={{
                        textAlign: 'right',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 800,
                        }}
                      >
                        L {total.toFixed(2)}
                      </div>

                      <div
                        style={{
                          marginTop: 7,
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '5px 10px',
                          borderRadius: 999,
                          background: estilo.background,
                          border: `1px solid ${estilo.border}`,
                          color: estilo.color,
                          fontSize: 12,
                          fontWeight: 800,
                        }}
                      >
                        {ESTADOS.find(
                          ([valor]) =>
                            valor === estado,
                        )?.[1] || estado}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit,minmax(220px,1fr))',
                      gap: 14,
                      marginBottom: 18,
                    }}
                  >
                    <section
                      style={{
                        background: '#fafafa',
                        borderRadius: 12,
                        padding: 14,
                      }}
                    >
                      <strong>Entrega</strong>

                      <div
                        style={{
                          marginTop: 8,
                          fontSize: 13,
                          lineHeight: 1.7,
                        }}
                      >
                        <div>
                          <b>Tel:</b>{' '}
                          {orden.teléfono_contacto ||
                            '-'}
                        </div>

                        <div>
                          <b>Dirección:</b>{' '}
                          {orden.dirección_envío ||
                            '-'}
                        </div>

                        <div>
                          <b>Ciudad:</b>{' '}
                          {orden.ciudad_envío ||
                            '-'}
                        </div>

                        <div>
                          <b>Referencia:</b>{' '}
                          {orden.referencia || '-'}
                        </div>

                        {orden.notas && (
                          <div>
                            <b>Notas:</b>{' '}
                            {orden.notas}
                          </div>
                        )}
                      </div>
                    </section>

                    <section
                      style={{
                        background: '#fafafa',
                        borderRadius: 12,
                        padding: 14,
                      }}
                    >
                      <strong>Resumen</strong>

                      <div
                        style={{
                          marginTop: 8,
                          fontSize: 13,
                          lineHeight: 1.8,
                        }}
                      >
                        <div>
                          Subtotal:{' '}
                          <b>
                            L {subtotal.toFixed(2)}
                          </b>
                        </div>

                        <div>
                          Envío:{' '}
                          <b>
                            L {envio.toFixed(2)}
                          </b>
                        </div>

                        {descuento > 0 && (
                          <div>
                            Descuento:{' '}
                            <b>
                              -L{' '}
                              {descuento.toFixed(
                                2,
                              )}
                            </b>
                          </div>
                        )}

                        <div>
                          Método de pago:{' '}
                          <b>
                            {orden[
                              'método_pago'
                            ] ||
                              orden.metodo_pago ||
                              '-'}
                          </b>
                        </div>

                        {orden.cupon_codigo && (
                          <div>
                            Cupón:{' '}
                            <b>
                              {orden.cupon_codigo}
                            </b>
                          </div>
                        )}
                      </div>
                    </section>

                    <section
                      style={{
                        background: '#fafafa',
                        borderRadius: 12,
                        padding: 14,
                      }}
                    >
                      <strong>Productos</strong>

                      <div
                        style={{
                          marginTop: 8,
                          fontSize: 13,
                          lineHeight: 1.7,
                        }}
                      >
                        {(orden.items || []).map(
                          (item, index) => {
                            const esConfigurador =
                              item.tipo ===
                              'configurador'

                            if (
                              esConfigurador
                            ) {
                              return (
                                <div
                                  key={`${orden.id}-config-${index}`}
                                  style={{
                                    marginBottom: 12,
                                    padding: 10,
                                    background:
                                      '#fff',
                                    border:
                                      '1px solid rgba(0,0,0,.08)',
                                    borderRadius: 10,
                                  }}
                                >
                                  <div
                                    style={{
                                      fontWeight: 800,
                                      marginBottom: 6,
                                    }}
                                  >
                                    PC Configurada
                                  </div>

                                  <div
                                    style={{
                                      fontSize: 12,
                                      color: '#666',
                                      marginBottom: 7,
                                    }}
                                  >
                                    Cantidad:{' '}
                                    {Number(
                                      item.cantidad ||
                                        1,
                                    )}
                                  </div>

                                  <div
                                    style={{
                                      fontWeight: 700,
                                      marginBottom: 5,
                                    }}
                                  >
                                    Componentes
                                  </div>

                                  <div
                                    style={{
                                      display: 'grid',
                                      gap: 5,
                                    }}
                                  >
                                    {(
                                      item.componentes ||
                                      []
                                    ).map(
                                      (
                                        componente,
                                        componenteIndex,
                                      ) => {
                                        const proveedor =
                                          esAdmin
                                            ? proveedores[
                                                componente
                                                  .producto_id
                                              ]
                                            : null

                                        return (
                                          <div
                                            key={`${orden.id}-config-${index}-${componente.producto_id || componenteIndex}`}
                                            style={{
                                              padding:
                                                '5px 0',
                                              borderBottom:
                                                '1px solid rgba(0,0,0,.06)',
                                            }}
                                          >
                                            <div>
                                              {Number(
                                                componente.cantidad ||
                                                  1,
                                              )}
                                              ×{' '}
                                              {
                                                componente.nombre
                                              }
                                            </div>

                                            {componente.precio !=
                                              null && (
                                              <div
                                                style={{
                                                  fontSize: 12,
                                                  color: '#666',
                                                }}
                                              >
                                                L{' '}
                                                {Number(
                                                  componente.precio,
                                                ).toFixed(
                                                  2,
                                                )}
                                              </div>
                                            )}

                                            {proveedor?.url_compra && (
                                              <a
                                                href={
                                                  proveedor.url_compra
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="pc-btn pc-btn-light"
                                                style={{
                                                  display:
                                                    'inline-block',
                                                  marginTop: 3,
                                                  padding:
                                                    '4px 8px',
                                                  fontSize: 11,
                                                  textDecoration:
                                                    'none',
                                                }}
                                              >
                                                Comprar
                                                {' en '}
                                                {proveedor.proveedor ||
                                                  'proveedor'}
                                              </a>
                                            )}
                                          </div>
                                        )
                                      },
                                    )}
                                  </div>

                                  <div
                                    style={{
                                      marginTop: 9,
                                      paddingTop: 8,
                                      borderTop:
                                        '1px solid rgba(0,0,0,.08)',
                                      fontSize: 12,
                                    }}
                                  >
                                    Componentes:{' '}
                                    <b>
                                      L{' '}
                                      {Number(
                                        item.precio_componentes ||
                                          0,
                                      ).toFixed(
                                        2,
                                      )}
                                    </b>
                                  </div>

                                  <div
                                    style={{
                                      fontSize: 12,
                                    }}
                                  >
                                    Armado:{' '}
                                    <b>
                                      L{' '}
                                      {Number(
                                        item.costo_armado ||
                                          1500,
                                      ).toFixed(
                                        2,
                                      )}
                                    </b>
                                  </div>

                                  <div
                                    style={{
                                      marginTop: 5,
                                      fontSize: 13,
                                      fontWeight: 800,
                                    }}
                                  >
                                    Total PC:{' '}
                                    L{' '}
                                    {(
                                      Number(
                                        item.precio ||
                                          0,
                                      ) *
                                      Number(
                                        item.cantidad ||
                                          1,
                                      )
                                    ).toFixed(2)}
                                  </div>
                                </div>
                              )
                            }

                            const proveedor = esAdmin
                              ? proveedores[
                                  item.producto_id
                                ]
                              : null

                            return (
                              <div
                                key={`${orden.id}-${item.producto_id || index}`}
                                style={{
                                  marginBottom: 10,
                                }}
                              >
                                <div>
                                  {Number(
                                    item.cantidad ||
                                      1,
                                  )}
                                  ×{' '}
                                  {item.nombre ||
                                    'Producto'}
                                </div>

                                {item.precio !=
                                  null && (
                                  <div
                                    style={{
                                      fontSize: 12,
                                      color: '#666',
                                    }}
                                  >
                                    L{' '}
                                    {Number(
                                      item.precio,
                                    ).toFixed(2)}
                                  </div>
                                )}

                                {proveedor?.url_compra && (
                                  <a
                                    href={
                                      proveedor.url_compra
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="pc-btn pc-btn-light"
                                    style={{
                                      display:
                                        'inline-block',
                                      marginTop: 3,
                                      padding:
                                        '4px 8px',
                                      fontSize: 11,
                                      textDecoration:
                                        'none',
                                    }}
                                  >
                                    Comprar en{' '}
                                    {proveedor.proveedor ||
                                      'proveedor'}
                                  </a>
                                )}
                              </div>
                            )
                          },
                        )}
                      </div>
                    </section>
                  </div>

                  {estado === 'cancelada' &&
                    orden.motivo_cancelacion && (
                      <div
                        style={{
                          background: '#fef2f2',
                          border:
                            '1px solid #fecaca',
                          borderRadius: 10,
                          padding: 12,
                          marginBottom: 16,
                          color: '#991b1b',
                        }}
                      >
                        <b>
                          Motivo de cancelación:
                        </b>{' '}
                        {orden.motivo_cancelacion}
                      </div>
                    )}

                  <div
                    style={{
                      borderTop:
                        '1px solid rgba(0,0,0,.08)',
                      paddingTop: 16,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        marginBottom: 9,
                      }}
                    >
                      Estado de la orden
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 8,
                      }}
                    >
                      {ESTADOS.filter(
                        ([valor]) =>
                          estado === 'cancelada'
                            ? valor === estado
                            : estado === 'pagada'
                              ? [
                                  'pagada',
                                  'enviada',
                                ].includes(
                                  valor,
                                )
                              : estado === 'enviada'
                                ? [
                                    'enviada',
                                    'entregada',
                                  ].includes(
                                    valor,
                                  )
                                : estado === 'entregada'
                                  ? valor ===
                                    'entregada'
                                  : true,
                      ).map(
                        ([valor, texto]) => {
                          const esCancelacion =
                            valor === 'cancelada'

                          const deshabilitado =
                            estado ===
                              'cancelada' ||
                            (!esAdmin &&
                              esCancelacion) ||
                            (esCancelacion &&
                              estado !==
                                'pendiente') ||
                            (estado ===
                              'pagada' &&
                              ![
                                'pagada',
                                'enviada',
                              ].includes(
                                valor,
                              )) ||
                            (estado ===
                              'enviada' &&
                              ![
                                'enviada',
                                'entregada',
                              ].includes(
                                valor,
                              )) ||
                            (estado ===
                              'entregada' &&
                              valor !==
                                'entregada')

                          return (
                            <button
                              key={valor}
                              type="button"
                              disabled={
                                deshabilitado
                              }
                              onClick={() =>
                                cambiarEstado(
                                  orden.id,
                                  valor,
                                )
                              }
                              style={{
                                border: `1px solid ${
                                  estado ===
                                  valor
                                    ? estilo.border
                                    : '#ddd'
                                }`,
                                background:
                                  estado ===
                                  valor
                                    ? estilo.background
                                    : '#fff',
                                color:
                                  estado ===
                                  valor
                                    ? estilo.color
                                    : '#444',
                                borderRadius: 9,
                                padding:
                                  '8px 13px',
                                fontWeight: 700,
                                cursor:
                                  deshabilitado
                                    ? 'not-allowed'
                                    : 'pointer',
                                opacity:
                                  deshabilitado &&
                                  estado !==
                                    valor
                                    ? 0.45
                                    : 1,
                              }}
                            >
                              {texto}
                            </button>
                          )
                        },
                      )}
                    </div>

                    {estado === 'pagada' && (
                      <div
                        style={{
                          marginTop: 7,
                          fontSize: 12,
                          color: '#666',
                        }}
                      >
                        La orden pagada puede
                        avanzar a enviada.
                      </div>
                    )}
                  </div>
                </article>
              )
            })
          )}
        </div>

        {!cargando &&
          ordenesFiltradas.length > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 12,
                marginTop: 24,
              }}
            >
              <button
                type="button"
                className="pc-btn pc-btn-light"
                disabled={paginaActual === 1}
                onClick={() =>
                  setPagina((valor) =>
                    Math.max(1, valor - 1),
                  )
                }
              >
                Anterior
              </button>

              <span style={{ fontWeight: 600 }}>
                Página {paginaActual} de{' '}
                {totalPaginas}
              </span>

              <button
                type="button"
                className="pc-btn pc-btn-light"
                disabled={
                  paginaActual === totalPaginas
                }
                onClick={() =>
                  setPagina((valor) =>
                    Math.min(
                      totalPaginas,
                      valor + 1,
                    ),
                  )
                }
              >
                Siguiente
              </button>
            </div>
          )}

        {cancelacion && (
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,.5)',
              display: 'grid',
              placeItems: 'center',
              padding: 20,
              zIndex: 1000,
            }}
          >
            <div
              className="pc-card"
              style={{
                width: 'min(560px,100%)',
                padding: 24,
              }}
            >
              <h2 style={{ marginTop: 0 }}>
                Cancelar orden #{cancelacion.id}
              </h2>

              <p
                style={{
                  color: '#555',
                  lineHeight: 1.5,
                }}
              >
                Escribe el motivo que se mostrará al
                cliente. Esto también quedará guardado
                en el historial de la orden.
              </p>

              <textarea
                className="pc-input"
                rows="5"
                maxLength="500"
                value={motivo}
                onChange={(e) =>
                  setMotivo(e.target.value)
                }
                placeholder="Ej.: No hay disponibilidad del producto solicitado..."
                style={{
                  width: '100%',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
                autoFocus
              />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 10,
                  marginTop: 16,
                }}
              >
                <button
                  type="button"
                  className="pc-btn pc-btn-light"
                  disabled={procesando}
                  onClick={() => {
                    setCancelacion(null)
                    setMotivo('')
                    setError('')
                  }}
                >
                  Volver
                </button>

                <button
                  type="button"
                  className="pc-btn pc-btn-primary"
                  disabled={
                    procesando || !motivo.trim()
                  }
                  onClick={confirmarCancelacion}
                >
                  {procesando
                    ? 'Cancelando...'
                    : 'Confirmar cancelación'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}