import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { supabase } from '../../supabaseClient'
import { useCarrito } from '../../context/CarritoContext'
import { useAuth } from '../../hooks/useAuth'
import { obtenerProveedorProducto } from '../../services/productosService'
import BotonAtras from '../../components/BotonAtras'

export default function DetalleProducto() {
  const { id } = useParams()
  const { usuario, esAdmin } = useAuth()
  const { agregarProducto } = useCarrito()

  const [producto, setProducto] = useState(null)
  const [proveedor, setProveedor] = useState(null)
  const [resenas, setResenas] = useState([])
  const [cantidad, setCantidad] = useState(1)
  const [calificacion, setCalificacion] = useState(5)
  const [comentario, setComentario] = useState('')
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    cargarProducto()
  }, [id, esAdmin])

  const cargarProducto = async () => {
    setCargando(true)

    const { data, error } = await supabase
      .from('productos')
      .select('*, categorias(nombre)')
      .eq('id', id)
      .single()

    if (error) {
      setMensaje(error.message)
      setCargando(false)
      return
    }

    const { data: resenasData } = await supabase
      .from('reseñas')
      .select('*')
      .eq('producto_id', id)
      .order('created_at', { ascending: false })

    if (esAdmin) {
      const proveedorResultado = await obtenerProveedorProducto(id)
      if (proveedorResultado.success) {
        setProveedor(proveedorResultado.data)
      }
    } else {
      setProveedor(null)
    }

    setProducto(data)
    setResenas(resenasData || [])
    setCargando(false)
  }

  const agregar = () => {
    const cantidadNumerica = Number(cantidad)

    if (
      !Number.isInteger(cantidadNumerica) ||
      cantidadNumerica < 1 ||
      cantidadNumerica > producto.stock
    ) {
      setMensaje('Selecciona una cantidad válida.')
      return
    }

    const resultado = agregarProducto(producto, cantidadNumerica)
    setMensaje(resultado.message)
  }

  const guardarResena = async (e) => {
    e.preventDefault()

    if (!usuario) {
      setMensaje('Debes iniciar sesión para publicar una reseña.')
      return
    }

    if (!comentario.trim()) {
      setMensaje('Escribe un comentario antes de publicar.')
      return
    }

    const { error } = await supabase
      .from('reseñas')
      .insert([{
        producto_id: producto.id,
        usuario_id: usuario.id,
        calificación: Number(calificacion),
        comentario: comentario.trim(),
      }])

    if (error) {
      setMensaje(error.message)
      return
    }

    setComentario('')
    setCalificacion(5)
    setMensaje('Reseña publicada.')
    await cargarProducto()
  }

  if (cargando) {
    return (
      <main className="pc-page">
        <div className="pc-container"><div className="pc-loader" /></div>
      </main>
    )
  }

  if (!producto) {
    return (
      <main className="pc-page">
        <div className="pc-container pc-empty">
          <BotonAtras />
          <h1>Producto no encontrado</h1>
          <Link to="/tienda">Regresar</Link>
        </div>
      </main>
    )
  }

  const precioActual = Number(producto.precio_descuento || producto.precio)

  return (
    <main className="pc-page">
      <div className="pc-container">
        <BotonAtras />

        <div className="pc-product-detail">
          <div className="pc-detail-image">
            {producto.imagen_principal ? (
              <img src={producto.imagen_principal} alt={producto.nombre} />
            ) : (
              <span>🖥️</span>
            )}
          </div>

          <section>
            <span className="pc-kicker">{producto.categorias?.nombre}</span>
            <h1>{producto.nombre}</h1>
            <p className="pc-detail-brand">
              {producto.marca}{producto.modelo ? ` · ${producto.modelo}` : ''}
            </p>
            <p className="pc-detail-description">{producto.descripción}</p>

            <div className="pc-price-row">
              <span className="pc-price pc-price-large">L {precioActual.toFixed(2)}</span>
              {producto.precio_descuento && (
                <span className="pc-old-price">L {Number(producto.precio).toFixed(2)}</span>
              )}
            </div>

            <p className="pc-stock">
              {producto.stock > 0 ? `${producto.stock} unidades disponibles` : 'Producto agotado'}
            </p>

            {esAdmin && proveedor?.activo && (
              <div className="pc-card" style={{ margin: '18px 0', padding: 16 }}>
                <strong>🚚 Dropshipping</strong>
                <p style={{ margin: '6px 0 12px' }}>
                  Proveedor: {proveedor.proveedor} · Costo: L {Number(proveedor.costo).toFixed(2)}
                </p>
                <a
                  href={proveedor.url_compra}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pc-btn pc-btn-light"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}
                >
                  <ExternalLink size={16} />
                  Comprar al proveedor
                </a>
              </div>
            )}

            <div className="pc-buy-row">
              <input
                type="number"
                min="1"
                max={producto.stock}
                className="pc-input pc-qty"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value === '' ? '' : Number(e.target.value))}
              />
              <button
                type="button"
                className="pc-btn pc-btn-primary"
                disabled={producto.stock <= 0}
                onClick={agregar}
              >
                Agregar al carrito
              </button>
            </div>

            {mensaje && <div className="pc-message">{mensaje}</div>}
          </section>
        </div>

        <section className="pc-section">
          <h2 className="pc-section-title">Reseñas</h2>

          {usuario ? (
            <form className="pc-card pc-review-form" onSubmit={guardarResena}>
              <select className="pc-select" value={calificacion} onChange={(e) => setCalificacion(Number(e.target.value))}>
                <option value="5">⭐⭐⭐⭐⭐ 5</option>
                <option value="4">⭐⭐⭐⭐ 4</option>
                <option value="3">⭐⭐⭐ 3</option>
                <option value="2">⭐⭐ 2</option>
                <option value="1">⭐ 1</option>
              </select>
              <textarea
                className="pc-textarea"
                rows="4"
                placeholder="Cuéntanos tu experiencia..."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                required
              />
              <button type="submit" className="pc-btn pc-btn-primary">Publicar reseña</button>
            </form>
          ) : (
            <p><Link to="/login">Inicia sesión</Link> para publicar una reseña.</p>
          )}

          <div className="pc-review-list">
            {resenas.map((resena) => (
              <article key={resena.id} className="pc-card pc-review">
                <strong>{'⭐'.repeat(resena.calificación)}</strong>
                <p>{resena.comentario}</p>
                <span>{new Date(resena.created_at).toLocaleDateString()}</span>
              </article>
            ))}
            {resenas.length === 0 && (
              <div className="pc-empty-small">Este producto todavía no tiene reseñas.</div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}