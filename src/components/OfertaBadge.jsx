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
