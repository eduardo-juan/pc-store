import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function AuthPanel() {
  const { login, registro } = useAuth()
  const navigate = useNavigate()

  const [modo, setModo] = useState('login')
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  })

  const [regForm, setRegForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmar: '',
  })

  const cambiarModo = (nuevoModo) => {
    setModo(nuevoModo)
    setMensaje('')
  }

  const enviarLogin = async (e) => {
    e.preventDefault()
    setMensaje('')
    setCargando(true)

    const resultado = await login(loginForm.email, loginForm.password)

    setCargando(false)

    if (resultado.success) {
      navigate('/')
    } else {
      setMensaje(resultado.error || 'No se pudo iniciar sesión.')
    }
  }

  const enviarRegistro = async (e) => {
    e.preventDefault()
    setMensaje('')

    if (regForm.password !== regForm.confirmar) {
      setMensaje('Las contraseñas no coinciden.')
      return
    }

    if (regForm.password.length < 6) {
      setMensaje('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setCargando(true)

    const resultado = await registro(
      regForm.email,
      regForm.password,
      regForm.nombre,
      regForm.apellido
    )

    setCargando(false)

    if (resultado.success) {
      navigate('/')
    } else {
      setMensaje(resultado.error || 'No se pudo crear la cuenta.')
    }
  }

  const estiloLabel = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    color: '#fff',
    fontSize: '13px',
  }

  const estiloFila = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  }

  return (
    <div
      className="pc-hero-panel"
      style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
    >
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="button"
          onClick={() => cambiarModo('login')}
          className={modo === 'login' ? 'pc-btn pc-btn-primary' : 'pc-btn pc-btn-light'}
          style={{ flex: 1 }}
        >
          Iniciar sesión
        </button>

        <button
          type="button"
          onClick={() => cambiarModo('registro')}
          className={modo === 'registro' ? 'pc-btn pc-btn-primary' : 'pc-btn pc-btn-light'}
          style={{ flex: 1 }}
        >
          Crear cuenta
        </button>
      </div>

      {modo === 'login' ? (
        <form
          onSubmit={enviarLogin}
          style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
        >
          <label style={estiloLabel}>
            Correo electrónico
            <input
              className="pc-input"
              type="email"
              required
              value={loginForm.email}
              onChange={(e) =>
                setLoginForm((f) => ({
                  ...f,
                  email: e.target.value,
                }))
              }
            />
          </label>

          <label style={estiloLabel}>
            Contraseña
            <input
              className="pc-input"
              type="password"
              required
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm((f) => ({
                  ...f,
                  password: e.target.value,
                }))
              }
            />
          </label>

          {mensaje && <div className="pc-message">{mensaje}</div>}

          <button
            type="submit"
            disabled={cargando}
            className="pc-btn pc-btn-primary"
            style={{ width: '100%' }}
          >
            {cargando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      ) : (
        <form
          onSubmit={enviarRegistro}
          style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
        >
          <div style={estiloFila}>
            <label style={estiloLabel}>
              Nombre
              <input
                className="pc-input"
                required
                value={regForm.nombre}
                onChange={(e) =>
                  setRegForm((f) => ({
                    ...f,
                    nombre: e.target.value,
                  }))
                }
              />
            </label>

            <label style={estiloLabel}>
              Apellido
              <input
                className="pc-input"
                required
                value={regForm.apellido}
                onChange={(e) =>
                  setRegForm((f) => ({
                    ...f,
                    apellido: e.target.value,
                  }))
                }
              />
            </label>
          </div>

          <label style={estiloLabel}>
            Correo electrónico
            <input
              className="pc-input"
              type="email"
              required
              value={regForm.email}
              onChange={(e) =>
                setRegForm((f) => ({
                  ...f,
                  email: e.target.value,
                }))
              }
            />
          </label>

          <div style={estiloFila}>
            <label style={estiloLabel}>
              Contraseña
              <input
                className="pc-input"
                type="password"
                required
                value={regForm.password}
                onChange={(e) =>
                  setRegForm((f) => ({
                    ...f,
                    password: e.target.value,
                  }))
                }
              />
            </label>

            <label style={estiloLabel}>
              Confirmar
              <input
                className="pc-input"
                type="password"
                required
                value={regForm.confirmar}
                onChange={(e) =>
                  setRegForm((f) => ({
                    ...f,
                    confirmar: e.target.value,
                  }))
                }
              />
            </label>
          </div>

          {mensaje && <div className="pc-message">{mensaje}</div>}

          <button
            type="submit"
            disabled={cargando}
            className="pc-btn pc-btn-primary"
            style={{ width: '100%' }}
          >
            {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>
      )}
    </div>
  )
}
