import { useState } from 'react'
import { useCarrito } from '../context/CarritoContext'

export default function ProductCard({ producto }) {
  const [cantidad, setCantidad] = useState(1)
  const { agregarAlCarrito } = useCarrito()

  const handleAgregar = () => {
    agregarAlCarrito(producto, cantidad)
    setCantidad(1)
  }

  return (
    <div className="pc-product-card">
      <img src={producto.imagen_url} alt={producto.nombre} />
      <h3>{producto.nombre}</h3>
      <p>{producto.marca}</p>
      <div className="pc-price">L {Number(producto.precio).toFixed(2)}</div>
      <input
        type="number"
        min="1"
        value={cantidad}
        onChange={(e) => setCantidad(parseInt(e.target.value))}
      />
      <button onClick={handleAgregar}>Agregar al carrito</button>
    </div>
  )
}
