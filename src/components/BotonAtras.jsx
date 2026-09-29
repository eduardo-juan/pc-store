// ============================================================
// DOCUMENTACIÓN AMPLIADA
// Archivo: src/components/BotonAtras.jsx
// Responsabilidad: Construye un componente reutilizable de PC Store.
// Criterio: mantener aquí solo la responsabilidad de este módulo y delegar operaciones compartidas a la capa correspondiente.
// ============================================================

import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const BotonAtras = ({ texto = 'Atrás' }) => {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      className="pc-btn pc-btn-light pc-back-button"
      onClick={() => navigate(-1)}
    >
      <ArrowLeft size={18} />
      <span>{texto}</span>
    </button>
  )
}

export default BotonAtras