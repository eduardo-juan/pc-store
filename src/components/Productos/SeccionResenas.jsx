import { useEffect, useMemo, useState } from 'react'
import { Star, ThumbsUp, Trash2, Pencil, MessageSquare, Send } from 'lucide-react'
import { supabase } from '../../supabaseClient'
import { useAuth } from '../../hooks/useAuth'

const estrellas = [5, 4, 3, 2, 1]

function Estrellas({ valor, tamaño = 20, selector = false, onChange }) {
  return <div className={selector ? 'pc-star-picker' : 'pc-review-stars'}>
    {[1, 2, 3, 4, 5].map(n => selector ? <button key={n} type="button" className={`pc-star-button ${n <= valor ? 'is-active' : ''}`} aria-label={`${n} estrellas`} onClick={() => onChange(n)}><Star size={28} strokeWidth={2.2} fill={n <= valor ? 'currentColor' : 'none'} /></button> : <span key={n} className="pc-review-star"><Star size={tamaño} strokeWidth={2} fill={n <= valor ? 'currentColor' : 'none'} /></span>)}
  </div>
}

export default function SeccionResenas({ productoId }) {
  const { usuario } = useAuth()
  const [resenas, setResenas] = useState([])
  const [calificacion, setCalificacion] = useState(5)
  const [comentario, setComentario] = useState('')
  const [editando, setEditando] = useState(null)
  const [votos, setVotos] = useState(new Set())
  const [mensaje, setMensaje] = useState('')
  async function cargar() { const { data } = await supabase.from('reseñas').select('id, producto_id, usuario_id, calificación, comentario, útil_count, created_at, usuarios(nombre)').eq('producto_id', productoId).order('created_at', { ascending: false }); setResenas(data || []) }
  async function cargarVotos() { if (!usuario?.id) return setVotos(new Set()); const { data } = await supabase.from('resenas_valoraciones').select('resena_id').eq('usuario_id', usuario.id); setVotos(new Set((data || []).map(v => v.resena_id))) }
  useEffect(() => { cargar(); cargarVotos() }, [productoId, usuario?.id])
  const resumen = useMemo(() => { const total = resenas.length; const promedio = total ? resenas.reduce((s, r) => s + Number(r.calificación), 0) / total : 0; const conteos = Object.fromEntries(estrellas.map(n => [n, resenas.filter(r => Number(r.calificación) === n).length])); return { total, promedio, conteos } }, [resenas])
  async function guardar(e) { e.preventDefault(); if (!usuario) return setMensaje('Debes iniciar sesión para publicar una reseña.'); if (!comentario.trim()) return setMensaje('Escribe un comentario antes de publicar.'); const payload = { calificación: Number(calificacion), comentario: comentario.trim() }; const query = editando ? supabase.from('reseñas').update(payload).eq('id', editando).eq('usuario_id', usuario.id) : supabase.from('reseñas').insert({ ...payload, producto_id: productoId, usuario_id: usuario.id }); const { error } = await query; if (error) return setMensaje(error.code === '23505' ? 'Ya tienes una reseña para este producto.' : 'No se pudo guardar la reseña.'); setComentario(''); setCalificacion(5); setEditando(null); setMensaje(editando ? 'Reseña actualizada.' : 'Reseña publicada.'); await cargar() }
  async function eliminar(id) { const { error } = await supabase.from('reseñas').delete().eq('id', id).eq('usuario_id', usuario.id); if (error) return setMensaje('No se pudo eliminar la reseña.'); setMensaje('Reseña eliminada.'); await cargar() }
  async function marcarUtil(r) { if (!usuario) return setMensaje('Inicia sesión para marcar una reseña como útil.'); if (votos.has(r.id)) return; const { error } = await supabase.from('resenas_valoraciones').insert({ resena_id: r.id, usuario_id: usuario.id, util: true }); if (error) return setMensaje(error.code === '23505' ? 'Ya marcaste esta reseña como útil.' : 'No se pudo registrar el voto.'); setVotos(prev => new Set([...prev, r.id])); await supabase.from('reseñas').update({ útil_count: Number(r.útil_count || 0) + 1 }).eq('id', r.id); await cargar() }

  return <section className="pc-section pc-reviews-modern">
    <div className="pc-reviews-summary-card">
      <div className="pc-reviews-title"><Star size={28} /><h2>Reseñas</h2></div>
      <div className="pc-reviews-summary-grid"><div className="pc-review-average-modern"><strong>{resumen.promedio.toFixed(1)}</strong><span>de 5</span><small>Basado en {resumen.total} reseñas</small></div><div className="pc-review-bars-modern">{estrellas.map(n => <div key={n} className="pc-review-bar-row-modern"><span>{n}</span><div><i style={{ width: `${resumen.total ? (resumen.conteos[n] / resumen.total) * 100 : 0}%` }} /></div><small>{resumen.total ? Math.round((resumen.conteos[n] / resumen.total) * 100) : 0}%</small></div>)}</div></div>
    </div>
    {resenas.map(r => <article key={r.id} className="pc-review-modern-card"><div className="pc-review-avatar">{(r.usuarios?.nombre || 'C').charAt(0).toUpperCase()}</div><div className="pc-review-content"><div className="pc-review-head"><div><strong>{r.usuarios?.nombre || 'Cliente'}</strong><span>{new Date(r.created_at).toLocaleDateString()}</span></div></div><Estrellas valor={Number(r.calificación)} /><p>{r.comentario}</p><div className="pc-review-footer"><button type="button" className="pc-useful-button" onClick={() => marcarUtil(r)} disabled={votos.has(r.id)}><ThumbsUp size={16} /> Útil ({Number(r.útil_count || 0)})</button>{usuario?.id === r.usuario_id && <><button type="button" className="pc-review-link" onClick={() => { setEditando(r.id); setCalificacion(Number(r.calificación)); setComentario(r.comentario); document.querySelector('.pc-review-form-modern')?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }}><Pencil size={15} /> Editar</button><button type="button" className="pc-review-link danger" onClick={() => eliminar(r.id)}><Trash2 size={15} /> Eliminar</button></>}</div></div></article>)}
    {!resenas.length && <div className="pc-empty-small pc-review-empty">Aún no hay reseñas para este producto.</div>}
    {usuario && <form className="pc-review-form-modern" onSubmit={guardar}><div className="pc-review-form-title"><MessageSquare size={27} /><div><h3>{editando ? 'Editar mi reseña' : 'Escribe una reseña'}</h3><span>Tu opinión ayuda a otros clientes a tomar una mejor decisión.</span></div></div><Estrellas valor={calificacion} selector onChange={setCalificacion} /><div className="pc-review-textarea-wrap"><textarea rows="5" maxLength={500} placeholder="Comparte tu experiencia con este producto..." value={comentario} onChange={e => setComentario(e.target.value)} required /><span>{comentario.length}/500</span></div>{mensaje && <div className="pc-message">{mensaje}</div>}<div className="pc-review-submit-row"><button className="pc-review-publish" type="submit"><Send size={17} /> {editando ? 'Guardar cambios' : 'Publicar reseña'}</button>{editando && <button className="pc-review-cancel" type="button" onClick={() => { setEditando(null); setComentario(''); setCalificacion(5) }}>Cancelar</button>}</div></form>}
  </section>
}
