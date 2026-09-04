import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <>
      <section className="pc-hero">
        <div className="pc-container pc-hero-grid">

          <div>
            <span className="pc-eyebrow">
              Tecnología para construir tu próxima PC
            </span>

            <h1>
              Componentes, rendimiento y control en un solo lugar.
            </h1>

            <p>
              Explora procesadores, tarjetas gráficas,
              memoria, almacenamiento y periféricos.
            </p>

            <div className="pc-hero-actions">

              <Link
                to="/tienda"
                className="pc-btn pc-btn-primary"
              >
                Explorar productos
              </Link>

              <Link
                to="/registro"
                className="pc-btn pc-btn-light"
              >
                Crear cuenta
              </Link>

            </div>
          </div>

          <div className="pc-hero-panel">

            <div className="pc-stat">
              <strong>PC Store</strong>
              <span>Catálogo por categorías</span>
            </div>

            <div className="pc-stat">
              <strong>Stock</strong>
              <span>Inventario administrado desde Supabase</span>
            </div>

            <div className="pc-stat">
              <strong>Admin</strong>
              <span>Panel para gestionar la tienda</span>
            </div>

          </div>

        </div>
      </section>


      <section className="pc-section">
        <div className="pc-container">

          <h2 className="pc-section-title">
            ¿Qué encontrarás en PC Store?
          </h2>

          <p className="pc-section-subtitle">
            Una tienda preparada para crecer hacia un sistema
            completo de comercio electrónico.
          </p>

          <div className="pc-feature-grid">

            <article className="pc-card pc-feature-card">
              <div className="pc-feature-icon">⚡</div>
              <h3>Hardware</h3>
              <p>
                Componentes organizados por categoría,
                marca, modelo y precio.
              </p>
            </article>

            <article className="pc-card pc-feature-card">
              <div className="pc-feature-icon">📦</div>
              <h3>Inventario</h3>
              <p>
                Control de existencias y movimientos.
              </p>
            </article>

            <article className="pc-card pc-feature-card">
              <div className="pc-feature-icon">🔐</div>
              <h3>Usuarios y roles</h3>
              <p>
                Accesos separados para clientes y administradores.
              </p>
            </article>

          </div>
        </div>
      </section>
    </>
  )
}