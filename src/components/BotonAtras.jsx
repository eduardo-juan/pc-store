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