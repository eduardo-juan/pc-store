// ============================================================
// DOCUMENTACIÓN AMPLIADA
// Archivo: src/components/Layout/Navbar.jsx
// Responsabilidad: Construye navegación o estructura visual reutilizable.
// Criterio: mantener aquí solo la responsabilidad de este módulo y delegar operaciones compartidas a la capa correspondiente.
// ============================================================

import { Link } from "react-router-dom";
import { ShoppingCart, Settings2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useCarrito } from "../../context/CarritoContext";

// Componente principal de este módulo.
// Propósito del componente: centraliza la lógica y presentación principal de este módulo.
export default function Navbar() {
  const { usuario, esStaff } = useAuth();
  const { cantidadTotal } = useCarrito();

  const avatarUrl = usuario?.avatar_url;

  // Renderizado principal: muestra la información y acciones que corresponden a este módulo.
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

          <Link to="/tienda">
            Tienda
          </Link>

          {usuario && (
            <Link to="/configurador" className="pc-nav-configurador">
              <Settings2 size={17} />
              Configurador
            </Link>
          )}

          {usuario && (
            <Link to="/mis-ordenes">
              Mis órdenes
            </Link>
          )}

          {esStaff && (
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
            <ShoppingCart size={20} />

            <span>Carrito</span>

            {cantidadTotal > 0 && (
              <b>{cantidadTotal}</b>
            )}
          </Link>

          <Link
            to="/perfil"
            className="pc-user-link"
            title="Mi perfil"
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Foto de perfil"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              (
                usuario?.nombre?.[0] ||
                usuario?.email?.[0] ||
                "U"
              ).toUpperCase()
            )}
          </Link>
        </div>

      </div>
    </nav>
  );
}