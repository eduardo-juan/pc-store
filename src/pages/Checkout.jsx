import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useCarrito } from '../context/CarritoContext'
import { useAuth } from '../hooks/useAuth'

const formatearTelefono = (valor = '') => {
  const numeros = String(valor)
    .replace(/\D/g, '')
    .slice(0, 8)

  if (numeros.length <= 4) {
    return numeros
  }

  return `${numeros.slice(0, 4)}-${numeros.slice(4)}`
}

export default function Checkout() {

  const navigate = useNavigate()

  const { usuario, perfil } = useAuth()

  const {
    items,
    subtotal,
    vaciarCarrito,
  } = useCarrito()


  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [telefono, setTelefono] = useState('')
  const [direccion, setDireccion] = useState('')
  const [ciudad, setCiudad] = useState('')


  useEffect(() => {

    if (perfil) {

      setNombre(perfil.nombre || '')

      setApellido(perfil.apellido || '')

      setTelefono(
        formatearTelefono(perfil.teléfono || '')
      )

      setDireccion(perfil.dirección || '')

      setCiudad(perfil.ciudad || '')
    }

  }, [perfil])


  const [metodoPago, setMetodoPago] =
    useState('transferencia')

  const [referencia, setReferencia] =
    useState('')

  const [notas, setNotas] =
    useState('')

  const [procesando, setProcesando] =
    useState(false)

  const [error, setError] =
    useState('')


  const finalizarCompra = async (e) => {

    e.preventDefault()


    if (!usuario) {
      setError(
        'Debes iniciar sesión para continuar.'
      )
      return
    }


    if (items.length === 0) {
      setError('Tu carrito está vacío.')
      return
    }


    if (!/^[0-9]{4}-[0-9]{4}$/.test(telefono)) {
      setError(
        'El teléfono debe tener el formato 9439-4343.'
      )
      return
    }


    setProcesando(true)
    setError('')


    const itemsRpc = items.map((item) => ({
      producto_id: item.producto_id,
      cantidad: item.cantidad,
    }))


    const { data, error: rpcError } =
      await supabase.rpc(
        'crear_orden_pc_store',
        {
          p_items: itemsRpc,
          p_nombre_cliente: nombre.trim(),
          p_apellido_cliente: apellido.trim(),
          p_telefono: telefono.trim(),
          p_direccion: direccion.trim(),
          p_ciudad: ciudad.trim(),
          p_metodo_pago: metodoPago,
          p_notas: notas.trim() || null,
          p_referencia:
            referencia.trim() || null,
        }
      )


    if (rpcError) {
      setError(rpcError.message)
      setProcesando(false)
      return
    }


    vaciarCarrito()


    navigate(
      `/orden-confirmada/${data}`
    )
  }


  return (
    <main className="pc-page">

      <div className="pc-container">

        <div className="pc-page-heading">

          <div>

            <span className="pc-kicker">
              Último paso
            </span>

            <h1>
              Checkout
            </h1>

            <p>
              Completa tus datos para generar la orden.
            </p>

          </div>

        </div>


        <form
          className="pc-checkout-layout"
          onSubmit={finalizarCompra}
        >

          <section className="pc-card pc-checkout-form">

            <h2>
              Datos del cliente
            </h2>


            <div className="pc-form-grid">

              <label>
                Nombre

                <input
                  className="pc-input"
                  value={nombre}
                  onChange={(e) =>
                    setNombre(e.target.value)
                  }
                  required
                />
              </label>


              <label>
                Apellido

                <input
                  className="pc-input"
                  value={apellido}
                  onChange={(e) =>
                    setApellido(e.target.value)
                  }
                  required
                />
              </label>


              <label>
                Teléfono

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
                Ciudad

                <input
                  className="pc-input"
                  value={ciudad}
                  onChange={(e) =>
                    setCiudad(e.target.value)
                  }
                  required
                />
              </label>

            </div>


            <label>
              Dirección

              <textarea
                className="pc-textarea"
                rows="3"
                value={direccion}
                onChange={(e) =>
                  setDireccion(e.target.value)
                }
                required
              />

            </label>


            <h2>
              Método de pago
            </h2>


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
                  placeholder="Opcional al crear la orden"
                  value={referencia}
                  onChange={(e) =>
                    setReferencia(e.target.value)
                  }
                />

              </label>

            )}


            <label>
              Notas

              <textarea
                className="pc-textarea"
                rows="3"
                value={notas}
                onChange={(e) =>
                  setNotas(e.target.value)
                }
                placeholder="Indicaciones adicionales"
              />

            </label>


            {error && (
              <div className="pc-alert pc-alert-error">
                {error}
              </div>
            )}

          </section>


          <aside className="pc-card pc-summary">

            <h2>
              Tu compra
            </h2>


            {items.map((item) => (

              <div
                className="pc-summary-product"
                key={item.producto_id}
              >

                <span>
                  {item.cantidad} × {item.nombre}
                </span>

                <strong>
                  L {(item.precio * item.cantidad).toFixed(2)}
                </strong>

              </div>

            ))}


            <div className="pc-summary-total">

              <span>
                Subtotal
              </span>

              <strong>
                L {subtotal.toFixed(2)}
              </strong>

            </div>


            <button
              type="submit"
              disabled={procesando}
              className="pc-btn pc-btn-primary pc-btn-block"
            >

              {procesando
                ? 'Procesando...'
                : 'Confirmar orden'}

            </button>


            <small className="pc-muted">
              El servidor volverá a validar precios y stock
              antes de crear la orden.
            </small>

          </aside>

        </form>

      </div>

    </main>
  )
}