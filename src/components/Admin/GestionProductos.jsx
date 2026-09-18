import { useState, useEffect, useRef } from "react";
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerCategorias,
  obtenerProveedorProducto,
  guardarProveedorProducto,
  eliminarProveedorProducto,
} from "../../services/productosService";
import {
  subirImagen,
  eliminarImagen,
  obtenerRutaStorage,
} from "../../services/storageService";
import {
  Plus,
  Save,
  X,
  Pencil,
  Trash2,
  Truck,
  Image as ImageIcon,
  Tag,
  Star,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import BotonAtras from "../../components/BotonAtras";

const BUCKET_PRODUCTOS = "productos-imagenes";

const limpiarTextoProducto = (valor, max = 120) =>
  valor.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ _-]/g, "").slice(0, max);

const obtenerRutasImagenesPropias = (producto) => {
  const urls = [producto?.imagen_principal];
  if (Array.isArray(producto?.imágenes_adicionales))
    urls.push(...producto.imágenes_adicionales);
  return [
    ...new Set(
      urls
        .map((url) => obtenerRutaStorage(BUCKET_PRODUCTOS, url))
        .filter(Boolean),
    ),
  ];
};

const limpiarImagenes = async (producto) => {
  for (const ruta of obtenerRutasImagenesPropias(producto))
    await eliminarImagen(BUCKET_PRODUCTOS, ruta);
};

export default function GestionProductos() {
  const { esAdmin } = useAuth();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [precioDescuento, setPrecioDescuento] = useState("");
  const [destacado, setDestacado] = useState(false);
  const [stock, setStock] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [imagenes, setImagenes] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [proveedor, setProveedor] = useState("");
  const [urlProveedor, setUrlProveedor] = useState("");
  const [costoProveedor, setCostoProveedor] = useState("");
  const [dropshippingActivo, setDropshippingActivo] = useState(false);
  const formularioRef = useRef(null);

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
  }, []);

  const cargarProductos = async () => {
    setCargando(true);
    const resultado = await obtenerProductos();
    if (resultado.success) setProductos(resultado.data);
    else setError(resultado.error);
    setCargando(false);
  };

  const cargarCategorias = async () => {
    const resultado = await obtenerCategorias();
    if (resultado.success) setCategorias(resultado.data);
    else setError(resultado.error);
  };

  const cargarProveedor = async (productoId) => {
    if (!esAdmin) return;
    const resultado = await obtenerProveedorProducto(productoId);
    if (resultado.success && resultado.data) {
      setProveedor(resultado.data.proveedor || "");
      setUrlProveedor(resultado.data.url_compra || "");
      setCostoProveedor(resultado.data.costo ?? "");
      setDropshippingActivo(Boolean(resultado.data.activo));
    } else {
      setProveedor("");
      setUrlProveedor("");
      setCostoProveedor("");
      setDropshippingActivo(false);
    }
  };

  const desplazarAlFormulario = () => {
    window.requestAnimationFrame(() => {
      formularioRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const abrirNuevoProducto = () => {
    resetFormulario();
    setMostrarFormulario(true);
    desplazarAlFormulario();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError("");
    const productoAnterior = editandoId
      ? productos.find((item) => Number(item.id) === Number(editandoId))
      : null;
    const nuevasRutas = [];

    try {
      if (!categoriaId) throw new Error("Debes seleccionar una categoría");

      const precioNumero = parseFloat(precio);
      const descuentoNumero =
        precioDescuento === "" ? null : parseFloat(precioDescuento);
      if (!Number.isFinite(precioNumero) || precioNumero <= 0)
        throw new Error("El precio debe ser mayor que 0.");
      if (
        descuentoNumero !== null &&
        (!Number.isFinite(descuentoNumero) ||
          descuentoNumero <= 0 ||
          descuentoNumero >= precioNumero)
      ) {
        throw new Error(
          "El precio de oferta debe ser mayor que 0 y menor que el precio normal.",
        );
      }

      let imagenPrincipal = null;
      let imagenesAdicionales = null;
      if (imagenes.length > 0) {
        const categoriaSeleccionada = categorias.find(
          (categoria) => Number(categoria.id) === Number(categoriaId),
        );
        const nombreCategoria =
          categoriaSeleccionada?.nombre || "sin-categoria";
        const subidas = [];
        for (let i = 0; i < imagenes.length; i += 1) {
          const resultadoSubida = await subirImagen(
            BUCKET_PRODUCTOS,
            imagenes[i],
            `${nombre}-${Date.now()}-${i + 1}`,
            `productos/${nombreCategoria}`,
          );
          if (!resultadoSubida.success) throw new Error(resultadoSubida.error);
          subidas.push(resultadoSubida.url);
          if (resultadoSubida.ruta) nuevasRutas.push(resultadoSubida.ruta);
        }
        imagenPrincipal = subidas[0] || null;
        imagenesAdicionales = subidas.slice(1);
      }

      const datosProducto = {
        nombre,
        descripción: descripcion,
        precio: precioNumero,
        precio_descuento: descuentoNumero,
        destacado: Boolean(destacado),
        stock: parseInt(stock),
        marca,
        modelo,
        categoria_id: Number(categoriaId),
        ...(imagenPrincipal && { imagen_principal: imagenPrincipal }),
        ...(imagenesAdicionales && {
          imágenes_adicionales: imagenesAdicionales,
        }),
      };

      let resultado;
      let productoId = editandoId;
      if (editandoId)
        resultado = await actualizarProducto(editandoId, datosProducto);
      else {
        resultado = await crearProducto({ ...datosProducto, activo: true });
        productoId = resultado.data?.id;
      }
      if (!resultado.success) throw new Error(resultado.error);

      if (productoAnterior && imagenes.length > 0)
        await limpiarImagenes(productoAnterior);

      if (esAdmin && productoId) {
        if (dropshippingActivo && proveedor.trim() && urlProveedor.trim()) {
          let urlValida;
          try {
            urlValida = new URL(urlProveedor.trim());
          } catch {
            throw new Error("El enlace del proveedor no es válido.");
          }
          if (!["http:", "https:"].includes(urlValida.protocol))
            throw new Error(
              "El enlace del proveedor debe comenzar con http:// o https://",
            );
          const proveedorResultado = await guardarProveedorProducto(
            productoId,
            {
              proveedor: proveedor.trim(),
              url_compra: urlValida.toString(),
              costo: parseFloat(costoProveedor || "0"),
              activo: true,
            },
          );
          if (!proveedorResultado.success)
            throw new Error(proveedorResultado.error);
        } else if (editandoId) {
          const proveedorResultado =
            await eliminarProveedorProducto(productoId);
          if (!proveedorResultado.success)
            throw new Error(proveedorResultado.error);
        }
      }

      alert(editandoId ? "Producto actualizado" : "Producto creado");
      resetFormulario();
      await cargarProductos();
    } catch (err) {
      for (const ruta of nuevasRutas)
        await eliminarImagen(BUCKET_PRODUCTOS, ruta);
      setError(err.message);
    }
    setCargando(false);
  };

  const resetFormulario = () => {
    setNombre("");
    setDescripcion("");
    setPrecio("");
    setPrecioDescuento("");
    setDestacado(false);
    setStock("");
    setMarca("");
    setModelo("");
    setCategoriaId("");
    setImagenes([]);
    setEditandoId(null);
    setProveedor("");
    setUrlProveedor("");
    setCostoProveedor("");
    setDropshippingActivo(false);
    setMostrarFormulario(false);
  };

  const handleEditar = async (producto) => {
    setEditandoId(producto.id);
    setNombre(producto.nombre || "");
    setDescripcion(producto.descripción || "");
    setPrecio(producto.precio || "");
    setPrecioDescuento(producto.precio_descuento ?? "");
    setDestacado(Boolean(producto.destacado));
    setStock(producto.stock ?? "");
    setMarca(producto.marca || "");
    setModelo(producto.modelo || "");
    setCategoriaId(producto.categoria_id || "");
    setImagenes([]);
    setMostrarFormulario(true);
    desplazarAlFormulario();
    await cargarProveedor(producto.id);
  };

  const handleEliminar = async (id) => {
    if (!esAdmin) {
      setError("No tienes permiso para eliminar productos.");
      return;
    }
    if (!window.confirm("¿Estás seguro de que deseas eliminar este producto?"))
      return;
    setError("");
    const producto = productos.find((item) => Number(item.id) === Number(id));
    const resultado = await eliminarProducto(id);
    if (resultado.success) {
      await limpiarImagenes(producto);
      alert("Producto eliminado");
      await cargarProductos();
    } else setError(resultado.error);
  };

  if (cargando && !mostrarFormulario)
    return (
      <main className="pc-page">
        <div className="pc-container">
          <BotonAtras />
          Cargando...
        </div>
      </main>
    );

  return (
    <main className="pc-page">
      <div className="pc-container">
        <BotonAtras />
        <div
          className="pc-admin-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1>Gestión de Productos</h1>
            <p>Administra el catálogo de componentes.</p>
          </div>
          <button
            className="pc-btn pc-btn-primary"
            onClick={abrirNuevoProducto}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <Plus size={18} />
            Nuevo Producto
          </button>
        </div>

        {error && (
          <div className="pc-card" style={{ padding: 16, marginBottom: 20 }}>
            {error}
          </div>
        )}

        {mostrarFormulario && (
          <div
            ref={formularioRef}
            className="pc-card"
            style={{ padding: 22, marginBottom: 24, scrollMarginTop: 24 }}
          >
            <h2 style={{ marginBottom: 16 }}>
              {editandoId ? "Editar Producto" : "Nuevo Producto"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="pc-form-grid">
                <label>
                  Nombre del producto{" "}
                  <span style={{ color: "#dc2626" }}>*</span>
                  <input
                    type="text"
                    className="pc-input"
                    value={nombre}
                    onChange={(e) =>
                      setNombre(limpiarTextoProducto(e.target.value, 100))
                    }
                    required
                  />
                </label>
                <label>
                  Marca
                  <input
                    type="text"
                    className="pc-input"
                    value={marca}
                    onChange={(e) =>
                      setMarca(limpiarTextoProducto(e.target.value, 60))
                    }
                  />
                </label>
                <label>
                  Modelo
                  <input
                    type="text"
                    className="pc-input"
                    value={modelo}
                    onChange={(e) =>
                      setModelo(limpiarTextoProducto(e.target.value, 80))
                    }
                  />
                </label>
                <label>
                  Categoría <span style={{ color: "#dc2626" }}>*</span>
                  <select
                    className="pc-select"
                    value={categoriaId}
                    onChange={(e) => setCategoriaId(e.target.value)}
                    required
                  >
                    <option value="">Selecciona una categoría</option>
                    {categorias.map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Precio normal (Lps){" "}
                  <span style={{ color: "#dc2626" }}>*</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="pc-input"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    required
                  />
                </label>
                <label>
                  Precio de oferta (Lps)
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="pc-input"
                    value={precioDescuento}
                    onChange={(e) => setPrecioDescuento(e.target.value)}
                  />
                </label>
                <label>
                  Stock <span style={{ color: "#dc2626" }}>*</span>
                  <input
                    type="number"
                    min="0"
                    className="pc-input"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                  />
                </label>
              </div>

              <div className="pc-card" style={{ marginTop: 18, padding: 18 }}>
                <h3
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 0,
                  }}
                >
                  <Tag size={18} />
                  Promoción del producto
                </h3>
                <p style={{ marginTop: 0 }}>
                  La oferta es independiente de los cupones. Déjalo vacío para
                  vender al precio normal.
                </p>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 14,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(precioDescuento)}
                    onChange={(e) => {
                      if (!e.target.checked) setPrecioDescuento("");
                    }}
                  />
                  Oferta activa
                </label>
                <label
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <input
                    type="checkbox"
                    checked={destacado}
                    onChange={(e) => setDestacado(e.target.checked)}
                  />
                  <Star size={17} />
                  Producto destacado
                </label>
              </div>

              <div style={{ marginTop: 14 }}>
                <label
                  style={{ display: "block", marginBottom: 7, fontWeight: 600 }}
                >
                  Imágenes del producto (máximo 2)
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  className="pc-input"
                  onChange={(e) =>
                    setImagenes(Array.from(e.target.files || []).slice(0, 2))
                  }
                />
                <small style={{ display: "block", marginTop: 6 }}>
                  La primera será la imagen principal y la segunda la adicional.
                  Se convierten a PNG transparente y se guardan por categoría.
                </small>
                {imagenes.length > 0 && (
                  <div
                    style={{
                      marginTop: 10,
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: 10,
                    }}
                  >
                    {imagenes.map((archivo, index) => (
                      <div
                        key={`${archivo.name}-${index}`}
                        style={{
                          padding: 10,
                          border: "1px solid #ddd",
                          borderRadius: 8,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 7,
                          }}
                        >
                          <ImageIcon size={16} />
                          {index + 1}. {archivo.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <label
                style={{ display: "block", marginTop: 14, fontWeight: 600 }}
              >
                Descripción <span style={{ color: "#dc2626" }}>*</span>
                <textarea
                  className="pc-textarea"
                  rows={4}
                  style={{ marginTop: 7, width: "100%" }}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  required
                />
              </label>

              {esAdmin && (
                <div className="pc-card" style={{ marginTop: 18, padding: 18 }}>
                  <h3
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 0,
                    }}
                  >
                    <Truck size={18} />
                    Dropshipping
                  </h3>
                  <p style={{ marginTop: 0 }}>
                    Información privada del proveedor. Solo los administradores
                    pueden verla.
                  </p>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 14,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={dropshippingActivo}
                      onChange={(e) => setDropshippingActivo(e.target.checked)}
                    />
                    Activar dropshipping para este producto
                  </label>
                  {dropshippingActivo && (
                    <div className="pc-form-grid">
                      <label>
                        Proveedor <span style={{ color: "#dc2626" }}>*</span>
                        <input
                          type="text"
                          className="pc-input"
                          value={proveedor}
                          onChange={(e) =>
                            setProveedor(
                              limpiarTextoProducto(e.target.value, 100),
                            )
                          }
                          required
                        />
                      </label>
                      <label>
                        URL del proveedor{" "}
                        <span style={{ color: "#dc2626" }}>*</span>
                        <input
                          type="url"
                          className="pc-input"
                          value={urlProveedor}
                          onChange={(e) => setUrlProveedor(e.target.value)}
                          required
                        />
                      </label>
                      <label>
                        Costo del proveedor (Lps){" "}
                        <span style={{ color: "#dc2626" }}>*</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="pc-input"
                          value={costoProveedor}
                          onChange={(e) => setCostoProveedor(e.target.value)}
                          required
                        />
                      </label>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button
                  type="submit"
                  disabled={cargando}
                  className="pc-btn pc-btn-primary"
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <Save size={17} />
                  {cargando ? "Guardando..." : "Guardar"}
                </button>
                <button
                  type="button"
                  className="pc-btn pc-btn-light"
                  onClick={resetFormulario}
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <X size={17} />
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="pc-card pc-table-wrapper">
          <table className="pc-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Marca</th>
                <th>Precio</th>
                <th>Oferta</th>
                <th>Destacado</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => {
                const tieneOferta =
                  Number(producto.precio_descuento) > 0 &&
                  Number(producto.precio_descuento) < Number(producto.precio);
                return (
                  <tr key={producto.id}>
                    <td>{producto.nombre}</td>
                    <td>{producto.categorias?.nombre || "Sin categoría"}</td>
                    <td>{producto.marca}</td>
                    <td>L {Number(producto.precio).toFixed(2)}</td>
                    <td>
                      {tieneOferta
                        ? `L ${Number(producto.precio_descuento).toFixed(2)}`
                        : "—"}
                    </td>
                    <td>{producto.destacado ? "Sí" : "No"}</td>
                    <td>{producto.stock}</td>
                    <td>
                      <button
                        type="button"
                        className="pc-btn pc-btn-light"
                        onClick={() => handleEditar(producto)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Pencil size={16} />
                        Editar
                      </button>
                      {esAdmin && (
                        <button
                          type="button"
                          className="pc-btn pc-btn-danger"
                          onClick={() => handleEliminar(producto.id)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            marginLeft: 8,
                          }}
                        >
                          <Trash2 size={16} />
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
