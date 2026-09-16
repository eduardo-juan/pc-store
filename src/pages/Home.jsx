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
  ArrowRight,
  Box,
  Fan,
  Zap,
} from 'lucide-react'
import { supabase } from '../supabaseClient'

const categoriasBase = [
  { nombre: 'Procesadores', icono: Cpu, extra: '(CPU)' },
  { nombre: 'Tarjetas gráficas', icono: CircuitBoard, extra: '(GPU)' },
  { nombre: 'Memoria RAM', icono: MemoryStick },
  { nombre: 'Almacenamiento', icono: HardDrive, extra: '(SSD/HDD)' },
  { nombre: 'Placas Base', icono: CircuitBoard },
  { nombre: 'Fuentes de Alimentación', icono: Zap },
  { nombre: 'Torres / Cajas', icono: Box },
  { nombre: 'Refrigeración', icono: Fan },
  { nombre: 'Periféricos', icono: Headphones },
  { nombre: 'Accesorios', icono: Monitor },
]

export default function Home() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarVistazo()
  }, [])

  const cargarVistazo = async () => {
    setCargando(true)
    const { data } = await supabase
      .from('productos')
      .select('id, nombre, imagen_principal, categorias(nombre)')
      .eq('activo', true)
      .order('id', { ascending: false })
      .limit(8)
    setProductos(data || [])
    setCargando(false)
  }

  const imagenPorCategoria = {}
  productos.forEach((producto) => {
    const categoria = producto.categorias?.nombre
    if (categoria && !imagenPorCategoria[categoria])
      imagenPorCategoria[categoria] = producto.imagen_principal
  })

  const heroImages = productos.slice(0, 4).filter((producto) => producto.imagen_principal)

  return (
    <main className="pc-home pc-home-reference">
      <section className="pc-home-hero">
        <div className="pc-container pc-home-hero-grid">
          <div className="pc-home-hero-copy">
            <span className="pc-home-eyebrow">PC STORE · COMPONENTES</span>
            <h1>
              Rendimiento
              <br />
              <span>sin límites</span>
            </h1>
            <p>
              Componentes para construir una PC potente, equilibrada y preparada para lo que
              necesites.
            </p>
            <Link to="/tienda" className="pc-home-main-btn">
              Ver productos <ArrowRight size={18} />
            </Link>
            <div className="pc-home-dots">
              <i />
              <i />
              <i />
            </div>
          </div>

          <div className="pc-home-hero-visual">
            <div className="pc-home-hero-glow" />
            {heroImages[0] && (
              <img
                className="pc-home-hero-main-image"
                src={heroImages[0].imagen_principal}
                alt={heroImages[0].nombre}
              />
            )}
            {heroImages.slice(1, 4).map((producto, index) => (
              <img
                key={producto.id}
                className={`pc-home-float-image pc-home-float-${index + 1}`}
                src={producto.imagen_principal}
                alt=""
              />
            ))}
          </div>

          <div className="pc-home-trust">
            <div>
              <Truck />
              <section>
                <strong>Envíos rápidos</strong>
                <span>A toda Honduras</span>
              </section>
            </div>
            <div>
              <ShieldCheck />
              <section>
                <strong>Garantía oficial</strong>
                <span>En todos los productos</span>
              </section>
            </div>
            <div>
              <Headset />
              <section>
                <strong>Soporte especializado</strong>
                <span>Te ayudamos siempre</span>
              </section>
            </div>
          </div>
        </div>
      </section>

      <section className="pc-home-categories">
        <div className="pc-container">
          <div className="pc-home-section-intro">
            <div>
              <span>ENCUENTRA LO QUE NECESITAS</span>
              <h2>Explora por categoría</h2>
            </div>
            <Link to="/tienda" className="pc-home-outline-btn">
              Ver tienda <ArrowRight size={17} />
            </Link>
          </div>
          <div className="pc-home-category-grid">
            {categoriasBase.map((categoria) => {
              const Icono = categoria.icono
              const imagen = imagenPorCategoria[categoria.nombre]
              return (
                <Link key={categoria.nombre} to="/tienda" className="pc-home-category-card">
                  <div className="pc-home-category-image">
                    {imagen ? (
                      <img src={imagen} alt={categoria.nombre} />
                    ) : (
                      <Icono size={40} strokeWidth={1.35} />
                    )}
                  </div>
                  <div className="pc-home-category-info">
                    <span>{categoria.nombre}</span>
                    {categoria.extra && <small>{categoria.extra}</small>}
                  </div>
                  <ArrowRight className="pc-home-category-arrow" size={15} />
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="pc-section pc-home-products">
        <div className="pc-container">
          <div className="pc-home-section-intro">
            <div>
              <span>SELECCIÓN PC STORE</span>
              <h2>Productos destacados</h2>
            </div>
            <Link to="/tienda" className="pc-home-outline-btn">
              Ver todos <ArrowRight size={17} />
            </Link>
          </div>

          {cargando ? (
            <div className="pc-home-loading">Cargando productos...</div>
          ) : (
            <div className="pc-home-product-grid">
              {productos.slice(0, 6).map((producto) => (
                <Link
                  key={producto.id}
                  to={`/producto/${producto.id}`}
                  className="pc-home-product-card"
                >
                  <div className="pc-home-product-image">
                    {producto.imagen_principal ? (
                      <img src={producto.imagen_principal} alt={producto.nombre} />
                    ) : (
                      <Monitor size={64} strokeWidth={1.2} />
                    )}
                  </div>
                  <div className="pc-home-product-info">
                    <span>{producto.categorias?.nombre || 'Componente'}</span>
                    <h3>{producto.nombre}</h3>
                    <div className="pc-home-product-link">
                      Ver producto <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="pc-home-benefits">
        <div className="pc-container">
          <div className="pc-home-benefits-grid">
            <div className="pc-home-benefit">
              <ShieldCheck />
              <div>
                <h3>Productos de calidad</h3>
                <p>Las mejores marcas del mercado</p>
              </div>
            </div>
            <div className="pc-home-benefit">
              <Truck />
              <div>
                <h3>Envíos rápidos</h3>
                <p>Recibe tu pedido en 24-48h</p>
              </div>
            </div>
            <div className="pc-home-benefit">
              <ShieldCheck />
              <div>
                <h3>Pago seguro</h3>
                <p>Tus datos siempre protegidos</p>
              </div>
            </div>
            <div className="pc-home-benefit">
              <Headset />
              <div>
                <h3>Atención personalizada</h3>
                <p>Estamos para ayudarte</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .pc-home-reference{background:#f6f6f4;color:#161616;overflow:hidden}
        .pc-home-reference .pc-home-hero{background:#0a0a0a;color:#fff;border-bottom:3px solid #d4af37}
        .pc-home-reference .pc-home-hero-grid{display:grid;grid-template-columns:minmax(330px,.85fr) minmax(440px,1.35fr);grid-template-rows:auto auto;align-items:center;gap:0 28px;min-height:500px;padding-top:22px}
        .pc-home-reference .pc-home-hero-copy{padding:45px 0 34px;position:relative;z-index:5}
        .pc-home-reference .pc-home-eyebrow{display:inline-flex;border:1px solid #d4af37;border-radius:4px;padding:7px 12px;color:#d4af37;background:#111;font-size:.68rem;font-weight:900;letter-spacing:.14em}
        .pc-home-reference .pc-home-hero-copy h1{margin:18px 0 16px;font-size:clamp(3.1rem,5.3vw,5rem);line-height:.91;letter-spacing:-.055em;color:#fff}
        .pc-home-reference .pc-home-hero-copy h1 span{color:#d4af37}
        .pc-home-reference .pc-home-hero-copy p{max-width:440px;margin:0 0 23px;color:#c7c7c7;line-height:1.6;font-size:.92rem}
        .pc-home-reference .pc-home-main-btn{display:inline-flex;align-items:center;gap:13px;padding:13px 23px;border-radius:4px;background:#d4af37;color:#0a0a0a;font-weight:900;box-shadow:0 9px 25px rgba(212,175,55,.18);transition:.2s}
        .pc-home-reference .pc-home-main-btn:hover{background:#fff;transform:translateY(-2px)}
        .pc-home-dots{display:flex;gap:7px;margin-top:24px}.pc-home-dots i{width:8px;height:8px;border-radius:50%;background:#555}.pc-home-dots i:first-child{background:#d4af37}
        .pc-home-hero-visual{height:420px;position:relative;display:flex;align-items:center;justify-content:center}
        .pc-home-hero-glow{position:absolute;width:410px;height:330px;border-radius:50%;background:radial-gradient(circle,rgba(212,175,55,.27) 0,rgba(212,175,55,.08) 42%,transparent 72%)}
        .pc-home-hero-visual img{position:absolute;object-fit:contain;filter:drop-shadow(0 22px 25px rgba(0,0,0,.5))}
        .pc-home-hero-main-image{width:65%;height:330px;z-index:3}.pc-home-float-1{width:34%;height:145px;left:4%;bottom:7%;z-index:4}.pc-home-float-2{width:30%;height:115px;right:2%;bottom:8%;z-index:4}.pc-home-float-3{width:23%;height:92px;right:25%;bottom:0;z-index:5}
        .pc-home-trust{grid-column:1/-1;display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid #292929;padding:20px 0 23px;margin-top:-2px}
        .pc-home-trust>div{display:flex;align-items:center;justify-content:center;gap:12px;border-right:1px solid #292929}.pc-home-trust>div:last-child{border-right:0}.pc-home-trust svg{width:42px;height:42px;flex:none;padding:9px;border:1px solid #d4af37;border-radius:50%;color:#d4af37}.pc-home-trust section{display:flex;flex-direction:column;gap:3px}.pc-home-trust strong{font-size:.77rem;color:#fff}.pc-home-trust span{font-size:.66rem;color:#888}
        .pc-home-reference .pc-home-categories{background:#f6f6f4;padding:42px 0 45px}
        .pc-home-section-intro{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:22px}.pc-home-section-intro>div>span{font-size:.62rem;font-weight:900;letter-spacing:.15em;color:#9a7b16}.pc-home-section-intro h2{margin:5px 0 0;font-size:1.85rem;letter-spacing:-.035em;color:#111}.pc-home-reference .pc-home-outline-btn{display:flex;align-items:center;gap:7px;color:#111;font-size:.76rem;font-weight:800;border-bottom:1px solid #d4af37;padding-bottom:5px}.pc-home-reference .pc-home-outline-btn svg{color:#d4af37}
        .pc-home-reference .pc-home-category-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
        .pc-home-reference .pc-home-category-card{min-height:148px;padding:14px 14px 12px;border:1px solid #dededb;border-radius:7px;background:#fff;display:grid;grid-template-columns:1fr auto;grid-template-rows:1fr auto;align-items:end;position:relative;overflow:hidden;transition:.2s}
        .pc-home-reference .pc-home-category-card:hover{border-color:#d4af37;transform:translateY(-3px);box-shadow:0 12px 24px rgba(0,0,0,.08)}
        .pc-home-reference .pc-home-category-image{grid-column:1/-1;height:86px;display:flex;align-items:center;justify-content:center}.pc-home-reference .pc-home-category-image img{width:100%;height:84px;object-fit:contain}.pc-home-reference .pc-home-category-image svg{color:#181818}
        .pc-home-reference .pc-home-category-info span{display:block;font-size:.75rem;font-weight:800;line-height:1.2}.pc-home-reference .pc-home-category-info small{display:block;color:#8b8b8b;font-size:.63rem;margin-top:3px}.pc-home-category-arrow{color:#d4af37;align-self:end}
        .pc-home-reference .pc-home-products{background:#fff;padding:48px 0 52px}.pc-home-reference .pc-home-product-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
        .pc-home-reference .pc-home-product-card{background:#fff;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;transition:.2s;display:block}.pc-home-reference .pc-home-product-card:hover{transform:translateY(-4px);border-color:#d4af37;box-shadow:0 14px 28px rgba(0,0,0,.08)}
        .pc-home-reference .pc-home-product-image{height:245px;display:flex;align-items:center;justify-content:center;background:#fafafa}.pc-home-reference .pc-home-product-image img{width:100%;height:100%;padding:20px;object-fit:contain}.pc-home-reference .pc-home-product-info{padding:15px 17px 17px}.pc-home-reference .pc-home-product-info span{display:inline-block;color:#8b8b8b;font-size:.62rem;text-transform:uppercase;letter-spacing:.07em;font-weight:800}.pc-home-reference .pc-home-product-info h3{margin:6px 0 11px;color:#161616;font-size:.9rem;line-height:1.35;font-weight:800}.pc-home-product-link{display:inline-flex;align-items:center;gap:6px;color:#9a7b16;font-size:.68rem;font-weight:900;text-transform:uppercase;letter-spacing:.05em}
        .pc-home-reference .pc-home-benefits{background:#0a0a0a;color:#fff;border-top:3px solid #d4af37;padding:24px 0;margin:0}.pc-home-reference .pc-home-benefits-grid{display:grid;grid-template-columns:repeat(4,1fr)}.pc-home-reference .pc-home-benefit{display:flex;align-items:center;justify-content:center;gap:11px;padding:7px 18px;border-right:1px solid #292929}.pc-home-reference .pc-home-benefit:last-child{border-right:0}.pc-home-reference .pc-home-benefit svg{width:37px;height:37px;padding:8px;border:1px solid #d4af37;border-radius:50%;color:#d4af37;flex:none}.pc-home-reference .pc-home-benefit h3{margin:0 0 3px;font-size:.71rem;color:#fff}.pc-home-reference .pc-home-benefit p{margin:0;color:#888;font-size:.6rem}
        .pc-home-loading{text-align:center;padding:40px;color:#777}
        @media(max-width:1100px){.pc-home-reference .pc-home-hero-grid{grid-template-columns:1fr 1fr}.pc-home-reference .pc-home-category-grid{grid-template-columns:repeat(4,1fr)}.pc-home-reference .pc-home-product-grid{grid-template-columns:repeat(2,1fr)}.pc-home-reference .pc-home-benefits-grid{grid-template-columns:repeat(2,1fr)}.pc-home-reference .pc-home-benefit{border-bottom:1px solid #292929}.pc-home-reference .pc-home-benefit:nth-child(2){border-right:0}.pc-home-reference .pc-home-benefit:nth-child(3),.pc-home-reference .pc-home-benefit:nth-child(4){border-bottom:0}}
        @media(max-width:700px){.pc-home-reference .pc-home-hero-grid{grid-template-columns:1fr;min-height:0;padding-top:20px}.pc-home-reference .pc-home-hero-copy{text-align:center;padding:35px 0 15px}.pc-home-reference .pc-home-hero-copy p{margin-left:auto;margin-right:auto}.pc-home-hero-visual{height:290px}.pc-home-hero-main-image{height:245px}.pc-home-trust{grid-template-columns:1fr;gap:0;padding:5px 0}.pc-home-trust>div{justify-content:flex-start;border-right:0;border-bottom:1px solid #292929;padding:13px 4px}.pc-home-trust>div:last-child{border-bottom:0}.pc-home-reference .pc-home-categories{padding:32px 0}.pc-home-reference .pc-home-category-grid{grid-template-columns:repeat(2,1fr)}.pc-home-reference .pc-home-product-grid{grid-template-columns:1fr}.pc-home-reference .pc-home-product-image{height:230px}.pc-home-reference .pc-home-section-intro{align-items:flex-start}.pc-home-reference .pc-home-section-intro h2{font-size:1.55rem}.pc-home-reference .pc-home-benefits-grid{grid-template-columns:1fr}.pc-home-reference .pc-home-benefit,.pc-home-reference .pc-home-benefit:nth-child(3),.pc-home-reference .pc-home-benefit:nth-child(4){border-right:0;border-bottom:1px solid #292929;padding:13px 8px;justify-content:flex-start}.pc-home-reference .pc-home-benefit:last-child{border-bottom:0}}
        @media(max-width:480px){.pc-home-reference .pc-home-category-grid{grid-template-columns:1fr 1fr}.pc-home-reference .pc-home-category-card{min-height:132px;padding:11px}.pc-home-reference .pc-home-category-image{height:73px}.pc-home-reference .pc-home-section-intro{gap:10px}.pc-home-reference .pc-home-outline-btn{font-size:.67rem;white-space:nowrap}}
      `}</style>
    </main>
  )
}
