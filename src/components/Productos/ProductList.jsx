import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import ProductCard from './ProductCard'

export default function ProductList({ categoria = null }) {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarProductos()
  }, [categoria])

  const cargarProductos = async () => {
    setCargando(true)
    let query = supabase.from('productos').select('*')

    if (categoria) {
      query = query.eq('categoria_id', categoria)
    }

    const { data } = await query
    setProductos(data || [])
    setCargando(false)
  }

  if (cargando) return <div>Cargando...</div>

  return (
    <div className="pc-product-grid">
      {productos.map((p) => (
        <ProductCard key={p.id} producto={p} />
      ))}
    </div>
  )
}