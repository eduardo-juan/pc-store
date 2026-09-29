// Importa y prepara las dependencias necesarias para construir esta vista o componente.
import { useState } from 'react'
import { useCarrito } from '../../context/CarritoContext'

// Propósito del componente: centraliza la lógica y presentación principal de este módulo.
export default function ProductCard({ producto }) {
  const [cantidad, setCantidad] = useState(1)
  const { agregarProducto } = useCarrito()

  const handleAgregar = () => {
    agregarProducto(producto, cantidad)
    setCantidad(1)
  }

  // Renderizado principal: muestra la información y acciones que corresponden a este módulo.
  return (
    <div className="pc-product-card">
      <img src={producto.imagen_principal || producto.imagen_url || ""} alt={producto.nombre} />
      <h3>{producto.nombre}</h3>
      <p>{producto.marca}</p>
      <div className="pc-price">
        L {Number(producto.precio).toFixed(2)}
      </div>
      <input
        type="number"
        min="1"
        value={cantidad}
        onChange={(e) => setCantidad(parseInt(e.target.value))}
      />
      <button onClick={handleAgregar}>
        Agregar al carrito
      </button>
    </div>
  )
}
