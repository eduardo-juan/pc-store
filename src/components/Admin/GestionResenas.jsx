import { useEffect, useState } from 'react'
import { Star, Trash2 } from 'lucide-react'
import { supabase } from '../../supabaseClient'
import BotonAtras from '../BotonAtras'

export default function GestionResenas() {
  const [resenas, setResenas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState('')

  async function cargar() {
    setCargando(true)
    const { data, error } = await supabase
      .from('reseñas')
      .select('id, producto_id, usuario_id, calificación, comentario, útil_count, created_at, productos(nombre), usuarios(nombre, email)')
      .order('created_at', { ascending: false })
    if (error) setMensaje('No se pudieron cargar las reseñas.')
    setResenas(data || [])
    setCargando(false)
  }

  useEffect(() => { cargar() }, [])

  async function eliminar(id) {
    if (!window.confirm('¿Eliminar esta reseña?')) return
    const { error } = await supabase.from('reseñas').delete().eq('id', id)
    if (error) return setMensaje('No se pudo eliminar la reseña.')
    setMensaje('Reseña eliminada.')
    cargar()
  }

  return (
    <main className="pc-page">
      <div className="pc-container">
        <BotonAtras />
        <div className="pc-page-heading">
          <div><span className="pc-kicker">Administración</span><h1>Reseñas</h1><p>Modera y consulta las valoraciones de los clientes.</p></div>
        </div>
        {mensaje && <div className="pc-message">{mensaje}</div>}
        {cargando ? <div className="pc-loader" /> : !resenas.length ? <div className="pc-empty-small">No hay reseñas.</div> : (
          <div className="pc-admin-table-wrap">
            <table className="pc-admin-table">
              <thead><tr><th>Producto</th><th>Cliente</th><th>Valoración</th><th>Comentario</th><th>Fecha</th><th>Acción</th></tr></thead>
              <tbody>{resenas.map((r) => (
                <tr key={r.id}>
                  <td>{r.productos?.nombre || r.producto_id}</td>
                  <td>{r.usuarios?.nombre || r.usuarios?.email || 'Usuario'}</td>
                  <td><span className="pc-review-stars">{[1,2,3,4,5].map(n => <Star key={n} size={16} fill={n <= r.calificación ? '#d4af37' : 'none'} />)}</span></td>
                  <td>{r.comentario}</td>
                  <td>{new Date(r.created_at).toLocaleDateString()}</td>
                  <td><button type="button" className="pc-btn pc-btn-light" onClick={() => eliminar(r.id)}><Trash2 size={16} /> Eliminar</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
