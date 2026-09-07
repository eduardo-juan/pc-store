import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function GestionInventario() {
  const [productos, setProductos] = useState([])
  const [historial, setHistorial] = useState([])
  const [cargando, setCargando] = useState(true)
  const [productoSeleccionado, setProductoSeleccionado] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [razon, setRazon] = useState('ajuste')
  const [operacion, setOperacion] = useState('entrada')

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setCargando(true)

    // Cargar productos
    const { data: productosData, error: productosError } =
      await supabase
        .from('productos')
        .select('id, nombre, stock, marca')
        .order('nombre')

    if (productosError) {
      console.error(
        'Error cargando productos:',
        productosError
      )

      alert(
        `Error al cargar los productos: ${productosError.message}`
      )
    }

    setProductos(productosData || [])

    // Cargar historial
    const { data: historialData, error: historialError } =
      await supabase
        .from('inventario_historial')
        .select('*, productos(nombre)')
        .order('created_at', { ascending: false })
        .limit(50)

    if (historialError) {
      console.error(
        'Error cargando historial:',
        historialError
      )

      alert(
        `Error al cargar el historial: ${historialError.message}`
      )
    }

    setHistorial(historialData || [])
    setCargando(false)
  }

  const handleAjustarInventario = async (e) => {
    e.preventDefault()

    if (!productoSeleccionado || !cantidad) {
      alert('Completa todos los campos')
      return
    }

    const productoId = Number(productoSeleccionado)

    const producto = productos.find(
      (p) => p.id === productoId
    )

    if (!producto) {
      alert('Producto no encontrado')
      return
    }

    const cantidadNum = parseInt(cantidad, 10)

    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      alert('La cantidad debe ser un número mayor que 0')
      return
    }

    // Determinar si la operación suma o resta
    let nuevoStock

    if (razon === 'venta') {
      // Una venta siempre resta
      nuevoStock = producto.stock - cantidadNum
    } else if (razon === 'devolución') {
      // Una devolución siempre suma
      nuevoStock = producto.stock + cantidadNum
    } else {
      // Ajuste: depende de Entrada o Salida
      if (operacion === 'entrada') {
        nuevoStock = producto.stock + cantidadNum
      } else {
        nuevoStock = producto.stock - cantidadNum
      }
    }

    if (nuevoStock < 0) {
      alert(
        `No puedes reducir el stock por debajo de 0. Stock actual: ${producto.stock}`
      )
      return
    }

    // Registrar en historial
    const { error: historialError } =
      await supabase
        .from('inventario_historial')
        .insert([
          {
            producto_id: productoId,
            cantidad_anterior: producto.stock,
            cantidad_nueva: nuevoStock,
            razón: razon,
          },
        ])

    if (historialError) {
      console.error(
        'Error registrando historial:',
        historialError
      )

      alert(
        `Error al registrar el historial: ${historialError.message}`
      )

      return
    }

    // Actualizar stock
    const { error: updateError } =
      await supabase
        .from('productos')
        .update({
          stock: nuevoStock,
        })
        .eq('id', productoId)

    if (updateError) {
      console.error(
        'Error actualizando stock:',
        updateError
      )

      alert(
        `Error al actualizar el stock: ${updateError.message}`
      )

      return
    }

    alert(
      `Inventario actualizado correctamente.\n\nStock anterior: ${producto.stock}\nStock nuevo: ${nuevoStock}`
    )

    resetFormulario()

    await cargarDatos()
  }

  const resetFormulario = () => {
    setProductoSeleccionado('')
    setCantidad('')
    setRazon('ajuste')
    setOperacion('entrada')
  }

  if (cargando) {
    return <div>Cargando...</div>
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">

      <h1 className="text-3xl font-bold mb-8">
        Gestión de Inventario
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* FORMULARIO */}
        <div className="bg-white rounded-lg shadow p-6">

          <h2 className="text-2xl font-bold mb-6">
            Ajustar Stock
          </h2>

          <form
            onSubmit={handleAjustarInventario}
            className="space-y-4"
          >

            {/* Producto */}
            <select
              value={productoSeleccionado}
              onChange={(e) =>
                setProductoSeleccionado(e.target.value)
              }
              required
              className="w-full px-4 py-2 border rounded"
            >
              <option value="">
                Seleccionar producto
              </option>

              {productos.map((p) => (
                <option
                  key={p.id}
                  value={p.id}
                >
                  {p.nombre} (Stock: {p.stock})
                </option>
              ))}
            </select>

            {/* Cantidad */}
            <input
              type="number"
              min="1"
              placeholder="Cantidad"
              value={cantidad}
              onChange={(e) =>
                setCantidad(e.target.value)
              }
              required
              className="w-full px-4 py-2 border rounded"
            />

            {/* Razón */}
            <select
              value={razon}
              onChange={(e) =>
                setRazon(e.target.value)
              }
              className="w-full px-4 py-2 border rounded"
            >
              <option value="venta">
                Venta
              </option>

              <option value="ajuste">
                Ajuste
              </option>

              <option value="devolución">
                Devolución
              </option>
            </select>

            {/* Tipo de operación */}
            {razon === 'ajuste' && (
              <select
                value={operacion}
                onChange={(e) =>
                  setOperacion(e.target.value)
                }
                className="w-full px-4 py-2 border rounded"
              >
                <option value="entrada">
                  Entrada (+) — Agregar stock
                </option>

                <option value="salida">
                  Salida (-) — Reducir stock
                </option>
              </select>
            )}

            {/* Información de la operación */}
            <div className="bg-gray-50 border rounded p-3 text-sm">

              {razon === 'venta' && (
                <p>
                  🛒 La venta reducirá el stock en{' '}
                  <strong>{cantidad || 0}</strong>.
                </p>
              )}

              {razon === 'devolución' && (
                <p>
                  ↩️ La devolución aumentará el stock en{' '}
                  <strong>{cantidad || 0}</strong>.
                </p>
              )}

              {razon === 'ajuste' &&
                operacion === 'entrada' && (
                  <p>
                    📥 La entrada aumentará el stock en{' '}
                    <strong>{cantidad || 0}</strong>.
                  </p>
                )}

              {razon === 'ajuste' &&
                operacion === 'salida' && (
                  <p>
                    📤 La salida reducirá el stock en{' '}
                    <strong>{cantidad || 0}</strong>.
                  </p>
                )}

            </div>

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

          <h2 className="text-2xl font-bold mb-6">
            Historial de Cambios
          </h2>

          <div className="space-y-2 max-h-96 overflow-y-auto">

            {historial.length === 0 && (
              <p className="text-gray-500">
                No hay movimientos registrados.
              </p>
            )}

            {historial.map((item) => (

              <div
                key={item.id}
                className="p-3 bg-gray-50 rounded border-l-4 border-blue-600"
              >

                <p className="font-bold">
                  {item.productos?.nombre ||
                    'Producto desconocido'}
                </p>

                <p className="text-sm text-gray-600">

                  {item.cantidad_anterior}
                  {' → '}
                  {item.cantidad_nueva}

                  <span className="ml-2 text-blue-600 font-bold">
                    ({item.razón})
                  </span>

                </p>

                <p className="text-xs text-gray-400">
                  {new Date(
                    item.created_at
                  ).toLocaleDateString()}
                </p>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  )
}