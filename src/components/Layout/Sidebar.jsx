export default function Sidebar() {
  return (
    <aside className="pc-sidebar">
      <nav>
        <ul>
          <li><a href="/admin/productos">Productos</a></li>
          <li><a href="/admin/categorias">Categorías</a></li>
          <li><a href="/admin/inventario">Inventario</a></li>
          <li><a href="/admin/ordenes">Órdenes</a></li>
        </ul>
      </nav>
    </aside>
  )
}