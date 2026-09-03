// Hooks de React para estado y carga inicial.
import { useEffect, useState } from 'react'

// Servicio que consulta los productos guardados en Supabase.
import { obtenerProductos } from '../services/productosService'

export default function Tienda() {
  // Lista de productos recibidos desde Supabase.
  const [productos, setProductos] = useState([])

  // Controla el mensaje de carga.
  const [cargando, setCargando] = useState(true)

  // Se ejecuta una sola vez cuando la página se monta.
  useEffect(() => {
    cargarProductos()
  }, [])

  // Consulta los productos utilizando nuestro servicio.
  const cargarProductos = async () => {
    const resultado = await obtenerProductos()

    if (resultado.success) {
      setProductos(resultado.data)
    }

    setCargando(false)
  }

  // Mientras Supabase responde, mostramos un mensaje sencillo.
  if (cargando) {
    return <div className="p-8">Cargando...</div>
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Tienda</h1>

      {/* Cuadrícula de productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {productos.map((producto) => (
          <div
            key={producto.id}
            className="bg-white rounded-lg shadow p-4"
          >
            {/* La imagen solo se muestra si existe una URL guardada. */}
            {producto.imagen_principal && (
              <img
                src={producto.imagen_principal}
                alt={producto.nombre}
                className="w-full h-48 object-cover rounded mb-4"
              />
            )}

            <h3 className="font-bold text-lg mb-2">
              {producto.nombre}
            </h3>

            <p className="text-gray-600 text-sm mb-4">
              {producto.descripción?.substring(0, 100)}...
            </p>

            <p className="text-2xl font-bold text-blue-600 mb-4">
              ${Number(producto.precio).toFixed(2)}
            </p>

            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              Agregar al carrito
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}