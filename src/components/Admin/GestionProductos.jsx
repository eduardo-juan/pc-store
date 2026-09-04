import { useState, useEffect } from 'react'
import { obtenerProductos, crearProducto, actualizarProducto, eliminarProducto } from '../../services/productosService'
import { subirImagen } from '../../services/storageService'

export default function GestionProductos() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  
  // Estado del formulario
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [precio, setPrecio] = useState('')
  const [stock, setStock] = useState('')
  const [marca, setMarca] = useState('')
  const [modelo, setModelo] = useState('')
  const [imagen, setImagen] = useState(null)
  const [editandoId, setEditandoId] = useState(null)

  // Cargar productos
  useEffect(() => {
    cargarProductos()
  }, [])

  const cargarProductos = async () => {
    setCargando(true)
    const resultado = await obtenerProductos()
    if (resultado.success) {
      setProductos(resultado.data)
    } else {
      setError(resultado.error)
    }
    setCargando(false)
  }

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')

    try {
      let imagenUrl = null

      // Si hay nueva imagen, subirla
      if (imagen) {
        const resultSubida = await subirImagen(
          'productos-imagenes',
          imagen,
          `${nombre}-${Date.now()}`
        )
        if (!resultSubida.success) throw new Error(resultSubida.error)
        imagenUrl = resultSubida.url
      }

      const datosProducto = {
        nombre,
        descripción: descripcion,
        precio: parseFloat(precio),
        stock: parseInt(stock),
        marca,
        modelo,
        ...(imagenUrl && { imagen_principal: imagenUrl })
      }

      let resultado
      if (editandoId) {
        resultado = await actualizarProducto(editandoId, datosProducto)
      } else {
        resultado = await crearProducto({
          ...datosProducto,
          categoria_id: 1, // Cambiar según necesidad
          activo: true
        })
      }

      if (resultado.success) {
        alert(editandoId ? 'Producto actualizado' : 'Producto creado')
        resetFormulario()
        cargarProductos()
      } else {
        setError(resultado.error)
      }
    } catch (err) {
      setError(err.message)
    }
    setCargando(false)
  }

  const resetFormulario = () => {
    setNombre('')
    setDescripcion('')
    setPrecio('')
    setStock('')
    setMarca('')
    setModelo('')
    setImagen(null)
    setEditandoId(null)
    setMostrarFormulario(false)
  }

  const handleEditar = (producto) => {
    setEditandoId(producto.id)
    setNombre(producto.nombre)
    setDescripcion(producto.descripción)
    setPrecio(producto.precio)
    setStock(producto.stock)
    setMarca(producto.marca)
    setModelo(producto.modelo)
    setMostrarFormulario(true)
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return

    const resultado = await eliminarProducto(id)
    if (resultado.success) {
      alert('Producto eliminado')
      cargarProductos()
    } else {
      setError(resultado.error)
    }
  }

  if (cargando && !mostrarFormulario) return <div>Cargando...</div>

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Productos</h1>
        <button
          onClick={() => {
            resetFormulario()
            setMostrarFormulario(true)
          }}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          + Nuevo Producto
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* FORMULARIO */}
      {mostrarFormulario && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">
            {editandoId ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <input
                type="text"
                placeholder="Nombre del producto"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="px-4 py-2 border rounded"
              />

              {/* Marca */}
              <input
                type="text"
                placeholder="Marca"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                className="px-4 py-2 border rounded"
              />

              {/* Modelo */}
              <input
                type="text"
                placeholder="Modelo"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                className="px-4 py-2 border rounded"
              />

              {/* Precio */}
              <input
                type="number"
                placeholder="Precio (USD)"
                step="0.01"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                required
                className="px-4 py-2 border rounded"
              />

              {/* Stock */}
              <input
                type="number"
                placeholder="Stock"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
                className="px-4 py-2 border rounded"
              />

              {/* Imagen */}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImagen(e.target.files[0])}
                className="px-4 py-2 border rounded"
              />
            </div>

            {/* Descripción */}
            <textarea
              placeholder="Descripción del producto"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-2 border rounded"
            />

            {/* Botones */}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={cargando}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {cargando ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={resetFormulario}
                className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TABLA DE PRODUCTOS */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-bold">Nombre</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Marca</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Precio</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Stock</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr key={producto.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{producto.nombre}</td>
                <td className="px-6 py-4">{producto.marca}</td>
                <td className="px-6 py-4">${producto.precio.toFixed(2)}</td>
                <td className="px-6 py-4">{producto.stock}</td>
                <td className="px-6 py-4 space-x-2">
                  <button
                    onClick={() => handleEditar(producto)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminar(producto.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}