import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'

import { AuthProvider } from './context/AuthContext'

import ProtectedRoute from './components/Auth/ProtectedRoute'

import Navbar from './components/Layout/Navbar'

import Home from './pages/Home'
import Tienda from './pages/Tienda'

import Login from './components/Auth/Login'
import Registro from './components/Auth/Registro'

import AdminDashboard from './components/Admin/AdminDashboard'
import GestionProductos from './components/Admin/GestionProductos'
import GestionInventario from './components/Admin/GestionInventario'
import GestionCategorias from './components/Admin/GestionCategorias'
import GestionOrdenes from './components/Admin/GestionOrdenes'
import GestionUsuarios from './components/Admin/GestionUsuarios'


export default function App() {
  return (
    <BrowserRouter>

      <AuthProvider>

        <Navbar />

        <Routes>

          {/* RUTAS PÚBLICAS */}

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/tienda"
            element={<Tienda />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/registro"
            element={<Registro />}
          />


          {/* RUTAS ADMIN */}

          <Route
            path="/admin"
            element={
              <ProtectedRoute requiereAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/productos"
            element={
              <ProtectedRoute requiereAdmin={true}>
                <GestionProductos />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/inventario"
            element={
              <ProtectedRoute requiereAdmin={true}>
                <GestionInventario />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/categorias"
            element={
              <ProtectedRoute requiereAdmin={true}>
                <GestionCategorias />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/ordenes"
            element={
              <ProtectedRoute requiereAdmin={true}>
                <GestionOrdenes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/usuarios"
            element={
              <ProtectedRoute requiereAdmin={true}>
                <GestionUsuarios />
              </ProtectedRoute>
            }
          />


          {/* CUALQUIER OTRA URL */}

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

        </Routes>

      </AuthProvider>

    </BrowserRouter>
  )
}