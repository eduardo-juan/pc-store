import { useState, useEffect } from 'react'
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerCategorias,
  obtenerProveedorProducto,
  guardarProveedorProducto,
  eliminarProveedorProducto,
} from '../../services/productosService'
import { subirImagen } from '../../services/storageService'
import { Plus, Save, X, Pencil, Trash2, Truck, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import BotonAtras from '../../components/BotonAtras'

export default function GestionProductos() {
  const { esAdmin } = useAuth()
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
  const [imagenes, setImagenes] = useState([])
  const [editandoId, setEditandoId] = useState(null)

  const [proveedor, setProveedor] = useState('')
  const [urlProveedor, setUrlProveedor] = useState('')
  const [costoProveedor, setCostoProveedor] = useState('')
  const [dropshippingActivo, setDropshippingActivo] = useState(false)

  useEffect(() => {
    cargarProductos()
    cargarCategorias()
  }, [])

  const cargarProductos = async () => {
    setCargando(true)
    const resultado = await obtenerProductos()
    if (resultado.success) setProductos(resultado.data)
    else setError(resultado.error)
    setCargando(false)
  }

  const cargarCategorias = async () => {
    const resultado = await obtenerCategorias()
    if (resultado.success) setCategorias(resultado.data)
    else setError(resultado.error)
  }

  const cargarProveedor = async (productoId) => {
    if (!esAdmin) return
    const resultado = await obtenerProveedorProducto(productoId)
    if (resultado.success && resultado.data) {
      setProveedor(resultado.data.proveedor || '')
      setUrlProveedor(resultado.data.url_compra || '')
      setCostoProveedor(resultado.data.costo ?? '')
      setDropshippingActivo(Boolean(resultado.data.activo))
    } else {
      setProveedor('')
      setUrlProveedor('')
      setCostoProveedor('')
      setDropshippingActivo(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')

    try {
      if (!categoriaId) throw new Error('Debes seleccionar una categoría')

      let imagenPrincipal = null
      let imagenesAdicionales = null

      if (imagenes.length > 0) {
        const categoriaSeleccionada = categorias.find((categoria) => Number(categoria.id) === Number(categoriaId))
        const nombreCategoria = categoriaSeleccionada?.nombre || 'sin-categoria'
        const subidas = []

        for (let i = 0; i < imagenes.length; i += 1) {
          const resultadoSubida = await subirImagen(
            'productos-imagenes',
            imagenes[i],
            `${nombre}-${Date.now()}-${i + 1}`,
            `productos/${nombreCategoria}`
          )
          if (!resultadoSubida.success) throw new Error(resultadoSubida.error)
          subidas.push(resultadoSubida.url)
        }

        imagenPrincipal = subidas[0] || null
        imagenesAdicionales = subidas.slice(1)
      }

      const datosProducto = {
        nombre,
        descripción: descripcion,
        precio: parseFloat(precio),
        stock: parseInt(stock),
        marca,
        modelo,
        categoria_id: Number(categoriaId),
        ...(imagenPrincipal && { imagen_principal: imagenPrincipal }),
        ...(imagenesAdicionales && { imágenes_adicionales: imagenesAdicionales }),
      }

      let resultado
      let productoId = editandoId

      if (editandoId) {
        resultado = await actualizarProducto(editandoId, datosProducto)
      } else {
        resultado = await crearProducto({ ...datosProducto, activo: true })
        productoId = resultado.data?.id
      }

      if (!resultado.success) throw new Error(resultado.error)

      if (esAdmin && productoId) {
        if (dropshippingActivo && proveedor.trim() && urlProveedor.trim()) {
          let urlValida
          try {
            urlValida = new URL(urlProveedor.trim())
          } catch {
            throw new Error('El enlace del proveedor no es válido.')
          }

          if (!['http:', 'https:'].includes(urlValida.protocol)) {
            throw new Error('El enlace del proveedor debe comenzar con http:// o https://')
          }

          const proveedorResultado = await guardarProveedorProducto(productoId, {
            proveedor: proveedor.trim(),
            url_compra: urlValida.toString(),
            costo: parseFloat(costoProveedor || '0'),
            activo: true,
          })
          if (!proveedorResultado.success) throw new Error(proveedorResultado.error)
        } else if (editandoId) {
          const proveedorResultado = await eliminarProveedorProducto(productoId)
          if (!proveedorResultado.success) throw new Error(proveedorResultado.error)
        }
      }

      alert(editandoId ? 'Producto actualizado' : 'Producto creado')
      resetFormulario()
      await cargarProductos()
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
    setImagenes([])
    setEditandoId(null)
    setProveedor('')
    setUrlProveedor('')
    setCostoProveedor('')
    setDropshippingActivo(false)
    setMostrarFormulario(false)
  }

  const handleEditar = async (producto) => {
    setEditandoId(producto.id)
    setNombre(producto.nombre || '')
    setDescripcion(producto.descripción || '')
    setPrecio(producto.precio || '')
    setStock(producto.stock ?? '')
    setMarca(producto.marca || '')
    setModelo(producto.modelo || '')
    setCategoriaId(producto.categoria_id || '')
    setImagenes([])
    setMostrarFormulario(true)
    await cargarProveedor(producto.id)
  }

  const handleEliminar = async (id) => {
    if (!esAdmin) {
      setError('No tienes permiso para eliminar productos.')
      return
    }
    if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) return

    setError('')
    const resultado = await eliminarProducto(id)
    if (resultado.success) {
      alert('Producto eliminado')
      await cargarProductos()
    } else setError(resultado.error)
  }

  if (cargando && !mostrarFormulario) {
    return <main className="pc-page"><div className="pc-container"><BotonAtras />Cargando...</div></main>
  }

  return (
    <main className="pc-page">
      <div className="pc-container">
        <BotonAtras />

        <div className="pc-admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Gestión de Productos</h1>
            <p>Administra el catálogo de componentes.</p>
          </div>
          <button className="pc-btn pc-btn-primary" onClick={() => { resetFormulario(); setMostrarFormulario(true) }} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={18} /> Nuevo Producto
          </button>
        </div>

        {error && <div className="pc-card" style={{ padding: 16, marginBottom: 20 }}>{error}</div>}

        {mostrarFormulario && (
          <div className="pc-card" style={{ padding: 22, marginBottom: 24 }}>
            <h2 style={{ marginBottom: 16 }}>{editandoId ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="pc-form-grid">
                <input type="text" placeholder="Nombre del producto" className="pc-input" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                <input type="text" placeholder="Marca" className="pc-input" value={marca} onChange={(e) => setMarca(e.target.value)} />
                <input type="text" placeholder="Modelo" className="pc-input" value={modelo} onChange={(e) => setModelo(e.target.value)} />
                <select className="pc-select" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} required>
                  <option value="">Selecciona una categoría</option>
                  {categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>)}
                </select>
                <input type="number" placeholder="Precio (Lps)" step="0.01" min="0" className="pc-input" value={precio} onChange={(e) => setPrecio(e.target.value)} required />
                <input type="number" placeholder="Stock" min="0" className="pc-input" value={stock} onChange={(e) => setStock(e.target.value)} required />
                <div>
                  <label style={{ display: 'block', marginBottom: 7, fontWeight: 600 }}>Imágenes del producto (máximo 2)</label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    className="pc-input"
                    onChange={(e) => setImagenes(Array.from(e.target.files || []).slice(0, 2))}
                  />
                  <small style={{ display: 'block', marginTop: 6 }}>La primera será la imagen principal y la segunda se mostrará como imagen adicional. Ambas se convierten a PNG transparente y se guardan por categoría.</small>
                  {imagenes.length > 0 && (
                    <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                      {imagenes.map((archivo, index) => (
                        <div key={`${archivo.name}-${index}`} style={{ padding: 10, border: '1px solid #ddd', borderRadius: 8, background: 'repeating-conic-gradient(#eee 0% 25%, #fff 0% 50%) 50% / 16px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><ImageIcon size={16} /> {index + 1}. {archivo.name}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <textarea placeholder="Descripción del producto" className="pc-textarea" rows={4} style={{ marginTop: 14, width: '100%' }} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />

              {esAdmin && (
                <div className="pc-card" style={{ marginTop: 18, padding: 18 }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 0 }}><Truck size={18} /> Dropshipping</h3>
                  <p style={{ marginTop: 0 }}>Información privada del proveedor. Solo los administradores pueden verla.</p>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <input type="checkbox" checked={dropshippingActivo} onChange={(e) => setDropshippingActivo(e.target.checked)} />
                    Activar dropshipping para este producto
                  </label>
                  {dropshippingActivo && (
                    <div className="pc-form-grid">
                      <input type="text" placeholder="Proveedor" className="pc-input" value={proveedor} onChange={(e) => setProveedor(e.target.value)} required />
                      <input type="url" placeholder="https://proveedor.com/producto" className="pc-input" value={urlProveedor} onChange={(e) => setUrlProveedor(e.target.value)} required />
                      <input type="number" placeholder="Costo del proveedor (Lps)" step="0.01" min="0" className="pc-input" value={costoProveedor} onChange={(e) => setCostoProveedor(e.target.value)} required />
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button type="submit" disabled={cargando} className="pc-btn pc-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Save size={17} /> {cargando ? 'Guardando...' : 'Guardar'}
                </button>
                <button type="button" className="pc-btn pc-btn-light" onClick={resetFormulario} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <X size={17} /> Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="pc-card pc-table-wrapper">
          <table className="pc-table">
            <thead><tr><th>Nombre</th><th>Categoría</th><th>Marca</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr></thead>
            <tbody>
              {productos.map((producto) => (
                <tr key={producto.id}>
                  <td>{producto.nombre}</td>
                  <td>{producto.categorias?.nombre || 'Sin categoría'}</td>
                  <td>{producto.marca}</td>
                  <td>L {Number(producto.precio).toFixed(2)}</td>
                  <td>{producto.stock}</td>
                  <td>
                    <button className="pc-btn pc-btn-light" onClick={() => handleEditar(producto)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Pencil size={16} /> Editar</button>
                    {esAdmin && <button className="pc-btn pc-btn-danger" onClick={() => handleEliminar(producto.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 8 }}><Trash2 size={16} /> Eliminar</button>}
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