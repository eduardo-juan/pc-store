// ============================================================
// DOCUMENTACIÓN AMPLIADA
// Archivo: src/components/OfertaBadge.jsx
// Responsabilidad: Construye un componente reutilizable de PC Store.
// Criterio: mantener aquí solo la responsabilidad de este módulo y delegar operaciones compartidas a la capa correspondiente.
// ============================================================

export default function OfertaBadge({ producto }) {
  const precio = Number(producto?.precio || 0);
  const descuento = Number(producto?.precio_descuento || 0);

  if (!precio || !descuento || descuento >= precio) return null;

  const porcentaje = Math.round(((precio - descuento) / precio) * 100);

  return (
    <span className="pc-oferta-badge" aria-label={`Oferta, ${porcentaje}% de descuento`}>
      -{porcentaje}%
    </span>
  );
}
