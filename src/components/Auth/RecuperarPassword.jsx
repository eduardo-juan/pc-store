import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import BotonAtras from "../../components/BotonAtras";

export default function RecuperarPassword() {
  const [correo, setCorreo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const enviarSolicitud = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje("");
    setError("");

    const { error: solicitudError } = await supabase.auth.resetPasswordForEmail(
      correo.trim(),
      {
        redirectTo: `${window.location.origin}/restablecer-password`,
      },
    );

    if (solicitudError) {
      setError(solicitudError.message);
    } else {
      setMensaje(
        "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.",
      );
    }

    setCargando(false);
  };

  return (
    <main className="pc-page">
      <div className="pc-container pc-auth-container">
        <BotonAtras />
        <section className="pc-card pc-auth-card">
          <h1>Restablecer contraseña</h1>
          <p>Introduce tu correo para recibir un enlace de recuperación.</p>

          <form onSubmit={enviarSolicitud}>
            <label htmlFor="correo">Correo electrónico</label>
            <input
              id="correo"
              type="email"
              className="pc-input"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />

            <button className="pc-btn pc-btn-primary" disabled={cargando}>
              {cargando ? "Enviando..." : "Enviar enlace"}
            </button>
          </form>

          {mensaje && <div className="pc-message">{mensaje}</div>}
          {error && <div className="pc-message pc-message-error">{error}</div>}

          <p>
            <Link to="/login">Volver a iniciar sesión</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
