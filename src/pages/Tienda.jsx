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
} from "lucide-react";

import { supabase } from "../supabaseClient";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";

import BotonAtras from "../components/BotonAtras";
import { obtenerImagenProducto } from "../utils/imagenesProductos";

const iconosCategoria = [
  Cpu,
  Monitor,
  MemoryStick,
  HardDrive,
  Mouse,
  Keyboard,
];

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

      if (orden === "precio-asc" || orden === "precio-desc") {
        setOrden("recientes");
      }
    }
  }, [autenticado, orden]);

  const cargarTienda = async () => {
    setCargando(true);
    setError("");

    const { data: productosData, error: productosError } =
      await supabase
        .from("productos")
        .select("*, categorias(id, nombre)")
        .eq("activo", true)
        .order("id");

    if (productosError) {
      setError(productosError.message);
      setCargando(false);
      return;
    }

    const { data: categoriasData, error: categoriasError } =
      await supabase
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

  const marcasDisponibles = useMemo(() => {
    return [
      ...new Set(
        productos
          .map((producto) => producto.marca)
          .filter(Boolean),
      ),
    ].sort();
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    const filtrados = productos.filter((producto) => {
      const coincideTexto =
        texto === "" ||
        producto.nombre?.toLowerCase().includes(texto) ||
        producto.marca?.toLowerCase().includes(texto) ||
        producto.modelo?.toLowerCase().includes(texto);

      const coincideCategoria =
        categoriaId === "" ||
        String(producto.categoria_id) === String(categoriaId);

      const coincideMarca =
        marcas.length === 0 ||
        marcas.includes(producto.marca);

      const precio = Number(
        producto.precio_descuento ||
          producto.precio ||
          0,
      );

      const coincidePrecio =
        !autenticado || precio <= precioMax;

      return (
        coincideTexto &&
        coincideCategoria &&
        coincideMarca &&
        coincidePrecio
      );
    });

    return [...filtrados].sort((a, b) => {
      const precioA = Number(
        a.precio_descuento || a.precio || 0,
      );

      const precioB = Number(
        b.precio_descuento || b.precio || 0,
      );

      if (autenticado && orden === "precio-asc") {
        return precioA - precioB;
      }

      if (autenticado && orden === "precio-desc") {
        return precioB - precioA;
      }

      return Number(b.id) - Number(a.id);
    });
  }, [
    productos,
    busqueda,
    categoriaId,
    marcas,
    precioMax,
    orden,
    autenticado,
  ]);

  const alternarMarca = (marca) => {
    setMarcas((actuales) =>
      actuales.includes(marca)
        ? actuales.filter((item) => item !== marca)
        : [...actuales, marca],
    );
  };

  const limpiarFiltros = () => {
    setCategoriaId("");
    setMarcas([]);
    setPrecioMax(15000);
    setBusqueda("");
    setOrden("recientes");
  };

  const renderPrecio = (producto) => {
    if (!autenticado) {
      return (
        <div className="pc-price-login">
          <span>
            Inicia sesión para consultar el precio
          </span>

          <Link to="/login">Iniciar sesión</Link>
        </div>
      );
    }

    if (producto.precio_descuento) {
      return (
        <>
          <span className="pc-price">
            L{" "}
            {Number(
              producto.precio_descuento,
            ).toFixed(2)}
          </span>

          <span className="pc-old-price">
            L {Number(producto.precio).toFixed(2)}
          </span>
        </>
      );
    }

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

  if (cargando) {
    return (
      <main
        className="pc-page"
        style={{
          background: "#ffffff",
          color: "#171717",
        }}
      >
        <div className="pc-container">
          Cargando productos...
        </div>
      </main>
    );
  }

  return (
    <main
      className="pc-page pc-store-page"
      style={{
        background: "#ffffff",
        color: "#171717",
      }}
    >
      <style>
        {`
          .pc-store-page,
          .pc-store-page * {
            color-scheme: light;
          }

          .pc-price-login {
            display: flex;
            flex-direction: column;
            gap: 7px;
            font-size: 11px;
            line-height: 1.5;
            color: #666 !important;
          }

          .pc-price-login a {
            width: fit-content;
            color: #a67c00 !important;
            font-weight: 800;
            text-decoration: underline !important;
          }

          .pc-store-page {
            background: #fff !important;
            color: #171717 !important;
          }

          .pc-store-page .pc-store-heading h1 {
            color: #171717 !important;
          }

          .pc-store-page .pc-store-heading p {
            color: #6b6b6b !important;
          }

          .pc-store-page .pc-kicker,
          .pc-store-page .pc-sidebar-title svg {
            color: #a67c00 !important;
          }

          .pc-store-page .pc-store-count {
            color: #a67c00 !important;
            background: #fbf4d6 !important;
            border-color: rgba(212, 175, 55, 0.4) !important;
          }

          .pc-store-page .pc-sidebar-block,
          .pc-store-page .pc-store-product-card {
            background: #fff !important;
            border-color: #e0e0e0 !important;
          }

          .pc-store-page .pc-category-item {
            background: #fff !important;
            color: #555 !important;
          }

          .pc-store-page .pc-category-item:hover,
          .pc-store-page .pc-category-item.active {
            background: #fbf4d6 !important;
            color: #a67c00 !important;
            border-color: rgba(212, 175, 55, 0.5) !important;
          }

          .pc-store-page .pc-category-item b {
            color: #888 !important;
          }

          .pc-store-page .pc-filter-label,
          .pc-store-page .pc-check-row {
            color: #666 !important;
          }

          .pc-store-page .pc-filter-label span,
          .pc-store-page .pc-filter-group > strong {
            color: #171717 !important;
          }

          .pc-store-page .pc-price-range,
          .pc-store-page .pc-check-row input {
            accent-color: #d4af37;
          }

          .pc-store-page .pc-filter-reset {
            color: #a67c00 !important;
          }

          .pc-store-page .pc-store-search,
          .pc-store-page .pc-store-sort {
            background: #fff !important;
            border-color: #e0e0e0 !important;
            color: #171717 !important;
          }

          .pc-store-page .pc-store-search:focus-within {
            border-color: #d4af37 !important;
            box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.12) !important;
          }

          .pc-store-page .pc-store-search input {
            color: #171717 !important;
          }

          .pc-store-page .pc-store-search input::placeholder {
            color: #888 !important;
          }

          .pc-store-page .pc-store-product-image {
            background: linear-gradient(135deg, #f1f1f1, #fff) !important;
            border-color: #e0e0e0 !important;
          }

          .pc-store-page .pc-product-category,
          .pc-store-page .pc-price {
            color: #a67c00 !important;
          }

          .pc-store-page .pc-product-name {
            color: #171717 !important;
          }

          .pc-store-page .pc-product-description {
            color: #666 !important;
          }

          .pc-store-page .pc-old-price {
            color: #777 !important;
          }

          .pc-store-page .pc-stock-badge {
            background: #edf7ef !important;
            color: #15803d !important;
          }

          .pc-store-page .pc-store-cart-btn {
            background: #d4af37 !important;
            color: #0b0b0b !important;
            box-shadow: 0 6px 18px rgba(212, 175, 55, 0.2) !important;
          }

          .pc-store-page .pc-store-cart-btn:hover {
            background: #a67c00 !important;
            color: #fff !important;
          }

          .pc-store-page .pc-empty-small {
            background: #fff !important;
            color: #666 !important;
            border-color: #e0e0e0 !important;
          }

          .pc-store-page .pc-toast {
            background: #fbf4d6 !important;
            color: #171717 !important;
            border-color: rgba(212, 175, 55, 0.45) !important;
          }
        `}
      </style>

      <div className="pc-container pc-store-container">
        <BotonAtras />

        <div className="pc-store-heading">
          <div>
            <span className="pc-kicker">
              PC STORE
            </span>

            <h1>Tienda</h1>

            <p>
              Componentes para construir, actualizar y
              potenciar tu PC.
            </p>
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
                className={`pc-category-item ${
                  categoriaId === "" ? "active" : ""
                }`}
                onClick={() => setCategoriaId("")}
              >
                <span>Todos los productos</span>
                <b>{productos.length}</b>
              </button>

              {categorias.map((categoria, index) => {
                const Icono =
                  iconosCategoria[
                    index % iconosCategoria.length
                  ];

                const cantidad = productos.filter(
                  (producto) =>
                    String(producto.categoria_id) ===
                    String(categoria.id),
                ).length;

                return (
                  <button
                    key={categoria.id}
                    type="button"
                    className={`pc-category-item ${
                      String(categoriaId) ===
                      String(categoria.id)
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setCategoriaId(String(categoria.id))
                    }
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
                  <label
                    className="pc-filter-label"
                    htmlFor="precio-max"
                  >
                    Precio máximo{" "}
                    <span>
                      L{" "}
                      {precioMax.toLocaleString("es-HN")}
                    </span>
                  </label>

                  <input
                    id="precio-max"
                    className="pc-price-range"
                    type="range"
                    min="500"
                    max="15000"
                    step="100"
                    value={precioMax}
                    onChange={(e) =>
                      setPrecioMax(Number(e.target.value))
                    }
                  />
                </>
              )}

              <div className="pc-filter-group">
                <strong>Marca</strong>

                {marcasDisponibles.map((marca) => (
                  <label
                    key={marca}
                    className="pc-check-row"
                  >
                    <input
                      type="checkbox"
                      checked={marcas.includes(marca)}
                      onChange={() =>
                        alternarMarca(marca)
                      }
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
                  onChange={(e) =>
                    setBusqueda(
                      limpiarBusqueda(e.target.value),
                    )
                  }
                />
              </div>

              <select
                className="pc-store-sort"
                value={orden}
                onChange={(e) =>
                  setOrden(e.target.value)
                }
                aria-label="Ordenar productos"
              >
                <option value="recientes">
                  Más recientes
                </option>

                {autenticado && (
                  <>
                    <option value="precio-asc">
                      Precio: menor a mayor
                    </option>

                    <option value="precio-desc">
                      Precio: mayor a menor
                    </option>
                  </>
                )}
              </select>
            </div>

            {error && (
              <div
                className="pc-card"
                style={{ padding: 18 }}
              >
                Error: {error}
              </div>
            )}

            {mensaje && (
              <div className="pc-toast">
                {mensaje}
              </div>
            )}

            <div className="pc-product-grid pc-store-product-grid">
              {productosFiltrados.map((producto) => (
                <article
                  key={producto.id}
                  className="pc-card pc-product-card pc-store-product-card"
                >
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
                      {producto.categorias?.nombre ||
                        "Sin categoría"}
                    </div>

                    <h3 className="pc-product-name">
                      {producto.nombre}
                    </h3>

                    <p className="pc-product-description">
                      {producto.descripción?.substring(0, 90)}

                      {producto.descripción?.length > 90
                        ? "..."
                        : ""}
                    </p>

                    <div className="pc-price-row">
                      {renderPrecio(producto)}
                    </div>

                    <div className="pc-stock-badge">
                      {producto.stock > 0
                        ? "En stock"
                        : "Agotado"}
                    </div>

                    {autenticado ? (
                      <button
                        type="button"
                        className="pc-btn pc-btn-primary pc-store-cart-btn"
                        disabled={producto.stock <= 0}
                        onClick={() =>
                          manejarAgregarCarrito(producto)
                        }
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
              ))}
            </div>

            {productosFiltrados.length === 0 && (
              <div className="pc-card pc-empty-small">
                No encontramos productos con esos filtros.
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}