import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Loading from '../Shared/Loading'

export default function ProtectedRoute({ children, requiereAdmin = false }) {
  const { usuario, cargando } = useAuth()

  if (cargando) return <Loading />

  // Si no hay usuario, redirigir a login
  if (!usuario) return <Navigate to="/login" />

  // Si requiere admin y el usuario no es admin, redirigir
  if (requiereAdmin && usuario.rol !== 'admin') {
    return <Navigate to="/" />
  }

  return children
}