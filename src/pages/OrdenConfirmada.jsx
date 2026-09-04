import { Link, useParams } from 'react-router-dom'

export default function OrdenConfirmada() {

  const { id } = useParams()

  return (
    <main className="pc-page">

      <div className="pc-container">

        <div className="pc-success-page">

          <div className="pc-success-icon">
            ✓
          </div>

          <span className="pc-kicker">
            Orden creada
          </span>

          <h1>¡Gracias por tu compra!</h1>

          <p>
            Tu orden fue registrada correctamente.
          </p>

          <p>
            ID interno:
            {' '}
            <strong>#{id}</strong>
          </p>

          <div className="pc-hero-actions">

            <Link
              className="pc-btn pc-btn-primary"
              to="/mis-ordenes"
            >
              Ver mis órdenes
            </Link>

            <Link
              className="pc-btn pc-btn-light"
              to="/tienda"
            >
              Seguir comprando
            </Link>

          </div>

        </div>

      </div>

    </main>
  )
}