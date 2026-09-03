// Link permite navegar entre páginas sin recargar completamente el navegador.
import { Link } from 'react-router-dom'

// Nuestro hook personalizado devuelve usuario, logout y si tiene rol admin.
import { useAuth } from '../../hooks/useAuth'

export default function Navbar() {
  // Datos y funciones disponibles desde el sistema de autenticación.
  const { usuario, logout, esAdmin } = useAuth()

  // Cierra la sesión y vuelve a la página principal.
  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  return (
    <nav className="bg-gray-900 text-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">

        {/* LOGO / ENLACE AL INICIO */}
        <Link to="/" className="text-2xl font-bold">
          🖥️ PC Store
        </Link>

        {/* ENLACES PRINCIPALES */}
        <div className="flex gap-6">
          <Link to="/" className="hover:text-blue-400">
            Inicio
          </Link>

          <Link to="/tienda" className="hover:text-blue-400">
            Tienda
          </Link>

          {/* El enlace Admin solo aparece si el perfil tiene rol admin. */}
          {esAdmin && (
            <Link to="/admin" className="hover:text-blue-400">
              Admin
            </Link>
          )}
        </div>

        {/* ZONA DE AUTENTICACIÓN */}
        <div className="flex gap-4 items-center">
          {usuario ? (
            <>
              {/* Si existe usuario, mostramos su correo y el botón de salir. */}
              <span className="text-sm">Hola, {usuario.email}</span>

              <button
                onClick={handleLogout}
                className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Si no hay sesión, ofrecemos Login y Registro. */}
              <Link to="/login" className="hover:text-blue-400">
                Login
              </Link>

              <Link
                to="/registro"
                className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
              >
                Registro
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  )
}