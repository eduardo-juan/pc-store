// Módulo de página: concentra la lógica y presentación de esta sección de PC Store.
import { Link, useParams } from 'react-router-dom'
import BotonAtras from '../components/BotonAtras'

// Componente principal: coordina el estado, operaciones y contenido de la página.
export default function OrdenConfirmada() {
  const { id } = useParams()

  // Renderizado principal: muestra la información y acciones disponibles.
  return (
    <main className="pc-page">
      <div className="pc-container">

        <BotonAtras />

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
            ID interno:{' '}
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