import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  Monitor, Cpu, CircuitBoard, HardDrive, MemoryStick, Headphones,
  ShieldCheck, Truck, Headset, ArrowRight, Box, Fan, Zap,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
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
  const { usuario } = useAuth()
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => { cargarVistazo() }, [])

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
    if (categoria && !imagenPorCategoria[categoria]) imagenPorCategoria[categoria] = producto.imagen_principal
  })

  const heroImages = productos.slice(0, 4).filter((producto) => producto.imagen_principal)

  return (
    <main className="pc-home pc-home-reference">
      <section className="pc-home-hero">
        <div className="pc-container pc-home-hero-grid">
          <div className="pc-home-hero-copy">
            <span className="pc-home-eyebrow">TU PC, TU MUNDO</span>
            <h1>Rendimiento<br /><span>sin límites</span></h1>
            <p>Los mejores componentes para armar la PC de tus sueños. Calidad, rendimiento y confianza.</p>
            <Link to="/tienda" className="pc-home-main-btn">Ver productos <ArrowRight size={18} /></Link>
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
            <div><Truck /><section><strong>Envíos rápidos</strong><span>A toda Honduras</span></section></div>
            <div><ShieldCheck /><section><strong>Garantía oficial</strong><span>En todos los productos</span></section></div>
            <div><Headset /><section><strong>Soporte especializado</strong><span>Te ayudamos siempre</span></section></div>
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
                    {categoria.extra && <small>{categoria.extra}</small>}
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
            <div className="pc-home-title-row"><h2>Productos destacados</h2><span /></div>
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

      <section className="pc-home-benefits">
        <div className="pc-container">
          <div className="pc-home-benefits-grid">
            <div className="pc-home-benefit"><ShieldCheck /><div><h3>Productos de calidad</h3><p>Las mejores marcas del mercado</p></div></div>
            <div className="pc-home-benefit"><Truck /><div><h3>Envíos rápidos</h3><p>Recibe tu pedido en 24-48h</p></div></div>
            <div className="pc-home-benefit"><ShieldCheck /><div><h3>Pago seguro</h3><p>Tus datos siempre protegidos</p></div></div>
            <div className="pc-home-benefit"><Headset /><div><h3>Atención personalizada</h3><p>Estamos para ayudarte</p></div></div>
          </div>
        </div>
      </section>

      <style>{`
        .pc-home-reference{background:#fff;color:#17202b;overflow:hidden}
        .pc-home-reference .pc-home-hero{background:linear-gradient(115deg,#fff 0%,#fafafa 72%,#f4edda 100%);border-bottom:1px solid #eee}
        .pc-home-reference .pc-home-hero-grid{display:grid;grid-template-columns:minmax(290px,.85fr) minmax(420px,1.5fr) 230px;align-items:center;gap:14px;min-height:335px}
        .pc-home-reference .pc-home-eyebrow{display:inline-block;border:1px solid #d4af37;border-radius:7px;padding:5px 11px;background:#fff;font-size:.72rem;font-weight:900;letter-spacing:.12em}
        .pc-home-reference .pc-home-hero-copy h1{margin:14px 0 12px;font-size:clamp(2.8rem,4.7vw,4.35rem);line-height:.94;letter-spacing:-.045em;color:#151b23}
        .pc-home-reference .pc-home-hero-copy h1 span{color:#d4af37}
        .pc-home-reference .pc-home-hero-copy p{max-width:400px;margin:0 0 18px;color:#697586;line-height:1.55;font-size:.9rem}
        .pc-home-reference .pc-home-main-btn{display:inline-flex;align-items:center;gap:14px;padding:12px 25px;border-radius:24px;background:#d4af37;color:#111;font-weight:800;box-shadow:0 8px 18px rgba(212,175,55,.24)}
        .pc-home-dots{display:flex;gap:7px;margin-top:20px}.pc-home-dots i{width:8px;height:8px;border-radius:50%;background:#e1e5e9}.pc-home-dots i:first-child{background:#d4af37}
        .pc-home-hero-visual{height:335px;position:relative;display:flex;align-items:center;justify-content:center}.pc-home-hero-glow{position:absolute;width:290px;height:240px;border-radius:50%;background:radial-gradient(circle,#f7e7a9 0,rgba(247,231,169,.18) 48%,transparent 72%)}
        .pc-home-hero-visual img{position:absolute;object-fit:contain;mix-blend-mode:multiply}.pc-home-hero-main-image{width:62%;height:280px;z-index:3}.pc-home-float-1{width:35%;height:145px;left:3%;bottom:7%;z-index:4}.pc-home-float-2{width:32%;height:110px;right:2%;bottom:6%;z-index:4}.pc-home-float-3{width:24%;height:92px;right:24%;bottom:0;z-index:5}
        .pc-home-trust{display:grid;gap:25px}.pc-home-trust>div{display:flex;align-items:center;gap:12px}.pc-home-trust svg{width:43px;height:43px;flex:none;padding:10px;border:1px solid #eee;border-radius:50%;color:#111;background:#fff}.pc-home-trust section{display:flex;flex-direction:column;gap:3px}.pc-home-trust strong{font-size:.78rem}.pc-home-trust span{font-size:.68rem;color:#788391}
        .pc-home-reference .pc-home-categories{background:#fff;padding:18px 0 20px}.pc-home-reference .pc-home-category-grid{display:grid;grid-template-columns:repeat(10,1fr);gap:10px}.pc-home-reference .pc-home-category-card{min-height:122px;padding:9px 6px;border:1px solid #e4e8ec;border-radius:7px;background:#fff;display:flex;flex-direction:column;justify-content:space-between;text-align:center;transition:.2s}.pc-home-reference .pc-home-category-card:hover{border-color:#d4af37;transform:translateY(-2px);box-shadow:0 6px 16px rgba(0,0,0,.06)}.pc-home-reference .pc-home-category-image{height:70px;display:flex;align-items:center;justify-content:center}.pc-home-reference .pc-home-category-image img{width:100%;height:68px;object-fit:contain;mix-blend-mode:multiply}.pc-home-reference .pc-home-category-image svg{color:#20252b}.pc-home-reference .pc-home-category-info span{display:block;font-size:.72rem;font-weight:700;line-height:1.2}.pc-home-reference .pc-home-category-info small{display:block;color:#6d7885;font-size:.67rem;margin-top:2px}
        .pc-home-reference .pc-home-products{background:#fff;padding-top:5px;padding-bottom:28px}.pc-home-reference .pc-home-section-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}.pc-home-title-row{display:flex;align-items:center;gap:18px}.pc-home-title-row h2{margin:0;font-size:1.55rem;letter-spacing:-.025em;color:#17202b}.pc-home-title-row span{display:block;width:52px;height:2px;background:#d4af37}.pc-home-reference .pc-home-outline-btn{display:flex;align-items:center;gap:6px;color:#26313d;font-size:.78rem}.pc-home-reference .pc-home-outline-btn svg{color:#d4af37}.pc-home-reference .pc-home-product-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:12px}.pc-home-reference .pc-home-product-card{background:#fff;border:1px solid #e1e6eb;border-radius:7px;overflow:hidden;transition:.2s}.pc-home-reference .pc-home-product-card:hover{transform:translateY(-3px);border-color:#d4af37;box-shadow:0 8px 20px rgba(0,0,0,.07)}.pc-home-reference .pc-home-product-image{height:180px;display:flex;align-items:center;justify-content:center;background:#fff}.pc-home-reference .pc-home-product-image img{width:100%;height:100%;padding:12px;object-fit:contain;mix-blend-mode:multiply}.pc-home-reference .pc-home-product-info{padding:8px 11px 14px}.pc-home-reference .pc-home-product-info span{display:inline-block;background:#f3f5f7;border-radius:10px;padding:3px 7px;color:#728092;font-size:.6rem}.pc-home-reference .pc-home-product-info h3{margin:7px 0 0;color:#1d2732;font-size:.73rem;line-height:1.3;font-weight:600}
        .pc-home-reference .pc-home-benefits{background:#fafafa;border:1px solid #e9e9e9;border-radius:11px;margin:0 auto 22px;max-width:calc(100% - 80px);padding:16px 0}.pc-home-reference .pc-home-benefits-grid{display:grid;grid-template-columns:repeat(4,1fr)}.pc-home-reference .pc-home-benefit{display:flex;align-items:center;justify-content:center;gap:12px;padding:5px 20px;border-right:1px solid #e2e2e2}.pc-home-reference .pc-home-benefit:last-child{border-right:0}.pc-home-reference .pc-home-benefit svg{width:39px;height:39px;padding:8px;border:2px solid #d4af37;border-radius:50%;color:#d4af37;flex:none}.pc-home-reference .pc-home-benefit h3{margin:0 0 3px;font-size:.72rem}.pc-home-reference .pc-home-benefit p{margin:0;color:#87919d;font-size:.61rem}
        @media(max-width:1100px){.pc-home-reference .pc-home-hero-grid{grid-template-columns:1fr 1.3fr}.pc-home-trust{grid-column:1/-1;grid-template-columns:repeat(3,1fr);padding:0 0 18px}.pc-home-reference .pc-home-category-grid{grid-template-columns:repeat(5,1fr)}.pc-home-reference .pc-home-product-grid{grid-template-columns:repeat(3,1fr)}}
        @media(max-width:700px){.pc-home-reference .pc-home-hero-grid{grid-template-columns:1fr;padding-top:30px}.pc-home-reference .pc-home-hero-copy{text-align:center}.pc-home-reference .pc-home-hero-copy p{margin-left:auto;margin-right:auto}.pc-home-hero-visual{height:250px}.pc-home-trust{grid-template-columns:1fr;gap:12px}.pc-home-reference .pc-home-category-grid{grid-template-columns:repeat(2,1fr)}.pc-home-reference .pc-home-product-grid{grid-template-columns:repeat(2,1fr)}.pc-home-reference .pc-home-benefits{max-width:calc(100% - 24px)}.pc-home-reference .pc-home-benefits-grid{grid-template-columns:1fr 1fr}.pc-home-reference .pc-home-benefit{border-right:0;border-bottom:1px solid #e2e2e2;padding:12px 8px}.pc-home-reference .pc-home-benefit:nth-last-child(-n+2){border-bottom:0}}
        @media(max-width:480px){.pc-home-reference .pc-home-product-grid{grid-template-columns:1fr}.pc-home-reference .pc-home-section-header{align-items:flex-start}.pc-home-reference .pc-home-title-row h2{font-size:1.3rem}.pc-home-reference .pc-home-title-row span{display:none}.pc-home-reference .pc-home-benefits-grid{grid-template-columns:1fr}.pc-home-reference .pc-home-benefit{border-bottom:1px solid #e2e2e2!important}.pc-home-reference .pc-home-benefit:last-child{border-bottom:0!important}}
      `}</style>
    </main>
  )
}
