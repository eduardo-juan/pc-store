import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Package,
  Cpu,
  MapPin,
  CreditCard,
  Tag,
  Truck
} from 'lucide-react'

import { supabase } from '../supabaseClient'
import { useAuth } from '../hooks/useAuth'
import BotonAtras from '../components/BotonAtras'

const ESTADOS = [
  ['pendiente', 'Pendiente'],
  ['pagada', 'Pagada'],
  ['enviada', 'Enviada'],
  ['entregada', 'Entregada'],
  ['cancelada', 'Cancelada']
]

const TIPOS_ORDEN = {
  producto: 'Compra de productos',
  configurador: 'PC configurada',
  mixta: 'Compra mixta'
}

export default function DetalleOrden() {
  const { ordenId } = useParams()
  const navigate = useNavigate()
  const { usuario } = useAuth()

  const [orden, setOrden] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    cargarOrden()
  }, [ordenId, usuario])

  async function cargarOrden() {
    if (!usuario || !ordenId) {
      setCargando(false)
      return
    }

    setCargando(true)
    setError('')

    try {
      const { data, error: consultaError } = await supabase
        .from('ordenes')
        .select('id,usuario_id,email,items,subtotal,impuestos,envío,total,estado,método_pago,dirección_envío,ciudad_envío,teléfono_contacto,notas,tracking_code,created_at,updated_at,nombre_cliente,apellido_cliente,referencia,moneda,numero_orden,empleado_id,motivo_cancelacion,cupon_codigo,descuento,tipo_orden')
        .eq('id', ordenId)
        .eq('usuario_id', usuario.id)
        .single()

      if (consultaError) throw consultaError

      setOrden(data)
    } catch (consultaError) {
      console.error('Error cargando detalle de orden:', consultaError)

      setError(
        consultaError?.message ||
          'No se pudo cargar el detalle de la orden.'
      )

      setOrden(null)
    } finally {
      setCargando(false)
    }
  }

  if (cargando) {
    return (
      <main className="pc-page">
        <div className="pc-container">
          <div className="pc-loader" />
        </div>
      </main>
    )
  }

  if (!orden) {
    return (
      <main className="pc-page">
        <div className="pc-container">
          <BotonAtras />

          <div className="pc-empty">
            <div className="pc-empty-icon">
              <Package size={48} strokeWidth={1.5} />
            </div>

            <h1>Orden no encontrada</h1>

            <p>
              {error ||
                'No existe una orden disponible para tu cuenta.'}
            </p>

            <button
              type="button"
              className="pc-btn pc-btn-primary"
              onClick={() => navigate('/mis-ordenes')}
            >
              Volver a mis órdenes
            </button>
          </div>
        </div>
      </main>
    )
  }

  const estado = orden.estado || 'pendiente'

  const items = Array.isArray(orden.items)
    ? orden.items
    : []

  const subtotal = Number(orden.subtotal || 0)
  const envio = Number(orden.envío || 0)
  const descuento = Number(orden.descuento || 0)
  const total = Number(orden.total || 0)

  const tipoOrden = orden.tipo_orden || 'producto'

  return (
    <main className="pc-page">
      <div className="pc-container">
        <BotonAtras />

        <div className="pc-page-heading">
          <div>
            <span className="pc-kicker">
              Detalle de compra
            </span>

            <h1>
              Orden #{orden.numero_orden || orden.id}
            </h1>

            <p>
              {orden.created_at
                ? new Date(
                    orden.created_at
                  ).toLocaleString()
                : '-'}
            </p>
          </div>

          <span
            className={`pc-status pc-status-${estado}`}
            style={{
              padding: '8px 13px',
              fontWeight: 700,
              border: '2px solid currentColor'
            }}
          >
            {ESTADOS.find(
              ([valor]) => valor === estado
            )?.[1] || 'Pendiente'}
          </span>
        </div>

        <section
          className="pc-card"
          style={{
            padding: 18,
            marginBottom: 20
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9
            }}
          >
            {tipoOrden === 'producto' ? (
              <Package size={20} />
            ) : (
              <Cpu size={20} />
            )}

            <div>
              <span className="pc-kicker">
                Tipo de orden
              </span>

              <strong
                style={{
                  display: 'block',
                  marginTop: 3
                }}
              >
                {TIPOS_ORDEN[tipoOrden] || tipoOrden}
              </strong>
            </div>
          </div>
        </section>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit,minmax(280px,1fr))',
            gap: 16,
            marginBottom: 20
          }}
        >
          <section
            className="pc-card"
            style={{ padding: 20 }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 12
              }}
            >
              <MapPin size={19} />
              <h2 style={{ margin: 0 }}>
                Datos de entrega
              </h2>
            </div>

            <div
              style={{
                fontSize: 14,
                lineHeight: 1.8
              }}
            >
              <div>
                <b>Receptor:</b>{' '}
                {orden.nombre_cliente || '-'}{' '}
                {orden.apellido_cliente || ''}
              </div>

              <div>
                <b>Teléfono:</b>{' '}
                {orden.teléfono_contacto || '-'}
              </div>

              <div>
                <b>Ciudad:</b>{' '}
                {orden.ciudad_envío || '-'}
              </div>

              <div>
                <b>Dirección:</b>{' '}
                {orden.dirección_envío || '-'}
              </div>

              {orden.referencia && (
                <div>
                  <b>Referencia:</b>{' '}
                  {orden.referencia}
                </div>
              )}

              {orden.notas && (
                <div>
                  <b>Notas:</b> {orden.notas}
                </div>
              )}
            </div>
          </section>

          <section
            className="pc-card"
            style={{ padding: 20 }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 12
              }}
            >
              <CreditCard size={19} />
              <h2 style={{ margin: 0 }}>
                Pago
              </h2>
            </div>

            <div
              style={{
                fontSize: 14,
                lineHeight: 1.8
              }}
            >
              <div>
                <b>Método:</b>{' '}
                {orden['método_pago'] ||
                  orden.metodo_pago ||
                  '-'}
              </div>

              {orden.referencia && (
                <div>
                  <b>Referencia:</b>{' '}
                  {orden.referencia}
                </div>
              )}

              {orden.cupon_codigo && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Tag size={16} />

                  <span>
                    <b>Cupón:</b>{' '}
                    {orden.cupon_codigo}
                  </span>
                </div>
              )}

              {descuento > 0 && (
                <div>
                  <b>Descuento:</b>{' '}
                  -L {descuento.toFixed(2)}
                </div>
              )}
            </div>
          </section>
        </div>

        <section
          className="pc-card"
          style={{
            padding: 20,
            marginBottom: 20
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 18
            }}
          >
            <Package size={20} />

            <h2 style={{ margin: 0 }}>
              Productos de la orden
            </h2>
          </div>

          {items.length === 0 ? (
            <p className="pc-muted">
              No hay productos registrados en esta orden.
            </p>
          ) : (
            <div
              style={{
                display: 'grid',
                gap: 14
              }}
            >
              {items.map((item, index) => {
                const esPC =
                  item.tipo === 'configurador'

                const cantidad =
                  Number(item.cantidad) || 1

                const precio =
                  Number(item.precio) || 0

                const subtotalItem =
                  Number(item.subtotal) ||
                  precio * cantidad

                return (
                  <article
                    key={`${orden.id}-${index}`}
                    style={{
                      border:
                        '1px solid rgba(0,0,0,0.08)',
                      borderRadius: 12,
                      padding: 16
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent:
                          'space-between',
                        alignItems: 'flex-start',
                        gap: 16,
                        flexWrap: 'wrap'
                      }}
                    >
                      <div>
                        <span className="pc-kicker">
                          {esPC
                            ? 'PC CONFIGURADA'
                            : 'PRODUCTO'}
                        </span>

                        <h3
                          style={{
                            margin: '5px 0'
                          }}
                        >
                          {item.nombre ||
                            (esPC
                              ? 'PC Configurada'
                              : 'Producto')}
                        </h3>

                        <div
                          style={{
                            fontSize: 14,
                            color: '#666'
                          }}
                        >
                          Cantidad: {cantidad}
                        </div>
                      </div>

                      <strong>
                        L {subtotalItem.toFixed(2)}
                      </strong>
                    </div>

                    {esPC && (
                      <div
                        style={{
                          marginTop: 15,
                          background: '#fafafa',
                          borderRadius: 10,
                          padding: 14
                        }}
                      >
                        <strong>
                          Componentes de la PC
                        </strong>

                        <div
                          style={{
                            marginTop: 10,
                            display: 'grid',
                            gap: 8,
                            fontSize: 14
                          }}
                        >
                          {(item.componentes || []).map(
                            (
                              componente,
                              componenteIndex
                            ) => {
                              const cantidadComponente =
                                Number(
                                  componente.cantidad
                                ) || 1

                              const precioComponente =
                                Number(
                                  componente.precio
                                ) || 0

                              const subtotalComponente =
                                Number(
                                  componente.subtotal
                                ) ||
                                precioComponente *
                                  cantidadComponente

                              return (
                                <div
                                  key={
                                    componente.producto_id ||
                                    componenteIndex
                                  }
                                  style={{
                                    display: 'flex',
                                    justifyContent:
                                      'space-between',
                                    gap: 12
                                  }}
                                >
                                  <span>
                                    {
                                      cantidadComponente
                                    }{' '}
                                    ×{' '}
                                    {componente.nombre ||
                                      'Componente'}
                                  </span>

                                  <b>
                                    L{' '}
                                    {subtotalComponente.toFixed(
                                      2
                                    )}
                                  </b>
                                </div>
                              )
                            }
                          )}
                        </div>

                        <div
                          style={{
                            marginTop: 12,
                            paddingTop: 10,
                            borderTop:
                              '1px solid rgba(0,0,0,0.08)',
                            display: 'flex',
                            justifyContent:
                              'space-between'
                          }}
                        >
                          <span>
                            Costo de armado
                          </span>

                          <b>
                            L{' '}
                            {Number(
                              item.costo_armado || 1500
                            ).toFixed(2)}
                          </b>
                        </div>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit,minmax(280px,1fr))',
            gap: 16
          }}
        >
          <section
            className="pc-card"
            style={{ padding: 20 }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 12
              }}
            >
              <Truck size={19} />

              <h2 style={{ margin: 0 }}>
                Estado del pedido
              </h2>
            </div>

            <p style={{ margin: 0 }}>
              Estado actual:{' '}
              <strong>
                {ESTADOS.find(
                  ([valor]) => valor === estado
                )?.[1] || estado}
              </strong>
            </p>

            {estado === 'enviada' && (
              <p
                className="pc-muted"
                style={{ marginTop: 10 }}
              >
                Tu pedido fue enviado. Puedes
                confirmar la recepción desde
                “Mis órdenes”.
              </p>
            )}

            {estado === 'entregada' && (
              <p
                className="pc-muted"
                style={{ marginTop: 10 }}
              >
                Esta orden aparece como entregada.
              </p>
            )}

            {estado === 'cancelada' &&
              orden.motivo_cancelacion && (
                <div
                  style={{
                    marginTop: 12,
                    padding: 12,
                    borderRadius: 10,
                    background: '#fef2f2',
                    color: '#991b1b'
                  }}
                >
                  <b>Motivo:</b>{' '}
                  {orden.motivo_cancelacion}
                </div>
              )}
          </section>

          <section
            className="pc-card pc-summary"
            style={{ padding: 20 }}
          >
            <h2>Resumen de pago</h2>

            <div className="pc-summary-line">
              <span>Subtotal</span>

              <strong>
                L {subtotal.toFixed(2)}
              </strong>
            </div>

            <div className="pc-summary-line">
              <span>Envío</span>

              <strong>
                L {envio.toFixed(2)}
              </strong>
            </div>

            {descuento > 0 && (
              <div className="pc-summary-line">
                <span>Descuento</span>

                <strong>
                  -L {descuento.toFixed(2)}
                </strong>
              </div>
            )}

            <div className="pc-summary-total">
              <span>Total</span>

              <strong>
                L {total.toFixed(2)}
              </strong>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}