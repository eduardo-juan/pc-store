import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import BotonAtras from "../../components/BotonAtras";

export default function RestablecerPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const cambiarPassword = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmacion) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);

    const { error: cambioError } = await supabase.auth.updateUser({ password });

    if (cambioError) {
      setError(cambioError.message);
    } else {
      setMensaje("Contraseña actualizada correctamente.");
      setTimeout(() => navigate("/login"), 1800);
    }

    setCargando(false);
  };

  return (
    <main className="pc-page">
      <div className="pc-container pc-auth-container">
        <BotonAtras />
        <section className="pc-card pc-auth-card">
          <h1>Nueva contraseña</h1>
          <p>Escribe y confirma tu nueva contraseña.</p>

          <form onSubmit={cambiarPassword}>
            <label htmlFor="password">Nueva contraseña</label>
            <input
              id="password"
              type="password"
              className="pc-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength="6"
              required
            />

            <label htmlFor="confirmacion">Confirmar contraseña</label>
            <input
              id="confirmacion"
              type="password"
              className="pc-input"
              value={confirmacion}
              onChange={(e) => setConfirmacion(e.target.value)}
              minLength="6"
              required
            />

            <button className="pc-btn pc-btn-primary" disabled={cargando}>
              {cargando ? "Guardando..." : "Guardar contraseña"}
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
