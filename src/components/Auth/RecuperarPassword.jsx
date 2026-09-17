import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Send } from "lucide-react";
import { supabase } from "../../supabaseClient";
import "./AuthRecovery.css";

const MENSAJE_CUENTA = "No se encontró la cuenta. Verifica el correo electrónico e inténtalo nuevamente.";

export default function RecuperarPassword() {
  const [correo, setCorreo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const enviarSolicitud = async (e) => {
    e.preventDefault();
    const email = correo.trim().toLowerCase();
    setMensaje("");
    setError("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setError(MENSAJE_CUENTA);
      return;
    }

    setCargando(true);

    try {
      const { data: puedeRecuperar, error: validacionError } = await supabase.rpc(
        "puede_recuperar_password",
        { p_correo: email }
      );

      if (validacionError || !puedeRecuperar) {
        setError(MENSAJE_CUENTA);
        return;
      }

      const { error: solicitudError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/restablecer-password`,
      });

      if (solicitudError) {
        setError(MENSAJE_CUENTA);
        return;
      }

      setMensaje("Si el correo corresponde a una cuenta activa, recibirás un enlace para restablecer tu contraseña.");
    } catch {
      setError(MENSAJE_CUENTA);
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="pc-auth-modern-page">
      <div className="pc-auth-modern-shell">
        <Link className="pc-auth-modern-back" to="/login">← Volver al inicio de sesión</Link>
        <section className="pc-auth-modern-card">
          <div className="pc-auth-modern-brand"><Mail size={30} /></div>
          <h1>Recupera tu acceso</h1>
          <p>Introduce tu correo y te enviaremos un enlace seguro para crear una nueva contraseña.</p>
          <form className="pc-auth-modern-form" onSubmit={enviarSolicitud}>
            <label htmlFor="correo">Correo electrónico</label>
            <input id="correo" type="email" className="pc-input" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="tu-correo@ejemplo.com" autoComplete="email" required />
            <button className="pc-btn pc-btn-primary" disabled={cargando} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8}}>
              <Send size={18} />
              {cargando ? "Verificando…" : "Enviar enlace seguro"}
            </button>
          </form>
          {mensaje && <div className="pc-auth-modern-message">✓ {mensaje}</div>}
          {error && <div className="pc-auth-modern-message error">{error}</div>}
          <p className="pc-auth-modern-footer"><Link to="/login">¿Recordaste tu contraseña? Inicia sesión</Link></p>
        </section>
      </div>
    </main>
  );
}
