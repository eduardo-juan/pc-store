import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  Monitor,
  Cpu,
  CircuitBoard,
  HardDrive,
  MemoryStick,
  Headphones,
  ShieldCheck,
  Truck,
  Headset,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../supabaseClient'

const categoriasBase = [
  {
    nombre: 'Procesadores',
    icono: Cpu,
  },
  {
    nombre: 'Tarjetas gráficas',
    icono: CircuitBoard,
  },
  {
    nombre: 'Memoria RAM',
    icono: MemoryStick,
  },
  {
    nombre: 'Almacenamiento',
    icono: HardDrive,
  },
  {
    nombre: 'Placas base',
    icono: CircuitBoard,
  },
  {
    nombre: 'Monitores',
    icono: Monitor,
  },
  {
    nombre: 'Periféricos',
    icono: Headphones,
  },
]

export default function Home() {
  const { usuario } = useAuth()

  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarVistazo()
  }, [])

  const cargarVistazo = async () => {
    setCargando(true)

    const { data } = await supabase
      .from('productos')
      .select(
        'id, nombre, imagen_principal, categorias(nombre)'
      )
      .eq('activo', true)
      .order('id', { ascending: false })
      .limit(8)

    setProductos(data || [])
    setCargando(false)
  }

  const productoHero = productos[0]
  const productoBanner = productos[1] || productos[0]

  const imagenPorCategoria = {}

  productos.forEach((producto) => {
    const categoria = producto.categorias?.nombre

    if (categoria && !imagenPorCategoria[categoria]) {
      imagenPorCategoria[categoria] =
        producto.imagen_principal
    }
  })

  return (
    <main className="pc-home">

      {/* HERO */}
      <section className="pc-home-hero">
        {productoHero?.imagen_principal && (
          <div
            className="pc-home-hero-image"
            style={{
              backgroundImage: `url("${productoHero.imagen_principal}")`,
            }}
          />
        )}

        <div className="pc-home-hero-overlay" />

        <div className="pc-container pc-home-hero-content">
          <div className="pc-home-hero-copy">
            <span className="pc-home-eyebrow">
              PC STORE
            </span>

            <h1>
              Tu estación
              <br />
              <span>de juego y trabajo</span>
              <br />
              en un solo lugar.
            </h1>

            <p>
              Componentes, PCs armadas, periféricos y todo
              lo necesario para llevar tu rendimiento al
              siguiente nivel.
            </p>

            <div className="pc-home-hero-actions">
              <Link
                to="/tienda"
                className="pc-btn pc-btn-primary pc-home-main-btn"
              >
                Explorar productos
                <ArrowRight size={18} />
              </Link>

              {!usuario && (
                <Link
                  to="/registro"
                  className="pc-btn pc-btn-light"
                >
                  Crear cuenta
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="pc-home-categories">
        <div className="pc-container">
          <div className="pc-home-category-grid">
            {categoriasBase.map((categoria) => {
              const Icono = categoria.icono
              const imagen =
                imagenPorCategoria[categoria.nombre]

              return (
                <Link
                  key={categoria.nombre}
                  to="/tienda"
                  className="pc-home-category-card"
                >
                  <div className="pc-home-category-image">
                    {imagen ? (
                      <img
                        src={imagen}
                        alt={categoria.nombre}
                      />
                    ) : (
                      <Icono
                        size={42}
                        strokeWidth={1.4}
                      />
                    )}
                  </div>

                  <div className="pc-home-category-info">
                    <span>{categoria.nombre}</span>
                    <ArrowRight size={16} />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      <section className="pc-section pc-home-products">
        <div className="pc-container">

          <div className="pc-home-section-header">
            <div>
              <span className="pc-home-section-label">
                PRODUCTOS DESTACADOS
              </span>

              <h2 className="pc-section-title">
                Lo mejor para tu <span>setup</span>
              </h2>

              <p className="pc-section-subtitle">
                Descubre algunos de los productos que
                forman parte de nuestro catálogo.
              </p>
            </div>

            <Link
              to="/tienda"
              className="pc-home-outline-btn"
            >
              Ver toda la tienda
              <ArrowRight size={17} />
            </Link>
          </div>

          {cargando ? (
            <div className="pc-home-loading">
              Cargando productos...
            </div>
          ) : (
            <div className="pc-home-product-grid">
              {productos.map((producto) => (
                <article
                  key={producto.id}
                  className="pc-home-product-card"
                >
                  <div className="pc-home-product-image">
                    {producto.imagen_principal ? (
                      <img
                        src={producto.imagen_principal}
                        alt={producto.nombre}
                      />
                    ) : (
                      <Monitor
                        size={64}
                        strokeWidth={1.2}
                      />
                    )}
                  </div>

                  <div className="pc-home-product-info">
                    <span>
                      {producto.categorias?.nombre ||
                        'Componente'}
                    </span>

                    <h3>{producto.nombre}</h3>
                  </div>
                </article>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* BANNER */}
      <section className="pc-container pc-home-banner-section">
        <div className="pc-home-banner">

          {productoBanner?.imagen_principal && (
            <div
              className="pc-home-banner-image"
              style={{
                backgroundImage: `url("${productoBanner.imagen_principal}")`,
              }}
            />
          )}

          <div className="pc-home-banner-overlay" />

          <div className="pc-home-banner-content">
            <span className="pc-home-section-label">
              RENDIMIENTO QUE SE NOTA
            </span>

            <h2>
              Componentes para construir
              <br />
              <span>la PC de tus sueños.</span>
            </h2>

            <p>
              Encuentra hardware y periféricos para
              gaming, trabajo y creación de contenido.
            </p>

            <Link
              to="/tienda"
              className="pc-btn pc-btn-primary"
            >
              Ver productos
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="pc-home-benefits">
        <div className="pc-container">
          <div className="pc-home-benefits-grid">

            <div className="pc-home-benefit">
              <ShieldCheck size={38} strokeWidth={1.5} />

              <div>
                <h3>Compra segura</h3>
                <p>
                  Tus datos y compras están protegidos.
                </p>
              </div>
            </div>

            <div className="pc-home-benefit">
              <Truck size={38} strokeWidth={1.5} />

              <div>
                <h3>Envíos confiables</h3>
                <p>
                  Recibe tus productos de forma segura.
                </p>
              </div>
            </div>

            <div className="pc-home-benefit">
              <Headset size={38} strokeWidth={1.5} />

              <div>
                <h3>Soporte especializado</h3>
                <p>
                  Estamos para ayudarte cuando lo necesites.
                </p>
              </div>
            </div>

            <div className="pc-home-benefit">
              <Sparkles size={38} strokeWidth={1.5} />

              <div>
                <h3>Productos de calidad</h3>
                <p>
                  Componentes seleccionados para tu equipo.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

    </main>
  )
}