import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Package,
  UserRound,
  Heart,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Sparkles,
} from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function HomeUsuario({ usuario }) {
  const [pedidos, setPedidos] = useState([])

  const nombre =
    usuario?.user_metadata?.nombre ||
    usuario?.user_metadata?.name ||
    usuario?.email?.split('@')[0] ||
    'cliente'

  useEffect(() => {
    if (!usuario?.id) return

    const cargarPedidos = async () => {
      const { data } = await supabase
        .from('ordenes')
        .select('id,numero_orden,total,estado,created_at')
        .eq('usuario_id', usuario.id)
        .order('created_at', { ascending: false })
        .limit(3)

      setPedidos(data || [])
    }

    cargarPedidos()
  }, [usuario?.id])

  return (
    <main className="inicio-usuario">
      <header>
        <span>ESPACIO PERSONAL</span>

        <h1>Hola, {nombre} 👋</h1>

        <p>
          Gestiona tus pedidos, descubre componentes y disfruta
          una experiencia personalizada.
        </p>

        <Link to="/tienda">
          Explorar tienda
          <ArrowRight size={17} />
        </Link>
      </header>

      <nav>
        {[
          [UserRound, 'Mi perfil', '/perfil'],
          [Package, 'Mis pedidos', '/mis-ordenes'],
          [Heart, 'Favoritos', '/favoritos'],
          [ShoppingBag, 'Comprar', '/tienda'],
        ].map(([Icono, texto, ruta]) => (
          <Link to={ruta} key={texto}>
            <Icono />
            {texto}
          </Link>
        ))}
      </nav>

      <section className="contenido">
        <div className="panel">
          <span>ACTIVIDAD RECIENTE</span>

          <h2>Tus últimos pedidos</h2>

          {pedidos.length > 0 ? (
            pedidos.map((pedido) => (
              <article key={pedido.id}>
                <div>
                  <b>
                    {pedido.numero_orden ||
                      `Pedido #${pedido.id}`}
                  </b>

                  <small>
                    {new Date(
                      pedido.created_at
                    ).toLocaleDateString('es-HN')}
                  </small>
                </div>

                <div>
                  <b>
                    L{' '}
                    {Number(pedido.total).toLocaleString('es-HN')}
                  </b>

                  <small>{pedido.estado}</small>
                </div>
              </article>
            ))
          ) : (
            <p>
              Aún no tienes pedidos.{' '}
              <Link to="/tienda">
                Comienza a comprar.
              </Link>
            </p>
          )}
        </div>

        <aside className="panel oscuro">
          <span>BENEFICIOS DE TU CUENTA</span>

          <h2>Compra con más comodidad.</h2>

          <p>
            Consulta tus pedidos, guarda tus preferencias y
            recibe recomendaciones.
          </p>

          <p>
            <ShieldCheck />
            Compras seguras
          </p>

          <p>
            <Truck />
            Seguimiento de pedidos
          </p>

          <p>
            <Sparkles />
            Recomendaciones personalizadas
          </p>
        </aside>
      </section>

      <style>{`
        .inicio-usuario {
          min-height: 100vh;
          background: #f4f1ea;
          color: #151515;
          padding: 45px clamp(22px, 7vw, 110px);
        }

        .inicio-usuario a {
          text-decoration: none;
          color: inherit;
        }

        .inicio-usuario header {
          padding: 30px 0 50px;
          border-bottom: 1px solid #d8d0c4;
        }

        .inicio-usuario header span,
        .panel > span {
          font-size: 10px;
          letter-spacing: 0.2em;
          color: #a17b22;
          font-weight: 900;
        }

        .inicio-usuario h1 {
          font-size: clamp(2.5rem, 6vw, 5.8rem);
          letter-spacing: -0.06em;
          margin: 15px 0;
        }

        .inicio-usuario header p {
          color: #777;
          max-width: 480px;
          line-height: 1.7;
        }

        .inicio-usuario header > a {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #171717;
          color: #fff;
          padding: 16px 20px;
          width: max-content;
          font-size: 12px;
          font-weight: 800;
        }

        .inicio-usuario nav {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          padding: 25px 0;
        }

        .inicio-usuario nav a {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fff;
          border: 1px solid #e0d9cd;
          padding: 22px;
          font-size: 13px;
          font-weight: 800;
        }

        .inicio-usuario nav svg,
        .panel svg {
          color: #a17b22;
        }

        .contenido {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 18px;
        }

        .panel {
          background: #fff;
          border: 1px solid #e0d9cd;
          padding: 28px;
        }

        .panel h2 {
          font-size: clamp(1.5rem, 3vw, 2.5rem);
          letter-spacing: -0.05em;
          margin: 12px 0 25px;
        }

        .panel article {
          display: flex;
          justify-content: space-between;
          border-top: 1px solid #ece7de;
          padding: 18px 0;
        }

        .panel article small {
          display: block;
          color: #888;
          margin-top: 5px;
          font-size: 11px;
        }

        .oscuro {
          background: #171717;
          color: #fff;
        }

        .oscuro p {
          color: #aaa;
          line-height: 1.7;
          font-size: 13px;
        }

        .oscuro p svg {
          margin-right: 8px;
        }

        .panel > p a {
          color: #a17b22;
        }

        @media (max-width: 850px) {
          .inicio-usuario nav {
            grid-template-columns: repeat(2, 1fr);
          }

          .contenido {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .inicio-usuario nav {
            grid-template-columns: 1fr;
          }

          .panel {
            padding: 20px;
          }
        }
      `}</style>
    </main>
  )
}