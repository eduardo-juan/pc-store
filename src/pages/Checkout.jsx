import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'

import { supabase } from '../supabaseClient'
import { useCarrito } from '../context/CarritoContext'
import { useAuth } from '../hooks/useAuth'
import BotonAtras from '../components/BotonAtras'

const COSTO_ENVIO = 100

const limpiarTexto = (valor = '', max = 50) =>
  String(valor)
    .replace(/[0-9]/g, '')
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s.'-]/g, '')
    .slice(0, max)

const formatearTelefono = (valor = '') => {
  const numeros = String(valor)
    .replace(/\D/g, '')
    .slice(0, 8)

  return numeros.length <= 4
    ? numeros
    : `${numeros.slice(0, 4)}-${numeros.slice(4)}`
}

export default function Checkout() {
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const { items, subtotal, vaciarCarrito } = useCarrito()

  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [telefono, setTelefono] = useState('')
  const [direccion, setDireccion] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [referencia, setReferencia] = useState('')
  const [notas, setNotas] = useState('')
  const [referenciaTransferencia, setReferenciaTransferencia] =
    useState('')
  const [metodoPago, setMetodoPago] = useState('transferencia')
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')

  const subtotalNumerico = Number(subtotal) || 0
  const total = subtotalNumerico + COSTO_ENVIO

  const finalizarCompra = async (e) => {
    e.preventDefault()
    setError('')

    if (!usuario) {
      return setError(
        'Debes iniciar sesión para continuar.'
      )
    }

    if (items.length === 0) {
      return setError('Tu carrito está vacío.')
    }

    if (!nombre.trim()) {
      return setError(
        'Ingresa el nombre de la persona que recibirá el pedido.'
      )
    }

    if (!apellido.trim()) {
      return setError(
        'Ingresa el apellido de la persona que recibirá el pedido.'
      )
    }

    if (!/^[0-9]{4}-[0-9]{4}$/.test(telefono)) {
      return setError(
        'El teléfono debe tener el formato 9439-4343.'
      )
    }

    if (!ciudad.trim()) {
      return setError('Ingresa la ciudad de entrega.')
    }

    if (!direccion.trim()) {
      return setError('Ingresa la dirección de entrega.')
    }

    if (!referencia.trim()) {
      return setError('Ingresa una referencia de entrega.')
    }

    setProcesando(true)

    const itemsRpc = items.map((item) => ({
      producto_id: item.producto_id,
      cantidad: Number(item.cantidad)
    }))

    const notasFinales = [
      notas.trim(),
      metodoPago === 'transferencia' &&
      referenciaTransferencia.trim()
        ? `Referencia de transferencia: ${referenciaTransferencia.trim()}`
        : ''
    ]
      .filter(Boolean)
      .join('\n') || null

    const { data, error: rpcError } = await supabase.rpc(
      'crear_orden_pc_store',
      {
        p_items: itemsRpc,
        p_nombre_cliente: nombre.trim(),
        p_apellido_cliente: apellido.trim(),
        p_telefono: telefono.trim(),
        p_direccion: direccion.trim(),
        p_ciudad: ciudad.trim(),
        p_metodo_pago: metodoPago,
        p_notas: notasFinales,
        p_referencia: referencia.trim()
      }
    )

    if (rpcError) {
      console.error('Error creando orden:', rpcError)

      setError(
        rpcError.message || 'No se pudo crear la orden.'
      )

      setProcesando(false)
      return
    }

    vaciarCarrito()
    navigate(`/orden-confirmada/${data}`)
  }

  return (
    <main className="pc-page">
      <div className="pc-container">
        <BotonAtras />

        <div className="pc-page-heading">
          <div>
            <span className="pc-kicker">Último paso</span>

            <h1>Checkout</h1>

            <p>
              Completa los datos de entrega para generar tu orden.
            </p>
          </div>
        </div>

        <form
          className="pc-checkout-layout"
          onSubmit={finalizarCompra}
        >
          <section className="pc-card pc-checkout-form">
            <h2>Datos de entrega</h2>

            <p className="pc-muted">
              Estos datos corresponden a la persona y dirección
              donde se entregará este pedido.
            </p>

            <div className="pc-form-grid">
              <label>
                Nombre del receptor{' '}
                <span style={{ color: 'red' }}>*</span>

                <input
                  className="pc-input"
                  type="text"
                  maxLength={50}
                  value={nombre}
                  onChange={(e) =>
                    setNombre(limpiarTexto(e.target.value))
                  }
                  placeholder="Nombre"
                  required
                />
              </label>

              <label>
                Apellido del receptor{' '}
                <span style={{ color: 'red' }}>*</span>

                <input
                  className="pc-input"
                  type="text"
                  maxLength={50}
                  value={apellido}
                  onChange={(e) =>
                    setApellido(limpiarTexto(e.target.value))
                  }
                  placeholder="Apellido"
                  required
                />
              </label>

              <label>
                Teléfono{' '}
                <span style={{ color: 'red' }}>*</span>

                <input
                  className="pc-input"
                  type="tel"
                  inputMode="numeric"
                  maxLength={9}
                  placeholder="9439-4343"
                  value={telefono}
                  onChange={(e) =>
                    setTelefono(
                      formatearTelefono(e.target.value)
                    )
                  }
                  required
                />
              </label>

              <label>
                Ciudad{' '}
                <span style={{ color: 'red' }}>*</span>

                <input
                  className="pc-input"
                  type="text"
                  maxLength={50}
                  value={ciudad}
                  onChange={(e) =>
                    setCiudad(limpiarTexto(e.target.value))
                  }
                  placeholder="Ciudad"
                  required
                />
              </label>
            </div>

            <label>
              Dirección de entrega{' '}
              <span style={{ color: 'red' }}>*</span>

              <textarea
                className="pc-textarea"
                rows="3"
                maxLength={150}
                value={direccion}
                onChange={(e) =>
                  setDireccion(e.target.value.slice(0, 150))
                }
                placeholder="Colonia, calle, casa, número, etc."
                required
              />
            </label>

            <label>
              Referencia de entrega{' '}
              <span style={{ color: 'red' }}>*</span>

              <input
                className="pc-input"
                type="text"
                maxLength={150}
                value={referencia}
                onChange={(e) =>
                  setReferencia(e.target.value.slice(0, 150))
                }
                placeholder="Ej. Casa con portón negro"
                required
              />
            </label>

            <label>
              Notas adicionales

              <textarea
                className="pc-textarea"
                rows="3"
                maxLength={500}
                value={notas}
                onChange={(e) =>
                  setNotas(e.target.value.slice(0, 500))
                }
                placeholder="Indicaciones adicionales para la entrega"
              />
            </label>

            <h2>Envío</h2>

            <div
              className="pc-card"
              style={{
                padding: '16px',
                marginBottom: '20px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div>
                  <strong>Envío a domicilio</strong>

                  <p
                    className="pc-muted"
                    style={{ margin: '4px 0 0' }}
                  >
                    Costo fijo de envío
                  </p>
                </div>

                <strong>
                  L {COSTO_ENVIO.toFixed(2)}
                </strong>
              </div>
            </div>

            <h2>Método de pago</h2>

            <select
              className="pc-select"
              value={metodoPago}
              onChange={(e) =>
                setMetodoPago(e.target.value)
              }
            >
              <option value="transferencia">
                Transferencia bancaria
              </option>

              <option value="contra_entrega">
                Pago contra entrega
              </option>
            </select>

            {metodoPago === 'transferencia' && (
              <label>
                Referencia de transferencia

                <input
                  className="pc-input"
                  type="text"
                  maxLength={150}
                  placeholder="Opcional"
                  value={referenciaTransferencia}
                  onChange={(e) =>
                    setReferenciaTransferencia(
                      e.target.value.slice(0, 150)
                    )
                  }
                />
              </label>
            )}

            {error && (
              <div className="pc-alert pc-alert-error">
                {error}
              </div>
            )}
          </section>

          <aside className="pc-card pc-summary">
            <h2>Tu compra</h2>

            {items.map((item) => (
              <div
                className="pc-summary-product"
                key={item.producto_id}
              >
                <span>
                  {item.cantidad} × {item.nombre}
                </span>

                <strong>
                  L{' '}
                  {(
                    Number(item.precio) *
                    Number(item.cantidad)
                  ).toFixed(2)}
                </strong>
              </div>
            ))}

            <div className="pc-summary-total">
              <span>Subtotal</span>

              <strong>
                L {subtotalNumerico.toFixed(2)}
              </strong>
            </div>

            <div
              className="pc-summary-total"
              style={{
                borderTop: '1px solid rgba(0,0,0,0.08)',
                paddingTop: '12px',
                marginTop: '8px'
              }}
            >
              <span>Envío</span>

              <strong>
                L {COSTO_ENVIO.toFixed(2)}
              </strong>
            </div>

            <div
              className="pc-summary-total"
              style={{
                fontSize: '1.15rem',
                marginTop: '12px'
              }}
            >
              <span>Total</span>

              <strong>
                L {total.toFixed(2)}
              </strong>
            </div>

            <button
              type="submit"
              disabled={procesando}
              className="pc-btn pc-btn-primary pc-btn-block"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <ShoppingBag size={18} />

              {procesando
                ? 'Procesando...'
                : 'Confirmar orden'}
            </button>

            <small className="pc-muted">
              La orden se publicará automáticamente para los
              empleados disponibles.
            </small>
          </aside>
        </form>
      </div>
    </main>
  )
}