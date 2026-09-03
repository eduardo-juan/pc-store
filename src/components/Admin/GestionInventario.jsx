import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function GestionInventario() {
  const [productos, setProductos] = useState([])
  const [historial, setHistorial] = useState([])
  const [cargando, setCargando] = useState(true)
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  const [cantidad, setCantidad] = useState('')
  const [razon, setRazon] = useState('ajuste')

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setCargando(true)

    // Cargar productos
    const { data: productosData } = await supabase
      .from('productos')
      .select('id, nombre, stock, marca')

    setProductos(productosData || [])

    // Cargar historial
    const { data: historialData } = await supabase
      .from('inventario_historial')
      .select('*, productos(nombre)')
      .order('created_at', { ascending: false })
      .limit(50)

    setHistorial(historialData || [])
    setCargando(false)
  }

  const handleAjustarInventario = async (e) => {
    e.preventDefault()

    if (!productoSeleccionado || !cantidad) {
      alert('Completa todos los campos')
      return
    }

    const producto = productos.find(p => p.id === productoSeleccionado)
    const cantidadNum = parseInt(cantidad)
    const nuevoStock = producto.stock + (razon === 'devolución' ? cantidadNum : -cantidadNum)

    if (nuevoStock < 0) {
      alert('No puedes reducir el stock por debajo de 0')
      return
    }

    // Registrar en historial
    await supabase.from('inventario_historial').insert([{
      producto_id: productoSeleccionado,
      cantidad_anterior: producto.stock,
      cantidad_nueva: nuevoStock,
      razón: razon
    }])

    // Actualizar stock
    await supabase
      .from('productos')
      .update({ stock: nuevoStock })
      .eq('id', productoSeleccionado)

    alert('Inventario actualizado')
    resetFormulario()
    cargarDatos()
  }

  const resetFormulario = () => {
    setProductoSeleccionado(null)
    setCantidad('')
    setRazon('ajuste')
  }

  if (cargando) return <div>Cargando...</div>

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Gestión de Inventario</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORMULARIO */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">Ajustar Stock</h2>

          <form onSubmit={handleAjustarInventario} className="space-y-4">
            {/* Seleccionar Producto */}
            <select
              value={productoSeleccionado}
              onChange={(e) => setProductoSeleccionado(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded"
            >
              <option value="">Seleccionar producto</option>
              {productos.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nombre} (Stock: {p.stock})
                </option>
              ))}
            </select>

            {/* Cantidad */}
            <input
              type="number"
              placeholder="Cantidad"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded"
            />

            {/* Razón */}
            <select
              value={razon}
              onChange={(e) => setRazon(e.target.value)}
              className="w-full px-4 py-2 border rounded"
            >
              <option value="venta">Venta</option>
              <option value="ajuste">Ajuste</option>
              <option value="devolución">Devolución</option>
            </select>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-bold"
            >
              Actualizar
            </button>
          </form>
        </div>

        {/* HISTORIAL */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">Historial de Cambios</h2>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {historial.map(item => (
              <div key={item.id} className="p-3 bg-gray-50 rounded border-l-4 border-blue-600">
                <p className="font-bold">{item.productos?.nombre}</p>
                <p className="text-sm text-gray-600">
                  {item.cantidad_anterior} → {item.cantidad_nueva}
                  <span className="ml-2 text-blue-600 font-bold">
                    ({item.razón})
                  </span>
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}