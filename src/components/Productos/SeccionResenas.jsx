import { useEffect, useMemo, useState } from "react";
import { Star, ThumbsUp, Trash2, Pencil } from "lucide-react";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../hooks/useAuth";

const estrellas = [5, 4, 3, 2, 1];

function SelectorEstrellas({ valor, onChange }) {
  return (
    <div className="pc-star-picker-google" role="radiogroup" aria-label="Valoración">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" className={n <= valor ? "is-active" : ""} aria-label={`${n} estrellas`} aria-pressed={n === valor} onClick={() => onChange(n)}>
          <Star size={28} strokeWidth={2} fill={n <= valor ? "currentColor" : "none"} />
        </button>
      ))}
    </div>
  );
}

function EstrellasResena({ valor }) {
  return (
    <div className="pc-review-stars-google" aria-label={`${valor} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={17} strokeWidth={2} fill={n <= valor ? "currentColor" : "none"} />)}
    </div>
  );
}

export default function SeccionResenas({ productoId }) {
  const { usuario } = useAuth();
  const [resenas, setResenas] = useState([]);
  const [calificacion, setCalificacion] = useState(5);
  const [comentario, setComentario] = useState("");
  const [editando, setEditando] = useState(null);
  const [votos, setVotos] = useState(new Set());
  const [mensaje, setMensaje] = useState("");

  async function cargar() {
    const { data, error } = await supabase.from("reseñas").select("id, producto_id, usuario_id, calificación, comentario, útil_count, created_at, usuarios(nombre)").eq("producto_id", productoId).order("created_at", { ascending: false });
    if (!error) setResenas(data || []);
  }

  async function cargarVotos() {
    if (!usuario?.id) return setVotos(new Set());
    const { data } = await supabase.from("resenas_valoraciones").select("resena_id").eq("usuario_id", usuario.id);
    setVotos(new Set((data || []).map((v) => v.resena_id)));
  }

  useEffect(() => { cargar(); cargarVotos(); }, [productoId, usuario?.id]);

  const resumen = useMemo(() => {
    const total = resenas.length;
    const promedio = total ? resenas.reduce((s, r) => s + Number(r.calificación), 0) / total : 0;
    const conteos = Object.fromEntries(estrellas.map((n) => [n, resenas.filter((r) => Number(r.calificación) === n).length]));
    return { total, promedio, conteos };
  }, [resenas]);

  async function guardar(e) {
    e.preventDefault();
    if (!usuario) return setMensaje("Debes iniciar sesión para publicar una reseña.");
    if (!comentario.trim()) return setMensaje("Escribe un comentario antes de publicar.");
    const payload = { calificación: Number(calificacion), comentario: comentario.trim() };
    const query = editando ? supabase.from("reseñas").update(payload).eq("id", editando).eq("usuario_id", usuario.id) : supabase.from("reseñas").insert({ ...payload, producto_id: productoId, usuario_id: usuario.id });
    const { error } = await query;
    if (error) return setMensaje(error.code === "23505" ? "Ya tienes una reseña para este producto." : "No se pudo guardar la reseña.");
    setComentario(""); setCalificacion(5); setEditando(null); setMensaje(editando ? "Reseña actualizada." : "Reseña publicada."); await cargar();
  }

  async function eliminar(id) {
    const { error } = await supabase.from("reseñas").delete().eq("id", id).eq("usuario_id", usuario.id);
    if (error) return setMensaje("No se pudo eliminar la reseña.");
    setMensaje("Reseña eliminada."); await cargar();
  }

  async function marcarUtil(r) {
    if (!usuario) return setMensaje("Inicia sesión para marcar una reseña como útil.");
    if (votos.has(r.id)) return;
    const { error } = await supabase.from("resenas_valoraciones").insert({ resena_id: r.id, usuario_id: usuario.id, util: true });
    if (error) return setMensaje(error.code === "23505" ? "Ya marcaste esta reseña como útil." : "No se pudo registrar el voto.");
    setVotos((prev) => new Set([...prev, r.id]));
    await supabase.from("reseñas").update({ útil_count: Number(r.útil_count || 0) + 1 }).eq("id", r.id);
    await cargar();
  }

  return (
    <section className="pc-section pc-google-reviews">
      <div className="pc-google-reviews-heading">
        <h2 className="pc-section-title">Reseñas y valoraciones</h2>
        <span>{resumen.total} reseñas</span>
      </div>

      <div className="pc-card pc-review-summary pc-google-summary">
        <div className="pc-google-score"><strong>{resumen.promedio.toFixed(1)}</strong><span>sobre 5</span></div>
        <div className="pc-review-bars pc-google-bars">
          {estrellas.map((n) => {
            const porcentaje = resumen.total ? (resumen.conteos[n] / resumen.total) * 100 : 0;
            return <div key={n} className="pc-review-bar-row pc-google-bar-row"><span>{n}</span><div><i style={{ width: `${porcentaje}%` }} /></div><small>{resumen.conteos[n]}</small></div>;
          })}
        </div>
      </div>

      {usuario && (
        <form className="pc-card pc-review-form pc-google-form" onSubmit={guardar}>
          <div className="pc-google-form-heading"><h3>{editando ? "Editar mi reseña" : "Escribe una reseña"}</h3><p>Comparte tu experiencia con otros clientes.</p></div>
          <SelectorEstrellas valor={calificacion} onChange={setCalificacion} />
          <textarea className="pc-textarea pc-google-textarea" rows="4" maxLength={500} placeholder="Cuéntanos tu experiencia..." value={comentario} onChange={(e) => setComentario(e.target.value)} required />
          <div className="pc-google-counter">{comentario.length}/500</div>
          {mensaje && <div className="pc-message">{mensaje}</div>}
          <div className="pc-review-actions pc-google-actions"><button className="pc-btn pc-btn-primary" type="submit">{editando ? "Guardar cambios" : "Publicar reseña"}</button>{editando && <button className="pc-btn pc-btn-light" type="button" onClick={() => { setEditando(null); setComentario(""); setCalificacion(5); }}>Cancelar</button>}</div>
        </form>
      )}

      <div className="pc-review-list pc-google-list">
        {resenas.map((r) => (
          <article key={r.id} className="pc-card pc-review pc-google-review">
            <div className="pc-google-review-top"><div className="pc-google-avatar">{(r.usuarios?.nombre || "C").charAt(0).toUpperCase()}</div><div className="pc-google-review-user"><strong>{r.usuarios?.nombre || "Cliente"}</strong><span>{new Date(r.created_at).toLocaleDateString()}</span></div></div>
            <EstrellasResena valor={Number(r.calificación)} />
            <p>{r.comentario}</p>
            <div className="pc-review-footer pc-google-review-footer">
              <button type="button" className={`pc-review-useful pc-google-useful ${votos.has(r.id) ? "is-voted" : ""}`} onClick={() => marcarUtil(r)} disabled={votos.has(r.id)}><ThumbsUp size={15} /> Útil · {Number(r.útil_count || 0)}</button>
              {usuario?.id === r.usuario_id && <><button type="button" className="pc-review-useful pc-google-useful" onClick={() => { setEditando(r.id); setCalificacion(Number(r.calificación)); setComentario(r.comentario); document.querySelector(".pc-review-form")?.scrollIntoView({ behavior: "smooth", block: "center" }); }}><Pencil size={15} /> Editar</button><button type="button" className="pc-review-useful pc-google-useful danger" onClick={() => eliminar(r.id)}><Trash2 size={15} /> Eliminar</button></>}
            </div>
          </article>
        ))}
        {!resenas.length && <div className="pc-empty-small pc-google-empty">Este producto todavía no tiene reseñas. Sé el primero en compartir tu opinión.</div>}
      </div>
    </section>
  );
}
