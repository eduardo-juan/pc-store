// ============================================================
// DOCUMENTACIÓN AMPLIADA
// Archivo: src/components/Auth/ProtectedRoute.jsx
// Responsabilidad: Implementa autenticación, recuperación de cuenta o protección de acceso.
// Criterio: mantener aquí solo la responsabilidad de este módulo y delegar operaciones compartidas a la capa correspondiente.
// ============================================================

// Protege las rutas que requieren autenticación y controla el acceso por rol.
// También conserva la URL solicitada para regresar a ella después del inicio de sesión.
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { LogIn, UserPlus, ShieldCheck, ArrowLeft, ShoppingBag, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Loading from '../Shared/Loading'

export default function ProtectedRoute({ children, requiereAdmin = false, requiereStaff = false, requiereEmpleado = false }) {
  const { usuario, cargando } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Mientras se comprueba la sesión no se decide el acceso,
  // evitando redirecciones antes de conocer el usuario actual.
  if (cargando) return <Loading />

  // Si no hay sesión, mostramos acceso y conservamos la ruta original
  // para volver al recurso solicitado después de autenticarse.
  if (!usuario) {
    const paginaOrigen = location.pathname + location.search

    return (
      <main className="pc-access-page">
        <div className="pc-access-glow pc-access-glow-one" />
        <div className="pc-access-glow pc-access-glow-two" />
        <div className="pc-access-container">
          <div className="pc-access-brand"><div className="pc-access-brand-icon"><ShoppingBag size={22} /></div><span>PC STORE</span></div>
          <section className="pc-access-card">
            <div className="pc-access-icon-wrapper"><div className="pc-access-icon"><ShieldCheck size={42} strokeWidth={1.8} /></div><div className="pc-access-sparkle"><Sparkles size={15} /></div></div>
            <div className="pc-access-content"><span className="pc-access-label">ACCESO REQUERIDO</span><h1>Tu próxima PC<span> comienza aquí.</span></h1><p>Inicia sesión o crea una cuenta para explorar nuestros productos, guardar tu carrito y realizar tus compras.</p></div>
            <div className="pc-access-actions">
              <button type="button" className="pc-access-primary" onClick={() => navigate('/login', { state: { from: paginaOrigen } })}><LogIn size={19} /><span>Iniciar sesión</span></button>
              <button type="button" className="pc-access-secondary" onClick={() => navigate('/registro', { state: { from: paginaOrigen } })}><UserPlus size={19} /><span>Crear una cuenta</span></button>
            </div>
            <div className="pc-access-benefits"><div><ShieldCheck size={17} /><span>Cuenta segura</span></div><div><ShoppingBag size={17} /><span>Compra fácilmente</span></div></div>
          </section>
          <button type="button" className="pc-access-back" onClick={() => navigate('/')}><ArrowLeft size={17} />Volver al inicio</button>
        </div>
      </main>
    )
  }

  // Las condiciones separan los permisos por nivel: administrador, empleado
  // o cualquier usuario perteneciente al personal autorizado.
  if (requiereAdmin && usuario.rol !== 'admin') return <Navigate to="/" replace />
  if (requiereEmpleado && usuario.rol !== 'empleado') return <Navigate to="/admin" replace />
  if (requiereStaff && usuario.rol !== 'admin' && usuario.rol !== 'empleado') return <Navigate to="/" replace />

  // Si la sesión y el rol cumplen las condiciones, se renderiza la página protegida.
  return children
}
