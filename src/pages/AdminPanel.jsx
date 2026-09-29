// ============================================================
// DOCUMENTACIÓN AMPLIADA
// Archivo: src/pages/AdminPanel.jsx
// Responsabilidad: Representa una vista completa asociada a una ruta y coordina su flujo de usuario.
// Criterio: mantener aquí solo la responsabilidad de este módulo y delegar operaciones compartidas a la capa correspondiente.
// ============================================================

// Módulo encargado de gestionar la lógica principal de esta funcionalidad y sus dependencias.
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import Sidebar from "../components/Layout/Sidebar";
import GestionProductos from "../components/Admin/GestionProductos";
import GestionOrdenes from "../components/Admin/GestionOrdenes";
import GestionInventario from "../components/Admin/GestionInventario";

// Componente principal: coordina el estado, las operaciones y la interfaz de este módulo.
export default function AdminPanel() {
  const { usuario, esAdmin } = useAuth();

  if (!usuario || !esAdmin) {
    return <Navigate to="/" />;
  }

  // Renderizado principal: presenta los datos y acciones disponibles al usuario.
  return (
    <div className="pc-admin-layout">
      <Sidebar />
      <main className="pc-admin-content">
        <GestionProductos />
        <GestionOrdenes />
        <GestionInventario />
      </main>
    </div>
  );
}
