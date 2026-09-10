import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Monitor } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../supabaseClient'

export default function Home() {
  const { usuario } = useAuth()

  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarVistazo()
  }, [])

  const cargarVistazo = async () => {
    const { data } = await supabase
      .from('productos')
      .select(
        'id, nombre, precio, precio_descuento, imagen_principal, categorias(nombre)'
      )
      .eq('activo', true)
      .order('id', { ascending: false })
      .limit(4)

    setProductos(data || [])
    setCargando(false)
  }

  return (
    <>
      <section className="pc-hero">
        <div className="pc-container pc-hero-grid">
          <div>
            <span className="pc-eyebrow">
              Tecnología para construir tu próxima PC
            </span>

            <h1>
              Componentes, rendimiento y control en un solo lugar.
            </h1>

            <p>
              Explora procesadores, tarjetas gráficas,
              memoria, almacenamiento y periféricos.
            </p>

            <div className="pc-hero-actions">
              <Link
                to="/tienda"
                className="pc-btn pc-btn-primary"
              >
                Explorar productos
              </Link>

              {!usuario && (
                <>
                  <Link
                    to="/login"
                    className="pc-btn pc-btn-light"
                  >
                    Entrar
                  </Link>

                  <Link
                    to="/registro"
                    className="pc-btn pc-btn-light"
                  >
                    Crear cuenta
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="pc-section">
        <div className="pc-container">
          <h2 className="pc-section-title">
            Algunos de nuestros productos
          </h2>

          <p className="pc-section-subtitle">
            Un vistazo rápido al catálogo. Para agregar
            al carrito visita la tienda completa.
          </p>

          {cargando ? (
            <div style={{ padding: 20 }}>
              Cargando productos...
            </div>
          ) : (
            <div className="pc-product-grid">
              {productos.map((producto) => (
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
                      {producto.categorias?.nombre ||
                        'Sin categoría'}
                    </div>

                    <h3 className="pc-product-name">
                      {producto.nombre}
                    </h3>

                    <div className="pc-price-row">
                      {producto.precio_descuento ? (
                        <>
                          <span className="pc-price">
                            L{' '}
                            {Number(
                              producto.precio_descuento
                            ).toFixed(2)}
                          </span>

                          <span className="pc-old-price">
                            L{' '}
                            {Number(
                              producto.precio
                            ).toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="pc-price">
                          L{' '}
                          {Number(
                            producto.precio
                          ).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div
            style={{
              textAlign: 'center',
              marginTop: 24,
            }}
          >
            <Link
              to="/tienda"
              className="pc-btn pc-btn-primary"
            >
              Ver toda la tienda
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}