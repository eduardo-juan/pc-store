import { Link } from 'react-router-dom'
import { Monitor, ShoppingCart } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useCarrito } from '../../context/CarritoContext'

export default function Navbar() {
  const { usuario, esStaff } = useAuth()
  const { cantidadTotal } = useCarrito()

  const avatarUrl = usuario?.avatar_url

  return (
    <nav className="pc-navbar">
      <div className="pc-container pc-navbar-inner">
        <Link to="/" className="pc-brand">
          <span className="pc-brand-badge">
            <Monitor size={22} />
          </span>
          <span>PC Store</span>
        </Link>

        <div className="pc-nav-links">
          <Link to="/">Inicio</Link>

          <Link to="/tienda">Tienda</Link>

          {usuario && <Link to="/mis-ordenes">Mis órdenes</Link>}

          {esStaff && <Link to="/admin">Administración</Link>}
        </div>

        <div className="pc-nav-actions">
          <Link to="/carrito" className="pc-cart-button">
            <ShoppingCart size={20} />
            <span>Carrito</span>

            {cantidadTotal > 0 && <b>{cantidadTotal}</b>}
          </Link>

          <Link
            to="/perfil"
            className="pc-user-link"
            title="Mi perfil"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Foto de perfil"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              (usuario?.nombre?.[0] || usuario?.email?.[0] || 'U').toUpperCase()
            )}
          </Link>
        </div>
      </div>
    </nav>
  )
}
