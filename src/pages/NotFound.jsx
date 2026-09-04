import { Link } from 'react-router-dom'

export default function NotFound() {
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