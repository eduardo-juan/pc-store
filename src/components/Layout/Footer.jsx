import { Link } from 'react-router-dom'
import { Monitor, Headset } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  const abrirSoporte = () => {
    const correo = 'caecereseduardo@gmail.com'
    const asunto = encodeURIComponent('Soporte PC Store')
    const cuerpo = encodeURIComponent('Hola, necesito ayuda con PC Store.\n\n')

    const url =
      `https://mail.google.com/mail/?view=cm&fs=1&to=${correo}` + `&su=${asunto}&body=${cuerpo}`

    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <footer className="pc-footer">
      <div className="pc-container pc-footer-grid">
        <div className="pc-footer-brand">
          <strong>
            <Monitor size={20} />
            <span>PC Store</span>
          </strong>

          <p>Tecnología, componentes y soluciones para tu próxima computadora.</p>
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

          <button type="button" className="pc-footer-support" onClick={abrirSoporte}>
            <Headset size={17} />
            <span>Soporte</span>
          </button>
        </div>
      </div>

      <div className="pc-footer-bottom">
        © {year} PC Store · Proyecto educativo
        <br />
        Hecho por Eduardo y Juan
      </div>
    </footer>
  )
}
