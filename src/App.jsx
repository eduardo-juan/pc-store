import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom'

import { AuthProvider } from './context/AuthContext'
import { CarritoProvider } from './context/CarritoContext'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import Navbar from './components/Layout/Navbar'
import Footer from './components/Layout/Footer'
import './responsive.js'

import Inicio from './pages/Inicio'
import Tienda from './pages/Tienda'
import Checkout from './pages/Checkout'
import MisOrdenes from './pages/MisOrdenes'
import Perfil from './pages/Perfil'
import OrdenConfirmada from './pages/OrdenConfirmada'
import NotFound from './pages/NotFound'

import Login from './components/Auth/Login'
import Registro from './components/Auth/Registro'
import RecuperarPassword from './components/Auth/RecuperarPassword'
import RestablecerPassword from './components/Auth/RestablecerPassword'
import Carrito from './components/Productos/Carrito'
import DetalleProducto from './components/Productos/DetalleProducto'

import AdminDashboard from './components/Admin/AdminDashboard'
import EmpleadoDashboard from './components/Admin/EmpleadoDashboard'
import GestionProductos from './components/Admin/GestionProductos'
import GestionInventario from './components/Admin/GestionInventario'
import GestionCategorias from './components/Admin/GestionCategorias'
import GestionOrdenes from './components/Admin/GestionOrdenes'
import GestionUsuarios from './components/Admin/GestionUsuarios'
import GestionEmpleados from './components/Admin/GestionEmpleados'
import RegistroEmpleado from './components/Admin/RegistroEmpleado'
import HistorialVentas from './components/Admin/HistorialVentas'
import HistorialComisionesEmpleado from './components/Admin/HistorialComisionesEmpleado'
import AuditoriaAccesos from './components/Admin/AuditoriaAccesos'
import AdminTableTools from './components/Admin/AdminTableTools'

import { useAuth } from './hooks/useAuth'

function DashboardStaff() {
  const { esAdmin, esEmpleado } = useAuth()

  if (esAdmin) return <AdminDashboard />
  if (esEmpleado) return <EmpleadoDashboard />

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CarritoProvider>
          <div className="pc-app">
            <Navbar />

            <div className="pc-app-content">
              <AdminTableTools />

              <Routes>
                {/* Inicio: público o personalizado */}
                <Route path="/" element={<Inicio />} />

                {/* Tienda pública */}
                <Route path="/tienda" element={<Tienda />} />

                {/* Detalles públicos: no requiere cuenta */}
                <Route path="/producto/:id" element={<DetalleProducto />} />

                {/* Carrito público; el checkout sí requiere autenticación */}
                <Route path="/carrito" element={<Carrito />} />

                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/recuperar-password" element={<RecuperarPassword />} />
                <Route path="/restablecer-password" element={<RestablecerPassword />} />

                {/* Para crear una orden, el usuario debe iniciar sesión */}
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/orden-confirmada/:id"
                  element={
                    <ProtectedRoute>
                      <OrdenConfirmada />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/mis-ordenes"
                  element={
                    <ProtectedRoute>
                      <MisOrdenes />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/perfil"
                  element={
                    <ProtectedRoute>
                      <Perfil />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiereStaff>
                      <DashboardStaff />
                    </ProtectedRoute>
                  }
                />

                <Route path="/admin/productos" element={<ProtectedRoute requiereStaff><GestionProductos /></ProtectedRoute>} />
                <Route path="/admin/inventario" element={<ProtectedRoute requiereStaff><GestionInventario /></ProtectedRoute>} />
                <Route path="/admin/categorias" element={<ProtectedRoute requiereStaff><GestionCategorias /></ProtectedRoute>} />
                <Route path="/admin/ordenes" element={<ProtectedRoute requiereStaff><GestionOrdenes /></ProtectedRoute>} />
                <Route path="/admin/empleado/comisiones" element={<ProtectedRoute requiereEmpleado><HistorialComisionesEmpleado /></ProtectedRoute>} />
                <Route path="/admin/usuarios" element={<ProtectedRoute requiereAdmin><GestionUsuarios /></ProtectedRoute>} />
                <Route path="/admin/empleados" element={<ProtectedRoute requiereAdmin><GestionEmpleados /></ProtectedRoute>} />
                <Route path="/admin/empleados/nuevo" element={<ProtectedRoute requiereAdmin><RegistroEmpleado /></ProtectedRoute>} />
                <Route path="/admin/ventas" element={<ProtectedRoute requiereAdmin><HistorialVentas /></ProtectedRoute>} />
                <Route path="/admin/auditoria" element={<ProtectedRoute requiereAdmin><AuditoriaAccesos /></ProtectedRoute>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>

            <Footer />
          </div>
        </CarritoProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
