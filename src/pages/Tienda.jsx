import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Cpu,
  Monitor,
  MemoryStick,
  HardDrive,
  Mouse,
  Keyboard,
  SlidersHorizontal,
  ShoppingCart,
  Search,
} from 'lucide-react'
import { supabase } from '../supabaseClient'
import { useCarrito } from '../context/CarritoContext'
import BotonAtras from '../components/BotonAtras'
import { obtenerImagenProducto } from '../utils/imagenesProductos'

const iconosCategoria = [Cpu, Monitor, MemoryStick, HardDrive, Mouse, Keyboard]

export default function Tienda() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [marcas, setMarcas] = useState([])
  const [precioMax, setPrecioMax] = useState(15000)
  const [orden, setOrden] = useState('recientes')
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

    const { data: productosData, error: productosError } = await supabase
      .from('productos')
      .select('*, categorias(id, nombre)')
      .eq('activo', true)
      .order('id')

    if (productosError) {
      setError(productosError.message)
      setCargando(false)
      return
    }

    const { data: categoriasData, error: categoriasError } = await supabase
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

  const marcasDisponibles = useMemo(() => {
    return [...new Set(productos.map((producto) => producto.marca).filter(Boolean))].sort()
  }, [productos])

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    const filtrados = productos.filter((producto) => {
      const coincideTexto =
        texto === '' ||
        producto.nombre?.toLowerCase().includes(texto) ||
        producto.marca?.toLowerCase().includes(texto) ||
        producto.modelo?.toLowerCase().includes(texto)

      const coincideCategoria =
        categoriaId === '' || String(producto.categoria_id) === String(categoriaId)

      const coincideMarca =
        marcas.length === 0 || marcas.includes(producto.marca)

      const precio = Number(producto.precio_descuento || producto.precio || 0)
      const coincidePrecio = precio <= precioMax

      return coincideTexto && coincideCategoria && coincideMarca && coincidePrecio
    })

    return [...filtrados].sort((a, b) => {
      const precioA = Number(a.precio_descuento || a.precio || 0)
      const precioB = Number(b.precio_descuento || b.precio || 0)
      if (orden === 'precio-asc') return precioA - precioB
      if (orden === 'precio-desc') return precioB - precioA
      return Number(b.id) - Number(a.id)
    })
  }, [productos, busqueda, categoriaId, marcas, precioMax, orden])

  const alternarMarca = (marca) => {
    setMarcas((actuales) =>
      actuales.includes(marca)
        ? actuales.filter((item) => item !== marca)
        : [...actuales, marca],
    )
  }

  if (cargando) {
    return (
      <main className="pc-page">
        <div className="pc-container">Cargando productos...</div>
      </main>
    )
  }

  return (
    <main className="pc-page pc-store-page">
      <div className="pc-container pc-store-container">
        <BotonAtras />

        <div className="pc-store-heading">
          <div>
            <span className="pc-kicker">PC STORE</span>
            <h1>Tienda</h1>
            <p>Componentes para construir, actualizar y potenciar tu PC.</p>
          </div>
          <div className="pc-store-count">{productosFiltrados.length} productos</div>
        </div>

        <div className="pc-store-layout">
          <aside className="pc-store-sidebar">
            <div className="pc-sidebar-block">
              <div className="pc-sidebar-title">
                <SlidersHorizontal size={18} />
                <strong>Categorías</strong>
              </div>

              <button
                type="button"
                className={`pc-category-item ${categoriaId === '' ? 'active' : ''}`}
                onClick={() => setCategoriaId('')}
              >
                <span>Todos los productos</span>
                <b>{productos.length}</b>
              </button>

              {categorias.map((categoria, index) => {
                const Icono = iconosCategoria[index % iconosCategoria.length]
                const cantidad = productos.filter((producto) => String(producto.categoria_id) === String(categoria.id)).length

                return (
                  <button
                    key={categoria.id}
                    type="button"
                    className={`pc-category-item ${String(categoriaId) === String(categoria.id) ? 'active' : ''}`}
                    onClick={() => setCategoriaId(String(categoria.id))}
                  >
                    <span>
                      <Icono size={17} />
                      {categoria.nombre}
                    </span>
                    <b>{cantidad}</b>
                  </button>
                )
              })}
            </div>

            <div className="pc-sidebar-block">
              <div className="pc-sidebar-title"><strong>Filtros</strong></div>

              <label className="pc-filter-label" htmlFor="precio-max">
                Precio máximo
                <span>L {precioMax.toLocaleString('es-HN')}</span>
              </label>
              <input
                id="precio-max"
                className="pc-price-range"
                type="range"
                min="500"
                max="15000"
                step="100"
                value={precioMax}
                onChange={(e) => setPrecioMax(Number(e.target.value))}
              />

              <div className="pc-filter-group">
                <strong>Marca</strong>
                {marcasDisponibles.map((marca) => (
                  <label key={marca} className="pc-check-row">
                    <input
                      type="checkbox"
                      checked={marcas.includes(marca)}
                      onChange={() => alternarMarca(marca)}
                    />
                    <span>{marca}</span>
                  </label>
                ))}
              </div>

              <button
                type="button"
                className="pc-filter-reset"
                onClick={() => {
                  setCategoriaId('')
                  setMarcas([])
                  setPrecioMax(15000)
                  setBusqueda('')
                }}
              >
                Limpiar filtros
              </button>
            </div>
          </aside>

          <section className="pc-store-results">
            <div className="pc-store-toolbar">
              <div className="pc-store-search">
                <Search size={18} />
                <input
                  type="search"
                  placeholder="Buscar productos, marca o modelo..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>

              <select
                className="pc-store-sort"
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
                aria-label="Ordenar productos"
              >
                <option value="recientes">Más recientes</option>
                <option value="precio-asc">Precio: menor a mayor</option>
                <option value="precio-desc">Precio: mayor a menor</option>
              </select>
            </div>

            {error && <div className="pc-card" style={{ padding: 18 }}>Error: {error}</div>}
            {mensaje && <div className="pc-toast">{mensaje}</div>}

            <div className="pc-product-grid pc-store-product-grid">
              {productosFiltrados.map((producto) => (
                <article key={producto.id} className="pc-card pc-product-card pc-store-product-card">
                  <Link to={`/producto/${producto.id}`} className="pc-product-image pc-store-product-image">
                    <img
                      src={obtenerImagenProducto(producto)}
                      alt={producto.nombre}
                      loading="lazy"
                    />
                  </Link>

                  <div className="pc-product-body">
                    <div className="pc-product-category">
                      {producto.categorias?.nombre || 'Sin categoría'}
                    </div>

                    <h3 className="pc-product-name">{producto.nombre}</h3>

                    <p className="pc-product-description">
                      {producto.descripción?.substring(0, 90)}
                      {producto.descripción?.length > 90 ? '...' : ''}
                    </p>

                    <div className="pc-price-row">
                      {producto.precio_descuento ? (
                        <>
                          <span className="pc-price">L {Number(producto.precio_descuento).toFixed(2)}</span>
                          <span className="pc-old-price">L {Number(producto.precio).toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="pc-price">L {Number(producto.precio).toFixed(2)}</span>
                      )}
                    </div>

                    <div className="pc-stock-badge">
                      {producto.stock > 0 ? 'En stock' : 'Agotado'}
                    </div>

                    <button
                      type="button"
                      className="pc-btn pc-btn-primary pc-store-cart-btn"
                      disabled={producto.stock <= 0}
                      onClick={() => {
                        const resultado = agregarProducto(producto)
                        setMensaje(resultado.message)
                        setTimeout(() => setMensaje(''), 2200)
                      }}
                    >
                      <ShoppingCart size={17} />
                      {producto.stock > 0 ? 'Agregar al carrito' : 'Agotado'}
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {productosFiltrados.length === 0 && (
              <div className="pc-card pc-empty-small">
                No encontramos productos con esos filtros.
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
