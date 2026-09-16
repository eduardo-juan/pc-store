import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Package,
  UserRound,
  Heart,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Sparkles,
  Clock3,
  ChevronRight,
} from "lucide-react";
import { supabase } from "../supabaseClient";

export default function HomeUsuario({ usuario }) {
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const nombre =
    usuario?.user_metadata?.nombre ||
    usuario?.user_metadata?.name ||
    usuario?.email?.split("@")[0] ||
    "cliente";

  useEffect(() => {
    if (!usuario?.id) return;
    const cargar = async () => {
      const [{ data: pedidosData }, { data: productosData }] =
        await Promise.all([
          supabase
            .from("ordenes")
            .select("id,numero_orden,total,estado,created_at")
            .eq("usuario_id", usuario.id)
            .order("created_at", { ascending: false })
            .limit(3),
          supabase
            .from("productos")
            .select("id,nombre,precio,imagen_principal")
            .eq("activo", true)
            .order("created_at", { ascending: false })
            .limit(4),
        ]);
      setPedidos(pedidosData || []);
      setProductos(productosData || []);
      setCargando(false);
    };
    cargar();
  }, [usuario?.id]);

  return (
    <main className="inicio-usuario-premium">
      <section className="hero-usuario">
        <div>
          <span className="eyebrow">PC STORE / ESPACIO PERSONAL</span>
          <h1>
            Hola, <em>{nombre}</em>.
          </h1>
          <p>
            Tu próximo setup comienza aquí. Revisa tus compras, descubre
            hardware y continúa donde lo dejaste.
          </p>
          <div className="hero-actions">
            <Link className="btn-primary" to="/tienda">
              Explorar componentes <ArrowRight size={17} />
            </Link>
            <Link className="btn-ghost" to="/mis-ordenes">
              Ver mis pedidos
            </Link>
          </div>
        </div>
        <div className="hero-badge">
          <Sparkles size={22} />
          <b>EXPERIENCIA PERSONALIZADA</b>
          <small>Todo tu hardware en un solo lugar.</small>
        </div>
      </section>

      <section className="quick-grid">
        {[
          [UserRound, "Mi perfil", "/perfil", "Gestiona tus datos"],
          [Package, "Mis pedidos", "/mis-ordenes", "Consulta tus compras"],
          [Heart, "Favoritos", "/favoritos", "Guarda tus componentes"],
          [ShoppingBag, "Carrito", "/carrito", "Continúa tu compra"],
        ].map(([Icono, titulo, ruta, detalle]) => (
          <Link to={ruta} className="quick-card" key={titulo}>
            <Icono size={22} />
            <div>
              <b>{titulo}</b>
              <small>{detalle}</small>
            </div>
            <ChevronRight size={17} />
          </Link>
        ))}
      </section>

      <section className="dashboard-grid">
        <div className="surface orders-panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">HISTORIAL</span>
              <h2>Actividad reciente</h2>
            </div>
            <Link to="/mis-ordenes">
              Ver todo <ArrowRight size={15} />
            </Link>
          </div>
          {cargando ? (
            <p className="muted">Cargando actividad...</p>
          ) : pedidos.length ? (
            pedidos.map((pedido) => (
              <article className="order-row" key={pedido.id}>
                <div className="order-icon">
                  <Package size={18} />
                </div>
                <div className="order-info">
                  <b>{pedido.numero_orden || `Pedido #${pedido.id}`}</b>
                  <small>
                    <Clock3 size={12} />{" "}
                    {new Date(pedido.created_at).toLocaleDateString("es-HN")}
                  </small>
                </div>
                <div className="order-total">
                  <b>L {Number(pedido.total).toLocaleString("es-HN")}</b>
                  <span>{pedido.estado}</span>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state">
              <Package size={30} />
              <p>Aún no tienes pedidos.</p>
              <Link to="/tienda">
                Realizar mi primera compra <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
        <aside className="surface account-panel">
          <span className="eyebrow">TU CUENTA</span>
          <h2>Más control. Más comodidad.</h2>
          <p>
            Disfruta herramientas diseñadas para que comprar componentes sea más
            sencillo.
          </p>
          <div className="benefit">
            <ShieldCheck size={19} />
            <span>
              <b>Compras seguras</b>
              <small>Protección en cada pedido.</small>
            </span>
          </div>
          <div className="benefit">
            <Truck size={19} />
            <span>
              <b>Seguimiento</b>
              <small>Consulta el estado de tus órdenes.</small>
            </span>
          </div>
          <div className="benefit">
            <Sparkles size={19} />
            <span>
              <b>Recomendaciones</b>
              <small>Descubre hardware para tu setup.</small>
            </span>
          </div>
        </aside>
      </section>

      <section className="recommendations">
        <div className="section-heading">
          <div>
            <span className="eyebrow">SELECCIÓN PC STORE</span>
            <h2>Puede interesarte</h2>
          </div>
          <Link to="/tienda">
            Ver catálogo <ArrowRight size={15} />
          </Link>
        </div>
        <div className="products-grid">
          {productos.map((producto) => (
            <Link
              className="product-card"
              to={`/producto/${producto.id}`}
              key={producto.id}
            >
              {producto.imagen_principal ? (
                <img src={producto.imagen_principal} alt={producto.nombre} />
              ) : (
                <div className="product-placeholder">
                  <ShoppingBag size={28} />
                </div>
              )}
              <div>
                <small>COMPONENTE</small>
                <b>{producto.nombre}</b>
                <strong>
                  L {Number(producto.precio || 0).toLocaleString("es-HN")}
                </strong>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <style>{`*{box-sizing:border-box}.inicio-usuario-premium{min-height:100vh;background:#0b0d10;color:#f5f5f5;padding:38px clamp(20px,6vw,100px) 70px;font-family:inherit}.inicio-usuario-premium a{text-decoration:none;color:inherit}.eyebrow{font-size:10px;letter-spacing:.2em;font-weight:900;color:#d7a84c}.hero-usuario{display:flex;justify-content:space-between;gap:40px;align-items:end;padding:35px 0 55px;border-bottom:1px solid #282c33}.hero-usuario h1{font-size:clamp(3rem,7vw,7rem);letter-spacing:-.07em;line-height:.95;margin:18px 0}.hero-usuario h1 em{color:#d7a84c;font-style:normal}.hero-usuario p{max-width:530px;color:#9299a5;line-height:1.8}.hero-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px}.btn-primary,.btn-ghost{display:flex;align-items:center;gap:12px;padding:15px 19px;font-size:12px;font-weight:900}.btn-primary{background:#d7a84c;color:#111!important}.btn-ghost{border:1px solid #393e47}.hero-badge{max-width:230px;border:1px solid #343943;background:linear-gradient(145deg,#1c2028,#101217);padding:25px;display:grid;gap:13px}.hero-badge svg{color:#d7a84c}.hero-badge b{font-size:11px;line-height:1.5}.hero-badge small{color:#9299a5;line-height:1.6}.quick-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:24px 0}.quick-card{display:flex;align-items:center;gap:13px;padding:20px;background:#15181e;border:1px solid #292e37}.quick-card>svg:first-child{color:#d7a84c}.quick-card>svg:last-child{margin-left:auto;color:#737b88}.quick-card b,.quick-card small{display:block}.quick-card b{font-size:13px}.quick-card small{color:#858d9a;font-size:11px;margin-top:5px}.dashboard-grid{display:grid;grid-template-columns:1.45fr 1fr;gap:18px}.surface{background:#13161b;border:1px solid #292e37;padding:28px}.section-heading{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:22px}.section-heading h2{font-size:clamp(1.5rem,3vw,2.5rem);letter-spacing:-.05em;margin:10px 0 0}.section-heading>a{display:flex;align-items:center;gap:8px;color:#d7a84c;font-size:11px;font-weight:800}.order-row{display:flex;align-items:center;gap:13px;padding:17px 0;border-top:1px solid #292e37}.order-icon{width:38px;height:38px;display:grid;place-items:center;background:#252029;color:#d7a84c}.order-info{flex:1}.order-info b,.order-info small{display:flex;align-items:center;gap:5px}.order-info b{font-size:12px}.order-info small{font-size:10px;color:#858d9a;margin-top:6px}.order-total{text-align:right}.order-total b,.order-total span{display:block}.order-total b{font-size:12px}.order-total span{font-size:10px;color:#d7a84c;margin-top:6px;text-transform:capitalize}.account-panel{background:linear-gradient(145deg,#242019,#17171a)}.account-panel h2{font-size:clamp(1.7rem,3vw,2.7rem);letter-spacing:-.06em;margin:14px 0}.account-panel>p{color:#aaa;line-height:1.7;font-size:12px;margin-bottom:25px}.benefit{display:flex;gap:12px;padding:15px 0;border-top:1px solid #443b2c}.benefit>svg{color:#d7a84c;margin-top:2px}.benefit b,.benefit small{display:block}.benefit b{font-size:12px}.benefit small{font-size:11px;color:#aaa;margin-top:4px}.recommendations{padding-top:45px}.products-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.product-card{background:#15181e;border:1px solid #292e37;overflow:hidden}.product-card img,.product-placeholder{width:100%;height:155px;object-fit:cover;background:#20242c}.product-placeholder{display:grid;place-items:center;color:#d7a84c}.product-card>div:last-child{padding:17px}.product-card small,.product-card b,.product-card strong{display:block}.product-card small{font-size:9px;letter-spacing:.16em;color:#d7a84c}.product-card b{font-size:12px;line-height:1.5;margin:8px 0 13px}.product-card strong{font-size:14px}.muted{color:#8b929e}.empty-state{text-align:center;padding:25px;color:#8b929e}.empty-state svg{color:#d7a84c}.empty-state a{display:flex;justify-content:center;align-items:center;gap:8px;color:#d7a84c;font-size:12px}@media(max-width:1000px){.quick-grid,.products-grid{grid-template-columns:repeat(2,1fr)}.dashboard-grid{grid-template-columns:1fr}.hero-usuario{align-items:start;flex-direction:column}}@media(max-width:520px){.quick-grid,.products-grid{grid-template-columns:1fr}.surface{padding:20px}.hero-usuario h1{font-size:3.5rem}.hero-badge{max-width:none;width:100%}}`}</style>
    </main>
  );
}
