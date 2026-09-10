import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Registro() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const { registro } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)

    try {
      const resultado = await registro(
        email.trim(),
        password,
        nombre.trim(),
        apellido.trim()
      )

      if (resultado.success) {
        alert(
          '¡Registro exitoso! Verifica tu email para confirmar tu cuenta.'
        )

        navigate('/login')
      } else {
        setError(
          resultado.error ||
            'No se pudo crear la cuenta.'
        )
      }
    } catch (err) {
      setError(
        err.message ||
          'Ocurrió un error al crear la cuenta.'
      )
    } finally {
      setCargando(false)
    }
  }

  return (
    <main className="pc-page">
      <div className="pc-container">

        <div
          className="pc-admin-header"
          style={{
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          <h1>PC Store</h1>
          <p>
            Crea tu cuenta para comenzar a comprar.
          </p>
        </div>

        <div
          className="pc-card"
          style={{
            maxWidth: 560,
            margin: '0 auto',
            padding: 28,
          }}
        >

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
                background: '#eef4ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User
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
              Crear cuenta
            </h2>

            <p
              style={{
                marginTop: 8,
                color: '#64748b',
              }}
            >
              Completa tus datos para registrarte.
            </p>
          </div>

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

          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16,
              }}
            >

              <div>
                <label
                  htmlFor="registro-nombre"
                  style={{
                    display: 'block',
                    marginBottom: 7,
                    fontWeight: 600,
                  }}
                >
                  Nombre
                </label>

                <input
                  id="registro-nombre"
                  className="pc-input"
                  type="text"
                  placeholder="Nombre"
                  value={nombre}
                  onChange={(e) =>
                    setNombre(e.target.value)
                  }
                  required
                  autoComplete="given-name"
                />
              </div>

              <div>
                <label
                  htmlFor="registro-apellido"
                  style={{
                    display: 'block',
                    marginBottom: 7,
                    fontWeight: 600,
                  }}
                >
                  Apellido
                </label>

                <input
                  id="registro-apellido"
                  className="pc-input"
                  type="text"
                  placeholder="Apellido"
                  value={apellido}
                  onChange={(e) =>
                    setApellido(e.target.value)
                  }
                  required
                  autoComplete="family-name"
                />
              </div>

            </div>

            <div>
              <label
                htmlFor="registro-email"
                style={{
                  display: 'block',
                  marginBottom: 7,
                  fontWeight: 600,
                }}
              >
                Correo electrónico
              </label>

              <input
                id="registro-email"
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

            <div>
              <label
                htmlFor="registro-password"
                style={{
                  display: 'block',
                  marginBottom: 7,
                  fontWeight: 600,
                }}
              >
                Contraseña
              </label>

              <div
                style={{
                  position: 'relative',
                }}
              >
                <input
                  id="registro-password"
                  className="pc-input"
                  type={
                    mostrarPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                  minLength={6}
                  autoComplete="new-password"
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

              <small
                style={{
                  display: 'block',
                  marginTop: 7,
                  color: '#64748b',
                }}
              >
                La contraseña debe tener al menos 6
                caracteres.
              </small>
            </div>

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
                ? 'Creando cuenta...'
                : 'Crear cuenta'}
            </button>

          </form>

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
              ¿Ya tienes una cuenta?
            </p>

            <Link
              to="/login"
              className="pc-btn pc-btn-light"
              style={{
                display: 'inline-block',
                marginTop: 10,
                textDecoration: 'none',
              }}
            >
              Iniciar sesión
            </Link>
          </div>

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