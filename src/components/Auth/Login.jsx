import { useEffect, useState } from 'react'
import {
  Link,
  useNavigate,
  useLocation,
} from 'react-router-dom'
import {
  Eye,
  EyeOff,
  Lock,
  ArrowLeft,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [alertaCorreo, setAlertaCorreo] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Página a la que el usuario quería entrar
  const paginaOrigen = location.state?.from || '/tienda'

  useEffect(() => {
    if (!alertaCorreo) return

    const temporizador = setTimeout(() => {
      setAlertaCorreo(false)
    }, 4500)

    return () => clearTimeout(temporizador)
  }, [alertaCorreo])

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')

    const correo = email.trim().toLowerCase()

    if (!/^[^\s@]+@(gmail|icloud)\.com$/i.test(correo)) {
      setAlertaCorreo(true)
      return
    }

    setCargando(true)

    try {
      const resultado = await login(
        correo,
        password
      )

      if (resultado.success) {
        // Regresa a la página que intentaba visitar
        navigate(paginaOrigen, { replace: true })
      } else {
        setError(
          resultado.error ||
            'No se pudo iniciar sesión.'
        )
      }
    } catch (err) {
      setError(
        err.message ||
          'Ocurrió un error al iniciar sesión.'
      )
    } finally {
      setCargando(false)
    }
  }

  return (
    <main className="pc-page">
      <div className="pc-container">

        {alertaCorreo && (
          <div
            role="alert"
            style={{
              position: 'fixed',
              top: 20,
              right: 20,
              zIndex: 1000,
              maxWidth: 380,
              padding: '14px 18px',
              borderRadius: 10,
              background: '#fff7ed',
              border: '1px solid #fdba74',
              color: '#9a3412',
              boxShadow: '0 10px 30px rgba(0,0,0,.15)',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Solo puedes iniciar sesión con un correo de Gmail (@gmail.com) o iCloud (@icloud.com).
          </div>
        )}

        {/* ENCABEZADO */

        <div
          className="pc-admin-header"
          style={{
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          <h1>PC Store</h1>

          <p>
            Inicia sesión para acceder a tu cuenta.
          </p>
        </div>

        {/* TARJETA */}

        <div
          className="pc-card"
          style={{
            maxWidth: 480,
            margin: '0 auto',
            padding: 28,
          }}
        >

          {/* ICONO Y TÍTULO */}

          <div
            style={{
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                margin: '0 auto 16px',
                borderRadius: 16,
                background: '#f4f4f4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Lock
                size={30}
                strokeWidth={1.8}
              />
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              Iniciar sesión
            </h2>

            <p
              style={{
                marginTop: 8,
                color: '#64748b',
              }}
            >
              Ingresa tus datos para continuar.
            </p>

          </div>

          {/* ERROR */}

          {error && (
            <div
              className="pc-card"
              style={{
                padding: 14,
                marginBottom: 20,
                border: '1px solid #fecaca',
                background: '#fef2f2',
                color: '#b91c1c',
              }}
            >
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* FORMULARIO */}

          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >

            {/* EMAIL */}

            <div>
              <label
                htmlFor="login-email"
                style={{
                  display: 'block',
                  marginBottom: 7,
                  fontWeight: 600,
                }}
              >
                <span className="pc-field-label">Correo electrónico <span className="pc-required-mark">*</span></span>
              </label>

              <input
                id="login-email"
                className="pc-input"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
                autoComplete="email"
              />
            </div>

            {/* CONTRASEÑA */}

            <div>
              <label
                htmlFor="login-password"
                style={{
                  display: 'block',
                  marginBottom: 7,
                  fontWeight: 600,
                }}
              >
                <span className="pc-field-label">Contraseña <span className="pc-required-mark">*</span></span>
              </label>

              <div
                style={{
                  position: 'relative',
                }}
              >
                <input
                  id="login-password"
                  className="pc-input"
                  type={
                    mostrarPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                  autoComplete="current-password"
                  style={{
                    paddingRight: 50,
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setMostrarPassword(
                      !mostrarPassword
                    )
                  }
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform:
                      'translateY(-50%)',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 6,
                  }}
                  title={
                    mostrarPassword
                      ? 'Ocultar contraseña'
                      : 'Mostrar contraseña'
                  }
                  aria-label={
                    mostrarPassword
                      ? 'Ocultar contraseña'
                      : 'Mostrar contraseña'
                  }
                >
                  {mostrarPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* BOTÓN */}

            <button
              className="pc-btn pc-btn-primary"
              type="submit"
              disabled={cargando}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontWeight: 700,
              }}
            >
              {cargando
                ? 'Iniciando sesión...'
                : 'Iniciar sesión'}
            </button>

            {/* RECUPERACIÓN DE CONTRASEÑA */}

            <div
              style={{
                textAlign: 'center',
                marginTop: 4,
              }}
            >
              <Link to="/recuperar-password">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

          </form>

          {/* REGISTRO */}

          <div
            style={{
              marginTop: 24,
              paddingTop: 20,
              borderTop: '1px solid #e5e7eb',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                margin: 0,
                color: '#64748b',
              }}
            >
              ¿No tienes una cuenta?
            </p>

            <Link
              to="/registro"
              state={{ from: paginaOrigen }}
              className="pc-btn pc-btn-light"
              style={{
                display: 'inline-block',
                marginTop: 10,
                textDecoration: 'none',
              }}
            >
              Crear cuenta
            </Link>
          </div>

          {/* VOLVER */}

          <div
            style={{
              textAlign: 'center',
              marginTop: 18,
            }}
          >
            <button
              type="button"
              className="pc-btn pc-btn-light"
              onClick={() => navigate('/')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <ArrowLeft size={17} />
              Volver al inicio
            </button>
          </div>

        </div>
      </div>
    </main>
  )
}
