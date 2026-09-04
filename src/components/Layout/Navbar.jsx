import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useCarrito } from '../../context/CarritoContext'

export default function Navbar() {

  const {
    usuario,
    logout,
    esAdmin,
  } = useAuth()

  const {
    cantidadTotal,
  } = useCarrito()


  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }


  return (
    <nav className="pc-navbar">

      <div className="pc-container pc-navbar-inner">

        <Link
          to="/"
          className="pc-brand"
        >
          <span className="pc-brand-badge">
            🖥️
          </span>

          <span>PC Store</span>
        </Link>


        <div className="pc-nav-links">

          <Link to="/">Inicio</Link>

          <Link to="/tienda">
            Tienda
          </Link>

          {usuario && (
            <Link to="/mis-ordenes">
              Mis órdenes
            </Link>
          )}

          {esAdmin && (
            <Link to="/admin">
              Administración
            </Link>
          )}

        </div>


        <div className="pc-nav-actions">

          <Link
            to="/carrito"
            className="pc-cart-button"
          >
            🛒
            <span>Carrito</span>

            {cantidadTotal > 0 && (
              <b>{cantidadTotal}</b>
            )}
          </Link>


          {usuario ? (
            <>
              <Link
                to="/perfil"
                className="pc-user-link"
              >
                👤
              </Link>

              <button
                className="pc-btn pc-btn-danger"
                onClick={handleLogout}
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="pc-btn pc-btn-light"
              >
                Entrar
              </Link>

              <Link
                to="/registro"
                className="pc-btn pc-btn-primary"
              >
                Crear cuenta
              </Link>
            </>
          )}

        </div>

      </div>

    </nav>
  )
}