import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Trash2,
  Heart,
  ShoppingBag,
  ArrowRight,
  Package,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";
import {
  obtenerFavoritos,
  eliminarFavorito,
} from "../services/favoritosService";

export default function Favoritos() {
  const { usuario } = useAuth();

  const [favoritos, setFavoritos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [eliminando, setEliminando] = useState(null);

  useEffect(() => {
    const cargarFavoritos = async () => {
      if (!usuario?.id) {
        setFavoritos([]);
        setCargando(false);
        return;
      }

      setCargando(true);
      setError(null);

      const { data, error } = await obtenerFavoritos(usuario.id);

      if (error) {
        console.error("Error cargando favoritos:", error);
        setError("No se pudieron cargar tus favoritos.");
      } else {
        setFavoritos(data || []);
      }

      setCargando(false);
    };

    cargarFavoritos();
  }, [usuario]);

  const quitarFavorito = async (productoId) => {
    if (!usuario?.id || eliminando === productoId) return;

    setEliminando(productoId);

    const { error } = await eliminarFavorito(
      usuario.id,
      productoId
    );

    if (error) {
      console.error("Error eliminando favorito:", error);
      alert("No se pudo eliminar el favorito.");
      setEliminando(null);
      return;
    }

    setFavoritos((actuales) =>
      actuales.filter(
        (favorito) => favorito.producto_id !== productoId
      )
    );

    setEliminando(null);
  };

  if (cargando) {
    return (
      <main className="pc-page">
        <div className="pc-container text-center py-5">
          <p className="text-muted">
            Cargando tus favoritos...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="pc-page">
        <div className="pc-container text-center py-5">
          <p className="text-danger">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="pc-page pc-favorites-page">
      <style>
        {`
          .pc-favorites-page {
            background: #f3f3f3 !important;
            color: #171717 !important;
          }

          .pc-favorites-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
            margin-bottom: 32px;
          }

          .pc-favorites-kicker {
            display: block;
            margin-bottom: 8px;
            color: #a67c00;
            font-size: 0.78rem;
            font-weight: 800;
            letter-spacing: 0.08em;
          }

          .pc-favorites-header h1 {
            margin: 0 0 8px;
            color: #171717;
            font-size: clamp(1.8rem, 4vw, 2.6rem);
          }

          .pc-favorites-header p {
            margin: 0;
            color: #6b6b6b;
          }

          .pc-favorites-count {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 16px;
            border: 1px solid rgba(212, 175, 55, 0.4);
            border-radius: 999px;
            background: #fbf4d6;
            color: #a67c00;
            font-weight: 800;
            white-space: nowrap;
          }

          .pc-favorites-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 22px;
            align-items: stretch;
          }

          .pc-favorite-card {
            display: flex;
            flex-direction: column;
            min-width: 0;
            overflow: hidden;
            box-sizing: border-box;
            border: 1px solid #e0e0e0;
            border-radius: 18px;
            background: #ffffff;
            box-shadow: 0 12px 35px rgba(0, 0, 0, 0.07);
            transition:
              transform 0.2s ease,
              box-shadow 0.2s ease;
          }

          .pc-favorite-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 18px 40px rgba(0, 0, 0, 0.12);
          }

          .pc-favorite-image {
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            width: 100%;
            height: 220px;
            padding: 16px;
            overflow: hidden;
            background: linear-gradient(
              135deg,
              #eeeeee,
              #ffffff
            );
            border-bottom: 1px solid #e5e5e5;
          }

          .pc-favorite-image img {
            display: block;
            width: 100%;
            height: 100%;
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }

          .pc-favorite-placeholder {
            color: #b5b5b5;
          }

          .pc-favorite-body {
            position: relative;
            z-index: 1;
            display: flex;
            flex: 1;
            flex-direction: column;
            min-width: 0;
            box-sizing: border-box;
            padding: 22px;
            background: #ffffff;
          }

          .pc-favorite-brand {
            margin-bottom: 8px;
            color: #a67c00;
            font-size: 0.78rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.04em;
          }

          .pc-favorite-name {
            display: -webkit-box;
            min-height: 48px;
            margin: 0 0 8px;
            overflow: hidden;
            color: #171717;
            font-size: 1.05rem;
            font-weight: 800;
            line-height: 1.4;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }

          .pc-favorite-model {
            min-height: 24px;
            margin: 0 0 16px;
            overflow: hidden;
            color: #6b6b6b;
            font-size: 0.9rem;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .pc-favorite-price {
            margin-bottom: 20px;
            color: #a67c00;
            font-size: 1.45rem;
            font-weight: 900;
          }

          .pc-favorite-actions {
            display: flex;
            gap: 10px;
            margin-top: auto;
          }

          .pc-favorite-actions a,
          .pc-favorite-actions button {
            min-height: 44px;
            border-radius: 11px;
            box-sizing: border-box;
          }

          .pc-favorite-view {
            display: inline-flex;
            flex: 1;
            align-items: center;
            justify-content: center;
            gap: 7px;
            padding: 10px 12px;
            background: #d4af37;
            color: #0b0b0b;
            font-weight: 800;
            text-decoration: none;
          }

          .pc-favorite-view:hover {
            background: #a67c00;
            color: #ffffff;
          }

          .pc-favorite-delete {
            display: grid;
            place-items: center;
            width: 44px;
            border: 1px solid #f1b5b5;
            background: #fff5f5;
            color: #dc2626;
            cursor: pointer;
          }

          .pc-favorite-delete:hover {
            background: #dc2626;
            color: #ffffff;
          }

          .pc-favorite-delete:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .pc-favorites-empty {
            padding: 70px 20px;
            border: 1px solid #e0e0e0;
            border-radius: 18px;
            background: #ffffff;
            text-align: center;
          }

          .pc-favorites-empty svg {
            color: #c5a43b;
          }

          .pc-favorites-empty h2 {
            margin: 18px 0 8px;
            color: #171717;
          }

          .pc-favorites-empty p {
            margin-bottom: 24px;
            color: #6b6b6b;
          }

          @media (max-width: 992px) {
            .pc-favorites-grid {
              grid-template-columns: repeat(
                2,
                minmax(0, 1fr)
              );
            }
          }

          @media (max-width: 576px) {
            .pc-favorites-header {
              align-items: flex-start;
              flex-direction: column;
            }

            .pc-favorites-grid {
              grid-template-columns: 1fr;
            }

            .pc-favorite-image {
              height: 240px;
            }
          }
        `}
      </style>

      <div className="pc-container">
        <div className="pc-favorites-header">
          <div>
            <span className="pc-favorites-kicker">
              PC STORE
            </span>

            <h1>Mis favoritos</h1>

            <p>
              Guarda y consulta los productos que más te
              interesan.
            </p>
          </div>

          <div className="pc-favorites-count">
            <Heart size={17} />
            {favoritos.length} productos
          </div>
        </div>

        {favoritos.length === 0 ? (
          <div className="pc-favorites-empty">
            <Heart size={58} />

            <h2>No tienes favoritos todavía</h2>

            <p>
              Explora la tienda y guarda los productos que te
              interesen.
            </p>

            <Link
              to="/tienda"
              className="pc-btn pc-btn-primary"
            >
              <ShoppingBag size={18} />
              Explorar tienda
            </Link>
          </div>
        ) : (
          <div className="pc-favorites-grid">
            {favoritos.map((favorito) => {
              const producto = favorito.productos;

              if (!producto) return null;

              const precio = Number(
                producto.precio_descuento ||
                  producto.precio ||
                  0
              );

              return (
                <article
                  className="pc-favorite-card"
                  key={favorito.id}
                >
                  <div className="pc-favorite-image">
                    {producto.imagen_principal ? (
                      <img
                        src={producto.imagen_principal}
                        alt={producto.nombre}
                        loading="lazy"
                      />
                    ) : (
                      <Package
                        size={70}
                        className="pc-favorite-placeholder"
                      />
                    )}
                  </div>

                  <div className="pc-favorite-body">
                    <div className="pc-favorite-brand">
                      {producto.marca || "PC STORE"}
                    </div>

                    <h2 className="pc-favorite-name">
                      {producto.nombre}
                    </h2>

                    <p className="pc-favorite-model">
                      {producto.modelo || "Producto original"}
                    </p>

                    <div className="pc-favorite-price">
                      L{" "}
                      {precio.toLocaleString("es-HN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>

                    <div className="pc-favorite-actions">
                      <Link
                        to={`/producto/${producto.id}`}
                        className="pc-favorite-view"
                      >
                        Ver producto
                        <ArrowRight size={17} />
                      </Link>

                      <button
                        type="button"
                        className="pc-favorite-delete"
                        onClick={() =>
                          quitarFavorito(producto.id)
                        }
                        disabled={
                          eliminando === producto.id
                        }
                        title="Eliminar de favoritos"
                        aria-label="Eliminar de favoritos"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}