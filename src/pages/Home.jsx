// Link permite ir a la tienda sin recargar la página.
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">

        {/* Título principal */}
        <h1 className="text-5xl font-bold mb-4">
          🖥️ Bienvenido a PC Store
        </h1>

        {/* Descripción */}
        <p className="text-xl mb-8">
          Configuradores de PC y componentes de alta calidad
        </p>

        {/* Botón que lleva a la tienda */}
        <Link
          to="/tienda"
          className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100"
        >
          Ver Tienda
        </Link>

      </div>
    </div>
  )
}