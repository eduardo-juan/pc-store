// Módulo reutilizable que concentra la lógica y presentación de esta funcionalidad.
// Propósito del componente: centraliza la lógica principal de este módulo.
export default function Error({ mensaje, onClose }) {
  // Renderizado principal: muestra la información y acciones disponibles para el usuario.
  return (
    <div className="pc-error-modal">
      <div className="pc-error-content">
        <h2>Error</h2>
        <p>{mensaje}</p>
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  )
}