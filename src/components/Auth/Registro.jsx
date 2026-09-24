import { useState } from 'react'
import {
  Link,
  useNavigate,
  useLocation
} from 'react-router-dom'
import {
  User,
  Eye,
  EyeOff,
  ArrowLeft
} from 'lucide-react'

import { useAuth } from '../../context/AuthContext'

const limpiarTexto = (v, max = 50) =>
  v
    .replace(/[0-9]/g, '')
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s.'-]/g, '')
    .slice(0, max)

const formatearTelefono = (v) => {
  const n = String(v).replace(/\D/g, '').slice(0, 8)

  return n.length > 4
    ? `${n.slice(0, 4)}-${n.slice(4)}`
    : n
}

export default function Registro() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    teléfono: ''
  })

  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [errores, setErrores] = useState({})

  const { registro } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const paginaOrigen = location.state?.from || '/tienda'

  const cambiar = (campo, valor) => {
    if (campo === 'nombre' || campo === 'apellido') {
      valor = limpiarTexto(valor)
    }

    if (campo === 'teléfono') {
      valor = formatearTelefono(valor)
    }

    setForm((p) => ({
      ...p,
      [campo]: valor
    }))

    setErrores((p) => ({
      ...p,
      [campo]: false
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const nuevosErrores = {}

    const email = form.email.trim().toLowerCase()

    if (!/^[^\s@]+@gmail\.com$/i.test(email)) {
      nuevosErrores.email = true
    }

    ;['nombre', 'apellido', 'teléfono'].forEach((campo) => {
      if (!form[campo].trim()) {
        nuevosErrores[campo] = true
      }
    })

    if (
      form.teléfono &&
      !/^\d{4}-\d{4}$/.test(form.teléfono)
    ) {
      nuevosErrores.teléfono = true
    }

    setErrores(nuevosErrores)

    if (Object.keys(nuevosErrores).length) {
      setError(
        nuevosErrores.email
          ? 'Solo se permiten correos de Gmail (@gmail.com).'
          : 'Completa los campos obligatorios correctamente.'
      )
      return
    }

    setError('')
    setCargando(true)

    try {
      const resultado = await registro(
        form.email.trim(),
        form.password,
        form.nombre.trim(),
        form.apellido.trim(),
        form.teléfono
      )

      if (resultado.success) {
        alert(
          '¡Registro exitoso! Verifica tu email para confirmar tu cuenta.'
        )

        navigate('/login', {
          replace: true,
          state: {
            from: paginaOrigen
          }
        })
      } else {
        setError(
          resultado.error || 'No se pudo crear la cuenta.'
        )
      }
    } catch (err) {
      setError(
        err.message || 'Ocurrió un error al crear la cuenta.'
      )
    } finally {
      setCargando(false)
    }
  }

  const etiqueta = (texto, obligatorio = false) => (
    <>
      {texto}

      {obligatorio && (
        <span
          style={{
            color: '#dc2626',
            marginLeft: 3
          }}
        >
          *
        </span>
      )}
    </>
  )

  const estiloError = (campo) => ({
    borderColor: errores[campo] ? '#dc2626' : undefined,
    boxShadow: errores[campo]
      ? '0 0 0 3px rgba(220,38,38,.12)'
      : undefined
  })

  return (
    <main className="pc-page">
      <div className="pc-container">
        <div
          className="pc-admin-header"
          style={{
            textAlign: 'center',
            marginBottom: 24
          }}
        >
          <h1>PC Store</h1>

          <p>Crea tu cuenta para comenzar a comprar.</p>
        </div>

        <div
          className="pc-card"
          style={{
            maxWidth: 560,
            margin: '0 auto',
            padding: 28
          }}
        >
          <div
            style={{
              textAlign: 'center',
              marginBottom: 24
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
                justifyContent: 'center'
              }}
            >
              <User size={30} strokeWidth={1.8} />
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 700
              }}
            >
              Crear cuenta
            </h2>

            <p
              style={{
                marginTop: 8,
                color: '#64748b'
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
                color: '#b91c1c'
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
              gap: 18
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit,minmax(200px,1fr))',
                gap: 16
              }}
            >
              <div>
                <label
                  htmlFor="registro-nombre"
                  style={{
                    display: 'block',
                    marginBottom: 7,
                    fontWeight: 600
                  }}
                >
                  {etiqueta('Nombre', true)}
                </label>

                <input
                  id="registro-nombre"
                  className="pc-input"
                  type="text"
                  maxLength={50}
                  placeholder="Nombre"
                  value={form.nombre}
                  onChange={(e) =>
                    cambiar('nombre', e.target.value)
                  }
                  style={estiloError('nombre')}
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
                    fontWeight: 600
                  }}
                >
                  {etiqueta('Apellido', true)}
                </label>

                <input
                  id="registro-apellido"
                  className="pc-input"
                  type="text"
                  maxLength={50}
                  placeholder="Apellido"
                  value={form.apellido}
                  onChange={(e) =>
                    cambiar('apellido', e.target.value)
                  }
                  style={estiloError('apellido')}
                  required
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="registro-telefono"
                style={{
                  display: 'block',
                  marginBottom: 7,
                  fontWeight: 600
                }}
              >
                {etiqueta('Número de teléfono', true)}
              </label>

              <input
                id="registro-telefono"
                className="pc-input"
                type="tel"
                inputMode="numeric"
                maxLength={9}
                placeholder="9439-4343"
                value={form.teléfono}
                onChange={(e) =>
                  cambiar('teléfono', e.target.value)
                }
                style={estiloError('teléfono')}
                required
                autoComplete="tel"
              />
            </div>

            <div>
              <label
                htmlFor="registro-email"
                style={{
                  display: 'block',
                  marginBottom: 7,
                  fontWeight: 600
                }}
              >
                {etiqueta('Correo electrónico', true)}
              </label>

              <input
                id="registro-email"
                className="pc-input"
                type="email"
                maxLength={120}
                placeholder="correo@gmail.com"
                value={form.email}
                onChange={(e) =>
                  cambiar('email', e.target.value)
                }
                style={estiloError('email')}
                required
                pattern="^[^\s@]+@gmail\.com$"
                autoComplete="email"
              />
            </div>

            <div>
              <label
                htmlFor="registro-password"
                style={{
                  display: 'block',
                  marginBottom: 7,
                  fontWeight: 600
                }}
              >
                {etiqueta('Contraseña', true)}
              </label>

              <div style={{ position: 'relative' }}>
                <input
                  id="registro-password"
                  className="pc-input"
                  type={mostrarPassword ? 'text' : 'password'}
                  maxLength={72}
                  placeholder="Mínimo 6 caracteres"
                  value={form.password}
                  onChange={(e) =>
                    cambiar('password', e.target.value)
                  }
                  required
                  minLength={6}
                  autoComplete="new-password"
                  style={{
                    paddingRight: 50
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setMostrarPassword(!mostrarPassword)
                  }
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 6
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
                  color: '#64748b'
                }}
              >
                La contraseña debe tener al menos 6 caracteres.
              </small>
            </div>

            <button
              className="pc-btn pc-btn-primary"
              type="submit"
              disabled={cargando}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontWeight: 700
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
              textAlign: 'center'
            }}
          >
            <p
              style={{
                margin: 0,
                color: '#64748b'
              }}
            >
              ¿Ya tienes una cuenta?
            </p>

            <Link
              to="/login"
              state={{
                from: paginaOrigen
              }}
              className="pc-btn pc-btn-light"
              style={{
                display: 'inline-block',
                marginTop: 10,
                textDecoration: 'none'
              }}
            >
              Iniciar sesión
            </Link>
          </div>

          <div
            style={{
              textAlign: 'center',
              marginTop: 18
            }}
          >
            <button
              type="button"
              className="pc-btn pc-btn-light"
              onClick={() => navigate('/')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8
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