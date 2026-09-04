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
import GestionProductos from './components/Admin/GestionProductos'
import GestionInventario from './components/Admin/GestionInventario'
import GestionCategorias from './components/Admin/GestionCategorias'
import GestionOrdenes from './components/Admin/GestionOrdenes'
import GestionUsuarios from './components/Admin/GestionUsuarios'


export default function App() {

  return (
    <BrowserRouter>

      <AuthProvider>

        <CarritoProvider>

          <div className="pc-app">

            <Navbar />


            <div className="pc-app-content">

              <Routes>

                <Route
                  path="/"
                  element={<Home />}
                />

                <Route
                  path="/tienda"
                  element={<Tienda />}
                />

                <Route
                  path="/producto/:id"
                  element={<DetalleProducto />}
                />

                <Route
                  path="/carrito"
                  element={<Carrito />}
                />

                <Route
                  path="/login"
                  element={<Login />}
                />

                <Route
                  path="/registro"
                  element={<Registro />}
                />


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
                    <ProtectedRoute requiereAdmin>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/productos"
                  element={
                    <ProtectedRoute requiereAdmin>
                      <GestionProductos />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/inventario"
                  element={
                    <ProtectedRoute requiereAdmin>
                      <GestionInventario />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/categorias"
                  element={
                    <ProtectedRoute requiereAdmin>
                      <GestionCategorias />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/ordenes"
                  element={
                    <ProtectedRoute requiereAdmin>
                      <GestionOrdenes />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/usuarios"
                  element={
                    <ProtectedRoute requiereAdmin>
                      <GestionUsuarios />
                    </ProtectedRoute>
                  }
                />


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