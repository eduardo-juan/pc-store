import { useState, useEffect } from 'react'
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerCategorias
} from '../../services/productosService'
import { subirImagen } from '../../services/storageService'

export default function GestionProductos() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])

  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  // ==============================
  // ESTADO DEL FORMULARIO
  // ==============================

  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [precio, setPrecio] = useState('')
  const [stock, setStock] = useState('')
  const [marca, setMarca] = useState('')
  const [modelo, setModelo] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [imagen, setImagen] = useState(null)

  const [editandoId, setEditandoId] = useState(null)

  // ==============================
  // CARGAR DATOS
  // ==============================

  useEffect(() => {
    cargarProductos()
    cargarCategorias()
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

  const cargarCategorias = async () => {
    const resultado = await obtenerCategorias()

    if (resultado.success) {
      setCategorias(resultado.data)
    } else {
      setError(resultado.error)
    }
  }

  // ==============================
  // GUARDAR PRODUCTO
  // ==============================

  const handleSubmit = async (e) => {
    e.preventDefault()

    setCargando(true)
    setError('')

    try {
      // Verificar categoría
      if (!categoriaId) {
        setError('Debes seleccionar una categoría')
        setCargando(false)
        return
      }

      let imagenUrl = null

      // ==============================
      // SUBIR IMAGEN
      // ==============================

      if (imagen) {
        const resultSubida = await subirImagen(
          'productos-imagenes',
          imagen,
          `${nombre}-${Date.now()}`
        )

        if (!resultSubida.success) {
          throw new Error(resultSubida.error)
        }

        imagenUrl = resultSubida.url
      }

      // ==============================
      // DATOS DEL PRODUCTO
      // ==============================

      const datosProducto = {
        nombre,
        descripción: descripcion,
        precio: parseFloat(precio),
        stock: parseInt(stock),
        marca,
        modelo,
        categoria_id: Number(categoriaId),
        ...(imagenUrl && {
          imagen_principal: imagenUrl
        })
      }

      // ==============================
      // CREAR / ACTUALIZAR
      // ==============================

      let resultado

      if (editandoId) {
        resultado = await actualizarProducto(
          editandoId,
          datosProducto
        )
      } else {
        resultado = await crearProducto({
          ...datosProducto,
          activo: true
        })
      }

      // ==============================
      // RESULTADO
      // ==============================

      if (resultado.success) {
        alert(
          editandoId
            ? 'Producto actualizado'
            : 'Producto creado'
        )

        resetFormulario()
        await cargarProductos()
      } else {
        setError(resultado.error)
      }

    } catch (err) {
      setError(err.message)
    }

    setCargando(false)
  }

  // ==============================
  // LIMPIAR FORMULARIO
  // ==============================

  const resetFormulario = () => {
    setNombre('')
    setDescripcion('')
    setPrecio('')
    setStock('')
    setMarca('')
    setModelo('')
    setCategoriaId('')
    setImagen(null)
    setEditandoId(null)
    setMostrarFormulario(false)
  }

  // ==============================
  // EDITAR PRODUCTO
  // ==============================

  const handleEditar = (producto) => {
    setEditandoId(producto.id)

    setNombre(producto.nombre || '')
    setDescripcion(producto.descripción || '')
    setPrecio(producto.precio || '')
    setStock(producto.stock || '')
    setMarca(producto.marca || '')
    setModelo(producto.modelo || '')
    setCategoriaId(producto.categoria_id || '')

    setImagen(null)

    setMostrarFormulario(true)
  }

  // ==============================
  // ELIMINAR PRODUCTO
  // ==============================

  const handleEliminar = async (id) => {
    if (
      !confirm(
        '¿Estás seguro de que deseas eliminar este producto?'
      )
    ) {
      return
    }

    const resultado = await eliminarProducto(id)

    if (resultado.success) {
      alert('Producto eliminado')
      await cargarProductos()
    } else {
      setError(resultado.error)
    }
  }

  // ==============================
  // CARGANDO
  // ==============================

  if (cargando && !mostrarFormulario) {
    return <div>Cargando...</div>
  }

  // ==============================
  // INTERFAZ
  // ==============================

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">

      {/* ==============================
          CABECERA
      ============================== */}

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-3xl font-bold">
          Gestión de Productos
        </h1>

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

      {/* ==============================
          ERROR
      ============================== */}

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* ==============================
          FORMULARIO
      ============================== */}

      {mostrarFormulario && (

        <div className="bg-white rounded-lg shadow p-6 mb-8">

          <h2 className="text-2xl font-bold mb-6">
            {editandoId
              ? 'Editar Producto'
              : 'Nuevo Producto'}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* NOMBRE */}

              <input
                type="text"
                placeholder="Nombre del producto"
                value={nombre}
                onChange={(e) =>
                  setNombre(e.target.value)
                }
                required
                className="px-4 py-2 border rounded"
              />

              {/* MARCA */}

              <input
                type="text"
                placeholder="Marca"
                value={marca}
                onChange={(e) =>
                  setMarca(e.target.value)
                }
                className="px-4 py-2 border rounded"
              />

              {/* MODELO */}

              <input
                type="text"
                placeholder="Modelo"
                value={modelo}
                onChange={(e) =>
                  setModelo(e.target.value)
                }
                className="px-4 py-2 border rounded"
              />

              {/* CATEGORIA */}

              <select
                value={categoriaId}
                onChange={(e) =>
                  setCategoriaId(e.target.value)
                }
                required
                className="px-4 py-2 border rounded"
              >

                <option value="">
                  Selecciona una categoría
                </option>

                {categorias.map((categoria) => (

                  <option
                    key={categoria.id}
                    value={categoria.id}
                  >
                    {categoria.nombre}
                  </option>

                ))}

              </select>

              {/* PRECIO */}

              <input
                type="number"
                placeholder="Precio (USD)"
                step="0.01"
                min="0"
                value={precio}
                onChange={(e) =>
                  setPrecio(e.target.value)
                }
                required
                className="px-4 py-2 border rounded"
              />

              {/* STOCK */}

              <input
                type="number"
                placeholder="Stock"
                min="0"
                value={stock}
                onChange={(e) =>
                  setStock(e.target.value)
                }
                required
                className="px-4 py-2 border rounded"
              />

              {/* IMAGEN */}

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setImagen(e.target.files[0])
                }
                className="px-4 py-2 border rounded"
              />

            </div>

            {/* DESCRIPCIÓN */}

            <textarea
              placeholder="Descripción del producto"
              value={descripcion}
              onChange={(e) =>
                setDescripcion(e.target.value)
              }
              required
              rows={4}
              className="w-full px-4 py-2 border rounded"
            />

            {/* BOTONES */}

            <div className="flex gap-2">

              <button
                type="submit"
                disabled={cargando}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {cargando
                  ? 'Guardando...'
                  : 'Guardar'}
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

      {/* ==============================
          TABLA DE PRODUCTOS
      ============================== */}

      <div className="bg-white rounded-lg shadow overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[700px]">

            <thead className="bg-gray-100 border-b">

              <tr>

                <th className="px-6 py-3 text-left text-sm font-bold whitespace-nowrap">
                  Nombre
                </th>

                <th className="px-6 py-3 text-left text-sm font-bold whitespace-nowrap">
                  Categoría
                </th>

                <th className="px-6 py-3 text-left text-sm font-bold whitespace-nowrap">
                  Marca
                </th>

                <th className="px-6 py-3 text-left text-sm font-bold whitespace-nowrap">
                  Precio
                </th>

                <th className="px-6 py-3 text-left text-sm font-bold whitespace-nowrap">
                  Stock
                </th>

                <th className="px-6 py-3 text-left text-sm font-bold whitespace-nowrap">
                  Acciones
                </th>

              </tr>

            </thead>

            <tbody>

              {productos.map((producto) => (

                <tr
                  key={producto.id}
                  className="border-b hover:bg-gray-50"
                >

                  <td className="px-6 py-4">
                    {producto.nombre}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {producto.categorias?.nombre || 'Sin categoría'}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {producto.marca}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    ${Number(producto.precio).toFixed(2)}
                  </td>

                  <td className="px-6 py-4">
                    {producto.stock}
                  </td>

                  <td className="px-6 py-4 space-x-2 whitespace-nowrap">

                    <button
                      onClick={() =>
                        handleEditar(producto)
                      }
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() =>
                        handleEliminar(producto.id)
                      }
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

    </div>
  )
}
