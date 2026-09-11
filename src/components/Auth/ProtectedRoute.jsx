import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import {
  LogIn,
  UserPlus,
  ShieldCheck,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
} from 'lucide-react'

import { useAuth } from '../../context/AuthContext'
import Loading from '../Shared/Loading'

export default function ProtectedRoute({
  children,
  requiereAdmin = false,
  requiereStaff = false,
}) {
  const { usuario, cargando } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (cargando) {
    return <Loading />
  }

  // =========================================
  // USUARIO NO AUTENTICADO
  // =========================================

  if (!usuario) {
    const paginaOrigen =
      location.pathname + location.search

    return (
      <main className="pc-access-page">

        {/* DECORACIÓN DE FONDO */}

        <div className="pc-access-glow pc-access-glow-one" />
        <div className="pc-access-glow pc-access-glow-two" />

        <div className="pc-access-container">

          {/* LOGO / MARCA */}

          <div className="pc-access-brand">
            <div className="pc-access-brand-icon">
              <ShoppingBag size={22} />
            </div>

            <span>PC STORE</span>
          </div>

          {/* TARJETA */}

          <section className="pc-access-card">

            {/* ICONO */}

            <div className="pc-access-icon-wrapper">
              <div className="pc-access-icon">
                <ShieldCheck size={42} strokeWidth={1.8} />
              </div>

              <div className="pc-access-sparkle">
                <Sparkles size={15} />
              </div>
            </div>

            {/* TEXTO */}

            <div className="pc-access-content">

              <span className="pc-access-label">
                ACCESO REQUERIDO
              </span>

              <h1>
                Tu próxima PC
                <span> comienza aquí.</span>
              </h1>

              <p>
                Inicia sesión o crea una cuenta para
                explorar nuestros productos, guardar
                tu carrito y realizar tus compras.
              </p>

            </div>

            {/* BOTONES */}

            <div className="pc-access-actions">

              <button
                type="button"
                className="pc-access-primary"
                onClick={() =>
                  navigate('/login', {
                    state: {
                      from: paginaOrigen,
                    },
                  })
                }
              >
                <LogIn size={19} />
                <span>Iniciar sesión</span>
              </button>

              <button
                type="button"
                className="pc-access-secondary"
                onClick={() =>
                  navigate('/registro', {
                    state: {
                      from: paginaOrigen,
                    },
                  })
                }
              >
                <UserPlus size={19} />
                <span>Crear una cuenta</span>
              </button>

            </div>

            {/* BENEFICIOS */}

            <div className="pc-access-benefits">

              <div>
                <ShieldCheck size={17} />
                <span>Cuenta segura</span>
              </div>

              <div>
                <ShoppingBag size={17} />
                <span>Compra fácilmente</span>
              </div>

            </div>

          </section>

          {/* VOLVER */}

          <button
            type="button"
            className="pc-access-back"
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={17} />
            Volver al inicio
          </button>

        </div>
      </main>
    )
  }

  // =========================================
  // SOLO ADMIN
  // =========================================

  if (
    requiereAdmin &&
    usuario.rol !== 'admin'
  ) {
    return <Navigate to="/" replace />
  }

  // =========================================
  // ADMIN + EMPLEADO
  // =========================================

  if (
    requiereStaff &&
    usuario.rol !== 'admin' &&
    usuario.rol !== 'empleado'
  ) {
    return <Navigate to="/" replace />
  }

  return children
}