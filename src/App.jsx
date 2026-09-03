// ============================================================
// APP.JSX
// Archivo principal de navegación de PC Store.
// ============================================================

// ------------------------------------------------------------
// 1. REACT ROUTER
// ------------------------------------------------------------
// BrowserRouter: activa la navegación del navegador.
// Routes: agrupa todas las rutas.
// Route: relaciona una URL con un componente.
// Navigate: redirige a otra URL.
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'


// ------------------------------------------------------------
// 2. AUTENTICACIÓN
// ------------------------------------------------------------
// AuthProvider comparte la sesión y las funciones de autenticación
// con todos los componentes que estén dentro de él.
import { AuthProvider } from './context/AuthContext'

// ProtectedRoute bloquea páginas privadas cuando corresponde.
import ProtectedRoute from './components/Auth/ProtectedRoute'


// ------------------------------------------------------------
// 3. NAVEGACIÓN
// ------------------------------------------------------------
import Navbar from './components/Layout/Navbar'


// ------------------------------------------------------------
// 4. PÁGINAS PÚBLICAS
// ------------------------------------------------------------
import Home from './pages/Home'
import Tienda from './pages/Tienda'
import Login from './components/Auth/Login'
import Registro from './components/Auth/Registro'


// ------------------------------------------------------------
// 5. PÁGINAS DEL ADMINISTRADOR
// ------------------------------------------------------------
import AdminDashboard from './components/Admin/AdminDashboard'
import GestionProductos from './components/Admin/GestionProductos'
import GestionInventario from './components/Admin/GestionInventario'


// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function App() {
  return (
    <BrowserRouter>

      {/* Toda la aplicación podrá consultar el estado de autenticación. */}
      <AuthProvider>

        {/* Barra de navegación visible en todas estas rutas. */}
        <Navbar />

        <Routes>

          {/* ==================================================
              RUTAS PÚBLICAS
             ================================================== */}
          <Route path="/" element={<Home />} />
          <Route path="/tienda" element={<Tienda />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />


          {/* ==================================================
              RUTAS PROTEGIDAS DEL ADMINISTRADOR
             ================================================== */}

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


          {/* ==================================================
              RUTA NO ENCONTRADA
             ==================================================
              Cualquier URL que no exista vuelve al inicio.
          */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}