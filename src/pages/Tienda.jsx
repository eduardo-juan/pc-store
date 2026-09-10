import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Monitor, ShoppingCart } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { useCarrito } from '../context/CarritoContext'

export default function Tienda() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const { agregarProducto } = useCarrito()

  useEffect(() => {
    cargarTienda()
  }, [])

  const cargarTienda = async () => {
    setCargando(true)
    setError('')

    const {
      data: productosData,
      error: productosError,
    } = await supabase
      .from('productos')
      .select('*, categorias(id, nombre)')
      .eq('activo', true)
      .order('id')

    if (productosError) {
      setError(productosError.message)
      setCargando(false)
      return
    }

    const {
      data: categoriasData,
      error: categoriasError,
    } = await supabase
      .from('categorias')
      .select('id, nombre')
      .order('nombre')

    if (categoriasError) {
      setError(categoriasError.message)
      setCargando(false)
      return
    }

    setProductos(productosData || [])
    setCategorias(categoriasData || [])
    setCargando(false)
  }

  const productosFiltrados = useMemo(() => {
    return productos.filter((producto) => {
      const texto = busqueda.trim().toLowerCase()

      const coincideTexto =
        texto === '' ||
        producto.nombre?.toLowerCase().includes(texto) ||
        producto.marca?.toLowerCase().includes(texto) ||
        producto.modelo?.toLowerCase().includes(texto)

      const coincideCategoria =
        categoriaId === '' ||
        String(producto.categoria_id) === String(categoriaId)

      return coincideTexto && coincideCategoria
    })
  }, [productos, busqueda, categoriaId])

  if (cargando) {
    return (
      <main className="pc-page">
        <div className="pc-container">
          Cargando productos...
        </div>
      </main>
    )
  }

  return (
    <main className="pc-page">
      <div className="pc-container">

        <div className="pc-admin-header">
          <h1>Tienda</h1>

          <p>
            Encuentra componentes disponibles
            en PC Store.
          </p>
        </div>

        <div className="pc-toolbar">

          <input
            type="search"
            className="pc-input"
            placeholder="Buscar por nombre, marca o modelo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          <select
            className="pc-select"
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
          >
            <option value="">
              Todas las categorías
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

        </div>

        {error && (
          <div
            className="pc-card"
            style={{ padding: 18 }}
          >
            Error: {error}
          </div>
        )}

        {mensaje && (
          <div className="pc-toast">
            {mensaje}
          </div>
        )}

        <div className="pc-product-grid">

          {productosFiltrados.map((producto) => (
            <article
              key={producto.id}
              className="pc-card pc-product-card"
            >

              <div className="pc-product-image">

                {producto.imagen_principal ? (
                  <img
                    src={producto.imagen_principal}
                    alt={producto.nombre}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <Monitor size={48} strokeWidth={1.5} />
                )}

              </div>

              <div className="pc-product-body">

                <div className="pc-product-category">
                  {producto.categorias?.nombre || 'Sin categoría'}
                </div>

                <h3 className="pc-product-name">
                  {producto.nombre}
                </h3>

                <p className="pc-product-description">
                  {producto.descripción?.substring(0, 90)}
                  {producto.descripción?.length > 90 ? '...' : ''}
                </p>

                <div className="pc-price-row">

                  {producto.precio_descuento ? (
                    <>
                      <span className="pc-price">
                        L {Number(producto.precio_descuento).toFixed(2)}
                      </span>

                      <span className="pc-old-price">
                        L {Number(producto.precio).toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="pc-price">
                      L {Number(producto.precio).toFixed(2)}
                    </span>
                  )}

                </div>

                {/* Se mantiene en verde */}
                <div className="pc-stock">
                  Stock disponible: {producto.stock}
                </div>

                <div className="pc-product-actions">

                  <Link
                    to={`/producto/${producto.id}`}
                    className="pc-btn pc-btn-light"
                  >
                    Ver detalle
                  </Link>

                  <button
                    type="button"
                    className="pc-btn pc-btn-primary"
                    disabled={producto.stock <= 0}
                    onClick={() => {
                      const resultado = agregarProducto(producto)

                      setMensaje(resultado.message)

                      setTimeout(
                        () => setMensaje(''),
                        2200
                      )
                    }}
                  >
                    {producto.stock > 0 ? (
                      <>
                        <ShoppingCart size={18} />
                        <span>Agregar</span>
                      </>
                    ) : (
                      'Agotado'
                    )}
                  </button>

                </div>

              </div>

            </article>
          ))}

        </div>

        {productosFiltrados.length === 0 && (
          <div
            className="pc-card"
            style={{
              padding: 30,
              textAlign: 'center',
              marginTop: 20,
            }}
          >
            No encontramos productos con esos filtros.
          </div>
        )}

      </div>
    </main>
  )
}