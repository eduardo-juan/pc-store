import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import "./AuthRecovery.css";

export default function RestablecerPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const cambiarPassword = async (e) => {
    e.preventDefault(); setMensaje(""); setError("");
    if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    if (password !== confirmacion) return setError("Las contraseñas no coinciden.");
    setCargando(true);
    const { error: cambioError } = await supabase.auth.updateUser({ password });
    if (cambioError) setError(cambioError.message);
    else { setMensaje("Contraseña actualizada correctamente."); setTimeout(() => navigate("/login"), 1800); }
    setCargando(false);
  };

  return (
    <main className="pc-auth-modern-page">
      <div className="pc-auth-modern-shell">
        <Link className="pc-auth-modern-back" to="/login">← Volver al inicio de sesión</Link>
        <section className="pc-auth-modern-card">
          <div className="pc-auth-modern-brand">🔑</div>
          <h1>Crea una nueva contraseña</h1>
          <p>Elige una contraseña segura para proteger tu cuenta de PC Store.</p>
          <form className="pc-auth-modern-form" onSubmit={cambiarPassword}>
            <label htmlFor="password">Nueva contraseña</label>
            <div className="pc-auth-password-wrap">
              <input id="password" type={mostrar ? "text" : "password"} className="pc-input" value={password} onChange={(e) => setPassword(e.target.value)} minLength="6" autoComplete="new-password" required />
              <button type="button" className="pc-auth-toggle" onClick={() => setMostrar(!mostrar)}>{mostrar ? "Ocultar" : "Mostrar"}</button>
            </div>
            <label htmlFor="confirmacion">Confirmar contraseña</label>
            <div className="pc-auth-password-wrap">
              <input id="confirmacion" type={mostrar ? "text" : "password"} className="pc-input" value={confirmacion} onChange={(e) => setConfirmacion(e.target.value)} minLength="6" autoComplete="new-password" required />
            </div>
            <button className="pc-btn pc-btn-primary" disabled={cargando}>{cargando ? "Guardando…" : "Guardar contraseña"}</button>
          </form>
          {mensaje && <div className="pc-auth-modern-message">✓ {mensaje}</div>}
          {error && <div className="pc-auth-modern-message error">{error}</div>}
          <p className="pc-auth-modern-footer"><Link to="/login">Volver a iniciar sesión</Link></p>
        </section>
      </div>
    </main>
  );
}
