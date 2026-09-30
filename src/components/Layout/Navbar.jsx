// ============================================================
// NAVBAR PRINCIPAL
// Muestra la navegación general, accesos disponibles según la sesión,
// contador del carrito y acceso al perfil del usuario.
// ============================================================
import { Link } from "react-router-dom";
import { ShoppingCart, Settings2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useCarrito } from "../../context/CarritoContext";

export default function Navbar() {
  const { usuario, esStaff } = useAuth();
  const { cantidadTotal } = useCarrito();

  const avatarUrl = usuario?.avatar_url;

  return (
    <nav className="pc-navbar">
      <div className="pc-container pc-navbar-inner">
        <Link to="/" className="pc-brand">
          <span className="pc-brand-badge pc-brand-logo" aria-hidden="true">
            <img src="/favicon.svg" alt="" />
          </span>
          <span>PC Store</span>
        </Link>

        <div className="pc-nav-links">
          <Link to="/">Inicio</Link>
          <Link to="/tienda">Tienda</Link>

          {/* Estas opciones solo aparecen cuando existe una sesión activa. */}
          {usuario && (
            <Link to="/configurador" className="pc-nav-configurador">
              <Settings2 size={17} />
              Configurador
            </Link>
          )}

          {usuario && <Link to="/mis-ordenes">Mis órdenes</Link>}

          {/* Administración se muestra únicamente a usuarios con permisos de staff. */}
          {esStaff && <Link to="/admin">Administración</Link>}
        </div>

        <div className="pc-nav-actions">
          {/* El contador refleja la cantidad total calculada por CarritoContext. */}
          <Link to="/carrito" className="pc-cart-button">
            <ShoppingCart size={20} />
            <span>Carrito</span>
            {cantidadTotal > 0 && <b>{cantidadTotal}</b>}
          </Link>

          {/* Usa la foto guardada en el perfil; si no existe, muestra una inicial. */}
          <Link
            to="/perfil"
            className="pc-user-link"
            title="Mi perfil"
            style={{
              width: "42px", height: "42px", borderRadius: "50%",
              overflow: "hidden", display: "flex", alignItems: "center",
              justifyContent: "center", padding: 0,
            }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Foto de perfil" style={{
                width: "100%", height: "100%", objectFit: "cover",
              }} />
            ) : (
              (usuario?.nombre?.[0] || usuario?.email?.[0] || "U").toUpperCase()
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
