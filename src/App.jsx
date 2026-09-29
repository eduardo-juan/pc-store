// ============================================================
// DOCUMENTACIÓN AMPLIADA
// Archivo: src/App.jsx
// Responsabilidad: Define el enrutamiento completo, providers globales, layout y restricciones de acceso de PC Store.
// Criterio de modificación: cambiar aquí la lógica solo cuando corresponda a esta responsabilidad;
// las operaciones compartidas deben mantenerse en sus contextos, hooks o servicios correspondientes.
// ============================================================

// Punto central de la aplicación. Aquí se conectan el enrutamiento, la autenticación, el carrito
// y los elementos globales que deben existir mientras el usuario navega por PC Store.
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { CarritoProvider } from "./context/CarritoContext";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import GlobalFeedback from "./components/GlobalFeedback";

import "./responsive.js";
import "./App.css";
import "./styles/required-fields.css";
import "./styles/home-public-fixes.css";

import Inicio from "./pages/Inicio";
import Tienda from "./pages/Tienda";
import Configurador from "./pages/Configurador";
import ConfiguradorPiloto from "./pages/ConfiguradorPiloto";
import Checkout from "./pages/Checkout";
import MisOrdenes from "./pages/MisOrdenes";
import DetalleOrden from "./pages/DetalleOrden";
import Perfil from "./pages/Perfil";
import Favoritos from "./pages/Favoritos";
import OrdenConfirmada from "./pages/OrdenConfirmada";
import NotFound from "./pages/NotFound";

import Login from "./components/Auth/Login";
import Registro from "./components/Auth/Registro";
import RecuperarPassword from "./components/Auth/RecuperarPassword";
import RestablecerPassword from "./components/Auth/RestablecerPassword";

import Carrito from "./components/Productos/Carrito";
import DetalleProducto from "./components/Productos/DetalleProducto";

import AdminDashboard from "./components/Admin/AdminDashboard";
import EmpleadoDashboard from "./components/Admin/EmpleadoDashboard";
import GestionProductos from "./components/Admin/GestionProductos";
import GestionInventario from "./components/Admin/GestionInventario";
import GestionCategorias from "./components/Admin/GestionCategorias";
import GestionOrdenes from "./components/Admin/GestionOrdenes";
import GestionUsuarios from "./components/Admin/GestionUsuarios";
import GestionEmpleados from "./components/Admin/GestionEmpleados";
import RegistroEmpleado from "./components/Admin/RegistroEmpleado";
import HistorialVentas from "./components/Admin/HistorialVentas";
import HistorialComisionesEmpleado from "./components/Admin/HistorialComisionesEmpleado";
import AuditoriaAccesos from "./components/Admin/AuditoriaAccesos";
import AdminTableTools from "./components/Admin/AdminTableTools";
import GestionCupones from "./components/Admin/GestionCupones";
import GestionResenas from "./components/Admin/GestionResenas";
import Reportes from "./components/Admin/Reportes";

import { useAuth } from "./hooks/useAuth";

// Selecciona automáticamente el panel inicial del personal según el rol obtenido del contexto.
function DashboardStaff() {
  const { esAdmin, esEmpleado } = useAuth();

  if (esAdmin) return <AdminDashboard />;
  if (esEmpleado) return <EmpleadoDashboard />;

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      {/* Los providers mantienen disponibles la sesión y el carrito para todas las rutas. */}
      <AuthProvider>
        <CarritoProvider>
          <div className="pc-app">
            <Navbar />

            {/* Feedback global: muestra avisos y errores sin duplicar lógica en cada página. */}
            <GlobalFeedback />

            <div className="pc-app-content">
              <AdminTableTools />

              {/*
                Todas las URLs de la aplicación se declaran aquí.
                Las rutas públicas permiten navegar sin iniciar sesión; las que están dentro de
                ProtectedRoute exigen autenticación y, cuando corresponde, un rol específico.
                Para cambiar una dirección, agregar una página o modificar quién puede acceder,
                este es el archivo principal que debe revisarse.
              */}
              <Routes>
                {/* Páginas públicas y acceso de usuarios. */}
                <Route path="/" element={<Inicio />} />
                <Route path="/tienda" element={<Tienda />} />
                <Route path="/producto/:id" element={<DetalleProducto />} />
                <Route path="/carrito" element={<Carrito />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/recuperar-password" element={<RecuperarPassword />} />
                <Route path="/restablecer-password" element={<RestablecerPassword />} />

                {/* Funciones de cliente que requieren una sesión iniciada. */}
                <Route path="/configurador" element={<ProtectedRoute><Configurador /></ProtectedRoute>} />
                <Route path="/configurador/piloto" element={<ProtectedRoute><ConfiguradorPiloto /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/orden-confirmada/:id" element={<ProtectedRoute><OrdenConfirmada /></ProtectedRoute>} />
                <Route path="/mis-ordenes" element={<ProtectedRoute><MisOrdenes /></ProtectedRoute>} />
                <Route path="/mis-ordenes/:ordenId" element={<ProtectedRoute><DetalleOrden /></ProtectedRoute>} />
                <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
                <Route path="/favoritos" element={<ProtectedRoute><Favoritos /></ProtectedRoute>} />

                {/* Área administrativa: requiere personal autorizado y puede restringirse por rol. */}
                <Route path="/admin" element={<ProtectedRoute requiereStaff><DashboardStaff /></ProtectedRoute>} />
                <Route path="/admin/productos" element={<ProtectedRoute requiereStaff><GestionProductos /></ProtectedRoute>} />
                <Route path="/admin/inventario" element={<ProtectedRoute requiereStaff><GestionInventario /></ProtectedRoute>} />
                <Route path="/admin/categorias" element={<ProtectedRoute requiereStaff><GestionCategorias /></ProtectedRoute>} />
                <Route path="/admin/ordenes" element={<ProtectedRoute requiereStaff><GestionOrdenes /></ProtectedRoute>} />
                <Route path="/admin/cupones" element={<ProtectedRoute requiereAdmin><GestionCupones /></ProtectedRoute>} />
                <Route path="/admin/resenas" element={<ProtectedRoute requiereAdmin><GestionResenas /></ProtectedRoute>} />
                <Route path="/admin/empleado/comisiones" element={<ProtectedRoute requiereEmpleado><HistorialComisionesEmpleado /></ProtectedRoute>} />
                <Route path="/admin/usuarios" element={<ProtectedRoute requiereAdmin><GestionUsuarios /></ProtectedRoute>} />
                <Route path="/admin/empleados" element={<ProtectedRoute requiereAdmin><GestionEmpleados /></ProtectedRoute>} />
                <Route path="/admin/empleados/nuevo" element={<ProtectedRoute requiereAdmin><RegistroEmpleado /></ProtectedRoute>} />
                <Route path="/admin/ventas" element={<ProtectedRoute requiereAdmin><HistorialVentas /></ProtectedRoute>} />
                <Route path="/admin/reportes" element={<ProtectedRoute requiereAdmin><Reportes /></ProtectedRoute>} />
                <Route path="/admin/auditoria" element={<ProtectedRoute requiereAdmin><AuditoriaAccesos /></ProtectedRoute>} />

                {/* Cualquier URL no definida termina en la página 404. */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>

            <Footer />
          </div>
        </CarritoProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
