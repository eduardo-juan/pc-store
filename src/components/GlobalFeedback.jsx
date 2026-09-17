import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

const obtenerMensajeError = (error) => {
  if (!error) return "Ocurrió un error inesperado.";
  if (typeof error === "string") return error;
  return (
    error.message ||
    error.error_description ||
    error.details ||
    "No se pudo completar la operación. Revisa los datos e inténtalo nuevamente."
  );
};

const esElementoDeError = (elemento) => {
  if (!(elemento instanceof HTMLElement)) return false;
  if (
    elemento.matches(
      '[aria-invalid="true"], [data-error], .pc-error, .pc-field-error, .pc-form-error',
    )
  )
    return true;
  return /error|obligatorio|requerido|inválido|invalido|no se pudo|debes completar/i.test(
    elemento.textContent || "",
  );
};

const llevarAlError = (elemento) => {
  if (!(elemento instanceof HTMLElement)) return;

  const objetivo = elemento.matches("input, select, textarea, button")
    ? elemento
    : elemento.querySelector("input, select, textarea, button") || elemento;

  objetivo.scrollIntoView({ behavior: "smooth", block: "center" });

  if (typeof objetivo.focus === "function") {
    window.setTimeout(() => objetivo.focus({ preventScroll: true }), 250);
  }
};

export default function GlobalFeedback() {
  const [aviso, setAviso] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const mostrar = (tipo, mensaje) => {
      setAviso({ tipo, mensaje });
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setAviso(null), 6000);
    };

    const manejarErrorGlobal = (evento) => {
      mostrar("error", obtenerMensajeError(evento.error || evento.reason));
    };

    const manejarInvalid = (evento) => {
      evento.preventDefault();
      const campo = evento.target;
      const mensaje =
        campo.validationMessage || "Completa este campo correctamente.";
      mostrar("error", mensaje);
      llevarAlError(campo);
    };

    const escanearErrores = () => {
      const elementos = Array.from(
        document.querySelectorAll(
          '[aria-invalid="true"], [data-error], .pc-error, .pc-field-error, .pc-form-error',
        ),
      );
      const primero = elementos.find(esElementoDeError);
      if (primero && primero.dataset.feedbackHandled !== "true") {
        primero.dataset.feedbackHandled = "true";
        llevarAlError(primero);
      }
    };

    window.addEventListener("error", manejarErrorGlobal);
    window.addEventListener("unhandledrejection", manejarErrorGlobal);
    document.addEventListener("invalid", manejarInvalid, true);

    const observer = new MutationObserver(escanearErrores);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-invalid", "data-error"],
    });

    escanearErrores();

    return () => {
      window.removeEventListener("error", manejarErrorGlobal);
      window.removeEventListener("unhandledrejection", manejarErrorGlobal);
      document.removeEventListener("invalid", manejarInvalid, true);
      observer.disconnect();
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  if (!aviso) return null;

  return (
    <div
      className={`pc-global-feedback pc-global-feedback-${aviso.tipo}`}
      role="alert"
      aria-live="assertive"
    >
      {aviso.tipo === "error" ? (
        <AlertCircle size={20} />
      ) : (
        <CheckCircle2 size={20} />
      )}
      <span>{aviso.mensaje}</span>
      <button
        type="button"
        onClick={() => setAviso(null)}
        aria-label="Cerrar aviso"
      >
        <X size={18} />
      </button>
    </div>
  );
}
