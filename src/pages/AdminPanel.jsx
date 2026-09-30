// ============================================================
// PANEL ADMINISTRATIVO LEGACY
// Verifica que exista una sesión con rol de administrador y,
// si cumple, agrupa las gestiones principales del panel.
// ============================================================
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import Sidebar from "../components/Layout/Sidebar";
import GestionProductos from "../components/Admin/GestionProductos";
import GestionOrdenes from "../components/Admin/GestionOrdenes";
import GestionInventario from "../components/Admin/GestionInventario";

export default function AdminPanel() {
  const { usuario, esAdmin } = useAuth();

  // Evita que usuarios sin rol admin accedan directamente a este panel.
  if (!usuario || !esAdmin) {
    return <Navigate to="/" />;
  }

  // Integra la navegación lateral con las gestiones principales de productos,
  // órdenes e inventario.
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
