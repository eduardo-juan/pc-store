import { useState, useEffect } from 'react'
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerCategorias,
} from '../../services/productosService'
import { subirImagen } from '../../services/storageService'
import {
  Plus,
  Save,
  X,
  Pencil,
  Trash2,
} from 'lucide-react'

export default function GestionProductos() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])

  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [precio, setPrecio] = useState('')
  const [stock, setStock] = useState('')
  const [marca, setMarca] = useState('')
  const [modelo, setModelo] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [imagen, setImagen] = useState(null)

  const [editandoId, setEditandoId] = useState(null)

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

  const handleSubmit = async (e) => {
    e.preventDefault()

    setCargando(true)
    setError('')

    try {
      if (!categoriaId) {
        setError('Debes seleccionar una categoría')
        setCargando(false)
        return
      }

      let imagenUrl = null

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

      const datosProducto = {
        nombre,
        descripción: descripcion,
        precio: parseFloat(precio),
        stock: parseInt(stock),
        marca,
        modelo,
        categoria_id: Number(categoriaId),
        ...(imagenUrl && {
          imagen_principal: imagenUrl,
        }),
      }

      let resultado

      if (editandoId) {
        resultado = await actualizarProducto(
          editandoId,
          datosProducto
        )
      } else {
        resultado = await crearProducto({
          ...datosProducto,
          activo: true,
        })
      }

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

  if (cargando && !mostrarFormulario) {
    return (
      <main className="pc-page">
        <div className="pc-container">
          Cargando...
        </div>
      </main>
    )
  }

  return (
    <main className="pc-page">
      <div className="pc-container">

        <div
          className="pc-admin-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h1>Gestión de Productos</h1>
            <p>Administra el catálogo de componentes.</p>
          </div>

          <button
            className="pc-btn pc-btn-primary"
            onClick={() => {
              resetFormulario()
              setMostrarFormulario(true)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Plus size={18} />
            Nuevo Producto
          </button>
        </div>

        {error && (
          <div
            className="pc-card"
            style={{
              padding: 16,
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        {mostrarFormulario && (
          <div
            className="pc-card"
            style={{
              padding: 22,
              marginBottom: 24,
            }}
          >
            <h2 style={{ marginBottom: 16 }}>
              {editandoId
                ? 'Editar Producto'
                : 'Nuevo Producto'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="pc-form-grid">

                <input
                  type="text"
                  placeholder="Nombre del producto"
                  className="pc-input"
                  value={nombre}
                  onChange={(e) =>
                    setNombre(e.target.value)
                  }
                  required
                />

                <input
                  type="text"
                  placeholder="Marca"
                  className="pc-input"
                  value={marca}
                  onChange={(e) =>
                    setMarca(e.target.value)
                  }
                />

                <input
                  type="text"
                  placeholder="Modelo"
                  className="pc-input"
                  value={modelo}
                  onChange={(e) =>
                    setModelo(e.target.value)
                  }
                />

                <select
                  className="pc-select"
                  value={categoriaId}
                  onChange={(e) =>
                    setCategoriaId(e.target.value)
                  }
                  required
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

                <input
                  type="number"
                  placeholder="Precio (Lps)"
                  step="0.01"
                  min="0"
                  className="pc-input"
                  value={precio}
                  onChange={(e) =>
                    setPrecio(e.target.value)
                  }
                  required
                />

                <input
                  type="number"
                  placeholder="Stock"
                  min="0"
                  className="pc-input"
                  value={stock}
                  onChange={(e) =>
                    setStock(e.target.value)
                  }
                  required
                />

                <input
                  type="file"
                  accept="image/*"
                  className="pc-input"
                  onChange={(e) =>
                    setImagen(e.target.files[0])
                  }
                />
              </div>

              <textarea
                placeholder="Descripción del producto"
                className="pc-textarea"
                rows={4}
                style={{
                  marginTop: 14,
                  width: '100%',
                }}
                value={descripcion}
                onChange={(e) =>
                  setDescripcion(e.target.value)
                }
                required
              />

              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  marginTop: 16,
                }}
              >
                <button
                  type="submit"
                  disabled={cargando}
                  className="pc-btn pc-btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Save size={17} />
                  {cargando ? 'Guardando...' : 'Guardar'}
                </button>

                <button
                  type="button"
                  className="pc-btn pc-btn-light"
                  onClick={resetFormulario}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <X size={17} />
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="pc-card pc-table-wrapper">
          <table className="pc-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Marca</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {productos.map((producto) => (
                <tr key={producto.id}>
                  <td>{producto.nombre}</td>

                  <td>
                    {producto.categorias?.nombre ||
                      'Sin categoría'}
                  </td>

                  <td>{producto.marca}</td>

                  <td>
                    L {Number(producto.precio).toFixed(2)}
                  </td>

                  <td>{producto.stock}</td>

                  <td>
                    <button
                      className="pc-btn pc-btn-light"
                      onClick={() =>
                        handleEditar(producto)
                      }
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Pencil size={16} />
                      Editar
                    </button>

                    {' '}

                    <button
                      className="pc-btn pc-btn-danger"
                      onClick={() =>
                        handleEliminar(producto.id)
                      }
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  )
}