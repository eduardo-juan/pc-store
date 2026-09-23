import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import ProductCard from "./ProductCard";

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

  return (
    <div className="pc-product-grid">
      {productos.map((p) => (
        <ProductCard key={p.id} producto={p} />
      ))}
    </div>
  );
}
