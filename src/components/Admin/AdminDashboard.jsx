import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function AdminDashboard() {
  const { perfil } = useAuth()

  const opciones = [
    {
      icono: '📦',
      titulo: 'Productos',
      descripcion: 'Crear, editar y eliminar productos.',
      ruta: '/admin/productos',
    },
    {
      icono: '📊',
      titulo: 'Inventario',
      descripcion: 'Controlar stock y movimientos.',
      ruta: '/admin/inventario',
    },
    {
      icono: '🏷️',
      titulo: 'Categorías',
      descripcion: 'Organizar productos.',
      ruta: '/admin/categorias',
    },
    {
      icono: '🧾',
      titulo: 'Órdenes',
      descripcion: 'Consultar pedidos.',
      ruta: '/admin/ordenes',
    },
    {
      icono: '👥',
      titulo: 'Usuarios',
      descripcion: 'Administrar usuarios y roles.',
      ruta: '/admin/usuarios',
    },
  ]

  return (
    <main className="pc-page">
      <div className="pc-container">

        <header className="pc-admin-header">

          <h1>Panel de Administración</h1>

          <p>
            Bienvenido,
            {' '}
            {perfil?.nombre || 'Administrador'}
            {' '}
            {perfil?.apellido || ''}
          </p>

        </header>


        <div className="pc-admin-grid">

          {opciones.map((opcion) => (

            <Link
              key={opcion.ruta}
              to={opcion.ruta}
              className="pc-card pc-admin-option"
            >

              <div className="pc-admin-option-icon">
                {opcion.icono}
              </div>

              <h3>{opcion.titulo}</h3>

              <p>{opcion.descripcion}</p>

            </Link>

          ))}

        </div>

      </div>
    </main>
  )
}