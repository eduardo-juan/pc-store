import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Heart,
  Truck,
  ExternalLink,
  Star,
} from "lucide-react";

import { supabase } from "../../supabaseClient";
import { useCarrito } from "../../context/CarritoContext";
import { useAuth } from "../../hooks/useAuth";
import { obtenerProveedorProducto } from "../../services/productosService";
import { obtenerImagenProducto } from "../../utils/imagenesProductos";
import BotonAtras from "../BotonAtras";

export default function DetalleProducto() {
  const { id } = useParams();
  const { usuario, esAdmin } = useAuth();
  const { agregarProducto } = useCarrito();
  const [producto, setProducto] = useState(null);
  const [proveedor, setProveedor] = useState(null);
  const [resenas, setResenas] = useState([]);
  const [cantidad, setCantidad] = useState(1);
  const [calificacion, setCalificacion] = useState(5);
  const [comentario, setComentario] = useState("");
  const [imagenSeleccionada, setImagenSeleccionada] = useState("");
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [esFavorito, setEsFavorito] = useState(false);
  const [cargandoFavorito, setCargandoFavorito] = useState(false);
  const autenticado = Boolean(usuario);

  useEffect(() => {
    cargarProducto();
  }, [id, esAdmin]);
  useEffect(() => {
    comprobarFavorito();
  }, [id, usuario]);

  async function cargarProducto() {
    setCargando(true);
    setMensaje("");
    const { data, error } = await supabase
      .from("productos")
      .select("*, categorias(nombre)")
      .eq("id", id)
      .eq("activo", true)
      .single();
    if (error) {
      setMensaje(error.message);
      setCargando(false);
      return;
    }
    const { data: resenasData } = await supabase
      .from("reseñas")
      .select("*")
      .eq("producto_id", id)
      .order("created_at", { ascending: false });
    if (esAdmin) {
      const resultado = await obtenerProveedorProducto(id);
      setProveedor(resultado.success ? resultado.data : null);
    } else setProveedor(null);
    setProducto(data);
    setImagenSeleccionada(obtenerImagenProducto(data));
    setResenas(resenasData || []);
    setCargando(false);
  }

  async function comprobarFavorito() {
    if (!usuario?.id || !id) {
      setEsFavorito(false);
      return;
    }
    const { data, error } = await supabase
      .from("favoritos")
      .select("id")
      .eq("usuario_id", usuario.id)
      .eq("producto_id", id)
      .maybeSingle();
    if (!error) setEsFavorito(Boolean(data));
  }

  async function alternarFavorito() {
    if (!usuario) {
      setMensaje("Debes iniciar sesión para guardar favoritos.");
      return;
    }
    if (!producto || cargandoFavorito) return;
    setCargandoFavorito(true);
    setMensaje("");
    if (esFavorito) {
      const { error } = await supabase
        .from("favoritos")
        .delete()
        .eq("usuario_id", usuario.id)
        .eq("producto_id", producto.id);
      if (error) setMensaje("No se pudo eliminar de favoritos.");
      else {
        setEsFavorito(false);
        setMensaje("Producto eliminado de favoritos.");
      }
    } else {
      const { error } = await supabase
        .from("favoritos")
        .insert({ usuario_id: usuario.id, producto_id: producto.id });
      if (error?.code === "23505") setEsFavorito(true);
      else if (error) setMensaje("No se pudo agregar a favoritos.");
      else {
        setEsFavorito(true);
        setMensaje("Producto agregado a favoritos.");
      }
    }
    setCargandoFavorito(false);
  }

  async function limpiarImagenRota(url) {
    if (!url || !producto) return;
    const adicionales = Array.isArray(producto.imágenes_adicionales)
      ? producto.imágenes_adicionales
      : [];
    const cambios = {};
    if (producto.imagen_principal === url) cambios.imagen_principal = null;
    const nuevos = adicionales.filter((imagen) => imagen !== url);
    if (nuevos.length !== adicionales.length)
      cambios.imágenes_adicionales = nuevos;
    if (!Object.keys(cambios).length) return;
    const { error } = await supabase
      .from("productos")
      .update(cambios)
      .eq("id", producto.id);
    if (!error) {
      const actualizado = { ...producto, ...cambios };
      setProducto(actualizado);
      setImagenSeleccionada(obtenerImagenProducto(actualizado));
    }
  }

  function agregar() {
    if (!usuario) {
      setMensaje("Debes iniciar sesión para comprar.");
      return;
    }
    const valor = Number(cantidad);
    if (!Number.isInteger(valor) || valor < 1 || valor > producto.stock) {
      setMensaje("Selecciona una cantidad válida.");
      return;
    }
    setMensaje(agregarProducto(producto, valor).message);
  }

  async function guardarResena(e) {
    e.preventDefault();
    if (!usuario)
      return setMensaje("Debes iniciar sesión para publicar una reseña.");
    if (!comentario.trim())
      return setMensaje("Escribe un comentario antes de publicar.");
    const { error } = await supabase
      .from("reseñas")
      .insert([
        {
          producto_id: producto.id,
          usuario_id: usuario.id,
          calificación: Number(calificacion),
          comentario: comentario.trim(),
        },
      ]);
    if (error) return setMensaje(error.message);
    setComentario("");
    setCalificacion(5);
    setMensaje("Reseña publicada.");
    await cargarProducto();
  }

  if (cargando)
    return (
      <main className="pc-page">
        <div className="pc-container">
          <div className="pc-loader" />
        </div>
      </main>
    );
  if (!producto)
    return (
      <main className="pc-page">
        <div className="pc-container pc-empty">
          <BotonAtras />
          <h1>Producto no encontrado</h1>
          <Link to="/tienda">Regresar</Link>
        </div>
      </main>
    );

  const imagenes = [
    obtenerImagenProducto(producto),
    ...(Array.isArray(producto.imágenes_adicionales)
      ? producto.imágenes_adicionales
      : []),
  ]
    .filter(Boolean)
    .filter((url, i, arr) => arr.indexOf(url) === i)
    .slice(0, 2);
  const precio = Number(producto.precio_descuento || producto.precio || 0);

  return (
    <main className="pc-page">
      <div className="pc-container">
        <BotonAtras />
        <div className="pc-product-detail">
          <div>
            <div className="pc-detail-image">
              <img
                src={imagenSeleccionada || imagenes[0]}
                alt={producto.nombre}
                onError={(e) => {
                  const url = e.currentTarget.src;
                  e.currentTarget.style.display = "none";
                  limpiarImagenRota(url);
                }}
              />
            </div>
            {imagenes.length > 1 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 10,
                  marginTop: 12,
                }}
              >
                {imagenes.map((url, i) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setImagenSeleccionada(url)}
                    aria-label={`Ver imagen ${i + 1}`}
                  >
                    <img
                      src={url}
                      alt={`${producto.nombre} vista ${i + 1}`}
                      style={{
                        width: "100%",
                        height: 90,
                        objectFit: "contain",
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          <section>
            <span className="pc-kicker">{producto.categorias?.nombre}</span>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 16,
              }}
            >
              <h1>{producto.nombre}</h1>
              <button
                type="button"
                className="pc-btn pc-btn-light"
                onClick={alternarFavorito}
                disabled={cargandoFavorito}
                title="Favoritos"
              >
                <Heart
                  size={23}
                  fill={esFavorito ? "#d4af37" : "none"}
                  color={esFavorito ? "#d4af37" : "currentColor"}
                />
              </button>
            </div>
            <p className="pc-detail-brand">
              {producto.marca}
              {producto.modelo ? ` · ${producto.modelo}` : ""}
            </p>
            <p className="pc-detail-description">{producto.descripción}</p>
            {autenticado ? (
              <div className="pc-price-row">
                <span className="pc-price pc-price-large">
                  L {precio.toFixed(2)}
                </span>
                {producto.precio_descuento && (
                  <span className="pc-old-price">
                    L {Number(producto.precio).toFixed(2)}
                  </span>
                )}
              </div>
            ) : (
              <div className="pc-price-login">
                <span>Inicia sesión para consultar el precio</span>
                <Link to="/login">Iniciar sesión</Link>
              </div>
            )}
            <p className="pc-stock">
              {producto.stock > 0
                ? `${producto.stock} unidades disponibles`
                : "Producto agotado"}
            </p>
            {esAdmin && proveedor?.activo && (
              <div
                className="pc-card"
                style={{ margin: "18px 0", padding: 16 }}
              >
                <strong>
                  <Truck size={18} /> Dropshipping
                </strong>
                <p>
                  Proveedor: {proveedor.proveedor} · Costo: L{" "}
                  {Number(proveedor.costo).toFixed(2)}
                </p>
                <a
                  href={proveedor.url_compra}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pc-btn pc-btn-light"
                >
                  <ExternalLink size={16} /> Comprar al proveedor
                </a>
              </div>
            )}
            <div className="pc-buy-row">
              <input
                type="number"
                min="1"
                max={producto.stock}
                className="pc-input pc-qty"
                value={cantidad}
                onChange={(e) =>
                  setCantidad(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              />
              {autenticado ? (
                <button
                  type="button"
                  className="pc-btn pc-btn-primary"
                  disabled={producto.stock <= 0}
                  onClick={agregar}
                >
                  Agregar al carrito
                </button>
              ) : (
                <Link to="/login" className="pc-btn pc-btn-primary">
                  Inicia sesión para comprar
                </Link>
              )}
            </div>
            {mensaje && <div className="pc-message">{mensaje}</div>}
          </section>
        </div>
        <section className="pc-section">
          <h2 className="pc-section-title">Reseñas</h2>
          {usuario ? (
            <form className="pc-card pc-review-form" onSubmit={guardarResena}>
              <select
                className="pc-select"
                value={calificacion}
                onChange={(e) => setCalificacion(Number(e.target.value))}
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} estrellas
                  </option>
                ))}
              </select>
              <textarea
                className="pc-textarea"
                rows="4"
                placeholder="Cuéntanos tu experiencia..."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                required
              />
              <button type="submit" className="pc-btn pc-btn-primary">
                Publicar reseña
              </button>
            </form>
          ) : (
            <p>
              <Link to="/login">Inicia sesión</Link> para publicar una reseña.
            </p>
          )}
          <div className="pc-review-list">
            {resenas.map((r) => (
              <article key={r.id} className="pc-card pc-review">
                <div className="pc-review-stars">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      size={18}
                      fill={n <= r.calificación ? "#d4af37" : "none"}
                      color={n <= r.calificación ? "#d4af37" : "#a0a0a0"}
                    />
                  ))}
                </div>
                <p>{r.comentario}</p>
                <span>{new Date(r.created_at).toLocaleDateString()}</span>
              </article>
            ))}
            {!resenas.length && (
              <div className="pc-empty-small">
                Este producto todavía no tiene reseñas.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
