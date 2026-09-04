import { Link } from 'react-router-dom'

export default function Footer() {

  const year = new Date().getFullYear()

  return (
    <footer className="pc-footer">

      <div className="pc-container pc-footer-grid">

        <div>
          <strong>🖥️ PC Store</strong>

          <p>
            Tecnología, componentes y soluciones
            para tu próxima computadora.
          </p>
        </div>


        <div>
          <strong>Navegación</strong>

          <Link to="/">Inicio</Link>
          <Link to="/tienda">Tienda</Link>
        </div>


        <div>
          <strong>Cuenta</strong>

          <Link to="/perfil">Mi perfil</Link>
          <Link to="/mis-ordenes">Mis órdenes</Link>
        </div>

      </div>


      <div className="pc-footer-bottom">
        © {year} PC Store · Proyecto educativo
      </div>

    </footer>
  )
}