import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowUpRight, ArrowRight, Cpu, CircuitBoard, MemoryStick, HardDrive, ShieldCheck, Truck, Headset, Zap, ShoppingBag } from 'lucide-react'
import { supabase } from '../supabaseClient'

const categorias = [
  ['Procesadores', Cpu], ['Tarjetas gráficas', CircuitBoard], ['Memoria RAM', MemoryStick],
  ['Almacenamiento', HardDrive], ['Fuentes de Alimentación', Zap],
]

export default function Home() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase
        .from('productos')
        .select('id,nombre,imagen_principal,categorias(nombre)')
        .eq('activo', true)
        .order('id', { ascending: false })
        .limit(8)
      setProductos(data || [])
      setCargando(false)
    }
    cargar()
  }, [])

  const imagenes = productos.filter((p) => p.imagen_principal)

  return (
    <main className="total-cinema-home">
      <section className="tc-intro">
        <div className="tc-intro-overlay" />
        <div className="tc-intro-top"><span>PC STORE / 2026</span><span>HARDWARE WITHOUT LIMITS</span></div>
        <div className="tc-intro-content">
          <div className="tc-intro-label">BUILD YOUR NEXT MACHINE</div>
          <h1>POWER<br /><span>REDEFINED</span></h1>
          <p>Componentes seleccionados para equipos que no pasan desapercibidos.</p>
          <div className="tc-intro-actions">
            <Link to="/tienda" className="tc-gold-button">Explorar componentes <ArrowUpRight size={20} /></Link>
            <Link to="/registro" className="tc-text-link">Crear cuenta <ArrowRight size={16} /></Link>
          </div>
        </div>
        <div className="tc-hero-art">
          {imagenes[0] && <img className="tc-art-main" src={imagenes[0].imagen_principal} alt={imagenes[0].nombre} />}
          {imagenes[1] && <img className="tc-art-small tc-art-one" src={imagenes[1].imagen_principal} alt="" />}
          {imagenes[2] && <img className="tc-art-small tc-art-two" src={imagenes[2].imagen_principal} alt="" />}
          <div className="tc-art-ring" />
        </div>
        <div className="tc-intro-bottom"><span>01 / 04</span><span>SCROLL TO DISCOVER ↓</span></div>
      </section>

      <section className="tc-statement">
        <div className="tc-statement-number">01</div>
        <div><span>NO ORDINARY COMPONENTS</span><h2>Tu próxima PC<br /><i>empieza aquí.</i></h2></div>
        <p>Encuentra rendimiento, diseño y fiabilidad en un catálogo creado para gamers, creadores y profesionales.</p>
      </section>

      <section className="tc-categories">
        <div className="tc-section-head"><span>02 / CATEGORÍAS</span><Link to="/tienda">Ver catálogo <ArrowUpRight size={17} /></Link></div>
        <div className="tc-category-list">
          {categorias.map(([nombre, Icono], index) => (
            <Link to="/tienda" className="tc-category-row" key={nombre}>
              <span className="tc-index">0{index + 1}</span><Icono /><h3>{nombre}</h3><ArrowUpRight className="tc-row-arrow" />
            </Link>
          ))}
        </div>
      </section>

      <section className="tc-products">
        <div className="tc-section-head"><span>03 / SELECCIÓN DESTACADA</span><Link to="/tienda">Ver todo <ArrowUpRight size={17} /></Link></div>
        {cargando ? <p className="tc-loading">Cargando selección...</p> : <div className="tc-product-layout">
          {productos.slice(0, 6).map((producto, index) => (
            <Link to={`/producto/${producto.id}`} className={`tc-product-card tc-product-${index + 1}`} key={producto.id}>
              <div className="tc-product-number">0{index + 1}</div>
              <div className="tc-product-image">{producto.imagen_principal && <img src={producto.imagen_principal} alt={producto.nombre} />}</div>
              <div className="tc-product-info"><small>{producto.categorias?.nombre || 'COMPONENTE'}</small><h3>{producto.nombre}</h3><span>Descubrir <ArrowRight size={14} /></span></div>
            </Link>
          ))}
        </div>}
      </section>

      <section className="tc-services">
        <div><Truck /><h3>Envíos rápidos</h3><p>A toda Honduras</p></div>
        <div><ShieldCheck /><h3>Compra segura</h3><p>Protección en cada pedido</p></div>
        <div><Headset /><h3>Soporte real</h3><p>Asesoría especializada</p></div>
        <div><ShoppingBag /><h3>Para comprar registrar</h3><p>Disfruta de nuestros productos</p></div>
      </section>

      <style>{`
        .total-cinema-home{background:#080808;color:#f4f0e7;overflow:hidden;font-family:inherit}.total-cinema-home *{box-sizing:border-box}.total-cinema-home a{text-decoration:none;color:inherit}.tc-intro{min-height:760px;position:relative;padding:28px clamp(22px,5vw,90px);display:flex;flex-direction:column;justify-content:space-between;background:radial-gradient(circle at 78% 45%,#4c3b16 0, #17130b 22%,#080808 55%)}.tc-intro-overlay{position:absolute;inset:0;opacity:.15;background-image:linear-gradient(90deg,#fff 1px,transparent 1px),linear-gradient(#fff 1px,transparent 1px);background-size:100px 100px;mask-image:linear-gradient(to bottom,black,transparent)}.tc-intro-top,.tc-intro-bottom{position:relative;z-index:4;display:flex;justify-content:space-between;gap:20px;font-size:10px;letter-spacing:.2em;color:#9c927d}.tc-intro-content{position:relative;z-index:4;width:min(650px);margin:70px 0 80px}.tc-intro-label{color:#d4af37;font-size:11px;letter-spacing:.24em;margin-bottom:20px}.tc-intro h1{font-size:clamp(5rem,12vw,11rem);line-height:.78;letter-spacing:-.08em;margin:0;font-weight:950}.tc-intro h1 span{color:#d4af37}.tc-intro-content p{max-width:330px;color:#b4ad9e;line-height:1.7;margin:30px 0}.tc-intro-actions{display:flex;align-items:center;gap:28px;flex-wrap:wrap}.tc-gold-button{display:inline-flex;align-items:center;gap:25px;background:#d4af37;color:#090909!important;padding:17px 20px;font-weight:900;font-size:12px}.tc-text-link{font-size:12px;color:#d4af37!important;border-bottom:1px solid #d4af37;padding-bottom:5px}.tc-hero-art{position:absolute;inset:80px 4% 70px 42%;display:flex;align-items:center;justify-content:center}.tc-art-main{width:min(560px,80%);height:520px;object-fit:contain;z-index:3;filter:drop-shadow(0 35px 45px #000)}.tc-art-small{position:absolute;object-fit:contain;z-index:4;filter:drop-shadow(0 20px 20px #000)}.tc-art-one{width:28%;left:0;bottom:8%}.tc-art-two{width:25%;right:0;top:12%}.tc-art-ring{position:absolute;width:500px;height:500px;border:1px solid #8e7229;border-radius:50%;box-shadow:0 0 100px #d4af3720}.tc-statement{display:grid;grid-template-columns:100px 1fr 1fr;gap:30px;align-items:end;padding:110px clamp(22px,8vw,150px);background:#e9e4d8;color:#111}.tc-statement-number{font-size:12px;color:#a18429}.tc-statement span,.tc-section-head span{font-size:10px;letter-spacing:.2em;color:#a18429;font-weight:900}.tc-statement h2{font-size:clamp(2.5rem,5vw,5.4rem);line-height:.9;letter-spacing:-.06em;margin:18px 0 0}.tc-statement h2 i{color:#a18429}.tc-statement p{max-width:330px;line-height:1.8;color:#666;font-size:13px}.tc-categories,.tc-products{padding:75px clamp(22px,8vw,150px)}.tc-categories{background:#111}.tc-products{background:#080808}.tc-section-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:28px}.tc-section-head a{display:flex;align-items:center;gap:8px;color:#d4af37;font-size:12px}.tc-category-list{border-top:1px solid #39352e}.tc-category-row{display:grid;grid-template-columns:55px 35px 1fr 25px;align-items:center;gap:20px;padding:25px 0;border-bottom:1px solid #39352e;transition:.2s}.tc-category-row:hover{padding-left:20px;background:#181818}.tc-category-row svg{color:#d4af37}.tc-index{font-size:11px;color:#706958}.tc-category-row h3{font-size:clamp(1.4rem,3vw,3rem);font-weight:500;letter-spacing:-.04em;margin:0}.tc-row-arrow{justify-self:end}.tc-product-layout{display:grid;grid-template-columns:repeat(12,1fr);gap:14px}.tc-product-card{position:relative;min-height:360px;background:#141414;border:1px solid #2d2a24;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;transition:.25s}.tc-product-card:hover{border-color:#d4af37;transform:translateY(-5px)}.tc-product-1,.tc-product-4{grid-column:span 7}.tc-product-2,.tc-product-3,.tc-product-5,.tc-product-6{grid-column:span 5}.tc-product-number{position:absolute;top:15px;left:15px;color:#d4af37;font-size:11px;z-index:2}.tc-product-image{height:230px;display:flex;align-items:center;justify-content:center;padding:25px}.tc-product-image img{width:100%;height:100%;object-fit:contain}.tc-product-info{padding:20px}.tc-product-info small{color:#8e887a;font-size:9px;letter-spacing:.16em}.tc-product-info h3{font-size:18px;line-height:1.1;margin:8px 0 16px;font-weight:700}.tc-product-info span{display:flex;align-items:center;gap:7px;color:#d4af37;font-size:11px}.tc-loading{color:#aaa}.tc-services{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid #3b3425;background:#0d0d0d}.tc-services>div{padding:35px 25px;border-right:1px solid #3b3425}.tc-services>div:last-child{border-right:0}.tc-services svg{color:#d4af37;margin-bottom:22px}.tc-services h3{font-size:13px;margin:0 0 7px}.tc-services p{font-size:11px;color:#858078;margin:0}@media(max-width:900px){.tc-intro{min-height:850px}.tc-hero-art{inset:390px 0 80px 35%;opacity:.8}.tc-art-main{height:330px}.tc-statement{grid-template-columns:40px 1fr;padding:70px 25px}.tc-statement p{grid-column:2}.tc-product-1,.tc-product-2,.tc-product-3,.tc-product-4,.tc-product-5,.tc-product-6{grid-column:span 6}.tc-services{grid-template-columns:repeat(2,1fr)}.tc-services>div:nth-child(2){border-right:0}.tc-services>div{border-bottom:1px solid #3b3425}}@media(max-width:550px){.tc-intro-top span:last-child,.tc-intro-bottom span:last-child{display:none}.tc-intro-content{margin-top:80px}.tc-intro h1{font-size:clamp(4rem,18vw,7rem)}.tc-hero-art{inset:430px -20px 80px 20%}.tc-statement h2{font-size:2.5rem}.tc-category-row{grid-template-columns:28px 25px 1fr 18px;gap:10px}.tc-category-row h3{font-size:1.15rem}.tc-product-1,.tc-product-2,.tc-product-3,.tc-product-4,.tc-product-5,.tc-product-6{grid-column:span 12}.tc-services{grid-template-columns:1fr}.tc-services>div{border-right:0}}`
      }</style>
    </main>
  )
}
