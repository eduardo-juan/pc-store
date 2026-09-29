// ============================================================
// DOCUMENTACIÓN AMPLIADA
// Archivo: src/components/Admin/GestionCategorias.jsx
// Responsabilidad: Gestiona una función del panel administrativo, con su interfaz, estado, validaciones y operaciones de datos.
// Criterio: mantener aquí solo la responsabilidad de este módulo y delegar operaciones compartidas a la capa correspondiente.
// ============================================================

import { useEffect, useState, useRef } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import BotonAtras from "../../components/BotonAtras";

// Limpia el nombre de la categoría y limita su longitud.
const limpiarNombreCategoria = (valor = "") =>
  String(valor)
    .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ\s_-]/g, "")
    .slice(0, 80);

// Limita la descripción para evitar textos demasiado extensos.    
const limpiarDescripcion = (valor = "") => String(valor).slice(0, 250);

export default function GestionCategorias() {
  const { esAdmin } = useAuth();

// Almacena las categorías disponibles en el catálogo.  
  const [categorias, setCategorias] = useState([]);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState("");
  const formularioRef = useRef(null);

// Carga las categorías automáticamente al abrir el módulo.  
  useEffect(() => {
    cargarCategorias();
  }, []);

// Obtiene desde Supabase todas las categorías ordenadas por nombre.  
  const cargarCategorias = async () => {
    setError("");
    const { data, error } = await supabase
      .from("categorias")
      .select("*")
      .order("nombre");
    if (error) {
      setError(error.message);
      return;
    }
    setCategorias(data || []);
  };

// Lleva el formulario a la vista cuando se selecciona una categoría para editar.  
  const desplazarAlFormulario = () => {
    window.requestAnimationFrame(() =>
      formularioRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      }),
    );
  };

// Crea una nueva categoría o actualiza la categoría que se encuentra en edición.  
  const guardarCategoria = async (e) => {
    e.preventDefault();
    setError("");
    const nombreLimpio = nombre.trim();
    const descripcionLimpia = descripcion.trim();
    if (!nombreLimpio) {
      setError("Debes ingresar un nombre para la categoría.");
      return;
    }
    const datos = { nombre: nombreLimpio, descripción: descripcionLimpia };
    const resultado = editandoId
      ? await supabase.from("categorias").update(datos).eq("id", editandoId)
      : await supabase.from("categorias").insert([datos]);
    if (resultado.error) {
      setError(resultado.error.message);
      return;
    }
    limpiarFormulario();
    await cargarCategorias();
  };

// Carga los datos de la categoría seleccionada dentro del formulario.  
  const editarCategoria = (categoria) => {
    setEditandoId(categoria.id);
    setNombre(limpiarNombreCategoria(categoria.nombre || ""));
    setDescripcion(limpiarDescripcion(categoria.descripción || ""));
    setError("");
    desplazarAlFormulario();
  };

// Elimina una categoría después de verificar permisos y confirmar la acción.  
  const eliminarCategoria = async (id) => {
    if (!esAdmin) {
      setError("No tienes permiso para eliminar categorías.");
      return;
    }
    if (!window.confirm("¿Deseas eliminar esta categoría?")) return;
    setError("");
    const { error } = await supabase.from("categorias").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    await cargarCategorias();
  };

// Restablece el formulario y finaliza el modo de edición.  
  const limpiarFormulario = () => {
    setNombre("");
    setDescripcion("");
    setEditandoId(null);
  };

  return (
    <main className="pc-page">
      <div className="pc-container">
        <BotonAtras />
        <div className="pc-admin-header">
          <h1>Gestión de Categorías</h1>
          <p>Crea y organiza las categorías del catálogo.</p>
        </div>

        <div
          ref={formularioRef}
          className="pc-card"
          style={{ padding: 22, marginBottom: 24, scrollMarginTop: 24 }}
        >
          <form className="pc-form-grid" onSubmit={guardarCategoria}>
            <label>
              Nombre de categoría <span style={{ color: "#dc2626" }}>*</span>
              <input
                className="pc-input"
                placeholder="Nombre de categoría"
                maxLength={80}
                value={nombre}
                onChange={(e) =>
                  setNombre(limpiarNombreCategoria(e.target.value))
                }
                required
              />
            </label>
            <label>
              Descripción
              <input
                className="pc-input"
                placeholder="Descripción"
                maxLength={250}
                value={descripcion}
                onChange={(e) =>
                  setDescripcion(limpiarDescripcion(e.target.value))
                }
              />
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="pc-btn pc-btn-primary"
                type="submit"
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <Plus size={17} />
                {editandoId ? "Actualizar" : "Crear categoría"}
              </button>
              {editandoId && (
                <button
                  className="pc-btn pc-btn-light"
                  type="button"
                  onClick={limpiarFormulario}
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <X size={17} />
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {error && (
          <div
            className="pc-card"
            style={{ padding: 16, marginBottom: 20, color: "#dc2626" }}
          >
            {error}
          </div>
        )}

        <div className="pc-card pc-table-wrapper">
          <table className="pc-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>

// Muestra las categorías registradas junto con sus acciones administrativas.
              {categorias.map((categoria) => (
                <tr key={categoria.id}>
                  <td>{categoria.id}</td>
                  <td>{categoria.nombre}</td>
                  <td>{categoria.descripción}</td>
                  <td>

// Permite cargar la categoría seleccionada para modificar sus datos.
                    <button
                      type="button"
                      className="pc-btn pc-btn-light"
                      onClick={() => editarCategoria(categoria)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Pencil size={16} />
                      Editar
                    </button>

// La eliminación está disponible únicamente para usuarios administradores.
                    {esAdmin && (
                      <button
                        type="button"
                        className="pc-btn pc-btn-danger"
                        onClick={() => eliminarCategoria(categoria.id)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Trash2 size={16} />
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {categorias.length === 0 && (
                <tr>
                  <td colSpan="4">No existen categorías.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
