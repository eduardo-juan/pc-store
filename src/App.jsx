import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom'

import { AuthProvider } from './context/AuthContext'
import { CarritoProvider } from './context/CarritoContext'

import ProtectedRoute from './components/Auth/ProtectedRoute'

import Navbar from './components/Layout/Navbar'
import Footer from './components/Layout/Footer'

import Home from './pages/Home'
import Tienda from './pages/Tienda'
import Checkout from './pages/Checkout'
import MisOrdenes from './pages/MisOrdenes'
import Perfil from './pages/Perfil'
import OrdenConfirmada from './pages/OrdenConfirmada'
import NotFound from './pages/NotFound'

import Login from './components/Auth/Login'
import Registro from './components/Auth/Registro'

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
import HistorialVentas from './components/Admin/HistorialVentas'

import { useAuth } from './hooks/useAuth'


function DashboardStaff() {
  const { esAdmin, esEmpleado } = useAuth()

  if (esAdmin) {
    return <AdminDashboard />
  }

  if (esEmpleado) {
    return <EmpleadoDashboard />
  }

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

              <Routes>

                {/* =========================
                    PÁGINA PRINCIPAL
                    PÚBLICA
                ========================= */}

                <Route
                  path="/"
                  element={<Home />}
                />


                {/* =========================
                    TIENDA
                    REQUIERE LOGIN
                ========================= */}

                <Route
                  path="/tienda"
                  element={
                    <ProtectedRoute>
                      <Tienda />
                    </ProtectedRoute>
                  }
                />


                {/* =========================
                    DETALLE DE PRODUCTO
                    REQUIERE LOGIN
                ========================= */}

                <Route
                  path="/producto/:id"
                  element={
                    <ProtectedRoute>
                      <DetalleProducto />
                    </ProtectedRoute>
                  }
                />


                {/* =========================
                    CARRITO
                    REQUIERE LOGIN
                ========================= */}

                <Route
                  path="/carrito"
                  element={
                    <ProtectedRoute>
                      <Carrito />
                    </ProtectedRoute>
                  }
                />


                {/* =========================
                    AUTENTICACIÓN
                    PÚBLICA
                ========================= */}

                <Route
                  path="/login"
                  element={<Login />}
                />

                <Route
                  path="/registro"
                  element={<Registro />}
                />


                {/* =========================
                    PÁGINAS DE CLIENTE
                    REQUIEREN LOGIN
                ========================= */}

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


                {/* =========================
                    DASHBOARD STAFF
                    ADMIN + EMPLEADO
                ========================= */}

                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiereStaff>
                      <DashboardStaff />
                    </ProtectedRoute>
                  }
                />


                {/* =========================
                    MÓDULOS STAFF
                    ADMIN + EMPLEADO
                ========================= */}

                <Route
                  path="/admin/productos"
                  element={
                    <ProtectedRoute requiereStaff>
                      <GestionProductos />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/inventario"
                  element={
                    <ProtectedRoute requiereStaff>
                      <GestionInventario />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/categorias"
                  element={
                    <ProtectedRoute requiereStaff>
                      <GestionCategorias />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/ordenes"
                  element={
                    <ProtectedRoute requiereStaff>
                      <GestionOrdenes />
                    </ProtectedRoute>
                  }
                />


                {/* =========================
                    MÓDULOS SOLO ADMIN
                ========================= */}

                <Route
                  path="/admin/usuarios"
                  element={
                    <ProtectedRoute requiereAdmin>
                      <GestionUsuarios />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/empleados"
                  element={
                    <ProtectedRoute requiereAdmin>
                      <GestionEmpleados />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/ventas"
                  element={
                    <ProtectedRoute requiereAdmin>
                      <HistorialVentas />
                    </ProtectedRoute>
                  }
                />


                {/* =========================
                    404
                ========================= */}

                <Route
                  path="*"
                  element={<NotFound />}
                />

              </Routes>

            </div>

            <Footer />

          </div>

        </CarritoProvider>

      </AuthProvider>

    </BrowserRouter>
  )
}