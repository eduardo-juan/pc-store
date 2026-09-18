import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  BarChart3,
  Tags,
  FileText,
  Users,
  UserCog,
  TrendingUp,
  ClipboardList,
  TicketPercent,
  Star,
} from "lucide-react";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import BotonAtras from "../../components/BotonAtras";

const ESTADOS_VENTA_VALIDOS = ["pagada", "enviada", "entregada", "completada"];

export default function AdminDashboard() {
  const { perfil } = useAuth();
  const [metricas, setMetricas] = useState({
    productos: 0,
    usuarios: 0,
    ordenes: 0,
    ventas: 0,
    bajoStock: 0,
  });
  useEffect(() => {
    cargarMetricas();
  }, []);

  const cargarMetricas = async () => {
    const [productosResult, usuariosResult, ordenesResult, bajoStockResult] =
      await Promise.all([
        supabase.from("productos").select("id", { count: "exact", head: true }),
        supabase.from("usuarios").select("id", { count: "exact", head: true }),
        supabase.from("ordenes").select("id, total, estado, created_at"),
        supabase
          .from("productos")
          .select("id", { count: "exact", head: true })
          .lte("stock", 3)
          .eq("activo", true),
      ]);
    if (ordenesResult.error)
      console.error(
        "Error cargando las órdenes del dashboard:",
        ordenesResult.error,
      );
    const hoy = new Date();
    const inicioHoy = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate(),
    );
    const finHoy = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate() + 1,
    );
    const ventasHoy = (ordenesResult.data || [])
      .filter((orden) => {
        const fecha = orden.created_at ? new Date(orden.created_at) : null;
        return (
          ESTADOS_VENTA_VALIDOS.includes(
            String(orden.estado || "").toLowerCase(),
          ) &&
          fecha &&
          fecha >= inicioHoy &&
          fecha < finHoy
        );
      })
      .reduce((total, orden) => total + Number(orden.total || 0), 0);
    setMetricas({
      productos: productosResult.count || 0,
      usuarios: usuariosResult.count || 0,
      ordenes: (ordenesResult.data || []).length,
      ventas: ventasHoy,
      bajoStock: bajoStockResult.count || 0,
    });
  };

  const opciones = [
    { icono: Package, titulo: "Productos", ruta: "/admin/productos" },
    { icono: BarChart3, titulo: "Inventario", ruta: "/admin/inventario" },
    { icono: Tags, titulo: "Categorías", ruta: "/admin/categorias" },
    { icono: TicketPercent, titulo: "Cupones", ruta: "/admin/cupones" },
    { icono: Star, titulo: "Reseñas", ruta: "/admin/resenas" },
    { icono: FileText, titulo: "Órdenes", ruta: "/admin/ordenes" },
    { icono: Users, titulo: "Usuarios", ruta: "/admin/usuarios" },
    { icono: UserCog, titulo: "Empleados", ruta: "/admin/empleados" },
    { icono: TrendingUp, titulo: "Historial de ventas", ruta: "/admin/ventas" },
    { icono: FileText, titulo: "Reportes", ruta: "/admin/reportes" },
    { icono: ClipboardList, titulo: "Auditoría", ruta: "/admin/auditoria" },
  ];

  return (
    <main className="pc-page">
      <div className="pc-container">
        <BotonAtras />
        <div className="pc-page-heading">
          <div>
            <span className="pc-kicker" style={{ color: "#171717" }}>
              Administración
            </span>
            <h1 style={{ color: "#171717" }}>
              Hola, {perfil?.nombre || "Administrador"}
            </h1>
            <p style={{ color: "#171717" }}>Resumen general de PC Store.</p>
          </div>
        </div>
        <div className="pc-metrics-grid">
          {[
            ["Productos", metricas.productos],
            ["Usuarios", metricas.usuarios],
            ["Órdenes", metricas.ordenes],
            ["Ventas de hoy", `L ${metricas.ventas.toFixed(2)}`],
            ["Stock bajo", metricas.bajoStock],
          ].map(([titulo, valor]) => (
            <article className="pc-card pc-metric" key={titulo}>
              <span style={{ color: "#171717" }}>{titulo}</span>
              <strong style={{ color: "#171717" }}>{valor}</strong>
            </article>
          ))}
        </div>
        <h2 className="pc-section-title" style={{ color: "#171717" }}>
          Gestión
        </h2>
        <div className="pc-admin-grid">
          {opciones.map(({ icono: Icono, titulo, ruta }) => (
            <Link key={ruta} to={ruta} className="pc-card pc-admin-option">
              <div className="pc-admin-option-icon">
                <Icono size={30} strokeWidth={2} />
              </div>
              <h3 style={{ color: "#171717" }}>{titulo}</h3>
              <p style={{ color: "#171717" }}>
                Abrir módulo de {titulo.toLowerCase()}.
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
