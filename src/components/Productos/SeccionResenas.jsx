import { useEffect, useMemo, useState } from 'react'
import { Star, ThumbsUp, Trash2, Pencil } from 'lucide-react'
import { supabase } from '../../supabaseClient'
import { useAuth } from '../../hooks/useAuth'

const estrellas = [5, 4, 3, 2, 1]

export default function SeccionResenas({ productoId }) {
  const { usuario } = useAuth()
  const [resenas, setResenas] = useState([])
  const [calificacion, setCalificacion] = useState(5)
  const [comentario, setComentario] = useState('')
  const [editando, setEditando] = useState(null)
  const [votos, setVotos] = useState(new Set())
  const [mensaje, setMensaje] = useState('')

  async function cargar() {
    const { data, error } = await supabase
      .from('reseñas')
      .select('id, producto_id, usuario_id, calificación, comentario, útil_count, created_at, usuarios(nombre, avatar_url)')
      .eq('producto_id', productoId)
      .order('created_at', { ascending: false })
    if (!error) setResenas(data || [])
  }

  async function cargarVotos() {
    if (!usuario?.id) return setVotos(new Set())
    const { data } = await supabase
      .from('resenas_valoraciones')
      .select('resena_id')
      .eq('usuario_id', usuario.id)
    setVotos(new Set((data || []).map(v => v.resena_id)))
  }

  useEffect(() => { cargar(); cargarVotos() }, [productoId, usuario?.id])

  const resumen = useMemo(() => {
    const total = resenas.length
    const promedio = total ? resenas.reduce((s, r) => s + Number(r.calificación), 0) / total : 0
    const conteos = Object.fromEntries(estrellas.map(n => [n, resenas.filter(r => Number(r.calificación) === n).length]))
    return { total, promedio, conteos }
  }, [resenas])

  async function guardar(e) {
    e.preventDefault()
    if (!usuario) return setMensaje('Debes iniciar sesión para publicar una reseña.')
    if (!comentario.trim()) return setMensaje('Escribe un comentario antes de publicar.')
    const payload = { calificación: Number(calificacion), comentario: comentario.trim() }
    const query = editando
      ? supabase.from('reseñas').update(payload).eq('id', editando).eq('usuario_id', usuario.id)
      : supabase.from('reseñas').insert({ ...payload, producto_id: productoId, usuario_id: usuario.id })
    const { error } = await query
    if (error) {
      setMensaje(error.code === '23505' ? 'Ya tienes una reseña para este producto.' : 'No se pudo guardar la reseña.')
      return
    }
    setComentario('')
    setCalificacion(5)
    setEditando(null)
    setMensaje(editando ? 'Reseña actualizada.' : 'Reseña publicada.')
    await cargar()
  }

  async function eliminar(id) {
    const { error } = await supabase.from('reseñas').delete().eq('id', id).eq('usuario_id', usuario.id)
    if (error) return setMensaje('No se pudo eliminar la reseña.')
    setMensaje('Reseña eliminada.')
    await cargar()
  }

  async function marcarUtil(r) {
    if (!usuario) return setMensaje('Inicia sesión para marcar una reseña como útil.')
    if (votos.has(r.id)) return
    const { error } = await supabase.from('resenas_valoraciones').insert({ resena_id: r.id, usuario_id: usuario.id, util: true })
    if (error) return setMensaje(error.code === '23505' ? 'Ya marcaste esta reseña como útil.' : 'No se pudo registrar el voto.')
    setVotos(prev => new Set([...prev, r.id]))
    await supabase.from('reseñas').update({ útil_count: Number(r.útil_count || 0) + 1 }).eq('id', r.id)
    await cargar()
  }

  return (
    <section className="pc-section pc-reviews-store">
      <div className="pc-reviews-header">
        <div>
          <h2 className="pc-section-title">Reseñas</h2>
          <p>Opiniones de clientes sobre este producto.</p>
        </div>
        <span className="pc-reviews-count">{resumen.total} reseñas</span>
      </div>

      <div className="pc-card pc-reviews-summary-store">
        <div className="pc-reviews-score-store">
          <strong>{resumen.promedio.toFixed(1)}</strong>
          <div className="pc-review-stars">{[1,2,3,4,5].map(n => <Star key={n} size={20} fill={n <= Math.round(resumen.promedio) ? '#d4af37' : 'none'} />)}</div>
          <span>Promedio de valoración</span>
        </div>
        <div className="pc-reviews-bars-store">
          {estrellas.map(n => <div key={n} className="pc-review-bar-store"><span>{n}</span><Star size={14} fill="#d4af37"/><div><i style={{ width: `${resumen.total ? (resumen.conteos[n] / resumen.total) * 100 : 0}%` }} /></div><small>{resumen.conteos[n]}</small></div>)}
        </div>
      </div>

      {usuario && <form className="pc-card pc-review-form-store" onSubmit={guardar}>
        <div className="pc-review-form-heading-store"><Star size={21}/><div><h3>{editando ? 'Editar mi reseña' : 'Escribe una reseña'}</h3><p>Comparte tu experiencia con otros clientes.</p></div></div>
        <div className="pc-review-star-picker" role="radiogroup" aria-label="Valoración">
          {[1,2,3,4,5].map(n => <button className={n <= calificacion ? 'is-active' : ''} key={n} type="button" aria-label={`${n} estrellas`} onClick={() => setCalificacion(n)}><Star size={24} fill={n <= calificacion ? '#d4af37' : 'none'} /></button>)}
        </div>
        <div className="pc-review-input-wrap"><textarea className="pc-textarea" rows="4" maxLength="1000" placeholder="Cuéntanos tu experiencia..." value={comentario} onChange={e => setComentario(e.target.value)} required/><span>{comentario.length}/1000</span></div>
        {mensaje && <div className="pc-message">{mensaje}</div>}
        <div className="pc-review-actions-store"><button className="pc-btn pc-btn-primary" type="submit">{editando ? 'Guardar cambios' : 'Publicar reseña'}</button>{editando && <button className="pc-btn pc-btn-light" type="button" onClick={() => { setEditando(null); setComentario(''); setCalificacion(5) }}>Cancelar</button>}</div>
      </form>}

      <div className="pc-reviews-list-store">
        {resenas.map(r => <article key={r.id} className="pc-card pc-review-store">
          <div className="pc-review-user-store">
            {r.usuarios?.avatar_url ? (
              <img className="pc-review-avatar-store" src={r.usuarios.avatar_url} alt={`Perfil de ${r.usuarios?.nombre || 'cliente'}`} />
            ) : (
              <div className="pc-review-avatar-store pc-review-avatar-fallback">{(r.usuarios?.nombre || 'C').charAt(0).toUpperCase()}</div>
            )}
            <div><strong>{r.usuarios?.nombre || 'Cliente'}</strong><span>{new Date(r.created_at).toLocaleDateString()}</span></div>
          </div>
          <div className="pc-review-stars">{[1,2,3,4,5].map(n => <Star key={n} size={18} fill={n <= Number(r.calificación) ? '#d4af37' : 'none'} />)}</div>
          <p className="pc-review-comment-store">{r.comentario}</p>
          <div className="pc-review-footer-store"><button type="button" className={`pc-review-useful ${votos.has(r.id) ? 'is-voted' : ''}`} onClick={() => marcarUtil(r)} disabled={votos.has(r.id)}><ThumbsUp size={15}/> Útil ({Number(r.útil_count || 0)})</button>{usuario?.id === r.usuario_id && <><button type="button" className="pc-review-action-store" onClick={() => { setEditando(r.id); setCalificacion(Number(r.calificación)); setComentario(r.comentario); window.scrollTo({ top: document.querySelector('.pc-review-form-store')?.getBoundingClientRect().top + window.scrollY - 100 || 0, behavior: 'smooth' }) }}><Pencil size={15}/> Editar</button><button type="button" className="pc-review-action-store danger" onClick={() => eliminar(r.id)}><Trash2 size={15}/> Eliminar</button></>}</div>
        </article>)}
        {!resenas.length && <div className="pc-reviews-empty-store">Este producto todavía no tiene reseñas.</div>}
      </div>
    </section>
  )
}
