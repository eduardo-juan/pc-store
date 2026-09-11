import { Link } from 'react-router-dom'
import {
  Package,
  Tags,
  Boxes,
  ClipboardList,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function Sidebar() {
  const { esStaff } = useAuth()

  if (!esStaff) {
    return null
  }

  return (
    <aside className="pc-sidebar">
      <nav>
        <ul>
          <li>
            <Link to="/admin/productos">
              <Package size={18} />
              <span>Productos</span>
            </Link>
          </li>

          <li>
            <Link to="/admin/categorias">
              <Tags size={18} />
              <span>Categorías</span>
            </Link>
          </li>

          <li>
            <Link to="/admin/inventario">
              <Boxes size={18} />
              <span>Inventario</span>
            </Link>
          </li>

          <li>
            <Link to="/admin/ordenes">
              <ClipboardList size={18} />
              <span>Órdenes</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  )
}