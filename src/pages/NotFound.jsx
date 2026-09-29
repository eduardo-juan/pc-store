// ============================================================
// DOCUMENTACIÓN AMPLIADA
// Archivo: src/pages/NotFound.jsx
// Responsabilidad: Representa una vista completa asociada a una ruta y coordina su flujo de usuario.
// Criterio: mantener aquí solo la responsabilidad de este módulo y delegar operaciones compartidas a la capa correspondiente.
// ============================================================

// Módulo de página: concentra la lógica y presentación de esta sección de PC Store.
import { Link } from 'react-router-dom'

// Componente principal: coordina el estado, operaciones y contenido de la página.
export default function NotFound() {
  // Renderizado principal: muestra la información y acciones disponibles.
  return (
    <main className="pc-page">
      <div className="pc-container pc-empty">

        <div className="pc-404">
          404
        </div>

        <h1>Página no encontrada</h1>

        <p>
          La dirección que intentaste abrir no existe.
        </p>

        <Link
          to="/"
          className="pc-btn pc-btn-primary"
        >
          Volver al inicio
        </Link>

      </div>
    </main>
  )
}