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
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../supabaseClient'

const categoriasBase = [
  { nombre: 'Procesadores', icono: Cpu },
  { nombre: 'Tarjetas gráficas', icono: CircuitBoard },
  { nombre: 'Memoria RAM', icono: MemoryStick },
  { nombre: 'Almacenamiento', icono: HardDrive },
  { nombre: 'Placas base', icono: CircuitBoard },
  { nombre: 'Fuentes de alimentación', icono: Zap },
  { nombre: 'Torres / Cajas', icono: Box },
  { nombre: 'Refrigeración', icono: Fan },
  { nombre: 'Periféricos', icono: Headphones },
  { nombre: 'Accesorios', icono: Monitor },
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
    if (categoria && !imagenPorCategoria[categoria]) {
      imagenPorCategoria[categoria] = producto.imagen_principal
    }
  })

  const heroImages = productos.slice(0, 4).filter((producto) => producto.imagen_principal)

  return (
    <main className="pc-home pc-home-premium">
      <section className="pc-home-hero">
        <div className="pc-container pc-home-hero-grid">
          <div className="pc-home-hero-copy">
            <span className="pc-home-eyebrow">TU PC, TU MUNDO</span>
            <h1>Rendimiento <span>sin límites</span></h1>
            <p>Los mejores componentes para armar la PC de tus sueños. Calidad, rendimiento y confianza.</p>
            <div className="pc-home-hero-actions">
              <Link to="/tienda" className="pc-btn pc-btn-primary pc-home-main-btn">
                Ver productos <ArrowRight size={18} />
              </Link>
              {!usuario && (
                <Link to="/registro" className="pc-home-secondary-btn">Crear cuenta</Link>
              )}
            </div>
            <div className="pc-home-dots"><i /><i /><i /></div>
          </div>

          <div className="pc-home-hero-visual">
            <div className="pc-home-hero-glow" />
            {heroImages[0] && <img className="pc-home-hero-main-image" src={heroImages[0].imagen_principal} alt={heroImages[0].nombre} />}
            {heroImages.slice(1, 4).map((producto, index) => (
              <img key={producto.id} className={`pc-home-float-image pc-home-float-${index + 1}`} src={producto.imagen_principal} alt="" />
            ))}
          </div>

          <div className="pc-home-trust">
            <div><Truck size={25} /><strong>Envíos rápidos</strong><span>A toda Honduras</span></div>
            <div><ShieldCheck size={25} /><strong>Garantía oficial</strong><span>En todos los productos</span></div>
            <div><Headset size={25} /><strong>Soporte especializado</strong><span>Te ayudamos siempre</span></div>
          </div>
        </div>
      </section>

      <section className="pc-home-categories">
        <div className="pc-container">
          <div className="pc-home-category-grid">
            {categoriasBase.map((categoria) => {
              const Icono = categoria.icono
              const imagen = imagenPorCategoria[categoria.nombre]
              return (
                <Link key={categoria.nombre} to="/tienda" className="pc-home-category-card">
                  <div className="pc-home-category-image">
                    {imagen ? <img src={imagen} alt={categoria.nombre} /> : <Icono size={42} strokeWidth={1.35} />}
                  </div>
                  <div className="pc-home-category-info">
                    <span>{categoria.nombre}</span>
                    <small>{categoria.nombre === 'Procesadores' ? '(CPU)' : categoria.nombre === 'Tarjetas gráficas' ? '(GPU)' : ''}</small>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="pc-section pc-home-products">
        <div className="pc-container">
          <div className="pc-home-section-header">
            <div>
              <span className="pc-home-section-label">PRODUCTOS DESTACADOS</span>
              <h2 className="pc-section-title">Lo mejor para tu <span>setup</span></h2>
              <p className="pc-section-subtitle">Descubre algunos de los productos que forman parte de nuestro catálogo.</p>
            </div>
            <Link to="/tienda" className="pc-home-outline-btn">Ver todos <ArrowRight size={17} /></Link>
          </div>

          {cargando ? <div className="pc-home-loading">Cargando productos...</div> : (
            <div className="pc-home-product-grid">
              {productos.slice(0, 6).map((producto) => (
                <Link key={producto.id} to={`/producto/${producto.id}`} className="pc-home-product-card">
                  <div className="pc-home-product-image">
                    {producto.imagen_principal ? <img src={producto.imagen_principal} alt={producto.nombre} /> : <Monitor size={64} strokeWidth={1.2} />}
                  </div>
                  <div className="pc-home-product-info">
                    <span>{producto.categorias?.nombre || 'Componente'}</span>
                    <h3>{producto.nombre}</h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="pc-container pc-home-banner-section">
        <div className="pc-home-banner">
          <div className="pc-home-banner-content">
            <span className="pc-home-section-label">RENDIMIENTO QUE SE NOTA</span>
            <h2>Componentes para construir<br /><span>la PC de tus sueños.</span></h2>
            <p>Encuentra hardware y periféricos para gaming, trabajo y creación de contenido.</p>
            <Link to="/tienda" className="pc-btn pc-btn-primary">Ver productos <ArrowRight size={18} /></Link>
          </div>
          {productos[1]?.imagen_principal && <img src={productos[1].imagen_principal} alt="" className="pc-home-banner-image" />}
        </div>
      </section>

      <section className="pc-home-benefits">
        <div className="pc-container">
          <div className="pc-home-benefits-grid">
            <div className="pc-home-benefit"><ShieldCheck size={34} /><div><h3>Compra segura</h3><p>Tus datos y compras están protegidos.</p></div></div>
            <div className="pc-home-benefit"><Truck size={34} /><div><h3>Envíos confiables</h3><p>Recibe tus productos de forma segura.</p></div></div>
            <div className="pc-home-benefit"><Headset size={34} /><div><h3>Soporte especializado</h3><p>Estamos para ayudarte cuando lo necesites.</p></div></div>
            <div className="pc-home-benefit"><Zap size={34} /><div><h3>Productos de calidad</h3><p>Componentes seleccionados para tu equipo.</p></div></div>
          </div>
        </div>
      </section>

      <style>{`
        .pc-home-premium{background:#fff;color:#171717;overflow:hidden}
        .pc-home-premium .pc-home-hero{background:linear-gradient(135deg,#fff 0%,#fafafa 68%,#f5f0df 100%);min-height:380px;border-bottom:1px solid #eee}
        .pc-home-premium .pc-home-hero-grid{display:grid;grid-template-columns:minmax(300px,.9fr) minmax(380px,1.45fr) 210px;align-items:center;gap:20px;min-height:380px}
        .pc-home-premium .pc-home-eyebrow,.pc-home-premium .pc-home-section-label{display:inline-block;color:#171717;font-size:.72rem;font-weight:900;letter-spacing:.12em;border:1px solid #d4af37;border-radius:6px;padding:5px 10px;background:#fff}
        .pc-home-premium .pc-home-hero-copy h1{font-size:clamp(2.7rem,5vw,4.4rem);line-height:.94;margin:18px 0 15px;color:#171717;letter-spacing:-.045em}
        .pc-home-premium .pc-home-hero-copy h1 span,.pc-home-premium .pc-section-title span,.pc-home-premium .pc-home-banner h2 span{color:#d4af37}
        .pc-home-premium .pc-home-hero-copy p{max-width:470px;color:#666;font-size:1rem;line-height:1.65;margin-bottom:22px}
        .pc-home-premium .pc-home-main-btn{display:inline-flex;align-items:center;gap:10px;background:#d4af37;color:#111;border:0;border-radius:8px;box-shadow:0 8px 20px rgba(212,175,55,.25)}
        .pc-home-secondary-btn{display:inline-flex;margin-left:10px;padding:12px 18px;border:1px solid #222;border-radius:8px;color:#222;font-weight:700}
        .pc-home-dots{display:flex;gap:7px;margin-top:24px}.pc-home-dots i{width:7px;height:7px;border-radius:50%;background:#ddd}.pc-home-dots i:first-child{background:#d4af37}
        .pc-home-hero-visual{position:relative;height:330px;display:flex;align-items:center;justify-content:center}.pc-home-hero-glow{position:absolute;width:280px;height:280px;border-radius:50%;background:radial-gradient(circle,#f7e7a9 0,rgba(247,231,169,.2) 48%,transparent 70%)}
        .pc-home-hero-visual img{position:absolute;object-fit:contain;mix-blend-mode:multiply}.pc-home-hero-main-image{width:68%;height:270px;z-index:3}.pc-home-float-1{width:35%;height:150px;left:2%;bottom:8%;z-index:4}.pc-home-float-2{width:35%;height:115px;right:5%;bottom:5%;z-index:4}.pc-home-float-3{width:25%;height:100px;right:26%;bottom:0;z-index:5}
        .pc-home-trust{display:grid;gap:28px}.pc-home-trust div{display:grid;grid-template-columns:42px 1fr;column-gap:10px;align-items:center}.pc-home-trust svg{grid-row:1/3;color:#111;border:1px solid #eee;border-radius:50%;padding:9px;width:42px;height:42px;background:#fff}.pc-home-trust strong{font-size:.84rem}.pc-home-trust span{font-size:.72rem;color:#888}
        .pc-home-premium .pc-home-categories{background:#fff;padding:20px 0}.pc-home-premium .pc-home-category-grid{display:grid;grid-template-columns:repeat(10,1fr);gap:12px}.pc-home-premium .pc-home-category-card{background:#fff;border:1px solid #ececec;border-radius:8px;min-height:128px;padding:10px 8px;display:flex;flex-direction:column;justify-content:space-between;text-align:center;transition:.2s}.pc-home-premium .pc-home-category-card:hover{border-color:#d4af37;transform:translateY(-3px);box-shadow:0 8px 20px rgba(0,0,0,.07)}.pc-home-premium .pc-home-category-image{height:75px;display:flex;align-items:center;justify-content:center}.pc-home-premium .pc-home-category-image img{width:100%;height:72px;object-fit:contain;mix-blend-mode:multiply}.pc-home-premium .pc-home-category-image svg{color:#222}.pc-home-premium .pc-home-category-info span{display:block;font-size:.76rem;font-weight:700}.pc-home-premium .pc-home-category-info small{display:block;color:#777;font-size:.68rem;margin-top:3px}
        .pc-home-premium .pc-home-products{background:#fff}.pc-home-premium .pc-home-section-header{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:22px}.pc-home-premium .pc-home-section-label{border:0;padding:0;background:none;color:#a67c00}.pc-home-premium .pc-section-title{margin:8px 0 4px;font-size:2rem;color:#171717}.pc-home-premium .pc-section-subtitle{margin:0;color:#777}.pc-home-premium .pc-home-outline-btn{display:flex;align-items:center;gap:8px;color:#222;font-weight:700}.pc-home-premium .pc-home-outline-btn svg{color:#d4af37}.pc-home-premium .pc-home-product-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:14px}.pc-home-premium .pc-home-product-card{background:#fff;border:1px solid #e8e8e8;border-radius:8px;overflow:hidden;transition:.2s}.pc-home-premium .pc-home-product-card:hover{transform:translateY(-4px);border-color:#d4af37;box-shadow:0 10px 25px rgba(0,0,0,.08)}.pc-home-premium .pc-home-product-image{height:190px;background:#fff;display:flex;align-items:center;justify-content:center;border-bottom:1px solid #eee}.pc-home-premium .pc-home-product-image img{width:100%;height:100%;padding:15px;object-fit:contain;mix-blend-mode:multiply}.pc-home-premium .pc-home-product-info{padding:12px}.pc-home-premium .pc-home-product-info span{font-size:.66rem;color:#8a8a8a}.pc-home-premium .pc-home-product-info h3{font-size:.82rem;line-height:1.35;margin:6px 0 0;color:#222}
        .pc-home-premium .pc-home-banner-section{padding-top:5px;padding-bottom:42px}.pc-home-premium .pc-home-banner{min-height:260px;background:#111;border-radius:12px;position:relative;overflow:hidden;display:flex;align-items:center}.pc-home-premium .pc-home-banner-content{position:relative;z-index:2;padding:42px 52px;max-width:700px;color:#fff}.pc-home-premium .pc-home-banner .pc-home-section-label{color:#d4af37}.pc-home-premium .pc-home-banner h2{font-size:2.25rem;line-height:1.05;margin:12px 0;color:#fff}.pc-home-premium .pc-home-banner p{color:#bbb;max-width:500px}.pc-home-premium .pc-home-banner-image{position:absolute;right:3%;width:38%;height:95%;object-fit:contain;mix-blend-mode:screen;opacity:.9}
        .pc-home-premium .pc-home-benefits{background:#fafafa;border-top:1px solid #eee;padding:24px 0}.pc-home-premium .pc-home-benefits-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0}.pc-home-premium .pc-home-benefit{display:flex;align-items:center;gap:14px;padding:10px 24px;border-right:1px solid #ddd}.pc-home-premium .pc-home-benefit:last-child{border-right:0}.pc-home-premium .pc-home-benefit svg{color:#d4af37;flex:none}.pc-home-premium .pc-home-benefit h3{font-size:.82rem;margin:0 0 3px}.pc-home-premium .pc-home-benefit p{font-size:.68rem;color:#888;margin:0}
        @media(max-width:1100px){.pc-home-premium .pc-home-hero-grid{grid-template-columns:1fr 1fr}.pc-home-trust{grid-column:1/-1;grid-template-columns:repeat(3,1fr);padding:0 0 18px}.pc-home-premium .pc-home-category-grid{grid-template-columns:repeat(5,1fr)}.pc-home-premium .pc-home-product-grid{grid-template-columns:repeat(3,1fr)}}
        @media(max-width:700px){.pc-home-premium .pc-home-hero-grid{grid-template-columns:1fr;min-height:0;padding-top:35px}.pc-home-hero-copy{text-align:center}.pc-home-premium .pc-home-hero-copy p{margin-left:auto;margin-right:auto}.pc-home-hero-actions{justify-content:center}.pc-home-hero-visual{height:260px}.pc-home-trust{grid-template-columns:1fr;gap:14px}.pc-home-premium .pc-home-category-grid{grid-template-columns:repeat(2,1fr)}.pc-home-premium .pc-home-product-grid{grid-template-columns:repeat(2,1fr)}.pc-home-premium .pc-home-section-header{align-items:start;flex-direction:column}.pc-home-premium .pc-home-banner-content{padding:30px}.pc-home-premium .pc-home-banner-image{opacity:.25;width:65%}.pc-home-premium .pc-home-benefits-grid{grid-template-columns:1fr 1fr}.pc-home-premium .pc-home-benefit{border-right:0;border-bottom:1px solid #ddd;padding:14px 8px}}
        @media(max-width:480px){.pc-home-premium .pc-home-product-grid{grid-template-columns:1fr}.pc-home-premium .pc-home-category-grid{grid-template-columns:repeat(2,1fr)}.pc-home-premium .pc-home-banner h2{font-size:1.7rem}.pc-home-secondary-btn{display:none}.pc-home-premium .pc-home-benefits-grid{grid-template-columns:1fr}}
      `}</style>
    </main>
  )
}
