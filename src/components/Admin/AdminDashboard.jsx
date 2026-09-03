import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function AdminDashboard() {
  const { perfil } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Panel de Administración
          </h1>

          <p className="text-gray-600">
            Bienvenido, {perfil?.nombre} {perfil?.apellido}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          <Link
            to="/admin/productos"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
          >
            <div className="text-4xl mb-2">📦</div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Productos
            </h3>

            <p className="text-gray-600 text-sm">
              Crear, editar y eliminar productos
            </p>
          </Link>


          <Link
            to="/admin/inventario"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
          >
            <div className="text-4xl mb-2">📊</div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Inventario
            </h3>

            <p className="text-gray-600 text-sm">
              Controlar stock y movimientos
            </p>
          </Link>

        </div>
      </div>
    </div>
  )
}