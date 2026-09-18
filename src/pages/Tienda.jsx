import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Cpu,
  Monitor,
  MemoryStick,
  HardDrive,
  Mouse,
  Keyboard,
  SlidersHorizontal,
  ShoppingCart,
  Search,
  Star,
} from "lucide-react";
import { supabase } from "../supabaseClient";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";
import BotonAtras from "../components/BotonAtras";
import OfertaBadge from "../components/OfertaBadge";
import { obtenerImagenProducto } from "../utils/imagenesProductos";

const iconosCategoria = [Cpu, Monitor, MemoryStick, HardDrive, Mouse, Keyboard];
const limpiarBusqueda = (valor = "", max = 100) =>
  String(valor)
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s_-]/g, "")
    .slice(0, max);

export default function Tienda() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [marcas, setMarcas] = useState([]);
  const [precioMax, setPrecioMax] = useState(15000);
  const [orden, setOrden] = useState("recientes");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const { agregarProducto } = useCarrito();
  const { usuario } = useAuth();
  const autenticado = Boolean(usuario);

  useEffect(() => {
    cargarTienda();
  }, []);
  useEffect(() => {
    if (!autenticado) {
      setPrecioMax(15000);
      if (orden === "precio-asc" || orden === "precio-desc")
        setOrden("recientes");
    }
  }, [autenticado, orden]);

  const cargarTienda = async () => {
    setCargando(true);
    setError("");
    const { data: productosData, error: productosError } = await supabase
      .from("productos")
      .select("*, categorias(id, nombre)")
      .eq("activo", true)
      .order("id");
    if (productosError) {
      console.error(productosError);
      setError("No se pudieron cargar los productos.");
      setProductos([]);
      setCargando(false);
      return;
    }
    const { data: categoriasData, error: categoriasError } = await supabase
      .from("categorias")
      .select("id, nombre")
      .order("nombre");
    if (categoriasError) {
      setError(categoriasError.message);
      setCargando(false);
      return;
    }
    setProductos(productosData || []);
    setCategorias(categoriasData || []);
    setCargando(false);
  };

  const marcasDisponibles = useMemo(
    () => [...new Set(productos.map((p) => p.marca).filter(Boolean))].sort(),
    [productos],
  );
  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    const filtrados = productos.filter((producto) => {
      const coincideTexto =
        !texto ||
        producto.nombre?.toLowerCase().includes(texto) ||
        producto.marca?.toLowerCase().includes(texto) ||
        producto.modelo?.toLowerCase().includes(texto);
      const coincideCategoria =
        categoriaId === "" ||
        String(producto.categoria_id) === String(categoriaId);
      const coincideMarca =
        marcas.length === 0 || marcas.includes(producto.marca);
      const precio = Number(producto.precio_descuento || producto.precio || 0);
      return (
        coincideTexto &&
        coincideCategoria &&
        coincideMarca &&
        (!autenticado || precio <= precioMax)
      );
    });
    return [...filtrados].sort((a, b) => {
      const precioA = Number(a.precio_descuento || a.precio || 0),
        precioB = Number(b.precio_descuento || b.precio || 0);
      if (autenticado && orden === "precio-asc") return precioA - precioB;
      if (autenticado && orden === "precio-desc") return precioB - precioA;
      return Number(b.id) - Number(a.id);
    });
  }, [productos, busqueda, categoriaId, marcas, precioMax, orden, autenticado]);

  const alternarMarca = (marca) =>
    setMarcas((actuales) =>
      actuales.includes(marca)
        ? actuales.filter((item) => item !== marca)
        : [...actuales, marca],
    );
  const limpiarFiltros = () => {
    setCategoriaId("");
    setMarcas([]);
    setPrecioMax(15000);
    setBusqueda("");
    setOrden("recientes");
  };
  const renderPrecio = (producto) => {
    if (!autenticado)
      return (
        <div className="pc-price-login">
          <span>Inicia sesión para consultar el precio</span>
          <Link to="/login">Iniciar sesión</Link>
        </div>
      );
    if (
      producto.precio_descuento &&
      Number(producto.precio_descuento) < Number(producto.precio)
    )
      return (
        <>
          <span className="pc-price">
            L {Number(producto.precio_descuento).toFixed(2)}
          </span>
          <span className="pc-old-price">
            L {Number(producto.precio).toFixed(2)}
          </span>
        </>
      );
    return (
      <span className="pc-price">
        L {Number(producto.precio || 0).toFixed(2)}
      </span>
    );
  };
  const manejarAgregarCarrito = (producto) => {
    if (!autenticado) {
      setMensaje("Debes iniciar sesión para comprar.");
      setTimeout(() => setMensaje(""), 2200);
      return;
    }
    const resultado = agregarProducto(producto);
    setMensaje(resultado.message);
    setTimeout(() => setMensaje(""), 2200);
  };

  if (cargando)
    return (
      <main className="pc-page">
        <div className="pc-container">Cargando productos...</div>
      </main>
    );

  return (
    <main
      className="pc-page pc-store-page"
      style={{ background: "#fff", color: "#171717" }}
    >
      <div className="pc-container pc-store-container">
        <BotonAtras />
        <div className="pc-store-heading">
          <div>
            <span className="pc-kicker">PC STORE</span>
            <h1>Tienda</h1>
            <p>Componentes para construir, actualizar y potenciar tu PC.</p>
          </div>
          <div className="pc-store-count">
            {productosFiltrados.length} productos
          </div>
        </div>
        <div className="pc-store-layout">
          <aside className="pc-store-sidebar">
            <div className="pc-sidebar-block">
              <div className="pc-sidebar-title">
                <SlidersHorizontal size={18} />
                <strong>Categorías</strong>
              </div>
              <button
                type="button"
                className={`pc-category-item ${categoriaId === "" ? "active" : ""}`}
                onClick={() => setCategoriaId("")}
              >
                <span>Todos los productos</span>
                <b>{productos.length}</b>
              </button>
              {categorias.map((categoria, index) => {
                const Icono = iconosCategoria[index % iconosCategoria.length];
                const cantidad = productos.filter(
                  (p) => String(p.categoria_id) === String(categoria.id),
                ).length;
                return (
                  <button
                    key={categoria.id}
                    type="button"
                    className={`pc-category-item ${String(categoriaId) === String(categoria.id) ? "active" : ""}`}
                    onClick={() => setCategoriaId(String(categoria.id))}
                  >
                    <span>
                      <Icono size={17} />
                      {categoria.nombre}
                    </span>
                    <b>{cantidad}</b>
                  </button>
                );
              })}
            </div>
            <div className="pc-sidebar-block">
              <div className="pc-sidebar-title">
                <strong>Filtros</strong>
              </div>
              {autenticado && (
                <>
                  <label className="pc-filter-label" htmlFor="precio-max">
                    Precio máximo{" "}
                    <span>L {precioMax.toLocaleString("es-HN")}</span>
                  </label>
                  <input
                    id="precio-max"
                    className="pc-price-range"
                    type="range"
                    min="500"
                    max="15000"
                    step="100"
                    value={precioMax}
                    onChange={(e) => setPrecioMax(Number(e.target.value))}
                  />
                </>
              )}
              <div className="pc-filter-group">
                <strong>Marca</strong>
                {marcasDisponibles.map((marca) => (
                  <label key={marca} className="pc-check-row">
                    <input
                      type="checkbox"
                      checked={marcas.includes(marca)}
                      onChange={() => alternarMarca(marca)}
                    />
                    <span>{marca}</span>
                  </label>
                ))}
              </div>
              <button
                type="button"
                className="pc-filter-reset"
                onClick={limpiarFiltros}
              >
                Limpiar filtros
              </button>
            </div>
          </aside>
          <section className="pc-store-results">
            <div className="pc-store-toolbar">
              <div className="pc-store-search">
                <Search size={18} />
                <input
                  type="search"
                  placeholder="Buscar productos, marca o modelo..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(limpiarBusqueda(e.target.value))}
                />
              </div>
              <select
                className="pc-store-sort"
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
                aria-label="Ordenar productos"
              >
                <option value="recientes">Más recientes</option>
                {autenticado && (
                  <>
                    <option value="precio-asc">Precio: menor a mayor</option>
                    <option value="precio-desc">Precio: mayor a menor</option>
                  </>
                )}
              </select>
            </div>
            {error && (
              <div
                className="pc-card"
                style={{ padding: 18, color: "#92400e", background: "#fff7ed" }}
              >
                {error}
              </div>
            )}
            {mensaje && <div className="pc-toast">{mensaje}</div>}
            <div className="pc-product-grid pc-store-product-grid">
              {productosFiltrados.map((producto) => {
                const tieneOferta =
                  Number(producto.precio_descuento) > 0 &&
                  Number(producto.precio_descuento) < Number(producto.precio);
                return (
                  <article
                    key={producto.id}
                    className="pc-card pc-product-card pc-store-product-card"
                    style={{ position: "relative" }}
                  >
                    {(tieneOferta || producto.destacado) && (
                      <div
                        style={{
                          position: "absolute",
                          top: 12,
                          left: 12,
                          right: 12,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          zIndex: 2,
                          pointerEvents: "none",
                        }}
                      >
                        {tieneOferta ? (
                          <OfertaBadge producto={producto} />
                        ) : (
                          <span />
                        )}
                        {producto.destacado && (
                          <span className="pc-featured-badge">
                            <Star size={13} fill="currentColor" /> Destacado
                          </span>
                        )}
                      </div>
                    )}
                    <Link
                      to={`/producto/${producto.id}`}
                      className="pc-product-image pc-store-product-image"
                    >
                      <img
                        src={obtenerImagenProducto(producto)}
                        alt={producto.nombre}
                        loading="lazy"
                      />
                    </Link>
                    <div className="pc-product-body">
                      <div className="pc-product-category">
                        {producto.categorias?.nombre || "Sin categoría"}
                      </div>
                      <h3 className="pc-product-name">{producto.nombre}</h3>
                      <p className="pc-product-description">
                        {producto.descripción?.substring(0, 90)}
                        {producto.descripción?.length > 90 ? "..." : ""}
                      </p>
                      <div className="pc-price-row">
                        {renderPrecio(producto)}
                      </div>
                      <div className="pc-stock-badge">
                        {producto.stock > 0 ? "En stock" : "Agotado"}
                      </div>
                      {autenticado ? (
                        <button
                          type="button"
                          className="pc-btn pc-btn-primary pc-store-cart-btn"
                          disabled={producto.stock <= 0}
                          onClick={() => manejarAgregarCarrito(producto)}
                        >
                          <ShoppingCart size={17} />
                          {producto.stock > 0
                            ? "Agregar al carrito"
                            : "Agotado"}
                        </button>
                      ) : (
                        <Link
                          to="/login"
                          className="pc-btn pc-btn-primary pc-store-cart-btn"
                        >
                          Inicia sesión para comprar
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
            {productosFiltrados.length === 0 && (
              <div className="pc-card pc-empty-small">
                No encontramos productos con esos filtros.
              </div>
            )}
          </section>
        </div>
      </div>
      <style>{`.pc-featured-badge{display:inline-flex;align-items:center;gap:5px;padding:6px 9px;border-radius:999px;background:#171717;color:#fff;font-size:11px;font-weight:800;box-shadow:0 3px 10px rgba(0,0,0,.12)}.pc-store-page .pc-old-price{text-decoration:line-through}.pc-store-page .pc-price{font-weight:900}`}</style>
    </main>
  );
}