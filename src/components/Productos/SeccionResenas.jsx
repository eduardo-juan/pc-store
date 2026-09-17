import { useEffect, useMemo, useState } from "react";
import {
  Star,
  ThumbsUp,
  Pencil,
  Trash2,
} from "lucide-react";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../hooks/useAuth";

function Estrellas({ valor, tamaño = 17 }) {
  return (
    <div className="pc-review-stars" aria-label={`${valor} estrellas`}>
      {[1, 2, 3, 4, 5].map((numero) => (
        <Star
          key={numero}
          size={tamaño}
          fill={numero <= valor ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
}

function tiempoRelativo(fecha) {
  const ahora = new Date();
  const fechaResena = new Date(fecha);
  const segundos = Math.floor(
    (ahora - fechaResena) / 1000
  );

  if (segundos < 60) return "Hace unos segundos";

  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) {
    return `Hace ${minutos} ${
      minutos === 1 ? "minuto" : "minutos"
    }`;
  }

  const horas = Math.floor(minutos / 60);
  if (horas < 24) {
    return `Hace ${horas} ${
      horas === 1 ? "hora" : "horas"
    }`;
  }

  const dias = Math.floor(horas / 24);
  if (dias < 30) {
    return `Hace ${dias} ${
      dias === 1 ? "día" : "días"
    }`;
  }

  const meses = Math.floor(dias / 30);

  if (meses < 12) {
    return `Hace ${meses} ${
      meses === 1 ? "mes" : "meses"
    }`;
  }

  const años = Math.floor(meses / 12);

  return `Hace ${años} ${
    años === 1 ? "año" : "años"
  }`;
}

export default function SeccionResenas({ productoId }) {
  const { usuario } = useAuth();

  const [resenas, setResenas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [calificacion, setCalificacion] = useState(5);
  const [comentario, setComentario] = useState("");

  const [editando, setEditando] = useState(null);
  const [mensaje, setMensaje] = useState("");

  async function cargarResenas() {
    setCargando(true);

    const { data, error } = await supabase
      .from("reseñas")
      .select(`
        id,
        producto_id,
        usuario_id,
        calificación,
        comentario,
        útil_count,
        created_at,
        usuarios (
          nombre
        )
      `)
      .eq("producto_id", productoId)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(error);
      setResenas([]);
      setMensaje("No se pudieron cargar las reseñas.");
    } else {
      setResenas(data || []);
    }

    setCargando(false);
  }

  useEffect(() => {
    if (productoId) {
      cargarResenas();
    }
  }, [productoId]);

  const resumen = useMemo(() => {
    if (!resenas.length) {
      return {
        promedio: 0,
        total: 0,
        porcentajes: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
      };
    }

    const total = resenas.length;

    const promedio =
      resenas.reduce(
        (totalActual, resena) =>
          totalActual + Number(resena.calificación),
        0
      ) / total;

    const porcentajes = {};

    [5, 4, 3, 2, 1].forEach((numero) => {
      const cantidad = resenas.filter(
        (resena) =>
          Number(resena.calificación) === numero
      ).length;

      porcentajes[numero] =
        (cantidad / total) * 100;
    });

    return {
      promedio,
      total,
      porcentajes,
    };
  }, [resenas]);

  async function guardarResena(e) {
    e.preventDefault();

    if (!usuario) {
      setMensaje(
        "Debes iniciar sesión para publicar una reseña."
      );
      return;
    }

    if (!comentario.trim()) {
      setMensaje("Escribe un comentario.");
      return;
    }

    if (editando) {
      const { error } = await supabase
        .from("reseñas")
        .update({
          calificación: calificacion,
          comentario: comentario.trim(),
        })
        .eq("id", editando)
        .eq("usuario_id", usuario.id);

      if (error) {
        console.error(error);
        setMensaje(
          "No se pudo actualizar la reseña."
        );
        return;
      }

      setMensaje("Reseña actualizada.");
    } else {
      const { error } = await supabase
        .from("reseñas")
        .insert({
          producto_id: productoId,
          usuario_id: usuario.id,
          calificación: calificacion,
          comentario: comentario.trim(),
          útil_count: 0,
        });

      if (error) {
        console.error(error);

        if (error.code === "23505") {
          setMensaje(
            "Ya tienes una reseña para este producto."
          );
        } else {
          setMensaje(
            "No se pudo publicar la reseña."
          );
        }

        return;
      }

      setMensaje("Reseña publicada.");
    }

    setComentario("");
    setCalificacion(5);
    setEditando(null);

    await cargarResenas();
  }

  function editarResena(resena) {
    setEditando(resena.id);
    setCalificacion(
      Number(resena.calificación)
    );
    setComentario(resena.comentario || "");
    setMensaje("");
  }

  function cancelarEdicion() {
    setEditando(null);
    setComentario("");
    setCalificacion(5);
    setMensaje("");
  }

  async function eliminarResena(id) {
    if (!usuario) return;

    const confirmar = window.confirm(
      "¿Quieres eliminar esta reseña?"
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("reseñas")
      .delete()
      .eq("id", id)
      .eq("usuario_id", usuario.id);

    if (error) {
      console.error(error);
      setMensaje(
        "No se pudo eliminar la reseña."
      );
      return;
    }

    setMensaje("Reseña eliminada.");

    await cargarResenas();
  }

  async function marcarUtil(resena) {
    if (!usuario) {
      setMensaje(
        "Debes iniciar sesión para marcar una reseña como útil."
      );
      return;
    }

    const nuevoCount =
      Number(resena.útil_count || 0) + 1;

    const { error } = await supabase
      .from("reseñas")
      .update({
        útil_count: nuevoCount,
      })
      .eq("id", resena.id);

    if (error) {
      console.error(error);
      setMensaje(
        "No se pudo registrar el voto."
      );
      return;
    }

    await cargarResenas();
  }

  return (
    <section className="pc-reviews">

      {/* CABECERA */}
      <div className="pc-reviews-header">
        <div>
          <h2>Reseñas y opiniones</h2>

          <p>
            Opiniones de clientes que han visto
            este producto.
          </p>
        </div>
      </div>

      {/* RESUMEN */}
      <div className="pc-reviews-summary">

        <div className="pc-review-average">
          <strong>
            {resumen.promedio
              ? resumen.promedio.toFixed(1)
              : "0.0"}
          </strong>

          <Estrellas
            valor={Math.round(
              resumen.promedio
            )}
            tamaño={20}
          />

          <span>
            {resumen.total}{" "}
            {resumen.total === 1
              ? "reseña"
              : "reseñas"}
          </span>
        </div>

        <div className="pc-review-distribution">
          {[5, 4, 3, 2, 1].map((numero) => (
            <div
              className="pc-review-distribution-row"
              key={numero}
            >
              <span>{numero}</span>

              <Star
                size={15}
                fill="currentColor"
              />

              <div className="pc-review-progress">
                <div
                  style={{
                    width: `${resumen.porcentajes[numero]}%`,
                  }}
                />
              </div>

              <span>
                {Math.round(
                  resumen.porcentajes[numero]
                )}%
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* FORMULARIO */}
      <div className="pc-reviews-form">

        <h3>
          {editando
            ? "Editar tu reseña"
            : "Escribe una reseña"}
        </h3>

        <form onSubmit={guardarResena}>

          <div className="pc-review-rating-selector">
            <span>Tu valoración</span>

            <div>
              {[1, 2, 3, 4, 5].map(
                (numero) => (
                  <button
                    key={numero}
                    type="button"
                    onClick={() =>
                      setCalificacion(numero)
                    }
                    className={
                      numero <= calificacion
                        ? "pc-star-active"
                        : "pc-star-inactive"
                    }
                    aria-label={`${numero} estrellas`}
                  >
                    <Star
                      size={24}
                      fill="currentColor"
                    />
                  </button>
                )
              )}
            </div>
          </div>

          <textarea
            value={comentario}
            onChange={(e) =>
              setComentario(e.target.value)
            }
            placeholder="Comparte tu experiencia con este producto..."
            rows={5}
          />

          <div className="pc-review-form-actions">

            <button type="submit">
              {editando
                ? "Guardar cambios"
                : "Publicar reseña"}
            </button>

            {editando && (
              <button
                type="button"
                onClick={cancelarEdicion}
              >
                Cancelar
              </button>
            )}

          </div>
        </form>

        {mensaje && (
          <p className="pc-review-message">
            {mensaje}
          </p>
        )}
      </div>

      {/* LISTA */}
      <div className="pc-reviews-list">

        {cargando ? (
          <div className="pc-reviews-empty">
            Cargando reseñas...
          </div>
        ) : resenas.length === 0 ? (
          <div className="pc-reviews-empty">
            <h3>Aún no hay reseñas</h3>
            <p>
              Sé el primero en compartir tu
              opinión sobre este producto.
            </p>
          </div>
        ) : (
          resenas.map((resena) => {

            const nombre =
              resena.usuarios?.nombre ||
              "Cliente";

            const inicial =
              nombre.charAt(0).toUpperCase();

            return (
              <article
                key={resena.id}
                className="pc-review-item"
              >

                {/* USUARIO */}
                <div className="pc-review-user">

                  <div className="pc-review-avatar">
                    {inicial}
                  </div>

                  <div className="pc-review-user-info">

                    <strong>{nombre}</strong>

                    <div className="pc-review-meta">

                      <Estrellas
                        valor={Number(
                          resena.calificación
                        )}
                      />

                      <span>
                        {tiempoRelativo(
                          resena.created_at
                        )}
                      </span>

                    </div>

                  </div>

                </div>

                {/* COMENTARIO */}
                <p className="pc-review-comment">
                  {resena.comentario}
                </p>

                {/* ACCIONES */}
                <div className="pc-review-actions">

                  <button
                    type="button"
                    onClick={() =>
                      marcarUtil(resena)
                    }
                  >
                    <ThumbsUp size={16} />

                    <span>
                      Útil
                    </span>

                    {Number(
                      resena.útil_count || 0
                    ) > 0 && (
                      <small>
                        {resena.útil_count}
                      </small>
                    )}
                  </button>

                  {usuario?.id ===
                    resena.usuario_id && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          editarResena(resena)
                        }
                      >
                        <Pencil size={15} />
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          eliminarResena(
                            resena.id
                          )
                        }
                      >
                        <Trash2 size={15} />
                        Eliminar
                      </button>
                    </>
                  )}

                </div>

              </article>
            );
          })
        )}

      </div>
    </section>
  );
}