export default function Error({ mensaje, onClose }) {
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
