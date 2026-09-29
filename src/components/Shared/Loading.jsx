// Módulo reutilizable que concentra la lógica y presentación de esta funcionalidad.
// Propósito del componente: centraliza la lógica principal de este módulo.
export default function Loading({
  texto = 'Cargando...',
}) {
  // Renderizado principal: muestra la información y acciones disponibles para el usuario.
  return (
    <div className="pc-loading">
      <div className="pc-loader" />
      <span>{texto}</span>
    </div>
  )
}