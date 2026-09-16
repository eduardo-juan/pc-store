import { useAuth } from '../hooks/useAuth'
import { Navigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import GestionProductos from './admin/GestionProductos'
import GestionOrdenes from './admin/GestionOrdenes'
import GestionInventario from './admin/GestionInventario'

export default function AdminPanel() {
  const { usuario, esAdmin } = useAuth()

  if (!usuario || !esAdmin) {
    return <Navigate to="/" />
  }

  return (
    <div className="pc-admin-layout">
      <Sidebar />
      <main className="pc-admin-content">
        <GestionProductos />
        <GestionOrdenes />
        <GestionInventario />
      </main>
    </div>
  )
}
