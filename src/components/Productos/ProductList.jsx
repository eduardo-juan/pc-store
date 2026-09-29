// ============================================================
// DOCUMENTACIÓN AMPLIADA
// Archivo: src/components/Productos/ProductList.jsx
// Responsabilidad: Gestiona presentación, detalle, carrito o reseñas de productos.
// Criterio: mantener aquí solo la responsabilidad de este módulo y delegar operaciones compartidas a la capa correspondiente.
// ============================================================

// Módulo reutilizable que concentra la lógica y presentación de esta funcionalidad.
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import ProductCard from "./ProductCard";

// Propósito del componente: centraliza la lógica principal de este módulo.
export default function ProductList({ categoria = null }) {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarProductos();
  }, [categoria]);

  const cargarProductos = async () => {
    setCargando(true);
    let query = supabase.from("productos").select("id,nombre,categoria_id,descripción,especificaciones,precio,precio_descuento,stock,imagen_principal,imágenes_adicionales,modelo,marca,garantía_meses,activo,destacado,created_at,updated_at");

    if (categoria) {
      query = query.eq("categoria_id", categoria);
    }

    const { data } = await query;
    setProductos(data || []);
    setCargando(false);
  };

  if (cargando) return <div>Cargando...</div>;

  // Renderizado principal: muestra la información y acciones disponibles para el usuario.
  return (
    <div className="pc-product-grid">
      {productos.map((p) => (
        <ProductCard key={p.id} producto={p} />
      ))}
    </div>
  );
}
