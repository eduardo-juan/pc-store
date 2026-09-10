import { Link } from 'react-router-dom'
import {
  Monitor,
  ShoppingCart,
  Trash2,
  ShoppingBag,
} from 'lucide-react'
import { useCarrito } from '../../context/CarritoContext'

export default function Carrito() {
  const {
    items,
    subtotal,
    cambiarCantidad,
    eliminarProducto,
    vaciarCarrito,
  } = useCarrito()

  if (items.length === 0) {
    return (
      <main className="pc-page">
        <div className="pc-container">

          <div className="pc-empty">

            <div className="pc-empty-icon">
              <ShoppingCart size={48} strokeWidth={1.5} />
            </div>

            <h1>Tu carrito está vacío</h1>

            <p>
              Agrega productos desde la tienda para comenzar.
            </p>

            <Link
              to="/tienda"
              className="pc-btn pc-btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <ShoppingBag size={18} />
              Ir a la tienda
            </Link>

          </div>

        </div>
      </main>
    )
  }

  return (
    <main className="pc-page">
      <div className="pc-container">

        <div className="pc-page-heading">

          <div>
            <span className="pc-kicker">
              Compra
            </span>

            <h1>Carrito</h1>

            <p>
              Revisa cantidades antes de continuar.
            </p>
          </div>

          <button
            className="pc-btn pc-btn-light"
            onClick={vaciarCarrito}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Trash2 size={18} />
            Vaciar carrito
          </button>

        </div>

        <div className="pc-cart-layout">

          <section className="pc-card pc-cart-list">

            {items.map((item) => (
              <article
                key={item.producto_id}
                className="pc-cart-item"
              >

                <div className="pc-cart-thumb">

                  {item.imagen_principal ? (
                    <img
                      src={item.imagen_principal}
                      alt={item.nombre}
                    />
                  ) : (
                    <Monitor
                      size={40}
                      strokeWidth={1.5}
                    />
                  )}

                </div>

                <div className="pc-cart-info">

                  <h3>{item.nombre}</h3>

                  <p>
                    L {Number(item.precio).toFixed(2)}
                  </p>

                  <span>
                    Disponible: {item.stock}
                  </span>

                </div>

                <div className="pc-cart-actions">

                  <input
                    type="number"
                    min="1"
                    max={item.stock}
                    className="pc-input pc-qty"
                    value={item.cantidad}
                    onChange={(e) =>
                      cambiarCantidad(
                        item.producto_id,
                        e.target.value
                      )
                    }
                  />

                  <strong>
                    L{' '}
                    {(item.precio * item.cantidad).toFixed(2)}
                  </strong>

                  <button
                    className="pc-link-danger"
                    onClick={() =>
                      eliminarProducto(item.producto_id)
                    }
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </button>

                </div>

              </article>
            ))}

          </section>

          <aside className="pc-card pc-summary">

            <h2>Resumen</h2>

            <div className="pc-summary-line">
              <span>Subtotal</span>

              <strong>
                L {subtotal.toFixed(2)}
              </strong>
            </div>

            <div className="pc-summary-line">
              <span>Envío</span>
              <span>Se confirma en checkout</span>
            </div>

            <div className="pc-summary-total">
              <span>Total provisional</span>

              <strong>
                L {subtotal.toFixed(2)}
              </strong>
            </div>

            <Link
              to="/checkout"
              className="pc-btn pc-btn-primary pc-btn-block"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <ShoppingBag size={18} />
              Continuar al checkout
            </Link>

          </aside>

        </div>

      </div>
    </main>
  )
}