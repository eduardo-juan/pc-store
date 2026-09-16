export default function Loading({ texto = 'Cargando...' }) {
  return (
    <div className="pc-loading">
      <div className="pc-loader" />
      <span>{texto}</span>
    </div>
  )
}
