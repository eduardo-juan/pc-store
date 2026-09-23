import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import Sidebar from "../components/Layout/Sidebar";
import GestionProductos from "../components/Admin/GestionProductos";
import GestionOrdenes from "../components/Admin/GestionOrdenes";
import GestionInventario from "../components/Admin/GestionInventario";

export default function AdminPanel() {
  const { usuario, esAdmin } = useAuth();

  if (!usuario || !esAdmin) {
    return <Navigate to="/" />;
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
  );
}
