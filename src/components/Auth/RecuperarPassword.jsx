import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import "./AuthRecovery.css";

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

    const { error: solicitudError } = await supabase.auth.resetPasswordForEmail(correo.trim(), {
      redirectTo: `${window.location.origin}/restablecer-password`,
    });

    if (solicitudError) setError(solicitudError.message);
    else setMensaje("Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.");
    setCargando(false);
  };

  return (
    <main className="pc-auth-modern-page">
      <div className="pc-auth-modern-shell">
        <Link className="pc-auth-modern-back" to="/login">← Volver al inicio de sesión</Link>
        <section className="pc-auth-modern-card">
          <div className="pc-auth-modern-brand">🔐</div>
          <h1>Recupera tu acceso</h1>
          <p>Introduce tu correo y te enviaremos un enlace seguro para crear una nueva contraseña.</p>
          <form className="pc-auth-modern-form" onSubmit={enviarSolicitud}>
            <label htmlFor="correo">Correo electrónico</label>
            <input id="correo" type="email" className="pc-input" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="tu-correo@ejemplo.com" autoComplete="email" required />
            <button className="pc-btn pc-btn-primary" disabled={cargando}>{cargando ? "Enviando…" : "Enviar enlace seguro"}</button>
          </form>
          {mensaje && <div className="pc-auth-modern-message">✓ {mensaje}</div>}
          {error && <div className="pc-auth-modern-message error">{error}</div>}
          <p className="pc-auth-modern-footer"><Link to="/login">¿Recordaste tu contraseña? Inicia sesión</Link></p>
        </section>
      </div>
    </main>
  );
}
